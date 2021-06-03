const Excel = require('exceljs');
const workbook = new Excel.Workbook(); 
const filename = (`data.xlsx`);
const Discord = require('discord.js');

module.exports = { name : "exutil",
    async loadExcel (reload) {
        if(reload)
        {
            try{
                await workbook.xlsx.readFile(filename);
            }catch(error){
                console.log(error);
            }
        }
        return workbook;
    },

    createPieceEmbed (piecename, comp, lvl, dur, link, desc, prd, sonata, etude, ver, searchString) {

        function getDur (dur) {
            if (dur) return `About ${dur} minutes`;
            else return 'I don\'t know lmao';
        }

        var isVerified = function verification(value) {
            if(value) return "This is a verified entry. Please feel free to use it.";
            return "This is NOT a verified entry. Please take the information cautiously";
        }

        var period = function piecePeriod(value) {
            switch (value) {
            case 1:
                return 'Baroque period';
            case 2:
                return 'Classical period';
            case 3:
                return 'Romantic period';
            case 4:
                return 'Modern / 20th Century';
            default:
                return `N/A`;
            }
        }

        var check = function checkemoji(value){
            try{
                if (value) return '✅';
                else return '❌';   
            } catch(error){
                console.log(error);
                return '❌';
            }
        }

        var nametext = stringTransform(piecename);
        var comptext = stringTransform(comp);
        var lvltext = stringTransform(lvl);
        var durtext = getDur(dur);
        var linktext = stringTransform(link);
        var desctext = stringTransform(desc);
        var verify = isVerified(ver);
        var prdtext = period(prd);
        var son = check(sonata);
        var et = check(etude);

        return new Discord.MessageEmbed()
                .setColor('#fbefa4')
                .setAuthor('Kaori' , 'https://i.imgur.com/lxTn3yl.jpg')
                .setDescription(`Here you go! The information for ${searchString}`)
                .setThumbnail('https://i.imgur.com/CyjXR7H.png')
                .addFields(
                { name: 'Name ', value: nametext },
                { name: 'Composer', value: comptext, inline: true },
                { name: 'Level', value: lvltext, inline: true },
                { name: 'Duration', value: durtext},
                { name: 'Recommended performance', value: linktext},
                { name: '\u200B', value: '**Audition information**' },
                { name: 'Period', value: prdtext, inline: true },
                { name: 'Sonata?', value: son, inline: true },
                { name: 'Etude?', value: et, inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: 'Additional information', value: desctext},
                { name: '\u200B', value: verify},
                )
                .setFooter('Data provided by either G. Henle Verlag Publication or the wonderful AOP community');
    },

    createGlossaryEmbed(term, upvoteInfo, title, author, desc, links) {
        //How many upvotes are required to officially verify an entry
        const verifyVotes = 2;

        var termText = stringTransform(term);
        var advancedUpvotes = upvoteInfo[2] - upvoteInfo[3];
        var upvotes = advancedUpvotes + upvoteInfo[0] - upvoteInfo[1];
        var titleText = stringTransform(title);
        var authorText = stringTransform(author);
        var description = stringTransform(desc);
        var linkInfo = links.length;
        var isVerified = advancedUpvotes >= verifyVotes;

        var footer = `This entry has ${upvotes} votes and approved by ${advancedUpvotes} advanced pianists in this server. Data provided by ${authorText}`;

        var verificationText = isVerified ? "This is an entry verified by advanced and proficient pianists in this server :white_check_mark: Please feel free to use it!" 
        : "This is not an entry verified by advanceds and proficients in this server :x: Please take the information with a grain of salt";

        var linksConcat = `\u200b`;
        for (i=0; i < linkInfo; i++){
            linksConcat += links[i];
            linksConcat += `\n`;
        }

        //Returns a ready embed
        return new Discord.MessageEmbed()
        .setColor('#fbefa4')
        .setAuthor('Kaori' , 'https://i.imgur.com/lxTn3yl.jpg')
        .setDescription(`Here you go! The information for ${termText}`)
        .setThumbnail('https://i.imgur.com/X2ttwUo.png')
        .addFields(
        { name: titleText, value: description },
        { name: 'Links', value: linksConcat},
        { name: '\u200b', value: verificationText},
        )
        .setFooter(footer);
    },
};


function stringTransform (string) {
    var str = '\u200B';
    if (string) str = string;
    return str;
}