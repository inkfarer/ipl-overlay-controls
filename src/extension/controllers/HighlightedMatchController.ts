import { BaseController } from './BaseController';
import type NodeCG from '@nodecg/types';
import { HighlightedMatchService } from '../services/HighlightedMatchService';

export class HighlightedMatchController extends BaseController {
    constructor(nodecg: NodeCG.ServerAPI, highlightedMatchService: HighlightedMatchService) {
        super(nodecg);

        this.listen('highlightedMatches:import', async (data) => {
            return highlightedMatchService.get(data);
        });
    }
}
