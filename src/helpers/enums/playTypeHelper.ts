import { PlayType } from '../../types/enums/playType';

export class PlayTypeHelper {
    static toPrettyString(value: PlayType, gameCount?: number): string {
        const count = !gameCount ? '' : ` ${gameCount}`;
        return {
            [PlayType.PLAY_ALL]: `Play all${count}`,
            [PlayType.BEST_OF]: `Best of${count}`
        }[value];
    }

    static fromBattlefySeriesStyle(value: string): PlayType | undefined {
        switch (value?.toLowerCase()) {
            case 'gamespermatch':
                return PlayType.PLAY_ALL;
            case 'bestof':
                return PlayType.BEST_OF;
            default:
                return undefined;
        }
    }

    static fromSmashggSetGamesType(value: number): PlayType | undefined {
        switch (value) {
            case 1:
                return PlayType.BEST_OF;
            case 2:
                return PlayType.PLAY_ALL;
            default:
                return undefined;
        }
    }
}
