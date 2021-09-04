module.exports = {
    name: `ping`,
    description: `Attempts to ping me, just to check if I have arrived`,
    example: `Kaori, ping`,
    cooldown: 10,
    execute(message, args) {
        const latency = Date.now() - message.createdTimestamp;

        if (args.length > 0 && args[0] === "debug") {
            message.channel.send(`Debug: 
            \nTime now is : ${Date.now()} 
            \nMessage Created at : ${message.createdTimestamp}
            \nTook : ${latency}`);
        } else {
            var text = latency > 0 ? "late. Not too bad :smile:" : "early. Just shows that I am ahead of my time :sunglasses:";
            message.channel.send(`Hiya I am ${latency}ms ${text}`);
        }
    },
};