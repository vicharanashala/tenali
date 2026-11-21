// Mobile navigation
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});
navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  navLinks.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}));

// Evaporation rate explorer: a simplified relative model for learning.
const controls = {
  temperature: document.getElementById("temperature"),
  wind: document.getElementById("wind"),
  area: document.getElementById("area"),
  humidity: document.getElementById("humidity")
};
const labels = {
  temperature: document.getElementById("tempValue"),
  wind: document.getElementById("windValue"),
  area: document.getElementById("areaValue"),
  humidity: document.getElementById("humidityValue")
};
const rateText = document.getElementById("rateText");
const meterFill = document.getElementById("meterFill");
const explanation = document.getElementById("simExplanation");
const water = document.getElementById("water");
const steam = document.getElementById("steam");

function updateSimulation() {
  const t = Number(controls.temperature.value);
  const w = Number(controls.wind.value);
  const a = Number(controls.area.value);
  const h = Number(controls.humidity.value);

  labels.temperature.textContent = `${t}°C`;
  labels.wind.textContent = ["", "Low", "Medium", "High"][w];
  labels.area.textContent = ["", "Small", "Medium", "Large"][a];
  labels.humidity.textContent = `${h}%`;

  // Illustrative score: warmer, windier, larger exposed area increase rate;
  // more humid air decreases it. This is not a physical equation.
  const score = Math.max(0, Math.min(100,
    18 + (t - 5) * 1.05 + (w - 1) * 13 + (a - 1) * 10 - (h - 10) * 0.42
  ));
  const category = score < 35 ? "Slow" : score < 68 ? "Moderate" : "Fast";
  rateText.textContent = category;
  meterFill.style.width = `${score}%`;
  water.style.height = `${Math.max(24, 75 - score * 0.42)}%`;
  steam.style.opacity = String(0.25 + score / 130);

  const reasons = [];
  if (t >= 35) reasons.push("higher temperature increases particle energy");
  else if (t <= 15) reasons.push("lower temperature means particles have less kinetic energy");
  if (w === 3) reasons.push("stronger wind removes vapour near the surface");
  else if (w === 1) reasons.push("low wind removes vapour more slowly");
  if (a === 3) reasons.push("a larger exposed surface lets more particles escape");
  else if (a === 1) reasons.push("a smaller exposed surface limits escaping particles");
  if (h >= 70) reasons.push("high humidity slows evaporation");
  else if (h <= 30) reasons.push("dry air supports faster evaporation");
  explanation.textContent = reasons.length
    ? `The relative rate is ${category.toLowerCase()} because ${reasons.join("; ")}.`
    : `At these settings, evaporation is occurring at a ${category.toLowerCase()} relative rate.`;
}
Object.values(controls).forEach(input => input.addEventListener("input", updateSimulation));
document.getElementById("resetSim").addEventListener("click", () => {
  controls.temperature.value = 25;
  controls.wind.value = 1;
  controls.area.value = 2;
  controls.humidity.value = 50;
  updateSimulation();
});
updateSimulation();

// Five-question quiz
const questions = [
  {q:"Evaporation takes place from which part of a liquid?", options:["Throughout the liquid","Only the surface","Only the bottom","Only at boiling point"], answer:1, why:"Evaporation is a surface phenomenon."},
  {q:"Which condition generally increases the rate of evaporation?", options:["Higher humidity","Lower temperature","Higher wind speed","Smaller surface area"], answer:2, why:"Wind carries water vapour away from the surface."},
  {q:"Why does sweating cool our body?", options:["Sweat freezes","Sweat absorbs heat while evaporating","Sweat increases body temperature","Sweat turns into ice"], answer:1, why:"Evaporation takes energy from the skin, producing a cooling effect."},
  {q:"What happens to evaporation when humidity is high?", options:["It becomes faster","It becomes slower","It stops permanently","It becomes boiling"], answer:1, why:"Humid air already contains more water vapour, so evaporation is slower."},
  {q:"Which statement about evaporation is correct?", options:["It occurs only at 100°C","It occurs only in sunlight","It can occur at any temperature","It occurs only in closed containers"], answer:2, why:"Evaporation can occur at temperatures below the boiling point."}
];
let current = 0;
let score = 0;
let answered = false;
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const feedbackEl = document.getElementById("feedback");
const nextButton = document.getElementById("nextQuestion");
const countEl = document.getElementById("questionCount");
const scoreEl = document.getElementById("scoreLabel");
const progressFill = document.getElementById("progressFill");
const finalEl = document.getElementById("quizFinal");

function renderQuestion() {
  const item = questions[current];
  answered = false;
  countEl.textContent = `QUESTION ${current + 1} OF ${questions.length}`;
  scoreEl.textContent = `Score: ${score}`;
  progressFill.style.width = `${(current / questions.length) * 100}%`;
  questionEl.textContent = item.q;
  optionsEl.innerHTML = "";
  feedbackEl.textContent = "";
  nextButton.disabled = true;
  nextButton.textContent = current === questions.length - 1 ? "See my result →" : "Next question →";
  item.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "option";
    button.type = "button";
    button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
    button.addEventListener("click", () => chooseAnswer(index));
    optionsEl.appendChild(button);
  });
}
function chooseAnswer(selected) {
  if (answered) return;
  answered = true;
  const item = questions[current];
  const buttons = [...optionsEl.querySelectorAll("button")];
  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === item.answer) button.classList.add("correct");
    if (index === selected && selected !== item.answer) button.classList.add("incorrect");
  });
  if (selected === item.answer) {
    score++;
    feedbackEl.textContent = `Correct! ${item.why}`;
  } else {
    feedbackEl.textContent = `Not quite. ${item.why}`;
    feedbackEl.style.color = "#b65c5c";
  }
  scoreEl.textContent = `Score: ${score}`;
  nextButton.disabled = false;
}
nextButton.addEventListener("click", () => {
  if (!answered) return;
  if (current < questions.length - 1) {
    current++;
    renderQuestion();
  } else {
    questionEl.textContent = "You have completed the quiz!";
    optionsEl.innerHTML = "";
    feedbackEl.textContent = "";
    nextButton.hidden = true;
    progressFill.style.width = "100%";
    finalEl.hidden = false;
    finalEl.innerHTML = `<h3>Your score: ${score} / ${questions.length}</h3><p>${score === 5 ? "Excellent work! You have a strong understanding of evaporation." : score >= 3 ? "Good effort! Review the sections above to strengthen your understanding." : "Keep exploring! Read the explanations again and try the quiz once more."}</p><button class="button primary" id="retryQuiz" type="button">Try again</button>`;
    document.getElementById("retryQuiz").addEventListener("click", () => {
      current = 0; score = 0; nextButton.hidden = false; finalEl.hidden = true;
      feedbackEl.style.color = ""; renderQuestion();
    });
  }
});
renderQuestion();
document.getElementById("year").textContent = new Date().getFullYear();
