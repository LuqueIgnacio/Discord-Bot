const { SlashCommandBuilder } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		const musicPlayer = global.musicPlayers.get(interaction.guildId)
		musicPlayer.stop()
		await interaction.reply("A LuqueBot lo mandaron a callar" );
	},
};
