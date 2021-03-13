const Discord = require('discord.js');
const Excel = require('exceljs');
const filename = (`data.xlsx`)
// const FileReader = require(`FileReader`);
const fs = require('fs');
const path = require('path');
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
    cooldown: 1,
	async execute(message, args) {
        //Read database asynchrously
        // var data = fs.readFile(path.join(__dirname + '/../data.xlsx'), 'utf8', (error, data) => {
        //     if (error) {
        //         console.log(error);
        //         message.channel.send(errortexts[0] + ` ` + errortext);
        //     }
        //   });
        
        // message.channel.send(`Oki please wait a sec`);
        // const workbook = new Excel.Workbook();
        // await workbook.xlsx.load(data);
        // message.channel.send(`load success`);
        const filepath = path.join(__dirname + '/../data.xlsx');
        await workbook.xlsx.readFile(filename);
        const worksheet = workbook.getWorksheet(1);
        const cell = worksheet.getCell(`B1`);
        message.channel.send(cell.value);
	},
};