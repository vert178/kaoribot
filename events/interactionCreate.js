module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(interaction, client, Utility) {

    // DEPRECEATED: how did you find this
    
    // if (!interaction.isCommand()) return;

	// if (interaction.commandName === 'ping') {
	// 	const row = new MessageActionRow()
	// 		.addComponents(
	// 			new MessageButton()
	// 				.setCustomId('primary')
	// 				.setLabel('Primary')
	// 				.setStyle('PRIMARY'),
	// 		);

	// 	await interaction.reply({ content: 'Pong!', components: [row] });
	// }
	},
};