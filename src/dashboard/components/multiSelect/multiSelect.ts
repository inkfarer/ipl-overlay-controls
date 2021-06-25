class MultiSelect extends HTMLElement {
    select: HTMLSelectElement;
    selectedElemDisplay: HTMLDivElement;
    selectedOptions: HTMLOptionElement[];

    constructor() {
        super();

        const template = document.createElement('template');
        template.innerHTML = `
            <div class="select-wrapper" id="select-wrapper">
                <slot></slot>
            </div>`;

        this.selectedOptions = [];
        this.select = this.getInnerSelect();
        this.selectedElemDisplay = this.createElemDisplay();

        // Create shadow root with styles and HTML template
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(MultiSelect.createStyle());
        shadow.appendChild(template.content.cloneNode(true));
        shadow.getElementById('select-wrapper')
            .appendChild(this.selectedElemDisplay);

        // If select element children change, check if selected elements still exist
        new MutationObserver(() => {
            const newOptions: string[] = Array.from(this.select.options)
                .map((option: HTMLOptionElement) => { return option.value; });
            this.selectedOptions = this.selectedOptions.filter(selectedOption => {
                return newOptions.includes(selectedOption.value);
            });

            this.updateElemDisplay();
            this.select.selectedIndex = -1;
        }).observe(this.select, { childList: true });
    }

    private createElemDisplay(): HTMLDivElement {
        const display = document.createElement('div');
        display.classList.add('elem-display');
        display.addEventListener('click', e => {
            // Delete selected element on click
            if ((e.target as HTMLElement).classList.contains('option')) {
                this.selectedOptions = this.selectedOptions.filter(elem => {
                    const target = e.target as HTMLDivElement;
                    return elem.innerText !== target.innerText &&
                        elem.value !== target.dataset.optionValue;
                });
                this.updateElemDisplay();
                this.dispatchEvent(new Event('change'));
            }
        });
        return display;
    }

    private getInnerSelect(): HTMLSelectElement {
        const select = this.querySelector('select');
        if (!select) {
            throw new Error('No select given to multi-select!');
        }
        select.selectedIndex = -1;

        select.addEventListener('change', event => {
            const selectedOption = select.options[select.selectedIndex];
            if (!this.selectedOptions.includes(selectedOption)) {
                this.selectedOptions.push(selectedOption);
                this.dispatchEvent(new Event('change'));
            }
            select.selectedIndex = -1;
            this.updateElemDisplay();
            event.stopPropagation();
        });

        return select;
    }

    private updateElemDisplay() {
        this.selectedElemDisplay.innerHTML = '';
        this.selectedOptions.forEach(opt => {
            const optionElem = document.createElement('div');
            optionElem.classList.add('option');
            optionElem.innerText = opt.innerText;
            optionElem.dataset.optionValue = opt.value;
            this.selectedElemDisplay.appendChild(optionElem);
        });
    }

    private static createStyle(): HTMLStyleElement {
        const style = document.createElement('style');
        /* eslint-disable max-len */
        style.textContent = `
            ::slotted(select) {
                opacity: 0;
                width: 100%;
                height: 100%;
                position: absolute;
                cursor: pointer;
                z-index: 1;
            }
            
            div.elem-display {
                border-bottom: 1px solid #737373;
                min-height: 26px;
                display: flex;
                flex-wrap: wrap;
                position: relative;
                z-index: 2;
                pointer-events: none;
                padding-bottom: 16px;
                background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path fill='none' stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/></svg>");
                background-size: 16px 12px;
                background-repeat: no-repeat;
                background-position: right 3px bottom 5px;
            }
            
            div.elem-display > .option {
                background-color: #2F3A4F;
                border-radius: 8px;
                font-size: 14px;
                padding: 2px 19px 2px 4px;
                margin: 2px;
                pointer-events: auto;
                background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512"><!-- Font Awesome Free 5.15.3 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) --><path fill="%23728EC2" d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"/></svg>');
                background-size: 14px 14px;
                background-repeat: no-repeat;
                background-position: right 3px center;
                transition-duration: 100ms;
            }
            
            div.elem-display > .option:hover {
                background-color: #3C4B66;
            }
            
            div.select-wrapper {
                position: relative;
                cursor: pointer;
            }`;
        /* eslint-enable max-len */

        return style;
    }
}

customElements.define('multi-select', MultiSelect);
