!function(e){function t(t){for(var o,s,i=t[0],u=t[1],l=t[2],c=0,p=[];c<i.length;c++)s=i[c],Object.prototype.hasOwnProperty.call(r,s)&&r[s]&&p.push(r[s][0]),r[s]=0;for(o in u)Object.prototype.hasOwnProperty.call(u,o)&&(e[o]=u[o]);for(d&&d(t);p.length;)p.shift()();return a.push.apply(a,l||[]),n()}function n(){for(var e,t=0;t<a.length;t++){for(var n=a[t],o=!0,i=1;i<n.length;i++){var u=n[i];0!==r[u]&&(o=!1)}o&&(a.splice(t--,1),e=s(s.s=n[0]))}return e}var o={},r={7:0},a=[];function s(t){if(o[t])return o[t].exports;var n=o[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,s),n.l=!0,n.exports}s.m=e,s.c=o,s.d=function(e,t,n){s.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},s.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.t=function(e,t){if(1&t&&(e=s(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(s.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)s.d(n,o,function(t){return e[t]}.bind(null,o));return n},s.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return s.d(t,"a",t),t},s.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},s.p="";var i=window.webpackJsonp=window.webpackJsonp||[],u=i.push.bind(i);i.push=t,i=i.slice();for(var l=0;l<i.length;l++)t(i[l]);var d=u;a.push([3,2]),n()}({"./src/js/jsx/jsWebApp.js":function(e,t,n){"use strict";n.r(t);var o=n("./node_modules/webext-redux/lib/index.js"),r=n("./node_modules/@babel/runtime/helpers/classCallCheck.js"),a=n.n(r),s=n("./node_modules/@babel/runtime/helpers/createClass.js"),i=n.n(s),u=n("./node_modules/@babel/runtime/helpers/defineProperty.js"),l=n.n(u),d=function(){function e(t){var n=this,o=t.runtime,r=t.extId,s=t.appCode;a()(this,e),l()(this,"broadcastExtensionInfo",(function(){n.sendMessage({action:"updateInstalledExtInfo",payload:{appCode:n.appCode,extId:n.extId}})})),l()(this,"handleMessage",(function(e){var t=e.data,o=e.origin,r=e.source;o==o&&r===window&&t&&"jungleScoutWebAppMessage"===t.type&&n.runtime.sendMessage(null,{action:t.action,data:t.payload})})),this.runtime=o,this.extId=r,this.appCode=s,window.addEventListener("message",this.handleMessage)}return i()(e,[{key:"startBroadcastingExtInfo",value:function(){this.broadcastExtensionInfo(),this.intervalId=setInterval(this.broadcastExtensionInfo,6e4)}},{key:"stopBroadcastingExtInfo",value:function(){clearTimeout(this.intervalId)}},{key:"removeAllListeners",value:function(){window.removeEventListener("message",this.handleMessage)}},{key:"sendMessage",value:function(e){var t=e.action,n=e.payload;window.postMessage({type:"jungleScoutExtMessage",action:t,payload:n},window.location.origin)}}]),e}(),c=new o.Store;c.ready().then((function(){new d({runtime:chrome.runtime,extId:chrome.runtime.id,appCode:c.getState().globalData.appName}).startBroadcastingExtInfo()}))},3:function(e,t,n){e.exports=n("./src/js/jsx/jsWebApp.js")}});