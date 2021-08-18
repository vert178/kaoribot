const Excel = require('exceljs');
const workbook = new Excel.Workbook(); 
const {filename, color} = require(`./../../config.json`);
const { MessageAttachment, MessageEmbed } = require('discord.js');

module.exports = {

    hidden: true,
    isUtility: true,
    
    //Add an empty character to a string if its empty
    AddEmpty (string) {
        return stringTransform(string);
    },

    //Returns true if two arrays have at least one match
    CheckIfArrayContains(checkArr, arr) {
        var z = checkArr.filter(function(val) {
            return arr.indexOf(val) != -1;
        });
        return z.length > 0;
    },

    //Returns iftrue if value is true or nonempty
    CheckValue(value, ifTrue, ifFalse) {
        CheckIf(value, ifTrue, ifFalse);
    },

    //Return true if string is empty
    CheckIfEmpty(string) {
        return isEmpty(string);
    },

    //Merge a string arg into one string
    RemergeArgs(args) {
        var searchString = ` `;
        for (i=0; i < args.length; i++){
            searchString += args[i];
            searchString += ' ';
        }
        return searchString;
    },

    async Sleep(ms) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
    },

    //Check if a particular string contains more than n checklist words
    StringContainAtLeast(string, checklist, n) {
        var z = 0;
        for (i=0; i < checklist.length; i++) {
            if (string.trim().toLowerCase().includes(checklist[i].trim().toLowerCase())) z+=1;
        }
        return z >= n;
    },

    //Trim string to target length
    StringTrim(string, targetLength, addDots) {

        if (string.length <= targetLength) return string;

        if (addDots) {
            var s = string.substring(0, Math.min(string.length, targetLength - 3));
            s += '...'
            return s;
        }
        else {
            return string.substring(0, Math.min(string.length(), targetLength));
        }
    },

    DebugLog(string) {
        var ts = Date.now();

        var date_ob = new Date(ts);
        var date = date_ob.getDate();
        var month = date_ob.getMonth() + 1;
        var hours = date_ob.getHours();
        var minutes = date_ob.getMinutes();
        var seconds = date_ob.getSeconds();
        var dateString = `${month}/${date}, ${hours}:${minutes}:${seconds}`;

        console.log(`${dateString} : ${string}`);
    },

    //Data stuff
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

    //Returns Ups, Downs, AdvUps, AdvDowns
    getVoteInfo (id, votesheet) {
        return [countNonEmpty(votesheet.getRow(6 * id + 1), votesheet), 
            countNonEmpty(votesheet.getRow(6 * id + 2), votesheet), 
            countNonEmpty(votesheet.getRow(6 * id + 3), votesheet), 
            countNonEmpty(votesheet.getRow(6 * id + 4), votesheet)];
    },

    createPieceEmbed (piecename, comp, lvl, dur, link, desc, prd, sonata, etude, ver, searchString) {

        var nametext = stringTransform(piecename);
        var comptext = stringTransform(comp);
        var lvltext = stringTransform(lvl);
        var durtext = getDur(dur);
        var linktext = stringTransform(link);
        var desctext = stringTransform(desc);
        var verify = CheckIf(ver, "This is a verified entry. Please feel free to use it.", 
        "This is NOT a verified entry. Please take the information cautiously");
        var prdtext = piecePeriod(prd);
        var son = CheckIf(sonata, '✅', '❌');
        var et = CheckIf(etude, '✅', '❌');

        return new MessageEmbed()
                .setColor(color)
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
                .setFooter('Data provided by either G. Henle Verlag Publication or our wonderful community');
    },

    createGlossaryEmbed(term, upvoteInfo, title, author, desc, links) {
        //How many upvotes are required to officially verify an entry
        const verifyVotes = 3;

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
            l = '';
            if (links[i] && typeof(links[i]) === 'object') l = links[i].text;
            else if (typeof(links[i]) === 'string') l = links[i];

            linksConcat += stringTransform(l);
            if (!isEmpty(l)) linksConcat += `\n`;
        }

        //Returns a ready embed
        return new MessageEmbed()
        .setColor(color)
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

//Returns true if string is empty
function isEmpty(value) {
    if (typeof(value) == 'string') return !value.trim() || typeof value == 'undefined' || value === null;
    else return !value;
}

//Adds an empty character if string is empty
function stringTransform (string) {
    var str = '\u200B';
    if (!isEmpty(string)) str += `${string}`;
    return str;
}

function CheckIf(value, ifTrue, ifFalse){
    try{
        if (value) return ifTrue;
        else return ifFalse;   
    } catch(error){
        console.log(error);
        return ifFalse;
    }
}

function countNonEmpty (row, sheet) {
    var j = 0;
    for (i=1; i <= sheet.actualColumnCount + 1; i++) {
        if(row.getCell(i).value)  j += 1;
    }
    return j;
}

function getDur (dur) {
    if (dur) return `About ${dur} minutes`;
    else return 'I don\'t know lmao';
}

function piecePeriod(value) {
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