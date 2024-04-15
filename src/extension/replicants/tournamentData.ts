import type NodeCG from '@nodecg/types';
import { getTeam } from '../helpers/tournamentDataHelper';
import * as nodecgContext from '../helpers/nodecg';
import { ActiveRound, ActiveRoundTeam, NextRound, TournamentData } from 'schemas';
import { ToggleTeamImageRequest } from 'types/messages/tournamentData';
import { Team } from 'types/team';
import i18next from 'i18next';

const nodecg = nodecgContext.get();

const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');
const activeRound = nodecg.Replicant<ActiveRound>('activeRound');
const nextRound = nodecg.Replicant<NextRound>('nextRound');

nodecg.listenFor('toggleTeamImage', ( data: ToggleTeamImageRequest, ack: NodeCG.UnhandledAcknowledgement ) => {
    const team = tournamentData.value.teams.filter(team => team.id === data.teamId)[0];
    if (team == null) {
        return ack(new Error(i18next.t('tournamentData.teamNotFound')));
    }

    team.showLogo = data.isVisible;
    updateTournamentData();
});

function updateTournamentData() {
    activeRound.value.teamA = updateFromTournamentData(activeRound.value.teamA);
    activeRound.value.teamB = updateFromTournamentData(activeRound.value.teamB);
    nextRound.value.teamA = updateFromTournamentData(nextRound.value.teamA);
    nextRound.value.teamB = updateFromTournamentData(nextRound.value.teamB);
}

function updateFromTournamentData<T extends Team | ActiveRoundTeam>(value: T): T {
    const newData = getTeam(value.id, tournamentData.value);
    return {
        ...value,
        ...newData
    };
}
