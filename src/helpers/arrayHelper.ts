export function cartesian<A, B>(a: Array<A>, b: Array<B>): Array<[A, B]> {
    return [].concat(...a.map(d => b.map(e => [].concat(d, e))));
}
