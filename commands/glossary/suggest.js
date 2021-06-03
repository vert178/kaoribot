const Discord = require('discord.js');
const Excel = require('exceljs');
const fs = require('fs');
const ExcelUtility = require(`./../utilities/excelutility.js`);
const filename = (`data.xlsx`);

const errortexts = ["Hmmm something strange happened maybe try again. :frowning:",
"It says here you have too few entries and you are trying to finalize the result. Probably something went wrong :frowning:",
"Something gone wrong... sorry. This is most likely something to do with the database. Please tell vert about this.",
"Hmmm something went wrong. Did you use an invalid command? Say \'Kaori, help\' if you need help"];

const promptText = ["Are you sure you want to suggest an entry for ",
"\? Please prepare all the information (Title, description etc.) before we start :smile:",
"No worries tell me again when you are ready :slight_smile:",
"Ok please confirm the information by reacting with a ✅. If something went wrong, that\'s fine too! Mistakes happen sometimes. React with ❌ and we will start again",
"Thanks for your contributions! Please now wait for an Advanced or Proficient member to verify this entry :relieved:",
"Thanks! Vert will verify your entry soon!",
];

const auditionPrompt = ["Oki let's start then. Please type in the name for your piece (without the composer)",
"Please enter the composer of your piece",
"Please suggest a level for your piece. Enter a number between 1-9, or if you think it's too hard that it's off the charts, enter 9\+",
"Which period is the piece composed in? Enter 1 for baroque era, 2 for classical era, 3 for romantic era and 4 for post romantic. If you don't know, enter 0.",
"How long does a typical performance of this piece takes? (in minutes)",
"Please add some description for your piece. Enter \"skip\" if you have none",
"Do you have a youtube link of someone performing the piece? If yes, put it here. If there is none, enter \"skip\"",
];

const faqPrompt = ["Oki let's start then. Please give your entry a title",
"Please give your entry some description. Try to make them descriptive and beginner-friendly",
"Do you have links that you want to add? Send it here, or say \"skip\" if you have no more links.",
"Do you have anymore links that you want to add? Send it here if you want to add, and say \"skip\" if you have no more links.",
"Do you have anymore links that you want to add? Send it here if you want to add, and say \"skip\" if you have no more links."
];

const errortext = "\ Please tell vert if this problem persists";

const emojis = ["❌", "✅",];

module.exports = {
    name: `suggest`,
    alias: ['sg'],
    description: `Suggests info for bot-faq and audition function. Still in development so it might not function correctly`,
    args: [`audition`, "faq \`\`initiator\`\`"],
    example: `Kaori, suggest faq melody \n Kaori, suggest audition`,
    cooldown: 5,
    minArgs: 1,
	async execute(message, args) {

        const workbook = await ExcelUtility.loadExcel(true);
        const auditionWorksheet = workbook.worksheets[0];
        const faqWorksheet = workbook.worksheets[1];

        //Sets up filter and reacts to the message
        var emojiFilter = (reaction, user) => { return emojis.includes(reaction.emoji.name) && user.id === message.author.id; };     
        var messageFilter = (msg) => { return msg.author.id === message.author.id; };

        var arg = args[0].toLowerCase().trim();

        var prompt = '';
        var promptTextArray = [];
        var minEntry = -1;

        if (arg === `audition`)
        {
            prompt = `audition`;
            promptTextArray = auditionPrompt;
            minEntry = 4;
        }
        else if (arg === `faq` && args.length > 1)
        {
            var hasMatch = findMatch(faqWorksheet, args[1]);
            // console.log("Can found match = " + hasMatch);
            if (hasMatch) {
                console.log(`Found exact match of ID ${i} for entry ${args[1]} by ${message.author.tag}`);
                return message.channel.send(`I found an exact match of the entry you are trying to make! Try saying \" Kaori, tell ${args[1]}\"`);
            }
            
            prompt = args[1];
            promptTextArray = faqPrompt;
            minEntry = 2;
        }

        if(minEntry < 0) return message.channel.send(errortexts[3]);

        //Valid initiator, lets start collecting stuff

        message.channel.send(promptText[0] + prompt + promptText[1]).then(async msg => {
                
            var msgCollector = msg.createReactionCollector(emojiFilter, {
                max: 1,
                time: 20000,
                idle: 20000
            });

            //Collects reaction for confirmation
            msgCollector.on('collect', (reaction, user) => {

                var resultId = emojis.indexOf(reaction.emoji.name);
                if (resultId === 0) {
                    msg.delete();
                    message.channel.send(promptText[2]); 
                    return;
                }

                var entryCollector = msg.channel.createMessageCollector(messageFilter, {
                    max: promptTextArray.length,
                    time: 999999,
                    idle: 999999
                });

                msg.channel.send(promptTextArray[0]);

                var data = [];

                entryCollector.on('collect', entry => {
                    //Have ways to end prematurely. Aborts everything
                    if (entry.content.toLowerCase() === `end`) {
                        msg.channel.send(promptText[2]);
                        entryCollector.stop('abort');
                        return;
                    }

                    //If the user decides to skip the rest of the entry
                    if (data.length >= minEntry && entry.content.toLowerCase().trim() === `skip`) {
                            entryCollector.stop('user end');
                    } 
                    else 
                    {
                        data.push(entry.content);

                        //Now if we are at the 5th entry then data entry will equal 5
                        //Check for explode
                        if (data.length >= promptTextArray.length) entryCollector.stop('user end');
                        else entry.channel.send(`${promptTextArray[data.length]}`);
                    }
                });

                entryCollector.on('end', (collected, reason) => {
                    if (reason != 'user end') {
                        console.log(`Process not ended by user. Aborting`);
                        return;
                    }

                    if (!data || data.length === 0) return message.channel.send(errortexts[0]);

                    //The thing has properly ended Initiating after-sequence
                    
                    message.channel.send(promptText[3]);

                    if (arg === 'audition')
                    {
                        message.channel.send(createAuditionEmbed(data)).then(async result => {
                            
                            var resultCollector = result.createReactionCollector(emojiFilter, {
                                max: 1,
                                time: 15000,
                                idle: 15000
                            });
            
                            resultCollector.on('collect', (reaction, user) => {
                                var resultId = emojis.indexOf(reaction.emoji.name);
                                if (resultId === 0) {
                                    result.delete();
                                    message.channel.send(promptText[3]); 
                                    return;
                                }
            
                                if(storeAuditionData(data, minEntry)) 
                                    return message.channel.send(promptText[5]);
                                else {
                                    //If stuff got wrong
                                    console.log(`Logging failed!`);
                                    message.channel.send(errortexts[2] + errortext);
                                }
                            });

                            if (!react(result)) return;
                        });
                    }
                    else if (arg === `faq`)
                    {
                        message.channel.send(createFaqEmbed(args[1], data)).then(async result => {
                            
                            var resultCollector = result.createReactionCollector(emojiFilter, {
                                max: 1,
                                time: 15000,
                                idle: 15000
                            });
            
                            resultCollector.on('collect', (reaction, user) => {
                                var resultId = emojis.indexOf(reaction.emoji.name);
                                if (resultId === 0) {
                                    result.delete();
                                    message.channel.send(promptText[3]); 
                                    return;
                                }
            
                                if(storeFaqData(args[1], data, minEntry)) 
                                    return message.channel.send(promptText[4]);
                                else {
                                    //If stuff got wrong
                                    console.log(`Logging failed!`);
                                    message.channel.send(errortexts[2] + errortext);
                                }
                            });

                            if (!react(result)) return;
                        });
                    } else if (false) {
                        // Just in case we are setting up a third entry type the after sequence code goes here
                    }
                });
            });

            //Puts emoji on message asynchronously
            if (!react(msg)) return;
        });

        // returns true if the function found an exact match for the initiator
        function findMatch(worksheet, arg) {
            for (i=2; i <= worksheet.actualRowCount; i++){
                if(worksheet.getRow(i).getCell(1).value.trim() === arg) return true;
            }
            return false;
        }

        //Fix local var to "data"
        function createFaqEmbed(cmd, data) {
            
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
            { name: 'Command initiator', value: `Kaori, tell ${cmd}`},
            { name: 'Title', value: data[0] },
            { name: 'Description', value: data[1]},
            { name: 'Links', value: linksConcat},
            )
            .setFooter('Please check if all the information are correct');
        }

        function createAuditionEmbed (data, minEntry) {
            var name = data[0];
            var composer = data[1];
            var level = data[2];
            var duration = data[4];
            var period = piecePeriod(data[3]); 
            var desc = '\u200b';
            if (data.length > 4) desc = data[4];
            var link = '\u200b';
            if (data.length > 5) desc = data[5];

            return new Discord.MessageEmbed()
                .setColor('#fbefa4')
                .setAuthor('Kaori' , 'https://i.imgur.com/lxTn3yl.jpg')
                .setDescription(`Please double check the information for ${name}`)
                .setThumbnail('https://i.imgur.com/CyjXR7H.png')
                .addFields(
                { name: 'Name ', value: name },
                { name: 'Composer', value: composer, inline: true },
                { name: 'Level', value: level, inline: true },
                { name: 'Duration', value: `About ${duration} minutes`},
                { name: 'Period', value: period},
                { name: 'Recommended performance', value: link},
                { name: '\u200B', value: '\u200B' },
                { name: 'Additional information', value: desc},
                )
                .setFooter('Please check if all the information are correct');
        }


        async function react(msg) {
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
        async function storeAuditionData(data, minEntry) {
            
            var buffer = [];
            var desc = '';
            if (data.length > 4) desc = data[4];
            var link = '';
            if (data.length > 5) desc = data[5];

            buffer.push(data[0], data[1], data[2], false, data[4], data[3], false, false, link, desc);

            console.log(buffer);

            try{
                var row = auditionWorksheet.addRow(buffer);
                await workbook.xlsx.writeFile(filename);
                return true;
            }
            catch(error){
                console.log(error);
                message.channel.send(errortexts[0] + ` ` + errortext);
                return false;
            }
        }


        async function storeFaqData(arg, data, minEntry) {
            
            var buffer = [];
            var id = 1;
            buffer.push(arg,id,0,0,0,0,message.author.tag,data[0], data[1], data.length - minEntry);
            var merged = buffer.concat(data.splice(0, minEntry));

            console.log(buffer);

            try{
                var row = faqWorksheet.addRow(merged);
                await workbook.xlsx.writeFile(filename);
                return true;
            }
            catch(error){
                console.log(error);
                message.channel.send(errortexts[0] + ` ` + errortext);
                return false;
            }
        }

        function piecePeriod(value) {
            switch (value) {
            case 1:
                return 'Baroque period';
            case 2:
                return 'Classical period';
            case 3:
                return 'Romantic period';
            case 4:
                return 'Modern / 20th Century';
            default:
                return `N/A`;
            }
        }
	},
};