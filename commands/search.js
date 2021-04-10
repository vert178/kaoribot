const Discord = require('discord.js');
const Excel = require('exceljs');
const fs = require('fs');
const AccurateSearch = require('accurate-search');
const filename = (`data.xlsx`)
const workbook = new Excel.Workbook(); 

const maxResultsPushed = 5;

var errortexts = ["I can't locate the database for some reason :frowning:",
"I can't index the database for some reason :frowning:",
"Hmmm something strange happened maybe try again. :frowning:"];

var errortext = "\ \ Please tell vert if this problem persists";

var emojis = ["🗑️", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];

module.exports = {
    name: `search`,
    description: `Checks the info of a piece`,
    alias: [`find`, `s`],
    args: [`\"The name of the piece you wanna search\"`],
    example: `Kaori, search Chopin Waterfall Etude`,
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
        
        //Start search
        let accurateSearch = new AccurateSearch()

        //Index database
        worksheet.eachRow(function(row, rowNumber) {
            var composer = row.getCell(2);
            var pieceName = row.getCell(1);
            accurateSearch.addText(rowNumber, composer + pieceName);
        });

        //Put everything in the arguement together
        var searchString = ` `;
        for (i=0; i < args.length; i++){
            searchString += args[i];
            searchString += ' ';
        }

        var foundIds = accurateSearch.search(searchString);

        // No search results found :) returning...
        if(foundIds.length === 0){
            message.channel.send(errortexts[1] + ` ` + errortext);
            return;
        }

        //Ask about id
        var foundLen = Math.min(foundIds.length, maxResultsPushed);
        var prompt = [];
        prompt.push(`Sure! Found ${foundLen} results. Please react to the appropriate number for the result that you wanted.`);

        for (i=0; i < foundLen; i++){
            prompt.push(`\n ${i+1}: ${worksheet.getRow(foundIds[i]).getCell(2).value} - ${worksheet.getRow(foundIds[i]).getCell(1).value}`)
        }

        var resultId = 0;

        message.channel.send(prompt).then(async promptMessage => {
            
            //Sets up filter and reacts to the message, then wait for user response
            var filter = (reaction, user) => {
                return emojis.includes(reaction.emoji.name) && user.id === message.author.id;
              };

            var options = {
                max: 1,
                time: 15000
            }
        
              // Create the collector
              const collector = promptMessage.createReactionCollector(filter, options);
            
              collector.on('collect', (reaction, user) => {
                resultId = emojis.indexOf(reaction.emoji.name);
                // console.log(`Collected ${resultId} from ${user.tag}`);
                if (resultId === 0) {
                    promptMessage.delete();
                    return;
                }
                
                //Putting data together
                var period = function piecePeriod(value) {
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

                var check = function checkemoji(value){
                    try{
                        if (value){
                            return '✅';
                        }else{
                            return '❌';
                        }
                    } catch(error){
                        console.log(error);
                        return 'N/A';
                    }
                }

                var isVerified = function verification(value) {
                    switch (value) {
                    case true:
                        return "This is a verified entry. Please feel free to use it.";
                    default:
                        return "This is NOT a verified entry. Please take the information cautiously";
                    }
                }
                
                var r = worksheet.getRow(foundIds[resultId - 1]);

                var resultEmbed = new Discord.MessageEmbed()
                .setColor('#fbefa4')
                .setAuthor('Kaori' , 'https://i.imgur.com/lxTn3yl.jpg')
                .setDescription(`Here you go! The information for ${searchString}`)
                .setThumbnail('https://i.imgur.com/X2ttwUo.png')
                .addFields(
                { name: 'Name ', value: r.getCell(1).value },
                { name: 'Composer', value: r.getCell(2).value, inline: true },
                { name: 'Level', value: r.getCell(3).value, inline: true },
                { name: 'Duration', value: `About ${r.getCell(5).value} minutes`},
                { name: 'Recommended performance', value: r.getCell(9).value},
                { name: '\u200B', value: 'Audition information' },
                { name: 'Period', value: period(r.getCell(6).value), inline: true },
                { name: 'Sonata?', value: check(r.getCell(7).value), inline: true },
                { name: 'Etude?', value: check(r.getCell(8).value), inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: 'Additional information', value: r.getCell(10).value},
                { name: '\u200B', value: isVerified(r.getCell(4).value)},
                )
                .setFooter('Data provided by either G. Henle Verlag Publication or the wonderful AOP community');

                message.channel.send(resultEmbed);
            });
            
            try {
                for(i=1; i <= foundLen; i++){
                    await promptMessage.react(emojis[i]);
                }
                await promptMessage.react(emojis[0]);
            } catch (error) {
                console.error('Reaction failed');
                promptMessage.delete();
                message.channel.send(errortexts[2] + ` ` + errortext);
                return;
            }
        });
	},
};