import { MoosyncExtensionTemplate } from "@moosync/moosync-types";
import { PlayerState, Song, SongQueue } from "@moosync/moosync-types/models";

export class MyExtension implements MoosyncExtensionTemplate {
    async onStarted() {
        logger.info('Extension started')
    }

    async onSongChanged(song: Song) {
        console.log(song)
    }

    async onPlayerStateChanged(state: PlayerState) {
        console.log(state)
    }

    async onSongQueueChanged(queue: SongQueue) {
        console.log(queue)
    }

    async onVolumeChanged(volume: number) {
        console.log(volume)
    }

    async onStopped() {
        logger.info('Extension stopped')
    }
}