export enum GameVersion {
    SPLATOON_2 = 'SPLATOON_2',
    SPLATOON_3 = 'SPLATOON_3'
}

export class GameVersionHelper {
    static toPrettyString(value: GameVersion): string {
        return {
            [GameVersion.SPLATOON_2]: 'Splatoon 2',
            [GameVersion.SPLATOON_3]: 'Splatoon 3'
        }[value];
    }
}
