import random from 'lodash/random';

export function randomFromArray<T>(arr: Array<T>): T {
    if (!arr || !arr.length) return null;
    return arr[random(0, arr.length - 1)];
}

export function prettyPrintList(arr: Array<string>): string {
    return arr.reduce((result, item, index) => {
        result += item;

        if (index === arr.length - 2) {
            result += ' and ';
        } else if (index !== arr.length - 1) {
            result += ', ';
        }

        return result;
    }, '');
}

export function cartesian<A, B>(a: Array<A>, b: Array<B>): Array<[A, B]> {
    return [].concat(...a.map(d => b.map(e => [].concat(d, e))));
}
