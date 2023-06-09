const { SlashCommandBuilder } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('shuffle')
		.setDescription('Mezcla la lista de reproducción'),
	async execute(interaction) {
		const musicPlayer = global.musicPlayers.get(interaction.guildId)
        if(musicPlayer.getPlaylistLength() > 0){
            musicPlayer.shuffleSongs()
		    await interaction.reply("Lista de reproducción mezclada" );
        }else{
		    await interaction.reply("Lista de reproducción vacía" );
        }	
	},
};