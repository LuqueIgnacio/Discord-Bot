const { SlashCommandBuilder } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('reanude')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		const musicPlayer = global.musicPlayers.get(interaction.guildId)
		musicPlayer.reanude()
		await interaction.reply("LuqueBot sigue con la música" );
	},
};
