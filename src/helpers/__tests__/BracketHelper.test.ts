import { BattlefyImporter, StartggImporter } from '@tourneyview/importer';
import { TournamentDataSource } from '../../types/enums/tournamentDataSource';
import { getMatchImporter } from '../BracketHelper';
jest.mock('@tourneyview/importer');

describe('BracketHelper', () => {
    describe('getMatchImporter', () => {
        it('returns the expected result for battlefy tournaments', () => {
            const result = getMatchImporter(TournamentDataSource.BATTLEFY, null);

            expect(result).toBeInstanceOf(BattlefyImporter);
        });
        
        it('returns the expected result for start.gg tournaments', () => {
            const result = getMatchImporter(TournamentDataSource.SMASHGG, { smashgg: { apiKey: 'test-api-key' } });

            expect(result).toBeInstanceOf(StartggImporter);
            expect(StartggImporter).toHaveBeenCalledWith('test-api-key');
        });
    });
});
