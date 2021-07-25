const { prefix, prefix2 } = require('./../../config.json');
module.exports = {
    name: `help`,
    description: `Well...`,
    alias: [`commands`],
    example: `Kaori, help`,
    cooldown: 1,
	execute(message, args, Constants, ExcelUtility, Utility) {
        const data = [];
        const { commands } = message.client;
        const filteredCommands = commands.filter(function( command ) {
            return !command.hidden;
        });
        
        if (!args.length) {
            data.push(`\n Use the prefix \"${prefix}\" before a command. `);
            data.push(`\n Alternatively, you can use \"${prefix2}\" if you'd prefer a shorter prefix`);
            data.push('\n\n Anyway here\'s a list of stuff that I can do:');
            data.push(filteredCommands.map(command => command.name).join(', '));
            data.push(`\nAsk again with \`${prefix}help [command name]\` if you want more info`);

            return message.author.send(data, { split: true })
	            .then(() => {
		        if (message.channel.type === 'dm') return;
		            message.reply('Kaori slid into those dms, smooth like butter');
	            })
	            .catch(error => {
		        console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
		        message.reply('May I dm the help commands to you? Just to avoid spam.');
	            });
        }

        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command || command.hidden) {
	        return message.reply('Hey that\'s not a valid command!');
        }

        data.push(`**Name:** ${command.name}`);

        if (command.alias) data.push(`**Aliases:** ${command.alias.join(', ')}`);
        if (command.args) data.push(`**Arguments:** ${command.args.join(', ')}`);
        if (command.description) data.push(`**Description:** ${command.description}`);
        if (command.example) data.push(`**Example:** ${command.example}`);
        data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

        message.channel.send(data, { split: true });
	},
};