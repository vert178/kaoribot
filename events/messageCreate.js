const fs = require('fs');

const {
    Collection
} = require('discord.js');

const {
    prefix,
    prefix2,
    permittedID,
    permittedRoles
} = require('../commands/utilities/constant.json');

const commandPath = './commands';
const Utility = require('./../commands/utilities/utility.js')

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message, client) {
        //Process validity of message
        if (message.author.bot) return;
        if (message.content.toLowerCase().startsWith('hi kaori')) return message.channel.send('Hiya!');

        //Proceess prefix
        var isPrefix = message.content.toLowerCase().startsWith(prefix);
        if (!isPrefix && !message.content.toLowerCase().startsWith(prefix2)) return;

        client.commands = new Collection();

        //Fetch commands
        const commandFolders = fs.readdirSync(commandPath);

        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`${commandPath}/${folder}`).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const command = require(`./../${commandPath}/${folder}/${file}`);
                client.commands.set(command.name, command);
            }
        }

        //Process arguments
        const commandBody = isPrefix ? message.content.slice(prefix.length) : message.content.slice(prefix2.length);
        const args = commandBody.trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        //Process aliases
        const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.alias && cmd.alias.includes(commandName));

        //Process command
        if (!command || command.isUtility) return;
        if (command.userRestricted && !Utility.CheckIfArrayContains([message.author.id], permittedID)) return message.channel.send(`No?`);
        if (command.roleRestricted && message.channel.type === 'dm' && !Utility.CheckIfArrayContains(message.member._roles, permittedRoles)) return message.channel.send(`No?`);
        if (command.serverOnly && message.channel.type === 'dm') return message.reply('This is dms, and it\'s not exactly the best place to play with this command...');
        if (command.minArgs && args.length < command.minArgs) return message.channel.send(`Whoops that doesn't sound like a valid command`);


        //Execute
        try {
            command.execute(message, args, Utility);
        } catch (error) {
            console.error(error);
            message.channel.send(`Something went wrong! \n ${error}`);
        }
    },
};