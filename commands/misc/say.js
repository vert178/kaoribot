const Constants = require(`../utilities/constants.js`);
const ExcelUtility = require(`./../utilities/excelutility.js`);
const Utility = require(`./../utilities/utility.js`);

module.exports = {
	name: 'say',
	description: 'Why do you even care',
    hidden: true,
    serverOnly: true,
	async execute(message, args) {
        if (!Utility.CheckIfArrayContains([message.author.id], Constants.permittedID)) return;
        message.channel.send(Utility.RemergeArgs(args));
	},
};