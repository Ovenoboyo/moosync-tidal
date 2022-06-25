import { Album, Artists, Playlist, Song } from '@moosync/moosync-types'

const RESOURCE_URL = 'https://resources.tidal.com/images'
const PACKAGE_NAME = 'moosync.tidal'

export class APIParser {
  public parsePlaylists(...items: TidalResponses.Playlists.Data[]): Playlist[] {
    const playlists: Playlist[] = []
    for (const i of items) {
      if (i) {
        playlists.push({
          playlist_id: i.uuid.toString(),
          playlist_name: i.title,
          playlist_coverPath: this.getCover(i.squareImage),
          playlist_desc: i.description
        })
      }
    }

    return playlists
  }

  private getCover(id?: string) {
    if (id) return `${RESOURCE_URL}/${id.replace(new RegExp('-', 'g'), '/')}/750x750.jpg`
  }

  public parseTracks(...items: TidalResponses.SingleTrack.Root[]) {
    const songs: Song[] = []

    for (const i of items) {
      if (i) {
        songs.push({
          _id: i.id.toString(),
          title: i.title,
          date_added: new Date(i.dateAdded ?? Date.now()).getTime(),
          duration: i.duration,
          song_coverPath_high: this.getCover(i.album.cover),
          song_coverPath_low: this.getCover(i.album.cover),
          artists: this.parseArtists(...i.artists),
          album: this.parseAlbums(i.album)[0],
          type: 'DASH',
          playbackUrl: `extension://${PACKAGE_NAME}/${i.id}?quality=LOSSLESS`
        })
      }
    }

    return songs
  }

  public parseArtists(...artists: TidalResponses.SearchResults.Artists[]) {
    const ret: Artists[] = []
    for (const a of artists) {
      if (a) {
        ret.push({
          artist_id: a.id.toString(),
          artist_name: a.name,
          artist_coverPath: this.getCover(a.picture),
          artist_extra_info: {
            extensions: {
              [api.packageName]: {
                artist_id: a.id.toString()
              }
            }
          }
        })
      }
    }

    return ret
  }

  public parseAlbums(...albums: TidalResponses.SearchResults.Albums[]) {
    const ret: Album[] = []

    for (const a of albums) {
      if (a) {
        ret.push({
          album_id: a.id.toString(),
          album_name: a.title,
          album_artist: a.artists?.name,
          album_coverPath_high: this.getCover(a.cover),
          album_coverPath_low: this.getCover(a.cover)
        })
      }
    }

    return ret
  }
}
