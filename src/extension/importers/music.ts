// @ts-ignore: TODO: No type defs available, could be written on fork
import { LastFmNode } from 'lastfm';
import clone from 'clone';
import * as nodecgContext from '../helpers/nodecg';
import { LastFmNowPlaying, LastFmSettings, ManualNowPlaying, NowPlaying, NowPlayingSource } from 'schemas';
import isEmpty from 'lodash/isEmpty';
import type NodeCG from '@nodecg/types';

const nodecg = nodecgContext.get();
const lastFmNowPlaying = nodecg.Replicant<LastFmNowPlaying>('lastFmNowPlaying');
const manualNowPlaying = nodecg.Replicant<ManualNowPlaying>('manualNowPlaying');
const nowPlayingSource = nodecg.Replicant<NowPlayingSource>('nowPlayingSource');
const nowPlaying = nodecg.Replicant<NowPlaying>('nowPlaying');

handleLastFm();
handleNowPlayingSource();

function handleNowPlayingSource() {
    const replicantToSource: {[key: string]: NodeCG.ServerReplicant<unknown>} = {
        lastfm: lastFmNowPlaying,
        manual: manualNowPlaying
    };

    nowPlayingSource.on('change', newValue => {
        switch (newValue) {
            case 'manual':
            case 'lastfm':
                nowPlaying.value = clone(replicantToSource[newValue].value) as NowPlaying;
                break;
            default:
                throw new Error('Invalid value for nowPlayingSource.');
        }
    });

    for (const [key, value] of Object.entries(replicantToSource)) {
        value.on('change', newValue => {
            if (nowPlayingSource.value === key) {
                nowPlaying.value = clone(newValue) as NowPlaying;
            }
        });
    }
}

function handleLastFm() {
    const lastfm = new LastFmNode({
        // eslint-disable-next-line camelcase
        api_key: nodecg.bundleConfig.lastfm.apiKey,
        secret: nodecg.bundleConfig.lastfm.secret
    });

    const lastFmSettings = nodecg.Replicant<LastFmSettings>('lastFmSettings');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let trackStream: any;

    lastFmSettings.on('change', newValue => {
        if (isEmpty(nodecg.bundleConfig) || isEmpty(nodecg.bundleConfig.lastfm)
            || isEmpty(nodecg.bundleConfig.lastfm.apiKey) || isEmpty(nodecg.bundleConfig.lastfm.secret)) {
            nodecg.log.warn(
                `"lastfm" configuration is missing in cfg/${nodecg.bundleName}.json! `
                + 'Getting music information from last.fm automatically will not function.'
            );
            return;
        } else if (isEmpty(newValue.username)) {
            return;
        }

        if (trackStream) {
            trackStream.stop();
        }

        trackStream = lastfm.stream(newValue.username);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        trackStream.on('nowPlaying', (track: any) => {
            lastFmNowPlaying.value = {
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
