(self.webpackChunk=self.webpackChunk||[]).push([[142],{4847:(e,n,t)=>{"use strict";var o=t(6737);n.DF={prefix:o.prefix,iconName:o.iconName,icon:[o.width,o.height,o.aliases,o.unicode,o.svgPathData]},n.NB=n.DF,o.prefix,o.iconName,o.width,o.height,o.aliases,o.unicode,o.svgPathData,o.aliases},6737:(e,n)=>{"use strict";Object.defineProperty(n,"__esModule",{value:!0});var t="xmark",o=[128473,10005,10006,10060,215,"close","multiply","remove","times"],r="f00d",i="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z";n.definition={prefix:"fas",iconName:t,icon:[384,512,o,r,i]},n.faXmark=n.definition,n.prefix="fas",n.iconName=t,n.width=384,n.height=512,n.ligatures=o,n.unicode=r,n.svgPathData=i,n.aliases=o},4303:(e,n,t)=>{var o=t(6548),r=t(2019)(o);e.exports=r},5308:(e,n,t)=>{var o=t(5463)();e.exports=o},6548:(e,n,t)=>{var o=t(5308),r=t(249);e.exports=function(e,n){return e&&o(e,n,r)}},7036:(e,n,t)=>{var o=t(6571),r=t(8746);e.exports=function(e,n,t,i){var u=t.length,a=u,s=!i;if(null==e)return!a;for(e=Object(e);u--;){var d=t[u];if(s&&d[2]?d[1]!==e[d[0]]:!(d[0]in e))return!1}for(;++u<a;){var c=(d=t[u])[0],l=e[c],v=d[1];if(s&&d[2]){if(void 0===l&&!(c in e))return!1}else{var f=new o;if(i)var g=i(l,v,c,e,n,f);if(!(void 0===g?r(v,l,3,i,f):g))return!1}}return!0}},8286:(e,n,t)=>{var o=t(6423),r=t(4716),i=t(3059),u=t(6152),a=t(5798);e.exports=function(e){return"function"==typeof e?e:null==e?i:"object"==typeof e?u(e)?r(e[0],e[1]):o(e):a(e)}},3401:(e,n,t)=>{var o=t(4303),r=t(7878);e.exports=function(e,n){var t=-1,i=r(e)?Array(e.length):[];return o(e,(function(e,o,r){i[++t]=n(e,o,r)})),i}},6423:(e,n,t)=>{var o=t(7036),r=t(5225),i=t(3477);e.exports=function(e){var n=r(e);return 1==n.length&&n[0][2]?i(n[0][0],n[0][1]):function(t){return t===e||o(t,e,n)}}},4716:(e,n,t)=>{var o=t(8746),r=t(2579),i=t(5041),u=t(1401),a=t(8792),s=t(3477),d=t(3812);e.exports=function(e,n){return u(e)&&a(n)?s(d(e),n):function(t){var u=r(t,e);return void 0===u&&u===n?i(t,e):o(n,u,3)}}},3813:(e,n,t)=>{var o=t(343),r=t(3324),i=t(8286),u=t(3401),a=t(7095),s=t(7826),d=t(8477),c=t(3059),l=t(6152);e.exports=function(e,n,t){n=n.length?o(n,(function(e){return l(e)?function(n){return r(n,1===e.length?e[0]:e)}:e})):[c];var v=-1;n=o(n,s(i));var f=u(e,(function(e,t,r){return{criteria:o(n,(function(n){return n(e)})),index:++v,value:e}}));return a(f,(function(e,n){return d(e,n,t)}))}},256:e=>{e.exports=function(e){return function(n){return null==n?void 0:n[e]}}},2952:(e,n,t)=>{var o=t(3324);e.exports=function(e){return function(n){return o(n,e)}}},5139:(e,n,t)=>{var o=t(3059),r=t(3114),i=t(5251);e.exports=function(e,n){return i(r(e,n,o),e+"")}},7095:e=>{e.exports=function(e,n){var t=e.length;for(e.sort(n);t--;)e[t]=e[t].value;return e}},7520:(e,n,t)=>{var o=t(4795);e.exports=function(e,n){if(e!==n){var t=void 0!==e,r=null===e,i=e==e,u=o(e),a=void 0!==n,s=null===n,d=n==n,c=o(n);if(!s&&!c&&!u&&e>n||u&&a&&d&&!s&&!c||r&&a&&d||!t&&d||!i)return 1;if(!r&&!u&&!c&&e<n||c&&t&&i&&!r&&!u||s&&t&&i||!a&&i||!d)return-1}return 0}},8477:(e,n,t)=>{var o=t(7520);e.exports=function(e,n,t){for(var r=-1,i=e.criteria,u=n.criteria,a=i.length,s=t.length;++r<a;){var d=o(i[r],u[r]);if(d)return r>=s?d:d*("desc"==t[r]?-1:1)}return e.index-n.index}},2019:(e,n,t)=>{var o=t(7878);e.exports=function(e,n){return function(t,r){if(null==t)return t;if(!o(t))return e(t,r);for(var i=t.length,u=n?i:-1,a=Object(t);(n?u--:++u<i)&&!1!==r(a[u],u,a););return t}}},5463:e=>{e.exports=function(e){return function(n,t,o){for(var r=-1,i=Object(n),u=o(n),a=u.length;a--;){var s=u[e?a:++r];if(!1===t(i[s],s,i))break}return n}}},5225:(e,n,t)=>{var o=t(8792),r=t(249);e.exports=function(e){for(var n=r(e),t=n.length;t--;){var i=n[t],u=e[i];n[t]=[i,u,o(u)]}return n}},8792:(e,n,t)=>{var o=t(9259);e.exports=function(e){return e==e&&!o(e)}},3477:e=>{e.exports=function(e,n){return function(t){return null!=t&&t[e]===n&&(void 0!==n||e in Object(t))}}},2579:(e,n,t)=>{var o=t(3324);e.exports=function(e,n,t){var r=null==e?void 0:o(e,n);return void 0===r?t:r}},5798:(e,n,t)=>{var o=t(256),r=t(2952),i=t(1401),u=t(3812);e.exports=function(e){return i(e)?o(u(e)):r(e)}},829:(e,n,t)=>{var o=t(2034),r=t(3813),i=t(5139),u=t(2406),a=i((function(e,n){if(null==e)return[];var t=n.length;return t>1&&u(e,n[0],n[1])?n=[]:t>2&&u(n[0],n[1],n[2])&&(n=[n[0]]),r(e,o(n,1),[])}));e.exports=a},6060:(e,n,t)=>{"use strict";t.d(n,{B:()=>u,O:()=>a});var o=t(5471);const r=nodecg.Replicant("activeRound"),i=nodecg.Replicant("swapColorsInternally"),u=[r,i],a=(0,o.Q_)("activeRound",{state:()=>({activeRound:null,swapColorsInternally:null}),actions:{setWinner({winner:e}){nodecg.sendMessage("setWinner",{winner:e})},removeWinner(){nodecg.sendMessage("removeWinner")},setActiveColor(e){nodecg.sendMessage("setActiveColor",e)},swapColors(){i.value=!i.value},setWinnerForIndex({index:e,winner:n}){nodecg.sendMessage("setWinner",{winner:n,roundIndex:e})},resetActiveRound(){nodecg.sendMessage("resetActiveRound")},setActiveRound(e){nodecg.sendMessage("setActiveRound",e)},swapRoundColor(e){nodecg.sendMessage("swapRoundColor",e)},updateActiveGames(e){nodecg.sendMessage("updateActiveGames",{games:e})},switchToNextColor(){nodecg.sendMessage("switchToNextColor")},switchToPreviousColor(){nodecg.sendMessage("switchToPreviousColor")},getNextAndPreviousColors(){return e=this,n=void 0,o=function*(){return nodecg.sendMessage("getNextAndPreviousColors")},new((t=void 0)||(t=Promise))((function(r,i){function u(e){try{s(o.next(e))}catch(e){i(e)}}function a(e){try{s(o.throw(e))}catch(e){i(e)}}function s(e){var n;e.done?r(e.value):(n=e.value,n instanceof t?n:new t((function(e){e(n)}))).then(u,a)}s((o=o.apply(e,n||[])).next())}));var e,n,t,o}}})},417:(e,n,t)=>{"use strict";t.d(n,{Q:()=>i,o:()=>u});var o=t(5471);const r=nodecg.Replicant("nextRound"),i=[r],u=(0,o.Q_)("nextRound",{state:()=>({nextRound:null}),actions:{setShowOnStream(e){r.value.showOnStream=e},beginNextMatch(e){nodecg.sendMessage("beginNextMatch",e)},setNextRound(e){nodecg.sendMessage("setNextRound",e)}}})},2782:(e,n,t)=>{"use strict";t.d(n,{K:()=>s,R:()=>d});var o=t(5471),r=function(e,n,t,o){return new(t||(t=Promise))((function(r,i){function u(e){try{s(o.next(e))}catch(e){i(e)}}function a(e){try{s(o.throw(e))}catch(e){i(e)}}function s(e){var n;e.done?r(e.value):(n=e.value,n instanceof t?n:new t((function(e){e(n)}))).then(u,a)}s((o=o.apply(e,n||[])).next())}))};const i=nodecg.Replicant("tournamentData"),u=nodecg.Replicant("roundStore"),a=nodecg.Replicant("matchStore"),s=[i,u,a],d=(0,o.Q_)("tournamentData",{state:()=>({tournamentData:null,roundStore:null,matchStore:null}),actions:{getTournamentData({method:e,id:n}){return r(this,void 0,void 0,(function*(){return nodecg.sendMessage("getTournamentData",{method:e,id:n})}))},getSmashggEvent({eventId:e}){return r(this,void 0,void 0,(function*(){return yield nodecg.sendMessage("getSmashggEvent",{eventId:e})}))},uploadTeamData({file:e}){return r(this,void 0,void 0,(function*(){return c("teams",e)}))},uploadRoundData({file:e}){return r(this,void 0,void 0,(function*(){return c("rounds",e)}))},fetchRoundData({url:e}){return r(this,void 0,void 0,(function*(){return nodecg.sendMessage("getRounds",{url:e})}))},updateRound(e){return r(this,void 0,void 0,(function*(){return nodecg.sendMessage("updateRound",e)}))},insertRound(e){return r(this,void 0,void 0,(function*(){return nodecg.sendMessage("insertRound",e)}))},resetRoundStore(){nodecg.sendMessage("resetRoundStore")},setTeamImageHidden:({teamId:e,isVisible:n})=>nodecg.sendMessage("toggleTeamImage",{teamId:e,isVisible:n}),removeRound:({roundId:e})=>nodecg.sendMessage("removeRound",{roundId:e}),setShortName(e){i.value.meta.shortName=e},refreshTournamentData(){return r(this,void 0,void 0,(function*(){return nodecg.sendMessage("refreshTournamentData")}))}}});function c(e,n){return r(this,void 0,void 0,(function*(){const t=new FormData;t.append("file",n),t.append("jsonType",e);const o=yield fetch("/ipl-overlay-controls/upload-tournament-json",{method:"POST",body:t});if(200!==o.status){const e=yield o.text();throw new Error(`Import failed with status ${o.status}: ${e}`)}}))}},4970:(e,n,t)=>{"use strict";var o;t.d(n,{g:()=>o}),function(e){e.EN="EN",e.DE="DE",e.EU_FR="EU_FR"}(o||(o={}))},2007:(e,n,t)=>{"use strict";var o;t.d(n,{q:()=>o}),function(e){e.SPLATOON_2="SPLATOON_2",e.SPLATOON_3="SPLATOON_3"}(o||(o={}))},6475:(e,n,t)=>{"use strict";t.d(n,{Z:()=>c});var o=t(7875),r=t(7997),i=t(4981),u=t(8127),a=t(829),s=t.n(a);const d=(0,o.aZ)({name:"ModeSelect",components:{IplSelect:u.IplSelect},props:{modelValue:{type:String,default:null}},emits:["update:modelValue"],setup(e,{emit:n}){const t=(0,o.Fl)({get:()=>e.modelValue,set(e){n("update:modelValue",e)}}),u=(0,r.F)();return{model:t,options:(0,o.Fl)((()=>s()(Object.entries(i.G[u.runtimeConfig.gameVersion].modes[u.runtimeConfig.locale]).map((([e,n])=>({value:e,name:n}))),"name")))}}}),c=(0,t(4407).Z)(d,[["render",function(e,n,t,r,i,u){const a=(0,o.up)("ipl-select");return(0,o.wg)(),(0,o.j4)(a,{modelValue:e.model,"onUpdate:modelValue":n[0]||(n[0]=n=>e.model=n),options:e.options},null,8,["modelValue","options"])}]])},2904:(e,n,t)=>{"use strict";t.d(n,{Z:()=>c});var o=t(7875),r=t(7997),i=t(4981),u=t(8127),a=t(829),s=t.n(a);const d=(0,o.aZ)({name:"StageSelect",components:{IplSelect:u.IplSelect},props:{modelValue:{type:String,default:null}},emits:["update:modelValue"],setup(e,{emit:n}){const t=(0,o.Fl)({get:()=>e.modelValue,set(e){n("update:modelValue",e)}}),u=(0,r.F)();return{model:t,options:(0,o.Fl)((()=>s()(Object.entries(i.G[u.runtimeConfig.gameVersion].stages[u.runtimeConfig.locale]).map((([e,n])=>({value:e,name:n}))),"name")))}}}),c=(0,t(4407).Z)(d,[["render",function(e,n,t,r,i,u){const a=(0,o.up)("ipl-select");return(0,o.wg)(),(0,o.j4)(a,{modelValue:e.model,"onUpdate:modelValue":n[0]||(n[0]=n=>e.model=n),options:e.options},null,8,["modelValue","options"])}]])}}]);