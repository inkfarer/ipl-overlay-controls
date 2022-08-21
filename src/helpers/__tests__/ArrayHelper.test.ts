import random from 'lodash/random';
import { cartesian, prettyPrintList, randomFromArray } from '../ArrayHelper';
import Mock = jest.Mock;

jest.mock('lodash/random');

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

describe('prettyPrintList', () => {
    it('stringifies array', () => {
        expect(prettyPrintList([ 'one', 'two', 'three' ])).toEqual('one, two and three');
        expect(prettyPrintList([ 'one', 'two', 'three', 'four' ])).toEqual('one, two, three and four');
        expect(prettyPrintList([ 'first item', 'second item' ])).toEqual('first item and second item');
    });
});

describe('cartesian', () => {
    it('returns the cartesian product of two arrays', () => {
        expect(cartesian(['test', 'test2'], ['test3', 'test4'])).toEqual([
            ['test', 'test3'],
            ['test', 'test4'],
            ['test2', 'test3'],
            ['test2', 'test4']
        ]);
    });
});
