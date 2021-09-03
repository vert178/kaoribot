const AccurateSearch = require('accurate-search');
const {
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    MessageSelectMenu
} = require('discord.js');

const {
    infoArr,
    filename,
    advancedRoles
} = require(`./../utilities/constant.json`);

// max results for search. Maximum 5
const maxResultsPushed = 5;

// length of description in results page (words)
const maxDescDispLength = 12;

//How many upvotes are required to officially verify an entry
const verifyVotes = 3;

module.exports = {
    name: `tell`,
    description: `Looks up info for bot-faq function.`,
    alias: [`answer`, `t`, ],
    example: `Kaori, tell piano`,
    minArgs: 1,
    cooldown: 5,
    async execute(message, args, Utility) {
        
        const workbook = await Utility.loadExcel(true);
        const worksheet = workbook.worksheets[1];
        const votesheet = workbook.worksheets[2];

        var searchString = Utility.RemergeArgs(args);

        var rowNr = findMatch(searchString);

        //message.channel.send(`${worksheet.actualRowCount}, ${rowNr}`);

        // rownumber > 0 <=> we can find a match
        if (rowNr > 0) {
            processResult(worksheet.getRow(rowNr));
        } else {
            let accurateSearch = new AccurateSearch();
            worksheet.eachRow(function (row, rowNumber) {
                var id = row.getCell(infoArr[1]);
                var initiator = row.getCell(infoArr[0]);
                var title = row.getCell(infoArr[3]);
                var description = row.getCell(infoArr[4]);
                accurateSearch.addText(rowNumber, id + ' ' + initiator + ' ' + title + ' ' + description);
            });

            accurateSearch.remove(1);

            var foundIds = accurateSearch.search(searchString);

            var searchFailText = `I can't find a match for your query :frowning: maybe try again\? 
            You can also ask our helpers for help!`;

            if (foundIds.length === 0) return message.channel.send(searchFailText);

            var foundLen = Math.min(foundIds.length, maxResultsPushed);
            var resultArr = [];
            var currentID = 1;

            for (i = 0; i < foundLen; i++) {

                var storedTitleText = worksheet.getRow(foundIds[i]).getCell(infoArr[3]).value;

                if (Utility.CheckIfEmpty(storedTitleText)) continue;

                var descriptionText = worksheet.getRow(foundIds[i]).getCell(infoArr[4]).value;
                var displayDescriptionText = '';
                if (descriptionText) {
                    var descs = descriptionText.trim().split(/ +/);
                    var displayDescriptionLength = Math.min(descs.length, maxDescDispLength);
                    for (j = 0; j < displayDescriptionLength; j++) {
                        displayDescriptionText += descs[j]
                        displayDescriptionText += ' ';
                    }

                    if (descs.length > maxDescDispLength) displayDescriptionText += '...';
                }

                resultArr.push({
                    id: currentID++,
                    initiator: worksheet.getRow(foundIds[i]).getCell(infoArr[0]).value,
                    title: storedTitleText,
                    description: displayDescriptionText,
                    row: worksheet.getRow(foundIds[i]),
                });
            }

            if (resultArr.length === 0) return message.channel.send(searchFailText);

            //Stamps the buttons with current date so they wont mess up
            var time = Date.now();

            var menuID = `select ${time}`;

            message.channel.send(GetPromptMessage(menuID, resultArr, false)).then(async interaction => {
                const filter = i => i.customId === menuID;
                const menuCollector = interaction.channel.createMessageComponentCollector({
                    filter,
                    time: 60000
                });

                menuCollector.on('collect', async i => {
                    //if somehow it isnt a select menu interaction, return
                    if (!i.isSelectMenu()) {
                        return interaction.edit({
                            content: "Wrong type of interaction...? Weird. Please tell vert about it.",
                            component: [],
                        });
                    }

                    var result = resultArr.find(r => `Option ${r.id}` === i.values[0])
                    await i.deferUpdate();
                    await i.editReply({
                        content: "Sure thing! Gimme a sec",
                        components: []
                    });
                    await Utility.Sleep(1000);
                    processResult(result.row);
                    menuCollector.stop('selected');
                })

                menuCollector.on('end', async collected => {
                    Utility.DebugLog(`Tell collector ended. Reason: ${menuCollector.endReason}`);
                });
            });
        }

        function processResult(row) {
            //Creates embed
            var embed = CreateGlossaryEmbed(row.getCell(infoArr[0]).value,
                Utility.getVoteInfo(row.getCell(infoArr[1]).value, votesheet),
                row.getCell(infoArr[3]).value,
                row.getCell(infoArr[2]).value,
                row.getCell(infoArr[4]).value,
                [row.getCell(infoArr[5]).value, row.getCell(infoArr[5] + 1).value, row.getCell(infoArr[5] + 2).value]);

            //Stamps the buttons with current date so they wont mess up
            var time = Date.now();

            var upvoteID = `upvote ${time}`;
            var downvoteID = `downvote ${time}`;

            message.channel.send({
                embeds: [embed],
                components: [CreateVoteButton(upvoteID, downvoteID, false)]
            }).then(async interaction => {

                //If this is happening in dms, gtfo before kaori realises advanced roles is not a thing in dms
                if (message.channel.type === 'dm') return;

                const filter = i => (i.customId === upvoteID || i.customId === downvoteID);

                const collector = interaction.channel.createMessageComponentCollector({
                    filter,
                    time: 3000
                });

                var isVoted = false;

                collector.on('collect', async i => {

                    if (!i.isButton()) return;

                    var isUpvote = i.customId === upvoteID;
                    var isDownvote = i.customId === downvoteID;

                    //If its neither an upvote nor a downvote then Kaori can sleeep 
                    if (!isDownvote && !isUpvote) {
                        await i.editReply({
                            embeds: [embed],
                            components: []
                        });
                        await i.channel.send("Something went wrong! Please tell vert if the problem persists.");
                    }

                    var isAdv = Utility.CheckIfArrayContains(i.member._roles, advancedRoles);
                    var base = 6 * row.getCell(infoArr[1]).value;
                    var upvotes = votesheet.getRow(isAdv ? base + 3 : base + 1);
                    var downvotes = votesheet.getRow(isAdv ? base + 4 : base + 2);

                    RemoveEntryFromRow(upvotes, i.user);
                    RemoveEntryFromRow(downvotes, i.user);

                    //Process vote
                    if (isUpvote) {
                        if (AddEntryToRow(upvotes, i.user, (isAdv ? base + 3 : base + 1))) {
                            Utility.DebugLog(`${i.user.tag} upvoted the entry ${row.getCell(infoArr[0]).value}`);
                            isVoted = true;
                        }
                    } else if (isDownvote) {
                        if (AddEntryToRow(downvotes, i.user, (isAdv ? base + 4 : base + 2))) {
                            Utility.DebugLog(`${i.user.tag} downvoted the entry ${row.getCell(infoArr[0]).value}`);
                            isVoted = true;
                        }
                    }

                    await i.deferUpdate();
                    await i.editReply({
                        content: "Thanks for the vote :smile:",
                        ephemerial: true,
                        embeds: [embed],
                        components: [CreateVoteButton(upvoteID, downvoteID, false)]
                    });
                });

                collector.on('end', async collected => {
                    interaction.edit({
                        embeds: [embed],
                        components: []
                    });

                    //Write new data
                    if (isVoted) {
                        try {
                            await workbook.xlsx.writeFile(filename);
                            Utility.DebugLog(`Data written to database. Updated ${collected.size} entries`);
                        } catch (error) {
                            console.log(error);
                        }
                    }
                });
            });
        }

        // returns true if the function found an exact match for the initiator
        function findMatch(arg) {
            for (i = 2; i <= worksheet.actualRowCount; i++) {
                //Process string
                var toCompare = worksheet.getRow(i).getCell(infoArr[0]).value.toLowerCase().trim();
                var arg = arg.toLowerCase().trim();
                if (toCompare === arg) return i;
            }
            return -1;
        }

        //Check if user tag is present in that row and removes the entry. Returns true if smth is removed
        function RemoveEntryFromRow(row, user) {
            row.eachCell(function (cell, colNumber) {
                if (user != null && cell.value.trim() === user.tag.trim()) {
                    Utility.DebugLog(`User ${user.tag.trim()} removed from cell ${colNumber}`);
                    row.splice(colNumber, 1);
                    return true;
                }
            });
            return false;
        }

        //Adds user tag to entry. Returns true if add is successful
        function AddEntryToRow(row, user, rowNr) {
            for (i = 1; i <= votesheet.columnCount + 1; i++) {
                var cellValue = row.getCell(i).value;
                if (Utility.CheckIfEmpty(cellValue)) {
                    row.getCell(i).value = user.tag;
                    return true;
                }
            }
            return false;
        }

        //Creates button for vote
        function CreateVoteButton(upID, downID, disabled) {
            return new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setCustomId(upID)
                    .setLabel('Upvote ⬆️')
                    .setStyle('SECONDARY')
                    .setDisabled(disabled),

                    new MessageButton()
                    .setCustomId(downID)
                    .setLabel('Downvote ⬇️')
                    .setStyle('SECONDARY')
                    .setDisabled(disabled),
                )
        }

        //Creates search result prompt and the button select menu thing. Maximum 5
        function GetPromptMessage(menuId, ResultArr, disabled) {

            var prompt = '\u200B';
            var menuOptions = [];

            prompt += `I can't find the exact thing that you are looking for... however there are some similar ones that you might wanna take a look. `
            prompt += `Press the button and I will give you the corresponding data \n\n`;

            for (i = 0; i < ResultArr.length; i++) {
                var result = ResultArr[i];
                prompt += `${result.id}. ${result.initiator} : ${result.title} \n ${result.description} \n \n`;
                var desc = Utility.StringTrim(`${result.initiator}: ${result.title} ${result.description}`, 100, true);
                menuOptions.push({
                    label: `Option ${result.id}`,
                    description: desc,
                    value: `Option ${result.id}`,
                });
            }

            var menu = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                    .setCustomId(menuId)
                    .setPlaceholder('Please select one')
                    .addOptions(menuOptions)
                    .setDisabled(disabled),
                );

            return {
                content: prompt,
                components: [menu]
            }
        }

        //Creates Embed
        function CreateGlossaryEmbed(term, upvoteInfo, title, author, desc, links) {
            var termText = Utility.AddEmpty(term);
            var advancedUpvotes = upvoteInfo[2] - upvoteInfo[3];
            var upvotes = advancedUpvotes + upvoteInfo[0] - upvoteInfo[1];
            var titleText = Utility.AddEmpty(title);
            var authorText = Utility.AddEmpty(author);
            var description = Utility.AddEmpty(desc);
            var linkInfo = links.length;
            var isVerified = advancedUpvotes >= verifyVotes;

            var footer = `This entry has ${upvotes} votes and approved by ${advancedUpvotes} advanced pianists in this server. Data provided by ${authorText}`;

            var verificationText = isVerified ? "This is an entry verified by advanced and proficient pianists in this server :white_check_mark: Please feel free to use it!" :
                "This is not an entry verified by advanceds and proficients in this server :x: Please take the information with a grain of salt";

            var linksConcat = `\u200b`;
            for (i = 0; i < linkInfo; i++) {
                l = Utility.getCellValue(links[i]);

                linksConcat += Utility.AddEmpty(l);
                if (!Utility.CheckIfEmpty(l)) linksConcat += `\n`;
            }

            //Returns a ready embed
            return new MessageEmbed()
                .setColor(color)
                .setAuthor('Kaori', 'https://i.imgur.com/lxTn3yl.jpg')
                .setDescription(`Here you go! The information for ${termText}`)
                .setThumbnail('https://i.imgur.com/X2ttwUo.png')
                .addFields({
                    name: titleText,
                    value: description
                }, {
                    name: 'Links',
                    value: linksConcat
                }, {
                    name: '\u200b',
                    value: verificationText
                }, )
                .setFooter(footer);
        }
    },
};