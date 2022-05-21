import { MoosyncExtensionTemplate } from '@moosync/moosync-types'

import path from 'path'
import { URL } from 'url'
import { TidalAPI } from './tidalApi'

export class MyExtension implements MoosyncExtensionTemplate {
  private accountId: string = ''

  private deviceDetails: {
    deviceCode?: string
  } = {}

  private authDetails: { refreshToken?: string; accessToken?: string; countryCode?: string }

  private tidalApi: TidalAPI | undefined

  async onStarted() {
    console.info('Tidal extension started')
    await this.fetchPreferences()

    if (this.authDetails.refreshToken) {
      await this.performLogin()
    }

    this.setupListeners()
    this.setupAccount()
  }

  private async fetchPreferences() {
    const deviceCode = await api.getSecure<string>('deviceCode')
    const refreshToken = await api.getSecure<string>('refreshToken')
    const countryCode = await api.getPreferences<string>('countryCode', 'US')

    this.deviceDetails = { deviceCode }
    this.authDetails = { refreshToken, countryCode }

    console.log(this.deviceDetails, this.authDetails)
  }

  private async performLogin() {
    const res = await this.tidalApi.performLogin(this.authDetails.refreshToken, this.deviceDetails.deviceCode)
    console.debug('login response', res)

    if (typeof res !== 'number') {
      if (res.refreshToken) {
        await api.setSecure('refreshToken', res.refreshToken)
      }
      await api.setPreferences('countryCode', res.countryCode)
    } else if (res === 1) {
      api.setSecure('deviceCode', undefined)
      this.deviceDetails = {}
    }
  }

  private async performDeviceAuthorization() {
    return await this.tidalApi.performDeviceAuthorization()
  }

  private async setupAccount() {
    this.accountId = await api.registerAccount(
      'Tidal',
      '#000000',
      path.resolve(__dirname, '../assets/icon.svg'),
      this.loginCallback.bind(this),
      async () => {
        console.log('Logging out of tidal')
        await api.changeAccountAuthStatus(this.accountId, false)
      }
    )
  }

  private async loginCallback() {
    if (!this.deviceDetails.deviceCode) {
      const deviceData = await this.performDeviceAuthorization()
      console.debug('device data:', deviceData)
      if (deviceData) {
        this.deviceDetails = {
          deviceCode: deviceData.deviceCode
        }

        api.setSecure('deviceCode', deviceData.deviceCode)

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
          url: deviceData.verificationUriComplete,
          oauthPath: 'tidal',
          manualClick: true
        })

        const url = deviceData.verificationUriComplete.startsWith('http')
          ? deviceData.verificationUriComplete
          : 'https://' + deviceData.verificationUriComplete
        await api.openExternalURL(url)
      }
    } else {
      await this.performLogin()
    }
  }

  private setupListeners() {
    api.on('requestedPlaylists', async () => {
      const playlists = await this.tidalApi.getPlaylists()
      return { playlists }
    })

    api.on('requestedPlaylistSongs', async (playlist_id) => {
      const songs = await this.tidalApi.getPlaylistItems(playlist_id)
      return { songs }
    })

    api.on('customRequest', async (url) => {
      const parsed = new URL(url)
      const songId = parsed.pathname.substring(1)
      const quality = parsed.searchParams.get('quality')

      const manifest = await this.tidalApi.getStreamURL(songId, quality)

      return { mimeType: 'application/dash+xml', data: Buffer.from(manifest) }
    })
  }
}
