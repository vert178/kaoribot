const AccurateSearch = require('accurate-search');
const { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } = require('discord.js');

const maxResultsPushed = 5;

var errortexts = ["I can't locate the database for some reason :frowning:",
"Whoops I can't find anything",
"Hmmm something strange happened maybe try again. :frowning:"];

var errortext = "\ \ Please tell vert if this problem persists";

//In order: Name, Composer, Level, Length, Link, Description, Period, Sonata, Etude, Review
const { searchArr } = require(`./../../config.json`);

module.exports = {
    name: `search`,
    description: `Checks the info of a piece`,
    alias: [`find`, `s`],
    args: [`\"The name of the piece you wanna search\"`],
    example: `Kaori, search Chopin Waterfall Etude`,
    cooldown: 5,
    minArgs: 1,
	async execute(message, args, Utility) {
        
        const workbook = await Utility.loadExcel(true);
        const worksheet = workbook.worksheets[0];

        var searchString = Utility.RemergeArgs(args);

        //Start search
        let accurateSearch = new AccurateSearch();

        //Index database
        worksheet.eachRow(function(row, rowNumber) {
            var composer = row.getCell(searchArr[1]);
            var pieceName = row.getCell(searchArr[0]);
            accurateSearch.addText(rowNumber, composer + pieceName);
        });
        
        accurateSearch.remove(1);

        var foundIds = accurateSearch.search(searchString);

        // No search results found :) returning...
        if(foundIds.length === 0){
            message.channel.send(errortexts[1] + ` ` + errortext);
            return;
        }

        //Ask about id
        var foundLen = Math.min(foundIds.length, maxResultsPushed);
        var prompt = [];
        var menuOptions = [];
        var resultArr = []
        prompt += `Sure! Found ${foundLen} results. Please react to the appropriate number for the result that you wanted.`;

        for (i=0; i < foundLen; i++){
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
                id: i+1,
                row: worksheet.getRow(foundIds[i]),
            });
        }

        //Stamps the buttons with current date so they wont mess up
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
            const menuCollector = interaction.createMessageComponentCollector({filter, time: 60000});
        
            menuCollector.on('collect', async i => {

                if (!i.isSelectMenu()) {
                    return interaction.editReply({
                        content: "Wrong type of interaction...? Weird. Please tell vert about it.",
                        components: [],
                    });
                }  

                var result = resultArr.find(r => `Option ${r.id}` === i.values[0]).row;
                await i.deferUpdate();

                var resultEmbed = Utility.createPieceEmbed(result.getCell(searchArr[0]).value, result.getCell(searchArr[1]).value,
                result.getCell(searchArr[2]).value,result.getCell(searchArr[3]).value, result.getCell(searchArr[4]).value,result.getCell(searchArr[5]).value,
                result.getCell(searchArr[6]).value, result.getCell(searchArr[7]).value, result.getCell(searchArr[8]).value, result.getCell(9).value, searchString);

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
	},
};