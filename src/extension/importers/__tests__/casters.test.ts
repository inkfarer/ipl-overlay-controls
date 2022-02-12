import { mock } from 'jest-mock-extended';
import type * as RadiaClient from '../clients/radiaClient';
import { messageListeners, replicants } from '../../__mocks__/mockNodecg';
const mockRadiaClient = mock<typeof RadiaClient>();
jest.mock('../clients/radiaClient', () => mockRadiaClient);

describe('casters', () => {
    require('../casters');

    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('getLiveCommentators', () => {
        beforeEach(() => {
            replicants.radiaSettings = {
                guildID: '019578380257832'
            };
        });

        it('gets caster data from the API, normalizes it and updates the casters replicant', async () => {
            mockRadiaClient.getLiveCasters.mockResolvedValue([
                { discord_user_id: '109578102', twitter: 'joecaster', pronouns: 'He/Him', name: 'Joe Caster' },
                { discord_user_id: '2938765', twitter: 'JaneCaster', pronouns: 'she/her', name: 'Jane Caster' }
            ]);
            const ack = jest.fn();

            await messageListeners.getLiveCommentators(null, ack);

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
            expect(ack).toHaveBeenCalledWith(null, {
                add: [
                    { twitter: '@joecaster', pronouns: 'he/him', name: 'Joe Caster' },
                    { twitter: '@JaneCaster', pronouns: 'she/her', name: 'Jane Caster' }
                ],
                extra: [ ]
            });
        });

        it('returns extra casters in the acknowledgement if there are over 3 casters in the API response', async () => {
            const apiResponse = [
                { discord_user_id: '109578102', twitter: 'joecaster', pronouns: 'He/Him', name: 'Joe Caster' },
                { discord_user_id: '2938765', twitter: 'JaneCaster', pronouns: 'she/her', name: 'Jane Caster' },
                { discord_user_id: '-5123908', twitter: 'joecaster', pronouns: 'He/Him', name: 'joe caster' },
                { discord_user_id: '0569237840', twitter: 'JaneCaster', pronouns: 'shE/her', name: 'Jane Caster' },
                { discord_user_id: '-5123908', twitter: 'joecaster', pronouns: 'He/Him', name: 'Joe Caster' }
            ];
            mockRadiaClient.getLiveCasters.mockResolvedValue(apiResponse);
            const ack = jest.fn();

            await messageListeners.getLiveCommentators(null, ack);

            expect(replicants.casters).toEqual({
                '109578102': { twitter: '@joecaster', pronouns: 'he/him', name: 'Joe Caster' },
                '2938765': { twitter: '@JaneCaster', pronouns: 'she/her', name: 'Jane Caster' },
                '-5123908': { twitter: '@joecaster', pronouns: 'he/him', name: 'joe caster' }
            });
            expect(ack).toHaveBeenCalledWith(null, {
                add: [
                    { twitter: '@joecaster', pronouns: 'he/him', name: 'Joe Caster' },
                    { twitter: '@JaneCaster', pronouns: 'she/her', name: 'Jane Caster' },
                    { twitter: '@joecaster', pronouns: 'he/him', name: 'joe caster' },
                ],
                extra: [
                    { discord_user_id: '0569237840', twitter: '@JaneCaster', pronouns: 'she/her', name: 'Jane Caster' },
                    { discord_user_id: '-5123908', twitter: '@joecaster', pronouns: 'he/him', name: 'Joe Caster' }
                ]
            });
        });

        it('acknowledges if no commentators were found', async () => {
            mockRadiaClient.getLiveCasters.mockResolvedValue([]);
            const ack = jest.fn();

            await messageListeners.getLiveCommentators(null, ack);

            expect(ack).toHaveBeenCalledWith(new Error('Got no commentators from API.'));
            expect(replicants.casters).toBeUndefined();
        });

        it('acknowledges if an error is thrown', async () => {
            const apiResponse = { response: { status: 401 } };
            mockRadiaClient.getLiveCasters.mockRejectedValue(apiResponse);
            const ack = jest.fn();

            await messageListeners.getLiveCommentators(null, ack);

            expect(ack).toHaveBeenCalledWith(apiResponse);
            expect(replicants.casters).toBeUndefined();
        });

        it('acknowledges with nothing if a 404 error is thrown', async () => {
            mockRadiaClient.getLiveCasters.mockRejectedValue({ response: { status: 404 } });
            const ack = jest.fn();

            await messageListeners.getLiveCommentators(null, ack);

            expect(ack).toHaveBeenCalledWith(null, null);
        });
    });
});
