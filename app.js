const $ = s => document.querySelector(s);
const screen = $('#screen');
const todayISO = () => new Date().toISOString().slice(0,10);
const dayName = d => new Date(d + 'T12:00').toLocaleDateString('en-GB',{weekday:'long'});
const storeKey = 'sharkTrainingTracker.v4';
const oldKeys = ['sharkTrainingTracker.v3','sharkTrainingTracker.v2','sharkTrainingTracker.v1'];
const defaults = {
  theme:'dark', weights:[], recovery:[], exerciseLogs:[], cardioLogs:[], notes:[],
  baselines:{pushups:20,pullups:1,chinups:3,rows:20,dips:10,kneeRaises:20,deadHang:55,crunches:20}
};
let db = JSON.parse(localStorage.getItem(storeKey) || 'null');
if(!db){
  for(const k of oldKeys){
    const found = localStorage.getItem(k);
    if(found){ db = JSON.parse(found); break; }
  }
}
if(!db) db = structuredClone(defaults);
function save(){ localStorage.setItem(storeKey, JSON.stringify(db)); }
function setTheme(t){ db.theme=t; document.documentElement.classList.toggle('light',t==='light'); $('#themeToggle').textContent=t==='light'?'☀':'☾'; save(); }
setTheme(db.theme || 'dark');
$('#todayLabel').textContent = new Date().toLocaleDateString('en-GB',{weekday:'long', day:'numeric', month:'long'});
$('#themeToggle').onclick = () => setTheme(db.theme==='light'?'dark':'light');

const quotes = [
  'Win the first rep, then win the day.',
  'Small improvements become impossible to ignore.',
  'Discipline is quiet. Results are loud.',
  'Do the logged set like it matters.',
  'Progress is built before motivation arrives.',
  'Beat yesterday by one clean rep.',
  'Control the movement. Own the result.',
  'The work compounds when you keep showing up.',
  'No wasted sets. No guessing. Track it.',
  'Small numbers logged daily become big changes later.'
];
const quoteIndex = Math.floor(new Date(todayISO()+'T12:00').getTime()/86400000) % quotes.length;
$('#dailyQuote').textContent = quotes[quoteIndex];

const routines = {
  morningAbs:[['Crunches','reps'],['Stomach vacuum','sec'],['Hollow hold','sec']],
  pullup:[['Pull-ups','reps'],['Reverse rows','reps'],['Push-ups','reps'],['Dips','reps'],['Goblet squat 10kg','reps'],['KB RDL 10kg','reps'],['Captain chair knee raises','reps']],
  hang:[['Dead / active hang','sec'],['Push-ups','reps'],['Dips','reps'],['Goblet squat 10kg','reps'],['KB RDL 10kg','reps'],['Captain chair knee raises','reps']],
  chinup:[['Chin-ups','reps'],['Reverse rows','reps'],['Push-ups','reps'],['Dips','reps'],['Goblet squat 10kg','reps'],['KB RDL 10kg','reps'],['Captain chair knee raises','reps']],
  sundayCore:[['Crunches','reps'],['Reverse crunches','reps'],['Stomach vacuum','sec'],['Hollow hold','sec'],['Dead bug','reps each side'],['Plank','sec each side']]
};
function routineForToday(){ const d = new Date().getDay(); if(d===1||d===6) return ['pullup','Pull-up + Full Body']; if(d===3) return ['chinup','Chin-up + Full Body']; if(d===2||d===4) return ['hang','Hang + Push + Legs']; if(d===0) return ['sundayCore','Sunday Core']; return [null,'Rest Day']; }
function morningAbsAllowed(){ const d = new Date().getDay(); return d!==0 && d!==5; }
function last(arr, pred){ return [...arr].reverse().find(pred); }
function weightStats(){ const sorted=[...db.weights].sort((a,b)=>a.date.localeCompare(b.date)); const cur=sorted.at(-1); const last7=sorted.slice(-7); const avg=last7.length? (last7.reduce((s,x)=>s+Number(x.weight||0),0)/last7.length).toFixed(1):'—'; return {cur,avg}; }
function card(title, html){ return `<section class="card"><h2>${title}</h2>${html}</section>`; }


function todayView(){
  const [rk,rt]=routineForToday();
  const w=last(db.weights,x=>x.date===todayISO());
  const rec=last(db.recovery,x=>x.date===todayISO())||{};
  const d=new Date().getDay();

  const cards = [];
  if(morningAbsAllowed()) cards.push({
    cls:'home-abs', img:'assets/images/today-morning-abs.png', title:'Morning Abs', meta:'Morning',
    desc:'Crunches · Stomach vacuum · Hollow hold',
    action:`workoutView('morningAbs','Morning Abs')`
  });
  if(rk==='sundayCore') cards.push({
    cls:'home-core', img:'assets/images/today-sunday-core.png', title:'Sunday Core', meta:'Core only',
    desc:'Crunches · Reverse crunches · Vacuum · Hollow · Dead bug · Plank',
    action:`workoutView('sundayCore','Sunday Core')`
  });
  else if(rk) cards.push({
    cls:'home-power', img:'assets/images/today-power-tower.png', title:'Power Tower', meta:'Lunch',
    desc:rt,
    action:`workoutView('${rk}','${rt}')`
  });
  if(d!==5) cards.push({
    cls:d===0?'home-backward':'home-cardio', img:d===0?'assets/images/incline-walk-backward.png':'assets/images/incline-walk-forward.png',
    title:d===0?'Backward Treadmill':'Forward Incline Walk',
    meta:d===0?'Sunday cardio':'Evening',
    desc:d===0?'30 min · 12% incline · speed 3':'60 min · 12% incline · speed 5',
    action:'cardioView()'
  });
  if(d===5) cards.push({
    cls:'home-rest', title:'Rest Day', meta:'Friday',
    desc:'No morning abs, no power tower, no treadmill required.',
    action:'settingsView(); setActive("settings")'
  });

  screen.innerHTML = `
    <section class="quick-check">
      <button class="quick-tile" onclick="quickLog('weight','Weight kg','${w?.weight||''}')"><span>⚖️</span><small>Weight</small><b>${w?.weight? w.weight+' kg':'Tap'}</b></button>
      <button class="quick-tile" onclick="quickLog('sleep','Sleep 1-5','${rec.sleep||''}')"><span>😴</span><small>Sleep</small><b>${rec.sleep?rec.sleep+'/5':'Tap'}</b></button>
      <button class="quick-tile" onclick="quickLog('energy','Energy 1-5','${rec.energy||''}')"><span>⚡</span><small>Energy</small><b>${rec.energy?rec.energy+'/5':'Tap'}</b></button>
      <button class="quick-tile" onclick="quickLog('soreness','Soreness 1-5','${rec.soreness||''}')"><span>🔥</span><small>Sore</small><b>${rec.soreness?rec.soreness+'/5':'Tap'}</b></button>
    </section>

    <section class="home-plan">
      <div class="home-title-row">
        <div>
          <p class="eyebrow-mini">${dayName(todayISO())}</p>
          <h2>Today's Training</h2>
        </div>
        <span class="date-chip">${todayISO()}</span>
      </div>
      <div class="home-card-stack">
        ${cards.map(c=>`
          <button class="home-training-card ${c.cls}" onclick="${c.action}">
            <div class="home-art" style="background-image:linear-gradient(180deg,rgba(3,20,38,.05),rgba(3,20,38,.45)),url('${c.img}')"></div>
            <div class="home-card-copy">
              <span>${c.meta}</span>
              <strong>${c.title}</strong>
              <p>${c.desc}</p>
            </div>
            <b class="arrow">›</b>
          </button>
        `).join('')}
      </div>
    </section>

    <section class="card compact-guidance">
      <h2>Training Rule</h2>
      <p class="small">Use 1 warm-up set, then 1 logged hard working set. Track rest time and intensity for AI analysis.</p>
      <p class="small"><b>Rest:</b> pull-ups/dips/push-ups/hangs 2–3 min · rows/legs/knee raises 90–120 sec · abs 60–90 sec.</p>
    </section>
  `;
}
window.quickLog = function(field,label,current){
  const val = prompt(label, current || '');
  if(val===null) return;
  const date=todayISO();
  const todayWeight = last(db.weights,x=>x.date===date);
  const todayRec = last(db.recovery,x=>x.date===date) || {date,sleep:0,energy:0,soreness:0};
  if(field==='weight'){
    db.weights=db.weights.filter(x=>x.date!==date);
    if(val) db.weights.push({date,weight:Number(val)});
  } else {
    db.recovery=db.recovery.filter(x=>x.date!==date);
    todayRec[field]=Number(val||0);
    db.recovery.push(todayRec);
  }
  save(); todayView();
};
window.saveCheckin = function(){ const date=todayISO(); const weight=$('#weight').value; const sleep=$('#sleep').value, energy=$('#energy').value, soreness=$('#soreness').value; db.weights=db.weights.filter(x=>x.date!==date); if(weight) db.weights.push({date,weight:Number(weight)}); db.recovery=db.recovery.filter(x=>x.date!==date); db.recovery.push({date,sleep:Number(sleep||0),energy:Number(energy||0),soreness:Number(soreness||0)}); save(); todayView(); };
window.workoutView = function(key,title){ const exs=routines[key]; screen.innerHTML = `<section class="card"><h2>${title}</h2><p class="small">Log the working set. Warm-up is not counted as progress.</p></section>` + exs.map((e,i)=>exerciseCard(e[0],e[1],i)).join('') + `<button class="btn primary" onclick="saveWorkout('${key}','${title}')">Save Workout</button>`; setActive(null); };



function exerciseImage(name){
  const n=name.toLowerCase();
  if(n.includes('pull-up')) return 'assets/images/pull-up.png';
  if(n.includes('chin')) return 'assets/images/chin-up.png';
  if(n.includes('hang')) return 'assets/images/dead-hang.png';
  if(n.includes('row')) return 'assets/images/reverse-row.png';
  if(n.includes('push')) return 'assets/images/power-tower-pushup.png';
  if(n.includes('dip')) return 'assets/images/dip.png';
  if(n.includes('goblet')) return 'assets/images/goblet-squat.png';
  if(n.includes('rdl')) return 'assets/images/kb-rdl.png';
  if(n.includes('knee')) return 'assets/images/captain-chair-knee-raise.png';
  if(n.includes('reverse crunch')) return 'assets/images/reverse-crunch.png';
  if(n.includes('crunch')) return 'assets/images/crunches.png';
  if(n.includes('vacuum')) return 'assets/images/stomach-vacuum.png';
  if(n.includes('hollow')) return 'assets/images/hollow-hold.png';
  if(n.includes('dead bug')) return 'assets/images/dead-bug.png';
  if(n.includes('plank')) return 'assets/images/plank.png';
  return '';
}
function artLabel(name){
  const n=name.toLowerCase();
  if(n.includes('pull-up')) return ['Pull-up form image','pullup'];
  if(n.includes('chin')) return ['Chin-up form image','chinup'];
  if(n.includes('hang')) return ['Dead / active hang image','hang'];
  if(n.includes('row')) return ['Reverse row form image','row'];
  if(n.includes('push')) return ['Push-up form image','pushup'];
  if(n.includes('dip')) return ['Dip form image','dip'];
  if(n.includes('goblet')) return ['Goblet squat form image','squat'];
  if(n.includes('rdl')) return ['Kettlebell RDL form image','rdl'];
  if(n.includes('knee')) return ['Captain chair knee raise image','knee'];
  if(n.includes('reverse crunch')) return ['Reverse crunch image','reversecrunch'];
  if(n.includes('crunch')) return ['Crunch form image','crunch'];
  if(n.includes('vacuum')) return ['Stomach vacuum image','vacuum'];
  if(n.includes('hollow')) return ['Hollow hold image','hollow'];
  if(n.includes('dead bug')) return ['Dead bug image','deadbug'];
  if(n.includes('plank')) return ['Plank image','sideplank'];
  return ['Exercise image','default'];
}
function stepper(label, cls, value=''){
  return `<div class="stepper-row">
    <span>${label}</span>
    <div class="stepper">
      <button class="step-btn minus" type="button">−</button>
      <input class="${cls}" inputmode="numeric" value="${value}">
      <button class="step-btn plus" type="button">+</button>
    </div>
  </div>`;
}
function exerciseCard(name,unit,i){
  const prev=last(db.exerciseLogs,x=>x.exercise===name);
  const defaultRest = name.includes('Pull')||name.includes('Dips')||name.includes('Push')||name.includes('hang') ? 180 : (name.includes('Crunch')||name.includes('vacuum')||name.includes('Hollow')||name.includes('Side')||name.includes('Dead bug') ? 75 : 120);
  const art = artLabel(name);
  return `<section class="card workout-card visual-workout-card big-art-card" data-ex="${name}" data-unit="${unit}">
    <div class="exercise-big-image art-${art[1]}" style="background-image:linear-gradient(180deg,rgba(3,20,38,.04),rgba(3,20,38,.78)),url(\'${exerciseImage(name)}\')">
      <div class="moon-dot"></div>
      <div class="figure-symbol"></div>
      <div class="big-image-overlay">
        <span>${unit}</span>
        <h3>${i+1}. ${name}</h3>
        <p>${prev?`Last: ${prev.working} ${prev.unit} · ${prev.intensity} · rest ${prev.restSec}s`:'Log your hard working set.'}</p>
      </div>
    </div>

    <div class="compact-logger">
      ${stepper('Warm-up', 'warm')}
      ${stepper('Working set', 'working')}
      ${stepper('Rest sec', 'rest', defaultRest)}
      <label>Intensity</label>
      <div class="pill-row"><button class="pill">Easy</button><button class="pill">Moderate</button><button class="pill selected">Hard</button><button class="pill">Failure</button></div>
      <label>Notes</label><textarea class="notes"></textarea>
    </div>
  </section>`;
}
document.addEventListener('click',e=>{
  if(e.target.classList.contains('pill')){
    e.preventDefault();
    e.target.parentElement.querySelectorAll('.pill').forEach(p=>p.classList.remove('selected'));
    e.target.classList.add('selected');
  }
  if(e.target.classList.contains('plus') || e.target.classList.contains('minus')){
    e.preventDefault();
    const input = e.target.parentElement.querySelector('input');
    const current = Number(input.value || 0);
    const step = input.classList.contains('rest') ? 15 : 1;
    const next = e.target.classList.contains('plus') ? current + step : Math.max(0, current - step);
    input.value = next;
  }
});

window.saveWorkout = function(key,title){ const date=todayISO(); document.querySelectorAll('.workout-card').forEach(c=>{ const working=c.querySelector('.working').value; if(!working) return; db.exerciseLogs.push({date,day:dayName(date),routine:key,routineTitle:title,exercise:c.dataset.ex,unit:c.dataset.unit,warmup:Number(c.querySelector('.warm').value||0),working:Number(working),restSec:Number(c.querySelector('.rest').value||0),intensity:c.querySelector('.pill.selected')?.textContent||'Hard',notes:c.querySelector('.notes').value,createdAt:new Date().toISOString()}); }); save(); progressView(); setActive('progress'); };
window.cardioView = function(){ const isSun=new Date().getDay()===0; screen.innerHTML = card('Cardio', `<div class="cardio-hero-img" style="background-image:linear-gradient(180deg,rgba(3,20,38,.05),rgba(3,20,38,.72)),url('${isSun?'assets/images/incline-walk-backward.png':'assets/images/incline-walk-forward.png'}')"></div><label>Type</label><select id="ctype"><option>${isSun?'Backward treadmill walk':'Incline Walk'}</option><option>Incline Walk</option><option>Backward treadmill walk</option><option>Easy walk</option></select><div class="grid"><div><label>Duration min</label><input id="cdur" inputmode="numeric" value="${isSun?30:60}"></div><div><label>Incline %</label><input id="cinc" inputmode="decimal" value="12"></div><div><label>Speed</label><input id="cspd" inputmode="decimal" value="${isSun?3:5}"></div></div><label>Effort</label><div class="pill-row"><button class="pill">Easy</button><button class="pill">Moderate</button><button class="pill selected">Hard</button><button class="pill">Max</button></div><label>Notes</label><textarea id="cnotes"></textarea><button class="btn primary" onclick="saveCardio()">Save Cardio</button>`); setActive(null); };
window.saveCardio = function(){ db.cardioLogs.push({date:todayISO(),type:$('#ctype').value,durationMin:Number($('#cdur').value||0),incline:Number($('#cinc').value||0),speed:Number($('#cspd').value||0),effort:document.querySelector('.pill.selected')?.textContent||'Hard',notes:$('#cnotes').value,createdAt:new Date().toISOString()}); save(); progressView(); setActive('progress'); };
function progressView(){ const ws=weightStats(); const best = ex => { const vals=db.exerciseLogs.filter(x=>x.exercise===ex).map(x=>x.working); return vals.length?Math.max(...vals):'—'; };
 screen.innerHTML = `${card('Weight Trend', `<div class="big-metric">${ws.cur?ws.cur.weight+' kg':'—'}</div><p class="small">7-day average: ${ws.avg} kg</p><canvas id="weightChart" width="420" height="180"></canvas>`)}${card('Strength Bests', `<div class="list">${['Push-ups','Pull-ups','Chin-ups','Dips','Reverse rows','Dead / active hang','Captain chair knee raises','Crunches'].map(x=>`<div class="list-item"><span>${x}</span><b>${best(x)}</b></div>`).join('')}</div>`)}`; drawWeightChart(); }
function drawWeightChart(){ const c=$('#weightChart'); if(!c) return; const ctx=c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height); const data=[...db.weights].sort((a,b)=>a.date.localeCompare(b.date)).slice(-14); if(data.length<2){ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--muted');ctx.fillText('Add at least 2 weights to see trend',20,90);return;} const vals=data.map(x=>Number(x.weight)); const min=Math.min(...vals)-.5,max=Math.max(...vals)+.5; ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue('--line'); ctx.strokeRect(30,15,360,130); ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue('--accent'); ctx.lineWidth=3; ctx.beginPath(); data.forEach((d,i)=>{ const x=30+i*(360/(data.length-1)); const y=145-((d.weight-min)/(max-min))*130; i?ctx.lineTo(x,y):ctx.moveTo(x,y); }); ctx.stroke(); }
function historyView(){ const dates=[...new Set([...db.exerciseLogs.map(x=>x.date),...db.cardioLogs.map(x=>x.date),...db.weights.map(x=>x.date)])].sort().reverse().slice(0,30); screen.innerHTML=card('History', `<div class="list">${dates.map(d=>`<div class="list-item"><div><b>${d}</b><p class="small">Weight: ${last(db.weights,x=>x.date===d)?.weight||'—'} kg · Exercises: ${db.exerciseLogs.filter(x=>x.date===d).length} · Cardio: ${db.cardioLogs.filter(x=>x.date===d).length}</p></div><button class="btn" onclick="showDay('${d}')">View</button></div>`).join('')||'<p>No data yet.</p>'}</div>`); }
window.showDay=function(d){ const ex=db.exerciseLogs.filter(x=>x.date===d); const ca=db.cardioLogs.filter(x=>x.date===d); screen.innerHTML=card(d, `<h3>Exercises</h3><div class="list">${ex.map(x=>`<div class="list-item"><span>${x.exercise}</span><b>${x.working} ${x.unit}</b></div>`).join('')||'<p class="small">None</p>'}</div><h3>Cardio</h3><div class="list">${ca.map(x=>`<div class="list-item"><span>${x.type}</span><b>${x.durationMin} min</b></div>`).join('')||'<p class="small">None</p>'}</div>`); };
function exportView(){ screen.innerHTML=card('Export & Data', `<p class="small">JSON is best for AI analysis. CSV is best for spreadsheets.</p><button class="btn primary" onclick="downloadJSON()">Export JSON</button><button class="btn primary" onclick="downloadCSV()">Export CSV</button><label>Import backup JSON</label><input type="file" id="importFile" accept="application/json"><button class="btn" onclick="importJSON()">Import Data</button><hr><button class="btn danger" onclick="clearData()">Clear All Data</button>`); }
function download(name,text,type){ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([text],{type})); a.download=name; a.click(); }
window.downloadJSON=()=>download(`training-data-${todayISO()}.json`,JSON.stringify(db,null,2),'application/json');
window.downloadCSV=()=>{ const rows=[['type','date','day','routine','exercise','unit','warmup','working','restSec','intensity','weight','durationMin','incline','speed','effort','sleep','energy','soreness','notes']]; db.exerciseLogs.forEach(x=>rows.push(['exercise',x.date,x.day,x.routineTitle,x.exercise,x.unit,x.warmup,x.working,x.restSec,x.intensity,'','','','','','','','',x.notes])); db.weights.forEach(x=>rows.push(['weight',x.date,'','','','','','','','',x.weight,'','','','','','','',''])); db.cardioLogs.forEach(x=>rows.push(['cardio',x.date,'','',x.type,'','','','','','',x.durationMin,x.incline,x.speed,x.effort,'','','',x.notes])); db.recovery.forEach(x=>rows.push(['recovery',x.date,'','','','','','','','','','','','','',x.sleep,x.energy,x.soreness,''])); download(`training-data-${todayISO()}.csv`, rows.map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n'), 'text/csv'); };
window.importJSON=()=>{ const f=$('#importFile').files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{db=JSON.parse(r.result); save(); todayView(); setActive('today');}; r.readAsText(f); };
window.clearData=()=>{ if(confirm('Delete all tracker data?')){db=structuredClone(defaults); save(); todayView();}};
function settingsView(){ screen.innerHTML=card('Settings', `<button class="btn primary" onclick="setTheme('light')">Light Mode</button><button class="btn primary" onclick="setTheme('dark')">Dark Mode</button><p class="small">To install on iPhone: open in Safari, tap Share, then Add to Home Screen.</p><p class="small">Data is stored locally on this phone/browser. Use JSON export as backup.</p>`); }
function setActive(v){ document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===v)); }
document.querySelectorAll('.nav-btn').forEach(b=>b.onclick=()=>{ setActive(b.dataset.view); ({today:todayView,progress:progressView,history:historyView,export:exportView,settings:settingsView})[b.dataset.view](); });
todayView();
