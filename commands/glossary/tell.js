const Constants = require(`../utilities/constants.js`);
const ExcelUtility = require(`./../utilities/excelutility.js`);
const Utility = require(`./../utilities/utility.js`);
const AccurateSearch = require('accurate-search');

const texts = ["I can't find a match for your query :frowning: maybe try again\? You can also say \"Kaori, suggest",
"\" to make a new entry!",];

const upvoteTexts = ["upvote", "⬆️", "up", "updoot", "good girl", "good bot"];
const downvoteTexts = ["downvote", "⬇️", "down", "downdoot", "bad girl", "bad bot"];

//An array of role ids that are allowed to verify stuff. Currently in the following order:
//Advanced, Proficient, Virtuoso, Staff, Helpers
const permittedRoles = ["402936943018639381",
"402937022076944405",
"704128964632772648",
"412018027832279041",
"840939368494661642"];

// max results for search
const maxResultsPushed = 5;
// length of description in results page (words)
const descLength = 10;

module.exports = {
    name: `tell`,
    description: `Looks up info for bot-faq function. Still in development so it might not function correctly`,
    alias: [`answer`, `t`,],
    example: `Kaori, tell piano`,
    minArgs: 1,
    cooldown: 5,
	async execute(message, args) {
        const workbook = await ExcelUtility.loadExcel(true);
        const worksheet = workbook.worksheets[1];
        const votesheet = workbook.worksheets[2];

        var searchString = Utility.RemergeArgs(args);
        
        var rowNr = findMatch(searchString);

        //message.channel.send(`${worksheet.actualRowCount}, ${rowNr}`);

        // rownumber > 0 <=> we can find a match
        if (rowNr > 0){
            processResult(worksheet.getRow(rowNr))
        }
        else {   
            let accurateSearch = new AccurateSearch();
            worksheet.eachRow(function(row, rowNumber) {
                var id = row.getCell(Constants.infoArr[1]);
                var initiator = row.getCell(Constants.infoArr[0]);
                var title = row.getCell(Constants.infoArr[3]);
                var description = row.getCell(Constants.infoArr[4]);
                accurateSearch.addText(rowNumber, id + ' ' + initiator + ' ' + title + ' ' + description);
            });
            
            accurateSearch.remove(1);
            var foundIds = accurateSearch.search(searchString);
            if(foundIds.length === 0) return message.channel.send(`${texts[0]} ${searchString} ${texts[1]}`);
            var foundLen = Math.min(foundIds.length, maxResultsPushed);

            var prompt = [];
            prompt.push(`I can't find the exact thing that you are looking for... however there are some similar ones that you might wanna take a look. React to the appropriate emoji and I will get you its corresponding data`);

            for (i=0; i < foundLen; i++){
                var desc = worksheet.getRow(foundIds[i]).getCell(Constants.infoArr[4]).value;
                var descr = '';
                if (desc) {
                    var descs = desc.trim().split(/ +/);
                    var descLen = Math.min(descs.length, descLength);
                    for (j=0; j < descLen; j++) {
                        descr += descs[j]
                        descr += ' ';
                    }
                    descr += '...';
                }

                var titleText = '';
                if (!worksheet.getRow(foundIds[i]).getCell(Constants.infoArr[3]).value) {
                    titleText = "Empty entry";
                    descr = '';
                }
                else {
                    titleText = worksheet.getRow(foundIds[i]).getCell(Constants.infoArr[3]).value;
                }
                
                prompt.push(`${i+1}. ${worksheet.getRow(foundIds[i]).getCell(Constants.infoArr[0]).value} : ${titleText} \n ${descr} \n \n`);
            }

            var resultId = 0;

            message.channel.send(prompt).then(async promptMessage => {
                var collector = promptMessage.createReactionCollector((reaction, user) => {
                    return Constants.emojis.includes(reaction.emoji.name) && user.id === message.author.id;
                }, {
                    max: 1,
                    time: 99999
                });
                
                collector.on('collect', (reaction, user) => {
                    resultId = Constants.emojis.indexOf(reaction.emoji.name);
                    // console.log(`Collected ${resultId} from ${user.tag}`);
                    if (resultId === 0) {
                        promptMessage.delete();
                        return;
                    }

                    processResult (worksheet.getRow(foundIds[resultId - 1]))
                });
                
                //reacts with the number Constants.emojis
                try {
                    for(i=1; i <= foundLen; i++){
                        await promptMessage.react(Constants.emojis[i]);
                    }
                    await promptMessage.react(Constants.emojis[0]);
                } catch (error) {
                    console.error('Reaction failed');
                    promptMessage.delete();
                    message.channel.send("Hmmm something strange happened, please tell vert about it :frowning:");
                    return;
                }
            });
        }

        function processResult (row) {
            message.channel.send(ExcelUtility.createGlossaryEmbed(row.getCell(Constants.infoArr[0]).value,
            ExcelUtility.getVoteInfo(row.getCell(Constants.infoArr[1]).value, votesheet),
            row.getCell(Constants.infoArr[3]).value, 
            row.getCell(Constants.infoArr[2]).value, 
            row.getCell(Constants.infoArr[4]).value ,
            [row.getCell(Constants.infoArr[5]).value, row.getCell(Constants.infoArr[5]+1).value, row.getCell(Constants.infoArr[5]+2).value])).then(async result => {
                
                //If this is happening in dms, gtfo before kaori realises advanced roles is not a thing in dms
                if (message.channel.type === 'dm') return;

                //Sets up message filter for voting purposes
                var messageCollector = result.channel.createMessageCollector((msg, user) => {
                    return !user.bot && msg.reference != null && msg.reference.messageID === result.id;
                }, { 
                    max: 999, time: 999999 
                });

                messageCollector.on('collect', async msg => {

                    var isUpvote = upvoteTexts.includes(msg.content.trim());
                    var isDownvote = downvoteTexts.includes(msg.content.trim());

                    //If its neither an upvote nor a downvote then Kaori can sleeep 
                    if (isDownvote || isUpvote) {
                        var isAdv = Utility.CheckIfArrayContains(msg.member._roles, permittedRoles);
                        var base = 6 * row.getCell(Constants.infoArr[1]).value;
                        var upvotes = votesheet.getRow(isAdv ? base + 3 : base + 1);
                        var downvotes = votesheet.getRow(isAdv ? base + 4 : base + 2);

                        RemoveEntryFromRow(upvotes, msg.author);
                        RemoveEntryFromRow(downvotes, msg.author);
    
                        var isVoted = false;
    
                        //Process vote
                        if (isUpvote) {
                            if(AddEntryToRow(upvotes, msg.author, (isAdv ? base + 3 : base + 1))) {
                                console.log(`${msg.author.tag} upvoted the entry ${row.getCell(Constants.infoArr[0]).value}`);
                                isVoted = true;
                            }
                        }
                        else if (isDownvote) {
                            if(AddEntryToRow(downvotes, msg.author, (isAdv ? base + 4 : base + 2))){
                                console.log(`${msg.author.tag} downvoted the entry ${row.getCell(Constants.infoArr[0]).value}`);
                                isVoted = true;
                            } 
                        } 

                        //Write new data
                        if (isVoted)
                        {
                            isVoted = false;
                            try{
                                await workbook.xlsx.writeFile(Constants.filename);
                                if (isUpvote) await msg.react(`😄`);
                                else if (isDownvote) await msg.react(`😔`);
                            }
                            catch(error){
                                console.log(error);
                                message.channel.send("There is some error in the code, and your vote is probably not counted. Please try again, and tell vert if the issue persists.");
                            }
                        }
                    }
                });
            });
        }
        
        // returns true if the function found an exact match for the initiator
        function findMatch(arg) {
            for (i=2; i <= worksheet.actualRowCount; i++){
                //Process string
                var toCompare = worksheet.getRow(i).getCell(Constants.infoArr[0]).value.toLowerCase().trim();
                var arg = arg.toLowerCase().trim();
                if(toCompare === arg) return i;
            }
            return -1;
        }

        //Check if user tag is present in that row and removes the entry. Returns true if smth is removed
        function RemoveEntryFromRow (row, user) {
            row.eachCell(function(cell, colNumber) {
                // console.log('Check removefromentry: Cell ' + colNumber + ' = ' + cell.value + ` isMatch = ` + (cell.value.trim() === user.tag.trim()));
                if(user != null && cell.value.trim() === user.tag.trim()) {
                    console.log(`User ${user.tag.trim()} removed from cell ${colNumber}`);
                    row.splice(colNumber, 1);
                    return true;
                }
            });
            return false;
        }

        //Adds user tag to entry. Returns true if add is successful
        function AddEntryToRow (row, user, rowNr) {
            // A little variable here so that we dont need to check that many rows
            for (i=1; i <= votesheet.actualColumnCount + 1; i++){
                var cellValue = row.getCell(i).value;
                // console.log('Check addfromentry: Cell ' + i + ' = ' + cellValue);
                if(cellValue === null) {
                    row.getCell(i).value = user.tag;
                    // console.log(`Updated ${user.tag} to row ${rowNr} column ${i}`);
                    return true;
                }
            }
            return false;
        }
	},
};