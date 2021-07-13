export enum TournamentDataSource {
    BATTLEFY = 'BATTLEFY',
    SMASHGG = 'SMASHGG',
    UPLOAD = 'UPLOAD',
    UNKNOWN = 'UNKNOWN'
}

export class TournamentDataSourceHelper {
    static toPrettyString(value: TournamentDataSource): string {
        return {
            [TournamentDataSource.BATTLEFY]: 'Battlefy',
            [TournamentDataSource.SMASHGG]: 'Smash.gg',
            [TournamentDataSource.UPLOAD]: 'Uploaded file',
            [TournamentDataSource.UNKNOWN]: 'Unknown'
        }[value];
    }
}
