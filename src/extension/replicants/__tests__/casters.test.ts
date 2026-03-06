import { messageListeners, mockNodecg, replicants } from '../../__mocks__/mockNodecg';
import * as GenerateId from '../../../helpers/generateId';
import { mock } from 'jest-mock-extended';
import { BundleCasterSets, Casters } from 'schemas';

const mockGenerateId = mock<typeof GenerateId>();
jest.mock('../../../helpers/generateId', () => mockGenerateId);

describe('casters', () => {
    require('../casters');

    beforeEach(() => {
        replicants.bundleCasterSets = {
            'other-bundle': {
                'test-caster-set': {}
            }
        };
        jest.resetAllMocks();
    });

    describe('removeCaster', () => {
        it('removes caster for current bundle', () => {
            replicants.casters = {
                '123123': {
                    name: 'cool caster'
                },
                '567567': {
                    name: 'less cool caster'
                }
            };

            messageListeners.removeCaster({ bundleName: mockNodecg.bundleName, id: '567567' }, jest.fn());

            expect(replicants.casters).toEqual({
                '123123': {
                    name: 'cool caster'
                }
            });
        });

        it('throws error if given caster does not exist for current bundle', () => {
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

            messageListeners.removeCaster({ bundleName: mockNodecg.bundleName, id: 'some id that does not exist' }, ack);

            expect(replicants.casters).toEqual(initialCasters);
            expect(ack).toHaveBeenCalledWith(new Error('translation:casters.casterNotFound'));
        });

        it('removes caster for other bundle', () => {
            // @ts-ignore
            replicants.bundleCasterSets['other-bundle']['test-caster-set'] = {
                '123123': {
                    name: 'cool caster'
                },
                '567567': {
                    name: 'less cool caster'
                }
            };

            messageListeners.removeCaster({ bundleName: 'other-bundle', casterSetKey: 'test-caster-set', id: '567567' }, jest.fn());

            expect(replicants.bundleCasterSets).toEqual({
                'other-bundle': {
                    'test-caster-set': {
                        '123123': {
                            name: 'cool caster'
                        }
                    }
                }
            });
        });

        it('throws error if given caster does not exist for other bundle', () => {
            const initialCasters = {
                '123123': {
                    name: 'cool caster'
                },
                '567567': {
                    name: 'less cool caster'
                }
            };
            // @ts-ignore
            replicants.bundleCasterSets['other-bundle']['test-caster-set'] = initialCasters;
            const ack = jest.fn();

            messageListeners.removeCaster({ bundleName: 'other-bundle', casterSetKey: 'test-caster-set', id: 'some id that does not exist' }, ack);

            expect((replicants.bundleCasterSets as BundleCasterSets)['other-bundle']['test-caster-set']).toEqual(initialCasters);
            expect(ack).toHaveBeenCalledWith(new Error('translation:casters.casterNotFound'));
        });
    });

    describe('saveCaster', () => {
        it('saves given data for current bundle with random id and returns the id', () => {
            mockGenerateId.generateId.mockReturnValue('new id');
            replicants.casters = {};
            const ack = jest.fn();

            messageListeners.saveCaster({ bundleName: mockNodecg.bundleName, caster: { name: 'new caster' } }, ack);

            expect(replicants.casters).toEqual({
                'new id': {
                    name: 'new caster'
                }
            });
            expect(ack).toHaveBeenCalledWith(null, 'new id');
        });

        it('saves given data for other bundle with random id and returns the id', () => {
            mockGenerateId.generateId.mockReturnValue('new id');
            const ack = jest.fn();

            messageListeners.saveCaster({ bundleName: 'other-bundle', casterSetKey: 'test-caster-set', caster: { name: 'new caster' } }, ack);

            expect(replicants.bundleCasterSets).toEqual({
                'other-bundle': {
                    'test-caster-set': {
                        'new id': {
                            name: 'new caster'
                        }
                    }
                }
            });
            expect(ack).toHaveBeenCalledWith(null, 'new id');
        });
    });

    describe('setCasterOrder', () => {
        describe.each([
            [
                'used with current bundle\'s casters',
                { bundleName: mockNodecg.bundleName },
                () => replicants.casters,
                (newValue: Casters) => replicants.casters = newValue
            ],
            [
                'used with other bundle\'s casters',
                { bundleName: 'other-bundle', casterSetKey: 'test-caster-set' },
                // @ts-ignore
                () => replicants.bundleCasterSets['other-bundle']['test-caster-set'],
                // @ts-ignore
                (newValue: Casters) => replicants.bundleCasterSets['other-bundle']['test-caster-set'] = newValue
            ]
        ])('%s', (
            _,
            options: { bundleName: string, casterSetKey?: string },
            casterListGetter: () => Casters,
            casterListSetter: (newValue: Casters) => Casters,
        ) => {
            it.each([null, undefined, '', {}])('returns an error if no data is given (%#)', (data: unknown) => {
                const ack = jest.fn();

                messageListeners.setCasterOrder({ ...options, casterIds: data }, ack);

                expect(ack).toHaveBeenCalledWith(new Error('translation:invalidArgumentsError'));
            });

            it('returns an error if all caster IDs are not given', () => {
                const ack = jest.fn();
                replicants.casters = { aa: {  }, bb: { } };

                messageListeners.setCasterOrder({ ...options, casterIds: ['aa']}, ack);

                expect(ack).toHaveBeenCalledWith(new Error('translation:casters.badCasterIdListForReordering'));
            });

            it('returns an error if too many caster IDs are given', () => {
                const ack = jest.fn();
                replicants.casters = { aa: {  }, bb: { } };

                messageListeners.setCasterOrder({ ...options, casterIds: ['bb', 'aa', 'cc']}, ack);

                expect(ack).toHaveBeenCalledWith(new Error('translation:casters.badCasterIdListForReordering'));
            });

            it('returns an error if an unknown caster ID is given', () => {
                const ack = jest.fn();
                replicants.casters = { aa: {  }, bb: { } };

                messageListeners.setCasterOrder({ ...options, casterIds: ['cc', 'aa']}, ack);

                expect(ack).toHaveBeenCalledWith(new Error('translation:casters.badCasterIdListForReordering'));
            });

            it('updates the order casters appear in', () => {
                const ack = jest.fn();
                casterListSetter({
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
                });

                messageListeners.setCasterOrder({ ...options, casterIds: ['cc', 'bb', 'aa']}, ack);

                // Jest doesn't care about order when checking object equality.
                expect(Object.values(casterListGetter())).toStrictEqual([
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
});
