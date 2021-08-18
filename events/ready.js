module.exports = {
	name: 'ready',
	once: true,
	execute(client, Utility) {
        try{
            console.log(`Logged in as ${client.user.tag}`);
        } catch (error){
            console.log(error);
        }
	},
};