export enum PlayType {
    PLAY_ALL = 'PLAY_ALL',
    BEST_OF = 'BEST_OF'
}

export class PlayTypeHelper {
    static toPrettyString(value: PlayType, gameCount: number): string {
        return {
            [PlayType.PLAY_ALL]: `Play all ${gameCount}`,
            [PlayType.BEST_OF]: `Best of ${gameCount}`
        }[value];
    }
}
