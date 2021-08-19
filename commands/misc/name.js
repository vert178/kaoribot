const notes = ["C", "C#","D", "D#","E", "F", "F#","G", "Ab","A", "Bb", "B"];

const keys = ["C major", "C minor", "Db major", "C# minor",
"D major", "D minor", "Eb major", "Eb minor",
"E major", "E minor", "F major", "F minor",
"F# major", "F# minor", "G major", "G minor",
"Ab major", "G# minor", "A major", "A minor",
"Bb major", "Bb minor", "B major", "B minor"];

const coin = ["Heads", "Tails"];

module.exports = {
	name: 'name',
    alias: ['choose'],
	description: 'She will give you a random key, or a few random notes or whatever. Just a funny little command with basically no use.',
    example: `Kaori, name 3 notes`,
    args: ['notes', 'keys'],
    minArgs: 1,
	async execute(message, args, Utility) {

        var howMany = 0;

        if (args.length = 1 || args[0].toLowerCase() === 'a' || args[0].toLowerCase() === 'an') howMany = 1;
        else if (Number(args[0]) && Number(args[0]) > 0) howMany = Number(args[0]);
        else return message.channel.send("Whoops that's not a valid command!");

        var arr = [];

        switch (args[args.length - 1].toLowerCase())
        {
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
                arr = coin;
                break;

            default:
                return message.channel.send("Whoops that's not a valid command!");
        }

        var str = '';

        for (i=0; i < howMany; i++)
        {
            var number = Math.random() * arr.length;
            var content = arr[Math.floor(number)];
            str += content;
            str += ' ';
        }
        
        try
        {
            message.channel.send(str);
        }
        catch (error)
        {
            console.log(error);
            message.channel.send("Something went wrong! Please try again later");
        }
	},
};