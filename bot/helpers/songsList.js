const { EmbedBuilder } = require('discord.js');

const songsList = async (interaction) =>{
    const musicPlayer = global.musicPlayers.get(interaction.guildId)
	const songs = await musicPlayer.getAllSongs(interaction)
		let list = "" 
        let isEmpty = false
        if(songs.length === 0){
            list = "Lista de reproducción vacía"
            isEmpty = true
        }
        songs.forEach( (song, index) => {
            list+= `${index+1}: ${song.title} (${song.duration})\n`
        });
        const embed = new EmbedBuilder()
        .setColor(0xbd5b2e)
        .setTitle('Lista de reproducción')
        .setDescription(list);

        return {embed: embed, isEmpty: isEmpty}
}
module.exports = {songsList}