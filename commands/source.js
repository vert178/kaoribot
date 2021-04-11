const {Discord, Attachment, MessageAttachment} = require('discord.js');
const link = `https://github.com/vert178/kaoribot`;

module.exports = {
    name: `source`,
    description: `Gives you a link to my source code or the data . `,
    args: [`code`, `data`],
    example: `Kaori, source data`,
    cooldown: 5,
	execute(message, args) {
        if (args[0] === `code`){
            message.channel.send(`Sure! Here is the link: ${link}`);
        } 
        else if (args[0] === `data`){
            try{
                const attachment = new MessageAttachment(`data.xlsx`);
                message.channel.send(attachment);
            } catch(error) {
                console.log(error);
                message.channel.send(`I can't index the file somehow :( Try again later`);
            }
            
        } 
        else {
            message.channel.send(`Hmmm what are you trying to ask for?`);
        }
	},
};