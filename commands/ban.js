const fs = require('fs');
const Discord = require('discord.js');

const permittedRoles = ["412018027832279041",
"803399240851783680"];

module.exports = {
	name: 'ban',
	description: 'Why do you even care',
    hidden: true,
    serverOnly: true,
	async execute(message, args) {

        // A placeholder function that was made to be a joke originally



        

        // var isPermitted = CheckIfMemberHasRole(message.member);

        // if (!isPermitted) return message.channel.send('You are not staff don\'t try and ban people.');

        // if (!args[0] || message.mentions.users.length < 1) return message.channel.send(`Ooooh :yum: Who\'s getting banned\?`);

        // var bannedMember = message.mentions.users.first();

        // var server = message.guild;
        // var name = bannedMember.tag;

        // var bw = await server.channels.create('banned-wagon', { 
        // reason: `${name} is getting banned!`,
        // topic: `You are banned from the AOP server!` ,
        // }).catch(console.error);

        // var bannedWagon = server.channels.resolve(bw);

        // bannedWagon.send("<@" + bannedMember.id + "> THE STATE HAS ELECTED TO BEAN YOUR ASS");


        // // try{
        // //     return bannedWagon.send(`\@${name} **THE STATE HAS ELECTED TO BEAN YO ASS** :833354104657936395:`);
        // // }
        // // catch (error) {
        // //     bannedWagon.delete();
        // //     console.log(error);
        // // }

        

        // //

        // console.log(`Bean time ${name}`);

        // function CheckIfMemberHasRole (member) {
        //     var roleOfMember = member._roles;

        //     var z = roleOfMember.filter(function(val) {
        //         return permittedRoles.indexOf(val) != -1;
        //       });
              
        //     return z.length > 0;
        // }
	},
};