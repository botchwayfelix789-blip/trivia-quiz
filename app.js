// Quick Trivia
// Questions from the Open Trivia DB (https://opentdb.com) — free, no API key.
// Falls back to a bundled question set if the API is unreachable.

const TOTAL = 10;

const screens = {
  start: document.getElementById("screen-start"),
  quiz: document.getElementById("screen-quiz"),
  results: document.getElementById("screen-results"),
  loading: document.getElementById("screen-loading"),
};

const el = {
  category: document.getElementById("category"),
  difficulty: document.getElementById("difficulty"),
  startBtn: document.getElementById("start-btn"),
  startHint: document.getElementById("start-hint"),
  qIndex: document.getElementById("q-index"),
  qTotal: document.getElementById("q-total"),
  liveScore: document.getElementById("live-score"),
  progressFill: document.getElementById("progress-fill"),
  qCategory: document.getElementById("q-category"),
  qDifficulty: document.getElementById("q-difficulty"),
  question: document.getElementById("question"),
  answers: document.getElementById("answers"),
  nextBtn: document.getElementById("next-btn"),
  resultEmoji: document.getElementById("result-emoji"),
  resultHeadline: document.getElementById("result-headline"),
  finalScore: document.getElementById("final-score"),
  finalTotal: document.getElementById("final-total"),
  resultPct: document.getElementById("result-pct"),
  breakdown: document.getElementById("result-breakdown"),
  againBtn: document.getElementById("again-btn"),
};

let questions = [];
let current = 0;
let score = 0;
let history = []; // true / false per question

function showScreen(name) {
  Object.entries(screens).forEach(([k, node]) => (node.hidden = k !== name));
}

// Decode HTML entities that the Open Trivia DB returns (e.g. &quot;).
function decode(str) {
  const t = document.createElement("textarea");
  t.innerHTML = str;
  return t.value;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function loadQuestions() {
  const cat = el.category.value;
  const diff = el.difficulty.value;
  let url = `https://opentdb.com/api.php?amount=${TOTAL}&type=multiple`;
  if (cat !== "any") url += `&category=${cat}`;
  if (diff !== "any") url += `&difficulty=${diff}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("bad response");
  const data = await res.json();
  if (data.response_code !== 0 || !data.results.length) throw new Error("no questions");

  return data.results.map((q) => ({
    category: decode(q.category),
    difficulty: q.difficulty,
    question: decode(q.question),
    correct: decode(q.correct_answer),
    answers: shuffle([q.correct_answer, ...q.incorrect_answers].map(decode)),
  }));
}

async function startQuiz() {
  showScreen("loading");
  try {
    questions = await loadQuestions();
  } catch {
    // Graceful offline / rate-limit fallback.
    questions = shuffle(FALLBACK).slice(0, TOTAL).map((q) => ({
      ...q,
      answers: shuffle([q.correct, ...q.incorrect]),
    }));
    el.startHint.textContent = "Using offline question set.";
  }
  current = 0;
  score = 0;
  history = [];
  el.qTotal.textContent = questions.length;
  el.liveScore.textContent = "0";
  showScreen("quiz");
  renderQuestion();
}

function renderQuestion() {
  const q = questions[current];
  el.qIndex.textContent = current + 1;
  el.qCategory.textContent = q.category;
  el.qDifficulty.textContent = q.difficulty;
  el.question.innerHTML = q.question;
  el.progressFill.style.width = `${(current / questions.length) * 100}%`;
  el.nextBtn.disabled = true;
  el.nextBtn.textContent = current === questions.length - 1 ? "See results" : "Next";

  el.answers.innerHTML = "";
  const keys = ["A", "B", "C", "D"];
  q.answers.forEach((ans, i) => {
    const btn = document.createElement("button");
    btn.className = "answer";
    btn.dataset.answer = ans;
    btn.innerHTML = `<span class="answer__key">${keys[i]}</span><span>${ans}</span>`;
    btn.addEventListener("click", () => selectAnswer(btn, ans, q.correct));
    el.answers.appendChild(btn);
  });
}

function selectAnswer(btn, chosen, correct) {
  const buttons = [...el.answers.querySelectorAll(".answer")];
  buttons.forEach((b) => (b.disabled = true));

  const isRight = chosen === correct;
  if (isRight) {
    btn.classList.add("is-correct");
    score++;
    el.liveScore.textContent = score;
  } else {
    btn.classList.add("is-wrong");
    // Highlight the correct one.
    buttons.forEach((b) => {
      if (b.dataset.answer === correct) b.classList.add("is-correct");
    });
  }
  history.push(isRight);
  el.nextBtn.disabled = false;
}

function next() {
  current++;
  if (current < questions.length) {
    renderQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  const pct = Math.round((score / questions.length) * 100);
  el.finalScore.textContent = score;
  el.finalTotal.textContent = questions.length;
  el.resultPct.textContent = `${pct}%`;

  let emoji = "🎯", line = "Solid effort!";
  if (pct === 100) { emoji = "🏆"; line = "Flawless! Genius alert."; }
  else if (pct >= 80) { emoji = "🌟"; line = "Brilliant — you know your stuff."; }
  else if (pct >= 50) { emoji = "👍"; line = "Not bad at all."; }
  else if (pct >= 20) { emoji = "🌱"; line = "Room to grow — try again!"; }
  else { emoji = "🎲"; line = "Ouch. Rematch?"; }
  el.resultEmoji.textContent = emoji;
  el.resultHeadline.textContent = line;

  el.breakdown.innerHTML = "";
  history.forEach((hit) => {
    const tick = document.createElement("span");
    tick.className = `tick ${hit ? "hit" : "miss"}`;
    el.breakdown.appendChild(tick);
  });

  showScreen("results");
}

el.startBtn.addEventListener("click", startQuiz);
el.againBtn.addEventListener("click", () => showScreen("start"));
el.nextBtn.addEventListener("click", next);

// ---- Offline fallback questions ----
const FALLBACK = [
  { category: "General Knowledge", difficulty: "easy", question: "What is the capital of Ghana?", correct: "Accra", incorrect: ["Lagos", "Nairobi", "Kumasi"] },
  { category: "Science", difficulty: "easy", question: "What planet is known as the Red Planet?", correct: "Mars", incorrect: ["Venus", "Jupiter", "Saturn"] },
  { category: "Science", difficulty: "medium", question: "What gas do plants absorb from the atmosphere?", correct: "Carbon dioxide", incorrect: ["Oxygen", "Nitrogen", "Hydrogen"] },
  { category: "Computers", difficulty: "medium", question: "What does 'HTTP' stand for?", correct: "HyperText Transfer Protocol", incorrect: ["HyperText Transmission Protocol", "High Transfer Text Protocol", "Hyper Transfer Text Process"] },
  { category: "Geography", difficulty: "easy", question: "Which is the largest ocean on Earth?", correct: "Pacific", incorrect: ["Atlantic", "Indian", "Arctic"] },
  { category: "History", difficulty: "medium", question: "In which year did World War II end?", correct: "1945", incorrect: ["1939", "1918", "1950"] },
  { category: "Film", difficulty: "medium", question: "Who directed the movie 'Inception'?", correct: "Christopher Nolan", incorrect: ["Steven Spielberg", "James Cameron", "Ridley Scott"] },
  { category: "Science", difficulty: "hard", question: "What is the chemical symbol for gold?", correct: "Au", incorrect: ["Ag", "Gd", "Go"] },
  { category: "Sports", difficulty: "easy", question: "How many players are on a football (soccer) team on the pitch?", correct: "11", incorrect: ["9", "10", "12"] },
  { category: "General Knowledge", difficulty: "medium", question: "How many continents are there on Earth?", correct: "7", incorrect: ["5", "6", "8"] },
  { category: "Computers", difficulty: "hard", question: "Who is credited with creating the World Wide Web?", correct: "Tim Berners-Lee", incorrect: ["Bill Gates", "Steve Jobs", "Alan Turing"] },
  { category: "Geography", difficulty: "medium", question: "What is the longest river in the world?", correct: "Nile", incorrect: ["Amazon", "Yangtze", "Mississippi"] },
];

showScreen("start");
