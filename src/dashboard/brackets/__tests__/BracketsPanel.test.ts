import { TestingPinia, createTestingPinia } from '@pinia/testing';
import BracketsPanel from '../BracketsPanel.vue';
import { useBracketStore } from '../../store/bracketStore';
import { useTournamentDataStore } from '../../store/tournamentDataStore';
import { config, flushPromises, mount } from '@vue/test-utils';
import { IplMessage, IplSpace } from '@iplsplatoon/vue-components';
import { mockBundleConfig, mockSendMessage } from '../../__mocks__/mockNodecg';
import { BattlefyImporter, StartggImporter } from '@tourneyview/importer';
import MatchQueryParamInput from '../MatchQueryParamInput.vue';
import IplocButton from '../../components/IplocButton.vue';

jest.mock('@tourneyview/importer');

describe('BracketsPanel', () => {
    config.global.stubs = {
        IplDataRow: true,
        IplocButton: true,
        MatchQueryParamInput: true
    };

    let pinia: TestingPinia;

    beforeEach(() => {
        pinia = createTestingPinia();
        config.global.plugins = [pinia];
        mockBundleConfig.smashgg = { apiKey: 'test-startgg-api-key' };
        useTournamentDataStore().tournamentData = {
            // @ts-ignore
            meta: {
                source: 'BATTLEFY',
                id: 'test-tournament-id'
            }
        };
    });

    describe('support/configuration message', () => {
        it('is visible if an unsupported tournament source is in use', () => {
            useTournamentDataStore().tournamentData = {
                // @ts-ignore
                meta: {
                    source: 'UPLOAD'
                }
            };
            const wrapper = mount(BracketsPanel);

            expect(wrapper.findAllComponents(IplSpace).length).toEqual(0);
            const message = wrapper.getComponent(IplMessage);
            expect(message.vm.type).toEqual('warning');
            expect(message.text()).toEqual('common:brackets.unsupportedSourceError');
        });
        
        it('is visible if start.gg is unconfigured', () => {
            mockBundleConfig.smashgg = null;
            useTournamentDataStore().tournamentData = {
                // @ts-ignore
                meta: {
                    source: 'SMASHGG'
                }
            };
            const wrapper = mount(BracketsPanel);

            expect(wrapper.findAllComponents(IplSpace).length).toEqual(0);
            const message = wrapper.getComponent(IplMessage);
            expect(message.vm.type).toEqual('warning');
            expect(message.text()).toEqual('translation:missingConfigurationWarning');
        });
    });

    describe('loaded bracket message', () => {
        it('shows the expected message when no bracket is loaded', () => {
            useBracketStore().bracketData = undefined;
            const wrapper = mount(BracketsPanel);

            const space = wrapper.getComponent<typeof IplSpace>('[data-test="loaded-bracket-space"]');
            expect(space.html()).toMatchSnapshot();
        });
        
        it('displays bracket data', () => {
            useBracketStore().bracketData = {
                eventName: 'Test Event',
                name: 'Test Bracket',
                matchGroups: [
                    // @ts-ignore
                    { name: 'Test Bracket' }
                ]
            };
            const wrapper = mount(BracketsPanel);

            const space = wrapper.getComponent<typeof IplSpace>('[data-test="loaded-bracket-space"]');
            expect(space.html()).toMatchSnapshot();
        });
        
        it('displays bracket data when more than one match group is loaded', () => {
            useBracketStore().bracketData = {
                eventName: 'Test Event',
                name: 'Test Bracket',
                matchGroups: [
                    // @ts-ignore
                    { name: 'Group One' },
                    // @ts-ignore
                    { name: 'Group Two' }
                ]
            };
            const wrapper = mount(BracketsPanel);

            const space = wrapper.getComponent<typeof IplSpace>('[data-test="loaded-bracket-space"]');
            expect(space.html()).toMatchSnapshot();
        });
        
        it('displays bracket data when a round number is present', () => {
            useBracketStore().bracketData = {
                eventName: 'Test Event',
                name: 'Test Bracket',
                matchGroups: [
                    // @ts-ignore
                    { name: 'Test Bracket' }
                ],
                roundNumber: 8
            };
            const wrapper = mount(BracketsPanel);

            const space = wrapper.getComponent<typeof IplSpace>('[data-test="loaded-bracket-space"]');
            expect(space.html()).toMatchSnapshot();
        });
    });

    describe('loading bracket data', () => {
        it('handles loading and editing bracket query parameters and submitting a query', async () => {
            (BattlefyImporter.prototype.getMatchQueryOptions as jest.Mock).mockResolvedValue([
                { type: 'static', value: 'test', key: 'testParam' }
            ]);
            const wrapper = mount(BracketsPanel);

            expect(wrapper.findAllComponents('match-query-param-input-stub').length).toEqual(0);

            await wrapper.getComponent('[data-test="load-bracket-data-button"]').trigger('click');
            await flushPromises();

            expect(BattlefyImporter.prototype.getMatchQueryOptions).toHaveBeenCalledWith('test-tournament-id');
            const paramInputs = wrapper.findAllComponents<typeof MatchQueryParamInput>('match-query-param-input-stub');
            expect(paramInputs.length).toEqual(1);
            const paramInput = paramInputs.at(0);
            paramInput.vm.$emit('parameter-add', 'testParam');
            paramInput.vm.$emit('change', 'testParam', 'testParamValue');

            await wrapper.getComponent('[data-test="submit-bracket-query-button"]').trigger('click');
            expect(mockSendMessage).toHaveBeenCalledWith('getBracket', { testParam: 'testParamValue' });
        });

        it('disables submitting a query if data is loading', async () => {
            (BattlefyImporter.prototype.getMatchQueryOptions as jest.Mock).mockResolvedValue([
                { type: 'static', value: 'test', key: 'testParam' }
            ]);
            const wrapper = mount(BracketsPanel);

            await wrapper.getComponent('[data-test="load-bracket-data-button"]').trigger('click');
            await flushPromises();

            const paramInputs = wrapper.findAllComponents<typeof MatchQueryParamInput>('match-query-param-input-stub');
            expect(paramInputs.length).toEqual(1);
            const paramInput = paramInputs.at(0);

            paramInput.vm.$emit('loading', true);
            await wrapper.vm.$nextTick();
            expect(wrapper.getComponent<typeof IplocButton>('[data-test="submit-bracket-query-button"]').attributes().disabled).toEqual('true');
            
            paramInput.vm.$emit('loading', false);
            await wrapper.vm.$nextTick();
            expect(wrapper.getComponent<typeof IplocButton>('[data-test="submit-bracket-query-button"]').attributes().disabled).toEqual('false');
        });

        it('disables submitting a query if data is missing', async () => {
            (BattlefyImporter.prototype.getMatchQueryOptions as jest.Mock).mockResolvedValue([
                { type: 'static', value: 'test', key: 'testParam' }
            ]);
            const wrapper = mount(BracketsPanel);

            await wrapper.getComponent('[data-test="load-bracket-data-button"]').trigger('click');
            await flushPromises();

            const paramInputs = wrapper.findAllComponents<typeof MatchQueryParamInput>('match-query-param-input-stub');
            expect(paramInputs.length).toEqual(1);
            const paramInput = paramInputs.at(0);

            paramInput.vm.$emit('parameter-add', 'testParam');
            await wrapper.vm.$nextTick();
            expect(wrapper.getComponent<typeof IplocButton>('[data-test="submit-bracket-query-button"]').attributes().disabled).toEqual('true');

            paramInput.vm.$emit('change', 'testParam', 'testParamValue');
            await wrapper.vm.$nextTick();
            expect(wrapper.getComponent<typeof IplocButton>('[data-test="submit-bracket-query-button"]').attributes().disabled).toEqual('false');
        });

        describe('start.gg events', () => {
            beforeEach(() => {
                useTournamentDataStore().tournamentData.meta.source = 'SMASHGG';
                useTournamentDataStore().tournamentData.meta.sourceSpecificData = {
                    smashgg: {
                        // @ts-ignore
                        eventData: {
                            id: 98
                        }
                    }
                };
            });

            it('loads the expected query parameters if the loaded bracket is available to be selected for importing', async () => {
                (StartggImporter.prototype.getMatchQueryOptions as jest.Mock).mockResolvedValue([
                    {
                        type: 'select',
                        key: 'eventId',
                        name: 'Event',
                        options: [
                            { name: 'Test Event 1', value: 99 },
                            {
                                name: 'Test Event 2',
                                value: 98,
                                getParams: jest.fn().mockResolvedValue([
                                    { type: 'static', value: 'test-bracket', key: 'testEventParam', name: 'Bracket' }
                                ])
                            },
                            { name: 'Test Event 3', value: 97 }
                        ]
                    },
                    { type: 'static', value: 'test', key: 'testRootMatchQueryParam', name: 'Test Root Param' }
                ]);

                const wrapper = mount(BracketsPanel);

                await wrapper.getComponent('[data-test="load-bracket-data-button"]').trigger('click');
                await flushPromises();

                expect((wrapper.vm as unknown as Record<string, unknown>).bracketQuery).toEqual([
                    {
                        key: 'eventId',
                        name: 'Event',
                        type: 'static',
                        value: 98
                    },
                    {
                        key: 'testEventParam',
                        name: 'Bracket',
                        type: 'static',
                        value: 'test-bracket'
                    },
                    {
                        type: 'static',
                        value: 'test',
                        key: 'testRootMatchQueryParam',
                        name: 'Test Root Param'
                    }
                ]);
            });

            it('loads the expected query parameters if the loaded bracket is not available to be selected for importing', async () => {
                (StartggImporter.prototype.getMatchQueryOptions as jest.Mock).mockResolvedValue([
                    {
                        type: 'select',
                        key: 'eventId',
                        name: 'Event',
                        options: [
                            { name: 'Test Event 4', value: 96 }
                        ]
                    },
                    { type: 'static', value: 'test', key: 'testRootMatchQueryParam', name: 'Test Root Param' }
                ]);

                const wrapper = mount(BracketsPanel);

                await wrapper.getComponent('[data-test="load-bracket-data-button"]').trigger('click');
                await flushPromises();

                expect((wrapper.vm as unknown as Record<string, unknown>).bracketQuery).toEqual([
                    {
                        type: 'select',
                        key: 'eventId',
                        name: 'Event',
                        options: [
                            { name: 'Test Event 4', value: 96 }
                        ]
                    },
                    {
                        type: 'static',
                        value: 'test',
                        key: 'testRootMatchQueryParam',
                        name: 'Test Root Param'
                    }
                ]);
            });
        });
    });
});
