const Utility = require('../utilities/utility.js')
module.exports = {
    name: 'echo',
    description: 'Why do you even care',
    hidden: true,
    userRestricted: true,
    async execute(message, args) {
        message.delete();
        message.channel.send(Utility.RemergeArgs(args));
    },
};