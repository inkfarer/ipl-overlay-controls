import { ScreenshotParserService } from '../ScreenshotParserService';
import sharp from 'sharp';
import * as path from 'node:path';
import { mockNodecg, replicants } from '../../__mocks__/mockNodecg';
import { GameVersion } from 'types/enums/gameVersion';
import { perGameData } from '../../../helpers/gameData/gameData';
import { RuntimeConfig } from 'schemas';

describe('ScreenshotParserService', () => {
    const service = new ScreenshotParserService(mockNodecg);

    beforeEach(() => {
        replicants.runtimeConfig = {
            gameVersion: GameVersion.SPLATOON_3
        };
    });

    describe('sampleTeamColors', () => {
        const colorGroups = perGameData[GameVersion.SPLATOON_3].colors;

        it.each([
            ['darkBlueOrange', 'rankedModes', 'color_darkBlueOrange.webp'],
            ['goldPurple', 'rankedModes', 'color_goldPurple.webp'],
            ['greenPink', 'rankedModes', 'color_greenPink.webp'],
            ['orangeDarkBlue', 'rankedModes', 'color_orangeDarkBlue.webp'],
            ['orangePurple', 'rankedModes', 'color_orangePurple.webp'],
            ['pinkGreen', 'rankedModes', 'color_pinkGreen.webp'],
            ['turquoiseOrange', 'rankedModes', 'color_turquoiseOrange.webp'],
            ['turquoisePink', 'rankedModes', 'color_turquoisePink.webp'],
            ['yellowDarkBlue', 'rankedModes', 'color_yellowDarkBlue.webp'],
            ['yellowPurple', 'rankedModes', 'color_yellowPurple.webp'],
            ['goldPurple', 'rankedModes', 'color_goldPurple_720p.webp'],
            ['pinkGreen', 'rankedModes', 'color_pinkGreen_720p.webp']
        ])('finds color %s in group %s (image: %s)', async (colorKey, groupKey, image) => {
            const img = sharp(path.join(__dirname, `img/${image}`));
            const colorGroup = colorGroups.find(group => group.meta.key === groupKey);
            const color = colorGroup.colors.find(color => color.key === colorKey);

            await expect(service.sampleTeamColors(img)).resolves.toEqual({
                ...color,
                categoryKey: colorGroup.meta.key,
                categoryName: colorGroup.meta.name
            });
        });

        it('throws an error if the game version is incompatible', async () => {
            (replicants.runtimeConfig as RuntimeConfig).gameVersion = GameVersion.SPLATOON_2;
            const img = sharp({
                create: {
                    width: 300,
                    height: 200,
                    channels: 4,
                    background: { r: 255, g: 0, b: 0, alpha: 0.5 }
                }
            });

            await expect(service.sampleTeamColors(img)).rejects
                .toThrow(new Error('translation:screenshotParser.badGameVersion'));
        });

        it('throws an error if no color can be found (input is a solid color)', async () => {
            const img = sharp({
                create: {
                    width: 1280,
                    height: 720,
                    channels: 4,
                    background: { r: 255, g: 0, b: 0, alpha: 1 }
                }
            }).png();

            await expect(service.sampleTeamColors(img)).rejects
                .toThrow(new Error('translation:screenshotParser.noMatchingColors'));
        });

        it('throws an error if no color can be found (input is a mid-game screenshot)', async () => {
            const img = sharp(path.join(__dirname, 'img/color_unknown.webp'));

            await expect(service.sampleTeamColors(img)).rejects
                .toThrow(new Error('translation:screenshotParser.badColorSamples'));
        });

        it('throws an error if no color can be found (input is a screenshot taken too early in the game)', async () => {
            const img = sharp(path.join(__dirname, 'img/color_pregame.webp'));

            await expect(service.sampleTeamColors(img)).rejects
                .toThrow(new Error('translation:screenshotParser.badColorSamples'));
        });
    });
});
