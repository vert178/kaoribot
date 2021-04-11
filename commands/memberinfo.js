const Discord = require('discord.js');
var targetMember = '';
var tag = '';

module.exports = {
    name: `memberinfo`,
    description: `Why do you even care`,
    hidden: true,
    alias: ['m'],
    cooldown: 1,
	execute(message, args) {
        
        message.channel.send('This is made for some experiments. How did you even end up here?');
        // var targetMemberRoles = message.mentions.members.first()._roles;
        // message.channel.send(`This lad has the following roles: ${targetMember._roles}`);

        // try {
        //     message.channel.send(createEmbed(targetMember));
        // } catch (error) {
        //     message.channel.send(`How about no`);
        //     console.log(error);
        // }

        // message.delete();


        // function createEmbed(member) {
        //     return new Discord.MessageEmbed()
        //     .setColor('#fbefa4')
        //     .setAuthor('Kaori' , 'https://i.imgur.com/lxTn3yl.jpg')
        //     .setDescription(`Here you go! The information for ${member.user.tag}`)
        //     .setThumbnail(member.user.avatarURL({size: 4096}))
        //     .addFields(
        //     { name: 'Name ', value: member.nickname },
        //     { name: 'Joined server:', value: member.joinedAt, inline: true },
        //     { name: 'Roles', value: member.roles.cache, inline: true},
        //     { name: '\u200B', value: '**User info**' },
        //     { name: 'Account Created: ', value: member.user.createdAt, inline: true },
        //     { name: 'Server: ', value: member.guild, inline: true },
        //     { name: 'ID', value: member.user.id, inline: true },
        //     )
        //     .setFooter('How did you find this btw?');
        // }
	},
};