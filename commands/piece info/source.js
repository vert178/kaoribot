const { MessageAttachment } = require('discord.js');

const githubLink = `https://github.com/vert178/kaoribot`;
const dataLink = 'https://docs.google.com/spreadsheets/d/1TaKs92pWei6Gr0JsRNnf_HLOLm545XkyXHYgpC58QMg/';

module.exports = {
    name: `source`,
    description: `Gives you a link to my source code or the data . `,
    args: [`code`, `data`, 'template'],
    example: `Kaori, source data`,
    cooldown: 5,
    minArgs: 1,
	async execute(message, args, Utility) {

        switch (args[0].toLowerCase().trim())
        {
            case `code`:
                return message.channel.send(`Sure! Here is the link: ${githubLink}`);
    
            case `data`:
                return message.channel.send(`Sure! Here is the link: ${dataLink}`);

            default:
                return message.channel.send(`What are you trying to ask for?`);
        }
	},
};