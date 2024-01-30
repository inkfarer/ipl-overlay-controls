export enum TournamentDataSource {
    BATTLEFY = 'BATTLEFY',
    SMASHGG = 'SMASHGG',
    UPLOAD = 'UPLOAD',
    SENDOU_INK = 'SENDOU_INK',
    UNKNOWN = 'UNKNOWN'
}

export class TournamentDataSourceHelper {
    static toPrettyString(value: TournamentDataSource | `${TournamentDataSource}`): string {
        return {
            [TournamentDataSource.BATTLEFY]: 'Battlefy',
            [TournamentDataSource.SMASHGG]: 'Smash.gg',
            [TournamentDataSource.UPLOAD]: 'Uploaded file',
            [TournamentDataSource.SENDOU_INK]: 'sendou.ink',
            [TournamentDataSource.UNKNOWN]: 'Unknown'
        }[value];
    }
}
