// DEPRECEATED: Slash commands are dumb

// const { REST } = require('@discordjs/rest');
// const { Routes } = require('discord-api-types/v9');
// const { token, clientID } = require('./config.json');
// const fs = require('fs');
// const guildId = '876090568101466122';
// const commandPath = './commands';

// const commands = [];

// const commandFolders = fs.readdirSync(commandPath);

// for (const folder of commandFolders) {
//     const commandFiles = fs.readdirSync(`${commandPath}/${folder}`).filter(file => file.endsWith('.js'));
//     for (const file of commandFiles) {
//     const command = require(`${commandPath}/${folder}/${file}`);
// 	console.log(command);
//     commands.push(command.data.toJSON());
//     }
// }

// const rest = new REST({ version: '9' }).setToken(token);

// (async () => {
// 	try {
// 		console.log('Started refreshing application (/) commands.');

// 		await rest.put(
// 			Routes.applicationGuildCommands(clientID, guildId),
// 			{ body: commands },
// 		);

// 		console.log('Successfully reloaded application (/) commands.');
// 	} catch (error) {
// 		console.error(error);
// 	}
// })();