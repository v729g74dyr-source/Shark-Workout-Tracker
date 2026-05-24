
const quotes = [
  'Discipline remembers what motivation forgets.',
  'Log it. Beat it.',
  'Small wins become strength.',
  'Do the work before the mood arrives.',
  'Progress is proof.',
  'Today counts.',
  'Earn the next level.'
];

const plans = {
  0: [
    {title:'Core Only', cls:'abs', tag:'Sunday', desc:'Abs + transverse session', items:['Crunches','Reverse crunches','Vacuum','Hollow hold','Dead bug','Side plank']},
    {title:'Backward Incline Walk', cls:'back', tag:'Cardio', desc:'Treadmill: 30 min · 12% incline · speed 3', items:['Walk backwards carefully','Controlled pace']}
  ],
  1: [
    {title:'Morning Abs', cls:'abs', tag:'Morning', desc:'Crunches · Vacuum · Hollow hold', items:['1 hard set crunches','3 vacuum holds','1 hollow hold']},
    {title:'Power Tower', cls:'power', tag:'Lunch', desc:'Pull-up focus + full body', items:['Pull-ups','Rows','Push-ups','Dips','Goblet squat','KB RDL','Knee raises']},
    {title:'Forward Incline Walk', cls:'tread', tag:'Evening', desc:'Treadmill: 60 min · 12% incline · speed 5', items:['Forward walk','Fat-loss cardio']}
  ],
  2: [
    {title:'Morning Abs', cls:'abs', tag:'Morning', desc:'Crunches · Vacuum · Hollow hold', items:['1 hard set crunches','3 vacuum holds','1 hollow hold']},
    {title:'Power Tower', cls:'power', tag:'Lunch', desc:'Hang focus + push + legs', items:['Dead/active hang','Push-ups','Dips','Goblet squat','KB RDL','Knee raises']},
    {title:'Forward Incline Walk', cls:'tread', tag:'Evening', desc:'Treadmill: 60 min · 12% incline · speed 5', items:['Forward walk','Fat-loss cardio']}
  ],
  3: [
    {title:'Morning Abs', cls:'abs', tag:'Morning', desc:'Crunches · Vacuum · Hollow hold', items:['1 hard set crunches','3 vacuum holds','1 hollow hold']},
    {title:'Power Tower', cls:'power', tag:'Lunch', desc:'Chin-up focus + full body', items:['Chin-ups','Rows','Push-ups','Dips','Goblet squat','KB RDL','Knee raises']},
    {title:'Forward Incline Walk', cls:'tread', tag:'Evening', desc:'Treadmill: 60 min · 12% incline · speed 5', items:['Forward walk','Fat-loss cardio']}
  ],
  4: [
    {title:'Morning Abs', cls:'abs', tag:'Morning', desc:'Crunches · Vacuum · Hollow hold', items:['1 hard set crunches','3 vacuum holds','1 hollow hold']},
    {title:'Power Tower', cls:'power', tag:'Lunch', desc:'Hang focus + push + legs', items:['Dead/active hang','Push-ups','Dips','Goblet squat','KB RDL','Knee raises']},
    {title:'Forward Incline Walk', cls:'tread', tag:'Evening', desc:'Treadmill: 60 min · 12% incline · speed 5', items:['Forward walk','Fat-loss cardio']}
  ],
  5: [
    {title:'Rest Day', cls:'back', tag:'Friday', desc:'No morning abs, no power tower, no treadmill required', items:['Recover','Optional light walk or mobility only']}
  ],
  6: [
    {title:'Morning Abs', cls:'abs', tag:'Morning', desc:'Crunches · Vacuum · Hollow hold', items:['1 hard set crunches','3 vacuum holds','1 hollow hold']},
    {title:'Power Tower', cls:'power', tag:'Lunch', desc:'Pull-up focus + full body', items:['Pull-ups','Rows','Push-ups','Dips','Goblet squat','KB RDL','Knee raises']}
  ]
};

const now = new Date();
const dateText = now.toLocaleDateString('en-GB', {weekday:'long', day:'numeric', month:'long'});
document.getElementById('todayDate').textContent = dateText;
document.getElementById('quote').textContent = quotes[now.getDate() % quotes.length];
document.getElementById('dayLabel').textContent = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][now.getDay()];

function blockHTML(b){
  return `<article class="trainingBlock">
    <div class="blockArt ${b.cls}"></div>
    <div class="blockText">
      <h3>${b.title}</h3>
      <p>${b.desc}</p>
      <ul>${b.items.map(i=>`<li>${i}</li>`).join('')}</ul>
      <span class="tag">${b.tag}</span>
    </div>
  </article>`;
}
document.getElementById('todayBlocks').innerHTML = plans[now.getDay()].map(blockHTML).join('');

const storeKey = 'hct_daily_' + now.toISOString().slice(0,10);
let daily = JSON.parse(localStorage.getItem(storeKey) || '{}');
function refresh(){
  weightPreview.textContent = daily.weight ? daily.weight + ' kg' : '-- kg';
  sleepPreview.textContent = daily.sleep ? daily.sleep + '/5' : '--/5';
  energyPreview.textContent = daily.energy ? daily.energy + '/5' : '--/5';
  sorenessPreview.textContent = daily.soreness ? daily.soreness + '/5' : '--/5';
}
refresh();

let activeField = null;
document.querySelectorAll('.quick').forEach(btn=>{
  btn.addEventListener('click',()=>{
    activeField = btn.dataset.field;
    modalTitle.textContent = 'Log ' + activeField;
    modalInput.value = daily[activeField] || '';
    modal.classList.add('show');
    setTimeout(()=>modalInput.focus(),100);
  });
});
saveQuick.onclick = ()=>{
  daily[activeField] = modalInput.value;
  localStorage.setItem(storeKey, JSON.stringify(daily));
  modal.classList.remove('show');
  refresh();
};
closeModal.onclick = ()=> modal.classList.remove('show');
