import axios, { AxiosError } from 'axios'
import adapter from 'axios/lib/adapters/http'
import { APIParser } from './apiParser'
import { URL, URLSearchParams } from 'url'
import { CacheHandler } from './cacheHandler'
import { Song, Playlist } from '@moosync/moosync-types'
import { resolve } from 'path'

const API_V2 = 'https://api.tidal.com/v2'
const API_V1 = 'https://api.tidalhifi.com/v1'
const LISTEN_TIDAL = 'https://listen.tidal.com/v1'
const AUTH_URL = 'https://auth.tidal.com/v1/oauth2'
const API_KEY = { clientId: '7m7Ap0JC9j1cOM3n', clientSecret: 'vRAdA108tlvkJpTsGZS8rGZ7xTlbJ0qaZ2K9saEzsgY=' }

export class TidalAPI {
  private axios = axios.create({ adapter })

  private _countryCode?: string = 'GB'
  private _accessToken?: string
  private _refreshToken?: string
  private _deviceCode?: string

  private accountId?: string

  private parser = new APIParser()
  private cacheHandler = new CacheHandler('./tidal.cache', false)

  public get isLoggedIn() {
    return !!this.accessToken
  }

  public get refreshToken() {
    return this._refreshToken
  }

  public set refreshToken(token: string | undefined) {
    this._refreshToken = token
  }

  public get countryCode() {
    return this._countryCode
  }

  public set countryCode(code: string | undefined) {
    this._countryCode = code
  }

  public get deviceCode() {
    return this._deviceCode
  }

  public set deviceCode(code: string | undefined) {
    this._deviceCode = code
  }

  public set accessToken(token: string | undefined) {
    this._accessToken = token
    if (!token) {
      this.accountId = undefined
      this.countryCode = undefined
      this._refreshToken = undefined
    }
  }

  public get accessToken() {
    return this._accessToken
  }

  public async clearCache() {
    await this.cacheHandler.clearCache()
  }

  public async performDeviceAuthorization() {
    try {
      const res = await this.axios.post<TidalResponses.DeviceAuth.Root>(
        `${AUTH_URL}/device_authorization`,
        new URLSearchParams({
          client_id: API_KEY.clientId,
          scope: 'r_usr+w_usr+w_sub'
        })
      )

      this.deviceCode = res.data.deviceCode
      return res.data.verificationUriComplete
    } catch (e) {
      console.error('Tidal device authorization failed', (e as AxiosError).code, (e as AxiosError).message)
    }
  }

  public async performLogin() {
    try {
      const data = new URLSearchParams({
        client_id: API_KEY.clientId,
        scope: 'r_usr+w_usr+w_sub'
      })

      if (this.refreshToken) {
        data.set('refresh_token', this.refreshToken)
        data.set('grant_type', 'refresh_token')
      } else {
        data.set('device_code', this.deviceCode)
        data.set('grant_type', 'urn:ietf:params:oauth:grant-type:device_code')
      }

      const res = await this.axios.post<TidalResponses.LoginAuth.Root>(`${AUTH_URL}/token`, data, {
        auth: {
          username: API_KEY.clientId,
          password: API_KEY.clientSecret
        }
      })

      this.accessToken = res.data.access_token
      this.countryCode = res.data.user.countryCode
      this.accountId = res.data.user.userId.toString()
      this.refreshToken = res.data.refresh_token

      return {
        refreshToken: res.data.refresh_token,
        accessToken: res.data.access_token,
        countryCode: res.data.user.countryCode,
        username: res.data.user.fullName ?? res.data.user.username
      }
    } catch (e) {
      if ((e as AxiosError).isAxiosError) {
        console.error('Tidal authorization failed', (e as AxiosError).code, (e as AxiosError).response.data)
        if (((e as AxiosError).response.data as any).sub_status === 1002) {
          return 1
        }
      } else {
        console.error('Something went wrong', e)
      }
    }

    return 0
  }

  private async get<T>(path: string, query?: any, customUrl?: string): Promise<T> {
    const cacheId = `${customUrl ?? API_V1}/${path}/${JSON.stringify(query)}`
    const cache = this.cacheHandler.getCache(cacheId)

    if (cache) {
      return JSON.parse(cache) as T
    }

    try {
      const resp = await this.axios.get<T>(`${customUrl ?? API_V1}/${path}`, {
        params: {
          ...query,
          countryCode: this.countryCode,
          locale: 'en_US',
          deviceType: 'BROWSER'
        },
        headers: {
          authorization: `Bearer ${this.accessToken}`,
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36'
        }
      })

      this.cacheHandler.addToCache(cacheId, JSON.stringify(resp.data))

      console.log(resp.request.res.responseUrl)

      return resp.data
    } catch (e) {
      console.error(
        'Failed to fetch from Tidal API',
        (customUrl ?? API_V1) + '/' + path,
        query,
        (e as AxiosError).code,
        (e as AxiosError).response?.data
      )
    }
  }

  private async getFavoriteTracks() {
    const resp = await this.get<TidalResponses.PlaylistItems.Root>(`users/${this.accountId}/favorites/tracks`)
    return this.parser.parseTracks(...resp.items.map((val) => val.item))
  }

  public async getPlaylists(): Promise<Playlist[]> {
    const resp = await this.get<TidalResponses.Playlists.Root>(
      'my-collection/playlists/folders',
      {
        folderId: 'root',
        offset: 0,
        limit: 50,
        order: 'DATE',
        orderDirection: 'DESC',
        includeOnly: 'PLAYLIST'
      },
      API_V2
    )

    return [
      ...this.parser.parsePlaylists(...resp.items.map((val) => val.data)),
      {
        playlist_id: 'favorite',
        playlist_name: 'Favorite Tracks',
        playlist_song_count: 0,
        playlist_coverPath: resolve(__dirname, '../assets/favorite.svg')
      }
    ]
  }

  public async getPlaylistItems(playlistID: string) {
    if (playlistID === 'favorite') {
      return await this.getFavoriteTracks()
    } else {
      const resp = await this.get<TidalResponses.PlaylistItems.Root>(`playlists/${playlistID}/items`, {
        offset: 0,
        limit: 50
      })

      return this.parser.parseTracks(...resp.items.map((val) => val.item))
    }
  }

  public async getStreamURL(songId: string, quality: string) {
    const resp = await this.get<TidalResponses.StreamDetails.Root>(`tracks/${songId}/playbackinfopostpaywall`, {
      audioquality: quality,
      playbackmode: 'STREAM',
      assetpresentation: 'FULL'
    })

    const decoded = Buffer.from(resp.manifest, 'base64').toString('utf-8')
    return decoded
  }

  private matchTidalHostname(url: URL) {
    return url.hostname === 'tidal.com' || url.hostname === 'listen.tidal.com'
  }

  public async getTrackIfValid(url: string) {
    try {
      const parsed = new URL(url)
      //https://tidal.com/browse/track/34156240
      if (this.matchTidalHostname(parsed) && parsed.pathname.includes('/track/')) {
        const trackId = parsed.pathname.substring(parsed.pathname.lastIndexOf('/') + 1)
        const song = await this.getTrack(trackId)
        return song
      }
    } catch (e) {
      console.debug('Invalid URL', url, (e as Error).name)
    }
  }

  public async getPlaylistIfValid(url: string) {
    try {
      const parsed = new URL(url)
      //https://tidal.com/browse/playlist/48fb1098-5be4-4570-b95b-91c8f9bf4814
      //https://listen.tidal.com/playlist/48fb1098-5be4-4570-b95b-91c8f9bf4814
      if (this.matchTidalHostname(parsed) && parsed.pathname.includes('/playlist/')) {
        const playlistId = parsed.pathname.substring(parsed.pathname.lastIndexOf('/') + 1)
        const resp = await this.getPlaylist(playlistId)
        return resp
      }
    } catch (e) {
      console.debug('Invalid URL', url, (e as Error).name)
    }
  }

  public async getLyrics(id: string) {
    const resp = await this.get<TidalResponses.Lyrics.Root>(`tracks/${id}/lyrics`, {}, LISTEN_TIDAL)
    return resp.lyrics
  }

  private async getTrack(id: number | string) {
    const resp = await this.get<TidalResponses.SingleTrack.Root>('tracks/' + id.toString())

    return this.parser.parseTracks(resp)[0]
  }

  private async getPlaylist(id: string) {
    const resp = await this.get<TidalResponses.Playlists.Data>('playlists/' + id)
    const playlist = this.parser.parsePlaylists(resp)[0]

    if (playlist) {
      const songs = await this.getPlaylistItems(id)
      return { playlist, songs }
    }
  }

  public async search(term: string) {
    const resp = await this.get<TidalResponses.SearchResults.Root>('search', {
      query: term,
      offset: 0,
      limit: 50,
      types: ['TRACKS', 'ARTISTS', 'ALBUMS', 'PLAYLIST']
    })

    const songs = this.parser.parseTracks(...resp.tracks.items)
    const artists = this.parser.parseArtists(...resp.artists.items)
    const playlists = this.parser.parsePlaylists(...resp.playlists.items)
    const albums = this.parser.parseAlbums(...resp.albums.items)
    return { songs, artists, playlists, albums }
  }

  public async getRecommendations() {
    const songList: Song[] = []

    const songs = await api.getSongs({ song: { extension: 'moosync.tidal' } })
    for (const s of songs) {
      const recommendations = await this.get<TidalResponses.Recommendations.Root>(
        `tracks/${s._id.replace('moosync.tidal:', '')}/recommendations`,
        {
          limit: 20,
          offset: 0
        }
      )
      songList.push(...this.parser.parseTracks(...recommendations.items.map((val) => val.track)))
    }

    const data = await this.get<TidalResponses.Pages.Root>('pages/staff_picks', {}, LISTEN_TIDAL)
    const filteredModules = data.rows.filter(
      (val) => val.modules.filter((val2) => val2.type === 'TRACK_LIST').length > 0
    )

    for (const moduleList of filteredModules) {
      for (const module of moduleList.modules) {
        if (module.showMore) {
          const fetch = await this.get<TidalResponses.Pages.Root>(module.showMore.apiPath, {}, LISTEN_TIDAL)
          const tracks = fetch.rows[0].modules[0].pagedList.items
          songList.push(...this.parser.parseTracks(...tracks))
        }
      }
    }

    return songList
  }

  public async searchArtists(term: string) {
    const resp = await this.get<TidalResponses.SearchResults.Root>('search', {
      query: term,
      offset: 0,
      limit: 50,
      types: ['ARTISTS']
    })

    return this.parser.parseArtists(...resp.artists.items)
  }

  public async getArtistSongs(artistId: string) {
    const resp = await this.get<TidalResponses.ArtistSongs.Root>(
      'pages/data/25b47120-6a2f-4dbb-8a38-daa415367d22',
      {
        artistId,
        limit: 50,
        offset: 0
      },
      LISTEN_TIDAL
    )

    return this.parser.parseTracks(...resp.items)
  }
}
