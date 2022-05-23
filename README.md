# Tidal integration for Moosync

This extension provides the following features for Tidal
- User playlists
- Favorite tracks
- Lyrics
- Add song from URL
- Add playlist from URL
- Search songs
- Song recommendations

If you're looking for tidal API wrapper, look in [src/tidalApi.ts](./src/tidalApi.ts)

## Creating the extension

To generate the output of webpack

``` bash
yarn webpack:build
```

To Build and pack the extension for Moosync using [Moosync packer](https://github.com/Moosync/extension-packer)

``` bash
yarn build
```
