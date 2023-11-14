import { flushPromises, shallowMount } from '@vue/test-utils';
import MatchQueryParamInput from '../MatchQueryParamInput.vue';
import MatchQueryNumberRangeInput from '../MatchQueryNumberRangeInput.vue';
import { IplSelect } from '@iplsplatoon/vue-components';
import { reactive } from 'vue';

describe('MatchQueryParamInput', () => {
    describe('number range param', () => {
        it('renders the expected input', () => {
            const wrapper = shallowMount(MatchQueryParamInput, {
                props: {
                    param: {
                        type: 'numberRange',
                        min: 2,
                        max: 9,
                        key: 'numberRangeParam',
                        name: 'test-number-range'
                    },
                    query: {
                        numberRangeParam: '7'
                    }
                }
            });

            const input = wrapper.getComponent(MatchQueryNumberRangeInput);
            expect(input.vm.min).toEqual(2);
            expect(input.vm.max).toEqual(9);
            expect(input.vm.modelValue).toEqual('7');
            expect(input.vm.label).toEqual('test-number-range');
        });
        
        it('handles the input changing', () => {
            const wrapper = shallowMount(MatchQueryParamInput, {
                props: {
                    param: {
                        type: 'numberRange',
                        min: 2,
                        max: 9,
                        key: 'numberRangeParam',
                        name: 'test-number-range'
                    },
                    query: {
                        numberRangeParam: '7'
                    }
                }
            });

            const input = wrapper.getComponent(MatchQueryNumberRangeInput);
            input.vm.$emit('update:modelValue', '3');

            expect(wrapper.emitted('change')).toEqual([['numberRangeParam', '3']]);
        });
    });

    describe('select param', () => {
        it('renders the expected input', () => {
            const wrapper = shallowMount(MatchQueryParamInput, {
                props: {
                    param: {
                        type: 'select',
                        options: [
                            { name: 'option one', value: 999 },
                            { name: 'option two', value: 998 }
                        ],
                        key: 'selectParam',
                        name: 'test-select'
                    },
                    query: {
                        selectParam: '999'
                    }
                }
            });

            const select = wrapper.getComponent(IplSelect);
            expect(select.vm.label).toEqual('test-select');
            expect(select.vm.modelValue).toEqual('999');
            expect(select.vm.options).toEqual([
                { name: 'option one', value: '999', originalValue: 999 },
                { name: 'option two', value: '998', originalValue: 998 }
            ]);
        });
        
        it('handles the input changing', () => {
            const wrapper = shallowMount(MatchQueryParamInput, {
                props: {
                    param: {
                        type: 'select',
                        options: [
                            { name: 'option one', value: 999 },
                            { name: 'option two', value: 998 }
                        ],
                        key: 'selectParam',
                        name: 'test-select'
                    },
                    query: {
                        selectParam: '999'
                    }
                }
            });

            const select = wrapper.getComponent(IplSelect);
            select.vm.$emit('update:modelValue', '998', { name: 'option two', value: '998', originalValue: 998 });

            expect(wrapper.emitted('change')).toEqual([['selectParam', 998]]);
        });

        it('creates inputs for each parameter attached to the selected option', async () => {
            const query = reactive({
                selectParam: 999
            });
            const params = [
                { type: 'numberRange', min: 1, max: 3, key: 'test-subparam-1', name: 'Test sub-param 1' },
                { type: 'numberRange', min: 2, max: 4, key: 'test-subparam-2', name: 'Test sub-param 2' }
            ];
            const getParams = jest.fn().mockReturnValue(params);
            const wrapper = shallowMount(MatchQueryParamInput, {
                props: {
                    param: {
                        type: 'select',
                        options: [
                            { name: 'option one', value: 999 },
                            { 
                                name: 'option two', 
                                value: 998,
                                getParams
                            }
                        ],
                        key: 'selectParam',
                        name: 'test-select'
                    },
                    query
                }
            });
      
            expect(wrapper.findAllComponents('match-query-param-input-stub').length).toEqual(0);

            query.selectParam = 998;
            await flushPromises();

            expect(getParams).toHaveBeenCalled();
            const subparamElems = wrapper.findAllComponents<typeof MatchQueryParamInput>('match-query-param-input-stub');
            expect(subparamElems.length).toEqual(2);
            expect(subparamElems.at(0).vm.param).toEqual(params[0]);
            expect(subparamElems.at(0).vm.query).toEqual(query);
            expect(subparamElems.at(1).vm.param).toEqual(params[1]);
            expect(subparamElems.at(1).vm.query).toEqual(query);
            expect(wrapper.emitted('loading')).toEqual([[true], [false]]);
        });
    });

    describe('mounted', () => {
        it('emits an event for a parameter being added', () => {
            const wrapper = shallowMount(MatchQueryParamInput, {
                props: {
                    param: {
                        type: 'numberRange',
                        min: 2,
                        max: 9,
                        key: 'numberRangeParam',
                        name: 'test-number-range'
                    },
                    query: {
                        numberRangeParam: '7'
                    }
                }
            });

            expect(wrapper.emitted('parameterAdd')).toEqual([['numberRangeParam']]);
        });

        it('emits an additional event for static params', () => {
            const wrapper = shallowMount(MatchQueryParamInput, {
                props: {
                    param: {
                        type: 'static',
                        value: 'test-static-value',
                        key: 'staticParam',
                        name: 'test-static-param'
                    },
                    query: { }
                }
            });

            expect(wrapper.emitted('parameterAdd')).toEqual([['staticParam']]);
            expect(wrapper.emitted('change')).toEqual([['staticParam', 'test-static-value']]);
        });
    });

    describe('unmounted', () => {
        it('emits events for parameter removal', () => {
            const wrapper = shallowMount(MatchQueryParamInput, {
                props: {
                    param: {
                        type: 'numberRange',
                        min: 2,
                        max: 9,
                        key: 'numberRangeParam',
                        name: 'test-number-range'
                    },
                    query: {
                        numberRangeParam: '7'
                    }
                }
            });

            wrapper.unmount();

            expect(wrapper.emitted('change')).toEqual([['numberRangeParam', undefined]]);
            expect(wrapper.emitted('parameterRemove')).toEqual([['numberRangeParam']]);
        });
    });
});
