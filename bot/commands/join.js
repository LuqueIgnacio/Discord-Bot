const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const fs = require('fs/promises');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('join')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		console.log(interaction.member.voice.channel)
		
        const connection = joinVoiceChannel({
            channelId: interaction.member.voice.channel.id,
            guildId: interaction.guildId,
            adapterCreator: interaction.channel.guild.voiceAdapterCreator,
        });
	
		await interaction.reply("LuqueBot se unio" );
	},
};
