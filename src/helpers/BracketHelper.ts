import {
    BattlefyImporter,
    MatchImporter,
    MatchQueryResult,
    SendouInkImporter,
    StartggImporter
} from '@tourneyview/importer';
import { TournamentDataSource } from '../types/enums/tournamentDataSource';
import { Configschema } from '../types/schemas';
import i18next from 'i18next';

export function getMatchImporter(
    source: TournamentDataSource,
    bundleConfig: Configschema
): MatchImporter<MatchQueryResult> {
    switch (source) {
        case TournamentDataSource.BATTLEFY:
            return new BattlefyImporter();
        case TournamentDataSource.SMASHGG:
            return new StartggImporter(bundleConfig.smashgg?.apiKey);
        case TournamentDataSource.SENDOU_INK:
            return new SendouInkImporter(bundleConfig.sendouInk?.apiKey);
        default:
            throw new Error(i18next.t('common:brackets.unsupportedSourceError', { source }));
    }
}
