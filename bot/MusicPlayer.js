const {createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType  } = require('@discordjs/voice');
const fs = require('fs/promises');
const play = require('play-dl')

class MusicPlayer{

    constructor(channel, guildId){
        //Representa la lista de reproducción
        this.songs = []
        //Es el índice que identifica la canción actual de la lista de reproducción
        //-1 es su estado inicial
        this.actualSong = -1
        //El reproductor de música
        this.audioPlayer = createAudioPlayer()
        this.channel = channel
        this.guildId = guildId
        this.audioPlayer.on(AudioPlayerStatus.Idle, () =>{
            this.nextSong()
            if(this.getPlaylistLength()-1 != this.actualSong){
                this.channel.send("Reproduciendo:\n" + this.getActualSong().url)
            }
        })
        this.audioPlayer.on('error', error => {
            console.error(`Error: ${error}`);
            this.nextSong()
            this.channel.send("Reproduciendo:\n" + this.getActualSong().url)
        })
    }

    async getAllSongs(interaction){ 
        //Este sería el caso en el que el usuario todavía no ha puesto play, por lo cual songs está vacío
        //entonces primero recuperamos la playlist desde el archivo y luego devolvemos songs
        if(this.audioPlayer.state.status === AudioPlayerStatus.Idle && this.songs.length === 0){
            await this.recoverPlaylist(interaction)
        }
        return this.songs
    }

    getActualSong(){
        return this.songs[this.actualSong]
    }

    async getSongInfo(url){
        //const videoInfo = await ytdl.getBasicInfo(url)
        const videoInfo = (await play.video_basic_info(url)).video_details
        return {title: videoInfo.title, url:videoInfo.url, duration: videoInfo.durationRaw}
    }

    getPlaylistLength(){
        return this.songs.length
    }

    /*
     * Método encargado de recuperar la lista de reproducción desde el archivo JSON asociada al servidor
     * Si el reproductor tiene música no se recuperan los datos del al archivo, ya que la música será
     * la misma que se encuentra en el archivo
     */
    async recoverPlaylist(interaction){
        try{
            
            if(this.songs.length > 0){
                return
            }
			const file = await fs.readFile("./playlists/" + interaction.guildId + ".json")
			const playlist = JSON.parse(file.toString())
            
            playlist.songs.forEach(song => {
                this.songs.push(song)
            });
            
		}catch(err){
            console.log(err)
            await fs.writeFile("./playlists/" + interaction.guildId + ".json", "{songs: []}" )
		}
    }

    async addSong(url, interaction){
        if(this.songs.length === 0){
            this.songs.push(await this.getSongInfo(url))
            await this.recoverPlaylist(interaction)
            await this.nextSong()
        }else{
            //Verifica si la musica ya se encuentra en la playlist
            if(!this.songAlreadyExists(url)){
                //La música no se encuentra en la playlist
                this.songs.push(await this.getSongInfo(url))
            }else{
                return false
            }
            
        }

        await fs.writeFile("./playlists/" + interaction.guildId + ".json", JSON.stringify({songs: this.songs}) )
        return true
    }   

    async skipSong(){
        await this.nextSong()
    }

    /*
     * Este método reproduce la siguiente canción de la playlist, para eso incrementa en uno el atributo
     * actualSong para así poder acceder a la siguiente canción de la playlist a través de getActualSong
     * esta se descarga y se pasa al siguiente méetodo playSong.
     * En caso de que se haya llegado al final de la playlist songs.length-1 === this.actualSong, el
     * atributo actualSong volvera a su estado inicial (-1) y audioPlayer se pondrá en estado de pausa
     */
    async nextSong(){
        //Si no se ha llegado al final de la playlist reproduce la siguiente canción
        if(this.getPlaylistLength()-1 != this.actualSong){
            this.actualSong = this.actualSong + 1
            const music = await this.downloadMusic(this.getActualSong().url)
            this.playSong(music)
        }else{
            this.audioPlayer.pause()
        }
    }

    async downloadMusic(url){
        const music = await play.stream(url, {quality: 0, filter: "audioonly", discordPlayerCompatibility: true })
        return music
    }

    playSong(music){
        const resource = createAudioResource(music.stream, {
            inputType: music.type
        })
        this.audioPlayer.play(resource)
    }

    subscribe(connection){
        connection.subscribe(this.audioPlayer)
    }

    songAlreadyExists(url){
        const alreadyExists = this.songs.includes(url)
        
        if(alreadyExists){
            return true
        }else{
            return false
        }
    }

    isPlaying(){
        return this.audioPlayer.state.status === AudioPlayerStatus.Playing
    }

    /*
     * Elimina un elemento de la lista de reproducción, si actualSong tiene el valor
     * del largo de la lista de reproducción, actualSong se decrementa en 1 para así evitar     
     * que este se encuentre fuera de los límites del array.
     * Si el elemento eliminado se está reproduciendo este se skipea   
     */
    async deleteSong(index, interaction){
        index = index - 1
        
        if(index >= 0 && index <= this.songs.length){

            if(index === this.actualSong){
                this.nextSong()
            }

            if(this.actualSong === this.songs.length-1){
              this.actualSong = this.actualSong - 1
            }
            
            this.songs.splice(index, 1)
            await fs.writeFile("./playlists/" + interaction.guildId + ".json", JSON.stringify({songs: this.songs}) )
            return true
        }
        return false
    }

    async deleteAllSongs(interaction){
        this.songs = []
        this.audioPlayer.pause()
        await fs.writeFile("./playlists/" + interaction.guildId + ".json", JSON.stringify({songs: this.songs}) )
    }

    restart(){
        this.actualSong = -1
        this.audioPlayer.pause()
    }

    stop(){
        this.audioPlayer.pause()
    }

    reanude(){
        this.audioPlayer.unpause()
    }

    shuffleSongs() {
        for (let i = this.songs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            console.log(this.songs)
            [this.songs[i], this.songs[j]] = [this.songs[j], this.songs[i]];
        }
    }
}


exports.MusicPlayer =  MusicPlayer