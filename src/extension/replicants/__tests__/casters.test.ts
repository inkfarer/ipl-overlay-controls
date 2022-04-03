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

    describe('setCasterOrder', () => {
        it.each([null, undefined, '', {}])('returns an error if an no data is given', (data: unknown) => {
            const ack = jest.fn();

            messageListeners.setCasterOrder({ casterIds: data }, ack);

            expect(ack).toHaveBeenCalledWith(new Error('"casterIds" must be provided as a list of strings.'));
        });

        it('returns an error if all caster IDs are not given', () => {
            const ack = jest.fn();
            replicants.casters = { aa: {  }, bb: { } };

            messageListeners.setCasterOrder({ casterIds: ['aa']}, ack);

            expect(ack).toHaveBeenCalledWith(new Error('Could not re-order casters as caster ID list has unknown or missing IDs'));
        });

        it('returns an error if too many caster IDs are given', () => {
            const ack = jest.fn();
            replicants.casters = { aa: {  }, bb: { } };

            messageListeners.setCasterOrder({ casterIds: ['bb', 'aa', 'cc']}, ack);

            expect(ack).toHaveBeenCalledWith(new Error('Could not re-order casters as caster ID list has unknown or missing IDs'));
        });

        it('returns an error if an unknown caster ID is given', () => {
            const ack = jest.fn();
            replicants.casters = { aa: {  }, bb: { } };

            messageListeners.setCasterOrder({ casterIds: ['cc', 'aa']}, ack);

            expect(ack).toHaveBeenCalledWith(new Error('Could not re-order casters as caster ID list has unknown or missing IDs'));
        });

        it('updates the order casters appear in', () => {
            const ack = jest.fn();
            replicants.casters = {
                aa: {
                    name: 'Caster AA',
                    twitter: '@aa',
                    pronouns: 'aa/a'
                },
                bb: {
                    name: 'Caster BB',
                    twitter: '@bb',
                    pronouns: 'bb/b'
                },
                cc: {
                    name: 'Caster CC',
                    twitter: '@cc',
                    pronouns: 'c/cc'
                }
            };

            messageListeners.setCasterOrder({ casterIds: ['cc', 'bb', 'aa']}, ack);

            // Jest doesn't care about order when checking object equality.
            expect(Object.values(replicants.casters)).toStrictEqual([
                {
                    name: 'Caster CC',
                    twitter: '@cc',
                    pronouns: 'c/cc'
                },
                {
                    name: 'Caster BB',
                    twitter: '@bb',
                    pronouns: 'bb/b'
                },
                {
                    name: 'Caster AA',
                    twitter: '@aa',
                    pronouns: 'aa/a'
                }
            ]);
            expect(ack).toHaveBeenCalledWith(null);
        });
    });
});
