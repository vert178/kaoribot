const suspiciousNames = ["twitter.com", "h0nde",];
module.exports = {
	name: 'guildMemberAdd',
	once: false,
	async execute(member, client) {
        var name = member.user.username.toLowerCase();
        if (name.includes(suspiciousNames[0]) && name.includes(suspiciousNames[1]))
        {
            await sleep(3000);
            member.ban({ days: 7, reason: 'bot spam scam' })
                .then(console.log(`banned ${name} from ${member.guild.name}`))
                .catch(console.error);
        }

        function sleep(ms) {
            return new Promise((resolve) => {
              setTimeout(resolve, ms);
            });
          }
	},
};