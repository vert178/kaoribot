module.exports = {
	name: 'purge',
	description: 'Why do you even care',
    hidden: true,
    minArgs: 1,
	execute(message, args, Constants, ExcelUtility, Utility) {
        var howmany = 1;
        if (Number(args[0]) && Number(args[0]) > 0) howMany = Number(args[0]);

        let messagecount = parseInt(howmany);
        message.channel.fetchMessages({ limit: messagecount })
        .then(messages => message.channel.bulkDelete(messages));
	},
};