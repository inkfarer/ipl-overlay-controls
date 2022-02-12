import random from 'lodash/random';
import Mock = jest.Mock;

jest.mock('lodash/random');

import { randomFromArray } from '../array';

describe('randomFromArray', () => {
    it('gets random item from array', () => {
        (random as Mock).mockReturnValueOnce(2).mockReturnValueOnce(1);
        const arr = ['one', 'two', 'three'];

        expect(randomFromArray(arr)).toEqual('three');
        expect(randomFromArray(arr)).toEqual('two');
        expect(random).toHaveBeenCalledWith(0, 2);
        expect(random).toHaveBeenCalledTimes(2);
    });
});
