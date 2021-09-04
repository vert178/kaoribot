const puppeteer = require("puppeteer");
const fs = require("fs");
const readline = require("readline");
const Utility = require("../utilities/utility.js");
const Search = require("../utilities/searchutil.js");
const emptystring = '\u200b';

module.exports = {
    name: `updateinfo`,
    description: `Updates the piece info according to the henle website`,
    hidden: true,
    userRestricted: true,
    minArgs: 1,
    async execute(message, args) {

        var isComposer = args[0].toLowerCase().trim() === "composer";
        var path = isComposer ? './data/bybook.json' : './data/bypiece.json';

        message.channel.send("Update initiated! Please wait.");
        let t1 = Date.now();

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
        Utility.DebugLog(`Update initiated. Browser launched. There are 
        ${BaroqueComposers.length + ClassicalComposers.length + RomanticComposers.length + ModernComposers.length} composers. 
        Please make sure this is correct before I go any further`);
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
            var composer = "";
            var title = "";
            var subtitle = "";


            await page.waitForSelector('h2.sub-title')
            composer = await page.$eval('h2.sub-title', el => el.textContent)

            title = await page.$eval('h2.main-title', el => el.textContent)
            Utility.DebugLog("scraping the data of article " + title)
            try {
                subtitle = await page.$eval('div.article-contents>ul:nth-child(2) strong', el => el.textContent);
            } catch (error) {
                //console.log(error);
            }

            try {
                await page.click('div.article-contents>p.read-more>span')
                await page.waitForSelector('div.article-contents>p.read-more>span', {
                    visible: true,
                })
                const [showAll] = await page.$x("//div[@class='article-contents']/p[@class='read-more']/span");
                if (showAll) {
                    await showAll.click();
                }
            } catch (error) {
                //console.log(error);
            }

            const levelsTitles = await page.$x('//div[@class="article-contents"]/ul[position()>1 and @class="content-item"]/li[1]');
            const levelNames = await page.evaluate((...levelsTitles) => {
                return levelsTitles.map(e => e.textContent);
            }, ...levelsTitles);

            const levelsValues = await page.$x('//div[@class="article-contents"]/ul[position()>1 and @class="content-item"]/li[2]/span');
            const levelValue = await page.evaluate((...levelsValues) => {
                return levelsValues.map(e => e.textContent);
            }, ...levelsValues);

            var levels = []

            if (isComposer) {
                // To be implemented
            } 
            else {
                for (let j = 0; j < levelsTitles.length; j++) {
                    var name = levelNames[j];
                    var level = levelValue[j];
                    var period = getPeriod(composer.trim());

                    //Skip if no level found, or if the composer is unknown, or if there are duplicate entries
                    if (level === undefined) continue;
                    if (period > 3) continue;
                    if (obj.listings.find(e => 
                        e.composer.trim() === composer.trim() &&
                        e.name.trim() === name.trim() &&
                        e.title.trim() === title.trim() &&
                        e.subtitle.trim() === subtitle.trim())) continue;
                    if (title.trim() === subtitle.trim()) subtitle = emptystring;

                    var entry = {
                        "composer": composer.trim(),
                        "title": title.trim(),
                        "subtitle": subtitle.trim(),
                        "name": name.trim(),
                        "level": level,
                        "duration": 0,
                        "link": emptystring,
                        "description": emptystring,
                        "param": getParam(`${subtitle} ${name}`, composer)
                    }

                    console.log(entry);
                    obj.listings.push(entry);
                }
            }
        }

        let json = JSON.stringify(obj, null, 2);
        fs.writeFile(path, json, function (error) {
            if (error) throw error;
            let t2 = Date.now();
            var timeTaken = Math.round((t2 - t1)/6000)/10;
            Utility.DebugLog('File Saved!!!');
            return message.reply(`Done! Took me ${timeTaken} minutes to make ${obj.listings.length} entries. Now may I have bubble tea? :bubble_tea:`);
        });

        browser.close();
    }
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

function getParam(name, composer) {
    var param = 0;

    var period = getPeriod(composer.trim());
    param = Search.setParam(param, "period", period);

    var sonata = Utility.StringContainAtLeast(name, ["sonata", "movement", "movements"], 1);
    var etude = Utility.StringContainAtLeast(name, ["étude", "etude", "etudes", "études", "toccata", "study"], 1);
    param = Search.setParam(param, "sonata", sonata);
    param = Search.setParam(param, "etude", etude);
    param = Search.setParam(param, "henle", true);

    return param;
}