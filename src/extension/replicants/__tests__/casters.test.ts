import { messageListeners, replicants } from '../../__mocks__/mockNodecg';
import * as GenerateId from '../../../helpers/generateId';
import { mock } from 'jest-mock-extended';

const mockGenerateId = mock<typeof GenerateId>();
jest.mock('../../../helpers/generateId', () => mockGenerateId);

describe('casters', () => {
    require('../casters');

    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('removeCaster', () => {
        it('removes caster', () => {
            replicants.casters = {
                '123123': {
                    name: 'cool caster'
                },
                '567567': {
                    name: 'less cool caster'
                }
            };

            messageListeners.removeCaster({ id: '567567' }, jest.fn());

            expect(replicants.casters).toEqual({
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
            replicants.casters = initialCasters;
            const ack = jest.fn();

            messageListeners.removeCaster({ id: 'some id that does not exist' }, ack);

            expect(replicants.casters).toEqual(initialCasters);
            expect(ack).toHaveBeenCalledWith(new Error('Caster \'some id that does not exist\' not found.'));
        });
    });

    describe('saveCaster', () => {
        it('saves given data with random id and returns the id', () => {
            mockGenerateId.generateId.mockReturnValue('new id');
            replicants.casters = {};
            const ack = jest.fn();

            messageListeners.saveCaster({ name: 'new caster' }, ack);

            expect(replicants.casters).toEqual({
                'new id': {
                    name: 'new caster'
                }
            });
            expect(ack).toHaveBeenCalledWith(null, 'new id');
        });
    });
});
