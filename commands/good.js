const fs = require('fs');

module.exports = {
	name: 'good',
	description: 'Why do you even care',
    hidden: true,
	execute(message, args) {
        if (!args[0]) return;

        var arg = args[0].toLowerCase().trim();

        if (arg === `girl`) {
            message.channel.send(`Thanks :heart:`);
            console.log(`${message.author.tag} just patted kaori <3`);
        } else if  (arg === `bot`) {
            message.channel.send(`Beep boop, boop beep`);
            console.log(`${message.author.tag} just patted bot <3`); 
        }
	},
};