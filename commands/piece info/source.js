const {MessageAttachment} = require('discord.js');
const link = `https://github.com/vert178/kaoribot`;
module.exports = {
    name: `source`,
    description: `Gives you a link to my source code or the data . `,
    args: [`code`, `data`, 'template'],
    example: `Kaori, source data`,
    cooldown: 5,
    minArgs: 1,
	async execute(message, args, Utility) {

        return message.channel.send("This command is currently under development. Please come back later!")

        // const workbook = await Utility.loadExcel(true);

        // const votesheet = workbook.worksheets[2];

        // if (!args[0]) return message.channel.send(`What are you trying to ask for?`);

        // switch (args[0].toLowerCase().trim())
        // {
        //     case `code`:
        //         return message.channel.send(`Sure! Here is the link: ${link}`);
    
        //     case `data`:
        //         votesheet.state = 'veryHidden';
        //         return message.channel.send(new MessageAttachment(`data.xlsx`))
        //         .catch(error => console.log(error));

        //     case `template`:
        //         return message.channel.send(new MessageAttachment(`template.xlsx`))
        //         .catch(error => console.log(error));

        //     default:
        //         return message.channel.send(`What are you trying to ask for?`);
        // }
	},
};