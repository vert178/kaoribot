const fs = require('fs');

module.exports = {
	name: 'reload',
    alias: ['r'],
	description: 'Why do you even care',
    hidden: true,
    minArgs: 1,
	execute(message, args) {
        
		//Try to find command
        const commandName = args[0].toLowerCase();
        const command = message.client.commands.get(commandName)
	        || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return message.channel.send(`No thats not how it works`);

        const commandFolders = fs.readdirSync('./commands');
        const folderName = commandFolders.find(folder => fs.readdirSync(`./commands/${folder}`).includes(`${command.name}.js`));

        //Delete the cache
        try{
            delete require.cache[require.resolve(`../${folderName}/${command.name}.js`)];
        }catch (error) {
            //If cacheus deletus fails, mostly due to error in test code
            console.log(error);
            message.channel.send(`Wahh you just broke me :sob:`);
            return;
        }

        //Reloads command
        try {
            const newCommand = require(`../${folderName}/${command.name}.js`);
            message.client.commands.set(newCommand.name, newCommand);
        } catch (error) {
            console.error(error);
            message.channel.send(`Hm strange I can't ${command.name}... I mean you are not supposed to touch debug anyways`);
            return;
        }

        //Sends message to confirm reload
        message.channel.send(`${command.name}\? ok sure`);

        console.log(`======================================================================================================= \n
        ===================================== Reloaded ${command.name} ======================================= \n
        =======================================================================================================`);
	},
};