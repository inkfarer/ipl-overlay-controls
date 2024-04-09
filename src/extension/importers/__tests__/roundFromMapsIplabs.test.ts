import { mock } from 'jest-mock-extended';
import type * as GenerateId from '../../../helpers/generateId';
const mockGenerateId = mock<typeof GenerateId>();
jest.mock('../../../helpers/generateId', () => mockGenerateId);

import { importFromMapsIplabs } from '../roundFromMapsIplabs';
import { PlayType } from 'types/enums/playType';
import { Splatoon3Stages } from '../../../helpers/gameData/splatoon3Data';

describe('roundFromMapsIplabs', () => {
    describe('importFromMapsIplabs', () => {
        it('parses a v1 url', () => {
            mockGenerateId.generateId
                .mockReturnValueOnce('first id')
                .mockReturnValueOnce('second id');

            expect(importFromMapsIplabs('https://maps.iplabs.ink/?c=.Pool!(\'szC0*I%2C3%2C4%2C5%2C6%2C7%2C8%2C9*0*1*2*3*4*5*6*7*8*9I0I1%5D~tcC0*F~rJdsCB1DbestOfG0-tcHtest%20arbitrary%20stage%20input\'-szHeeltail%20alley\'-gc\')F%2CBTwoDLAllG14-sz\')EEFF*%2C1-~modK.(\'mapB(\'namKRJd%20C!%5BD\'~LStylKE~cJterpick\'F%5D)G\'~gamesC.!H\')%2C.!\'I%2C2JounKe!\'Lplay%01LKJIHGFEDCB.-*_&v=1'))
                .toEqual({
                    'first id': {
                        meta: {
                            name: 'Round 1',
                            isCompleted: false,
                            type: PlayType.BEST_OF
                        },
                        games: [
                            { mode: 'Tower Control', stage: 'Scorch Gorge' },
                            { mode: 'Splat Zones', stage: 'Unknown Stage' },
                            { mode: 'Unknown Mode', stage: 'Eeltail Alley' }
                        ]
                    },
                    'second id': {
                        meta: {
                            name: 'Round Two',
                            isCompleted: false,
                            type: PlayType.PLAY_ALL
                        },
                        games: [
                            { mode: 'Splat Zones', stage: 'Manta Maria' },
                            { mode: 'Unknown Mode', stage: 'Counterpick' },
                            { mode: 'Unknown Mode', stage: 'Counterpick' }
                        ]
                    }
                });
        });

        it('can decode every Splatoon 3 stage', () => {
            const decodedStageNames: string[] = [];

            for (let i = 0; i < Splatoon3Stages.length; i++) {
                const parsedRounds = importFromMapsIplabs(`https://maps.iplabs.ink/?c=(%27mapPool!(%27sz.0*A%2C3%2C4%2C5%2C6%2C7%2C8%2C9*0*1*2*3*4*5*6*7*8*9A0A1%5D~tc.0*B~rCdDname!%27RCd%201%27~playStyle!%27bestOf%27~gameDmap!${i}~mode!%27sz%27)--BB*%2C1-~cCterpick%27.!%5BA%2C2B%5D)CounDs.(%27%01DCBA.-*_&v=1`);
                const firstStage = Object.values(parsedRounds)[0].games[0].stage;
                decodedStageNames.push(firstStage);
            }

            expect(new Set(decodedStageNames).size).toEqual(Splatoon3Stages.length);
        });

        it('throws if the input is missing rounds', () => {
            expect(() => importFromMapsIplabs('https://maps.iplabs.ink/?c=(\'mapPool!(\'sz.-%2C3%2C4%2C5%2C6%2C7%2C8%2C9*0*1*2*3*4*5*6*7*8*9-0-1%5D~tc.%5D))*%2C1-%2C2.!%5B0*%01.-*_&v=1'))
                .toThrow('translation:roundFromMapsIplabs.invalidJsonFormat');
        });

        it('throws if the input has an empty array of rounds', () => {
            expect(() => importFromMapsIplabs('https://maps.iplabs.ink/?c=(\'mapPool!(\'sz-0*.%2C3%2C4%2C5%2C6%2C7%2C8%2C9*0*1*2*3*4*5*6*7*8*9.0.1%5D~tc-0*%5D)~rounds-%5D)*%2C1-!%5B.%2C2%01.-*_&v=1'))
                .toThrow('translation:roundFromMapsIplabs.invalidJsonFormat');
        });

        it('throws if the input has no data', () => {
            expect(() => importFromMapsIplabs('https://maps.iplabs.ink/'))
                .toThrow('translation:roundFromMapsIplabs.missingRoundData');
        });

        it('throws if the encoding version is unknown', () => {
            expect(() => importFromMapsIplabs('https://maps.iplabs.ink/?c=.Pool!(\'szC0*I%2C3%2C4%2C5%2C6%2C7%2C8%2C9*0*1*2*3*4*5*6*7*8*9I0I1%5D~tcC0*F~rJdsCB1DbestOfG0-tcHtest%20arbitrary%20stage%20input\'-szHeeltail%20alley\'-gc\')F%2CBTwoDLAllG14-sz\')EEFF*%2C1-~modK.(\'mapB(\'namKRJd%20C!%5BD\'~LStylKE~cJterpick\'F%5D)G\'~gamesC.!H\')%2C.!\'I%2C2JounKe!\'Lplay%01LKJIHGFEDCB.-*_'))
                .toThrow('translation:roundFromMapsIplabs.missingEncodingVersion');
        });

        it('throws if the encoding version is too new', () => {
            expect(() => importFromMapsIplabs('https://maps.iplabs.ink/?c=.Pool!(\'szC0*I%2C3%2C4%2C5%2C6%2C7%2C8%2C9*0*1*2*3*4*5*6*7*8*9I0I1%5D~tcC0*F~rJdsCB1DbestOfG0-tcHtest%20arbitrary%20stage%20input\'-szHeeltail%20alley\'-gc\')F%2CBTwoDLAllG14-sz\')EEFF*%2C1-~modK.(\'mapB(\'namKRJd%20C!%5BD\'~LStylKE~cJterpick\'F%5D)G\'~gamesC.!H\')%2C.!\'I%2C2JounKe!\'Lplay%01LKJIHGFEDCB.-*_&v=2'))
                .toThrow('translation:roundFromMapsIplabs.encodingVersionTooNew');
        });

        it('throws if the encoding version is otherwise unparseable', () => {
            expect(() => importFromMapsIplabs('https://maps.iplabs.ink/?c=.Pool!(\'szC0*I%2C3%2C4%2C5%2C6%2C7%2C8%2C9*0*1*2*3*4*5*6*7*8*9I0I1%5D~tcC0*F~rJdsCB1DbestOfG0-tcHtest%20arbitrary%20stage%20input\'-szHeeltail%20alley\'-gc\')F%2CBTwoDLAllG14-sz\')EEFF*%2C1-~modK.(\'mapB(\'namKRJd%20C!%5BD\'~LStylKE~cJterpick\'F%5D)G\'~gamesC.!H\')%2C.!\'I%2C2JounKe!\'Lplay%01LKJIHGFEDCB.-*_&v=-1'))
                .toThrow('translation:roundFromMapsIplabs.unsupportedEncodingVersion');
        });
    });
});
