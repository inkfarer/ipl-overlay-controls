import random from 'lodash/random';

export function randomFromArray<T>(arr: Array<T>): T {
    if (!arr || !arr.length) return null;
    return arr[random(0, arr.length - 1)];
}
