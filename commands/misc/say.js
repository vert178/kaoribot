const Utility = require('./../utilities/utility.js')
module.exports = {
    name: 'say',
    description: 'Why do you even care',
    hidden: true,
    userRestricted: true,
    async execute(message, args) {
        message.channel.send(Utility.RemergeArgs(args));
    },
};