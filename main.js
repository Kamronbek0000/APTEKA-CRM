var KEY="apteka_crm_v1";
var pad=n=>String(n).padStart(2,"0");
var ymd=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
var plus=n=>{var x=new Date();x.setDate(x.getDate()+n);return ymd(x)};
var fmt=n=>Math.round(n).toLocaleString("ru-RU");
var esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
var $=i=>document.getElementById(i);

function seed(){return{nid:100,customers:[
 {id:1,name:"Aziza Karimova",phone:"+998 90 123 45 67",debt:0},
 {id:2,name:"Bobur Rahimov",phone:"+998 91 555 22 11",debt:45000},
 {id:3,name:"Dilnoza Yusupova",phone:"+998 93 777 80 90",debt:0}],
 meds:[
 {id:1,name:"Paratsetamol 500 mg",cat:"Og'riq qoldiruvchi",price:6000,stock:120,min:30,exp:plus(400)},
 {id:2,name:"Ibuprofen 200 mg",cat:"Og'riq qoldiruvchi",price:12000,stock:8,min:20,exp:plus(300)},
 {id:3,name:"No-shpa 40 mg",cat:"Spazmolitik",price:18000,stock:45,min:15,exp:plus(500)},
 {id:4,name:"Amoksitsillin 500 mg",cat:"Antibiotik",price:32000,stock:22,min:10,exp:plus(60)},
 {id:5,name:"Loratadin 10 mg",cat:"Allergiya",price:15000,stock:30,min:10,exp:plus(250)},
 {id:6,name:"Smekta",cat:"Oshqozon-ichak",price:9000,stock:60,min:20,exp:plus(180)},
 {id:7,name:"Aktivlangan ko'mir",cat:"Oshqozon-ichak",price:4000,stock:5,min:25,exp:plus(700)},
 {id:8,name:"Vitamin C 500 mg",cat:"Vitaminlar",price:25000,stock:40,min:10,exp:plus(30)},
 {id:9,name:"Validol",cat:"Yurak",price:7000,stock:18,min:10,exp:plus(-10)},
 {id:10,name:"Nazol sprey",cat:"Shamollash",price:28000,stock:14,min:8,exp:plus(450)},
 {id:11,name:"Mezim forte",cat:"Oshqozon-ichak",price:35000,stock:26,min:10,exp:plus(320)},
 {id:12,name:"Termometr elektron",cat:"Asboblar",price:45000,stock:9,min:5,exp:plus(900)}],
 sales:[]};}
function load(){try{var r=JSON.parse(localStorage.getItem(KEY));if(r&&Array.isArray(r.meds)&&Array.isArray(r.customers)&&Array.isArray(r.sales)){r.nid=r.nid||1000;return r}}catch(e){}return seed()}
var S=load(),tab="dash",cart={},method="naqd",cid="",q1="",q2="",cb=null;
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function nid(){return ++S.nid}
function st(m){var d=Math.floor((new Date(m.exp+"T00:00:00")-new Date(ymd(new Date())+"T00:00:00"))/864e5);return{d:d,exp:d<0,soon:d>=0&&d<=90,low:m.stock<=m.min}}
function toast(t){var e=$("toast");e.textContent=t;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>e.hidden=true,2600)}
function tags(m){var s=st(m),h="";if(s.exp)h+='<span class="tag t-b">Muddati o\'tgan</span> ';else if(s.soon)h+='<span class="tag t-w">'+s.d+' kun qoldi</span> ';if(s.low)h+='<span class="tag t-w">Kam qolgan</span>';if(!h)h='<span class="tag t-ok">Normal</span>';return h}

var TABS=[["dash","Bosh sahifa"],["pos","Kassa"],["meds","Dorilar"],["cust","Mijozlar"],["hist","Tarix"]];
function nav(){var b=TABS.map(t=>`<button class="nv" data-act="nav" data-id="${t[0]}" ${tab===t[0]?'aria-current="page"':""}>${t[1]}</button>`).join("");
 $("side").innerHTML='<div class="logo"><i></i>Apteka CRM</div>'+b;$("bn").innerHTML=b}

function dash(){
 var td=ymd(new Date()),ts=S.sales.filter(s=>s.d===td),sum=ts.reduce((a,s)=>a+s.total,0);
 var low=S.meds.filter(m=>st(m).low),ex=S.meds.filter(m=>st(m).exp||st(m).soon).sort((a,b)=>a.exp<b.exp?-1:1);
 var debt=S.customers.reduce((a,c)=>a+c.debt,0),days=[];
 for(var i=6;i>=0;i--){var k=plus(-i),v=S.sales.filter(s=>s.d===k).reduce((a,s)=>a+s.total,0);days.push([k.slice(8)+"."+k.slice(5,7),v])}
 var mx=Math.max.apply(null,days.map(x=>x[1]).concat([1]));
 var li=(a,f)=>a.length?a.slice(0,6).map(f).join(""):'<div class="empty">Hammasi joyida</div>';
 return`<h1>Bosh sahifa</h1><p class="sub">Bugungi holat bir qarashda</p>
 <div class="grid"><div class="card stat"><b>${fmt(sum)}</b><span>Bugungi savdo, so'm</span></div>
 <div class="card stat"><b>${ts.length}</b><span>Bugungi sotuvlar</span></div>
 <div class="card stat w"><b>${low.length}</b><span>Kam qolgan dorilar</span></div>
 <div class="card stat b"><b>${ex.length}</b><span>Muddati yaqin / o'tgan</span></div>
 <div class="card stat"><b>${fmt(debt)}</b><span>Mijozlar qarzi, so'm</span></div></div>
 <div class="card" style="margin-bottom:14px"><h3>Oxirgi 7 kunlik savdo</h3><div class="chart">${days.map(x=>`<div><span>${x[1]?fmt(x[1]/1000)+"k":""}</span><i style="height:${Math.max(3,x[1]/mx*100)}%"></i><span>${x[0]}</span></div>`).join("")}</div></div>
 <div class="two"><div class="card"><h3>Kam qolgan dorilar</h3>${li(low,m=>`<div class="row"><div>${esc(m.name)}<small>Minimum: ${m.min}</small></div><span class="tag t-w">${m.stock} dona</span></div>`)}</div>
 <div class="card"><h3>Muddati yaqin dorilar</h3>${li(ex,m=>`<div class="row"><div>${esc(m.name)}<small>${m.exp}</small></div>${tags(m).split(" <span")[0]}</div>`)}</div></div>`}

function pos(){return`<h1>Kassa</h1><p class="sub">Dorini tanlang, savatga qo'shing va soting</p>
 <div class="pos"><div class="card"><input class="inp" id="ks" placeholder="Dori nomini qidiring…" value="${esc(q1)}" autocomplete="off"><div class="plist" id="kl"></div></div>
 <div class="card cart"><h3>Savat</h3><div id="kc"></div></div></div>`}
function kList(){var r=S.meds.filter(m=>m.name.toLowerCase().includes(q1.toLowerCase())).slice(0,40);
 $("kl").innerHTML=r.length?r.map(m=>{var s=st(m),off=m.stock<=0||s.exp;return`<div class="row"><div>${esc(m.name)}<small>${esc(m.cat)} · omborda ${m.stock}</small></div><div class="qty"><b>${fmt(m.price)}</b><button class="btn s" data-act="add" data-id="${m.id}" ${off?"disabled":""}>${s.exp?"Muddati o'tgan":"Qo'shish"}</button></div></div>`}).join(""):'<div class="empty">Dori topilmadi</div>'}
function kCart(){var ids=Object.keys(cart),tot=0;
 var rows=ids.map(id=>{var m=S.meds.find(x=>x.id==id);if(!m)return"";var t=m.price*cart[id];tot+=t;return`<div class="row"><div>${esc(m.name)}<small>${fmt(m.price)} × ${cart[id]}</small></div><div class="qty"><button data-act="dec" data-id="${id}" aria-label="Kamaytirish">−</button><b>${cart[id]}</b><button data-act="inc" data-id="${id}" aria-label="Ko'paytirish">+</button></div></div>`}).join("");
 $("kc").innerHTML=(rows||'<div class="empty">Savat bo\'sh</div>')+`
 <label class="fl">Mijoz (ixtiyoriy, qarz uchun majburiy)<select class="inp" id="kcu"><option value="">— Tanlanmagan —</option>${S.customers.map(c=>`<option value="${c.id}" ${cid==c.id?"selected":""}>${esc(c.name)}</option>`).join("")}</select></label>
 <div class="pay">${["naqd","karta","qarz"].map(x=>`<label><input type="radio" name="pm" value="${x}" ${method===x?"checked":""}>${x[0].toUpperCase()+x.slice(1)}</label>`).join("")}</div>
 <div class="tot"><span>Jami</span><span>${fmt(tot)} so'm</span></div>
 <div class="fa" style="margin-top:0"><button class="btn g" data-act="clr">Tozalash</button><button class="btn" data-act="sell" ${ids.length?"":"disabled"}>Sotish</button></div>`}
function sell(){
 var items=Object.keys(cart).map(id=>{var m=S.meds.find(x=>x.id==id);return m&&{id:m.id,name:m.name,qty:cart[id],price:m.price}}).filter(Boolean);
 if(!items.length)return toast("Savat bo'sh");
 if(method==="qarz"&&!cid)return toast("Qarz uchun mijozni tanlang");
 for(var i=0;i<items.length;i++){var m=S.meds.find(x=>x.id==items[i].id);if(m.stock<items[i].qty)return toast(m.name+": omborda yetarli emas")}
 var total=items.reduce((a,x)=>a+x.price*x.qty,0);
 items.forEach(it=>{S.meds.find(x=>x.id==it.id).stock-=it.qty});
 var c=cid?S.customers.find(x=>x.id==cid):null;if(method==="qarz"&&c)c.debt+=total;
 var n=new Date();S.sales.push({id:nid(),d:ymd(n),t:pad(n.getHours())+":"+pad(n.getMinutes()),items:items,total:total,method:method,cn:c?c.name:""});
 cart={};save();toast("Sotuv yakunlandi: "+fmt(total)+" so'm");kList();kCart()}

function meds(){return`<h1>Dorilar</h1><p class="sub">Ombor, narxlar va yaroqlilik muddati</p>
 <div class="bar"><input class="inp" id="ms" placeholder="Qidirish…" value="${esc(q2)}" autocomplete="off"><button class="btn" data-act="addm">+ Yangi dori</button></div>
 <div class="card wrapx" id="ml"></div>`}
function mList(){var r=S.meds.filter(m=>(m.name+m.cat).toLowerCase().includes(q2.toLowerCase()));
 $("ml").innerHTML=r.length?`<table><thead><tr><th>Nomi</th><th>Narx</th><th>Ombor</th><th>Muddat</th><th>Holat</th><th></th></tr></thead><tbody>${r.map(m=>`<tr><td><b>${esc(m.name)}</b><br><small style="color:var(--mut)">${esc(m.cat)}</small></td><td>${fmt(m.price)}</td><td>${m.stock}</td><td>${m.exp}</td><td>${tags(m)}</td><td><div class="acts"><button class="btn g s" data-act="edm" data-id="${m.id}">O'zgartirish</button><button class="btn d s" data-act="delm" data-id="${m.id}">O'chirish</button></div></td></tr>`).join("")}</tbody></table>`:'<div class="empty">Dori topilmadi</div>'}
function medForm(m){var v=m||{name:"",cat:"",price:"",stock:"",min:10,exp:plus(365)};
 form(m?"Dorini o'zgartirish":"Yangi dori",[["name","Nomi",v.name],["cat","Kategoriya",v.cat],["price","Narxi (so'm)",v.price,"number"],["stock","Omborda (dona)",v.stock,"number"],["min","Minimum qoldiq",v.min,"number"],["exp","Yaroqlilik muddati",v.exp,"date"]],o=>{
  if(!o.name.trim())return"Nomini kiriting";if(!o.exp)return"Muddatni kiriting";
  var p=+o.price,s=+o.stock,mi=+o.min;if(!(p>=0)||!(s>=0)||!(mi>=0)||o.price===""||o.stock==="")return"Narx va qoldiqni to'g'ri kiriting";
  var d={name:o.name.trim(),cat:o.cat.trim()||"Boshqa",price:p,stock:s,min:mi,exp:o.exp};
  if(m)Object.assign(m,d);else{d.id=nid();S.meds.push(d)}
  save();render();toast("Saqlandi")})}

function cust(){return`<h1>Mijozlar</h1><p class="sub">Mijozlar va qarzlar</p>
 <div class="bar"><button class="btn" data-act="addc">+ Yangi mijoz</button></div>
 <div class="card">${S.customers.length?S.customers.map(c=>`<div class="row"><div><b>${esc(c.name)}</b><small>${esc(c.phone||"—")}</small></div><div class="acts" style="align-items:center">${c.debt>0?`<span class="tag t-b">Qarz: ${fmt(c.debt)}</span><button class="btn s" data-act="payd" data-id="${c.id}">To'lov</button>`:'<span class="tag t-ok">Qarz yo\'q</span>'}<button class="btn d s" data-act="delc" data-id="${c.id}">O'chirish</button></div></div>`).join(""):'<div class="empty">Mijozlar yo\'q</div>'}</div>`}
function hist(){var r=S.sales.slice().reverse().slice(0,60);return`<h1>Tarix</h1><p class="sub">Oxirgi sotuvlar</p><div class="card">${r.length?r.map(s=>`<div class="row"><div><b>${s.d} ${s.t}</b> <span class="tag t-ok">${s.method}</span><small>${s.items.map(i=>esc(i.name)+" × "+i.qty).join(", ")}${s.cn?" · "+esc(s.cn):""}</small></div><b>${fmt(s.total)}</b></div>`).join(""):'<div class="empty">Hali sotuv yo\'q</div>'}</div>`}

function form(title,fields,onOk){$("fh").textContent=title;
 $("fb").innerHTML=fields.map(f=>`<label class="fl">${f[1]}<input class="inp" name="${f[0]}" type="${f[3]||"text"}" value="${esc(f[2]==null?"":f[2])}" ${f[3]==="number"?'min="0" step="any" inputmode="decimal"':""}></label>`).join("")+'<p id="fe" style="color:var(--bad);margin:10px 0 0"></p>';
 cb=onOk;$("dlg").showModal()}
$("ff").addEventListener("submit",e=>{e.preventDefault();var o={};new FormData($("ff")).forEach((v,k)=>o[k]=v);var er=cb&&cb(o);if(er)$("fe").textContent=er;else $("dlg").close()});
$("fx").onclick=()=>$("dlg").close();

function act(a,id,b){
 if(a==="nav"){tab=id;render();window.scrollTo(0,0)}
 else if(a==="add"){var m=S.meds.find(x=>x.id==id);if((cart[id]||0)+1>m.stock)return toast("Omborda boshqa yo'q");cart[id]=(cart[id]||0)+1;kCart()}
 else if(a==="inc"){var m2=S.meds.find(x=>x.id==id);if(cart[id]+1>m2.stock)return toast("Omborda boshqa yo'q");cart[id]++;kCart()}
 else if(a==="dec"){cart[id]--;if(cart[id]<=0)delete cart[id];kCart()}
 else if(a==="clr"){cart={};kCart()}
 else if(a==="sell")sell();
 else if(a==="addm")medForm();
 else if(a==="edm")medForm(S.meds.find(x=>x.id==id));
 else if(a==="delm"||a==="delc"){
  if(!b.dataset.armed){b.dataset.armed=1;var old=b.textContent;b.textContent="Aniqmi?";setTimeout(()=>{if(b.isConnected){delete b.dataset.armed;b.textContent=old}},3000);return}
  if(a==="delm"){S.meds=S.meds.filter(x=>x.id!=id);delete cart[id]}else{S.customers=S.customers.filter(x=>x.id!=id);if(cid==id)cid=""}
  save();render();toast("O'chirildi")}
 else if(a==="addc")form("Yangi mijoz",[["name","Ism familiya",""],["phone","Telefon","","tel"]],o=>{if(!o.name.trim())return"Ismni kiriting";S.customers.push({id:nid(),name:o.name.trim(),phone:o.phone.trim(),debt:0});save();render();toast("Mijoz qo'shildi")})
 else if(a==="payd"){var c=S.customers.find(x=>x.id==id);form("Qarz to'lovi: "+c.name,[["amt","Summa (so'm). Qarz: "+fmt(c.debt),c.debt,"number"]],o=>{var v=+o.amt;if(!(v>0))return"Summani kiriting";if(v>c.debt)return"Summa qarzdan katta";c.debt-=v;save();render();toast("To'lov qabul qilindi")})}
}
document.addEventListener("click",e=>{var b=e.target.closest("[data-act]");if(b)act(b.dataset.act,b.dataset.id,b)});
document.addEventListener("input",e=>{if(e.target.id==="ks"){q1=e.target.value;kList()}else if(e.target.id==="ms"){q2=e.target.value;mList()}});
document.addEventListener("change",e=>{if(e.target.id==="kcu")cid=e.target.value;else if(e.target.name==="pm")method=e.target.value});

function render(){nav();$("view").innerHTML={dash:dash,pos:pos,meds:meds,cust:cust,hist:hist}[tab]();
 if(tab==="pos"){kList();kCart()}else if(tab==="meds")mList()}
render();