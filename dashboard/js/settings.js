(()=>{var e,t={1459:(e,t)=>{"use strict";t.DF={prefix:"fas",iconName:"bars",icon:[448,512,[],"f0c9","M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"]},t.xi=t.DF},4712:(e,t,n)=>{"use strict";n.d(t,{Z:()=>o});var a=n(2609),l=n.n(a)()((function(e){return e[1]}));l.push([e.id,".obs-status_CONNECTING{background-color:#ffc700 !important;color:#222}.obs-status_NOT_CONNECTED{background-color:#e74e36 !important}.obs-status_CONNECTED{background-color:#00a651 !important}",""]);const o=l},2602:(e,t,n)=>{var a=n(3759),l=n(5041);e.exports=function(e,t){return a(e,t,(function(t,n){return l(e,n)}))}},3759:(e,t,n)=>{var a=n(3324),l=n(2857),o=n(7297);e.exports=function(e,t,n){for(var s=-1,i=t.length,r={};++s<i;){var u=t[s],c=a(e,u);n(c,u)&&l(r,o(u,e),c)}return r}},5809:e=>{var t=Math.floor,n=Math.random;e.exports=function(e,a){return e+t(n()*(a-e+1))}},2857:(e,t,n)=>{var a=n(91),l=n(7297),o=n(9045),s=n(9259),i=n(3812);e.exports=function(e,t,n,r){if(!s(e))return e;for(var u=-1,c=(t=l(t,e)).length,d=c-1,p=e;null!=p&&++u<c;){var m=i(t[u]),g=n;if("__proto__"===m||"constructor"===m||"prototype"===m)return e;if(u!=d){var v=p[m];void 0===(g=r?r(v,m,p):void 0)&&(g=s(v)?v:o(t[u+1])?[]:{})}a(p,m,g),p=p[m]}return e}},1704:(e,t,n)=>{var a=n(2153),l=/^\s+/;e.exports=function(e){return e?e.slice(0,a(e)+1).replace(l,""):e}},9097:(e,t,n)=>{var a=n(5676),l=n(3114),o=n(5251);e.exports=function(e){return o(l(e,void 0,a),e+"")}},2406:(e,t,n)=>{var a=n(1225),l=n(7878),o=n(9045),s=n(9259);e.exports=function(e,t,n){if(!s(n))return!1;var i=typeof t;return!!("number"==i?l(n)&&o(t,n.length):"string"==i&&t in n)&&a(n[t],e)}},2153:e=>{var t=/\s/;e.exports=function(e){for(var n=e.length;n--&&t.test(e.charAt(n)););return n}},5676:(e,t,n)=>{var a=n(2034);e.exports=function(e){return null!=e&&e.length?a(e,1):[]}},3888:(e,t,n)=>{var a=n(2602),l=n(9097)((function(e,t){return null==e?{}:a(e,t)}));e.exports=l},2349:(e,t,n)=>{var a=n(5809),l=n(2406),o=n(5707),s=parseFloat,i=Math.min,r=Math.random;e.exports=function(e,t,n){if(n&&"boolean"!=typeof n&&l(e,t,n)&&(t=n=void 0),void 0===n&&("boolean"==typeof t?(n=t,t=void 0):"boolean"==typeof e&&(n=e,e=void 0)),void 0===e&&void 0===t?(e=0,t=1):(e=o(e),void 0===t?(t=e,e=0):t=o(t)),e>t){var u=e;e=t,t=u}if(n||e%1||t%1){var c=r();return i(e+c*(t-e+s("1e-"+((c+"").length-1))),t)}return a(e,t)}},5707:(e,t,n)=>{var a=n(7642);e.exports=function(e){return e?Infinity===(e=a(e))||e===-1/0?17976931348623157e292*(e<0?-1:1):e==e?e:0:0===e?e:0}},7642:(e,t,n)=>{var a=n(1704),l=n(9259),o=n(4795),s=/^[-+]0x[0-9a-f]+$/i,i=/^0b[01]+$/i,r=/^0o[0-7]+$/i,u=parseInt;e.exports=function(e){if("number"==typeof e)return e;if(o(e))return NaN;if(l(e)){var t="function"==typeof e.valueOf?e.valueOf():e;e=l(t)?t+"":t}if("string"!=typeof e)return 0===e?e:+e;e=a(e);var n=i.test(e);return n||r.test(e)?u(e.slice(2),n?2:8):s.test(e)?NaN:+e}},6951:(e,t,n)=>{"use strict";n(223);var a,l=n(225),o=n(9745);!function(e){e.SPLATOON_2="SPLATOON_2",e.SPLATOON_3="SPLATOON_3"}(a||(a={}));class s{static toPrettyString(e){return{[a.SPLATOON_2]:"Splatoon 2",[a.SPLATOON_3]:"Splatoon 3"}[e]}}var i,r=n(9850),u=n.n(r);!function(e){e.EN="EN",e.DE="DE"}(i||(i={}));class c{static toPrettyString(e){return{[i.EN]:"English",[i.DE]:"Deutsch"}[e]}}const d={[i.EN]:{"Unknown Stage":"Unknown Stage",Counterpick:"Counterpick"},[i.DE]:{"Unknown Stage":"Unbekannte Arena",Counterpick:"Counterpick"}},p={[i.EN]:{"Unknown Mode":"Unknown Mode"},[i.DE]:{"Unknown Mode":"Unbekannte Kampfart"}};function m(e){const t=u()(e);return t.stages=Object.entries(t.stages).reduce(((e,[t,n])=>(e[t]=Object.assign(Object.assign({},n),d[t]),e)),{}),t.modes=Object.entries(t.modes).reduce(((e,[t,n])=>(e[t]=Object.assign(Object.assign({},n),p[t]),e)),{}),t.colors.push({meta:{name:"Custom Color"},colors:[{index:0,title:"Custom Color",clrA:"#000000",clrB:"#FFFFFF",clrNeutral:"#818181",isCustom:!0}]}),t}const g=m({stages:{[i.EN]:{"Ancho-V Games":"Ancho-V Games","Arowana Mall":"Arowana Mall","Blackbelly Skatepark":"Blackbelly Skatepark","Camp Triggerfish":"Camp Triggerfish","Goby Arena":"Goby Arena","Humpback Pump Track":"Humpback Pump Track","Inkblot Art Academy":"Inkblot Art Academy","Kelp Dome":"Kelp Dome",MakoMart:"MakoMart","Manta Maria":"Manta Maria","Moray Towers":"Moray Towers","Musselforge Fitness":"Musselforge Fitness","New Albacore Hotel":"New Albacore Hotel","Piranha Pit":"Piranha Pit","Port Mackerel":"Port Mackerel","Shellendorf Institute":"Shellendorf Institute","Shifty Station":"Shifty Station","Snapper Canal":"Snapper Canal","Starfish Mainstage":"Starfish Mainstage","Sturgeon Shipyard":"Sturgeon Shipyard","The Reef":"The Reef","Wahoo World":"Wahoo World","Walleye Warehouse":"Walleye Warehouse","Skipper Pavilion":"Skipper Pavilion"},[i.DE]:{"Ancho-V Games":"Anchobit Games HQ","Arowana Mall":"Arowana Center","Blackbelly Skatepark":"Punkasius-Skatepark","Camp Triggerfish":"Camp Schützenfisch","Goby Arena":"Backfisch-Stadion","Humpback Pump Track":"Buckelwal-Piste","Inkblot Art Academy":"Perlmutt-Akademie","Kelp Dome":"Tümmlerkuppel",MakoMart:"Cetacea-Markt","Manta Maria":"Manta Maria","Moray Towers":"Muränentürme","Musselforge Fitness":"Molluskelbude","New Albacore Hotel":"Hotel Neothun","Piranha Pit":"Steinköhler-Grube","Port Mackerel":"Heilbutt-Hafen","Shellendorf Institute":"Abyssal-Museum","Shifty Station":"Wandelzone","Snapper Canal":"Grätenkanal","Starfish Mainstage":"Seeigel-Rockbühne","Sturgeon Shipyard":"Störwerft","The Reef":"Korallenviertel","Wahoo World":"Flunder-Funpark","Walleye Warehouse":"Kofferfisch-Lager","Skipper Pavilion":"Grundel-Pavillon"}},modes:{[i.EN]:{"Clam Blitz":"Clam Blitz","Tower Control":"Tower Control",Rainmaker:"Rainmaker","Splat Zones":"Splat Zones","Turf War":"Turf War"},[i.DE]:{"Clam Blitz":"Muschelchaos","Tower Control":"Turmkommando",Rainmaker:"Operation Goldfisch","Splat Zones":"Herrschaft","Turf War":"Revierkampf"}},colors:[{meta:{name:"Ranked Modes"},colors:[{index:0,title:"Green vs Grape",clrA:"#37FC00",clrB:"#7D28FC",clrNeutral:"#F4067E",isCustom:!1},{index:1,title:"Green vs Magenta",clrA:"#04D976",clrB:"#D600AB",clrNeutral:"#D2E500",isCustom:!1},{index:2,title:"Turquoise vs Orange",clrA:"#10E38F",clrB:"#FB7B08",clrNeutral:"#6912CD",isCustom:!1},{index:3,title:"Mustard vs Purple",clrA:"#FF9E03",clrB:"#B909E0",clrNeutral:"#08C66B",isCustom:!1},{index:4,title:"Dark Blue vs Green",clrA:"#2F27CC",clrB:"#37FC00",clrNeutral:"#EA01B7",isCustom:!1},{index:5,title:"Purple vs Green",clrA:"#B909E0",clrB:"#37FC00",clrNeutral:"#F87604",isCustom:!1},{index:6,title:"Yellow vs Blue",clrA:"#FEF232",clrB:"#2ED2FE",clrNeutral:"#FD5600",isCustom:!1}]},{meta:{name:"Turf War"},colors:[{index:0,title:"Yellow vs Purple",clrA:"#D1E004",clrB:"#960CB2",clrNeutral:"#0EB962",isCustom:!1},{index:1,title:"Pink vs Blue",clrA:"#E61077",clrB:"#361CB8",clrNeutral:"#24C133",isCustom:!1},{index:2,title:"Pink vs Yellow",clrA:"#ED0C6A",clrB:"#D5E802",clrNeutral:"#08C24D",isCustom:!1},{index:3,title:"Purple vs Turquoise",clrA:"#6B10CC",clrB:"#08CC81",clrNeutral:"#EB246D",isCustom:!1},{index:4,title:"Pink vs Light Blue",clrA:"#E30960",clrB:"#02ADCF",clrNeutral:"#DDE713",isCustom:!1},{index:5,title:"Purple vs Orange",clrA:"#5617C2",clrB:"#FF5F03",clrNeutral:"#ACE81E",isCustom:!1},{index:6,title:"Pink vs Green",clrA:"#E60572",clrB:"#1BBF0F",clrNeutral:"#CCE50C",isCustom:!1},{index:7,title:"Yellow vs Blue",clrA:"#F1CE33",clrB:"#4B12BE",clrNeutral:"#E62E96",isCustom:!1}]},{meta:{name:"Color Lock"},colors:[{index:0,title:"Yellow vs Blue (Color Lock)",clrA:"#FEF232",clrB:"#2F27CC",clrNeutral:"#DC1589",isCustom:!1}]}]}),v=m({stages:{[i.EN]:{"Museum d'Alfonsino":"Museum d'Alfonsino","Scorch Gorge":"Scorch Gorge","Eeltail Alley":"Eeltail Alley"},[i.DE]:{"Museum d'Alfonsino":"Pinakoithek","Scorch Gorge":"Sengkluft","Eeltail Alley":"Streifenaal-Straße"}},modes:{[i.EN]:{"Turf War":"Turf War"},[i.DE]:{"Turf War":"Revierkampf"}},colors:[{meta:{name:"Splatoon 3 colors"},colors:[{index:0,title:"Blue vs Yellow",clrA:"#5F3AE0",clrB:"#EDED3D",clrNeutral:"#FFFFFF",isCustom:!1}]}]}),f={[a.SPLATOON_2]:g,[a.SPLATOON_3]:v};const b=nodecg.Replicant("lastFmSettings"),C=nodecg.Replicant("radiaSettings"),h=nodecg.Replicant("runtimeConfig"),S=[b,C,h],k=(0,o.Q_)("settings",{state:()=>({lastFmSettings:{},radiaSettings:{guildID:null,enabled:null,updateOnImport:null},runtimeConfig:null}),getters:{translatedModeName:e=>t=>f[e.runtimeConfig.gameVersion].modes[e.runtimeConfig.locale][t],translatedStageName:e=>t=>f[e.runtimeConfig.gameVersion].stages[e.runtimeConfig.locale][t]},actions:{setLastFmSettings({newValue:e}){b.value=e},setRadiaSettings({newValue:e}){C.value=e},setUpdateOnImport(e){C.value.updateOnImport=e},attemptRadiaConnection(){return e=this,t=void 0,a=function*(){return nodecg.sendMessage("retryRadiaAvailabilityCheck")},new((n=void 0)||(n=Promise))((function(l,o){function s(e){try{r(a.next(e))}catch(e){o(e)}}function i(e){try{r(a.throw(e))}catch(e){o(e)}}function r(e){var t;e.done?l(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,i)}r((a=a.apply(e,t||[])).next())}));var e,t,n,a},setGameVersion:e=>nodecg.sendMessage("setGameVersion",{version:e}),setLocale:e=>nodecg.sendMessage("setLocale",e)}});var w=n(7875),y=n(349);const I=(0,w.Uk)(" All Settings ");var E=n(641);const O=(0,w._)("div",{class:"title"},"Last.fm",-1);var D=n(8127),N=n(8149),F=n.n(N),M=n(9546);const A=(0,w.aZ)({name:"LastfmSettings",components:{IplButton:D.IplButton,IplInput:D.IplInput,IplSpace:D.IplSpace},setup(){const e=(0,E.iH)(!1),t=(0,E.Fl)((()=>!F()(a.value,n.lastFmSettings))),n=k(),a=(0,E.iH)(u()(n.lastFmSettings));return(0,w.YP)((()=>n.lastFmSettings),(t=>{e.value||(a.value=u()(t))}),{deep:!0}),{RIGHT_CLICK_UNDO_MESSAGE:M.m,focused:e,handleFocusEvent(t){e.value=t},isChanged:t,buttonColor:(0,E.Fl)((()=>t.value?"red":"blue")),settings:a,handleUpdate(){t.value&&n.setLastFmSettings({newValue:a.value})},undoChanges(e){e.preventDefault(),a.value=u()(n.lastFmSettings)}}}});var _=n(4407);const B=(0,_.Z)(A,[["render",function(e,t,n,a,l,o){const s=(0,w.up)("ipl-input"),i=(0,w.up)("ipl-button"),r=(0,w.up)("ipl-space");return(0,w.wg)(),(0,w.j4)(r,null,{default:(0,w.w5)((()=>[O,(0,w.Wm)(s,{modelValue:e.settings.username,"onUpdate:modelValue":t[0]||(t[0]=t=>e.settings.username=t),name:"username",label:"Username",onFocuschange:e.handleFocusEvent},null,8,["modelValue","onFocuschange"]),(0,w.Wm)(i,{label:"Update",class:"m-t-8",color:e.buttonColor,title:e.RIGHT_CLICK_UNDO_MESSAGE,"data-test":"update-button",onClick:e.handleUpdate,onRightClick:e.undoChanges},null,8,["color","title","onClick","onRightClick"])])),_:1})}]]),T=(0,w.Uk)(" Radia integration is disabled. "),P=(0,w._)("div",{class:"title"},"Radia",-1);var V=n(3888),G=n.n(V);const x=(0,w.aZ)({name:"RadiaSettings",components:{IplCheckbox:D.IplCheckbox,IplButton:D.IplButton,IplInput:D.IplInput,IplSpace:D.IplSpace,IplMessage:D.IplMessage},setup(){const e=k(),t=(0,E.iH)(!1),n=(0,E.Fl)((()=>!F()(G()(a.value,["guildID"]),G()(e.radiaSettings,["guildID"])))),a=(0,E.iH)(u()(e.radiaSettings)),l={"guild-id":(0,D.validator)((()=>a.value.guildID),!0,(0,D.minLength)(17),D.numeric)};return(0,D.provideValidators)(l),(0,w.YP)((()=>e.radiaSettings.guildID),(e=>{t.value||(a.value.guildID=e)})),(0,w.YP)((()=>e.radiaSettings.updateOnImport),(e=>{a.value.updateOnImport=e})),{RIGHT_CLICK_UNDO_MESSAGE:M.m,radiaEnabled:(0,E.Fl)((()=>e.radiaSettings.enabled)),focused:t,handleFocusEvent(e){t.value=e},isChanged:n,isValid:(0,E.Fl)((()=>(0,D.allValid)(l))),buttonColor:(0,E.Fl)((()=>n.value?"red":"blue")),settings:a,handleUpdate(){n.value&&e.setRadiaSettings({newValue:a.value})},setUpdateOnImport(t){e.setUpdateOnImport(t)},attemptRadiaReconnect(){return t=this,n=void 0,l=function*(){return e.attemptRadiaConnection()},new((a=void 0)||(a=Promise))((function(e,o){function s(e){try{r(l.next(e))}catch(e){o(e)}}function i(e){try{r(l.throw(e))}catch(e){o(e)}}function r(t){var n;t.done?e(t.value):(n=t.value,n instanceof a?n:new a((function(e){e(n)}))).then(s,i)}r((l=l.apply(t,n||[])).next())}));var t,n,a,l},undoChanges(t){t.preventDefault(),a.value.guildID=e.radiaSettings.guildID}}}}),U=(0,_.Z)(x,[["render",function(e,t,n,a,l,o){const s=(0,w.up)("ipl-button"),i=(0,w.up)("ipl-message"),r=(0,w.up)("ipl-input"),u=(0,w.up)("ipl-checkbox"),c=(0,w.up)("ipl-space");return(0,w.wg)(),(0,w.j4)(c,null,{default:(0,w.w5)((()=>[e.radiaEnabled?(0,w.kq)("",!0):((0,w.wg)(),(0,w.j4)(i,{key:0,type:"warning",class:"m-b-8","data-test":"radia-disabled-warning"},{default:(0,w.w5)((()=>[T,(0,w.Wm)(s,{small:"",label:"Attempt to connect",class:"m-t-6",color:"yellow","data-test":"radia-connect-button",async:"",onClick:e.attemptRadiaReconnect},null,8,["onClick"])])),_:1})),P,(0,w.Wm)(r,{modelValue:e.settings.guildID,"onUpdate:modelValue":t[0]||(t[0]=t=>e.settings.guildID=t),name:"guild-id",label:"Guild ID",onFocuschange:e.handleFocusEvent},null,8,["modelValue","onFocuschange"]),(0,w.Wm)(s,{label:"Update","data-test":"update-button",class:"m-t-8",color:e.buttonColor,disabled:!e.isValid,title:e.RIGHT_CLICK_UNDO_MESSAGE,onClick:e.handleUpdate,onRightClick:e.undoChanges},null,8,["color","disabled","title","onClick","onRightClick"]),(0,w.Wm)(u,{modelValue:e.settings.updateOnImport,"onUpdate:modelValue":[t[1]||(t[1]=t=>e.settings.updateOnImport=t),e.setUpdateOnImport],class:"m-t-8",label:"Update tournament data on import","data-test":"update-on-import-checkbox"},null,8,["modelValue","onUpdate:modelValue"])])),_:1})}]]);var R=n(6349);const W=(0,w.Uk)(" Changing game versions will reset round and match data! ");function H(e){return e.reduce(((t,n,a)=>(t+=n,a===e.length-2?t+=" and ":a!==e.length-1&&(t+=", "),t)),"")}function L(e,t,n){return 1===t?e:n?`${n}`:`${e}s`}n(2349);const j=(0,w.aZ)({name:"RuntimeConfig",components:{IplMessage:D.IplMessage,IplButton:D.IplButton,IplSelect:D.IplSelect,IplSpace:D.IplSpace},setup(){const e=k(),t=(0,E.iH)(a.SPLATOON_2),n=(0,E.iH)(!1),l=(0,E.iH)([]),o=(0,E.Fl)((()=>t.value!==e.runtimeConfig.gameVersion)),r=(0,E.iH)(null);return(0,w.YP)((()=>e.runtimeConfig.gameVersion),(e=>t.value=e),{immediate:!0}),(0,w.YP)((()=>e.runtimeConfig.locale),(e=>r.value=e),{immediate:!0}),{RIGHT_CLICK_UNDO_MESSAGE:M.m,prettyPrintList:H,GameVersionHelper:s,gameVersion:t,pluralizeWithoutCount:L,gameVersionOptions:Object.values(a).map((e=>({value:e,name:s.toPrettyString(e)}))),isGameVersionChanged:o,isChanged:(0,E.Fl)((()=>o.value||r.value!==e.runtimeConfig.locale)),currentGameVersion:(0,E.Fl)((()=>e.runtimeConfig.gameVersion)),showIncompatibleBundlesMessage:n,incompatibleBundles:l,localeOptions:Object.values(i).map((e=>({value:e,name:c.toPrettyString(e)}))),locale:r,doUpdate(){return a=this,s=void 0,u=function*(){if(o.value){const a=yield e.setGameVersion(t.value);a.incompatibleBundles.length>0?(n.value=!0,l.value=a.incompatibleBundles):n.value=!1}r.value!==e.runtimeConfig.locale&&(yield e.setLocale(r.value))},new((i=void 0)||(i=Promise))((function(e,t){function n(e){try{o(u.next(e))}catch(e){t(e)}}function l(e){try{o(u.throw(e))}catch(e){t(e)}}function o(t){var a;t.done?e(t.value):(a=t.value,a instanceof i?a:new i((function(e){e(a)}))).then(n,l)}o((u=u.apply(a,s||[])).next())}));var a,s,i,u},undoChanges(n){n.preventDefault(),t.value=e.runtimeConfig.gameVersion,r.value=e.runtimeConfig.locale}}}}),Z=(0,_.Z)(j,[["render",function(e,t,n,a,l,o){const s=(0,w.up)("ipl-message"),i=(0,w.up)("ipl-select"),r=(0,w.up)("ipl-button"),u=(0,w.up)("ipl-space");return(0,w.wg)(),(0,w.j4)(u,null,{default:(0,w.w5)((()=>[e.showIncompatibleBundlesMessage?((0,w.wg)(),(0,w.j4)(s,{key:0,type:"warning","data-test":"incompatible-bundle-warning",class:"m-b-8",closeable:"",onClose:t[0]||(t[0]=t=>e.showIncompatibleBundlesMessage=!1)},{default:(0,w.w5)((()=>[(0,w.Uk)((0,y.zw)(e.pluralizeWithoutCount("Bundle",e.incompatibleBundles.length))+" "+(0,y.zw)(e.prettyPrintList(e.incompatibleBundles))+" "+(0,y.zw)(e.pluralizeWithoutCount("is",e.incompatibleBundles.length,"are"))+" incompatible with "+(0,y.zw)(e.GameVersionHelper.toPrettyString(e.currentGameVersion))+". ",1)])),_:1})):(0,w.kq)("",!0),e.isGameVersionChanged?((0,w.wg)(),(0,w.j4)(s,{key:1,type:"warning","data-test":"version-change-warning",class:"m-b-8"},{default:(0,w.w5)((()=>[W])),_:1})):(0,w.kq)("",!0),(0,w.Wm)(i,{modelValue:e.gameVersion,"onUpdate:modelValue":t[1]||(t[1]=t=>e.gameVersion=t),label:"Game version","data-test":"game-version-select",options:e.gameVersionOptions},null,8,["modelValue","options"]),(0,w.Wm)(i,{modelValue:e.locale,"onUpdate:modelValue":t[2]||(t[2]=t=>e.locale=t),label:"Language","data-test":"locale-select",options:e.localeOptions,class:"m-t-6"},null,8,["modelValue","options"]),(0,w.Wm)(r,{class:"m-t-8",label:"Update",color:e.isChanged?"red":"blue",title:e.RIGHT_CLICK_UNDO_MESSAGE,"data-test":"update-button",onClick:e.doUpdate,onRightClick:e.undoChanges},null,8,["color","title","onClick","onRightClick"])])),_:1})}]]);var z=n(8751),Y=n(1459),K=n(1901);const q=(0,w._)("div",{class:"title"},"OBS Socket",-1),$=(0,w.Uk)(" OBS websocket is disabled. ");var Q=function(e,t,n,a){return new(n||(n=Promise))((function(l,o){function s(e){try{r(a.next(e))}catch(e){o(e)}}function i(e){try{r(a.throw(e))}catch(e){o(e)}}function r(e){var t;e.done?l(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,i)}r((a=a.apply(e,t||[])).next())}))};const J=[nodecg.Replicant("obsData"),nodecg.Replicant("obsCredentials"),nodecg.Replicant("gameAutomationData")],X=(0,o.Q_)("obs",{state:()=>({obsData:null,obsCredentials:null,gameAutomationData:null}),actions:{connect({address:e,password:t}){return Q(this,void 0,void 0,(function*(){return nodecg.sendMessage("connectToObs",{address:e,password:t})}))},setData(e){return Q(this,void 0,void 0,(function*(){return nodecg.sendMessage("setObsData",e)}))},startGame(){return Q(this,void 0,void 0,(function*(){return nodecg.sendMessage("startGame")}))},endGame(){return Q(this,void 0,void 0,(function*(){return nodecg.sendMessage("endGame")}))},fastForwardToNextGameAutomationTask(){return Q(this,void 0,void 0,(function*(){return nodecg.sendMessage("fastForwardToNextGameAutomationTask")}))},setEnabled(e){nodecg.sendMessage("setObsSocketEnabled",e)}}});var ee;!function(e){e.CONNECTED="CONNECTED",e.CONNECTING="CONNECTING",e.NOT_CONNECTED="NOT_CONNECTED"}(ee||(ee={}));const te=(0,w.aZ)({name:"ObsSocketSettings",components:{IplMessage:D.IplMessage,IplToggle:D.IplToggle,IplButton:D.IplButton,IplSpace:D.IplSpace,IplInput:D.IplInput},setup(){const e=X(),t=(0,E.Fl)({get:()=>e.obsData.enabled,set(t){e.setEnabled(t)}}),n=(0,E.iH)(""),a=(0,E.iH)("");(0,w.YP)((()=>e.obsCredentials.address),(e=>n.value=e),{immediate:!0}),(0,w.YP)((()=>e.obsCredentials.password),(e=>a.value=e),{immediate:!0});const l={socketUrl:(0,D.validator)(n,!0,D.notBlank)};return(0,D.provideValidators)(l),{RIGHT_CLICK_UNDO_MESSAGE:M.m,socketEnabled:t,socketUrl:n,socketPassword:a,isChanged:(0,E.Fl)((()=>n.value!==e.obsCredentials.address||a.value!==e.obsCredentials.password)),allValid:(0,E.Fl)((()=>(0,D.allValid)(l))),statusText:(0,E.Fl)((()=>class{static toPrettyString(e){return{[ee.CONNECTING]:"Connecting",[ee.CONNECTED]:"Connected",[ee.NOT_CONNECTED]:"Not connected"}[e]}}.toPrettyString(e.obsData.status))),status:(0,E.Fl)((()=>e.obsData.status)),connect:()=>e.connect({address:n.value,password:a.value}),undoChanges(t){t.preventDefault(),n.value=e.obsCredentials.address,a.value=e.obsCredentials.password}}}});var ne=n(6062),ae=n.n(ne),le=n(4712);ae()(le.Z,{insert:"head",singleton:!1}),le.Z.locals;const oe=(0,_.Z)(te,[["render",function(e,t,n,a,l,o){const s=(0,w.up)("ipl-toggle"),i=(0,w.up)("ipl-space"),r=(0,w.up)("ipl-input"),u=(0,w.up)("ipl-button"),c=(0,w.up)("ipl-message");return(0,w.wg)(),(0,w.iD)("div",null,[(0,w.Wm)(i,null,{default:(0,w.w5)((()=>[q,(0,w.Wm)(s,{modelValue:e.socketEnabled,"onUpdate:modelValue":t[0]||(t[0]=t=>e.socketEnabled=t),"true-label":"Enable","false-label":"Disable"},null,8,["modelValue"])])),_:1}),e.socketEnabled?((0,w.wg)(),(0,w.j4)(i,{key:0,class:"m-t-8"},{default:(0,w.w5)((()=>[(0,w.Wm)(r,{modelValue:e.socketUrl,"onUpdate:modelValue":t[1]||(t[1]=t=>e.socketUrl=t),name:"socketUrl",label:"Socket address"},null,8,["modelValue"]),(0,w.Wm)(r,{modelValue:e.socketPassword,"onUpdate:modelValue":t[2]||(t[2]=t=>e.socketPassword=t),name:"password",label:"Password (Optional)",type:"password",class:"m-t-4"},null,8,["modelValue"]),(0,w.Wm)(u,{label:"Connect",class:"m-t-8",color:e.isChanged?"red":"blue",disabled:!e.allValid,"data-test":"socket-connect-button",async:"","progress-message":"Connecting...","success-message":"Connected!",title:e.RIGHT_CLICK_UNDO_MESSAGE,onClick:e.connect,onRightClick:e.undoChanges},null,8,["color","disabled","title","onClick","onRightClick"]),(0,w.Wm)(i,{class:(0,y.C_)(["text-center m-t-8 text-semibold rounded-inner",`obs-status_${e.status}`])},{default:(0,w.w5)((()=>[(0,w.Uk)((0,y.zw)(e.statusText),1)])),_:1},8,["class"])])),_:1})):((0,w.wg)(),(0,w.j4)(c,{key:1,type:"info",class:"m-t-8"},{default:(0,w.w5)((()=>[$])),_:1}))])}]]),se=(0,w.Uk)(" OBS data is missing. Please connect to an OBS websocket to continue. "),ie=(0,w.aZ)({name:"ObsDataPicker",components:{IplButton:D.IplButton,IplMessage:D.IplMessage,IplSelect:D.IplSelect,IplSpace:D.IplSpace},setup(){const e=X(),t=(0,E.iH)(""),n=(0,E.iH)("");return(0,w.YP)((()=>e.obsData.gameplayScene),(e=>t.value=e),{immediate:!0}),(0,w.YP)((()=>e.obsData.intermissionScene),(e=>n.value=e),{immediate:!0}),{RIGHT_CLICK_UNDO_MESSAGE:M.m,gameplayScene:t,intermissionScene:n,hasObsData:(0,E.Fl)((()=>null!=e.obsData.scenes)),sceneOptions:(0,E.Fl)((()=>{var t,n;return null!==(n=null===(t=e.obsData.scenes)||void 0===t?void 0:t.map((e=>({value:e,name:e}))))&&void 0!==n?n:[]})),isChanged:(0,E.Fl)((()=>t.value!==e.obsData.gameplayScene||n.value!==e.obsData.intermissionScene)),update(){e.setData({gameplayScene:t.value,intermissionScene:n.value})},undoChanges(a){a.preventDefault(),t.value=e.obsData.gameplayScene,n.value=e.obsData.intermissionScene}}}}),re=(0,_.Z)(ie,[["render",function(e,t,n,a,l,o){const s=(0,w.up)("ipl-message"),i=(0,w.up)("ipl-select"),r=(0,w.up)("ipl-button"),u=(0,w.up)("ipl-space");return e.hasObsData?((0,w.wg)(),(0,w.j4)(u,{key:1},{default:(0,w.w5)((()=>[(0,w.Wm)(i,{modelValue:e.gameplayScene,"onUpdate:modelValue":t[0]||(t[0]=t=>e.gameplayScene=t),options:e.sceneOptions,label:"Gameplay scene","data-test":"gameplay-scene-select"},null,8,["modelValue","options"]),(0,w.Wm)(i,{modelValue:e.intermissionScene,"onUpdate:modelValue":t[1]||(t[1]=t=>e.intermissionScene=t),options:e.sceneOptions,label:"Intermission scene","data-test":"intermission-scene-select",class:"m-t-8"},null,8,["modelValue","options"]),(0,w.Wm)(r,{label:"Update",class:"m-t-8",color:e.isChanged?"red":"blue",title:e.RIGHT_CLICK_UNDO_MESSAGE,"data-test":"update-button",onClick:e.update,onRightClick:e.undoChanges},null,8,["color","title","onClick","onRightClick"])])),_:1})):((0,w.wg)(),(0,w.j4)(s,{key:0,type:"info"},{default:(0,w.w5)((()=>[se])),_:1}))}]]);z.vI.add(Y.xi);const ue={general:"General",lastfm:"Last.fm",radia:"Radia","obs-socket":"OBS Socket"},ce=(0,w.aZ)({name:"Settings",components:{ObsDataPicker:re,ObsSocketSettings:oe,FontAwesomeIcon:K.GN,IplSidebar:D.IplSidebar,IplSpace:D.IplSpace,RuntimeConfig:Z,IplErrorDisplay:R.Z,RadiaSettings:U,LastfmSettings:B},setup(){const e=X();return{obsSocketEnabled:(0,E.Fl)((()=>e.obsData.enabled)),visibleSection:(0,E.iH)("general"),showSidebar:(0,E.iH)(!1),settingsSections:ue}}}),de=(0,_.Z)(ce,[["render",function(e,t,n,a,l,o){const s=(0,w.up)("ipl-error-display"),i=(0,w.up)("ipl-space"),r=(0,w.up)("ipl-sidebar"),u=(0,w.up)("font-awesome-icon"),c=(0,w.up)("lastfm-settings"),d=(0,w.up)("radia-settings"),p=(0,w.up)("runtime-config"),m=(0,w.up)("obs-socket-settings"),g=(0,w.up)("obs-data-picker");return(0,w.wg)(),(0,w.iD)(w.HY,null,[(0,w.Wm)(s,{class:"m-b-8"}),(0,w.Wm)(r,{"is-open":e.showSidebar,"onUpdate:is-open":t[0]||(t[0]=t=>e.showSidebar=t)},{default:(0,w.w5)((()=>[((0,w.wg)(!0),(0,w.iD)(w.HY,null,(0,w.Ko)(e.settingsSections,((t,n)=>((0,w.wg)(),(0,w.j4)(i,{key:n,"data-test":`section-selector_${n}`,clickable:"",color:e.visibleSection===n?"blue":"light",class:"m-b-8",onClick:t=>{e.visibleSection=n,e.showSidebar=!1}},{default:(0,w.w5)((()=>[(0,w.Uk)((0,y.zw)(t),1)])),_:2},1032,["data-test","color","onClick"])))),128))])),_:1},8,["is-open"]),(0,w.Wm)(i,{class:"layout horizontal m-t-8","data-test":"open-sidebar-button",clickable:"",onClick:t[1]||(t[1]=t=>e.showSidebar=!0)},{default:(0,w.w5)((()=>[(0,w.Wm)(u,{icon:"bars",class:"large-icon m-r-8"}),I])),_:1}),"lastfm"===e.visibleSection?((0,w.wg)(),(0,w.j4)(c,{key:0,class:"m-t-8"})):"radia"===e.visibleSection?((0,w.wg)(),(0,w.j4)(d,{key:1,class:"m-t-8"})):"general"===e.visibleSection?((0,w.wg)(),(0,w.j4)(p,{key:2,class:"m-t-8"})):"obs-socket"===e.visibleSection?((0,w.wg)(),(0,w.iD)(w.HY,{key:3},[(0,w.Wm)(m,{class:"m-t-8"}),e.obsSocketEnabled?((0,w.wg)(),(0,w.j4)(g,{key:0,class:"m-t-8"})):(0,w.kq)("",!0)],64)):(0,w.kq)("",!0)],64)}]]);var pe,me,ge=n(4825),ve=n(4928);me=function*(){const e=(0,ge.ri)(de);e.use((0,o.WB)()),yield(0,l._)(S,k()),yield(0,l._)(J,X()),(0,ve.E)(e),e.mount("#app")},new((pe=void 0)||(pe=Promise))((function(e,t){function n(e){try{l(me.next(e))}catch(e){t(e)}}function a(e){try{l(me.throw(e))}catch(e){t(e)}}function l(t){var l;t.done?e(t.value):(l=t.value,l instanceof pe?l:new pe((function(e){e(l)}))).then(n,a)}l((me=me.apply(void 0,[])).next())}))}},n={};function a(e){var l=n[e];if(void 0!==l)return l.exports;var o=n[e]={id:e,loaded:!1,exports:{}};return t[e](o,o.exports,a),o.loaded=!0,o.exports}a.m=t,e=[],a.O=(t,n,l,o)=>{if(!n){var s=1/0;for(c=0;c<e.length;c++){for(var[n,l,o]=e[c],i=!0,r=0;r<n.length;r++)(!1&o||s>=o)&&Object.keys(a.O).every((e=>a.O[e](n[r])))?n.splice(r--,1):(i=!1,o<s&&(s=o));if(i){e.splice(c--,1);var u=l();void 0!==u&&(t=u)}}return t}o=o||0;for(var c=e.length;c>0&&e[c-1][2]>o;c--)e[c]=e[c-1];e[c]=[n,l,o]},a.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return a.d(t,{a:t}),t},a.d=(e,t)=>{for(var n in t)a.o(t,n)&&!a.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},a.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),a.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),a.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.nmd=e=>(e.paths=[],e.children||(e.children=[]),e),(()=>{var e={571:0};a.O.j=t=>0===e[t];var t=(t,n)=>{var l,o,[s,i,r]=n,u=0;if(s.some((t=>0!==e[t]))){for(l in i)a.o(i,l)&&(a.m[l]=i[l]);if(r)var c=r(a)}for(t&&t(n);u<s.length;u++)o=s[u],a.o(e,o)&&e[o]&&e[o][0](),e[o]=0;return a.O(c)},n=self.webpackChunk=self.webpackChunk||[];n.forEach(t.bind(null,0)),n.push=t.bind(null,n.push.bind(n))})(),a.nc=void 0;var l=a.O(void 0,[141,745,901,48],(()=>a(6951)));l=a.O(l)})();