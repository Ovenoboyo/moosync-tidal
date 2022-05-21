import { Playlist, Song } from '@moosync/moosync-types'

const RESOURCE_URL = 'https://resources.tidal.com/images'
const PACKAGE_NAME = 'moosync.tidal'

export class APIParser {
  public parsePlaylists(items: TidalResponses.Playlists.Item[]): Playlist[] {
    const playlists: Playlist[] = []
    for (const i of items) {
      playlists.push({
        playlist_id: i.data.uuid,
        playlist_name: i.data.title,
        playlist_coverPath: this.getCover(i.data.squareImage),
        playlist_desc: i.data.description
      })
    }

    return playlists
  }

  private getCover(id: string) {
    return `${RESOURCE_URL}/${id.replace(new RegExp('-', 'g'), '/')}/750x750.jpg`
  }

  public parsePlaylistItems(items: TidalResponses.PlaylistItems.Item[]) {
    const songs: Song[] = []

    for (const i of items) {
      songs.push({
        _id: i.item.id.toString(),
        title: i.item.title,
        date_added: new Date(i.item.dateAdded).getTime(),
        duration: i.item.duration,
        artists: i.item.artists.map((val) => ({
          artist_id: val.id.toString(),
          artist_name: val.name,
          artist_coverPath: val.picture
        })),
        album: {
          album_id: i.item.album.id.toString(),
          album_name: i.item.album.title,
          album_coverPath_high: this.getCover(i.item.album.cover)
        },
        type: 'DASH',
        playbackUrl: `extension://${PACKAGE_NAME}/${i.item.id}?quality=${i.item.audioQuality}`
      })
    }

    return songs
  }
}
