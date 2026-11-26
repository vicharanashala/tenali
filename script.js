const data={
  water:{name:'Water',l:[['H₂',{H:2},'Hydrogen'],['O₂',{O:2},'Oxygen']],r:[['H₂O',{H:2,O:1},'Water']],a:[2,1,2],hint:'Start by making the oxygen count equal. Then check hydrogen.'},
  ammonia:{name:'Ammonia',l:[['N₂',{N:2},'Nitrogen'],['H₂',{H:2},'Hydrogen']],r:[['NH₃',{N:1,H:3},'Ammonia']],a:[1,3,2],hint:'Match the two nitrogen atoms first, then balance hydrogen.'},
  methane:{name:'Methane combustion',l:[['CH₄',{C:1,H:4},'Methane'],['O₂',{O:2},'Oxygen']],r:[['CO₂',{C:1,O:2},'Carbon dioxide'],['H₂O',{H:2,O:1},'Water']],a:[1,2,1,2],hint:'Balance carbon first, hydrogen second, and oxygen last.'},
  iron:{name:'Iron oxide',l:[['Fe',{Fe:1},'Iron'],['O₂',{O:2},'Oxygen']],r:[['Fe₂O₃',{Fe:2,O:3},'Iron oxide']],a:[4,3,2],hint:'Try placing 2 in front of Fe₂O₃, then balance iron and oxygen.'},
  salt:{name:'Table salt',l:[['Na',{Na:1},'Sodium'],['Cl₂',{Cl:2},'Chlorine']],r:[['NaCl',{Na:1,Cl:1},'Sodium chloride']],a:[2,1,2],hint:'There are two chlorine atoms on the left. Make the right side match.'}
};
const elementColors={H:'H',O:'O',N:'N',C:'C',Fe:'Fe',Na:'Na',Cl:'Cl'};
const ids=Object.keys(data);let key='water',nums=[],won=new Set(),stars=0;
const stats=Object.fromEntries(ids.map(id=>[id,{attempts:0,elapsed:0,startedAt:null,completed:false,lastCheckElapsed:0,history:[]} ]));
let timerHandle=null;
const $=id=>document.getElementById(id),rx=()=>data[key],all=()=>[...rx().l,...rx().r];
function formatTime(ms){const total=Math.floor(ms/1000);return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;}
function elapsedNow(id=key){const st=stats[id];return st.elapsed+(st.startedAt?Date.now()-st.startedAt:0);}
function paintTimer(){$('timer').textContent=formatTime(elapsedNow());}
function stopTimer(){if(timerHandle){clearInterval(timerHandle);timerHandle=null;}const st=stats[key];if(st.startedAt){st.elapsed+=Date.now()-st.startedAt;st.startedAt=null;}paintTimer();}
function startTimer(){const st=stats[key];if(st.completed)return;if(!st.startedAt)st.startedAt=Date.now();if(!timerHandle)timerHandle=setInterval(paintTimer,250);paintTimer();}
function renderResults(){const done=ids.filter(id=>stats[id].completed);const attempts=ids.reduce((n,id)=>n+stats[id].attempts,0);const avg=done.length?formatTime(done.reduce((n,id)=>n+stats[id].elapsed,0)/done.length):'—';$('results-summary').innerHTML=`<div><b>${done.length}/5</b><span>reactions balanced</span></div><div><b>${attempts}</b><span>total check attempts</span></div><div><b>${avg}</b><span>average time per completed reaction</span></div>`;$('results-body').innerHTML=ids.map(id=>{const st=stats[id];return `<tr><td>${data[id].name}</td><td>${formatTime(elapsedNow(id))}</td><td>${st.attempts}</td><td><span class="result-status ${st.completed?'done':'pending'}">${st.completed?'Balanced ✓':'In progress'}</span></td></tr>`}).join('');const history=ids.flatMap(id=>stats[id].history.map(row=>({name:data[id].name,...row})));$('attempts-body').innerHTML=history.length?history.map(row=>`<tr><td>${row.name}</td><td>${row.attempt}</td><td>${formatTime(row.total)}</td><td>${formatTime(row.interval)}</td><td><span class="result-status ${row.balanced?'done':'pending'}">${row.balanced?'Balanced ✓':'Not yet'}</span></td></tr>`).join(''):'<tr><td colspan="5">No attempts yet. Start balancing to see your analysis here.</td></tr>';}
function message(t,c=''){ $('message').textContent=t;$('message').className='practice-message '+c; }
function totals(list,offset){const out={};list.forEach((s,i)=>Object.entries(s[1]).forEach(([atom,n])=>out[atom]=(out[atom]||0)+n*nums[offset+i]));return out;}
function check(){const left=totals(rx().l,0),right=totals(rx().r,rx().l.length),atoms=[...new Set([...Object.keys(left),...Object.keys(right)])];$('counts').innerHTML='<div class="atom-counts">'+atoms.map(atom=>{const ok=(left[atom]||0)===(right[atom]||0);return `<div class="atom-count"><b>${atom}</b> &nbsp;<strong>${left[atom]||0}</strong> ↔ <strong>${right[atom]||0}</strong> <span class="${ok?'yes':'no'}">${ok?'✓':'•'}</span></div>`}).join('')+'</div>';return atoms.every(atom=>(left[atom]||0)===(right[atom]||0));}
function atomLayout(formula,atomIndex,total){const positions={1:[[50,50]],2:[[30,50],[70,50]],3:[[50,20],[25,75],[75,75]],4:[[25,25],[75,25],[25,75],[75,75]],5:[[50,15],[15,45],[85,45],[30,85],[70,85]],6:[[25,20],[75,20],[10,60],[50,60],[90,60],[50,95]]};return (positions[total]||positions[6])[atomIndex]||[50,50];}
function moleculeArt(formula,composition){const atoms=[];Object.entries(composition).forEach(([symbol,count])=>{for(let i=0;i<count;i++)atoms.push(symbol)});const dots=atoms.map((symbol,i)=>{const [x,y]=atomLayout(formula,i,atoms.length);return `<span class="atom-dot atom-${symbol}" style="left:${x}%;top:${y}%;transform:translate(-50%,-50%)">${symbol}</span>`}).join('');return `<div class="molecule-art" aria-label="Illustration of ${formula}">${dots}</div>`;}
function moleculeCard(item,index,coefficient,product){return `<div class="molecule-card" style="animation-delay:${index*.08}s">${moleculeArt(item[0],item[1])}<div class="molecule-formula"><span class="coefficient">${coefficient===1?'':coefficient}</span>${item[0]}</div><div class="molecule-name">${item[2]}</div></div>`;}
function draw(){
 const split=rx().l.length;
 $('left').innerHTML=rx().l.map((item,i)=>moleculeCard(item,i,nums[i],false)).join('');
 $('right').innerHTML=rx().r.map((item,i)=>moleculeCard(item,i+split,nums[i+split],true)).join('');
 // Show the reaction outcome using complete whole reaction sets. Any unused
 // reactant molecules remain visible as leftovers, just like a particle model.
 const extent=Math.floor(Math.min(...rx().l.map((item,i)=>nums[i]/rx().a[i])));
 const leftovers=rx().l.map((item,i)=>({item,count:Math.max(0,nums[i]-extent*rx().a[i])})).filter(x=>x.count>0);
 $('leftovers').innerHTML=leftovers.length?leftovers.map((x,i)=>moleculeCard(x.item,i,x.count,false)).join(''):'<p class="no-leftovers">No leftover reactants — everything was used.</p>';
 $('leftovers').setAttribute('aria-label',leftovers.length?'Unused reactant molecules':'No leftover reactants');
 $('controls').innerHTML=all().map((item,i)=>`<div class="coefficient-control"><b>${item[0]}</b><div class="stepper"><button type="button" aria-label="Decrease coefficient for ${item[0]}" data-i="${i}" data-d="-1">−</button><b>${nums[i]}</b><button type="button" aria-label="Increase coefficient for ${item[0]}" data-i="${i}" data-d="1">+</button></div></div>`).join('');
 $('controls').querySelectorAll('button').forEach(button=>button.onclick=()=>{const st=stats[key];if(st.completed){st.completed=false;won.delete(key);$('win').hidden=true;}startTimer();const i=Number(button.dataset.i);nums[i]=Math.max(1,Math.min(9,nums[i]+Number(button.dataset.d)));draw();check();message('Nice try! Watch how the atom counts change. 🌟');renderResults();});
 check();$('mission').textContent=`REACTION ${ids.indexOf(key)+1} OF 5`;$('bar').style.width=(won.size/5*100)+'%';paintTimer();renderResults();
}
function load(k){if(key!==k)stopTimer();key=k;if(timerHandle){clearInterval(timerHandle);timerHandle=null;}nums=Array(all().length).fill(1);$('reaction').value=k;$('win').hidden=true;message('Ready when you are! Adjust the coefficients to balance the atoms. 🌟');draw();}
$('reaction').onchange=e=>load(e.target.value);$('reset').onclick=()=>{if(timerHandle){clearInterval(timerHandle);timerHandle=null;}stats[key]={attempts:0,elapsed:0,startedAt:null,completed:false,lastCheckElapsed:0,history:[]};won.delete(key);load(key);renderResults();};$('hint').onclick=()=>message('💡 '+rx().hint);
$('check').onclick=()=>{const st=stats[key];if(!st.completed)startTimer();st.attempts++;const balanced=check();const total=elapsedNow();st.history.push({attempt:st.attempts,total,interval:Math.max(0,total-st.lastCheckElapsed),balanced});st.lastCheckElapsed=total;if(balanced){if(!won.has(key)){won.add(key);stars+=3;$('stars').textContent=stars;}$('win').hidden=false;message('Wonderful! Every type of atom matches. 🎉','good');$('bar').style.width=(won.size/5*100)+'%';st.completed=true;stopTimer();}else message('Not quite yet. Compare the atom counts and try again! 💪','try');renderResults();};
const qs=[
{q:'What should we change to balance a chemical equation?',o:['The small subscripts','The big coefficients in front','The element symbols'],a:1,why:'Correct! Coefficients change how many molecules or units are present.'},
{q:'What happens to atoms during a chemical reaction?',o:['They disappear','They are rearranged','They change into a different element'],a:1,why:'Atoms are rearranged to form new substances.'},
{q:'When is a chemical equation balanced?',o:['When each type of atom has equal numbers on both sides','When there is only one product','When the formulas look the same'],a:0,why:'A balanced equation has the same number of each type of atom on both sides.'},
{q:'What does the small number in H₂ tell us?',o:['There are two hydrogen atoms in one molecule','There are two water molecules','Two hydrogen molecules are present'],a:0,why:'The subscript 2 tells us that each hydrogen molecule contains two hydrogen atoms.'},
{q:'Which side of a chemical equation contains the products?',o:['The left side','The right side','Both sides always'],a:1,why:'Products are written to the right of the reaction arrow.'}
];let qi=0,answered=false;
function showQ(){const q=qs[qi];answered=false;$('qnum').textContent=`QUESTION ${qi+1} / 5`;$('question').textContent=q.q;$('feedback').textContent='Choose your answer!';$('next').disabled=true;$('next').textContent=qi===qs.length-1?'Finish & restart ↻':'Next question →';$('options').innerHTML=q.o.map((option,i)=>`<button class="option" data-n="${i}">${'ABC'[i]}. ${option}</button>`).join('');$('options').querySelectorAll('button').forEach(button=>button.onclick=()=>answer(Number(button.dataset.n)));}
function answer(n){if(answered)return;answered=true;const q=qs[qi];$('options').querySelectorAll('button').forEach((button,i)=>{button.disabled=true;if(i===q.a)button.classList.add('correct');else if(i===n)button.classList.add('wrong')});if(n===q.a){stars++;$('stars').textContent=stars;$('feedback').textContent='Correct! ⭐ '+q.why;}else $('feedback').textContent='Good try! 💛 '+q.why;$('next').disabled=false;}
$('next').onclick=()=>{qi=(qi+1)%qs.length;showQ();};
load('water');showQ();renderResults();
