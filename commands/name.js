const fs = require('fs');
const Discord = require('discord.js');

const notes = ["C", "C#","D", "D#","E", "F", "F#","G", "Ab","A", "Bb", "B"];
const keys = ["C major", "C minor",
"Db major", "C# minor",
"D major", "D minor",
"Eb major", "Eb minor",
"E major", "E minor",
"F major", "F minor",
"F# major", "F# minor",
"G major", "G minor",
"Ab major", "G# minor",
"A major", "A minor",
"Bb major", "Bb minor",
"B major", "B minor"];

module.exports = {
	name: 'name',
	description: 'She will give you a random key, or a few random notes',
    example: `Kaori, name 3 notes`,
    minArgs: 2,
	async execute(message, args) {

        var howMany = 0;

        if (args[0].toLowerCase() === 'a' || args[0].toLowerCase() === 'an') howMany = 1;
        else if (Number(args[0]) && Number(args[0]) > 0) howMany = Number(args[0]);
        else {
            console.log(`exit for args 0 ${args[0]}`);
            return message.channel.send("Whoops that's not a valid command!");
        }

        // console.log(howMany);

        var arr = [];

        switch (args[1].toLowerCase())
        {
            case 'note':
            case 'notes':
                arr = notes;
                break;
            
            case 'key':
            case 'keys':
                arr = keys;
                break;

            default:
                console.log(`exit for args 1 ${args[1].toLowerCase()}, `);
                return message.channel.send("Whoops that's not a valid command!");
        }

        var str = '';

        for (i=0; i < howMany; i++)
        {
            var number = Math.random() * arr.length;
            var content = arr[Math.floor(number)];
            // console.log(content + "" + number);
            str += content;
            str += ' ';
        }

        if (str) return message.channel.send(str);
        else return message.channel.send("Something went wrong! Please try again later");
	},
};