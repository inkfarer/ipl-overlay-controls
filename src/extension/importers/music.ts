// @ts-ignore: TODO: No type defs available, could be written on fork
import { LastFmNode } from 'lastfm';
import clone from 'clone';
import * as nodecgContext from '../util/nodecg';
import { LastFmNowPlaying, LastFmSettings, ManualNowPlaying, NowPlaying, NowPlayingSource } from 'schemas';
import { ReplicantServer } from 'nodecg/lib/replicant';
const nodecg = nodecgContext.get();

handleLastFm();
handleNowPlayingSource();

function handleNowPlayingSource() {
    const lastFmNowPlaying = nodecg.Replicant<LastFmNowPlaying>('lastFmNowPlaying');
    const manualNowPlaying = nodecg.Replicant<ManualNowPlaying>('manualNowPlaying');
    const nowPlayingSource = nodecg.Replicant<NowPlayingSource>('nowPlayingSource');
    const nowPlaying = nodecg.Replicant<NowPlaying>('nowPlaying');

    const replicantToSource: {[key: string]: ReplicantServer<unknown>} = {
        lastfm: lastFmNowPlaying,
        manual: manualNowPlaying
    };

    nowPlayingSource.on('change', newValue => {
        switch (newValue) {
            case 'manual':
                nowPlaying.value = clone(manualNowPlaying.value);
                break;
            case 'lastfm':
                nowPlaying.value = clone(lastFmNowPlaying.value);
                break;
            default:
                throw new Error('Invalid value for nowPlayingSource.');
        }
    });

    for (const [key, value] of Object.entries(replicantToSource)) {
        value.on('change', newValue => {
            if (nowPlayingSource.value === key) {
                nowPlaying.value = clone(newValue);
            }
        });
    }
}

function handleLastFm() {
    if (!nodecg.bundleConfig || typeof nodecg.bundleConfig.lastfm === 'undefined') {
        nodecg.log.warn(
            `"lastfm" is not defined in cfg/${nodecg.bundleName}.json! `
            + 'Getting music information automatically will not function.'
        );
        return;
    }

    const lastfm = new LastFmNode({
        // eslint-disable-next-line camelcase
        api_key: nodecg.bundleConfig.lastfm.apiKey,
        secret: nodecg.bundleConfig.lastfm.secret
    });

    const nowPlaying = nodecg.Replicant('lastFmNowPlaying', {
        persistent: false
    });

    const lastFmSettings = nodecg.Replicant<LastFmSettings>('lastFmSettings');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let trackStream: any;

    lastFmSettings.on('change', newValue => {
        if (trackStream) {
            trackStream.stop();
        }

        trackStream = lastfm.stream(newValue.username);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        trackStream.on('nowPlaying', (track: any) => {
            nowPlaying.value = {
                artist: track.artist['#text'],
                song: track.name,
                album: track.album['#text'],
                cover: track.image[2]['#text'],
                artistSong: `${track.artist['#text']} - ${track.name}`
            };
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        trackStream.on('error', (e: any) => {
            // Error 6 = "User not found"
            if (e.error === 6) {
                nodecg.log.info(
                    `Last.fm couldn't find user "${newValue.username}" - error message: "${e.message}"`
                );

                trackStream.stop();
            }
        });

        trackStream.start();
    });
}
