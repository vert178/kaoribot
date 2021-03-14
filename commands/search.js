const Discord = require('discord.js');
const Excel = require('exceljs');
const fs = require('fs');
const AccurateSearch = require('accurate-search');
const filename = (`data.xlsx`)
const workbook = new Excel.Workbook(); 
var errortexts = ["I can't locate the database for some reason :sad:",
"I can't index the database for some reason :sad:",
"I can't find your piece for some reason :sad:"];
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
                message.channel.send(errortexts[1] + ` ` + errortext);
            }
        }

        
        const worksheet = workbook.getWorksheet(1);

        console.log(!workbook.creator);
        
        //Start search
        let accurateSearch = new AccurateSearch()

        worksheet.eachRow(function(row, rowNumber) {
            console.log(`${row.getCell(2)} ${row.getCell(1)}, ${rowNumber}`);
        });
          
	},
};