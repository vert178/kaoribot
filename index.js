//Require Discord js
const Discord = require('discord.js');
const fs = require('fs');

//Create new client
const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith( `.js`));
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

//Token and stuff
const { prefix, prefix2, token } = require('./config.json');
const cooldowns = new Discord.Collection();

//Events
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}


//Set up commands
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.login(token);

//Reply to message
client.on("message", message => {

    //Process validity of message, prefix, then argmuent
    if (message.author.bot) return;

    var isPrefix = message.content.toLowerCase().startsWith(prefix);

    if (!isPrefix &&
        !message.content.toLowerCase().startsWith(prefix2)) return;

    const commandBody = isPrefix ? message.content.slice(prefix.length) : message.content.slice(prefix2.length);
    const args = commandBody.trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    //Process aliases
    const command = client.commands.get(commandName) 
    || client.commands.find(cmd => cmd.alias && cmd.alias.includes(commandName));

    if (!command) return;

    //Process cooldown
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`Wait ${timeLeft.toFixed(0)} more seconds before asking I need some rest.`);
        }
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    //Execute
    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.channel.send(`Error: \n ${error}`);
    }
});