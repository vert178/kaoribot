const {Discord, Attachment, MessageAttachment} = require('discord.js');
const link = `https://github.com/vert178/kaoribot`;
const Excel = require('exceljs');

module.exports = {
    name: `source`,
    description: `Gives you a link to my source code or the data . `,
    args: [`code`, `data`],
    example: `Kaori, source data`,
    cooldown: 5,
    minArgs: 1,
	execute(message, args) {
        switch (args[0].toLowerCase().trim())
        {
            case `code`:
                return message.channel.send(`Sure! Here is the link: ${link}`);
            
            case `data`:
                return message.channel.send(new MessageAttachment(`data.xlsx`))
                .catch(error => console.log(error));

            case `template`:
                return message.channel.send(new MessageAttachment(`template.xlsx`))
                .catch(error => console.log(error));

            default:
                return message.channel.send(`What are you trying to ask for?`);
        }
        // if (args[0] === ){
            
        // } 
        // else if (args[0] === `data`){
        //     try{
        //         const attachment = new MessageAttachment(`data.xlsx`);
        //         message.channel.send(attachment);
        //     } catch(error) {
        //         console.log(error);
        //         message.channel.send(`I can't index the file somehow :( Try again later`);
        //     }
            
        // } 
        // else if ()
        // else {
        //     message.channel.send(`Hmmm what are you trying to ask for?`);
        // }
	},
};