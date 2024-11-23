import { mockNodecg, replicants } from '../../__mocks__/mockNodecg';
import { BracketController } from '../BracketController';
import { controllerListeners } from '../../__mocks__/MockBaseController';
import { BattlefyImporter } from '@tourneyview/importer';
jest.mock('@tourneyview/importer');

describe('BracketController', () => {
    beforeEach(() => {
        new BracketController(mockNodecg);
    });

    describe('getBracket', () => {
        it('Updates bracket data', async () => {
            replicants.tournamentData = { 
                meta: {
                    source: 'BATTLEFY'
                }
            };
            (BattlefyImporter.prototype.getMatches as jest.Mock).mockResolvedValue('cool-bracket-data');

            await controllerListeners.getBracket({ bracketId: 'cool-bracket' });
            
            expect(BattlefyImporter.prototype.getMatches).toHaveBeenCalledWith({ bracketId: 'cool-bracket' });
            expect(replicants.bracketData).toEqual('cool-bracket-data');
        });
    });
});
