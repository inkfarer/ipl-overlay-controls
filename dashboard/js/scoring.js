(()=>{var e={452:e=>{"use strict";e.exports=function(e){var n=[];return n.toString=function(){return this.map((function(n){var t=e(n);return n[2]?"@media ".concat(n[2]," {").concat(t,"}"):t})).join("")},n.i=function(e,t,o){"string"==typeof e&&(e=[[null,e,""]]);var r={};if(o)for(var a=0;a<this.length;a++){var l=this[a][0];null!=l&&(r[l]=!0)}for(var c=0;c<e.length;c++){var i=[].concat(e[c]);o&&r[i[0]]||(t&&(i[2]?i[2]="".concat(t," and ").concat(i[2]):i[2]=t),n.push(i))}},n}},939:(e,n,t)=>{var o=t(452)((function(e){return e[1]}));o.push([e.id,".score-space {\n    align-items: center;\n}\n\n.score-space .layout.vertical button {\n    width: 35px;\n}\n\n.score-space input {\n    height: 55px;\n    font-size: 3em;\n    text-align: center;\n    margin: 0 5px;\n    width: 57px;\n}\n\n.select-container {\n    margin: 0 2.5px;\n}\n\n.color-display {\n    width: auto;\n    height: 18px;\n    margin: 2px;\n    border-radius: 2px;\n}\n",""]),e.exports=o},66:(e,n,t)=>{var o=t(452)((function(e){return e[1]}));o.push([e.id,"body {\n    font-family: 'Roboto', 'Noto', sans-serif;\n}\n\n:root {\n    --blue: rgb(63, 81, 181);\n    --info-blue: rgb(62, 98, 240);\n    --info-blue-a-10: rgba(62, 98, 240, 0.1);\n    --red: #c9513e;\n    --green: #5ba664;\n    --yellow: rgb(253, 216, 53);\n    --yellow-a-10: rgba(253, 216, 53, 0.1);\n}\n\n/* Layout classes */\n\n.layout {\n    display: flex;\n}\n\n.layout.horizontal {\n    flex-direction: row;\n}\n\n.layout.horizontal.center-horizontal {\n    justify-content: center;\n}\n\n.layout.vertical {\n    flex-direction: column;\n}\n\n.layout.message {\n    flex-direction: row;\n    align-items: center;\n}\n\n.layout.message > .icon {\n    display: block;\n    margin-right: 10px;\n    font-size: 25px;\n}\n\n.layout.message > .content {\n    margin: 0;\n}\n\n/* \"Space\" class for creating sections of elements + related styles */\n\n.space {\n    background-color: #262f40;\n    border-radius: 8px;\n    padding: 10px;\n    margin-bottom: 5px;\n}\n\n.space.warning {\n    background-color: var(--yellow-a-10);\n    border: 2px solid var(--yellow);\n}\n\n.space.info {\n    background-color: var(--info-blue-a-10);\n    border: 2px solid var(--info-blue);\n}\n\n.show-hide-space {\n    display: flex;\n    justify-content: center;\n}\n\n.title {\n    font-weight: bold;\n    margin-bottom: 5px;\n    text-align: center;\n    display: block;\n}\n\n/* Buttons */\n\nbutton {\n    background-color: var(--blue);\n    margin: 5px 2px 2px;\n    text-decoration: none;\n    border: none;\n    border-radius: 2px;\n    color: white;\n    text-transform: uppercase;\n    padding: 9px 9px;\n    box-shadow: inset 0 0 0 0 rgba(0, 0, 0, 0.2);\n    transition-duration: 100ms;\n    font-family: 'Roboto', sans-serif;\n}\n\nbutton.blue {\n    background-color: var(--blue);\n}\n\nbutton.red {\n    background-color: var(--red);\n}\n\nbutton.green {\n    background-color: var(--green);\n}\n\nbutton:hover {\n    box-shadow: inset 0 0 0 9999px rgba(0, 0, 0, 0.2);\n}\n\nbutton[disabled],\nbutton[disabled]:hover {\n    color: #a9aaa9 !important;\n    background-color: #181e29 !important;\n    box-shadow: inset 0 0 0 0 rgba(0, 0, 0, 0.2) !important;\n}\n\nbutton.max-width {\n    box-sizing: border-box;\n    /* an ugly hack: 100% - button margin\n\tprevents button from getting too wide */\n    width: calc(100% - 4px);\n}\n\n/* Text input & select */\n\nselect,\ninput:not([type]),\ninput[type='text'],\ninput[type='number'],\ninput[type='color'] {\n    background-color: transparent;\n    border: 0;\n    border-bottom: 1px solid #737373;\n    width: 100%;\n    color: white;\n    font-size: 16px;\n    font-family: 'Roboto', sans-serif;\n}\n\nselect {\n    margin-bottom: 5px;\n    outline: 0;\n    padding: 4px 20px 4px 2px;\n    background-image: url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e\");\n    background-size: 16px 12px;\n    background-repeat: no-repeat;\n    background-position: right 3px center;\n    -webkit-appearance: none;\n    -moz-appearance: none;\n    appearance: none;\n}\n\ninput:not([type]),\ninput[type='text'],\ninput[type='number'],\ninput[type='color'] {\n    display: block;\n    box-sizing: border-box;\n    margin-top: 3px;\n}\n\ninput[type='color'] {\n    border-bottom: unset;\n    background-color: #2f3a4f;\n    margin: 5px 2px;\n    padding: 5px;\n    height: 32px;\n}\n\ninput[type='number'] {\n    -moz-appearance: textfield;\n}\n\ninput[type='number']::-webkit-outer-spin-button,\ninput[type='number']::-webkit-inner-spin-button {\n    -webkit-appearance: none;\n    margin: 0;\n}\n\n.input-label,\nlabel {\n    color: #737373;\n    font-size: 0.75em;\n    user-select: none;\n    -moz-user-select: none;\n    -webkit-user-select: none;\n    margin-top: 3px;\n}\n\nlabel.white-label {\n    color: white;\n}\n\nlabel.big-label {\n    font-size: 1em;\n    margin-top: 0;\n}\n\noption,\noptgroup {\n    color: black;\n}\n\noption[disabled] {\n    color: darkgray;\n    font-style: italic;\n}\n\n/* Misc. */\n\n.max-width > * {\n    flex-grow: 1;\n}\n",""]),e.exports=o},62:(e,n,t)=>{"use strict";var o,r=function(){var e={};return function(n){if(void 0===e[n]){var t=document.querySelector(n);if(window.HTMLIFrameElement&&t instanceof window.HTMLIFrameElement)try{t=t.contentDocument.head}catch(e){t=null}e[n]=t}return e[n]}}(),a=[];function l(e){for(var n=-1,t=0;t<a.length;t++)if(a[t].identifier===e){n=t;break}return n}function c(e,n){for(var t={},o=[],r=0;r<e.length;r++){var c=e[r],i=n.base?c[0]+n.base:c[0],d=t[i]||0,s="".concat(i," ").concat(d);t[i]=d+1;var u=l(s),m={css:c[1],media:c[2],sourceMap:c[3]};-1!==u?(a[u].references++,a[u].updater(m)):a.push({identifier:s,updater:b(m,n),references:1}),o.push(s)}return o}function i(e){var n=document.createElement("style"),o=e.attributes||{};if(void 0===o.nonce){var a=t.nc;a&&(o.nonce=a)}if(Object.keys(o).forEach((function(e){n.setAttribute(e,o[e])})),"function"==typeof e.insert)e.insert(n);else{var l=r(e.insert||"head");if(!l)throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");l.appendChild(n)}return n}var d,s=(d=[],function(e,n){return d[e]=n,d.filter(Boolean).join("\n")});function u(e,n,t,o){var r=t?"":o.media?"@media ".concat(o.media," {").concat(o.css,"}"):o.css;if(e.styleSheet)e.styleSheet.cssText=s(n,r);else{var a=document.createTextNode(r),l=e.childNodes;l[n]&&e.removeChild(l[n]),l.length?e.insertBefore(a,l[n]):e.appendChild(a)}}function m(e,n,t){var o=t.css,r=t.media,a=t.sourceMap;if(r?e.setAttribute("media",r):e.removeAttribute("media"),a&&"undefined"!=typeof btoa&&(o+="\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(a))))," */")),e.styleSheet)e.styleSheet.cssText=o;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(o))}}var p=null,g=0;function b(e,n){var t,o,r;if(n.singleton){var a=g++;t=p||(p=i(n)),o=u.bind(null,t,a,!1),r=u.bind(null,t,a,!0)}else t=i(n),o=m.bind(null,t,n),r=function(){!function(e){if(null===e.parentNode)return!1;e.parentNode.removeChild(e)}(t)};return o(e),function(n){if(n){if(n.css===e.css&&n.media===e.media&&n.sourceMap===e.sourceMap)return;o(e=n)}else r()}}e.exports=function(e,n){(n=n||{}).singleton||"boolean"==typeof n.singleton||(n.singleton=(void 0===o&&(o=Boolean(window&&document&&document.all&&!window.atob)),o));var t=c(e=e||[],n);return function(e){if(e=e||[],"[object Array]"===Object.prototype.toString.call(e)){for(var o=0;o<t.length;o++){var r=l(t[o]);a[r].references--}for(var i=c(e,n),d=0;d<t.length;d++){var s=l(t[d]);0===a[s].references&&(a[s].updater(),a.splice(s,1))}t=i}}}}},n={};function t(o){var r=n[o];if(void 0!==r)return r.exports;var a=n[o]={id:o,exports:{}};return e[o](a,a.exports,t),a.exports}t.n=e=>{var n=e&&e.__esModule?()=>e.default:()=>e;return t.d(n,{a:n}),n},t.d=(e,n)=>{for(var o in n)t.o(n,o)&&!t.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:n[o]})},t.o=(e,n)=>Object.prototype.hasOwnProperty.call(e,n),(()=>{"use strict";const e=nodecg.Replicant("teamScores"),n=nodecg.Replicant("tournamentData"),o=nodecg.Replicant("scoreboardData"),r=nodecg.Replicant("scoreboardShown");function a(e,n,t){const o=document.querySelectorAll(`.${n}`);Array.from(o).forEach((n=>{const o=document.createElement("option");o.value=""===t?e:t,o.text=e,n.appendChild(o)}))}function l(e,n){e.forEach((e=>{if(!e.tagName)return;let t;if("input"===e.tagName.toLowerCase())t="input";else{if("select"!==e.tagName.toLowerCase())return;t="change"}e.addEventListener(t,(()=>{n.style.backgroundColor="var(--red)"}))})),n.addEventListener("click",(()=>{n.style.backgroundColor="var(--blue)"}))}e.on("change",(e=>{document.getElementById("team-a-score-input").value=e.teamA.toString(),document.getElementById("team-b-score-input").value=e.teamB.toString()})),document.getElementById("team-a-score-plus-btn").onclick=()=>{e.value.teamA++},document.getElementById("team-a-score-minus-btn").onclick=()=>{e.value.teamA--},document.getElementById("team-b-score-plus-btn").onclick=()=>{e.value.teamB++},document.getElementById("team-b-score-minus-btn").onclick=()=>{e.value.teamB--},document.getElementById("team-a-score-input").oninput=n=>{e.value.teamA=Number(n.target.value)},document.getElementById("team-b-score-input").oninput=n=>{e.value.teamB=Number(n.target.value)},o.on("change",(e=>{document.getElementById("flavor-text-input").value=e.flavorText,document.getElementById("team-a-selector").value=e.teamAInfo.id,document.getElementById("team-b-selector").value=e.teamBInfo.id})),n.on("change",(e=>{!function(e){const n=document.getElementsByClassName("team-selector");for(let e=0;e<n.length;e++)n[e].innerHTML=""}();for(let t=0;t<e.data.length;t++){const o=e.data[t];a((n=o.name)&&n.length>48?n.substring(0,48-"...".length)+"...":n,"team-selector",o.id)}var n})),document.getElementById("update-scoreboard-btn").addEventListener("click",(()=>{const e=n.value.data.filter((e=>e.id===document.getElementById("team-a-selector").value))[0],t=n.value.data.filter((e=>e.id===document.getElementById("team-b-selector").value))[0];o.value.teamAInfo=e,o.value.teamBInfo=t,o.value.flavorText=document.getElementById("flavor-text-input").value})),l(document.querySelectorAll(".scoreboard-update-warning"),document.getElementById("update-scoreboard-btn")),r.on("change",(e=>{var n,t,o;n=document.getElementById("show-scoreboard-btn"),t=document.getElementById("hide-scoreboard-btn"),o=e,n.disabled=o,t.disabled=!o})),document.getElementById("show-scoreboard-btn").onclick=()=>{r.value=!0},document.getElementById("hide-scoreboard-btn").onclick=()=>{r.value=!1},document.getElementById("show-casters-btn").onclick=()=>{nodecg.sendMessage("mainShowCasters")};const c=[{meta:{name:"Ranked Modes"},colors:[{index:0,title:"Green vs Grape",clrA:"#37FC00",clrB:"#7D28FC"},{index:1,title:"Green vs Magenta",clrA:"#04D976",clrB:"#D600AB"},{index:2,title:"Turquoise vs Orange",clrA:"#10E38F",clrB:"#FB7B08"},{index:3,title:"Mustard vs Purple",clrA:"#FF9E03",clrB:"#B909E0"},{index:4,title:"Dark Blue vs Green",clrA:"#2F27CC",clrB:"#37FC00"},{index:5,title:"Purple vs Green",clrA:"#B909E0",clrB:"#37FC00"},{index:6,title:"Yellow vs Blue",clrA:"#FEF232",clrB:"#2ED2FE"}]},{meta:{name:"Turf War"},colors:[{index:8,title:"Yellow vs Purple",clrA:"#D1E004",clrB:"#960CB2"},{index:9,title:"Pink vs Blue",clrA:"#E61077",clrB:"#361CB8"},{index:10,title:"Pink vs Yellow",clrA:"#ED0C6A",clrB:"#D5E802"},{index:11,title:"Purple vs Turquoise",clrA:"#6B10CC",clrB:"#08CC81"},{index:12,title:"Pink vs Light Blue",clrA:"#E30960",clrB:"#02ADCF"},{index:13,title:"Purple vs Orange",clrA:"#5617C2",clrB:"#FF5F03"},{index:14,title:"Pink vs Green",clrA:"#E60572",clrB:"#1BBF0F"}]},{meta:{name:"Color Lock"},colors:[{index:7,title:"Yellow vs Blue (Color Lock)",clrA:"#FEF232",clrB:"#2F27CC"}]},{meta:{name:"Custom Color"},colors:[{index:999,title:"Custom Color",clrA:"#000000",clrB:"#FFFFFF"}]}],i=document.getElementById("custom-color-toggle"),d=document.getElementById("color-selector");for(let e=0;e<c.length;e++){const n=c[e],t=document.createElement("optgroup");t.label=n.meta.name;for(let e=0;e<n.colors.length;e++){const o=n.colors[e],r=document.createElement("option");r.value=o.index.toString(),r.text=o.title,r.dataset.firstColor=o.clrA,r.dataset.secondColor=o.clrB,r.disabled=999===o.index,t.appendChild(r)}d.appendChild(t)}function s(e,n,t,o){let r;switch(r="a"!==t||o?"a"===t&&o?e.clrB:"b"!==t||o?"b"===t&&o?e.clrA:"#000000":e.clrB:e.clrA,n.tagName.toLowerCase()){case"input":n.value=r;break;default:n.style.backgroundColor=r}}function u(e){const n=document.getElementById("color-select-container"),t=document.getElementById("custom-color-select-container");e?(n.style.display="none",t.style.display="flex"):(n.style.display="unset",t.style.display="none")}o.on("change",(e=>{d.value=e.colorInfo.index.toString(),s(e.colorInfo,document.getElementById("team-a-color-display"),"a",e.swapColorOrder),s(e.colorInfo,document.getElementById("team-b-color-display"),"b",e.swapColorOrder),s(e.colorInfo,document.getElementById("team-a-custom-color"),"a",e.swapColorOrder),s(e.colorInfo,document.getElementById("team-b-custom-color"),"b",e.swapColorOrder);const n=999===e.colorInfo.index;i.checked=n,u(n)})),i.onchange=e=>{u(e.target.checked)},document.getElementById("swap-color-order-btn").onclick=()=>{o.value.swapColorOrder=!o.value.swapColorOrder},document.getElementById("update-scoreboard-btn").addEventListener("click",(()=>{const e=d.options[d.selectedIndex];let n,{swapColorOrder:t}=o.value;i.checked?(n={index:999,title:"Custom Color",clrA:document.getElementById("team-a-custom-color").value,clrB:document.getElementById("team-b-custom-color").value},t=!1):n={index:Number(e.value),title:e.text,clrA:e.dataset.firstColor,clrB:e.dataset.secondColor},o.value.colorInfo=n,o.value.swapColorOrder=t}));const m=nodecg.Replicant("nextTeams");m.on("change",(e=>{document.getElementById("next-team-a-selector").value=e.teamAInfo.id,document.getElementById("next-team-b-selector").value=e.teamBInfo.id})),document.getElementById("update-next-teams-btn").onclick=()=>{const e=n.value.data.filter((e=>e.id===document.getElementById("next-team-a-selector").value))[0],t=n.value.data.filter((e=>e.id===document.getElementById("next-team-b-selector").value))[0];m.value.teamAInfo=e,m.value.teamBInfo=t},document.getElementById("begin-next-match-btn").onclick=()=>{o.value.teamAInfo=m.value.teamAInfo,o.value.teamBInfo=m.value.teamBInfo,e.value={teamA:0,teamB:0}},l(document.querySelectorAll(".next-team-update-warning"),document.getElementById("update-next-teams-btn"));var p=t(62),g=t.n(p),b=t(66),f=t.n(b);g()(f(),{insert:"head",singleton:!1}),f().locals;var v=t(939),y=t.n(v);g()(y(),{insert:"head",singleton:!1}),y().locals})()})();