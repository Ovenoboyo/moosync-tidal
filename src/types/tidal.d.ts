declare namespace TidalResponses {
  namespace Playlists {
    interface Root {
      lastModifiedAt: string
      items: Item[]
      totalNumberOfItems: number
      cursor: any
    }

    interface Item {
      trn: string
      itemType: string
      addedAt: string
      lastModifiedAt: string
      name: string
      parent: any
      data: Data
    }

    interface Data {
      uuid: string
      type: string
      creator: Creator
      contentBehavior: string
      title: string
      description: string
      image: string
      squareImage: string
      url: string
      created: string
      lastUpdated: string
      lastItemAddedAt: string
      duration: number
      numberOfTracks: number
      numberOfVideos: number
      promotedArtists: any[]
      trn: string
      itemType: string
    }

    interface Creator {
      id: number
      name: any
      picture: any
      type: string
    }
  }

  namespace PlaylistItems {
    interface Root {
      limit: number
      offset: number
      totalNumberOfItems: number
      items: Item[]
    }

    interface Item {
      item: SingleTrack.Root
      type: string
      cut: any
    }
  }

  namespace StreamDetails {
    interface Root {
      trackId: number
      assetPresentation: string
      audioMode: 'STEREO'
      audioQuality: 'LOSSLESS'
      manifestMimeType: 'application/dash+xml'
      manifestHash: string
      manifest: string
    }
  }

  namespace DeviceAuth {
    interface Root {
      deviceCode: string
      userCode: string
      verificationUri: string
      verificationUriComplete: string
      expiresIn: number
      interval: number
    }
  }

  namespace LoginAuth {
    interface Root {
      access_token: string
      refresh_token: string
      expires_in: number
      user: {
        userId: number
        countryCode: string
        username: string
        fullName?: string
      }
    }
  }

  namespace SingleTrack {
    interface Root {
      id: number
      title: string
      duration: number
      replayGain: number
      peak: number
      allowStreaming: boolean
      streamReady: boolean
      streamStartDate: string
      premiumStreamingOnly: boolean
      trackNumber: number
      volumeNumber: number
      version: any
      popularity: number
      copyright: string
      url: string
      isrc: string
      editable: boolean
      explicit: boolean
      audioQuality: string
      audioModes: string[]
      artist: Artist
      artists: Artist2[]
      album: Album
      mixes: Mixes
      dateAdded?: string
    }

    interface Artist {
      id: number
      name: string
      type: string
      picture: string
    }

    interface Artist2 {
      id: number
      name: string
      type: string
      picture?: string
    }

    interface Album {
      id: number
      title: string
      cover: string
      vibrantColor: string
      videoCover: any
    }

    interface Mixes {}
  }

  namespace SearchResults {
    interface Root {
      tracks: {
        limit: number
        offset: number
        totalNumberOfItems: number
        items: SingleTrack.Root[]
      }
      topHit: {
        value: SingleTrack.Root
        type: 'TRACKS' | string
      }
    }
  }
}