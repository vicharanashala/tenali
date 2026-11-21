const reactions = {
  water: { name:"Formation of water", description:"Hydrogen reacts with oxygen to form water.", left:[{f:"H₂",atoms:{H:2}},{f:"O₂",atoms:{O:2}}], right:[{f:"H₂O",atoms:{H:2,O:1}}], answer:[2,1,2] },
  ammonia: { name:"Formation of ammonia", description:"Nitrogen combines with hydrogen to produce ammonia.", left:[{f:"N₂",atoms:{N:2}},{f:"H₂",atoms:{H:2}}], right:[{f:"NH₃",atoms:{N:1,H:3}}], answer:[1,3,2] },
  methane: { name:"Combustion of methane", description:"Methane burns in oxygen to produce carbon dioxide and water.", left:[{f:"CH₄",atoms:{C:1,H:4}},{f:"O₂",atoms:{O:2}}], right:[{f:"CO₂",atoms:{C:1,O:2}},{f:"H₂O",atoms:{H:2,O:1}}], answer:[1,2,1,2] },
  iron: { name:"Formation of iron oxide", description:"Iron reacts with oxygen to form iron(III) oxide.", left:[{f:"Fe",atoms:{Fe:1}},{f:"O₂",atoms:{O:2}}], right:[{f:"Fe₂O₃",atoms:{Fe:2,O:3}}], answer:[4,3,2] },
  sodium: { name:"Sodium + chlorine", description:"Sodium reacts with chlorine gas to form sodium chloride.", left:[{f:"Na",atoms:{Na:1}},{f:"Cl₂",atoms:{Cl:2}}], right:[{f:"NaCl",atoms:{Na:1,Cl:1}}], answer:[2,1,2] }
};
let currentKey = "water";
let coefficients = [];
const select = document.getElementById("reaction-select");
const controls = document.getElementById("coefficient-controls");
const reactantFormulas = document.getElementById("reactant-formulas");
const productFormulas = document.getElementById("product-formulas");
const counters = document.getElementById("atom-counters");
const statusBox = document.getElementById("balance-status");

function currentReaction(){ return reactions[currentKey]; }
function allSpecies(){ const r=currentReaction(); return [...r.left,...r.right]; }
function loadReaction(key){
  currentKey=key; const r=currentReaction(); coefficients=Array(allSpecies().length).fill(1);
  document.getElementById("reaction-description").textContent=r.description;
  renderControls(); renderEquation(); updateCounts();
}
function renderControls(){
  controls.innerHTML="";
  allSpecies().forEach((item,index)=>{
    const side=index<currentReaction().left.length?"Reactant":"Product";
    const div=document.createElement("label"); div.className="coefficient-item";
    const name=document.createElement("span"); name.textContent=`${side}: ${item.f}`;
    const input=document.createElement("input"); input.type="number"; input.min="1"; input.max="20"; input.step="1"; input.value=coefficients[index]; input.setAttribute("aria-label",`${side} coefficient for ${item.f}`);
    input.addEventListener("input",()=>{let n=Number.parseInt(input.value,10);if(!Number.isInteger(n)||n<1)n=1;if(n>20)n=20;coefficients[index]=n;renderEquation();updateCounts();});
    div.append(name,input); controls.append(div);
  });
}
function formulaHTML(item,index){
  const coefficient=coefficients[index]===1?"":`<span class="coef">${coefficients[index]}</span>`;
  return `<span class="formula-piece">${coefficient}${item.f}</span>`;
}
function renderEquation(){
  const r=currentReaction(), split=r.left.length;
  reactantFormulas.innerHTML=r.left.map((x,i)=>formulaHTML(x,i)).join("");
  productFormulas.innerHTML=r.right.map((x,i)=>formulaHTML(x,i+split)).join("");
}
function countSide(items,offset){
  const totals={};
  items.forEach((item,i)=>Object.entries(item.atoms).forEach(([atom,count])=>totals[atom]=(totals[atom]||0)+count*coefficients[offset+i]));
  return totals;
}
function updateCounts(){
  const r=currentReaction(), left=countSide(r.left,0), right=countSide(r.right,r.left.length);
  const atoms=[...new Set([...Object.keys(left),...Object.keys(right)])].sort();
  const balanced=atoms.every(a=>(left[a]||0)===(right[a]||0));
  counters.innerHTML=atoms.map(a=>`<div class="atom-row"><div class="atom-symbol">${a}</div><div class="atom-value ${left[a]===right[a]?"equal":""}"><span>Left</span><b>${left[a]||0}</b></div><div class="atom-value ${left[a]===right[a]?"equal":""}"><span>Right</span><b>${right[a]||0}</b></div></div>`).join("");
  statusBox.className=balanced?"balance-status success":"balance-status";
  statusBox.innerHTML=balanced?`<span>✓</span> Balanced! Every atom is accounted for.`:`<span>●</span> Not balanced yet — compare the atom totals above.`;
}
function autoBalance(){
  coefficients=[...currentReaction().answer];renderControls();renderEquation();updateCounts();
}
function resetReaction(){coefficients=Array(allSpecies().length).fill(1);renderControls();renderEquation();updateCounts();}
select.addEventListener("change",e=>loadReaction(e.target.value));
document.getElementById("auto-balance").addEventListener("click",autoBalance);
document.getElementById("reset-reaction").addEventListener("click",resetReaction);

// Short multiple-choice knowledge check
const questions=[
 {q:"Which equation is balanced?",options:["H₂ + O₂ → H₂O","2H₂ + O₂ → 2H₂O","H₂ + 2O₂ → H₂O"],correct:1,why:"There are 4 hydrogen atoms and 2 oxygen atoms on each side."},
 {q:"What may you change when balancing an equation?",options:["The subscripts in a formula","The element symbols","The coefficients before formulas"],correct:2,why:"Coefficients change the number of molecules; subscripts are part of a substance's identity."},
 {q:"Which principle does balancing chemical equations demonstrate?",options:["Conservation of mass","Conservation of temperature","Conservation of volume"],correct:0,why:"Atoms are rearranged during a reaction, so the total amount of each element is conserved."}
];
let questionIndex=0, answered=false;
function renderQuestion(){
 const q=questions[questionIndex];answered=false;
 document.getElementById("quiz-progress").textContent=`QUESTION ${questionIndex+1} / ${questions.length}`;
 document.getElementById("quiz-question").textContent=q.q;
 document.getElementById("quiz-feedback").textContent="Choose an answer to check your understanding.";
 document.getElementById("quiz-next").disabled=true;
 document.getElementById("quiz-next").textContent=questionIndex===questions.length-1?"Start again ↻":"Next question →";
 const options=document.getElementById("quiz-options");options.innerHTML="";
 q.options.forEach((option,i)=>{const b=document.createElement("button");b.className="quiz-option";b.textContent=String.fromCharCode(65+i)+".  "+option;b.addEventListener("click",()=>chooseAnswer(i));options.append(b);});
}
function chooseAnswer(index){
 if(answered)return;answered=true;const q=questions[questionIndex];const buttons=[...document.querySelectorAll(".quiz-option")];
 buttons.forEach((b,i)=>{b.disabled=true;if(i===q.correct)b.classList.add("correct");else if(i===index)b.classList.add("wrong");});
 document.getElementById("quiz-feedback").textContent=(index===q.correct?"Correct! ":"Not quite. ")+q.why;
 document.getElementById("quiz-next").disabled=false;
}
document.getElementById("quiz-next").addEventListener("click",()=>{questionIndex=(questionIndex+1)%questions.length;renderQuestion();});
loadReaction("water");renderQuestion();
