
const { SlashCommandBuilder } = require('discord.js');
const {getVoiceConnection } = require('@discordjs/voice');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('LuqueBot abandona el canal de voz '),
	async execute(interaction) {
        const connection = getVoiceConnection(interaction.guildId);
		const musicPlayer = global.musicPlayers.get(interaction.guildId)
		musicPlayer.restart()
        connection.destroy(true);
		await interaction.reply('LuqueBot se tiene que ir');
	},
};