const search = require("../piece info/search");

//The minimum score of a string for it to be qualified a search result. The score is on a scale of 0 to 1.
const threshold = 0.95;

module.exports = {
    hidden: true,
    isUtility: true,

    readParam(param, info) {

        //Check if param is a positive integer
        var i = Number(param);
        var s = info.toLowerCase().trim();

        switch (s) {
            case "verify":
                return readBit(param, 0);

            case "sonata":
                return readBit(param, 4);

            case "etude":
                return readBit(param, 5);

            case "henle":
                return readBit(param, 6);

            case "period":
                return (i & 14) / 2;

            default:
                throw "Warning: info not identified";
        }
    },

    //Param: the parameter to be changed; info: the info to be changed (string); value: bool, number
    setParam(param, info, value) {
        var i = Number(param);
        var s = info.toLowerCase().trim();

        switch (s) {
            case "verify":
                return setBit(param, 0, value);

            case "sonata":
                return setBit(param, 4, value);

            case "etude":
                return setBit(param, 5, value);

            case "henle":
                return setBit(param, 6, value);

            case "period":
                //Turns off the 3 bits associated with period, then adds the period value
                return (i & ~14) + (value << 1);

            default:
                throw "Warning: info not identified";
        }
    },

    //Search for the closest matches with the target string inside the data array. Threshold 
    //Depreceated
    search(target, data) {
        var ratings = [];
        for (i = 0; i < data.length; i++) {
            var score = score(target, data[i]);
            if (score < threshold) continue;
            ratings.push(i);
        }

        ratings.sort(function(a,b) {
            return b.rate - a.rate;
        });

        return ratings;
    }
}

//Read the N-th bit and return the value as a bool
function readBit(i, N) {
    i &= (1 << N);
    return i > 0;
}

//Set the N-th bit according to a bool
function setBit(i, N, value) {
    if (!value) {
        i &= ~(1 << N)
    } else {
        i |= 1 << N
    }
    return i;
}

//compare the string str against another string, and get a score based on similarity
function score(str, compareAgainst) {

}