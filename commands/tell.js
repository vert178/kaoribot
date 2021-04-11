const Discord = require('discord.js');
const Excel = require('exceljs');
const fs = require('fs');
const filename = (`data.xlsx`)
const workbook = new Excel.Workbook();

//In order: initiator, upvotesInfo ,title
//title, author, description, links should always go together and located at the rightmost columns
const infoArr = [1, 2, 6,];

//How many upvotes are required to officially verify an entry
const verifyVotes = 3;

const texts = ["I can't find a match for your query :frowning: maybe try again\? You can also say \"Kaori, suggest",
"\" to make a new entry!",
"This is an entry verified by advanced and proficient pianists in this server :smile: Please feel free to use it!",
"This is not an entry verified by advanceds and proficients in this server :x: Please take the information with a grain of salt",
"This entry has",
"votes and approved by",
"advanced pianists in this server. Data provided by",];

const errortext = "\ Please tell vert if this problem persists";

const errortexts = ["We are experiencing some problems with updooting. Please try again later :frowning:",];

const emojis = ["⬇️", "⬆️",];

//An array of role ids that are allowed to verify stuff. Currently in the following order:
//Advanced, Proficient, Virtuoso, Staff
const permittedRoles = ["402936943018639381",
"402937022076944405",
"704128964632772648",
"412018027832279041"];

module.exports = {
    name: `tell`,
    description: `Looks up info for bot-faq function. Still in development so it might not function correctly`,
    alias: [`answer`],
    example: `Kaori, tell melody`,
    cooldown: 5,
	async execute(message, args) {
        //Only index the database if the workbook isnt already reloaded
        //f this i am indexing it everything cuz otherwise its cached and stuff would reflect on real time
        if(!workbook.creator || true)
        {
            try{
                await workbook.xlsx.readFile(filename);
            }catch(error){
                console.log(error);
                message.channel.send(errortexts[0] + ` ` + errortext);
                return;
            }
        }

        const worksheet = workbook.worksheets[1];
        const votesheet = workbook.worksheets[2];

        var rowNr = findMatch(args[0]);

        //message.channel.send(`${worksheet.actualRowCount}, ${rowNr}`);

        if (rowNr > 0){
            var row = worksheet.getRow(rowNr);

            //Sends the embed
            message.channel.send(embed(row)).then(async result => {
                
                //If this is happening in dms, gtfo before kaori realises advanced roles is not a thing in dms
                if (message.channel.type === 'dm') return;

                //Sets up emoji filter for upvoting purposes
                var emojiFilter = (reaction, user) => {
                    return emojis.includes(reaction.emoji.name) && !user.bot;
                };
                
                var options = {
                    max: 999,
                    time: 999000,
                }

                var emojiCollector = result.createReactionCollector(emojiFilter, options);
                emojiCollector.on('collect', async (reaction, user) => {

                    //Check if user has advanced
                    var userHasAdvanced = CheckIfMemberHasRole(reaction.member);

                    //Look for 6n + k row
                    var index = userHasAdvanced ? 6 * rowNr : 6 * rowNr + 2;
                    var upvotes = votesheet.getRow(index);
                    var downvotes = votesheet.getRow(index + 1);

                    //Check if user tag is in that row
                    //If yes, delete the entry
                    var resultId = emojis.indexOf(reaction.emoji.name);

                    console.log(`User ${user.tag} is Advanced: ${userHasAdvanced}, 
                    Index: ${index}
                    Entry Nr: ${rowNr}
                    ReactionID: ${resultId}`);

                    //Check if user has upvoted before - deletes entry
                    RemoveEntryFromRow(upvotes, user);
                    RemoveEntryFromRow(downvotes, user);

                    var infoIndex = userHasAdvanced ? infoArr[1] : infoArr[1] + 2;

                    if (resultId === 1) {
                        if(AddEntryToRow(upvotes, user)) console.log(`${user.tag} upvoted`);
                        row.getCell(infoIndex).value += 1;
                    }
                    else {
                        if(AddEntryToRow(downvotes, user)) console.log(`${user.tag} downvoted`);
                        row.getCell(infoIndex).value += (-1);
                    }

                    //Write new data
                    try{
                        await workbook.xlsx.writeFile(filename);
                        console.log(`Updated vote info`);
                    }
                    catch(error){
                        console.log(error);
                        message.channel.send(errortexts[0] + ` ` + errortext);
                        result.delete();
                        return;
                    }
                });

                //Delets the message when time is over
                emojiCollector.on('end', (reaction, user) => {
                    result.reactions.removeAll()
                        .catch(error => console.error('Failed to clear reactions: ', error));
                });


                //Reacts to message
                if (!react(result)) return;
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

        //Creates embed
        function embed(row) {
            
            //Calculates up/down vote info and prepares other info
            var upvotes = row.getCell(infoArr[1]).length - row.getCell(infoArr[1]+1).length
            var advancedUpvotes = row.getCell(infoArr[1] + 2).length - row.getCell(infoArr[1] + 3).length
            var title = row.getCell(infoArr[2] + 1).value;
            var author = row.getCell(infoArr[2]).value;
            var description = row.getCell(infoArr[2] + 2).value;
            var linkInfo = row.getCell(infoArr[2] + 3).value;
            var isVerified = advancedUpvotes >= verifyVotes;
            var verificationText = advancedUpvotes >= isVerified ? texts[3] : texts[2];

            //Concat all links using info in second last column (how many links are there)
            var linksConcat = `\u200b`;
            for (i=0; i < linkInfo; i++){
                var str = row.getCell(i + infoArr[2] + 4).value;
                if (!str) break;
                linksConcat += str;
                linksConcat += `\n`;
            }

            // message.channel.send(`Debug message: 
            // Upvodes: ${upvotes}, 
            // AdvUpvotes: ${advancedUpvotes}, 
            // Title: ${title}, 
            // Author: ${author}, 
            // Desc: ${description}, 
            // Link info: ${linkInfo}, 
            // isVerified? ${isVerified}`);
            
            //Returns a ready embed
            return new Discord.MessageEmbed()
            .setColor('#fbefa4')
            .setAuthor('Kaori' , 'https://i.imgur.com/lxTn3yl.jpg')
            .setDescription(`Here you go! The information for ${row.getCell(infoArr[0]).value}`)
            .setThumbnail('https://i.imgur.com/X2ttwUo.png')
            .addFields(
            { name: title, value: description },
            { name: 'Links', value: linksConcat},
            { name: '\u200b', value: verificationText},
            )
            .setFooter(`${texts[5]} ${upvotes} ${texts[6]} ${advancedUpvotes} ${texts[7]} ${author}`);
        }

        var react = async function setReaction(msg) {
            try {
                await msg.react(emojis[1]);
                await msg.react(emojis[0]);
                return true;
            } 
            catch (error) {
                console.error('Reaction Failed: ', error);
                msg.delete();
                message.channel.send(errortexts[0] + ` ` + errortext);
                return false;
            }
        }

        function CheckIfMemberHasRole (member) {
            var roleOfMember = member._roles;
            console.log(roleOfMember);

            var z = roleOfMember.filter(function(val) {
                return permittedRoles.indexOf(val) != -1;
              });
              
            return z.length > 0;
        }

        //Check if user tag is present in that row and removes the entry
        function RemoveEntryFromRow (row, user) {
            row.eachCell(function(cell, colNumber) {
                console.log('Check removefromentry: Cell ' + colNumber + ' = ' + cell.value);
                if(cell.value.trim() === user.tag.trim()) {
                    row.splice(colNumber, 1);
                }
            });
        }

        //Adds user tag to entry. Returns true if add is successful
        function AddEntryToRow (row, user) {
            row.eachCell({ includeEmpty: true }, function(cell, colNumber) {
                console.log('Check addfromentry: Cell ' + colNumber + ' = ' + cell.value);
                if(!cell.value) {
                    cell.value = user.tag;
                    return true;
                }
            });
            return false;
        }
	},
};