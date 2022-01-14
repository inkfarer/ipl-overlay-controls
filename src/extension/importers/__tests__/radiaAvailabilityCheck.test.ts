import { MockNodecg } from '../../__mocks__/mockNodecg';

describe('radiaAvailabilityCheck', () => {
    const mockGetGuildInfo = jest.fn();

    jest.mock('../clients/radiaClient', () => ({
        getGuildInfo: mockGetGuildInfo
    }));

    let nodecg: MockNodecg;

    beforeEach(() => {
        jest.resetModules();
        nodecg = new MockNodecg();
        nodecg.init();

        require('../radiaAvailabilityCheck');
    });

    describe('radiaSettings', () => {
        it('gets guild info and sets radia to enabled on success', async () => {
            nodecg.replicants.radiaSettings.value = {};
            mockGetGuildInfo.mockResolvedValue({ twitch_channel: 'iplsplatoon' });

            await nodecg.replicantListeners.radiaSettings({ guildID: '123123123' });

            expect(nodecg.replicants.radiaSettings.value).toEqual({ enabled: true, connectedChannel: 'iplsplatoon' });
            expect(mockGetGuildInfo).toHaveBeenCalledWith('123123123');
        });

        it('gets guild info and sets radia to disabled on failure', async () => {
            nodecg.replicants.radiaSettings.value = { enabled: true, connectedChannel: 'iplsplatoon' };
            mockGetGuildInfo.mockRejectedValue({ });

            await nodecg.replicantListeners.radiaSettings({ guildID: '234234' });

            expect(nodecg.replicants.radiaSettings.value).toEqual({ enabled: false, connectedChannel: null });
            expect(mockGetGuildInfo).toHaveBeenCalledWith('234234');
        });
    });
});
