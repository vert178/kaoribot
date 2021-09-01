const puppeteer = require("puppeteer");
const fs = require("fs");
const readline = require("readline");
const Constant = require('./../utilities/constant.json')
const Excel = require('exceljs');
const Utility = require('./../utilities/utility.js');

const {
    YtAPIKey
} = require('../../config.json');
const YouTube = require('simple-youtube-api');
const youtube = new YouTube(YtAPIKey);

module.exports = {
    name: `updateinfo`,
    description: `Updates the piece info according to the henle website`,
    hidden: true,
    userRestricted: true,
    async execute(message, args) {

        //Soft Update: Ignores all duplicate entries 
        var isSoftUpdate = true;
        if (args[0] && args[0] === "hard") isSoftUpdate = false;

        message.reply("Update initiated! Please wait.");

        var obj = {
            listings: []
        }

        const browser = await puppeteer.launch({
            headless: false,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            ignoreDefaultArgs: ["--enable-automation"],
            //userDataDir: "./user_data",
            defaultViewport: null,
            //devtools: true,
            ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage();
        Utility.DebugLog("Update initiated. Browser launched");
        //await page.setRequestInterception(true);
        await page.setDefaultNavigationTimeout(0);
        //Goto target URL
        await page.goto('https://www.henle.de/en/search/?Scoring=Keyboard+instruments')
        await page.waitForSelector('a.link-detail')

        const nodes = await page.evaluate(() =>
            Array.from(document.querySelectorAll("a.link-detail"), (element) =>
                element.getAttribute("href")
            )
        );

        Utility.DebugLog("Scraped all listing URLs " + nodes.length);

        for (let i = 0; i < nodes.length; i++) {
            await page.goto("https://www.henle.de/" + nodes[i])
            await Utility.Sleep(1000)
            var composer = ""
            var title = ""
            var subtitle = ""


            await page.waitForSelector('h2.sub-title')
            composer = await page.$eval('h2.sub-title', el => el.textContent)

            title = await page.$eval('h2.main-title', el => el.textContent)
            console.log("scraping the data of article " + title)
            try {
                subtitle = await page.$eval('div.article-contents>ul:nth-child(2) strong', el => el.textContent);
            } catch (error) {
                console.log(error);
            }

            try {
                await page.click('div.article-contents>p.read-more>span')
                await page.waitForSelector('div.article-contents>p.read-more>span', {
                    visible: true,
                })
                const [sholwAll] = await page.$x("//div[@class='article-contents']/p[@class='read-more']/span");
                if (sholwAll) {
                    await sholwAll.click();
                }

            } catch (error) {
                console.log(error);
            }

            const levelsTitles = await page.$x('//div[@class="article-contents"]/ul[position()>2]/li[1]');
            const levelNames = await page.evaluate((...levelsTitles) => {
                return levelsTitles.map(e => e.textContent);
            }, ...levelsTitles);

            const levelsValues = await page.$x('//div[@class="article-contents"]/ul[position()>2]/li[2]/span');
            const levelValue = await page.evaluate((...levelsValues) => {
                return levelsValues.map(e => e.textContent);
            }, ...levelsValues);

            for (let j = 0; j < levelsTitles.length; j++) {
                var name = ""
                var level = ""

                name = levelNames[j]
                level = levelValue[j]

                obj.listings.push({
                    "composer": composer.trim(),
                    "title": title.trim(),
                    "subtitle": subtitle.trim(),
                    "name": name.trim(),
                    "level": level
                })
            }
        }

        Utility.DebugLog(`Scrap success! Found ${obj.listings.length} results. Now updating listing to the database.`)

        // let json = JSON.stringify(obj, null, 2);
        // fs.writeFile('output.json', json, function (error) {
        //     if (error) throw error;
        //     console.log('File Saved!!! to output.json');
        // });

        const workbook = await Utility.loadExcel(true);
        const worksheet = workbook.getWorksheet('Piece Info');

        for (listing in obj.listings) {

            //Name
            var redundantSubtitile = listing.title.toLowerCase() === listing.subtitle.toLowerCase() || Utility.isEmpty(listing.subtitle);
            var name = redundantSubtitile ? `${listing.title} - ${listing.name}` : `${listing.title} - ${listing.subtitle} - ${listing.name}`;

            //Period
            var period = getPeriod(listing.composer);

            //Find duplicate and determine update method
            var duplicate = CheckForDuplicates(name, worksheet);
            var row = worksheet.addRow([]);
            var description = Utility.AddEmpty('');

            if (duplicate > 0) {
                row = worksheet.getRow(duplicate);
                description = Utility.getInfo(row, "description");
            }

            if (isSoftUpdate && (listing.level === undefined || period > 3)) continue;

            //Level
            var level = listing.level !== undefined ? listing.level : 0;

            //Duration and link
            var video = GetTrustedVideos(name);
            var duration = video.duration.seconds >= 30 ? duration.hours * 60 + duration.minutes + 1 : duration.hours * 60 + duration.minutes
            var link = `https://www.youtube.com/watch?v=${video.id}`;

            //Params
            var sonata = Utility.StringContainAtLeast(name, ["sonata", "movement", "movements"], 1);
            var etude = Utility.StringContainAtLeast(name, ["étude", "etude", "etudes", "études", "toccata", "study"], 1);

            Utility.setInfo(row, name, "name");
            Utility.setInfo(row, listing.composer, "composer");
            Utility.setInfo(row, level, "level");
            Utility.setInfo(row, duration, "duration");
            Utility.setInfo(row, link, "link");
            Utility.setInfo(row, description, "description");
            Utility.setInfo(row, 65, "param");
            Utility.setInfo(row, sonata, "sonata");
            Utility.setInfo(row, etude, "etude");
            Utility.setInfo(row, period, "period");
        }

        browser.close();

        try {
            await workbook.xlsx.writeFile(filename);
            return message.reply(`Data written to database. Time for bubble tea :bubble_tea:`);
        } catch (error) {
            console.log(error);
        }
    },
};

function CheckForDuplicates(name, worksheet) {
    worksheet.eachRow(function (row, rowNumber) {
        var rowName = Utility.getInfo(row, "name");
        if (rowName.trim().toLowerCase() === name) return rowNumber;
    });

    return -1;
}

function GetTrustedVideos(name) {
    const maxResultSearch = 1;
    youtube.searchVideos(name, maxResultSearch)
        .then(results => {
            for (i = 0; i < maxResultSearch; i++) {
                youtube.getVideo(`https://www.youtube.com/watch?v=${results[i].id}`)
                    .then(video => {
                        //Always return first
                        return video;
                    })
                    .catch(console.log);
            }
        })
        .catch(console.log);
}

const BaroqueComposers = ["Johann Sebastian Bach", "Antonio Soler", "Domenico Scarlatti",
    "Georg Friedrich Händel",
];

const ClassicalComposers = ["Wolfgang Amadeus Mozart", "Franz Xaver Mozart", "Johann Kuhnau", "Joseph Haydn", "Muzio Clementi",
    "Ludwig van Beethoven", "Wilhelm Friedemann Bach", "Carl Philipp Emanuel Bach", "Johann Christian Bach",
];

const RomanticComposers = ["Clara Wieck-Schumann", "Carl Maria von Weber", "Peter Ilich Tchaikovsky", "Václav Jan Tomášek",
    "Robert Schumann", "Franz Schubert", "Franz Liszt", "Felix Mendelssohn Bartholdy", "Theodor Kirchner", "Fanny Hensel", "Stephen Heller",
    "Edvard Grieg", "Niels Wilhelm Gade", "Antonín Dvorák", "Ferruccio Busoni", "Frédéric Chopin", "Johannes Brahms",
];

const ModernComposers = ["Isaac Albéniz", "Isaac Albeniz", "Marko Tajcevic", "Alexander Scriabin", "Erik Satie", "Max Reger",
    "Maurice Ravel", "Rachmaninoff, Sergei", "Modest Mussorgsky", "Evgeny Kissin", "Enrique Granados", "Claude Debussy", "Béla Bartók"
];

function getPeriod(composer) {
    if (Utility.StringContainAtLeast(composer, BaroqueComposers, 1)) return 0;
    if (Utility.StringContainAtLeast(composer, ClassicalComposers, 1)) return 1;
    if (Utility.StringContainAtLeast(composer, RomanticComposers, 1)) return 2;
    if (Utility.StringContainAtLeast(composer, ModernComposers, 1)) return 3;
    return 4;
}