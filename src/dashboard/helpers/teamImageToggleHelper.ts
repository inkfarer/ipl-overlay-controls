import { ToggleTeamImageRequest } from 'types/messages/tournamentData';

export function handleTeamImageToggleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const teamId = target.dataset.teamId;
    if (!teamId) {
        throw new Error('Team image toggle has no team ID set');
    }

    nodecg.sendMessage('toggleTeamImage', { teamId: teamId, isVisible: target.checked } as ToggleTeamImageRequest);
}
