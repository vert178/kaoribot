module.exports = {
    hidden: true,
    isUtility: true,

    readParam(param, info) {

        //Check if param is a positive integer
        if (!Number(int) || Number(int) <= 0) return false;
        var i = Number(int);
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

    setParam(param, info, value) {
        //Check if param is a positive integer
        if (!Number(int) || Number(int) <= 0) return false;
        var i = Number(int);
        var s = info.toLowerCase().trim();

        switch (s) {
            case "verify":
                return setBit(param, 0, value)

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
    }
}

//Read the N-th bit and return the value as a bool
function readBit(i, N) {
    i &= (1 << N);
    return i > 0;
}

//Set the N-th bit according to a bool
function setBit(i, N, value) {
    if (value) {
        i &= ~(1 << N)
    } else {
        i |= 1 << N
    }
    return i;
}