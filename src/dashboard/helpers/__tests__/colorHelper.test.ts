import { fillColorSelector, getContrastingTextColor, hexToRbg } from '../colorHelper';

describe('colorHelper', () => {
    describe('fillColorSelector', () => {
        it('creates option groups', () => {
            const select = document.createElement('select');

            fillColorSelector(select);

            expect(select.innerHTML).toEqual('<optgroup label="Ranked Modes"><option value="ranked-modes_0" data-index="0" data-first-color="#37FC00" data-second-color="#7D28FC" data-category-name="Ranked Modes">Green vs Grape</option><option value="ranked-modes_1" data-index="1" data-first-color="#04D976" data-second-color="#D600AB" data-category-name="Ranked Modes">Green vs Magenta</option><option value="ranked-modes_2" data-index="2" data-first-color="#10E38F" data-second-color="#FB7B08" data-category-name="Ranked Modes">Turquoise vs Orange</option><option value="ranked-modes_3" data-index="3" data-first-color="#FF9E03" data-second-color="#B909E0" data-category-name="Ranked Modes">Mustard vs Purple</option><option value="ranked-modes_4" data-index="4" data-first-color="#2F27CC" data-second-color="#37FC00" data-category-name="Ranked Modes">Dark Blue vs Green</option><option value="ranked-modes_5" data-index="5" data-first-color="#B909E0" data-second-color="#37FC00" data-category-name="Ranked Modes">Purple vs Green</option><option value="ranked-modes_6" data-index="6" data-first-color="#FEF232" data-second-color="#2ED2FE" data-category-name="Ranked Modes">Yellow vs Blue</option></optgroup><optgroup label="Turf War"><option value="turf-war_0" data-index="0" data-first-color="#D1E004" data-second-color="#960CB2" data-category-name="Turf War">Yellow vs Purple</option><option value="turf-war_1" data-index="1" data-first-color="#E61077" data-second-color="#361CB8" data-category-name="Turf War">Pink vs Blue</option><option value="turf-war_2" data-index="2" data-first-color="#ED0C6A" data-second-color="#D5E802" data-category-name="Turf War">Pink vs Yellow</option><option value="turf-war_3" data-index="3" data-first-color="#6B10CC" data-second-color="#08CC81" data-category-name="Turf War">Purple vs Turquoise</option><option value="turf-war_4" data-index="4" data-first-color="#E30960" data-second-color="#02ADCF" data-category-name="Turf War">Pink vs Light Blue</option><option value="turf-war_5" data-index="5" data-first-color="#5617C2" data-second-color="#FF5F03" data-category-name="Turf War">Purple vs Orange</option><option value="turf-war_6" data-index="6" data-first-color="#E60572" data-second-color="#1BBF0F" data-category-name="Turf War">Pink vs Green</option></optgroup><optgroup label="Color Lock"><option value="color-lock_0" data-index="0" data-first-color="#FEF232" data-second-color="#2F27CC" data-category-name="Color Lock">Yellow vs Blue (Color Lock)</option></optgroup><optgroup label="Custom Color"><option value="custom-color_999" data-index="999" data-first-color="#000000" data-second-color="#FFFFFF" data-category-name="Custom Color" disabled="">Custom Color</option></optgroup>');
        });
    });

    describe('getContrastingTextColor', () => {
        it('returns a dark color if applicable', () => {
            expect(getContrastingTextColor('#ffffff')).toEqual('#333');
            expect(getContrastingTextColor('#00ff00')).toEqual('#333');
            expect(getContrastingTextColor('ffff00')).toEqual('#333');
        });

        it('returns a light color if applicable', () => {
            expect(getContrastingTextColor('#0000ff')).toEqual('white');
            expect(getContrastingTextColor('#A80000')).toEqual('white');
            expect(getContrastingTextColor('005238')).toEqual('white');
        });
    });

    describe('hexToRbg', () => {
        it('converts hex colors to RGB values', () => {
            expect(hexToRbg('#0053EA')).toEqual({ r: 0, g: 83, b: 234 });
            expect(hexToRbg('#EA06D1')).toEqual({ r: 234, g: 6, b: 209 });
        });
    });
});
