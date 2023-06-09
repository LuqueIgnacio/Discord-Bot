const { SlashCommandBuilder, MessageCollector } = require('discord.js');
const {songsList} = require("../helpers/songsList.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('delete')
		.setDescription('Borra una canción'),
	async execute(interaction) {

		const musicPlayer = global.musicPlayers.get(interaction.guildId)
		await interaction.deferReply()
		const list = await songsList(interaction)
		if(list.isEmpty){
			await interaction.editReply({ content: 'LuqueBot responde:', embeds: [list.embed] });
			return
		}
		await interaction.editReply({ content: 'Selecciona una canción para eliminar:', embeds: [list.embed] });
		const collector = new MessageCollector(interaction.channel, {max: 5, time: 10000})
		collector.filter = (message) => {
			return message.author.id === interaction.user.id && parseInt(message.content)
		}
		collector.on("collect", async message => {
			const index = parseInt(message)
			if(index <= musicPlayer.getPlaylistLength() && index > 0){
				await musicPlayer.deleteSong(index, interaction)
				interaction.channel.send("La cancion " + index + " fue eliminada")
				collector.stop()
			}else{
				interaction.channel.send("Selecciona un número entre 1 y " + musicPlayer.getPlaylistLength())
			}
				
			
		})
		
	},
};