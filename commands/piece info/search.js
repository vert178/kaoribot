const Discord = require('discord.js');
const Excel = require('exceljs');
const fs = require('fs');
const AccurateSearch = require('accurate-search');
const ExcelUtility = require(`./../utilities/excelutility.js`);

const maxResultsPushed = 5;

var errortexts = ["I can't locate the database for some reason :frowning:",
"Whoops I can't find anything",
"Hmmm something strange happened maybe try again. :frowning:"];

var errortext = "\ \ Please tell vert if this problem persists";

var emojis = ["🗑️", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣"];

module.exports = {
    name: `search`,
    description: `Checks the info of a piece`,
    alias: [`find`, `s`],
    args: [`\"The name of the piece you wanna search\"`],
    example: `Kaori, search Chopin Waterfall Etude`,
    cooldown: 5,
    minArgs: 1,
	async execute(message, args) {
        
        const workbook = await ExcelUtility.loadExcel(true);
        const worksheet = workbook.worksheets[0];

        //Start search
        let accurateSearch = new AccurateSearch();

        //Index database
        worksheet.eachRow(function(row, rowNumber) {
            var composer = row.getCell(2);
            var pieceName = row.getCell(1);
            accurateSearch.addText(rowNumber, composer + pieceName);
        });
        
        accurateSearch.remove(1);

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
        
              // Create the collector
              const collector = promptMessage.createReactionCollector(filter, {
                max: 1,
                time: 99999
                });
            
              collector.on('collect', (reaction, user) => {
                resultId = emojis.indexOf(reaction.emoji.name);
                // console.log(`Collected ${resultId} from ${user.tag}`);
                if (resultId === 0) {
                    promptMessage.delete();
                    return;
                }
                
                var r = worksheet.getRow(foundIds[resultId - 1]);

                var resultEmbed = ExcelUtility.createPieceEmbed(r.getCell(1).value, r.getCell(2).value,
                r.getCell(3).value,r.getCell(5).value, r.getCell(9).value,r.getCell(10).value,
                r.getCell(6).value, r.getCell(7).value, r.getCell(8).value, r.getCell(4).value, searchString);

                message.channel.send(resultEmbed);
            });
            
            //reacts with the number emojis
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