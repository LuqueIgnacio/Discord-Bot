const { SlashCommandBuilder } = require('discord.js');
const {joinVoiceChannel } = require('@discordjs/voice');
const ytsr = require('ytsr');
const yt = require('play-dl')
const { ActionRowBuilder, Events, StringSelectMenuBuilder } = require('discord.js');
const { InteractionCollector } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('El video a reproducir')
                .setRequired(false))
		.setDescription('Reproduce un video de youtube')
        ,
	async execute(interaction) {
        try{
            
            const connection = joinVoiceChannel({
                channelId: interaction.channelId,
                guildId: interaction.guildId,
                adapterCreator: interaction.channel.guild.voiceAdapterCreator,
            });
            /*
            * Para empezar es necesario aclarar los tres posibles casos en los que se presenta este comando
            * 1° Se ingresa sin ningún parámetro, por lo que recuperamos la playlist del archivo JSON, en caso
            * de que la playlist esté vacía enviamos un mensaje al usuario
            * 2° Se ingresa un string que no es una url, en ese caso procedemos a buscar el video en youtube
            * 3° Se ingresa una url de un video de youtube
            */
            const musicPlayer = global.musicPlayers.get(interaction.guildId)
            //Obtenemos la url que ingreso el usuario
            //deferReply le indica a Discord que la respuesta del bot llevará tiempo
            await interaction.deferReply()
            //Si no se ingresa una url el bot va a reproducir lo que ya tenia en su lista de reproduccion
            if(!interaction.options.getString("url") ){
                //Si el bot ya esta reproduciendo música enviamos un mensaje
                if(musicPlayer.isPlaying()){
                    await interaction.editReply({content: "Ya se está reproduciendo música", components: []})
                    return
                }
               
                if(musicPlayer.getPlaylistLength()-1 === musicPlayer.actualSong){
                    musicPlayer.restart()

                }
                await musicPlayer.recoverPlaylist(interaction)
                await musicPlayer.nextSong()
                musicPlayer.subscribe(connection)
                await interaction.editReply({content: musicPlayer.getActualSong().url, components: []})
                return
            }

            let videoUrl = interaction.options.getString("url")
            if(!videoUrl.startsWith("http")){
                //let searchResults = await ytsr(videoUrl, {limit: 5, gl: "AR"});
                let searchResults = await yt.search(videoUrl, {source: {youtube: "video"}, limit: 10, language: "es-ES" })
                searchResults = searchResults.map(item => {
                    const resultado = {
                        label: item.title,
                        value: item.url
                    }; 
                    return resultado 
                })
                
                const row = new ActionRowBuilder()
			    .addComponents(
				new StringSelectMenuBuilder()
					.setCustomId('select')
					.setPlaceholder('Selecciona una música')
					.addOptions(searchResults),
			    );
                
                await interaction.editReply({ content: 'Búsqueda de: ' + videoUrl, components: [row] });
                const collector = new InteractionCollector(interaction.client, {max: 1})
                
                collector.on("collect", async i => {
                    if(i.values){
                        videoUrl = i.values[0]
                        const isAdded = await musicPlayer.addSong(videoUrl, interaction)
                    
                        if(!isAdded){
                            await interaction.editReply({content: "Ya se encuentra en la playlist", components: []});

                            return
                        }
                        
                        if(musicPlayer.getPlaylistLength() > 0){
                            await musicPlayer.nextSong()
                        }
                        //Le mostramos al usuario la url de la música que seleccionó
                        await interaction.editReply({content: videoUrl, components: []})
                    }
                    collector.empty()
                })
             
            }else{
                if(!await musicPlayer.addSong(videoUrl, interaction)){
                    await interaction.editReply("Ya se encuentra en la playlist");
                    return
                }
                if(musicPlayer.getPlaylistLength() > 0){
                    await musicPlayer.nextSong()
                }
                //Le mostramos al usuario la url de la música que seleccionó
                await interaction.editReply({content: videoUrl, components: []})
            }
            musicPlayer.subscribe(connection)
            
          
        }catch(err){
            console.log(err)
            await interaction.editReply('LuqueBot ha fallado');
        }
        
	},
};


