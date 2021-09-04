const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

const keys = ["C major", "C minor", "Db major", "C# minor",
    "D major", "D minor", "Eb major", "Eb minor",
    "E major", "E minor", "F major", "F minor",
    "F# major", "F# minor", "G major", "G minor",
    "Ab major", "G# minor", "A major", "A minor",
    "Bb major", "Bb minor", "B major", "B minor"
];

const coin = ["Heads", "Tails"];

const trivia = ["Do you know my birthday is March 13?",
"My first official release in the MitK sever is actually version 3.0. Before that I had gone through many revisions for the search and tell function with no real data",
"In the pre-release versions, my database is actually an excel spreadsheet.",
"My name actually comes from the anime Your Lie in April.",
"There is a Beta Kaori somewhere in this server, hidden from view from everyone else.",
"There are 4514 search entries from the official Henle site",
]

const Utility = require('../utilities/utility.js');

module.exports = {
    name: 'say',
    alias: ['choose'],
    description: 'She will give you a random key, or a few random notes or whatever. Just a funny little command with basically no use.',
    example: `Kaori, say 3 notes`,
    args: ['notes', 'keys', 'coin'],
    minArgs: 2,
    async execute(message, args) {

        var howMany = 0;

        if (args[0].toLowerCase() === 'a' || args[0].toLowerCase() === 'an') howMany = 1;
        else if (Number(args[0]) && Number(args[0]) > 0) howMany = Number(args[0]);
        else return message.channel.send("Whoops that's not a valid command!");

        var arr = [];

        switch (args[args.length - 1].toLowerCase()) {
            case 'note':
            case 'notes':
                arr = notes;
                break;

            case 'key':
            case 'keys':
                arr = keys;
                break;

            case 'headsortails':
            case 'hot':
            case 'coin':
            case 'coins':
                arr = coin;
                break;

            case 'trivia':
                arr = trivia;
                howMany = 1;
                break;

            default:
                return message.channel.send("Whoops that's not a valid command!");
        }

        var str = '';

        for (i = 0; i < howMany; i++) {
            var number = Math.random() * arr.length;
            var content = arr[Math.floor(number)];
            str += content;
            str += ' ';
        }

        try {
            message.channel.send(str);
        } catch (error) {
            console.log(error);
            message.channel.send("Something went wrong! Please try again later");
        }
    },
};