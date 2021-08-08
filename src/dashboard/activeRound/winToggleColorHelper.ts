import { GameWinner } from 'types/enums/gameWinner';
import { getWinToggles } from './toggleHelper';
import { getContrastingTextColor } from '../helpers/colorHelper';

export function updateWinToggleColors(index: number, clrA: string, clrB: string): void {
    const buttons = getWinToggles(index);
    setWinToggleColor(buttons[GameWinner.ALPHA], clrA);
    setWinToggleColor(buttons[GameWinner.BRAVO], clrB);
}

export function setWinToggleColor(button: HTMLButtonElement, color: string): void {
    button.style.backgroundColor = color;
    button.style.color = getContrastingTextColor(color);

    const borderWidth = button.disabled ? '8px' : '0';
    if (button.classList.contains('team-a-win-toggle')) {
        button.style.borderLeft = `${borderWidth} solid ${color}`;
    } else if (button.classList.contains('team-b-win-toggle')) {
        button.style.borderRight = `${borderWidth} solid ${color}`;
    }
}
