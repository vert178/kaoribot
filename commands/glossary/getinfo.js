module.exports = {
	name: 'getinfo',
	description: 'Why do you even care',
    hidden: true,
    serverOnly: true,
	restricted: true,
	async execute(message, args, Constants, ExcelUtility, Utility) {

		const workbook = await ExcelUtility.loadExcel(true);
		const worksheet = workbook.worksheets[1];
		const votesheet = workbook.worksheets[2];

		var searchString = ` `;
        for (i=0; i < args.length; i++){
            searchString += args[i];
            searchString += ' ';
        }

        var rowNr = findMatch(searchString);

		if (rowNr <= 0) return console.log(`Invalid initiator`);

		var voteInfo = ExcelUtility.getVoteInfo(worksheet.getRow(rowNr).getCell(1).value, votesheet);
		
		message.channel.send(`Info for ${worksheet.getRow(rowNr).getCell(2).value}: ${voteInfo[0]}, ${voteInfo[1]}, ${voteInfo[2]}, ${voteInfo[3]}`);

		function findMatch(arg) {
            for (i=2; i <= worksheet.actualRowCount; i++){
                var toCompare = worksheet.getRow(i).getCell(2).value;
                var arg = arg.toLowerCase().trim();
                if(toCompare === arg) return i;
            }
			return -1;
        }
	},
};