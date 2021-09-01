const {
    prefix,
    prefix2
} = require('./../utilities/constant.json');
const Utility = require('./../utilities/utility.js');

module.exports = {
    name: `help`,
    description: `Well...`,
    alias: [`commands`],
    example: `Kaori, help`,
    cooldown: 1,
    execute(message, args) {
        var data = '\u200B';
        const {
            commands
        } = message.client;
        const filteredCommands = commands.filter(function (command) {
            return !command.hidden;
        });

        if (!args.length) {
            data += `Use the prefix \"${prefix}\" before a command. \n`;
            data += `\n Alternatively, you can use \"${prefix2}\" if you'd prefer a shorter prefix \n`;
            data += `======================================================== \n`;
            data += '\n Anyway here\'s a list of stuff that I can do: ';
            data += filteredCommands.map(command => command.name).join(', ');
            data += `\n Ask again with \`${prefix}help [command name]\` if you want more info`;

            return message.reply(data, {
                split: true
            }).catch(error => {
                console.log(error);
                message.channel.send("Sorry there\'s something wrong with me today. I can't help.")
            });
        }

        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command || command.hidden) {
            return message.reply('Hey that\'s not a valid command!');
        }

        data += `**Name:** ${command.name}\n`;

        if (command.alias) data += `**Aliases:** ${command.alias.join(', ')}\n`;
        if (command.args) data += `**Arguments:** ${command.args.join(', ')}\n`;
        if (command.description) data += `**Description:** ${command.description}\n`;
        if (command.example) data += `**Example:** ${command.example}\n`;

        message.channel.send(data, {
            split: true
        });
    },
};