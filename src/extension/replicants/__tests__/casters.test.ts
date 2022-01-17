import { MockNodecg } from '../../__mocks__/mockNodecg';

describe('casters', () => {
    let nodecg: MockNodecg;

    const mockGenerateId = jest.fn();

    jest.mock('../../../helpers/generateId', () => ({
        __esModule: true,
        generateId: mockGenerateId
    }));

    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();
        nodecg = new MockNodecg();
        nodecg.init();

        require('../casters');
    });

    describe('removeCaster', () => {
        it('removes caster', () => {
            nodecg.replicants.casters.value = {
                '123123': {
                    name: 'cool caster'
                },
                '567567': {
                    name: 'less cool caster'
                }
            };

            nodecg.messageListeners.removeCaster({ id: '567567' }, jest.fn());

            expect(nodecg.replicants.casters.value).toEqual({
                '123123': {
                    name: 'cool caster'
                }
            });
        });

        it('throws error if given caster does not exist', () => {
            const initialCasters = {
                '123123': {
                    name: 'cool caster'
                },
                '567567': {
                    name: 'less cool caster'
                }
            };
            nodecg.replicants.casters.value = initialCasters;
            const ack = jest.fn();

            nodecg.messageListeners.removeCaster({ id: 'some id that does not exist' }, ack);

            expect(nodecg.replicants.casters.value).toEqual(initialCasters);
            expect(ack).toHaveBeenCalledWith(new Error('Caster \'some id that does not exist\' not found.'));
        });
    });

    describe('saveCaster', () => {
        it('saves given data with random id and returns the id', () => {
            mockGenerateId.mockReturnValue('new id');
            nodecg.replicants.casters.value = {};
            const ack = jest.fn();

            nodecg.messageListeners.saveCaster({ name: 'new caster' }, ack);

            expect(nodecg.replicants.casters.value).toEqual({
                'new id': {
                    name: 'new caster'
                }
            });
            expect(ack).toHaveBeenCalledWith(null, 'new id');
        });
    });
});
