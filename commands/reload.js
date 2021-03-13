const fs = require('fs');

module.exports = {
	name: 'debug',
	description: 'Why do you even care',
    hidden: true,
	execute(message, args) {
		if (!args.length) return message.channel.send(`Yes?`);
            const commandName = args[0].toLowerCase();
            const command = message.client.commands.get(commandName)
	            || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

            if (!command) return message.channel.send(`No thats not how it works`);

        try{
            delete require.cache[require.resolve(`./${command.name}.js`)];
        }catch (error) {
            console.log(error);
            message.channel.send(`Wahh you just broke me :sad:`);
            return;
        }

        try {
            const newCommand = require(`./${command.name}.js`);
            message.client.commands.set(newCommand.name, newCommand);
        } catch (error) {
            console.error(error);
            message.channel.send(`Hm strange I can't ${command.name}... I mean you are not supposed to touch debug anyways`);
        }

        message.channel.send(`${command.name}\? Ok sure`);
	},
};