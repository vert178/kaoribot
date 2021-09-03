const Excel = require('exceljs');
const workbook = new Excel.Workbook();
const {
    filename,
    color
} = require('./../utilities/constant.json');
const {
    MessageAttachment,
    MessageEmbed
} = require('discord.js');

var self = module.exports = {

    hidden: true,
    isUtility: true,

    //Add an empty character to a string if its empty
    AddEmpty(string) {
        var str = '\u200B';
        if (!self.isEmpty(string)) str += `${string}`;
        return str;
    },

    //Returns true if two arrays have at least one match
    CheckIfArrayContains(checkArr, arr) {
        var z = checkArr.filter(function (val) {
            return arr.indexOf(val) != -1;
        });
        return z.length > 0;
    },

    //Returns iftrue if value is true or nonempty
    CheckValue(value, ifTrue, ifFalse) {
        try {
            if (value) return ifTrue;
            else return ifFalse;
        } catch (error) {
            console.log(error);
            return ifFalse;
        }
    },

    //Return true if string is empty
    isEmpty(value) {
        if (typeof (value) == 'string') return !value.trim() || typeof value == 'undefined' || value === null;
        else return !value;
    },

    //Merge a string arg into one string
    RemergeArgs(args) {
        var searchString = ` `;
        for (i = 0; i < args.length; i++) {
            searchString += args[i];
            searchString += ' ';
        }
        return searchString;
    },

    //Waits for x milliseconds
    async Sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    },

    //Check if a particular string contains more than n checklist words
    StringContainAtLeast(string, checklist, n) {
        var z = 0;
        for (i = 0; i < checklist.length; i++) {
            if (string.trim().toLowerCase().includes(checklist[i].trim().toLowerCase())) z += 1;
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
        } else {
            return string.substring(0, Math.min(string.length(), targetLength));
        }
    },


    //Prints the debug log thing
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
    async loadExcel(reload) {
        if (reload) {
            try {
                await workbook.xlsx.readFile(filename);
            } catch (error) {
                console.log(error);
            }
        }
        return workbook;
    },

    getCellValue(cellValue) {
        l = '';
        if (cellValue && typeof (cellValue) === 'object') l = cellValue.text;
        else
            // if (typeof(cellValue) === 'string') 
            l = cellValue;

        return l;
    },

    //Returns Ups, Downs, AdvUps, AdvDowns
    getVoteInfo(id, votesheet) {
        return [countNonEmpty(votesheet.getRow(6 * id + 1), votesheet),
            countNonEmpty(votesheet.getRow(6 * id + 2), votesheet),
            countNonEmpty(votesheet.getRow(6 * id + 3), votesheet),
            countNonEmpty(votesheet.getRow(6 * id + 4), votesheet)
        ];
    },
};

function countNonEmpty(row, sheet) {
    var j = 0;
    for (i = 1; i <= sheet.columnCount + 1; i++) {
        if (row.getCell(i).value) j += 1;
    }
    return j;
}