const { SlashCommandBuilder } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('deleteall')
		.setDescription('Borra toda la lista de reproducción'),
	async execute(interaction) {
		
		const musicPlayer = global.musicPlayers.get(interaction.guildId)
		musicPlayer.deleteAllSongs(interaction)
		await interaction.reply("LuqueBot borro todo" );
	},
};