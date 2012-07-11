var form2js=function(){function a(a,d,e,f,g,h){if(typeof e=="undefined"||e==null)e=true;if(typeof f=="undefined"||f==null)f=true;if(typeof d=="undefined"||d==null)d=".";if(arguments.length<6)h=false;a=typeof a=="string"?document.getElementById(a):a;var i=[],j,k=0;if(a.constructor==Array||typeof NodeList!="undefined"&&a.constructor==NodeList){while(j=a[k++]){i=i.concat(c(j,g,h))}}else{i=c(a,g,h)}return b(i,e,f,d)}function b(a,b,c,d){var e={},f={},g,h,i,j,k,l,m,n,o,p,q,r,s;for(g=0;g<a.length;g++){k=a[g].value;if(c&&k===""){k=null}if(b&&(k===""||k===null))continue;r=a[g].name;if(typeof r==="undefined")continue;s=r.split(d);l=[];m=e;n="";for(h=0;h<s.length;h++){q=s[h].split("][");if(q.length>1){for(i=0;i<q.length;i++){if(i==0){q[i]=q[i]+"]"}else if(i==q.length-1){q[i]="["+q[i]}else{q[i]="["+q[i]+"]"}p=q[i].match(/([a-z_]+)?\[([a-z_][a-z0-9_]+?)\]/i);if(p){for(j=1;j<p.length;j++){if(p[j])l.push(p[j])}}else{l.push(q[i])}}}else l=l.concat(q)}for(h=0;h<l.length;h++){q=l[h];if(q.indexOf("[]")>-1&&h==l.length-1){o=q.substr(0,q.indexOf("["));n+=o;if(!m[o])m[o]=[];m[o].push(k)}else if(q.indexOf("[")>-1){o=q.substr(0,q.indexOf("["));p=q.replace(/(^([a-z_]+)?\[)|(\]$)/gi,"");n+="_"+o+"_"+p;if(!f[n])f[n]={};if(o!=""&&!m[o])m[o]=[];if(h==l.length-1){if(o==""){m.push(k);f[n][p]=m[m.length-1]}else{m[o].push(k);f[n][p]=m[o][m[o].length-1]}}else{if(!f[n][p]){if(/^[a-z_]+\[?/i.test(l[h+1]))m[o].push({});else m[o].push([]);f[n][p]=m[o][m[o].length-1]}}m=f[n][p]}else{n+=q;if(h<l.length-1){if(!m[q])m[q]={};m=m[q]}else{m[q]=k}}}}return e}function c(a,b,c){var f=e(a,b,c);return f.length>0?f:d(a,b,c)}function d(a,b,c){var d=[],f=a.firstChild;while(f){d=d.concat(e(f,b,c));f=f.nextSibling}return d}function e(a,b,c){var e,h,i,j=f(a,c);e=b&&b(a);if(e&&e.name){i=[e]}else if(j!=""&&a.nodeName.match(/INPUT|TEXTAREA/i)){h=g(a);if(h==null&&a.type=="radio")i=[];else i=[{name:j,value:h}]}else if(j!=""&&a.nodeName.match(/SELECT/i)){h=g(a);i=[{name:j.replace(/\[\]$/,""),value:h}]}else{i=d(a,b,c)}return i}function f(a,b){if(a.name&&a.name!="")return a.name;else if(b&&a.id&&a.id!="")return a.id;else return""}function g(a){if(a.disabled)return null;switch(a.nodeName){case"INPUT":case"TEXTAREA":switch(a.type.toLowerCase()){case"radio":case"checkbox":if(a.checked)return a.value;break;case"button":case"reset":case"submit":case"image":return"";break;default:return a.value;break}break;case"SELECT":return h(a);break;default:break}return null}function h(a){var b=a.multiple,c=[],d,e,f;if(!b)return a.value;for(d=a.getElementsByTagName("option"),e=0,f=d.length;e<f;e++){if(d[e].selected)c.push(d[e].value)}return c}"use strict";return a}();var js2form=function(){function g(a,b,d,e,f,g){if(arguments.length<3)d=".";if(arguments.length<4)e=null;if(arguments.length<5)f=false;if(arguments.length<6)g=true;var j,l;j=k(b);l=i(a,f,d,{},g);for(var m=0;m<j.length;m++){var n=j[m].name,o=j[m].value;if(typeof l[n]!="undefined"){h(l[n],o)}else if(typeof l[n.replace(c,"[]")]!="undefined"){h(l[n.replace(c,"[]")],o)}}}function h(a,b){var c,d,e;if(a instanceof Array){for(d=0;d<a.length;d++){if(a[d].type=="radio"){a[d].checked=false;if(typeof b!="undefined"&&b!==null&&a[d].value==b||a[d].value==b.toString())a[d].checked=true}else{if(b=="on"||b=="true"||b=="1")a[d].checked=true;else a[d].checked=false}}}else if(f.test(a.nodeName)){if(b)a.value=b}else if(/SELECT/i.test(a.nodeName)){c=a.getElementsByTagName("option");for(d=0,e=c.length;d<e;d++){if(c[d].value==b){c[d].selected=true;if(a.multiple)break}else if(!a.multiple){c[d].selected=false}}}}function i(a,b,d,e,f){if(arguments.length<4)e={};var g={},h=a.firstChild,k,l,m,n,o,p,q;while(h){k="";if(h.name&&h.name!=""){k=h.name}else if(b&&h.id&&h.id!=""){k=h.id}if(k==""){var r=i(h,b,d,e,f);for(m in r){if(typeof g[m]=="undefined"){g[m]=r[m]}else{for(n=0;n<r[m].length;n++){g[m].push(r[m][n])}}}}else{if(/SELECT/i.test(h.nodeName)){for(o=0,q=h.getElementsByTagName("option"),p=q.length;o<p;o++){if(f){q[o].selected=false}l=j(k,d,e);g[l]=h}}else if(/INPUT/i.test(h.nodeName)&&/CHECKBOX|RADIO/i.test(h.type)){if(f){h.checked=false}l=j(k,d,e);l=l.replace(c,"[]");if(!g[l])g[l]=[];g[l].push(h)}else{if(f){h.value=""}l=j(k,d,e);g[l]=h}}h=h.nextSibling}return g}function j(a,b,c){var f=[],g=a.split(b),h,i,j,k,l,m;a=a.replace(e,"[$1].[$2]");for(m=0;m<g.length;m++){h=g[m];f.push(h);i=h.match(d);if(i!=null){j=f.join(b);k=j.replace(d,"$3");j=j.replace(d,"$1");if(typeof c[j]=="undefined"){c[j]={lastIndex:-1,indexes:{}}}if(k==""||typeof c[j].indexes[k]=="undefined"){c[j].lastIndex++;c[j].indexes[k]=c[j].lastIndex}l=c[j].indexes[k];f[f.length-1]=h.replace(d,"$1$2"+l+"$4")}}j=f.join(b);j=j.replace("].[","][");return j}function k(a,b){var c=[],d,e;if(arguments.length==1)b=0;if(a==null){c=[{name:"",value:null}]}else if(typeof a=="string"||typeof a=="number"||typeof a=="date"||typeof a=="boolean"){c=[{name:"",value:a}]}else if(a instanceof Array){for(d=0;d<a.length;d++){e="["+d+"]";c=c.concat(l(a[d],e,b+1))}}else{for(d in a){e=d;c=c.concat(l(a[d],e,b+1))}}return c}function l(c,d,e){var f;var g=[],h=k(c,e+1),i,j;for(i=0;i<h.length;i++){f=d;if(a.test(h[i].name)){f+=h[i].name}else if(b.test(h[i].name)){f+="."+h[i].name}j={name:f,value:h[i].value};g.push(j)}return g}"use strict";var a=/^\[\d+?\]/,b=/^[a-zA-Z_][a-zA-Z_0-9]+/,c=/\[[0-9]+?\]$/,d=/(.*)(\[)([0-9]*)(\])$/,e=/\[([0-9]+)\]\[([0-9]+)\]/g,f=/INPUT|TEXTAREA/i;return g}();(function(a){a.fn.toObject=function(b){var c=[],d={mode:"first",delimiter:".",skipEmpty:true,nodeCallback:null,useIdIfEmptyName:false};if(b){a.extend(d,b)}switch(d.mode){case"first":return form2js(this.get(0),d.delimiter,d.skipEmpty,d.nodeCallback,d.useIdIfEmptyName);break;case"all":this.each(function(){c.push(form2js(this,d.delimiter,d.skipEmpty,d.nodeCallback,d.useIdIfEmptyName))});return c;break;case"combine":return form2js(Array.prototype.slice.call(this),d.delimiter,d.skipEmpty,d.nodeCallback,d.useIdIfEmptyName);break}}})(jQuery)