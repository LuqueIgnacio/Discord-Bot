const { SlashCommandBuilder } = require('discord.js');
const { musicPlayer } = require('../MusicPlayer');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skipea una música'),
	async execute(interaction) {
       
		const musicPlayer = global.musicPlayers.get(interaction.guildId)
		musicPlayer.skipSong()
		let respuesta = "Fin de la lista de reproducción"
		if(musicPlayer.actualSong >= 0){
			respuesta = "Sonando ahora:\n" + musicPlayer.getActualSong().url
		}
		await interaction.reply( respuesta);
	},
};