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
      title?: string
      duration?: number
      replayGain?: number
      peak?: number
      allowStreaming?: boolean
      streamReady?: boolean
      streamStartDate?: string
      premiumStreamingOnly?: boolean
      trackNumber?: number
      volumeNumber?: number
      version?: any
      popularity?: number
      copyright?: string
      url?: string
      isrc?: string
      editable?: boolean
      explicit?: boolean
      audioQuality?: string
      audioModes?: string[]
      artist?: Artist
      artists?: Artist[]
      album?: Album
      mixes?: Mixes
      dateAdded?: string
    }

    interface Artist {
      id: number
      name: string
      type?: string
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
    interface Artists {
      id: number
      name: string
      picture?: string
      popularity?: number
      url?: string
    }

    interface Albums {
      id: number
      allowStreaming?: boolean
      artists?: SingleTrack.Artist
      audioModes?: string[]
      audioQuality?: string
      copyright?: string
      cover?: string
      duration?: number
      explicit?: boolean
      numberOfTracks?: number
      numberOfVideos?: number
      numberOfVolumes?: number
      popularity?: number
      premiumStreamingOnly?: boolean
      releaseDate?: string
      streamReady?: boolean
      streamStartDate?: string
      title: string
      type?: 'ALBUM'
      upc?: string
      url?: string
      version?: number
      vibrantColor?: string
      videoCover?: string
    }

    interface Root {
      tracks: {
        limit: number
        offset: number
        totalNumberOfItems: number
        items: SingleTrack.Root[]
      }
      albums: {
        limit: number
        offset: number
        totalNumberOfItems: number
        items: Albums[]
      }
      artists: {
        limit: number
        offset: number
        totalNumberOfItems: number
        items: Artists[]
      }
      playlists: {
        limit: number
        offset: number
        totalNumberOfItems: number
        items: Playlists.Data[]
      }
      topHit: {
        value: SingleTrack.Root
        type: 'TRACKS' | string
      }
    }
  }

  namespace Pages {
    interface Root {
      selfLink: any
      id: string
      title: string
      rows: Row[]
    }

    interface Row {
      modules: Module[]
    }

    interface Module {
      id: string
      type: string
      width: number
      title: string
      description: string
      preTitle?: string
      showMore?: ShowMore
      supportsPaging: boolean
      quickPlay: boolean
      layout: any
      playlistStyle?: string
      highlights?: Highlight[]
      scroll?: string
      listFormat?: string
      pagedList?: PagedList
      showTableHeaders?: boolean
      header?: Header
    }

    interface ShowMore {
      title: string
      apiPath: string
    }

    interface Highlight {
      title: string
      item: Item
    }

    interface Item {
      type: string
      item: Item2
    }

    interface Item2 {
      uuid?: string
      title: string
      type?: string
      url?: string
      image?: string
      squareImage?: string
      duration?: number
      numberOfTracks?: number
      numberOfVideos?: number
      lastItemAddedAt?: string
      promotedArtists?: PromotedArtist[]
      creators?: any[]
      description?: string
      id: any
      subTitle?: string
      graphic?: Graphic
      images?: Images
      sharingImages: any
      mixType?: string
      contentBehavior?: string
      shortSubtitle?: string
      cover?: string
      vibrantColor?: string
      videoCover: any
      artists?: Artist[]
      explicit?: boolean
      streamReady?: boolean
      streamStartDate?: string
      allowStreaming?: boolean
      audioQuality?: string
      audioModes?: string[]
      releaseDate?: string
      version: any
      album?: Album
      volumeNumber?: number
      trackNumber?: number
      popularity?: number
      editable?: boolean
      replayGain?: number
      mixes?: Mixes
    }

    interface PromotedArtist {
      id: number
      name: string
      type: string
      picture: any
    }

    interface Graphic {
      type: string
      text: string
      images: Image[]
    }

    interface Image {
      id: string
      vibrantColor: string
      type: string
    }

    interface Images {
      SMALL: Small
      MEDIUM: Medium
      LARGE: Large
    }

    interface Small {
      width: number
      height: number
      url: string
    }

    interface Medium {
      width: number
      height: number
      url: string
    }

    interface Large {
      width: number
      height: number
      url: string
    }

    interface Artist {
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
      url: string
      releaseDate: string
    }

    interface Mixes {
      TRACK_MIX: string
    }

    interface PagedList {
      limit: number
      offset: number
      totalNumberOfItems: number
      items: Item3[]
      dataApiPath: string
    }

    interface Item3 {
      id: any
      title: string
      subTitle?: string
      graphic?: Graphic
      images?: Images
      sharingImages: any
      mixType?: string
      contentBehavior?: string
      shortSubtitle?: string
      cover?: string
      vibrantColor?: string
      videoCover?: string
      url?: string
      artists?: Artist[]
      explicit?: boolean
      streamReady?: boolean
      streamStartDate?: string
      allowStreaming?: boolean
      numberOfTracks?: number
      numberOfVideos?: number
      audioQuality?: string
      audioModes?: string[]
      releaseDate?: string
      duration: number
      uuid?: string
      type?: string
      image?: string
      squareImage?: string
      lastItemAddedAt?: string
      promotedArtists?: PromotedArtist[]
      creators?: Creator[]
      description?: string
      version: any
      album?: Album
      volumeNumber?: number
      trackNumber?: number
      popularity?: number
      editable?: boolean
      replayGain?: number
      mixes?: Mixes
    }

    interface Creator {
      id: number
      name: string
    }

    interface Header {
      type: string
      item: Item4
    }

    interface Item4 {
      id: number
      title: string
      cover: string
      vibrantColor: string
      videoCover: any
      url: string
      artists: Artist3[]
      explicit: boolean
      streamReady: boolean
      streamStartDate: string
      allowStreaming: boolean
      numberOfTracks: number
      numberOfVideos: number
      audioQuality: string
      audioModes: string[]
      releaseDate: string
      duration: number
    }

    interface Artist3 {
      id: number
      name: string
      type: string
      picture: string
    }
  }

  namespace Recommendations {
    interface Root {
      limit: number
      offset: number
      totalNumberOfItems: number
      items: Item[]
    }

    interface Item {
      track: SingleTrack.Root
      sources: string[]
    }

    interface Artist {
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

    interface Mixes {
      TRACK_MIX: string
      MASTER_TRACK_MIX?: string
    }
  }

  namespace Lyrics {
    interface Root {
      lyrics: string
    }
  }

  namespace ArtistSongs {
    interface Root {
      limit: number
      offset: number
      totalNumberOfItems: number
      items: SingleTrack.Root[]
    }
  }
}
