(()=>{var n={5452:n=>{"use strict";n.exports=function(n){var e=[];return e.toString=function(){return this.map((function(e){var t=n(e);return e[2]?"@media ".concat(e[2]," {").concat(t,"}"):t})).join("")},e.i=function(n,t,o){"string"==typeof n&&(n=[[null,n,""]]);var r={};if(o)for(var a=0;a<this.length;a++){var i=this[a][0];null!=i&&(r[i]=!0)}for(var l=0;l<n.length;l++){var c=[].concat(n[l]);o&&r[c[0]]||(t&&(c[2]?c[2]="".concat(t," and ").concat(c[2]):c[2]=t),e.push(c))}},e}},6066:(n,e,t)=>{var o=t(5452)((function(n){return n[1]}));o.push([n.id,"body {\n    font-family: 'Roboto', 'Noto', sans-serif;\n    margin: 10px;\n}\n\n:root {\n    --blue: rgb(63, 81, 181);\n    --info-blue: rgb(62, 98, 240);\n    --info-blue-a-10: rgba(62, 98, 240, 0.1);\n    --red: #e74e36;\n    --green: #5ba664;\n    --yellow: rgb(253, 216, 53);\n    --yellow-a-10: rgba(253, 216, 53, 0.1);\n}\n\n/* Layout classes */\n\n.layout {\n    display: flex;\n}\n\n.layout.horizontal {\n    flex-direction: row;\n}\n\n.layout.horizontal.center-horizontal {\n    justify-content: center;\n}\n\n.layout.horizontal.center-vertical {\n    align-items: center;\n}\n\n.layout.vertical {\n    flex-direction: column;\n}\n\n.layout.message {\n    flex-direction: row;\n    align-items: center;\n}\n\n.layout.message > .icon {\n    display: block;\n    margin-right: 10px;\n    font-size: 25px;\n}\n\n.layout.message > .content {\n    margin: 0;\n}\n\n.layout > .fill {\n    flex: 1 1 0;\n}\n\n.layout.even-spacing > * {\n    flex-basis: 0;\n    flex-grow: 1;\n}\n\n/* \"Space\" class for creating sections of elements + related styles */\n\n.space {\n    background-color: #262f40;\n    border-radius: 8px;\n    padding: 10px;\n    margin: 5px 5px 8px;\n}\n\n.space.warning {\n    background-color: var(--yellow-a-10);\n    border: 2px solid var(--yellow);\n}\n\n.space.info {\n    background-color: var(--info-blue-a-10);\n    border: 2px solid var(--info-blue);\n}\n\n.show-hide-space {\n    display: flex;\n    justify-content: center;\n}\n\n.title {\n    font-weight: bold;\n    margin-bottom: 5px;\n    text-align: center;\n    display: block;\n}\n\n.subtitle {\n    font-weight: 400;\n    margin-top: 5px;\n    margin-bottom: 5px;\n    text-align: center;\n    display: block;\n    word-break: break-word;\n}\n\n/* Buttons */\n\nbutton {\n    background-color: var(--blue);\n    margin: 5px 2px 2px;\n    text-decoration: none;\n    border: none;\n    border-radius: 2px;\n    color: white;\n    text-transform: uppercase;\n    padding: 9px;\n    box-shadow: inset 0 0 0 0 rgba(0, 0, 0, 0.2);\n    transition-duration: 100ms;\n    font-family: 'Roboto', sans-serif;\n}\n\nbutton.blue {\n    background-color: var(--blue);\n}\n\nbutton.red {\n    background-color: var(--red);\n}\n\nbutton.green {\n    background-color: var(--green);\n}\n\nbutton:hover {\n    box-shadow: inset 0 0 0 9999px rgba(0, 0, 0, 0.2);\n}\n\nbutton[disabled],\nbutton[disabled]:hover {\n    color: #a9aaa9 !important;\n    background-color: #181e29 !important;\n    box-shadow: inset 0 0 0 0 rgba(0, 0, 0, 0.2) !important;\n}\n\nbutton.max-width {\n    box-sizing: border-box;\n    /* an ugly hack: 100% - button margin\n    prevents button from getting too wide */\n    width: calc(100% - 4px);\n}\n\n/* Text input & select */\n\nselect,\ninput:not([type]),\ninput[type='text'],\ninput[type='number'],\ninput[type='color'] {\n    background-color: transparent;\n    border: 0;\n    border-bottom: 1px solid #737373;\n    width: 100%;\n    color: white;\n    font-size: 16px;\n    font-family: 'Roboto', sans-serif;\n}\n\nselect {\n    margin-bottom: 5px;\n    outline: 0;\n    padding: 4px 20px 4px 2px;\n    background-image: url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e\");\n    background-size: 16px 12px;\n    background-repeat: no-repeat;\n    background-position: right 3px center;\n    -webkit-appearance: none;\n    -moz-appearance: none;\n    appearance: none;\n}\n\n.select-container {\n    margin: 0 3px;\n}\n\ninput:not([type]),\ninput[type='text'],\ninput[type='number'],\ninput[type='color'] {\n    display: block;\n    box-sizing: border-box;\n    margin-top: 3px;\n}\n\ninput[type='color'] {\n    border-bottom: unset;\n    background-color: #2f3a4f;\n    margin: 5px 2px;\n    padding: 5px;\n    height: 32px;\n}\n\ninput[type='number'] {\n    -moz-appearance: textfield;\n}\n\ninput[type='number']::-webkit-outer-spin-button,\ninput[type='number']::-webkit-inner-spin-button {\n    -webkit-appearance: none;\n    margin: 0;\n}\n\n.input-label,\nlabel {\n    color: #737373;\n    font-size: 0.75em;\n    user-select: none;\n    -moz-user-select: none;\n    -webkit-user-select: none;\n    margin-top: 3px;\n}\n\nlabel.white-label {\n    color: white;\n}\n\nlabel.big-label {\n    font-size: 1em;\n    margin-top: 0;\n}\n\noption,\noptgroup {\n    color: black;\n}\n\noption[disabled] {\n    color: darkgray;\n    font-style: italic;\n}\n\n/* Misc. */\n\n.max-width > * {\n    flex-grow: 1;\n}\n\n.text-center {\n    text-align: center;\n}\n\n.text-small {\n    font-size: 0.75em;\n}\n",""]),n.exports=o},6062:(n,e,t)=>{"use strict";var o,r=function(){var n={};return function(e){if(void 0===n[e]){var t=document.querySelector(e);if(window.HTMLIFrameElement&&t instanceof window.HTMLIFrameElement)try{t=t.contentDocument.head}catch(n){t=null}n[e]=t}return n[e]}}(),a=[];function i(n){for(var e=-1,t=0;t<a.length;t++)if(a[t].identifier===n){e=t;break}return e}function l(n,e){for(var t={},o=[],r=0;r<n.length;r++){var l=n[r],c=e.base?l[0]+e.base:l[0],s=t[c]||0,u="".concat(c," ").concat(s);t[c]=s+1;var d=i(u),p={css:l[1],media:l[2],sourceMap:l[3]};-1!==d?(a[d].references++,a[d].updater(p)):a.push({identifier:u,updater:f(p,e),references:1}),o.push(u)}return o}function c(n){var e=document.createElement("style"),o=n.attributes||{};if(void 0===o.nonce){var a=t.nc;a&&(o.nonce=a)}if(Object.keys(o).forEach((function(n){e.setAttribute(n,o[n])})),"function"==typeof n.insert)n.insert(e);else{var i=r(n.insert||"head");if(!i)throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");i.appendChild(e)}return e}var s,u=(s=[],function(n,e){return s[n]=e,s.filter(Boolean).join("\n")});function d(n,e,t,o){var r=t?"":o.media?"@media ".concat(o.media," {").concat(o.css,"}"):o.css;if(n.styleSheet)n.styleSheet.cssText=u(e,r);else{var a=document.createTextNode(r),i=n.childNodes;i[e]&&n.removeChild(i[e]),i.length?n.insertBefore(a,i[e]):n.appendChild(a)}}function p(n,e,t){var o=t.css,r=t.media,a=t.sourceMap;if(r?n.setAttribute("media",r):n.removeAttribute("media"),a&&"undefined"!=typeof btoa&&(o+="\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(a))))," */")),n.styleSheet)n.styleSheet.cssText=o;else{for(;n.firstChild;)n.removeChild(n.firstChild);n.appendChild(document.createTextNode(o))}}var b=null,g=0;function f(n,e){var t,o,r;if(e.singleton){var a=g++;t=b||(b=c(e)),o=d.bind(null,t,a,!1),r=d.bind(null,t,a,!0)}else t=c(e),o=p.bind(null,t,e),r=function(){!function(n){if(null===n.parentNode)return!1;n.parentNode.removeChild(n)}(t)};return o(n),function(e){if(e){if(e.css===n.css&&e.media===n.media&&e.sourceMap===n.sourceMap)return;o(n=e)}else r()}}n.exports=function(n,e){(e=e||{}).singleton||"boolean"==typeof e.singleton||(e.singleton=(void 0===o&&(o=Boolean(window&&document&&document.all&&!window.atob)),o));var t=l(n=n||[],e);return function(n){if(n=n||[],"[object Array]"===Object.prototype.toString.call(n)){for(var o=0;o<t.length;o++){var r=i(t[o]);a[r].references--}for(var c=l(n,e),s=0;s<t.length;s++){var u=i(t[s]);0===a[u].references&&(a[u].updater(),a.splice(u,1))}t=c}}}}},e={};function t(o){var r=e[o];if(void 0!==r)return r.exports;var a=e[o]={id:o,exports:{}};return n[o](a,a.exports,t),a.exports}t.n=n=>{var e=n&&n.__esModule?()=>n.default:()=>n;return t.d(e,{a:e}),e},t.d=(n,e)=>{for(var o in e)t.o(e,o)&&!t.o(n,o)&&Object.defineProperty(n,o,{enumerable:!0,get:e[o]})},t.o=(n,e)=>Object.prototype.hasOwnProperty.call(n,e),(()=>{"use strict";var n=t(6062),e=t.n(n),o=t(6066),r=t.n(o);e()(r(),{insert:"head",singleton:!1}),r().locals;function a(n,e){n.forEach((n=>{if(!n.tagName)return;let t;if("input"===n.tagName.toLowerCase())t="input";else{if("select"!==n.tagName.toLowerCase())return;t="change"}n.addEventListener(t,(n=>{n.target.dataset.edited="true",e.style.backgroundColor="#e74e36"}))})),e.addEventListener("click",(()=>{n.forEach((n=>{n.dataset.edited="false"})),e.style.backgroundColor="#3F51B5"}))}const i=nodecg.Replicant("lastFmSettings"),l=document.getElementById("last-fm-username-input"),c=document.getElementById("update-lastfm-data-btn");i.on("change",(n=>{l.value=n.username})),c.addEventListener("click",(()=>{i.value.username=l.value})),a(document.querySelectorAll(".last-fm-update-reminder"),c);const s=nodecg.Replicant("radiaSettings"),u=document.getElementById("radia-guild-input"),d=document.getElementById("update-radia-data-btn"),p=("auto-tournament-data-update-toggle",document.getElementById("auto-tournament-data-update-toggle"));s.on("change",(n=>{u.value=n.guildID,p.checked=n.updateOnImport})),d.addEventListener("click",(()=>{s.value.guildID=u.value})),p.addEventListener("change",(n=>{const e=n.target;s.value.updateOnImport=e.checked})),a(document.querySelectorAll(".radia-update-reminder"),d)})()})();