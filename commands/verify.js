const Discord = require('discord.js');
const Excel = require('exceljs');
const fs = require('fs');
const filename = (`data.xlsx`)
const workbook = new Excel.Workbook(); 

//An array of role ids that are allowed to verify stuff. Currently in the following order:
//Advanced, Proficient, Virtuoso, Staff
const permittedRoles = ["402936943018639381",
"402937022076944405",
"704128964632772648",
"412018027832279041"];

var texts = ["Cannot find the argument ",
"in the database sowwy :cry: If the problem persists, tell vert",
"The entry has been verified :smile:",
"You didn't have Advanced role... If this is a mistake, tell vert",];

module.exports = {
    name: `verify`,
    description: `Looks up info for bot-faq function. Still in development so it might not function correctly`,
    example: `Kaori, verify melody`,
    cooldown: 5,
    alias: ["t"],
    serverOnly: true,
	async execute(message, args) {

        //Check for permittedRoles
        if (CheckIfMemberHasRole(message.member)) {
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

            //Attempts to get row number of the verifying argument. If no matches found, return -1
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


            
        } else  if (false) {
            //Temporary block I inserted for testing purposes
            var canVerify = CheckIfMemberHasRole(message.member);
            message.channel.send(canVerify);
        }
        else {
            message.channel.send(`${texts[3]}`);
            return;
        }

        function CheckIfMemberHasRole (member) {
            var roleOfMember = member._roles;

            var z = roleOfMember.filter(function(val) {
                return permittedRoles.indexOf(val) != -1;
              });
              
            return z.length > 0;
        }

        function findMatch(arg) {
            for (i=2; i <= worksheet.actualRowCount; i++){

                if(worksheet.getRow(i).getCell(1).value.toLowerCase().trim() === arg) {
                    return i;
                }
            }
            return -1;
        }
	},
};