import { MockNodecg } from '../../__mocks__/mockNodecg_legacy';
import { dispatch, elementById } from '../../helpers/elemHelper';

describe('loadFromVc', () => {
    const mockCasters = {
        __esModule: true,
        setUncommittedButtonDisabled: jest.fn(),
        updateOrCreateCreateCasterElem: jest.fn()
    };
    let nodecg: MockNodecg;

    jest.mock('../casters', () => mockCasters);

    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();

        nodecg = new MockNodecg();
        nodecg.init();

        document.body.innerHTML = `
            <button id="load-casters-btn">`;

        require('../loadFromVc');
    });

    describe('load-casters-btn: click', () => {
        it('sends a message', () => {
            dispatch(elementById('load-casters-btn'), 'click');

            expect(nodecg.sendMessage).toHaveBeenCalledWith('getLiveCommentators', {}, expect.any(Function));
        });

        it('does nothing on message callback of less than 3 casters were received', () => {
            dispatch(elementById('load-casters-btn'), 'click');

            const messageCallback = nodecg.sendMessage.mock.calls[0][2];
            messageCallback(undefined, {
                add: [
                    { name: 'Caster One' },
                    { name: 'Caster Two' },
                    { name: 'Caster Three' }
                ]
            });

            expect(mockCasters.setUncommittedButtonDisabled).not.toHaveBeenCalled();
            expect(mockCasters.updateOrCreateCreateCasterElem).not.toHaveBeenCalled();
        });

        it('adds casters that cannot be saved as uncommitted casters', () => {
            dispatch(elementById('load-casters-btn'), 'click');

            const messageCallback = nodecg.sendMessage.mock.calls[0][2];
            messageCallback(undefined, {
                add: [
                    { name: 'Caster One' },
                    { name: 'Caster Two' },
                    { name: 'Caster Three' }
                ],
                extra: [
                    { discord_user_id: 'user123123' },
                    { discord_user_id: 'user456456' }
                ]
            });

            expect(mockCasters.updateOrCreateCreateCasterElem).toHaveBeenCalledTimes(2);
            expect(mockCasters.updateOrCreateCreateCasterElem)
                .toHaveBeenCalledWith('user123123', { discord_user_id: 'user123123' }, true);
            expect(mockCasters.updateOrCreateCreateCasterElem)
                .toHaveBeenCalledWith('user456456', { discord_user_id: 'user456456' }, true);

            expect(mockCasters.setUncommittedButtonDisabled).toHaveBeenCalledWith(true);
        });

        it('logs errors received in message callback', () => {
            console.error = jest.fn();

            dispatch(elementById('load-casters-btn'), 'click');

            const messageCallback = nodecg.sendMessage.mock.calls[0][2];
            messageCallback('Something has happened.', undefined);

            expect(console.error).toHaveBeenCalledWith('Something has happened.');
        });
    });

    describe('radiaSettings: change', () => {
        it('enables load from vc button if api is enabled and a guild id is given', () => {
            const loadFromVcButton = elementById<HTMLButtonElement>('load-casters-btn');
            loadFromVcButton.disabled = true;

            nodecg.listeners.radiaSettings({ enabled: true, guildID: '123123123' });

            expect(loadFromVcButton.disabled).toEqual(false);
        });

        it('disables load from vc button if no guild id is given', () => {
            const loadFromVcButton = elementById<HTMLButtonElement>('load-casters-btn');
            loadFromVcButton.disabled = false;

            nodecg.listeners.radiaSettings({ enabled: true, guildID: undefined });

            expect(loadFromVcButton.disabled).toEqual(true);
        });

        it('disables load from vc button if api is not enabled', () => {
            const loadFromVcButton = elementById<HTMLButtonElement>('load-casters-btn');
            loadFromVcButton.disabled = false;

            nodecg.listeners.radiaSettings({ enabled: false, guildID: '345345' });

            expect(loadFromVcButton.disabled).toEqual(true);
        });

        it('disables load from vc button if api is not enabled and no guild id is given', () => {
            const loadFromVcButton = elementById<HTMLButtonElement>('load-casters-btn');
            loadFromVcButton.disabled = false;

            nodecg.listeners.radiaSettings({ enabled: false, guildID: undefined });

            expect(loadFromVcButton.disabled).toEqual(true);
        });
    });
});
