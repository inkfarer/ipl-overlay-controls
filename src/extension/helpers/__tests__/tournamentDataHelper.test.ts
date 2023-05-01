import { getTeam } from '../tournamentDataHelper';
import { TournamentData } from 'schemas';
import clone from 'clone';

jest.mock('clone');

describe('tournamentDataHelper', () => {
    const mockClone = jest.mocked(clone);

    beforeEach(() => {
        jest.resetAllMocks();
        mockClone.mockReturnValue('cloned value');
    });

    describe('getTeam', () => {
        it('finds teams and clones the value', () => {
            const team = getTeam('123123', { teams: [{ id: '123123' }, { id: '345345' }]} as TournamentData, true);

            expect(team).toBe('cloned value');
            expect(mockClone).toHaveBeenCalledWith({ id: '123123' });
        });

        it('finds teams and does not clone the value if doClone is false', () => {
            const team = getTeam('456456', { teams: [{ id: '456456' }]} as TournamentData, false);

            expect(team).toEqual({ id: '456456' });
            expect(mockClone).not.toHaveBeenCalled();
        });
    });
});
