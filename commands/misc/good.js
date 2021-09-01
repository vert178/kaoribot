const Utility = require('./../utilities/utility.js');
module.exports = {
    name: 'good',
    description: 'Why do you even care',
    hidden: true,
    minArgs: 1,
    execute(message, args) {
        if (!args[0]) return;

        var arg = args[0].toLowerCase().trim();

        switch (arg) {
            case 'girl':
                message.channel.send(`Thanks :heart:`);
                Utility.DebugLog(`${message.author.tag} just patted kaori <3`);
                break;

            case 'bot':
                message.channel.send(`Beep boop, boop beep`);
                Utility.DebugLog(`${message.author.tag} just patted bot <3`);
                break;

            default:
                return;
        }
    },
};