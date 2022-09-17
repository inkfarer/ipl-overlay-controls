import { ReplicantFixerService } from '../ReplicantFixerService';
import { mockNodecg, replicants } from '../../__mocks__/mockNodecg';
import { GameVersion } from '../../../types/enums/gameVersion';
import cloneDeep from 'lodash/cloneDeep';

describe('ReplicantFixerService', () => {
    let replicantFixerService: ReplicantFixerService;

    beforeEach(() => {
        replicantFixerService = new ReplicantFixerService(mockNodecg);
    });

    describe('fix', () => {
        it('does not modify active round data if the selected color is from a valid category', () => {
            replicants.runtimeConfig = {
                gameVersion: GameVersion.SPLATOON_2
            };
            const originalActiveRound = {
                activeColor: {
                    categoryName: 'Ranked Modes',
                    title: 'Cool Color'
                },
                teamA: {
                    color: '#000'
                },
                teamB: {
                    color: '#fff'
                }
            };
            replicants.activeRound = cloneDeep(originalActiveRound);

            replicantFixerService.fix();

            expect(replicants.activeRound).toEqual(originalActiveRound);
        });

        it('resets the active color if the selected color is from an unknown category', () => {
            replicants.runtimeConfig = {
                gameVersion: GameVersion.SPLATOON_2
            };
            replicants.activeRound = {
                activeColor: {
                    categoryName: 'test weird category name!!',
                    title: 'Cool Color'
                },
                teamA: {
                    color: '#000'
                },
                teamB: {
                    color: '#fff'
                }
            };

            replicantFixerService.fix();

            expect(replicants.activeRound).toEqual({
                activeColor: {
                    categoryName: 'Ranked Modes',
                    clrNeutral: '#F4067E',
                    index: 0,
                    isCustom: false,
                    title: 'Green vs Grape'
                },
                teamA: {
                    color: '#37FC00'
                },
                teamB: {
                    color: '#7D28FC'
                }
            });
        });
    });
});
