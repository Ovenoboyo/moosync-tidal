import { Playlist, Song } from '@moosync/moosync-types'

const RESOURCE_URL = 'https://resources.tidal.com/images'
const PACKAGE_NAME = 'moosync.tidal'

export class APIParser {
  public parsePlaylists(items: TidalResponses.Playlists.Item[]): Playlist[] {
    const playlists: Playlist[] = []
    for (const i of items) {
      playlists.push(this.parsePlaylist(i.data))
    }

    return playlists
  }

  public parsePlaylist(item?: TidalResponses.Playlists.Data) {
    if (item) {
      return {
        playlist_id: item.uuid,
        playlist_name: item.title,
        playlist_coverPath: this.getCover(item.squareImage),
        playlist_desc: item.description
      }
    }
  }

  private getCover(id: string) {
    return `${RESOURCE_URL}/${id.replace(new RegExp('-', 'g'), '/')}/750x750.jpg`
  }

  public parsePlaylistItems(items: TidalResponses.SingleTrack.Root[]) {
    const songs: Song[] = []

    for (const i of items) {
      songs.push(this.parseSingleTrack(i))
    }

    return songs
  }

  public parseSingleTrack(item?: TidalResponses.SingleTrack.Root): Song {
    if (item) {
      return {
        _id: item.id.toString(),
        title: item.title,
        date_added: new Date(item.dateAdded ?? Date.now()).getTime(),
        duration: item.duration,
        song_coverPath_high: this.getCover(item.album.cover),
        artists: item.artists.map((val) => ({
          artist_id: val.id.toString(),
          artist_name: val.name,
          artist_coverPath: val.picture
        })),
        album: {
          album_id: item.album.id.toString(),
          album_name: item.album.title,
          album_coverPath_high: this.getCover(item.album.cover)
        },
        type: 'DASH',
        playbackUrl: `extension://${PACKAGE_NAME}/${item.id}?quality=LOSSLESS`
      }
    }
  }
}
