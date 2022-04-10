import { MoosyncExtensionTemplate } from '@moosync/moosync-types'
import { PlayerState, Song, SongQueue } from '@moosync/moosync-types/models'
import { resolve } from 'path'

export class MyExtension implements MoosyncExtensionTemplate {
  async onStarted() {
    logger.info('Extension started')
    this.registerEvents()

    setInterval(() => {
      this.setProgressbarWidth()
    }, 1000)
  }

  private async onSongChanged(song: Song) {
    logger.debug(song)
  }

  private async onPlayerStateChanged(state: PlayerState) {
    logger.debug(state)
  }

  private async onSongQueueChanged(queue: SongQueue) {
    logger.debug(queue)
  }

  private async onVolumeChanged(volume: number) {
    logger.debug(volume)
  }

  async onStopped() {
    logger.info('Extension stopped')
  }

  private async onPreferenceChanged({ key, value }: { key: string; value: any }): Promise<void> {
    logger.info('Preferences changed at', key, 'with value', value)
  }

  async setProgressbarWidth() {
    await api.setPreferences('test_progressBar', Math.random() * 100 + 1)
  }

  private async registerEvents() {
    api.on('requestedPlaylists', async () => {
      return {
        playlists: [
          {
            playlist_id: 'Some random generated ID',
            playlist_name: 'Hello this is a playlist',
            playlist_song_count: 69,
            playlist_coverPath: 'https://avatars.githubusercontent.com/u/91860733?s=200&v=4',
            icon: resolve(__dirname, '../assets/icon.svg')
          }
        ]
      }
    })

    api.on('requestedPlaylistSongs', async () => {
      return {
        songs: [
          {
            _id: 'Another random ID',
            title: 'Example song',
            duration: 0,
            date_added: Date.now(),
            type: 'URL',
            playbackUrl:
              'https://file-examples.com/storage/fe8788b10b62489539afcfd/2017/11/file_example_MP3_5MG.mp3' /* If the URL is directly playable, duration is fetched at runtime */
          }
        ]
      }
    })

    api.on('playerStateChanged', this.onPlayerStateChanged.bind(this))
    api.on('preferenceChanged', this.onPreferenceChanged.bind(this))
    api.on('volumeChanged', this.onVolumeChanged.bind(this))
    api.on('songChanged', this.onSongChanged.bind(this))
    api.on('songQueueChanged', this.onSongQueueChanged.bind(this))
    api.on('seeked', async (time) => logger.debug('Player seeked to', time))

    await api.registerOAuth('exampleOAuth') /* Callback paths are case-insensitive */

    api.on('oauthCallback', async (url) => {
      logger.info('OAuth callback triggered', url)
    })
  }
}
