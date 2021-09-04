const AccurateSearch = require('accurate-search');
const fs = require("fs");
const { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } = require('discord.js');

const maxResultsPushed = 5;

var errortexts = ["I can't locate the database for some reason :frowning:",
    "Whoops I can't find anything",
    "Hmmm something strange happened maybe try again. :frowning:"
];

var errortext = "\ \ Please tell vert if this problem persists";

const { YtAPIKey } = require('../../config.json');
const YouTube = require('simple-youtube-api');
const Utility = require("./../utilities/utility.js");
const youtube = new YouTube(YtAPIKey);

const { color } = require('./../utilities/constant.json');
const path = './data/bypiece.json';
const { listings } = require(`./../../${path}`);
const SearchUtil = require("./../utilities/searchutil.js");

module.exports = {
    name: `search`,
    description: `Checks the info of a piece. This function is still kinda an experiment. So please don't get mad when using it.`,
    alias: [`find`, `s`],
    args: [`\"The name of the piece you wanna search\"`],
    example: `Kaori, search Chopin Waterfall Etude`,
    cooldown: 5,
    minArgs: 1,
    async execute(message, args) {

        var searchString = Utility.RemergeArgs(args);
        var found = [], foundIDs = [];
        var accurateSearch = new AccurateSearch()

        //Index database
        for (i = 0; i < listings.length; i++) {
            var str = `${listings[i].composer} ${listings[i].title} ${listings[i].subtitle} ${listings[i].name}`;
            accurateSearch.addText(i + 1, str);
        }

        var t1 = Date.now();
        //Gets the result. Hopefully this doesn't take too long
        for(i = 0; i < args.length; i++) {
            foundIDs = accurateSearch.search(args[i]);

            //Filters result
            if (found.length === 0) found = foundIDs;
            else {
                var sfound = found.filter(e => foundIDs.indexOf(e) !== -1);
                if (sfound.length === 0 && found.length !== 0) break;
                else found = sfound;
            }
        }
        var t2 = Date.now();

        // Utility.DebugLog(`Searched through ${listings.length} entries, took ${t2 - t1} ms`);

        // No search results found :( returning...
        if (found.length === 0) {
            message.channel.send(errortexts[1] + ` ` + errortext);
            return;
        }

        var pageNumber = 1;
        var msg = createPrompt(found, pageNumber, t2);

        message.channel.send({
            content: msg.prompt,
            components: [msg.menu, msg.page]
        }).then(async m => {

            const menufilter = i => i.customId === `select ${t2}`;

            // Create the collector
            const menuCollector = m.createMessageComponentCollector({
                menufilter,
                time: 60000
            });

            menuCollector.on('collect', async i => {

                if (!i.isSelectMenu() && !i.isButton()) {
                    await m.edit({
                        content: "Wrong type of interaction...? Weird. Please tell vert about it.",
                        components: [],
                    });

                    await i.deferUpdate();
                    return;

                } else if (i.isButton()) {

                    // Change page number
                    if (i.customId === `${t2} prev` && pageNumber > 1) pageNumber -= 1  
                    else if (i.customId === `${t2} next` && pageNumber < Math.ceil(found.length/maxResultsPushed)) pageNumber += 1
                    
                    msg = createPrompt(found, pageNumber, t2);
    
                    await m.edit({
                        content: msg.prompt,
                        components: [msg.menu, msg.page]
                    });

                    await i.deferUpdate();
    
                    menuCollector.resetTimer();

                } else {
                    //Fetch result. Minus one since we use zero count
                    var result = {
                        id: found[Number(i.values) - 1] - 1,
                        listing: listings[found[Number(i.values) - 1] - 1],
                    }

                    await i.deferUpdate();

                    //Create the embed
                    var resultEmbed = await createPieceEmbed(result, searchString);

                    message.channel.send({
                        content: "Sure! Here you go",
                        embeds: [resultEmbed],
                    });

                    //Edits previous message to remove the select menu and stuff
                    m.edit({
                        content: msg.prompt,
                        components: []
                    })

                    menuCollector.stop('Option Selected');
                }
            });

            menuCollector.on('end', async collected => {
                Utility.DebugLog(`Search collector ended. Reason: ${menuCollector.endReason}`)
            });
        });

        //Creates embed for search function
        async function createPieceEmbed(result, searchString) {

            
            var duration = result.listing.duration;
            var link = result.listing.link;
        
            //The autofill for duration and link
            if (duration === 0 || Utility.isEmpty(link)) {
                //Make request to Youtube API to search
                var str = result.listing.composer + ' ' + result.listing.subtitle + ' ' + result.listing.name;
                await youtube.searchVideos(str, 4)
                    .then(r => {
                        //Only continue if something was found
                        if (r.length > 0) {
                            link = `https://www.youtube.com/watch?v=${r[0].id}`;
                            youtube.getVideo(link)
                                .then(video => {
                                    Utility.DebugLog("Found video: " + video.title);
                                    duration = video.duration.hours * 60 + video.duration.minutes;
                                    //Rounds up if necessary
                                    if (video.duration.seconds >= 30) duration += 1;

                                    //Sets info and saves to the file
                                    listings[result.id] = {
                                        "composer": result.listing.composer,
                                        "title": result.listing.title,
                                        "subtitle": result.listing.subtitle,
                                        "name": result.listing.name,
                                        "level": result.listing.level,
                                        "duration": duration,
                                        "link": link,
                                        "description": result.listing.description,
                                        "param": result.listing.param
                                    }

                                    var obj = {
                                        listings: listings
                                    }

                                    let json = JSON.stringify(obj, null, 2);
                                    fs.writeFile(path, json, function (error) {
                                        if (error) throw error;
                                        Utility.DebugLog('File Updated');
                                    });
                                })
                                .catch(console.log);
                        }
                    })
                    .catch(console.log);
            }
            
            await Utility.Sleep(1000);

            console.log("Duration: " + getDur(duration));

            var desctext = Utility.AddEmpty(result.listing.description);
            var verify = Utility.CheckValue(SearchUtil.readParam(result.listing.param, "verify"), "This is a verified entry. Please feel free to use it.",
                "This is NOT a verified entry. Please take the information cautiously");
            var prdtext = piecePeriod(SearchUtil.readParam(result.listing.param, "period"));
            var son = Utility.CheckValue(SearchUtil.readParam(result.listing.param, "sonata"), '✅', '❌');
            var et = Utility.CheckValue(SearchUtil.readParam(result.listing.param, "etude"), '✅', '❌');

            return new MessageEmbed()
                .setColor(color)
                .setAuthor('Kaori', 'https://i.imgur.com/lxTn3yl.jpg')
                .setDescription(`Here you go! The information for ${searchString}`)
                .setThumbnail('https://i.imgur.com/CyjXR7H.png')
                .addFields({
                    name: 'Composer',
                    value: Utility.AddEmpty(result.listing.composer)
                }, {
                    name: 'Title',
                    value: Utility.AddEmpty(result.listing.title),
                }, {
                    name: Utility.AddEmpty(result.listing.subtitle),
                    value: Utility.AddEmpty(result.listing.name),
                }, {
                    name: 'Level',
                    value: `${result.listing.level}`
                },{
                    name: 'Duration',
                    value: getDur(duration)
                }, {
                    name: 'Recommended performance',
                    value: Utility.AddEmpty(link)
                }, {
                    name: '\u200B',
                    value: '**Audition information**'
                }, {
                    name: 'Period',
                    value: Utility.AddEmpty(prdtext),
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
                    value: Utility.AddEmpty(desctext)
                }, {
                    name: '\u200B',
                    value: verify
                }, )
                .setFooter('Data provided by G. Henle Verlag Publication and our wonderful community');
        }
    },
};

//Creates the prompt message according to the results found and the target page number
//t2: Unique identifier to prevent multiple collectors running and kaori messing up
function createPrompt(found, pageNumber, t2) {

    //Restricts the number of results to the maxResultsPushed = 5 per page
    var start = maxResultsPushed * (pageNumber - 1);
    var end = Math.min(maxResultsPushed * pageNumber, found.length);
    var prompt = `Sure! Found ${found.length} results. Please react to the appropriate number for the result that you wanted.`;
    var menuOptions = [];

    for (i = start; i < end; i++) {
        var listing = listings[found[i] - 1];
        prompt += `\n ${i+1}: ${listing.composer} ${listing.title} ${listing.subtitle} ${listing.name}`;

        var desc = Utility.StringTrim(`${listing.composer} - ${listing.title} ${listing.name}`, 100, true);

        menuOptions.push({
            label: `Option ${i+1}`,
            description: desc,
            value: `${i+1}`,
        });
    }

    prompt += `\n Page ${pageNumber}`;

    //Stamps the buttons with current date so Kaori wont mess up
    var menuId = `select ${t2}`;

    //Sets up menu and stuff
    var menu = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
            .setCustomId(menuId)
            .setPlaceholder('Please select one')
            .addOptions(menuOptions)
            .setDisabled(false),
        );

    var page = new MessageActionRow()
    .addComponents(
        new MessageButton()
        .setCustomId(`${t2} prev`)
        .setLabel('Prev. Page')
        .setStyle('SECONDARY')
        .setDisabled(false),

        new MessageButton()
        .setCustomId(`${t2} next`)
        .setLabel('Next Page')
        .setStyle('SECONDARY')
        .setDisabled(false),
    )

    return {
        prompt: prompt,
        menu: menu,
        page: page
    };
}

//Gets duration text from number
function getDur(dur) {
    if (dur) return `About ${dur} minutes`;
    else return 'I don\'t know lmao';
}

//Gets period text from index
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