(()=>{var e,t={5455:(e,t,a)=>{var n=a(6411),l=a(940),o=a(9631),u=a(6152),s=a(7878),d=a(3226),i=a(6001),r=a(7598),c=Object.prototype.hasOwnProperty;e.exports=function(e){if(null==e)return!0;if(s(e)&&(u(e)||"string"==typeof e||"function"==typeof e.splice||d(e)||r(e)||o(e)))return!e.length;var t=l(e);if("[object Map]"==t||"[object Set]"==t)return!e.size;if(i(e))return!n(e).length;for(var a in e)if(c.call(e,a))return!1;return!0}},7481:(e,t,a)=>{"use strict";a(223);var n=a(225),l=a(7875),o=a(641),u=a(2121),s=a(349);const d=(0,l.Uk)(" No stages present to import from. "),i={key:2},r=(0,l.Uk)(" No matches loaded. ");var c,m=a(8127),p=a(243),h=a(9850),g=a.n(h);!function(e){e.BATTLEFY="BATTLEFY",e.SMASHGG="SMASHGG",e.UPLOAD="UPLOAD",e.UNKNOWN="UNKNOWN"}(c||(c={}));var v=function(e,t,a,n){return new(a||(a=Promise))((function(l,o){function u(e){try{d(n.next(e))}catch(e){o(e)}}function s(e){try{d(n.throw(e))}catch(e){o(e)}}function d(e){var t;e.done?l(e.value):(t=e.value,t instanceof a?t:new a((function(e){e(t)}))).then(u,s)}d((n=n.apply(e,t||[])).next())}))};const f=[nodecg.Replicant("highlightedMatches"),nodecg.Replicant("tournamentData")],S=(0,p.MT)({state:{highlightedMatches:null,tournamentData:null},mutations:{setState(e,{name:t,val:a}){this.state[t]=g()(a)}},actions:{getHighlightedMatches(e,{options:t}){return v(this,void 0,void 0,(function*(){const a=t.some((e=>"all"===e.value));if(a)return nodecg.sendMessage("getHighlightedMatches",{getAllMatches:a});{const a=t.map((e=>e.value));switch(e.state.tournamentData.meta.source){case c.BATTLEFY:return nodecg.sendMessage("getHighlightedMatches",{getAllMatches:!1,stages:a});case c.SMASHGG:return nodecg.sendMessage("getHighlightedMatches",{getAllMatches:!1,streamIDs:a.map((e=>parseInt(e)))});default:throw new Error(`Cannot import data from source '${e.state.tournamentData.meta.source}'`)}}}))},setNextMatch(e,t){return v(this,void 0,void 0,(function*(){return nodecg.sendMessage("setNextRound",t)}))}}}),I=Symbol();function M(){return(0,p.oR)(I)}var w=function(e,t,a,n){return new(a||(a=Promise))((function(l,o){function u(e){try{d(n.next(e))}catch(e){o(e)}}function s(e){try{d(n.throw(e))}catch(e){o(e)}}function d(e){var t;e.done?l(e.value):(t=e.value,t instanceof a?t:new a((function(e){e(t)}))).then(u,s)}d((n=n.apply(e,t||[])).next())}))};const y=nodecg.Replicant("tournamentData"),b=nodecg.Replicant("roundStore"),R=nodecg.Replicant("matchStore"),D=[y,b,R],O=(0,p.MT)({state:{tournamentData:null,roundStore:null,matchStore:null},mutations:{setState(e,{name:t,val:a}){this.state[t]=g()(a)}},actions:{getTournamentData(e,{method:t,id:a}){return w(this,void 0,void 0,(function*(){return yield nodecg.sendMessage("getTournamentData",{method:t,id:a})}))},getSmashggEvent(e,{eventId:t}){return w(this,void 0,void 0,(function*(){return yield nodecg.sendMessage("getSmashggEvent",{eventId:t})}))},uploadTeamData(e,{file:t}){return w(this,void 0,void 0,(function*(){return x("teams",t)}))},uploadRoundData(e,{file:t}){return w(this,void 0,void 0,(function*(){return x("rounds",t)}))},fetchRoundData(e,{url:t}){return w(this,void 0,void 0,(function*(){return nodecg.sendMessage("getRounds",{url:t})}))},updateRound(e,t){return w(this,void 0,void 0,(function*(){return nodecg.sendMessage("updateRoundStore",t)}))},resetRoundStore(){nodecg.sendMessage("resetRoundStore")},setTeamImageHidden:(e,{teamId:t,isVisible:a})=>nodecg.sendMessage("toggleTeamImage",{teamId:t,isVisible:a}),removeRound:(e,{roundId:t})=>nodecg.sendMessage("removeRound",{roundId:t}),setShortName(e,t){y.value.meta.shortName=t}}});function x(e,t){return w(this,void 0,void 0,(function*(){const a=new FormData;a.append("file",t),a.append("jsonType",e);const n=yield fetch("/ipl-overlay-controls/upload-tournament-json",{method:"POST",body:a});if(200!==n.status){const e=yield n.text();throw new Error(`Import failed with status ${n.status}: ${e}`)}}))}const N=Symbol();function A(){return(0,p.oR)(N)}const T=(0,l.aZ)({name:"RoundSelect",components:{IplSelect:m.IplSelect},props:{modelValue:{type:[String,null],required:!0}},emits:["update:modelValue","update:roundData"],setup(e,{emit:t}){const a=A();return{value:(0,o.Fl)({get:()=>e.modelValue,set(e){t("update:modelValue",e),t("update:roundData",{id:e,roundData:a.state.roundStore[e]})}}),roundOptions:(0,o.Fl)((()=>Object.entries(a.state.roundStore).map((([e,t])=>({value:e,name:t.meta.name})))))}}});var V=a(4407);const B=(0,V.Z)(T,[["render",function(e,t,a,n,o,u){const s=(0,l.up)("ipl-select");return(0,l.wg)(),(0,l.iD)("div",null,[(0,l.Wm)(s,{modelValue:e.value,"onUpdate:modelValue":t[0]||(t[0]=t=>e.value=t),label:"Round",options:e.roundOptions,"data-test":"round-selector"},null,8,["modelValue","options"])])}]]),k=nodecg.Replicant("nextRound"),U=[k],F=(0,p.MT)({state:{nextRound:null},mutations:{setState(e,{name:t,val:a}){this.state[t]=g()(a)},setShowOnStream(e,t){k.value.showOnStream=t}},actions:{beginNextMatch(e,t){nodecg.sendMessage("beginNextMatch",t)},setNextRound(e,{teamAId:t,teamBId:a,roundId:n}){nodecg.sendMessage("setNextRound",{teamAId:t,teamBId:a,roundId:n})}}}),H=Symbol();function E(){return(0,p.oR)(H)}var L=a(908);const W=(0,l.aZ)({name:"HighlightedMatchViewer",components:{RoundSelect:B,IplMessage:m.IplMessage,IplDataRow:m.IplDataRow,IplSelect:m.IplSelect,IplButton:m.IplButton,IplSpace:m.IplSpace},setup(){const e=M(),t=E(),a=(0,o.iH)(null),n=(0,o.iH)(null);(0,l.m0)((()=>{var n,l,o;const u=t.state.nextRound,s=e.state.highlightedMatches.find((e=>e.teamA.id===u.teamA.id&&e.teamB.id===u.teamB.id));a.value=s?s.meta.id:null!==(o=null===(l=null===(n=e.state.highlightedMatches[0])||void 0===n?void 0:n.meta)||void 0===l?void 0:l.id)&&void 0!==o?o:null}));const u=(0,o.Fl)((()=>e.state.highlightedMatches.find((e=>e.meta.id===a.value))));return t.watch((e=>e.nextRound.round.id),(e=>{n.value=e}),{immediate:!0}),{addDots:L.f,matchOptions:(0,o.Fl)((()=>{const t=e.state.highlightedMatches.every((t=>t.meta.stageName===e.state.highlightedMatches[0].meta.stageName));return e.state.highlightedMatches.map((e=>({value:e.meta.id,name:t?e.meta.name:`${e.meta.name} | ${e.meta.stageName}`})))})),selectedMatch:a,selectedRound:n,selectedMatchData:u,disableSetNextMatch:(0,o.Fl)((()=>!u.value)),isChanged:(0,o.Fl)((()=>{var e,a;return t.state.nextRound.teamA.id!==(null===(e=u.value)||void 0===e?void 0:e.teamA.id)||t.state.nextRound.teamB.id!==(null===(a=u.value)||void 0===a?void 0:a.teamB.id)||t.state.nextRound.round.id!==n.value})),handleSetNextMatch(){return t=this,a=void 0,o=function*(){yield e.dispatch("setNextMatch",{teamAId:u.value.teamA.id,teamBId:u.value.teamB.id,roundId:n.value})},new((l=void 0)||(l=Promise))((function(e,n){function u(e){try{d(o.next(e))}catch(e){n(e)}}function s(e){try{d(o.throw(e))}catch(e){n(e)}}function d(t){var a;t.done?e(t.value):(a=t.value,a instanceof l?a:new l((function(e){e(a)}))).then(u,s)}d((o=o.apply(t,a||[])).next())}));var t,a,l,o}}}}),j=(0,V.Z)(W,[["render",function(e,t,a,n,o,u){var s;const d=(0,l.up)("ipl-message"),i=(0,l.up)("ipl-select"),c=(0,l.up)("ipl-data-row"),m=(0,l.up)("round-select"),p=(0,l.up)("ipl-button"),h=(0,l.up)("ipl-space");return(null===(s=e.matchOptions)||void 0===s?void 0:s.length)?((0,l.wg)(),(0,l.j4)(h,{key:1},{default:(0,l.w5)((()=>{var a,n,o,u;return[(0,l.Wm)(i,{modelValue:e.selectedMatch,"onUpdate:modelValue":t[0]||(t[0]=t=>e.selectedMatch=t),label:"Match",options:e.matchOptions,"data-test":"match-selector"},null,8,["modelValue","options"]),(0,l.Wm)(c,{label:"Team A",value:e.addDots(null===(n=null===(a=e.selectedMatchData)||void 0===a?void 0:a.teamA)||void 0===n?void 0:n.name),"data-test":"team-a-name-display"},null,8,["value"]),(0,l.Wm)(c,{label:"Team B",value:e.addDots(null===(u=null===(o=e.selectedMatchData)||void 0===o?void 0:o.teamB)||void 0===u?void 0:u.name),"data-test":"team-b-name-display"},null,8,["value"]),(0,l.Wm)(m,{modelValue:e.selectedRound,"onUpdate:modelValue":t[1]||(t[1]=t=>e.selectedRound=t),class:"m-t-4"},null,8,["modelValue"]),(0,l.Wm)(p,{class:"m-t-8",label:"Update",color:e.isChanged?"red":"blue",disabled:e.disableSetNextMatch,"data-test":"set-next-match-button",onClick:e.handleSetNextMatch},null,8,["color","disabled","onClick"])]})),_:1})):((0,l.wg)(),(0,l.j4)(d,{key:0,type:"info"},{default:(0,l.w5)((()=>[r])),_:1}))}]]);var P;!function(e){e.SWISS="SWISS",e.DOUBLE_ELIMINATION="DOUBLE_ELIMINATION",e.SINGLE_ELIMINATION="SINGLE_ELIMINATION",e.ROUND_ROBIN="ROUND_ROBIN",e.LADDER="LADDER"}(P||(P={}));const _=(0,l.aZ)({name:"HighlightedMatchImporter",components:{IplSpace:m.IplSpace,IplButton:m.IplButton,IplMultiSelect:m.IplMultiSelect},setup(){const e=M(),t=(0,o.Fl)((()=>e.state.tournamentData.meta.source)),a=(0,o.iH)([]);return{matchSelectLabel:(0,o.Fl)((()=>{switch(t.value){case c.BATTLEFY:return"Bracket";case c.SMASHGG:return"Stream";default:return""}})),matchSelectOptions:(0,o.Fl)((()=>{switch(t.value){case c.BATTLEFY:return[...e.state.tournamentData.stages.filter((e=>[P.SWISS,P.DOUBLE_ELIMINATION,P.SINGLE_ELIMINATION,P.ROUND_ROBIN].includes(e.type))).map((e=>({value:e.id,name:e.name}))),{name:"All Brackets",value:"all"}];case c.SMASHGG:return[...e.state.tournamentData.meta.sourceSpecificData.smashgg.streams.map((e=>({value:e.id.toString(),name:e.streamName}))),{name:"All Streams",value:"all"}];default:return[]}})),selectedMatchOptions:a,handleImport(){return t=this,n=void 0,o=function*(){return e.dispatch("getHighlightedMatches",{options:a.value})},new((l=void 0)||(l=Promise))((function(e,a){function u(e){try{d(o.next(e))}catch(e){a(e)}}function s(e){try{d(o.throw(e))}catch(e){a(e)}}function d(t){var a;t.done?e(t.value):(a=t.value,a instanceof l?a:new l((function(e){e(a)}))).then(u,s)}d((o=o.apply(t,n||[])).next())}));var t,n,l,o},importDisabled:(0,o.Fl)((()=>{var e;return(null===(e=a.value)||void 0===e?void 0:e.length)<=0}))}}}),C=(0,V.Z)(_,[["render",function(e,t,a,n,o,u){const s=(0,l.up)("ipl-multi-select"),d=(0,l.up)("ipl-button"),i=(0,l.up)("ipl-space");return(0,l.wg)(),(0,l.j4)(i,null,{default:(0,l.w5)((()=>[(0,l.Wm)(s,{modelValue:e.selectedMatchOptions,"onUpdate:modelValue":t[0]||(t[0]=t=>e.selectedMatchOptions=t),label:e.matchSelectLabel,options:e.matchSelectOptions,"data-test":"match-selector"},null,8,["modelValue","label","options"]),(0,l.Wm)(d,{label:"Import",class:"m-t-8",async:"",disabled:e.importDisabled,"data-test":"import-button",onClick:e.handleImport},null,8,["disabled","onClick"])])),_:1})}]]);var G=a(5455),Z=a.n(G);const Y=(0,l.aZ)({name:"HighlightedMatchPicker",components:{HighlightedMatchViewer:j,HighlightedMatchImporter:C,IplMessage:m.IplMessage},setup(){const e=M(),t=(0,o.Fl)((()=>e.state.tournamentData.meta.source));return{canImportData:(0,o.Fl)((()=>[c.BATTLEFY,c.SMASHGG].includes(t.value))),formattedDataSource:(0,o.Fl)((()=>class{static toPrettyString(e){return{[c.BATTLEFY]:"Battlefy",[c.SMASHGG]:"Smash.gg",[c.UPLOAD]:"Uploaded file",[c.UNKNOWN]:"Unknown"}[e]}}.toPrettyString(t.value))),stageDataPresent:(0,o.Fl)((()=>!Z()(e.state.tournamentData.stages)))}}}),$=(0,V.Z)(Y,[["render",function(e,t,a,n,o,u){const r=(0,l.up)("ipl-message"),c=(0,l.up)("highlighted-match-importer"),m=(0,l.up)("highlighted-match-viewer");return e.canImportData?e.stageDataPresent?((0,l.wg)(),(0,l.iD)("div",i,[(0,l.Wm)(c),(0,l.Wm)(m,{class:"m-t-8"})])):((0,l.wg)(),(0,l.j4)(r,{key:1,type:"info","data-test":"missing-stages-message"},{default:(0,l.w5)((()=>[d])),_:1})):((0,l.wg)(),(0,l.j4)(r,{key:0,type:"warning","data-test":"unsupported-source-warning"},{default:(0,l.w5)((()=>[(0,l.Uk)(" Cannot import data from source '"+(0,s.zw)(e.formattedDataSource)+"'. ",1)])),_:1}))}]]),z={class:"layout horizontal"},q={class:"layout vertical center-horizontal max-width"},K=(0,l.aZ)({name:"TeamSelect",components:{IplSelect:m.IplSelect,IplCheckbox:m.IplCheckbox},props:{modelValue:{type:[String,null],required:!0},label:{type:String,required:!0}},emits:["update:modelValue"],setup(e,{emit:t}){const a=A(),n=(0,o.Fl)({get:()=>e.modelValue,set(e){t("update:modelValue",e)}}),l=(0,o.Fl)((()=>a.state.tournamentData.teams.find((e=>e.id===n.value))));return{teamId:n,teams:(0,o.Fl)((()=>a.state.tournamentData.teams.map((e=>({value:e.id,name:(0,L.f)(e.name)}))))),teamImageShown:(0,o.Fl)({get:()=>l.value.showLogo,set(e){a.dispatch("setTeamImageHidden",{teamId:n.value,isVisible:e})}})}}}),J=(0,V.Z)(K,[["render",function(e,t,a,n,o,u){const s=(0,l.up)("ipl-select"),d=(0,l.up)("ipl-checkbox");return(0,l.wg)(),(0,l.iD)("div",q,[(0,l.Wm)(s,{modelValue:e.teamId,"onUpdate:modelValue":t[0]||(t[0]=t=>e.teamId=t),label:e.label,"data-test":"team-selector",options:e.teams},null,8,["modelValue","label","options"]),(0,l.Wm)(d,{modelValue:e.teamImageShown,"onUpdate:modelValue":t[1]||(t[1]=t=>e.teamImageShown=t),class:"m-t-6",label:"Show image","data-test":"team-image-toggle",small:""},null,8,["modelValue"])])}]]),Q=(0,l.aZ)({name:"ManualTeamPicker",components:{IplButton:m.IplButton,RoundSelect:B,TeamSelect:J,IplSpace:m.IplSpace},setup(){const e=E(),t=(0,o.iH)(e.state.nextRound.teamA.id),a=(0,o.iH)(e.state.nextRound.teamB.id),n=(0,o.iH)(e.state.nextRound.round.id);return e.watch((e=>e.nextRound.teamA.id),(e=>t.value=e),{immediate:!0}),e.watch((e=>e.nextRound.teamB.id),(e=>a.value=e),{immediate:!0}),e.watch((e=>e.nextRound.round.id),(e=>n.value=e),{immediate:!0}),{teamAId:t,teamBId:a,selectedRound:n,isChanged:(0,o.Fl)((()=>t.value!==e.state.nextRound.teamA.id||a.value!==e.state.nextRound.teamB.id||n.value!==e.state.nextRound.round.id)),handleUpdate(){e.dispatch("setNextRound",{teamAId:t.value,teamBId:a.value,roundId:n.value})}}}}),X=(0,V.Z)(Q,[["render",function(e,t,a,n,o,u){const s=(0,l.up)("team-select"),d=(0,l.up)("round-select"),i=(0,l.up)("ipl-button"),r=(0,l.up)("ipl-space");return(0,l.wg)(),(0,l.j4)(r,null,{default:(0,l.w5)((()=>[(0,l._)("div",z,[(0,l.Wm)(s,{modelValue:e.teamAId,"onUpdate:modelValue":t[0]||(t[0]=t=>e.teamAId=t),label:"Team A","data-test":"team-a-selector"},null,8,["modelValue"]),(0,l.Wm)(s,{modelValue:e.teamBId,"onUpdate:modelValue":t[1]||(t[1]=t=>e.teamBId=t),label:"Team B",class:"m-l-8","data-test":"team-b-selector"},null,8,["modelValue"])]),(0,l.Wm)(d,{modelValue:e.selectedRound,"onUpdate:modelValue":t[2]||(t[2]=t=>e.selectedRound=t),class:"m-t-8"},null,8,["modelValue"]),(0,l.Wm)(i,{label:"Update",class:"m-t-8",color:e.isChanged?"red":"blue","data-test":"update-button",onClick:e.handleUpdate},null,8,["color","onClick"])])),_:1})}]]),ee=(0,l.aZ)({name:"HighlightedMatches",components:{ManualTeamPicker:X,HighlightedMatchPicker:$,IplErrorDisplay:u.Z,IplCheckbox:m.IplCheckbox,IplSpace:m.IplSpace},setup(){const e=E();return{chooseTeamsManually:(0,o.iH)(!1),showOnStream:(0,o.Fl)({get:()=>e.state.nextRound.showOnStream,set(t){e.commit("setShowOnStream",t)}})}}}),te=(0,V.Z)(ee,[["render",function(e,t,a,n,o,u){const s=(0,l.up)("ipl-error-display"),d=(0,l.up)("ipl-checkbox"),i=(0,l.up)("ipl-space"),r=(0,l.up)("highlighted-match-picker"),c=(0,l.up)("manual-team-picker");return(0,l.wg)(),(0,l.iD)(l.HY,null,[(0,l.Wm)(s,{class:"m-b-8"}),(0,l.Wm)(i,null,{default:(0,l.w5)((()=>[(0,l.Wm)(d,{modelValue:e.chooseTeamsManually,"onUpdate:modelValue":t[0]||(t[0]=t=>e.chooseTeamsManually=t),label:"Choose teams manually","data-test":"choose-manually-toggle"},null,8,["modelValue"]),(0,l.Wm)(d,{modelValue:e.showOnStream,"onUpdate:modelValue":t[1]||(t[1]=t=>e.showOnStream=t),label:"Show on stream",class:"m-t-8","data-test":"show-on-stream-toggle"},null,8,["modelValue"])])),_:1}),e.chooseTeamsManually?((0,l.wg)(),(0,l.j4)(c,{key:1,class:"m-t-8"})):((0,l.wg)(),(0,l.j4)(r,{key:0,class:"m-t-8"}))],64)}]]);var ae,ne,le=a(4825),oe=a(4928);ne=function*(){yield(0,n.r)(f,S),yield(0,n.r)(D,O),yield(0,n.r)(U,F);const e=(0,le.ri)(te);(0,oe.EW)(e),e.use(S,I),e.use(O,N),e.use(F,H),e.mount("#app")},new((ae=void 0)||(ae=Promise))((function(e,t){function a(e){try{l(ne.next(e))}catch(e){t(e)}}function n(e){try{l(ne.throw(e))}catch(e){t(e)}}function l(t){var l;t.done?e(t.value):(l=t.value,l instanceof ae?l:new ae((function(e){e(l)}))).then(a,n)}l((ne=ne.apply(void 0,[])).next())}))}},a={};function n(e){var l=a[e];if(void 0!==l)return l.exports;var o=a[e]={id:e,loaded:!1,exports:{}};return t[e](o,o.exports,n),o.loaded=!0,o.exports}n.m=t,e=[],n.O=(t,a,l,o)=>{if(!a){var u=1/0;for(r=0;r<e.length;r++){for(var[a,l,o]=e[r],s=!0,d=0;d<a.length;d++)(!1&o||u>=o)&&Object.keys(n.O).every((e=>n.O[e](a[d])))?a.splice(d--,1):(s=!1,o<u&&(u=o));if(s){e.splice(r--,1);var i=l();void 0!==i&&(t=i)}}return t}o=o||0;for(var r=e.length;r>0&&e[r-1][2]>o;r--)e[r]=e[r-1];e[r]=[a,l,o]},n.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return n.d(t,{a:t}),t},n.d=(e,t)=>{for(var a in t)n.o(t,a)&&!n.o(e,a)&&Object.defineProperty(e,a,{enumerable:!0,get:t[a]})},n.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.nmd=e=>(e.paths=[],e.children||(e.children=[]),e),(()=>{var e={163:0};n.O.j=t=>0===e[t];var t=(t,a)=>{var l,o,[u,s,d]=a,i=0;if(u.some((t=>0!==e[t]))){for(l in s)n.o(s,l)&&(n.m[l]=s[l]);if(d)var r=d(n)}for(t&&t(a);i<u.length;i++)o=u[i],n.o(e,o)&&e[o]&&e[o][0](),e[u[i]]=0;return n.O(r)},a=self.webpackChunk=self.webpackChunk||[];a.forEach(t.bind(null,0)),a.push=t.bind(null,a.push.bind(a))})();var l=n.O(void 0,[498],(()=>n(7481)));l=n.O(l)})();