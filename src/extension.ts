import { MoosyncExtensionTemplate } from '@moosync/moosync-types'

import path from 'path'
import { URL } from 'url'
import { TidalAPI } from './tidalApi'
import semver from 'semver'

const PACKAGE_NAME = 'moosync.tidal'

export class MyExtension implements MoosyncExtensionTemplate {
  private moosyncAccountId?: string
  private tidalApi = new TidalAPI()

  async onStarted() {
    if (semver.satisfies(process.env.MOOSYNC_VERSION, '>2.1.0')) {
      console.info('Tidal extension started')
      await this.fetchPreferences()

      this.setupAccount()
      this.setupListeners()

      if (!this.tidalApi.accessToken && this.tidalApi.refreshToken) {
        await this.performLogin()
      }
    }
  }

  private async fetchPreferences() {
    const deviceCode = await api.getSecure<string>('deviceCode')
    const refreshToken = await api.getSecure<string>('refreshToken')
    const countryCode = await api.getPreferences<string>('countryCode', 'US')

    const accessToken = await api.getSecure<string>('accessToken')
    if (accessToken) {
      this.tidalApi.accessToken = accessToken
    }

    this.tidalApi.refreshToken = refreshToken
    this.tidalApi.countryCode = countryCode

    if (deviceCode) {
      this.tidalApi.deviceCode = deviceCode
    }
  }

  private async performLogout() {
    this.tidalApi.deviceCode = undefined
    this.tidalApi.accessToken = undefined
    this.tidalApi.refreshToken = undefined

    await api.setSecure('deviceCode', undefined)
    await api.setSecure('refreshToken', undefined)
    await api.setPreferences('countryCode', undefined)
  }

  private async performLogin() {
    if (!this.tidalApi.isLoggedIn) {
      const res = await this.tidalApi.performLogin()
      console.debug('login response', res)

      if (typeof res !== 'number') {
        await api.changeAccountAuthStatus(this.moosyncAccountId, true, res.username)

        if (res.refreshToken) {
          await api.setSecure('refreshToken', res.refreshToken)
        }
        await api.setPreferences('countryCode', res.countryCode)
      } else if (res === 1) {
        api.setSecure('deviceCode', undefined)
        this.tidalApi.deviceCode = undefined
      }
    }
  }

  private async performDeviceAuthorization() {
    return await this.tidalApi.performDeviceAuthorization()
  }

  private async setupAccount() {
    this.moosyncAccountId = await api.registerAccount(
      'Tidal',
      '#000000',
      path.resolve(__dirname, '../assets/icon.svg'),
      this.loginCallback.bind(this),
      this.logoutCallback.bind(this)
    )
  }

  private async logoutCallback() {
    await this.performLogout()
  }

  private async loginCallback() {
    if (!this.tidalApi.deviceCode) {
      const url = await this.performDeviceAuthorization()
      api.setSecure('deviceCode', this.tidalApi.deviceCode)

      const interval = setInterval(() => {
        api.off('oauthCallback')
      }, 300 * 1000)

      api.on('oauthCallback', async () => {
        clearInterval(interval)
        api.off('oauthCallback')

        await this.performLogin()
        await api.closeLoginModal()
      })

      await api.registerOAuth('tidal')
      await api.openLoginModal({
        providerName: 'Tidal',
        providerColor: 'var(--accent)',
        text: 'After finishing, press the submit button',
        url,
        oauthPath: 'tidal',
        manualClick: true
      })

      await api.openExternalURL(url.startsWith('http') ? url : 'https://' + url)
    } else {
      await this.performLogin()
    }
  }

  private setupListeners() {
    api.on('requestedPlaylists', async () => {
      if (this.tidalApi.isLoggedIn) {
        const playlists = await this.tidalApi.getPlaylists()
        return { playlists }
      }
    })

    api.on('requestedPlaylistSongs', async (playlist_id) => {
      if (this.tidalApi.isLoggedIn) {
        const songs = await this.tidalApi.getPlaylistItems(playlist_id.replace(`${PACKAGE_NAME}:`, ''))
        return { songs }
      }
    })

    api.on('requestedSongFromURL', async (url) => {
      if (this.tidalApi.isLoggedIn) {
        const resp = await this.tidalApi.getTrackIfValid(url)
        if (resp) return { song: resp }
      }
    })

    api.on('requestedPlaylistFromURL', async (url) => {
      if (this.tidalApi.isLoggedIn) {
        const resp = await this.tidalApi.getPlaylistIfValid(url)
        if (resp && resp.playlist) return resp
      }
    })

    api.registerSearchProvider('Tidal')
    api.on('requestedSearchResult', async (term) => {
      if (this.tidalApi.isLoggedIn) {
        const resp = await this.tidalApi.search(term)
        return resp
      }
    })

    api.registerArtistSongProvider('Tidal')
    api.on('requestedArtistSongs', async (artist) => {
      let artistId = api.utils.getArtistExtraInfo(artist)?.artist_id
      if (!artistId) {
        artistId = api.utils.getArtistExtraInfo((await this.tidalApi.searchArtists(artist.artist_name))[0])?.artist_id
        artistId && (await api.setArtistEditableInfo(artist.artist_id, { artist_id: artistId }))
      }

      if (artistId) {
        const songs = await this.tidalApi.getArtistSongs(artistId)
        return { songs }
      }
    })

    api.registerAlbumSongProvider('Tidal')
    api.on('requestedAlbumSongs', async (album) => {
      let albumId = api.utils.getAlbumExtraInfo(album)?.album_id
      if (!albumId) {
        albumId = api.utils.getAlbumExtraInfo((await this.tidalApi.searchAlbums(album.album_name))[0])?.album_id
        albumId && (await api.setAlbumEditableInfo(album.album_id, { album_id: albumId }))
      }

      if (albumId) {
        const songs = await this.tidalApi.getAlbumSongs(albumId)
        return { songs }
      }
    })

    api.on('requestedRecommendations', async () => {
      if (this.tidalApi.isLoggedIn) {
        const data = await this.tidalApi.getRecommendations()
        return {
          providerName: 'Tidal',
          songs: data
        }
      }
    })

    api.on('requestedLyrics', async (song) => {
      if (this.tidalApi.isLoggedIn) {
        if (song.providerExtension === PACKAGE_NAME) {
          const data = await this.tidalApi.getLyrics(song._id.replace(`${PACKAGE_NAME}:`, ''))
          return data
        }
      }
    })

    api.on('customRequest', async (url) => {
      if (this.tidalApi.isLoggedIn) {
        const parsed = new URL(url)
        const songId = parsed.pathname.substring(1)
        const quality = parsed.searchParams.get('quality')

        const manifest = await this.tidalApi.getStreamURL(songId, quality)

        return { mimeType: 'application/dash+xml', data: Buffer.from(manifest) }
      }
    })

    api.on('preferenceChanged', async ({ key, value }) => {
      if (key === 'accessToken') {
        if (typeof value === 'string' || typeof value === 'undefined') {
          this.tidalApi.accessToken = value

          if (value) await api.changeAccountAuthStatus(this.moosyncAccountId, true, 'Custom login')
          else await api.changeAccountAuthStatus(this.moosyncAccountId, false)
        }
      }

      if (key === 'buttons.clearCache') {
        await this.tidalApi.clearCache()
      }
    })
  }
}
