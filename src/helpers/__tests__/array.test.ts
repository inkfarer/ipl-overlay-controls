import random from 'lodash/random';
import { prettyPrintList, randomFromArray } from '../array';
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
