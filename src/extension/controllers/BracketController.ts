import NodeCG from '@nodecg/types';
import { BaseController } from './BaseController';
import { Configschema, TournamentData } from 'types/schemas';
import { MatchImporter, MatchQueryResult } from '@tourneyview/importer';
import { Bracket } from '@tourneyview/common';
import { getMatchImporter } from '../../helpers/BracketHelper';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';

export class BracketController extends BaseController {
    private tournamentData: NodeCG.ServerReplicant<TournamentData>;
    private bracketData: NodeCG.ServerReplicant<Bracket>;

    constructor(nodecg: NodeCG.ServerAPI) {
        super(nodecg);

        this.tournamentData = nodecg.Replicant('tournamentData');
        this.bracketData = nodecg.Replicant('bracketData');

        this.listen('getBracket', async (query) => {
            const importer = this.getImporter(nodecg.bundleConfig);
            this.bracketData.value = await importer.getMatches(query);
        });
    }

    private getImporter(bundleConfig: Configschema): MatchImporter<MatchQueryResult> {
        const tournamentSource = this.tournamentData.value.meta.source;
        return getMatchImporter(tournamentSource as TournamentDataSource, bundleConfig);
    }
}
