const Utility = require('./../utilities/utility.js');
const Search = require("./../utilities/searchutil.js");


module.exports = {
	name: 'test',
	description: 'A test function to test whatever I need to test',
    hidden: true,
    alias: [],
	async execute(message, args) {
		var arg = Utility.RemergeArgs(args);
		var sonata = Utility.StringContainAtLeast(arg, ["sonata", "movement", "movements"], 1);
        var etude = Utility.StringContainAtLeast(arg, ["étude", "etude", "etudes", "études", "toccata", "study"], 1);

        var param = 0;
		param = Search.setParam(param, "period", 3);
		console.log(param);
		
	},
};

function GetDuration (duration) {
	
	var dur = duration.seconds >= 30 ? duration.hours * 60 + duration.minutes + 1 : duration.hours * 60 + duration.minutes;
	return `about ${dur} minutes`;
}