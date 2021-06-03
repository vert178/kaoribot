const Discord = require('discord.js');
const Excel = require('exceljs');
const fs = require('fs');
const ExcelUtility = require(`./../utilities/excelutility.js`);
const filename = (`data.xlsx`);

//In order: initiator, upvotesInfo ,title
//title, author, description, links should always go together and located at the rightmost columns
const infoArr = [1, 2, 6,];

const texts = ["I can't find a match for your query :frowning: maybe try again\? You can also say \"Kaori, suggest",
"\" to make a new entry!",
];

const errortext = "\ Please tell vert if this problem persists";

const errortexts = ["We are experiencing some problems with updooting. Please try again later :frowning:",];

const upvoteTexts = ["upvote", "⬆️", "up", "updoot", "good girl", "good bot"];
const downvoteTexts = ["downvote", "⬇️", "down", "downdoot", "bad girl", "bad bot"];

//An array of role ids that are allowed to verify stuff. Currently in the following order:
//Advanced, Proficient, Virtuoso, Staff, Helpers
const permittedRoles = ["402936943018639381",
"402937022076944405",
"704128964632772648",
"412018027832279041",
"840939368494661642"];

module.exports = {
    name: `tell`,
    description: `Looks up info for bot-faq function. Still in development so it might not function correctly`,
    alias: [`answer`, `t`,],
    example: `Kaori, tell melody`,
    minArgs: 1,
    cooldown: 5,
	async execute(message, args) {
        const workbook = await ExcelUtility.loadExcel(true);
        const worksheet = workbook.worksheets[1];
        const votesheet = workbook.worksheets[2];
        

        var rowNr = findMatch(args[0]);

        //message.channel.send(`${worksheet.actualRowCount}, ${rowNr}`);

        // rownumber > 0 <=> we can find a match
        if (rowNr > 0){
            var row = worksheet.getRow(rowNr);

            //Sends the embed
            message.channel.send(ExcelUtility.createGlossaryEmbed(row.getCell(1).value,
            [row.getCell(3).value, row.getCell(4).value, row.getCell(5).value, row.getCell(6).value],
            row.getCell(8),row.getCell(7),row.getCell(9),
            [row.getCell(11),row.getCell(12),row.getCell(13)])).then(async result => {
                
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
                        var isAdv = CheckIfMemberHasRole(msg.member);
                        var upvotes = votesheet.getRow(isAdv ? 6 * row.getCell(2).value + 3 : 6 * row.getCell(2).value + 1);
                        var downvotes = votesheet.getRow(isAdv ? 6 * row.getCell(2).value + 4 : 6 * row.getCell(2).value + 2);
                        var upCount = row.getCell(isAdv ? 5 : 3);
                        var downCount = row.getCell(isAdv ? 6 : 4);

                        if(RemoveEntryFromRow(upvotes, msg.author)) upCount.value += (-1);
                        if (RemoveEntryFromRow(downvotes, msg.author)) downCount.value += (-1);
    
                        var isVoted = false;
    
                        //Process vote
                        if (isUpvote) {
                            if(AddEntryToRow(upvotes, msg.author)) {
                                console.log(`${msg.author.tag} upvoted the entry ${row.getCell(1).value}`);
                                upCount.value += 1;
                                isVoted = true;
                            }
    
                        }
                        else if (isDownvote) {
                            if(AddEntryToRow(downvotes, msg.author)){
                                console.log(`${msg.author.tag} downvoted the entry ${row.getCell(1).value}`);
                                downCount.value += 1;
                                isVoted = true;
                            } 
                        } 

                        //Write new data
                        if (isVoted)
                        {
                            isVoted = false;
                            try{
                                await workbook.xlsx.writeFile(filename);
                                if (isUpvote) await msg.react(`😄`);
                                else if (isDownvote) await msg.react(`😔`);
                            }
                            catch(error){
                                console.log(error);
                                message.channel.send("There is some error in the code, but your vote is probably counted no worries.");
                                return;
                            }
                        }
                    }
                });
            });
        }
        else {
            // If we cannot find a match
            message.channel.send(`${texts[0]} ${args[0]} ${texts[1]}`);
            return;
        }
        
        // returns true if the function found an exact match for the initiator
        function findMatch(arg) {
            for (i=2; i <= worksheet.actualRowCount; i++){
                //Process string
                var toCompare = worksheet.getRow(i).getCell(1).value.toLowerCase().trim();
                var arg = arg.toLowerCase().trim();
                if(toCompare === arg) return i;
            }
            return -1;
        }

        function CheckIfMemberHasRole (member) {
            var roleOfMember = member._roles;
            // console.log(roleOfMember);

            var z = roleOfMember.filter(function(val) {
                return permittedRoles.indexOf(val) != -1;
              });
              
            return z.length > 0;
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
        function AddEntryToRow (row, user) {
            // console.log(`Yes, we are trying to add entry`);
            // A little variable here so that we dont need to check that many rows
            for (i=1; i <= votesheet.actualColumnCount + 1; i++){
                var cellValue = row.getCell(i).value;
                // console.log('Check addfromentry: Cell ' + i + ' = ' + cellValue);
                if(cellValue === null) {
                    row.getCell(i).value = user.tag;
                    console.log(`Updated ${user.tag} to column ${i}`);
                    return true;
                }
            }
            return false;
        }
	},
};