import sharp from 'sharp';
import Color from 'colorjs.io';
import mean from 'lodash/mean';
import type NodeCG from '@nodecg/types';
import { Configschema, RuntimeConfig } from 'schemas';
import { GameVersion } from 'types/enums/gameVersion';
import i18next from 'i18next';
import { ColorWithCategory } from 'types/messages/activeRound';
import { perGameData } from '../../helpers/gameData/gameData';
import cloneDeep from 'lodash/cloneDeep';

export class ScreenshotParserService {
    private readonly nodecg: NodeCG.ServerAPI<Configschema>;
    private runtimeConfig: NodeCG.ServerReplicant<RuntimeConfig>;
    private readonly saveBadScreenshotsToDisk: boolean;

    constructor(nodecg: NodeCG.ServerAPI<Configschema>) {
        this.nodecg = nodecg;
        this.runtimeConfig = nodecg.Replicant('runtimeConfig');
        this.saveBadScreenshotsToDisk = nodecg.bundleConfig.screenshotParser?.saveBadScreenshotsToDisk ?? false;
    }

    async sampleTeamColors(screenshot: sharp.Sharp): Promise<ColorWithCategory | null> {
        if (this.runtimeConfig.value.gameVersion !== GameVersion.SPLATOON_3) {
            throw new Error(i18next.t(
                'screenshotParser.badGameVersion',
                { gameVersion: this.runtimeConfig.value.gameVersion }));
        }

        screenshot.resize({
            width: 1920,
            height: 1080
        });

        try {
            return this.findClosestTeamColor([
                await this.samplePoints(screenshot, [
                    { top: 29, left: 567 },
                    { top: 29, left: 655 },
                    { top: 29, left: 744 },
                    { top: 29, left: 833 },
                    { top: 104, left: 544 },
                    { top: 104, left: 632 },
                    { top: 104, left: 720 },
                    { top: 104, left: 809 }
                ]),
                await this.samplePoints(screenshot, [
                    { top: 29, left: 1084 },
                    { top: 29, left: 1172 },
                    { top: 29, left: 1261 },
                    { top: 29, left: 1349 },
                    { top: 104, left: 1060 },
                    { top: 104, left: 1148 },
                    { top: 104, left: 1236 },
                    { top: 104, left: 1324 }
                ])
            ]);
        } catch (e) {
            if (this.saveBadScreenshotsToDisk) {
                await this.writeToDisk(screenshot);
            }

            throw e;
        }
    }

    private findClosestTeamColor(colors: [Color, Color]): ColorWithCategory | null {
        const SAFE_COLOR_DELTA_E = 10;
        const gameColors = cloneDeep(perGameData[this.runtimeConfig.value.gameVersion].colors)
            .filter(group => !group.meta.key.toLowerCase().includes('colorlock'))
            .flatMap(group => group.colors.map(color => ({
                ...color,
                categoryName: group.meta.name,
                categoryKey: group.meta.key
            })))
            .filter(color => !color.isCustom)
            .map(color => {
                // Bail out as early as possible to quickly rule out completely different colors
                const clrADelta = new Color(color.referenceClrA ?? color.clrA).deltaE2000(colors[0]);
                if (clrADelta > SAFE_COLOR_DELTA_E) return null;
                const clrBDelta = new Color(color.referenceClrB ?? color.clrB).deltaE2000(colors[1]);
                if (clrBDelta > SAFE_COLOR_DELTA_E) return null;

                return ({
                    ...color,
                    clrADelta,
                    clrBDelta
                });
            })
            .filter(Boolean);

        if (gameColors.length === 0) {
            throw new Error(i18next.t('screenshotParser.noMatchingColors'));
        }

        gameColors.sort((a, b) => ((a.clrADelta + a.clrBDelta) / 2) - ((b.clrADelta + b.clrBDelta) / 2));
        const closestColor = gameColors[0];

        return {
            index: closestColor.index,
            title: closestColor.title,
            key: closestColor.key,
            clrA: closestColor.clrA,
            clrB: closestColor.clrB,
            referenceClrA: closestColor.referenceClrA,
            referenceClrB: closestColor.referenceClrB,
            clrNeutral: closestColor.clrNeutral,
            isCustom: closestColor.isCustom,
            categoryKey: closestColor.categoryKey,
            categoryName: closestColor.categoryName
        };
    }

    private async samplePoints(image: sharp.Sharp, points: { left: number, top: number }[]): Promise<Color> {
        const SAFE_MEAN_DELTA_E = 15;
        const samples = await Promise.all(points.map(point => this.samplePoint(image, point.left, point.top)));

        // If a sample's mean deltaE is too high, we discard it
        const filteredSamples = samples.filter(sample => {
            const deltas = samples.map(otherSample => sample.deltaE2000(otherSample));
            return mean(deltas) < SAFE_MEAN_DELTA_E;
        });

        if (filteredSamples.length === 0) {
            throw new Error(i18next.t('screenshotParser.badColorSamples'));
        }

        return this.mixMultiple(filteredSamples);
    }

    private mixMultiple(colors: Color[]): Color {
        if (colors.length === 0) {
            return new Color('srgb', [NaN, NaN, NaN], 0);
        }

        let result = colors[0];

        for (let i = 1; i < colors.length; i++) {
            result = result.mix(colors[i], 0.5);
        }

        return result;
    }

    private async samplePoint(screenshot: sharp.Sharp, left: number, top: number): Promise<Color> {
        const sample = await screenshot
            .clone()
            .extract({
                left,
                top,
                width: 4,
                height: 4
            })
            .toBuffer();
        const stats = await sharp(sample).stats();
        const dominant = stats.dominant;

        return new Color('srgb', [
            dominant.r / 255,
            dominant.g / 255,
            dominant.b / 255
        ]);
    }

    private async writeToDisk(screenshot: sharp.Sharp): Promise<void> {
        await screenshot.toFile(`./bundles/${this.nodecg.bundleName}/iploc-failed-color-parse-${+new Date()}.png`);
    }
}
