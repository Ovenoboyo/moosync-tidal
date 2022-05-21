import axios, { AxiosError } from 'axios'
import adapter from 'axios/lib/adapters/http'
import { APIParser } from './apiParser'
import { URLSearchParams } from 'url'

const API_V2 = 'https://api.tidal.com/v2'
const API_V1 = 'https://api.tidalhifi.com/v1'
const AUTH_URL = 'https://auth.tidal.com/v1/oauth2'
const API_KEY = { clientId: '7m7Ap0JC9j1cOM3n', clientSecret: 'vRAdA108tlvkJpTsGZS8rGZ7xTlbJ0qaZ2K9saEzsgY=' }

export class TidalAPI {
  private axios = axios.create({ adapter })

  private countryCode: string
  private accessToken: string

  private parser = new APIParser()

  constructor(accessToken: string, countryCode: string) {
    this.countryCode = countryCode
    this.accessToken = accessToken
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
      return res.data
    } catch (e) {
      console.error('Tidal device authorization failed', (e as AxiosError).code, (e as AxiosError).message)
    }
  }

  public async performLogin(refreshToken?: string, deviceCode?: string) {
    try {
      const data = new URLSearchParams({
        client_id: API_KEY.clientId,
        scope: 'r_usr+w_usr+w_sub'
      })

      if (refreshToken) {
        data.set('refresh_token', refreshToken)
        data.set('grant_type', 'refresh_token')
      } else {
        data.set('device_code', deviceCode)
        data.set('grant_type', 'urn:ietf:params:oauth:grant-type:device_code')
      }

      const res = await this.axios.post<TidalResponses.LoginAuth.Root>(`${AUTH_URL}/token`, data, {
        auth: {
          username: API_KEY.clientId,
          password: API_KEY.clientSecret
        }
      })

      return {
        refreshToken: res.data.refresh_token,
        accessToken: res.data.access_token,
        countryCode: res.data.user.countryCode
      }
    } catch (e) {
      console.error('Tidal authorization failed', (e as AxiosError).code, (e as AxiosError).response.data)
      if (((e as AxiosError).response.data as any).sub_status === 1002) {
        return 1
      }
    }

    return 0
  }

  private async get<T>(path: string, query?: any): Promise<T> {
    try {
      const resp = await this.axios.get<T>(`${API_V1}/${path}`, {
        params: {
          ...query,
          countryCode: this.countryCode,
          locale: 'en_US',
          deviceType: 'BROWSER'
        },
        headers: {
          authorization: `Bearer ${this.accessToken}`
        }
      })

      return resp.data
    } catch (e) {
      console.error(
        'Failed to fetch from Tidal API',
        path,
        query,
        (e as AxiosError).code,
        (e as AxiosError).response?.data
      )
    }
  }

  private async getV2<T>(path: string, query?: any): Promise<T> {
    try {
      const resp = await this.axios.get<T>(`${API_V2}/${path}`, {
        params: {
          ...query,
          countryCode: this.countryCode,
          locale: 'en_US',
          deviceType: 'BROWSER'
        },
        headers: {
          authorization: `Bearer ${this.accessToken}`
        }
      })

      return resp.data
    } catch (e) {
      console.error(
        'Failed to fetch from Tidal API',
        path,
        query,
        (e as AxiosError).code,
        (e as AxiosError).response?.data
      )
    }
  }

  public async getPlaylists() {
    const resp = await this.getV2<TidalResponses.Playlists.Root>('my-collection/playlists/folders', {
      folderId: 'root',
      offset: 0,
      limit: 50,
      order: 'DATE',
      orderDirection: 'DESC',
      includeOnly: 'PLAYLIST'
    })

    return this.parser.parsePlaylists(resp.items)
  }

  public async getPlaylistItems(playlistID: string) {
    const resp = await this.get<TidalResponses.PlaylistItems.Root>(`playlists/${playlistID}/items`, {
      offset: 0,
      limit: 50
    })

    return this.parser.parsePlaylistItems(resp.items)
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
}
