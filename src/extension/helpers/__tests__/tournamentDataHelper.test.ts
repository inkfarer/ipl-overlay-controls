import { getTeam } from '../tournamentDataHelper';
import { TournamentData } from 'schemas';
import { mocked } from 'ts-jest/utils';
import clone from 'clone';

jest.mock('clone');

describe('tournamentDataHelper', () => {
    const mockClone = mocked(clone).mockReturnValue('cloned value');

    afterEach(() => {
        jest.resetAllMocks();
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
