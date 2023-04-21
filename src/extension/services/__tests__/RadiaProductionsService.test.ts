import { mock, MockProxy } from 'jest-mock-extended';
import { RadiaProductionsService } from '../RadiaProductionsService';
import { mockNodecg, replicants } from '../../__mocks__/mockNodecg';
import { RadiaProductionsClient } from '../../clients/RadiaProductionsClient';

describe('RadiaProductionsService', () => {
    let radiaProductionsClient: MockProxy<RadiaProductionsClient>;
    let radiaProductionsService: RadiaProductionsService;

    beforeEach(() => {
        radiaProductionsClient = mock<RadiaProductionsClient>();
        radiaProductionsService = new RadiaProductionsService(mockNodecg, radiaProductionsClient);
    });

    describe('getLiveCommentators', () => {
        beforeEach(() => {
            replicants.radiaSettings = {
                guildID: '019578380257832'
            };
        });

        it('gets caster data from the API, normalizes it and updates the casters replicant', async () => {
            radiaProductionsClient.getLiveCasters.mockResolvedValue([
                { discord_user_id: '109578102', twitter: 'joecaster', pronouns: 'He/Him', name: 'Joe Caster' },
                { discord_user_id: '2938765', twitter: 'JaneCaster', pronouns: 'she/her', name: 'Jane Caster' }
            ]);

            const result = await radiaProductionsService.getLiveCommentators();

            expect(replicants.casters).toEqual({
                '109578102': {
                    twitter: '@joecaster',
                    pronouns: 'he/him',
                    name: 'Joe Caster'
                },
                '2938765': {
                    twitter: '@JaneCaster',
                    pronouns: 'she/her',
                    name: 'Jane Caster'
                }
            });
            expect(result).toEqual({
                add: {
                    '109578102': {
                        twitter: '@joecaster',
                        pronouns: 'he/him',
                        name: 'Joe Caster'
                    },
                    '2938765': {
                        twitter: '@JaneCaster',
                        pronouns: 'she/her',
                        name: 'Jane Caster'
                    }
                },
                extra: { }
            });
        });

        it('returns extra casters separately if there are over 3 casters in the API response', async () => {
            const apiResponse = [
                { discord_user_id: '109578102', twitter: 'joecaster', pronouns: 'He/Him', name: 'Joe Caster' },
                { discord_user_id: '2938765', twitter: 'JaneCaster', pronouns: 'she/her', name: 'Jane Caster' },
                { discord_user_id: '-5123908', twitter: 'joecaster', pronouns: 'He/Him', name: 'joe caster' },
                { discord_user_id: '0569237840', twitter: 'JaneCaster', pronouns: 'shE/her', name: 'Jane Caster' },
                { discord_user_id: '-5123908', twitter: 'joecaster', pronouns: 'He/Him', name: 'Joe Caster' }
            ];
            radiaProductionsClient.getLiveCasters.mockResolvedValue(apiResponse);

            const result = await radiaProductionsService.getLiveCommentators();

            expect(replicants.casters).toEqual({
                '109578102': { twitter: '@joecaster', pronouns: 'he/him', name: 'Joe Caster' },
                '2938765': { twitter: '@JaneCaster', pronouns: 'she/her', name: 'Jane Caster' },
                '-5123908': { twitter: '@joecaster', pronouns: 'he/him', name: 'joe caster' }
            });
            expect(result).toEqual({
                add: {
                    '109578102': { twitter: '@joecaster', pronouns: 'he/him', name: 'Joe Caster' },
                    '2938765': { twitter: '@JaneCaster', pronouns: 'she/her', name: 'Jane Caster' },
                    '-5123908': { twitter: '@joecaster', pronouns: 'he/him', name: 'joe caster' }
                },
                extra: {
                    '0569237840': { twitter: '@JaneCaster', pronouns: 'she/her', name: 'Jane Caster' },
                    '-5123908': { twitter: '@joecaster', pronouns: 'he/him', name: 'Joe Caster' }
                }
            });
        });

        it('throws an error if no commentators were found', async () => {
            radiaProductionsClient.getLiveCasters.mockResolvedValue([]);

            await expect(radiaProductionsService.getLiveCommentators()).rejects.toThrow(new Error('Got no commentators from API.'));

            expect(replicants.casters).toBeUndefined();
        });

        it('handles errors as expected', async () => {
            const apiResponse = { response: { status: 401 } };
            radiaProductionsClient.getLiveCasters.mockRejectedValue(apiResponse);

            await expect(radiaProductionsService.getLiveCommentators()).rejects.toEqual(apiResponse);

            expect(replicants.casters).toBeUndefined();
        });
    });
});
