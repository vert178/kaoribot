module.exports = {
	name: 'say',
	description: 'Why do you even care',
    hidden: true,
    restricted: true,
    alias: ["echo", ],
	async execute(message, args, Utility) {
        message.channel.send(Utility.RemergeArgs(args));
	},
};