const Discord = require('discord.js');
const Excel = require('exceljs');
const fs = require('fs');
const filename = (`data.xlsx`)
const workbook = new Excel.Workbook(); 

var texts = ["Cannot find the argument ",
"in the database sowwy :cry: If the problem persists, tell vert",
"The entry has been verified :smile:",
"You didn't have Advanced role... If this is a mistake, tell vert",];

module.exports = {
    name: `verify`,
    description: `Looks up info for bot-faq function. Still in development so it might not function correctly`,
    example: `Kaori, verify melody`,
    cooldown: 5,
    serverOnly: true,
	async execute(message, args) {

        //Check for advanced or proficient
        if (message.author.roles.cache.some(role => role.name === 'Advanced')) {
            //Only index the database if the workbook isnt already reloaded
            if(!workbook.creator)
            {
                try{
                    await workbook.xlsx.readFile(filename);
                }
                catch(error){
                    message.channel.send(errortexts[0] + ` ` + errortext);
                    return;
                }
            }

            const worksheet = workbook.worksheets[1];

            var rowNr = findMatch(args[0]);

            message.channel.send(`${worksheet.actualRowCount}, ${rowNr}`);

            if (rowNr > 0){
                var row = worksheet.getRow(rowNr);
                message.channel.send(embed(row));
            }
            else {
                message.channel.send(`${texts[0]} ${args[0]} ${texts[1]}`);
                return;
            }
        } else
        {
            message.channel.send(`${texts[2]}`);
            return;
        }
	},
};