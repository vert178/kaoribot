module.exports = {
	name: 'say',
	description: 'Why do you even care',
    hidden: true,
    serverOnly: true,
    restricted: true,
	async execute(message, args, Constants, ExcelUtility, Utility) {
        message.channel.send(Utility.RemergeArgs(args));
	},
};