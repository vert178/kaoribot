module.exports = {
    name: `ping`,
    description: `Attempts to ping me, just to check if I have arrived`,
    alias: [`test`, `wake`],
    example: `Kaori, ping`,
    cooldown: 1,
	execute(message, args) {
        const latency = Date.now() - message.createdTimestamp;

        if (args.length > 0 && args[0] === "debug") {
            message.channel.send(`Debug: 
            \nTime now is : ${Date.now()} 
            \nMessage Created at : ${message.createdTimestamp}
            \nTook : ${latency}`);
        }
        else {
            message.channel.send(`Hiya I am ${latency}ms late. Not too bad :smile:`);
        }
	},
};