const githubLink = `https://github.com/vert178/kaoribot`;

module.exports = {
    name: `source`,
    description: `Gives you a link to my source code. `,
    example: `Kaori, source`,
    cooldown: 5,
    minArgs: 1,
	async execute(message, args) {
        return message.reply(`Sure! Here is the link: ${githubLink}`);
	},
};