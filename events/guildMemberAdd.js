const ContainAtLeast = 2;
const Utility = require('./../commands/utilities/utility.js')

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute(member, client) {
        //Depreceated... for now
        // var suspiciousNames = Constants.suspiciousNames;
        // var name = member.user.username.toLowerCase();
        // if (Utility.StringContainAtLeast(name, suspiciousNames, ContainAtLeast)) {
        //     await Utility.sleep(3000);
        //     member.ban({
        //             days: 7,
        //             reason: 'possible bot spam scam'
        //         })
        //         .then(console.log(`banned ${name} from ${member.guild.name}`))
        //         .catch(console.error);
        // }
    },
};