import { MockNodecg } from '../../__mocks__/mockNodecg';
import { dispatch, elementById } from '../../helpers/elemHelper';

describe('copyCasters', () => {
    let nodecg: MockNodecg;

    beforeAll(() => {
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                writeText: jest.fn().mockResolvedValue(undefined)
            },
            writable: false
        });
    });

    beforeEach(() => {
        jest.resetModules();

        nodecg = new MockNodecg();
        nodecg.init();

        document.body.innerHTML = `
            <button id="copy-casters-btn">`;

        require('../copyCasters');
    });

    describe('copy-casters-btn: click', () => {
        it('copies casters', () => {
            nodecg.replicants.casters.value = {
                caster1: {
                    name: 'Caster One',
                    pronouns: 'he/him',
                    twitter: '@casterOne'
                },
                caster2: {
                    name: 'Caster Two',
                    pronouns: 'they/them',
                    twitter: '@casterTwo'
                }
            };

            dispatch(elementById('copy-casters-btn'), 'click');

            expect(navigator.clipboard.writeText)
                .toHaveBeenCalledWith('Caster One (he/him, @casterOne) & Caster Two (they/them, @casterTwo)');
        });

        it('copies more than 2 casters with proper punctuation', () => {
            nodecg.replicants.casters.value = {
                caster1: {
                    name: 'Caster One',
                    pronouns: 'he/him',
                    twitter: '@casterOne'
                },
                caster2: {
                    name: 'Caster Two',
                    pronouns: 'they/them',
                    twitter: '@casterTwo'
                },
                caster3: {
                    name: 'Caster Three',
                    pronouns: 'she/her',
                    twitter: '@caster3'
                }
            };

            dispatch(elementById('copy-casters-btn'), 'click');

            expect(navigator.clipboard.writeText)
                .toHaveBeenCalledWith('Caster One (he/him, @casterOne), Caster Two (they/them, @casterTwo) & Caster Three (she/her, @caster3)');
        });
    });
});
