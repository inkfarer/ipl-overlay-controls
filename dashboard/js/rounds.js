(()=>{"use strict";var e,n={1459:(e,n)=>{n.DF={prefix:"fas",iconName:"bars",icon:[448,512,[],"f0c9","M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"]},n.xi=n.DF},8525:(e,n,o)=>{o.d(n,{Z:()=>d});var t=o(2609),a=o.n(t)()((function(e){return e[1]}));a.push([e.id,".separator[data-v-6352bfce]{width:100%;text-align:center;border-bottom:1px solid #fff;color:#fff;line-height:.1em;margin:14px 0 10px;user-select:none}.separator span[data-v-6352bfce]{background:#262f40;padding:0 10px}",""]);const d=a},164:(e,n,o)=>{o.d(n,{Z:()=>d});var t=o(2609),a=o.n(t)()((function(e){return e[1]}));a.push([e.id,'.top-bar-button[data-v-76e811e8]{padding:10px 20px;width:max-content}.color-key[data-v-76e811e8]{height:18px;width:18px;border-radius:5px;margin:0 8px}.color-key[data-v-76e811e8]:first-child{margin-left:0}.color-key.color-key-next[data-v-76e811e8]{background-color:#ffc700}.round-option[data-v-76e811e8]{user-select:none;cursor:pointer;transition-duration:100ms;position:relative;overflow-wrap:anywhere}.round-option.selected[data-v-76e811e8]{background-color:#6155bd}.round-option.selected[data-v-76e811e8]:hover{background-color:#574caa}.round-option.selected[data-v-76e811e8]:active{background-color:#4e4497}.round-option.is-next-round[data-v-76e811e8]{padding-right:16px}.round-option.is-next-round[data-v-76e811e8]:after{border-radius:0 7px 7px 0;content:"";position:absolute;width:calc(100% - 8px);height:100%;left:0;top:0;border-right:8px solid #ffc700}.round-option[data-v-76e811e8]:hover{background-color:#3c4b66}.round-option[data-v-76e811e8]:active{background-color:#334057}.menu-icon[data-v-76e811e8]{font-size:1.25em;margin-right:8px}.round-menu-space[data-v-76e811e8]{user-select:none;cursor:pointer;font-weight:500}',""]);const d=a},3950:(e,n,o)=>{o(223);var t=o(225),a=o(7875),d=o(349);const r=(e=>((0,a.dD)("data-v-76e811e8"),e=e(),(0,a.Cn)(),e))((()=>(0,a._)("div",{class:"color-key color-key-next"},null,-1))),l=(0,a.Uk)(" Next round "),s={class:"layout horizontal"},u=(0,a.Uk)(" All Rounds ");var i=o(641),c=o(8127),p=o(2782),m=o(8149),v=o.n(m),g=o(9850),f=o.n(g);const w={class:"separator"},b={class:"layout horizontal m-t-8"};var h,y=o(8751),R=o(4847);!function(e){e.PLAY_ALL="PLAY_ALL",e.BEST_OF="BEST_OF"}(h||(h={}));class x{static toPrettyString(e,n){return{[h.PLAY_ALL]:`Play all ${n}`,[h.BEST_OF]:`Best of ${n}`}[e]}}var I=o(1613),k=o(438);y.vI.add(R.NB);const S=(0,a.aZ)({name:"RoundEditor",components:{IplSpace:c.IplSpace,IplSelect:c.IplSelect,IplButton:c.IplButton,IplInput:c.IplInput},props:{round:{type:Object,required:!0},roundId:{type:String,required:!0},isNewRound:{type:Boolean,required:!0}},emits:["cancelNewRound","createNewRound"],setup(e,{emit:n}){const o=(0,p.Rc)(),t=(0,I.F2)(),d=(0,i.Fl)((()=>k.G[t.state.runtimeConfig.gameVersion])),r=(0,i.iH)(null);return(0,a.YP)((()=>e.round),((e,n)=>{r.value=Object.assign(Object.assign({},e),{meta:f()(e.meta),games:e.games.map(((e,o)=>{var t,a;const d=null==n?void 0:n.games[o],l=Object.assign({},null===(a=null===(t=r.value)||void 0===t?void 0:t.games)||void 0===a?void 0:a[o]);return(null==d?void 0:d.mode)!==e.mode&&(l.mode=e.mode),(null==d?void 0:d.stage)!==e.stage&&(l.stage=e.stage),l}))})}),{immediate:!0}),{roundInternal:r,stages:(0,i.Fl)((()=>d.value.stages.map((e=>({value:e,name:e}))))),modes:(0,i.Fl)((()=>d.value.modes.map((e=>({value:e,name:e}))))),handleUpdate(){return t=this,a=void 0,l=function*(){const t=yield o.dispatch("updateRound",Object.assign(Object.assign({},!e.isNewRound&&{id:e.roundId}),{roundName:r.value.meta.name,type:r.value.meta.type,games:r.value.games.map((e=>({mode:e.mode,stage:e.stage})))}));e.isNewRound&&n("createNewRound",t.id)},new((d=void 0)||(d=Promise))((function(e,n){function o(e){try{s(l.next(e))}catch(e){n(e)}}function r(e){try{s(l.throw(e))}catch(e){n(e)}}function s(n){var t;n.done?e(n.value):(t=n.value,t instanceof d?t:new d((function(e){e(t)}))).then(o,r)}s((l=l.apply(t,a||[])).next())}));var t,a,d,l},handleDelete(){if(!e.isNewRound)return o.dispatch("removeRound",{roundId:e.roundId});n("cancelNewRound")},isChanged:(0,i.Fl)((()=>{var n,o;return e.round.meta.name!==(null===(n=r.value)||void 0===n?void 0:n.meta.name)||e.round.meta.type!==(null===(o=r.value)||void 0===o?void 0:o.meta.type)||e.round.games.some(((e,n)=>{var o;const t=null===(o=r.value)||void 0===o?void 0:o.games[n];return e.mode!==t.mode||e.stage!==t.stage}))})),typeOptions:(0,i.Fl)((()=>Object.values(h).map((e=>({value:e,name:x.toPrettyString(e,r.value.games.length)})))))}}});var C=o(6062),O=o.n(C),_=o(8525);O()(_.Z,{insert:"head",singleton:!1}),_.Z.locals;var N=o(4407);const W=(0,N.Z)(S,[["render",function(e,n,o,t,r,l){const s=(0,a.up)("ipl-input"),u=(0,a.up)("ipl-select"),i=(0,a.up)("ipl-button"),c=(0,a.up)("ipl-space");return(0,a.wg)(),(0,a.j4)(c,null,{default:(0,a.w5)((()=>[(0,a.Wm)(s,{modelValue:e.roundInternal.meta.name,"onUpdate:modelValue":n[0]||(n[0]=n=>e.roundInternal.meta.name=n),label:"Name",name:"round-name"},null,8,["modelValue"]),(0,a.Wm)(u,{modelValue:e.roundInternal.meta.type,"onUpdate:modelValue":n[1]||(n[1]=n=>e.roundInternal.meta.type=n),label:"Type",class:"m-t-6",options:e.typeOptions},null,8,["modelValue","options"]),((0,a.wg)(!0),(0,a.iD)(a.HY,null,(0,a.Ko)(e.roundInternal.games,((n,o)=>((0,a.wg)(),(0,a.iD)(a.HY,{key:`game-editor-${o}`},[(0,a._)("div",w,[(0,a._)("span",null,(0,d.zw)(o+1),1)]),(0,a.Wm)(u,{modelValue:n.mode,"onUpdate:modelValue":e=>n.mode=e,options:e.modes,"data-test":`mode-selector-${o}`},null,8,["modelValue","onUpdate:modelValue","options","data-test"]),(0,a.Wm)(u,{modelValue:n.stage,"onUpdate:modelValue":e=>n.stage=e,class:"m-t-8",options:e.stages,"data-test":`stage-selector-${o}`},null,8,["modelValue","onUpdate:modelValue","options","data-test"])],64)))),128)),(0,a._)("div",b,[(0,a.Wm)(i,{label:e.isNewRound?"Save":"Update",color:e.isNewRound?"green":e.isChanged?"red":"blue","data-test":"update-button",onClick:e.handleUpdate},null,8,["label","color","onClick"]),(0,a.Wm)(i,{icon:"times",class:"m-l-6",color:"red","data-test":"remove-button",onClick:e.handleDelete},null,8,["onClick"])])])),_:1})}],["__scopeId","data-v-6352bfce"]]);var j=o(1459),F=o(1901),A=o(417),U=o(2121);y.vI.add(j.xi);const V=(0,a.aZ)({name:"Rounds",components:{IplErrorDisplay:U.Z,IplExpandingSpace:c.IplExpandingSpace,IplSidebar:c.IplSidebar,RoundEditor:W,IplButton:c.IplButton,IplSpace:c.IplSpace,FontAwesomeIcon:F.GN},setup(){const e=(0,p.Rc)(),n=(0,A.o_)(),o=(0,i.iH)({}),t=(0,i.iH)(Object.keys(e.state.roundStore)[0]),a=(0,i.iH)(!1),d=(0,i.iH)({}),r=(0,i.iH)(!1);return e.watch((e=>e.roundStore),((e,n)=>{e[t.value]||(t.value=Object.keys(e)[0]),Object.entries(e).forEach((([e,t])=>{v()(t,null==n?void 0:n[e])||(o.value[e]=f()(t))})),Object.keys(o.value).forEach((n=>{e[n]||delete o.value[n]}))}),{immediate:!0,deep:!0}),{rounds:o,selectedRoundId:t,selectedRound:(0,i.Fl)((()=>e.state.roundStore[t.value])),resetRounds(){e.dispatch("resetRoundStore")},openRoundSidebar:a,selectRound(e){r.value=!1,a.value=!1,t.value=e},createRound(e){d.value={meta:{name:"New Round",type:h.BEST_OF},games:Array(e).fill({mode:"Unknown Mode",stage:"Unknown Stage"})},r.value=!0},creatingNewRound:r,newRound:d,nextRoundId:(0,i.Fl)((()=>n.state.nextRound.round.id))}}});var H=o(164);O()(H.Z,{insert:"head",singleton:!1}),H.Z.locals;const M=(0,N.Z)(V,[["render",function(e,n,o,t,i,c){const p=(0,a.up)("ipl-error-display"),m=(0,a.up)("ipl-button"),v=(0,a.up)("ipl-space"),g=(0,a.up)("ipl-sidebar"),f=(0,a.up)("ipl-expanding-space"),w=(0,a.up)("font-awesome-icon"),b=(0,a.up)("round-editor");return(0,a.wg)(),(0,a.iD)(a.HY,null,[(0,a.Wm)(p,{class:"m-b-8"}),(0,a.Wm)(g,{"is-open":e.openRoundSidebar,"onUpdate:is-open":n[0]||(n[0]=n=>e.openRoundSidebar=n)},{default:(0,a.w5)((()=>[(0,a.Wm)(v,{color:"light"},{default:(0,a.w5)((()=>[(0,a.Wm)(m,{color:"red",label:"Reset rounds","requires-confirmation":"","data-test":"reset-rounds-button",onClick:e.resetRounds},null,8,["onClick"])])),_:1}),(0,a.Wm)(v,{class:"layout horizontal m-t-8",color:"light"},{default:(0,a.w5)((()=>[r,l])),_:1}),((0,a.wg)(!0),(0,a.iD)(a.HY,null,(0,a.Ko)(e.rounds,((n,o)=>((0,a.wg)(),(0,a.j4)(v,{key:`round_${o}`,color:"light",class:(0,d.C_)(["m-t-8 round-option",{selected:e.selectedRoundId===o,"is-next-round":e.nextRoundId===o}]),"data-test":`round-option-${o}`,onClick:n=>e.selectRound(o)},{default:(0,a.w5)((()=>[(0,a.Uk)((0,d.zw)(n.meta.name),1)])),_:2},1032,["class","data-test","onClick"])))),128))])),_:1},8,["is-open"]),(0,a.Wm)(f,{title:"Create Round"},{default:(0,a.w5)((()=>[(0,a._)("div",s,[(0,a.Wm)(m,{label:"3 Games",color:"green","data-test":"new-3-game-round",onClick:n[1]||(n[1]=n=>e.createRound(3))}),(0,a.Wm)(m,{label:"5 Games",color:"green",class:"m-l-6","data-test":"new-5-game-round",onClick:n[2]||(n[2]=n=>e.createRound(5))})]),(0,a.Wm)(m,{label:"7 Games",color:"green",class:"m-t-6","data-test":"new-7-game-round",onClick:n[3]||(n[3]=n=>e.createRound(7))})])),_:1}),(0,a.Wm)(v,{class:"layout horizontal center-vertical round-menu-space m-t-8","data-test":"open-all-rounds-sidebar",onClick:n[4]||(n[4]=n=>e.openRoundSidebar=!0)},{default:(0,a.w5)((()=>[(0,a.Wm)(w,{icon:"bars",class:"menu-icon"}),u])),_:1}),e.selectedRound?((0,a.wg)(),(0,a.j4)(b,{key:0,class:"m-t-8","round-id":e.selectedRoundId,round:e.creatingNewRound?e.newRound:e.selectedRound,"is-new-round":e.creatingNewRound,"data-test":"round-editor",onCancelNewRound:n[5]||(n[5]=n=>e.creatingNewRound=!1),onCreateNewRound:e.selectRound},null,8,["round-id","round","is-new-round","onCreateNewRound"])):(0,a.kq)("",!0)],64)}],["__scopeId","data-v-76e811e8"]]);var E=o(4825),P=o(243);const T=nodecg.Replicant("activeRound"),Z=nodecg.Replicant("swapColorsInternally"),z=[T,Z],B=(0,P.MT)({state:{activeRound:null,swapColorsInternally:null},mutations:{setState(e,{name:n,val:o}){this.state[n]=f()(o)}},actions:{setWinner(e,{winner:n}){nodecg.sendMessage("setWinner",{winner:n})},removeWinner(){nodecg.sendMessage("removeWinner")},setActiveColor(e,n){nodecg.sendMessage("setActiveColor",n)},swapColors(){Z.value=!Z.value},setWinnerForIndex(e,{index:n,winner:o}){nodecg.sendMessage("setWinner",{winner:o,roundIndex:n})},resetActiveRound(){nodecg.sendMessage("resetActiveRound")},setActiveRound(e,n){nodecg.sendMessage("setActiveRound",n)},swapRoundColor(e,n){nodecg.sendMessage("swapRoundColor",n)},updateActiveGames(e,n){nodecg.sendMessage("updateActiveGames",{games:n})}}}),Y=Symbol();var D,L,G=o(4928);L=function*(){yield(0,t.r)(p.KH,p.eY),yield(0,t.r)(z,B),yield(0,t.r)(A.Qz,A.Ce),yield(0,t.r)(I.ZR,I.QT);const e=(0,E.ri)(M);(0,G.EW)(e),e.use(p.eY,p.F9),e.use(B,Y),e.use(A.Ce,A.YU),e.use(I.QT,I.eo),e.mount("#app")},new((D=void 0)||(D=Promise))((function(e,n){function o(e){try{a(L.next(e))}catch(e){n(e)}}function t(e){try{a(L.throw(e))}catch(e){n(e)}}function a(n){var a;n.done?e(n.value):(a=n.value,a instanceof D?a:new D((function(e){e(a)}))).then(o,t)}a((L=L.apply(void 0,[])).next())}))}},o={};function t(e){var a=o[e];if(void 0!==a)return a.exports;var d=o[e]={id:e,loaded:!1,exports:{}};return n[e](d,d.exports,t),d.loaded=!0,d.exports}t.m=n,e=[],t.O=(n,o,a,d)=>{if(!o){var r=1/0;for(i=0;i<e.length;i++){for(var[o,a,d]=e[i],l=!0,s=0;s<o.length;s++)(!1&d||r>=d)&&Object.keys(t.O).every((e=>t.O[e](o[s])))?o.splice(s--,1):(l=!1,d<r&&(r=d));if(l){e.splice(i--,1);var u=a();void 0!==u&&(n=u)}}return n}d=d||0;for(var i=e.length;i>0&&e[i-1][2]>d;i--)e[i]=e[i-1];e[i]=[o,a,d]},t.n=e=>{var n=e&&e.__esModule?()=>e.default:()=>e;return t.d(n,{a:n}),n},t.d=(e,n)=>{for(var o in n)t.o(n,o)&&!t.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:n[o]})},t.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),t.o=(e,n)=>Object.prototype.hasOwnProperty.call(e,n),t.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.nmd=e=>(e.paths=[],e.children||(e.children=[]),e),(()=>{var e={89:0};t.O.j=n=>0===e[n];var n=(n,o)=>{var a,d,[r,l,s]=o,u=0;if(r.some((n=>0!==e[n]))){for(a in l)t.o(l,a)&&(t.m[a]=l[a]);if(s)var i=s(t)}for(n&&n(o);u<r.length;u++)d=r[u],t.o(e,d)&&e[d]&&e[d][0](),e[r[u]]=0;return t.O(i)},o=self.webpackChunk=self.webpackChunk||[];o.forEach(n.bind(null,0)),o.push=n.bind(null,o.push.bind(o))})();var a=t.O(void 0,[498,901,896],(()=>t(3950)));a=t.O(a)})();