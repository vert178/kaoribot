const fs = require('fs');
const Utility = require(`./commands/utilities/utility.js`);

const { Client, Collection, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client, Utility));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client, Utility));
	}
}

//Token and stuff
const { token } = require('./config.json');
client.login(token);