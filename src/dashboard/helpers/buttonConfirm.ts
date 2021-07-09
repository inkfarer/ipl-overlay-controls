/*
buttonConfirm

After importing this script to a dashboard panel, add the attribute 'data-requires-confirmation' to any button.
The button will now ask for confirmation when it is first clicked.
When it is clicked a second time, a 'confirm' event is sent by it, which can be listened for by scripts.

Example:

HTML:
    <button id="dangerous-action-button" data-requires-confirmation>DO A THING</button>
JS:
    document.getElementById('dangerous-action-button').addEventListener('confirm', () => {
        // do something
    });
*/

window.addEventListener('DOMContentLoaded', () => {
    function addListener(btn: HTMLButtonElement) {
        if (btn.dataset.hasConfirmListener !== 'true') {
            btn.addEventListener('click', e => {
                const target = e.target as HTMLButtonElement;

                function resetButton() {
                    target.dataset.isClicked = 'false';
                    target.innerText = target.dataset.originalText;
                    target.style.backgroundColor = '';
                }

                if (target.dataset.isClicked === 'true') {
                    target.dispatchEvent(new Event('confirm'));
                    resetButton();
                } else {
                    target.dataset.isClicked = 'true';
                    target.dataset.originalText = target.innerText;
                    target.style.backgroundColor = 'var(--red)';
                    target.innerText = 'are you sure?';

                    setTimeout(() => {
                        resetButton();
                    }, 5000);
                }
            });

            btn.dataset.hasConfirmListener = 'true';
        }
    }

    const buttons = document.querySelectorAll('button[data-requires-confirmation]');
    buttons.forEach(addListener);

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE
                    && node.nodeName === 'BUTTON'
                    && (node as HTMLElement).dataset.requiresConfirmation) {

                    const btn = node as HTMLButtonElement;
                    addListener(btn);
                }
            });
        });
    });

    observer.observe(document.body, {
        subtree: true,
        childList: true
    });
});
