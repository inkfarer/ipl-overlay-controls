import { messageListeners, replicantChangeListeners, replicants } from '../../__mocks__/mockNodecg';

describe('radiaAvailabilityCheck', () => {
    const mockGetGuildInfo = jest.fn();

    jest.mock('../clients/radiaClient', () => ({
        getGuildInfo: mockGetGuildInfo
    }));

    require('../radiaAvailabilityCheck');

    describe('radiaSettings', () => {
        it('does nothing if guild id has not changed', async () => {
            await replicantChangeListeners.radiaSettings({ guildID: '123123123' }, { guildID: '123123123' });

            expect(mockGetGuildInfo).not.toHaveBeenCalled();
        });

        it('gets guild info and sets radia to enabled on success', async () => {
            replicants.radiaSettings = {};
            mockGetGuildInfo.mockResolvedValue({ twitch_channel: 'iplsplatoon' });

            await replicantChangeListeners.radiaSettings({ guildID: '123123123' });

            expect(replicants.radiaSettings).toEqual({ enabled: true, connectedChannel: 'iplsplatoon' });
            expect(mockGetGuildInfo).toHaveBeenCalledWith('123123123');
        });

        it('gets guild info and sets radia to disabled on failure', async () => {
            replicants.radiaSettings = { enabled: true, connectedChannel: 'iplsplatoon' };
            mockGetGuildInfo.mockRejectedValue({ });

            await replicantChangeListeners.radiaSettings({ guildID: '234234' });

            expect(replicants.radiaSettings).toEqual({ enabled: false, connectedChannel: null });
            expect(mockGetGuildInfo).toHaveBeenCalledWith('234234');
        });
    });

    describe('retryRadiaAvailabilityCheck', () => {
        beforeEach(() => {
            replicants.radiaSettings = { guildID: '123456' };
        });

        it('gets guild info and sets radia to enabled on success', async () => {
            mockGetGuildInfo.mockResolvedValue({ twitch_channel: 'iplsplatoon' });
            const ack = jest.fn();

            await messageListeners.retryRadiaAvailabilityCheck(null, ack);

            expect(replicants.radiaSettings).toEqual({
                enabled: true,
                connectedChannel: 'iplsplatoon',
                guildID: '123456'
            });
            expect(mockGetGuildInfo).toHaveBeenCalledWith('123456');
            expect(ack).toHaveBeenCalled();
        });

        it('gets guild info and sets radia to disabled on failure', async () => {
            mockGetGuildInfo.mockRejectedValue({ });
            const ack = jest.fn();

            await messageListeners.retryRadiaAvailabilityCheck(null, ack);

            expect(replicants.radiaSettings).toEqual({
                enabled: false,
                connectedChannel: null,
                guildID: '123456'
            });
            expect(mockGetGuildInfo).toHaveBeenCalledWith('123456');
            expect(ack).toHaveBeenCalled();
        });
    });
});
