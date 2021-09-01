const { YtAPIKey } = require('../../config.json');
  
const YouTube = require('simple-youtube-api');
const youtube = new YouTube(YtAPIKey);

const fs = require("fs");

const url = "https://en.wikipedia.org/wiki/List_of_presidents_of_the_United_States";

const Utility = require('./../utilities/utility.js');


module.exports = {
	name: 'test',
	description: 'A test function to test whatever I need to test',
    hidden: true,
    alias: [],
	async execute(message, args) {
		var arg = Utility.RemergeArgs(args);
		youtube.searchVideos(arg, 4)
			.then(results => {
				youtube.getVideo(`https://www.youtube.com/watch?v=${results[0].id}`)
					.then(video => {
						console.log(video);
						// var duration = GetDuration(video.duration);
						// message.channel.send(`The duration of ${arg} is ${duration}`);
					})
					.catch(console.log);
			})
			.catch(console.log);
	
		// const html = await request(url);
		// const $ = cheerio.load(html);

		// const listItems = $(".wikitable tr td");

		// const presidents = [];

		// listItems.each((index, element) => {
		// 	presidents.push($(element).children("td").text());
		// });

		// console.log(presidents);
		
	},
};

function GetDuration (duration) {
	
	var dur = duration.seconds >= 30 ? duration.hours * 60 + duration.minutes + 1 : duration.hours * 60 + duration.minutes;
	return `about ${dur} minutes`;
}