const Discord = require('discord.js');
const Excel = require('exceljs');
const fs = require('fs');
const filename = (`data.xlsx`)
const workbook = new Excel.Workbook(); 

var texts = ["I can't find a match for your query :frowning: maybe try again\? You can also say \"Kaori, suggest",
"\" to make a new entry!",
"This is an entry verified by advanced and proficient pianists in this server :smile: Please feel free to use it!",
"This is not an entry verified by advanceds and proficients in this server :x: Please take the information with a grain of salt"];

module.exports = {
    name: `tell`,
    description: `Looks up info for bot-faq function. Still in development so it might not function correctly`,
    alias: [`answer`],
    example: `Kaori, tell melody`,
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

        const worksheet = workbook.worksheets[1];

        var rowNr = findMatch(args[0]);

        //message.channel.send(`${worksheet.actualRowCount}, ${rowNr}`);

        if (rowNr > 0){
            var row = worksheet.getRow(rowNr);
            message.channel.send(embed(row));
        }
        else {
            message.channel.send(`${texts[0]} ${args[0]} ${texts[1]}`);
            return;
        }
        
        // returns true if the function found an exact match for the initiator
        function findMatch(arg) {
            for (i=2; i <= worksheet.actualRowCount; i++){
                //Process string
                var toCompare = worksheet.getRow(i).getCell(1).value.toLowerCase().trim();
                var arg = arg.toLowerCase().trim();
                if(toCompare === arg) return i;
            }
            return -1
        }

        //Fix local var to "data"
        function embed(row) {
            var linksConcat = ` `;
            for (i=0; i < 3; i++){
                var str = row.getCell(i + 6).value;
                if (!str) break;
                linksConcat += str;
                linksConcat += `\n`;
            }

            var verificationText = row.getCell(1).value ? texts[3] : texts[2];
            
            return new Discord.MessageEmbed()
            .setColor('#fbefa4')
            .setAuthor('Kaori' , 'https://i.imgur.com/lxTn3yl.jpg')
            .setDescription(`Here you go! The information for ${row.getCell(1).value}`)
            .setThumbnail('https://i.imgur.com/X2ttwUo.png')
            .addFields(
            { name: row.getCell(4).value, value: row.getCell(5).value },
            { name: 'Links', value: linksConcat},
            { name: '\u200b', value: verificationText},
            )
            .setFooter(`Data provided by ${row.getCell(3).value}`);
        }
	},
};