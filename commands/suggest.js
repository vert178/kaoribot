const Discord = require('discord.js');
const Excel = require('exceljs');
const fs = require('fs');
const filename = (`data.xlsx`)
const workbook = new Excel.Workbook(); 
const allowedNrOfLinks = 3;
const nonDataEntries = 2;

const errortexts = ["Hmmm something strange happened maybe try again. :frowning:",
"It says here you have too few entries and you are trying to finalize the result. Probably something went wrong :frowning:"];

const prompttexts = ["Are you sure you want to suggest",
"for bot-faq? Please prepare all the information (Title, description, links) before we start :smile:",
"Oki let's start then. Please give your entry a title",
"Please give your entry some description. Try to make them descriptive and beginner-friendly",
"Do you have anymore links that you want to add? Send it here if you want to add, and say \"skip\" if you have no more links.",
"No worries, try again whenever you feel like it",
"Ok please confirm the information by reacting with a ✅. If something went wrong, that\'s fine too! Mistakes happen. React with ❌ and we will start again",
"Please confirm the information below",
"Thanks for your contributions! Please now wait for an Advanced or Proficient member to verify this entry :relieved:",
"Something gone wrong... sorry. This is most likely something to do with the database. Please tell vert about this."];

const errortext = "\ Please tell vert if this problem persists";

const emojis = ["❌", "✅",];

module.exports = {
    name: `suggest`,
    description: `Suggests info for bot-faq function. Still in development so it might not function correctly`,
    args: [`\"The command name you want to suggest\"`],
    example: `Kaori, suggest melody`,
    cooldown: 5,
	async execute(message, args) {
        
        //Index everytime i dont care anymore
        if(!workbook.creator || true)
        {
            try{
                await workbook.xlsx.readFile(filename);
            }
            catch(error){
                console.log(error);
                message.channel.send(errortexts[0] + ` ` + errortext);
                return;
            }
        }

        const worksheet = workbook.worksheets[1];

        var foundExactMatch = findMatch(args[0]);
        // message.channel.send(foundExactMatch); 

        if (!foundExactMatch) {
            //Sets up filter and reacts to the message
            var emojiFilter = (reaction, user) => {
                return emojis.includes(reaction.emoji.name) && user.id === message.author.id;
            };
        
            var messageFilter = (msg) => {
                    return msg.author.id === message.author.id;
            };
            
            var options = {
                max: 1,
               time: 15000,
                idle: 20000
           }
                
            //Start prompt
            var prompt = `${prompttexts[0]} ${args[0]} ${prompttexts[1]}`;
            var data = [];
            message.channel.send(prompt).then(async prompt1 => {

                // Create the collector for prompt 1 (before)
                var emojiCollector = prompt1.createReactionCollector(emojiFilter, options);
                emojiCollector.on('collect', (reaction, user) => {
                    var resultId = emojis.indexOf(reaction.emoji.name);
                    if (resultId != 1) {
                        prompt1.delete();
                        return;
                    }
                    
                    prompt1.channel.send(prompttexts[2]);

                    //Sets up collector
                    var messageCollector = prompt1.channel.createMessageCollector(messageFilter, {
                        max: nonDataEntries + allowedNrOfLinks,
                        time: 999999,
                        idle: 180000
                    });

                    //Collects message
                    messageCollector.on('collect', (input, user) => {

                        //Have ways to end prematurely. Aborts everything
                        if (data.length < 2 && input.content.toLowerCase() === `end`){
                            prompt1.channel.send(`${prompttexts[nonDataEntries + 3]} ${data.length}`);
                            return;
                        } 

                        promptid = Math.min(data.length + 3, nonDataEntries + 2);
                        // prompt1.channel.send(`${data.length} ${promptid}`);
                        // prompt1.channel.send(`Collected ${input.content}`);
                        
                        //If the user decided to end the process prematurely, then sure
                        if (data.length >= 2 + allowedNrOfLinks || (data.length >= 2 && input.content.toLowerCase() === `skip`)){
                            messageCollector.stop('user end');
                        }
                        else {
                            data.push(input.content);
                            prompt1.channel.send(prompttexts[promptid]);
                        }
                    });

                    //Event ends, confirm embed
                    messageCollector.on('end', (collected, reason) => {
                        //If it is not properly ended then abort
                        if (reason != 'user end') return;

                        prompt1.channel.send(prompttexts[4 + nonDataEntries]);

                        //send embed and confirm with emoji
                        prompt1.channel.send(embed(args[0], data)).then(async confirm => {
                            var emojiCollector = confirm.createReactionCollector(emojiFilter, options);
                            emojiCollector.on('collect', (confirmation, user) => {
                                if (emojis.indexOf(confirmation.emoji.name) != 1) {
                                    confirm.delete();
                                    confirm.channel.send(prompttexts[3 + nonDataEntries]);
                                    return;
                                }
                                else {
                                    //Initiates storage
                                    if (storeData(args[0], data))
                                    {
                                        confirm.channel.send(prompttexts[6 + nonDataEntries]);
                                        console.log(`Logged entry ${args[0]} by ${message.author.tag}`)
                                    }
                                    else{
                                        confirm.channel.send(prompttexts[7 + nonDataEntries]);
                                    }
                                    return;
                                }
                            });

                            //Puts emoji on message asynchronously
                            if (!react(confirm)) return;
                        });
                        
                    });
                });

                //Puts emoji on message asynchronously
                if (!react(prompt1)) return;
            });
        }

        // returns true if the function found an exact match for the initiator
        function findMatch(arg) {
            for (i=2; i <= worksheet.actualRowCount; i++){
                if(worksheet.getRow(i).getCell(1).value === arg) {
                    console.log(`Found exact match on row ${i} for entry ${arg} by ${message.author.tag}`);
                    message.channel.send(`I found an exact match of the entry you are trying to make! Try saying \" Kaori, tell ${arg}\"`);
                    return true;
                }
            }
            return false;
        }

        //Fix local var to "data"
        var embed = function piecePeriod(cmd, data) {
            var linksConcat = `\u200b`;

            if (data.length > 2){
                for (i=2; i < data.length; i++){
                    linksConcat += data[i];
                    linksConcat += `\n`;
                }
            }
            
            return new Discord.MessageEmbed()
            .setColor('#fbefa4')
            .setAuthor('Kaori' , 'https://i.imgur.com/lxTn3yl.jpg')
            .setDescription(`Please confirm the information for ${cmd}`)
            .setThumbnail('https://i.imgur.com/X2ttwUo.png')
            .addFields(
            { name: 'Command initiation', value: `Kaori, tell ${cmd}`},
            { name: 'Title', value: data[0] },
            { name: 'Description', value: data[1]},
            { name: 'Links', value: linksConcat},
            )
            .setFooter('Please check if all the information are correct');
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

        //Storage on file
        //structure of var data: title, desc, link, link, link...
        async function storeData(cmd, data) {
            
            var buffer = [];
            buffer.push(cmd);
            buffer.push(0,0,0,0);
            buffer.push(message.author.tag);
            buffer.push(data[0]);
            buffer.push(data[1]);
            buffer.push(data.length - nonDataEntries);
            var merged = buffer.concat(data.splice(0, nonDataEntries));

            var row = worksheet.addRow(merged);

            try{
                await workbook.xlsx.writeFile(filename);
                return true;
            }
            catch(error){
                console.log(error);
                message.channel.send(errortexts[0] + ` ` + errortext);
                return false;
            }
        }
	},
};