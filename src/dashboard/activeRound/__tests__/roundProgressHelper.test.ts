import { elementById } from '../../helpers/elemHelper';
import { MockNodecg } from '../../__mocks__/mockNodecg_legacy';
import { Module } from '../../../helpers/__mocks__/module';

describe('roundProgressHelper', () => {
    let nodecg: MockNodecg;
    let helper: Module;

    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();

        nodecg = new MockNodecg();
        nodecg.init();

        document.body.innerHTML = `
        <select id="round-selector" class="round-selector">
            <option value="round-round">ROUND</option>
            <option value="round-no-progress">ROUND</option>
            <option 
                value="round"
                data-team-a-id="aaa"
                data-team-b-id="bbb"
                data-team-a-name="TEAMA"
                data-team-b-name="TEAMB"
            >ROUND</option>
            <option 
                value="round-completed"
                data-team-a-id="aaa"
                data-team-b-id="bbb"
                data-team-a-name="TEAMA"
                data-team-b-name="TEAMB"
                data-is-completed="true"
            >ROUND</option>
        </select>
        <select id="team-a-selector" class="team-selector">
            <option value="team-team">TEAM</option>
            <option value="team-a">TEAM</option>
            <option value="aaa">TEAM</option>
        </select>
        <select id="team-b-selector" class="team-selector">
            <option value="team-team">TEAM</option>
            <option value="team-b">TEAM</option>
            <option value="bbb">TEAM</option>
        </select>
        <button id="update-active-round-button" />
        <div id="round-data-info">
            <div class="content" />
        </div>
        `;

        helper = require('../roundProgressHelper');
    });

    describe('checkRoundProgress', () => {
        it('displays a warning when the given round has progress and sets teams to what is saved in the given round', () => {
            nodecg.replicants.activeRound.value = {
                round: { id: 'different-round' }
            };
            elementById<HTMLSelectElement>('round-selector').value = 'round';

            helper.checkRoundProgress();

            const roundDataInfoText = document.querySelector('#round-data-info > .content') as HTMLElement;
            expect(roundDataInfoText.innerText)
                .toEqual('\'ROUND\' already has saved progress.\n(TEAMA vs TEAMB)');
            expect(elementById('round-data-info').style.display).toEqual('');
            expect(elementById<HTMLInputElement>('team-a-selector').value).toEqual('aaa');
            expect(elementById<HTMLInputElement>('team-b-selector').value).toEqual('bbb');
        });

        it('displays a warning when the given round is completed', () => {
            nodecg.replicants.activeRound.value = {
                round: { id: 'different-round' }
            };
            elementById<HTMLSelectElement>('round-selector').value = 'round-completed';

            helper.checkRoundProgress();

            const roundDataInfoText = document.querySelector('#round-data-info > .content') as HTMLElement;
            expect(roundDataInfoText.innerText)
                .toEqual('\'ROUND\' has already been completed.\n(TEAMA vs TEAMB)');
            expect(elementById('round-data-info').style.display).toEqual('');
            expect(elementById<HTMLInputElement>('team-a-selector').value).toEqual('aaa');
            expect(elementById<HTMLInputElement>('team-b-selector').value).toEqual('bbb');
        });

        it('does not display a warning if the selected round matches the active round', () => {
            nodecg.replicants.activeRound.value = {
                round: { id: 'round-completed' }
            };
            elementById<HTMLSelectElement>('round-selector').value = 'round-completed';

            helper.checkRoundProgress();

            expect(elementById('round-data-info').style.display).toEqual('none');
            expect(elementById<HTMLInputElement>('team-a-selector').value).toEqual('aaa');
            expect(elementById<HTMLInputElement>('team-b-selector').value).toEqual('bbb');
        });

        it('does not display a warning if the selected round is not completed', () => {
            nodecg.replicants.activeRound.value = {
                round: { id: 'round-completed' }
            };
            elementById<HTMLSelectElement>('round-selector').value = 'round-round';

            helper.checkRoundProgress();

            expect(elementById('round-data-info').style.display).toEqual('none');
        });
    });
});
