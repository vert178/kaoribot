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

        message.channel.send(prompt).then(async promptMessage => {
            try {
                if (foundLen > 0)
                await promptMessage.react('1️⃣');

                if (foundLen > 1)
                await promptMessage.react('2️⃣');

                if (foundLen > 2)
                await promptMessage.react('3️⃣');

                if (foundLen > 3)
                await promptMessage.react('4️⃣');
                
                if (foundLen > 4)
                await promptMessage.react('5️⃣');
            } catch (error) {
                console.error('Reaction failed');
                promptMessage.delete();
                message.channel.send(errortexts[2] + ` ` + errortext);
                return;
            }
        });



        // //Putting data together
        
        // var resultEmbed = new Discord.MessageEmbed()
        // .setColor('#fbefa4')
        // .setTitle('Lorem ipsum')
        // .setURL('https://github.com/vert178/kaoribot')
        // .setDescription('Some description here')
        // .setThumbnail('../resources/photo 1.png')
        // .addFields(
        // { name: 'Regular field title', value: 'Some value here' },
        // { name: '\u200B', value: '\u200B' },
        // { name: 'Inline field title', value: 'Some value here', inline: true },
        // { name: 'Inline field title', value: 'Some value here', inline: true },
        // )
        // .addField('Inline field title', 'Some value here', true)
        // .setTimestamp()
        // .setFooter('Data provided by either G. Henle Verlag Publication or the wonderful AOP community');

        // var data = [];

        // data.push(`Name : ${worksheet.getRow(foundIds[0]).getCell(1).value}`);
        // data.push(`Composer : ${worksheet.getRow(foundIds[0]).getCell(2).value}`);
        // data.push(`Level : ${worksheet.getRow(foundIds[0]).getCell(3).value}`);

        // message.channel.send(resultEmbed);
	},
};