module.exports = { name : "utility",
    
    //Add an empty character to a string if its empty
    stringTransform (string) {
        var str = '\u200B';
        if (!isEmpty(string)) str = string;
        return str;
    },

    //Returns true if two arrays have at least one match
    CheckIfArrayContains(checkArr, arr) {
        var z = checkArr.filter(function(val) {
            return arr.indexOf(val) != -1;
        });
        return z.length > 0;
    },

    //Returns iftrue if value is true or nonempty
    CheckIf(value, ifTrue, ifFalse){
        try{
            if (value) return ifTrue;
            else return ifFalse;   
        } catch(error){
            console.log(error);
            return ifFalse;
        }
    },

    //Return true if string is empty
    CheckIfEmpty(string) {
        return isEmpty(string);
    },

    //Merge a string arg into one string
    RemergeArgs(args) {
        var searchString = ` `;
        for (i=0; i < args.length; i++){
            searchString += args[i];
            searchString += ' ';
        }
        return searchString;
    }
};

function isEmpty(value) {
    return typeof(value) == 'string' && !value.trim() || typeof value == 'undefined' || value === null;
}