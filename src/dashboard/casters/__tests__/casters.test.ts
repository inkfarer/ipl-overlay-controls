import { MockNodecg } from '../../__mocks__/mockNodecg';
import { appendChildren, dispatch, elementById } from '../../helpers/elemHelper';
import { Module } from '../../../helpers/__mocks__/module';
import * as generateId from '../../../helpers/generateId';
import { Casters } from 'schemas';

describe('casters', () => {
    let nodecg: MockNodecg;
    let casters: Module;

    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();

        nodecg = new MockNodecg();
        nodecg.init();

        document.body.innerHTML = `
            <div id="casters"></div>
            <button id="add-caster-btn"></button>`;

        casters = require('../casters');
    });

    describe('casters: change', () => {
        it('adds casters', () => {
            nodecg.listeners.casters({
                casterone: {
                    name: 'Caster the First',
                    twitter: '@caster1',
                    pronouns: 'he/him'
                },
                castertwo: {
                    name: 'Caster Two',
                    twitter: '@caster2',
                    pronouns: 'she/her'
                }
            });

            expect(elementById('casters').innerHTML).toMatchSnapshot();
        });

        it('handles casters being added and updated', () => {
            const casterElem = elementById('casters');

            const initialCasters = {
                casterone: {
                    name: 'Caster the First',
                    twitter: '@caster1',
                    pronouns: 'he/him'
                },
                castertwo: {
                    name: 'Caster Two',
                    twitter: '@caster2',
                    pronouns: 'she/her'
                }
            };
            nodecg.listeners.casters(initialCasters);

            expect(casterElem.innerHTML).toMatchSnapshot();

            const newCasters = {
                casterone: {
                    name: 'Caster the First (Updated)',
                    twitter: '@caster1new',
                    pronouns: 'they/them'
                },
                castertwo: {
                    name: 'Caster Two',
                    twitter: '@caster2',
                    pronouns: 'she/her'
                },
                casterthree: {
                    name: 'Third Caster',
                    twitter: '@casterthree',
                    pronouns: 'they/them'
                }
            };
            nodecg.listeners.casters(newCasters, initialCasters);

            expect(casterElem.innerHTML).toMatchSnapshot();
        });

        it('handles casters being removed', () => {
            const casterElem = elementById('casters');

            const initialCasters = {
                casterone: {
                    name: 'Caster the First',
                    twitter: '@caster1',
                    pronouns: 'he/him'
                },
                castertwo: {
                    name: 'Caster Two',
                    twitter: '@caster2',
                    pronouns: 'she/her'
                }
            };
            nodecg.listeners.casters(initialCasters);

            expect(casterElem.innerHTML).toMatchSnapshot();

            const newCasters = {
                casterone: {
                    name: 'Caster the First',
                    twitter: '@caster1',
                    pronouns: 'he/him'
                }
            };
            nodecg.listeners.casters(newCasters, initialCasters);

            expect(casterElem.innerHTML).toMatchSnapshot();
        });

        it('disables uncommitted casters if the limit for casters is reached', () => {
            /*
            * - At first, there are two casters
            * - The user creates a third caster but does not save it
            * - The casters replicant is updated with a third caster (for example, from another dashboard user)
            * - The user should not be able to save the caster they just created
            */

            const initialCasters = {
                casterone: {
                    name: 'Caster the First',
                    twitter: '@caster1',
                    pronouns: 'he/him'
                },
                castertwo: {
                    name: 'Caster Two',
                    twitter: '@caster2',
                    pronouns: 'she/her'
                }
            };
            nodecg.listeners.casters(initialCasters);

            casters.updateOrCreateCreateCasterElem('newcaster', undefined, true);

            const newCasters = {
                casterone: {
                    name: 'Caster the First (Updated)',
                    twitter: '@caster1new',
                    pronouns: 'they/them'
                },
                castertwo: {
                    name: 'Caster Two',
                    twitter: '@caster2',
                    pronouns: 'she/her'
                },
                casterthree: {
                    name: 'Third Caster',
                    twitter: '@casterthree',
                    pronouns: 'they/them'
                }
            };
            nodecg.listeners.casters(newCasters, initialCasters);

            expect(elementById<HTMLButtonElement>('update-caster_newcaster').disabled).toEqual(true);
        });

        it('disables the create caster button if we have hit the caster limit', () => {
            nodecg.listeners.casters({
                casterone: {
                    name: 'Caster the First (Updated)',
                    twitter: '@caster1new',
                    pronouns: 'they/them'
                },
                castertwo: {
                    name: 'Caster Two',
                    twitter: '@caster2',
                    pronouns: 'she/her'
                },
                casterthree: {
                    name: 'Third Caster',
                    twitter: '@casterthree',
                    pronouns: 'they/them'
                }
            });

            expect(elementById<HTMLButtonElement>('add-caster-btn').disabled).toEqual(true);
        });
    });

    describe('add-caster-btn: click', () => {
        it('creates a caster', () => {
            jest.spyOn(generateId, 'generateId').mockReturnValue('idid123');
            const casterElem = elementById('casters');
            casterElem.innerHTML = '';

            dispatch(elementById('add-caster-btn'), 'click');

            expect(elementById('caster-container_idid123')).not.toBeUndefined();
        });

        it('disables the button if the caster limit has been reached', () => {
            const casterElem = elementById('casters');
            casterElem.innerHTML = '<div class="caster-container"></div><div class="caster-container"></div>';
            const button = elementById<HTMLButtonElement>('add-caster-btn');

            dispatch(button, 'click');

            expect(button.disabled).toEqual(true);
        });
    });

    describe('updateOrCreateCasterElem', () => {
        it('creates element with data if it does not exist', () => {
            const casterElem = elementById('casters');
            casterElem.innerHTML = '';

            casters.updateOrCreateCreateCasterElem(
                'newcaster', { name: 'new caster', twitter: '@casternew', pronouns: 'she/her' }, true);

            expect(elementById('caster-container_newcaster')).not.toBeUndefined();
            expect(elementById<HTMLInputElement>('caster-name-input_newcaster').value).toEqual('new caster');
            expect(elementById<HTMLInputElement>('caster-twitter-input_newcaster').value).toEqual('@casternew');
            expect(elementById<HTMLInputElement>('caster-pronoun-input_newcaster').value).toEqual('she/her');
            expect(elementById('update-caster_newcaster').classList).toContain('uncommitted');
        });

        it('creates element with data if it does not exist and is committed', () => {
            const casterElem = elementById('casters');
            casterElem.innerHTML = '';

            casters.updateOrCreateCreateCasterElem(
                'newcaster', { name: 'new caster', twitter: '@casternew', pronouns: 'she/her' }, false);

            expect(elementById('caster-container_newcaster')).not.toBeUndefined();
            expect(elementById<HTMLInputElement>('caster-name-input_newcaster').value).toEqual('new caster');
            expect(elementById<HTMLInputElement>('caster-twitter-input_newcaster').value).toEqual('@casternew');
            expect(elementById<HTMLInputElement>('caster-pronoun-input_newcaster').value).toEqual('she/her');
            expect(elementById('update-caster_newcaster').classList).not.toContain('uncommitted');
        });

        it('creates event listener for new update caster button', () => {
            const casterElem = elementById('casters');
            casterElem.innerHTML = '';
            nodecg.replicants.casters.value = {};

            casters.updateOrCreateCreateCasterElem(
                'newcaster', { name: 'new caster', twitter: '@casternew', pronouns: 'she/her' }, true);

            const updateButton = elementById('update-caster_newcaster');
            expect(updateButton.classList).toContain('uncommitted');

            dispatch(updateButton, 'click');

            expect((nodecg.replicants.casters.value as Casters)['newcaster']).toEqual({
                name: 'new caster',
                twitter: '@casternew',
                pronouns: 'she/her'
            });
            expect(updateButton.classList).not.toContain('uncommitted');
        });

        describe('event listener for new delete caster button', () => {
            it('updates replicant if caster exists', () => {
                const casterElem = elementById('casters');
                casterElem.innerHTML = '';
                nodecg.replicants.casters.value = {
                    newcaster: { name: 'new caster' }
                };

                casters.updateOrCreateCreateCasterElem(
                    'newcaster', { name: 'new caster', twitter: '@casternew', pronouns: 'she/her' }, true);

                const removeButton = elementById('remove-caster_newcaster');
                dispatch(removeButton, 'click');

                expect((nodecg.replicants.casters.value as Casters)['newcaster']).toBeUndefined();
            });

            it('removes element if caster is not committed', () => {
                const casterElem = elementById('casters');
                casterElem.innerHTML = '';
                nodecg.replicants.casters.value = {};

                casters.updateOrCreateCreateCasterElem(
                    'newcaster', { name: 'new caster', twitter: '@casternew', pronouns: 'she/her' }, true);

                const removeButton = elementById('remove-caster_newcaster');
                dispatch(removeButton, 'click');

                expect(casterElem.innerHTML).toEqual('');
            });
        });

        it('updates element with data if it exists', () => {
            const casterElem = elementById('casters');
            casterElem.innerHTML = `
                <div id="caster-container_newcaster">
                    <input id="caster-name-input_newcaster" class="test-input">
                    <input id="caster-twitter-input_newcaster" class="test-input">
                    <input id="caster-pronoun-input_newcaster" class="test-input">
                </div>`;

            casters.updateOrCreateCreateCasterElem(
                'newcaster', { name: 'new caster', twitter: '@casternew', pronouns: 'she/her' }, true);

            const casterNameInput = elementById<HTMLInputElement>('caster-name-input_newcaster');
            expect(casterNameInput.value).toEqual('new caster');
            expect(casterNameInput.classList).toContain('test-input');
            const casterTwitterInput = elementById<HTMLInputElement>('caster-twitter-input_newcaster');
            expect(casterTwitterInput.value).toEqual('@casternew');
            expect(casterTwitterInput.classList).toContain('test-input');
            const casterPronounInput = elementById<HTMLInputElement>('caster-pronoun-input_newcaster');
            expect(casterPronounInput.value).toEqual('she/her');
            expect(casterPronounInput.classList).toContain('test-input');
        });
    });

    describe('setUncommittedButtonDisabled', () => {
        it('disables appropriate buttons if disabled is true', () => {
            const buttonToDisable = document.createElement('button');
            buttonToDisable.classList.add('update-button', 'uncommitted');
            const buttonToKeepEnabled1 = document.createElement('button');
            buttonToKeepEnabled1.classList.add('update-button');
            const buttonToKeepEnabled2 = document.createElement('button');
            appendChildren(document.body, buttonToDisable, buttonToKeepEnabled1, buttonToKeepEnabled2);

            casters.setUncommittedButtonDisabled(true);

            expect(buttonToDisable.disabled).toEqual(true);
            expect(buttonToKeepEnabled1.disabled).toEqual(false);
            expect(buttonToKeepEnabled2.disabled).toEqual(false);
        });

        it('enables appropriate buttons if disabled is false', () => {
            const buttonToEnable = document.createElement('button');
            buttonToEnable.disabled = true;
            buttonToEnable.classList.add('update-button', 'uncommitted');
            const buttonToKeepDisabled1 = document.createElement('button');
            buttonToKeepDisabled1.classList.add('update-button');
            buttonToKeepDisabled1.disabled = true;
            const buttonToKeepDisabled2 = document.createElement('button');
            buttonToKeepDisabled2.disabled = true;
            appendChildren(document.body, buttonToEnable, buttonToKeepDisabled1, buttonToKeepDisabled2);

            casters.setUncommittedButtonDisabled(false);

            expect(buttonToEnable.disabled).toEqual(false);
            expect(buttonToKeepDisabled1.disabled).toEqual(true);
            expect(buttonToKeepDisabled2.disabled).toEqual(true);
        });
    });
});
