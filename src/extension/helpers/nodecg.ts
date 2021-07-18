import type { NodeCG, NodeCGStatic } from 'nodecg/server';

let nodecg: NodeCG & NodeCGStatic;

export function set(ctx: NodeCG & NodeCGStatic): void {
    nodecg = ctx;
}

export function get(): NodeCG & NodeCGStatic {
    return nodecg;
}
