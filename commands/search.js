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
        
        //Start search
        let accurateSearch = new AccurateSearch()

        //Index database
        worksheet.eachRow(function(row, rowNumber) {
            var composer = row.getCell(2);
            var pieceName = row.getCell(1);
            accurateSearch.addText(rowNumber, composer + pieceName);
        });

        var searchString = ` `;
        for (i=0; i < args.length; i++){
            searchString += args[i];
            searchString += ' ';
        }

        var foundIds = accurateSearch.search(searchString);

        var data = [];

        data.push(`Name : ${worksheet.getRow(foundIds[0]).getCell(1).value}`);
        data.push(`Composer : ${worksheet.getRow(foundIds[0]).getCell(2).value}`);
        data.push(`Level : ${worksheet.getRow(foundIds[0]).getCell(3).value}`);

        message.channel.send(data);
	},
};