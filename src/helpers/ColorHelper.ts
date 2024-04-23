import { ColorInfo } from '../types/colors';

export function swapColors(data: ColorInfo): ColorInfo {
    return {
        ...data,
        clrA: data.clrB,
        clrB: data.clrA
    };
}
