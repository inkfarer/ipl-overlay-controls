import type NodeCG from '@nodecg/types';
import { Configschema, HighlightedMatches, TournamentData } from 'schemas';
import { GetHighlightedMatchesMessage } from 'types/messages/highlightedMatches';
import { getBattlefyMatches } from '../importers/clients/battlefyClient';
import i18next from 'i18next';
import { getSmashGGStreamQueue } from '../importers/clients/smashggClient';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';

export class HighlightedMatchService {
    private nodecg: NodeCG.ServerAPI<Configschema>;
    private tournamentData: NodeCG.ServerReplicant<TournamentData>;
    private highlightedMatches: NodeCG.ServerReplicant<HighlightedMatches>;

    constructor(nodecg: NodeCG.ServerAPI) {
        this.nodecg = nodecg;
        this.tournamentData = nodecg.Replicant('tournamentData');
        this.highlightedMatches = nodecg.Replicant('highlightedMatches');
    }

    async get(message: GetHighlightedMatchesMessage) {
        switch (this.tournamentData.value.meta.source) {
            case TournamentDataSource.BATTLEFY:
                return this.getBattlefyMatches(message);
            case TournamentDataSource.SMASHGG:
                return this.getStartggMatches(message);
            default:
                throw new Error(i18next.t('highlightedMatches.unsupportedSource', { source: this.tournamentData.value.meta.source }));
        }
    }

    private async getBattlefyMatches(message: GetHighlightedMatchesMessage) {
        if (message.stages == null && !message.getAllMatches) {
            throw new Error(i18next.t('highlightedMatches.missingArguments'));
        }
        this.updateHighlightedMatches(await getBattlefyMatches(
            this.tournamentData.value.meta.id,
            message.stages,
            message.getAllMatches));
    }

    private async getStartggMatches(message: GetHighlightedMatchesMessage) {
        const apiKey = this.nodecg.bundleConfig?.smashgg?.apiKey;
        if (apiKey == null) {
            throw new Error(i18next.t('common.missingStartggApiKey'));
        }
        if (message.streamIDs == null && !message.getAllMatches) {
            throw new Error(i18next.t('highlightedMatches.missingArguments'));
        }
        this.updateHighlightedMatches(await getSmashGGStreamQueue(
            this.tournamentData.value.meta.id,
            apiKey,
            this.tournamentData.value.meta.sourceSpecificData.smashgg.eventData.id,
            message.streamIDs,
            message.getAllMatches));
    }

    private updateHighlightedMatches(data: HighlightedMatches) {
        if (data.length === 0) return;

        data.sort((a, b) => {
            const keyA = `${a.meta.stageName} ${a.meta.name}`;
            const keyB = `${b.meta.stageName} ${b.meta.name}`;

            if (keyA < keyB) {
                return -1;
            }
            if (keyA > keyB) {
                return 1;
            }
            return 0;
        });
        this.highlightedMatches.value = data;
    }
}
