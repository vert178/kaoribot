const link = `https://github.com/vert178/kaoribot`;

module.exports = {
    name: `source`,
    description: `Gives you a link to the GitHub source code. Keep in mind it is probably messy cuz vert is a math major not a computer science major.`,
    alias: [`find`, `s`],
    example: `Kaori, source`,
    cooldown: 5,
	execute(message, args) {
        message.channel.send(`Sure! Here is the link: ${link}`);
	},
};