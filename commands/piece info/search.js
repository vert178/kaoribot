const AccurateSearch = require('accurate-search');
const {
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    MessageSelectMenu
} = require('discord.js');

const maxResultsPushed = 5;

var errortexts = ["I can't locate the database for some reason :frowning:",
    "Whoops I can't find anything",
    "Hmmm something strange happened maybe try again. :frowning:"
];

var errortext = "\ \ Please tell vert if this problem persists";

const {
    YtAPIKey
} = require('../../config.json');
const YouTube = require('simple-youtube-api');
const Utility = require("./../utilities/utility.js");
const youtube = new YouTube(YtAPIKey);

const {
    color,
    filename
} = require('./../utilities/constant.json')

module.exports = {
    name: `search`,
    description: `Checks the info of a piece`,
    alias: [`find`, `s`],
    args: [`\"The name of the piece you wanna search\"`],
    example: `Kaori, search Chopin Waterfall Etude`,
    cooldown: 5,
    minArgs: 1,
    async execute(message, args) {

        //message.reply("This function is still under development. Come back later!");

        const workbook = await Utility.loadExcel(true);
        const worksheet = workbook.getWorksheet('Piece Info');

        var searchString = Utility.RemergeArgs(args);

        //Start search
        let accurateSearch = new AccurateSearch();

        //Index database
        worksheet.eachRow(function (row, rowNumber) {
            var composer = Utility.getInfo(row, "composer");
            var pieceName = Utility.getInfo(row, "name");
            accurateSearch.addText(rowNumber, composer + pieceName);
        });

        accurateSearch.remove(1);

        var foundIds = accurateSearch.search(searchString);

        // No search results found :) returning...
        if (foundIds.length === 0) {
            message.channel.send(errortexts[1] + ` ` + errortext);
            return;
        }

        //Ask about id
        var foundLen = Math.min(foundIds.length, maxResultsPushed);
        var prompt = [];
        var menuOptions = [];
        var resultArr = []
        prompt += `Sure! Found ${foundLen} results. Please react to the appropriate number for the result that you wanted.`;

        for (i = 0; i < foundLen; i++) {
            var composer = worksheet.getRow(foundIds[i]).getCell(2).value;
            var pieceName = worksheet.getRow(foundIds[i]).getCell(1).value;
            prompt += `\n ${i+1}: ${composer} - ${pieceName}`;

            var desc = Utility.StringTrim(`${composer} - ${pieceName}`, 100, true);
            menuOptions.push({
                label: `Option ${i+1}`,
                description: desc,
                value: `Option ${i+1}`,
            });

            resultArr.push({
                id: i + 1,
                row: worksheet.getRow(foundIds[i]),
            });
        }

        //Stamps the buttons with current date so Kaori wont mess up
        var time = Date.now();
        var menuId = `select ${time}`;

        var menu = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                .setCustomId(menuId)
                .setPlaceholder('Please select one')
                .addOptions(menuOptions)
                .setDisabled(false),
            );

        message.channel.send({
            content: prompt,
            components: [menu]
        }).then(async interaction => {

            const filter = i => i.customId === menuId;

            // Create the collector
            const menuCollector = interaction.createMessageComponentCollector({
                filter,
                time: 60000
            });

            menuCollector.on('collect', async i => {

                if (!i.isSelectMenu()) {
                    return interaction.editReply({
                        content: "Wrong type of interaction...? Weird. Please tell vert about it.",
                        components: [],
                    });
                }

                var result = resultArr.find(r => `Option ${r.id}` === i.values[0]).row;
                await i.deferUpdate();

                var resultEmbed = await createPieceEmbed(
                    result,
                    Utility.getInfo(result, "name"),
                    Utility.getInfo(result, "composer"),
                    Utility.getInfo(result, "level"),
                    Utility.getInfo(result, "duration"),
                    Utility.getInfo(result, "link"),
                    Utility.getInfo(result, "description"),
                    Utility.getInfo(result, "period"),
                    Utility.getInfo(result, "sonata"),
                    Utility.getInfo(result, "etude"),
                    Utility.getInfo(result, "verify"),
                    searchString);

                message.channel.send({
                    content: "Sure! Here you go",
                    embeds: [resultEmbed],
                });

                interaction.edit({
                    content: prompt,
                    components: []
                })
                menuCollector.stop('Option Selected');
            });

            menuCollector.on('end', async collected => {
                Utility.DebugLog(`Search collector ended. Reason: ${menuCollector.endReason}`)
            });

        });

        //Creates embed for search function
        //TODO: unfactor
        async function createPieceEmbed(row, piecename, comp, lvl, dur, link, desc, prd, sonata, etude, ver, searchString) {

            var nametext = Utility.AddEmpty(piecename);
            var comptext = Utility.AddEmpty(comp);
            var lvltext = Utility.AddEmpty(lvl);
            var durtext = '';
            var linktext = '';
            var duration = 0;
            if (Utility.isEmpty(dur) || Utility.isEmpty(linktext)) {
                await youtube.searchVideos(nametext + ' ' + comptext, 4)
                    .then(results => {
                        linktext = `https://www.youtube.com/watch?v=${results[0].id}`;
                        youtube.getVideo(linktext)
                            .then(video => {
                                Utility.DebugLog("Found video: " + video.title);
                                duration = video.duration.hours * 60 + video.duration.minutes;
                                if (video.duration.seconds >= 30) duration += 1;
                                durtext = getDur(duration);
                            })
                            .catch(console.log);
                    })
                    .catch(console.log);

                Utility.setInfo(row, duration, "duration");
                Utility.setInfo(row, linktext, "link");
                
                try {
                    await workbook.xlsx.writeFile(filename);
                } catch (error) {
                    console.log(error);
                }
            } else {
                durtext = getDur(dur);
                linktext = Utility.AddEmpty(link);
            }

            var desctext = Utility.AddEmpty(desc);
            var verify = Utility.CheckValue(ver, "This is a verified entry. Please feel free to use it.",
                "This is NOT a verified entry. Please take the information cautiously");
            var prdtext = piecePeriod(prd);
            var son = Utility.CheckValue(sonata, '✅', '❌');
            var et = Utility.CheckValue(etude, '✅', '❌');

            return new MessageEmbed()
                .setColor(color)
                .setAuthor('Kaori', 'https://i.imgur.com/lxTn3yl.jpg')
                .setDescription(`Here you go! The information for ${searchString}`)
                .setThumbnail('https://i.imgur.com/CyjXR7H.png')
                .addFields({
                    name: 'Name ',
                    value: nametext
                }, {
                    name: 'Composer',
                    value: comptext,
                    inline: true
                }, {
                    name: 'Level',
                    value: lvltext,
                    inline: true
                }, {
                    name: 'Duration',
                    value: durtext
                }, {
                    name: 'Recommended performance',
                    value: linktext
                }, {
                    name: '\u200B',
                    value: '**Audition information**'
                }, {
                    name: 'Period',
                    value: prdtext,
                    inline: true
                }, {
                    name: 'Sonata?',
                    value: son,
                    inline: true
                }, {
                    name: 'Etude?',
                    value: et,
                    inline: true
                }, {
                    name: '\u200B',
                    value: '\u200B'
                }, {
                    name: 'Additional information',
                    value: desctext
                }, {
                    name: '\u200B',
                    value: verify
                }, )
                .setFooter('Data provided by G. Henle Verlag Publication and our wonderful community');
        }
    },
};

function getDur(dur) {
    if (dur) return `About ${dur} minutes`;
    else return 'I don\'t know lmao';
}

function piecePeriod(value) {
    switch (value) {
        case 0:
            return 'Baroque period';
        case 1:
            return 'Classical period';
        case 2:
            return 'Romantic period';
        case 3:
            return 'Modern / 20th Century';
        default:
            return `N/A`;
    }
}