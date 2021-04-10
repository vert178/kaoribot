const Discord = require('discord.js');
const Excel = require('exceljs');
const fs = require('fs');
const filename = (`data.xlsx`)
const workbook = new Excel.Workbook(); 

var errortexts = ["Hmmm something strange happened maybe try again. :frowning:",
"It says here you have too few entries and you are trying to finalize the result. Probably something went wrong :frowning:"];

var prompttexts = ["Are you sure you want to suggest",
"for bot-faq? Please prepare all the information required (Title, description, links) before we start :smile:",
"Oki let's start then. Please give your entry a title",
"Please give your entry some description. Try to make them descriptive and beginner-friendly",
"Do you have anymore links that you want to add? Send it here if you want to add, and say \"skip\" if you have no more links.",
"Please confirm the information below",
"Ok please confirm the information by reacting with a ✅. If something went wrong, that\'s fine too! Mistakes happen. React with ❌ and we will start again"];

var errortext = "\ \ Please tell vert if this problem persists";

var emojis = ["🗑️", "✅", "❌",];

module.exports = {
    name: `suggest`,
    description: `Suggests info for bot-faq function. Still in development`,
    args: [`\"The command name you want to suggest\"`],
    example: `Kaori, suggest melody`,
    cooldown: 5,
	async execute(message, args) {
        
        //Only index the database if the workbook isnt already reloaded
        if(!workbook.creator)
        {
            try{
                await workbook.xlsx.readFile(filename);
            }catch(error){
                message.channel.send(errortexts[0] + ` ` + errortext);
                return;
            }
        }

        const worksheet = workbook.getWorksheet(1);

        //Sets up filter and reacts to the message
        var emojiFilter = (reaction, user) => {
            return emojis.includes(reaction.emoji.name) && user.id === message.author.id;
        };
        
        var messageFilter = (msg) => {
            return msg.author.id === message.author.id;
        };
        
        var options = {
            max: 1,
            time: 10000,
            idle: 20000
        }
                
        //Start prompt

        var prompt = `${prompttexts[0]} ${args[0]} ${prompttexts[1]}`;
        var data = [];
        message.channel.send(prompt).then(async prompt1 => {


            // Create the collector for prompt 1 (before)
            const emojiCollector = prompt1.createReactionCollector(emojiFilter, options);
            emojiCollector.on('collect', (reaction, user) => {
                var resultId = emojis.indexOf(reaction.emoji.name);
                if (resultId != 1) {
                    msg.delete();
                    return;
                }
                
                prompt1.channel.send(prompttexts[2]);

                //Sets up collector
                const messageCollector = prompt1.channel.createMessageCollector(messageFilter, {
                    max: 5,
                    time: 180000,
                    idle: 30000
                });

                //Collects message
                messageCollector.on('collect', (input, user) => {
                    data.push(input.content);
                    promptid = Math.min(data.length+2, 4);
                    prompt1.channel.send(`Collected ${input.content}`);
    
                    if(data.length < 5 || input.content.toLowerCase() != `skip`)
                    {
                        prompt1.channel.send(prompttexts[promptid]);
                    } else {
                        messageCollector.stop('user end');
                    }
                });

                //Event ends, confirm embed
                messageCollector.on('end', (collected, reason) => {
                    if (reason === 'user end'){
                        if(data.length < 2){
                            prompt1.channel.send(errortexts[1])
                        }
                        prompt1.channel.send(prompttexts[6]);
                        prompt1.channel.send(embed(args[0], data));
                    }
                });
            });

            //Reaction for prompt 1
            try {
                await prompt1.react(emojis[1]);
                await prompt1.react(emojis[2]);
                await prompt1.react(emojis[0]);
            } catch (error) {
                console.error('Reaction failed');
                prompt1.delete();
                message.channel.send(errortexts[0] + ` ` + errortext);
                return;
            }
        });

        var embed = function piecePeriod(command, data) {
            return new Discord.MessageEmbed()
            .setColor('#fbefa4')
            .setAuthor('Kaori' , 'https://i.imgur.com/lxTn3yl.jpg')
            .setDescription(`Please confirm the information for ${command}`)
            .setThumbnail('https://i.imgur.com/X2ttwUo.png')
            .addFields(
            { name: 'Command initiation', value: `Kaori, suggest ${command}`},
            { name: 'Title', value: title },
            { name: 'Description', value: desc},
            { name: 'Links', value: links},
            )
            .setFooter('Data provided by either G. Henle Verlag Publication or the wonderful AOP community');
        }
	},
};