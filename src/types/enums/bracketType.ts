export enum BracketType {
    SWISS = 'SWISS',
    DOUBLE_ELIMINATION = 'DOUBLE_ELIMINATION',
    SINGLE_ELIMINATION = 'SINGLE_ELIMINATION',
    ROUND_ROBIN = 'ROUND_ROBIN',
    LADDER = 'LADDER'
}

export class BracketTypeHelper {
    static fromBattlefy(type: string, style?: string): BracketType {
        if (type === 'elimination') {
            if (style == null) {
                throw new Error('Got bracket type "elimination" from Battlefy without "style" parameter '
                    + '(single or double?)');
            }

            return {
                single: BracketType.SINGLE_ELIMINATION,
                double: BracketType.DOUBLE_ELIMINATION
            }[style];
        }

        return {
            ladder: BracketType.LADDER,
            swiss: BracketType.SWISS,
            roundrobin: BracketType.ROUND_ROBIN
        }[type];
    }
}
