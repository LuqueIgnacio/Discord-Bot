const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const {songsList} = require("../helpers/songsList.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('list')
		.setDescription('Muestra la lista de reproducción'),
	async execute(interaction) {
       
        const list = await songsList(interaction)

		await interaction.reply({ content: 'LuqueBot responde:', embeds: [list.embed] });
	},
};