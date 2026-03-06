import { mockNodecg, replicants } from '../../__mocks__/mockNodecg';
import { BundleConfigDeclarationService } from '../BundleConfigDeclarationService';
import { BundleDeclaredConfig } from 'schemas';

describe('BundleConfigDeclarationService', () => {
    let service: BundleConfigDeclarationService;

    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();
        service = new BundleConfigDeclarationService(mockNodecg);
        replicants.bundleDeclaredConfig = {};
        replicants.bundleCasterSets = {};
    });

    describe('declareCustomScenes', () => {
        it('declares custom scenes', () => {
            service.declareCustomScenes('graphics-bundle', [
                { name: 'Casters', value: 'casters' },
                { names: { EN: 'Bracket', JA: 'ブラケット' }, value: 'bracket' }
            ]);

            expect(replicants.bundleDeclaredConfig).toEqual({
                'graphics-bundle': {
                    scenes: [
                        { names: { EN: 'Casters' }, value: 'casters' },
                        { names: { EN: 'Bracket', JA: 'ブラケット' }, value: 'bracket' }
                    ]
                }
            });
        });

        it('does not override other config', () => {
            service.declareCasterSets('graphics-bundle', [{ name: 'Analysis desk', key: 'analysisDesk', maxItems: 3 }]);

            service.declareCustomScenes('graphics-bundle-2', [
                { name: 'Casters', value: 'casters' }
            ]);
            service.declareCustomScenes('graphics-bundle', [
                { name: 'Casters', value: 'casters' },
                { names: { EN: 'Bracket', JA: 'ブラケット' }, value: 'bracket' }
            ]);

            expect((replicants.bundleDeclaredConfig as BundleDeclaredConfig)['graphics-bundle'].casterSets.length).toEqual(1);
            expect((replicants.bundleDeclaredConfig as BundleDeclaredConfig)['graphics-bundle-2'].scenes.length).toEqual(1);
            expect((replicants.bundleDeclaredConfig as BundleDeclaredConfig)['graphics-bundle'].scenes.length).toEqual(2);
        });

        it('may be called more than once to override its own config', () => {
            service.declareCustomScenes('graphics-bundle', [
                { name: 'Test', value: 'test' }
            ]);
            service.declareCustomScenes('graphics-bundle', [
                { name: 'Casters', value: 'casters' },
                { names: { EN: 'Bracket', JA: 'ブラケット' }, value: 'bracket' }
            ]);

            expect(replicants.bundleDeclaredConfig).toEqual({
                'graphics-bundle': {
                    scenes: [
                        { names: { EN: 'Casters' }, value: 'casters' },
                        { names: { EN: 'Bracket', JA: 'ブラケット' }, value: 'bracket' }
                    ]
                }
            });
        });
    });

    describe('declareCasterSets', () => {
        it('declares caster sets', () => {
            service.declareCasterSets('graphics-bundle', [
                { name: 'Analysts', key: 'analysts', maxItems: 4 },
                { names: { EN: 'Interview', JA: 'インタービュー' }, key: 'interview', maxItems: 6 },
            ]);

            expect(replicants.bundleDeclaredConfig).toEqual({
                'graphics-bundle': {
                    casterSets: [
                        { names: { EN: 'Analysts' }, key: 'analysts', maxItems: 4 },
                        { names: { EN: 'Interview', JA: 'インタービュー' }, key: 'interview', maxItems: 6 },
                    ]
                }
            });
        });

        it('does not override other config', () => {
            service.declareCustomScenes('graphics-bundle', [{ name: 'Casters', value: 'casters' }]);

            service.declareCasterSets('graphics-bundle-2', [{ name: 'Analysis desk', key: 'analysisDesk', maxItems: 3 }]);
            service.declareCasterSets('graphics-bundle', [{ name: 'Analysis desk', key: 'analysisDesk', maxItems: 3 }]);

            expect((replicants.bundleDeclaredConfig as BundleDeclaredConfig)['graphics-bundle'].scenes.length).toEqual(1);
            expect((replicants.bundleDeclaredConfig as BundleDeclaredConfig)['graphics-bundle-2'].casterSets.length).toEqual(1);
            expect((replicants.bundleDeclaredConfig as BundleDeclaredConfig)['graphics-bundle'].casterSets.length).toEqual(1);
        });

        it('may be called more than once to override its own config', () => {
            service.declareCasterSets('graphics-bundle', [{ name: 'Analysis desk', key: 'analysisDesk', maxItems: 3 }]);
            service.declareCasterSets('graphics-bundle', [
                { name: 'Analysts', key: 'analysts', maxItems: 4 },
                { names: { EN: 'Interview', JA: 'インタービュー' }, key: 'interview', maxItems: 6 },
            ]);

            expect(replicants.bundleDeclaredConfig).toEqual({
                'graphics-bundle': {
                    casterSets: [
                        { names: { EN: 'Analysts' }, key: 'analysts', maxItems: 4 },
                        { names: { EN: 'Interview', JA: 'インタービュー' }, key: 'interview', maxItems: 6 },
                    ]
                }
            });
        });
    });
});
