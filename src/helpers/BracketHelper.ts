import { BattlefyImporter, MatchImporter, MatchQueryResult, StartggImporter } from '@tourneyview/importer';
import { TournamentDataSource } from '../types/enums/tournamentDataSource';
import { Configschema } from '../types/schemas';

export function getMatchImporter(
    source: TournamentDataSource,
    bundleConfig: Configschema
): MatchImporter<MatchQueryResult> {
    switch (source) {
        case TournamentDataSource.BATTLEFY:
            return new BattlefyImporter();
        case TournamentDataSource.SMASHGG:
            return new StartggImporter(bundleConfig.smashgg?.apiKey);
        default:
            throw new Error(`Cannot get importer for source '${source}'`);
    }
}
