import { MockNodecg } from '../../__mocks__/mockNodecg';
import { handleTeamImageToggleChange } from '../teamImageToggleHelper';

describe('teamImageToggleHelper', () => {
    let nodecg: MockNodecg;

    beforeEach(() => {
        jest.resetModules();
        nodecg = new MockNodecg();
        nodecg.init();
    });

    describe('handleTeamImageToggleChange', () => {
        it('sends toggleTeamImage message', () => {
            const toggle = document.createElement('input');
            toggle.checked = true;
            toggle.dataset.teamId = '814093824093';

            handleTeamImageToggleChange({ target: toggle } as unknown as Event);

            expect(nodecg.sendMessage)
                .toHaveBeenCalledWith('toggleTeamImage', { teamId: '814093824093', isVisible: true });
        });

        it('throws error if toggle has no team ID', () => {
            const toggle = document.createElement('input');
            toggle.checked = true;

            expect(() => handleTeamImageToggleChange({ target: toggle } as unknown as Event))
                .toThrow('Team image toggle has no team ID set');
        });
    });
});
