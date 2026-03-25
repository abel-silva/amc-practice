// AMC / AIME Practice App

const CONTEST_ORDER = ["AMC 10A", "AMC 10B", "AMC 12A", "AMC 12B", "AIME I", "AIME II"];

let state = {
  contest: null,
  year: null,
  problems: [],
  index: 0,
  solutionVisible: false,
};

// ── DOM refs ──
const screenSelect  = document.getElementById("screen-select");
const screenProblem = document.getElementById("screen-problem");
const selContest    = document.getElementById("sel-contest");
const selYear       = document.getElementById("sel-year");
const btnStart      = document.getElementById("btn-start");
const btnBack       = document.getElementById("btn-back");
const contestLabel  = document.getElementById("contest-label");
const probCounter   = document.getElementById("prob-counter");
const problemText   = document.getElementById("problem-text");
const solutionBox   = document.getElementById("solution-box");
const solutionText  = document.getElementById("solution-text");
const btnSolution   = document.getElementById("btn-solution");
const btnCopy       = document.getElementById("btn-copy");
const btnChatGPT    = document.getElementById("btn-chatgpt");
const btnPrev       = document.getElementById("btn-prev");
const btnNext       = document.getElementById("btn-next");
const copyToast     = document.getElementById("copy-toast");

// ── Init ──
function init() {
  // Populate contest dropdown
  CONTEST_ORDER.forEach(name => {
    if (AMC_DATA[name]) {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      selContest.appendChild(opt);
    }
  });

  updateYears();
  selContest.addEventListener("change", updateYears);
  btnStart.addEventListener("click", startSession);
  btnBack.addEventListener("click", goBack);
  btnSolution.addEventListener("click", toggleSolution);
  btnCopy.addEventListener("click", copyProblem);
  btnChatGPT.addEventListener("click", askChatGPT);
  btnPrev.addEventListener("click", () => navigate(-1));
  btnNext.addEventListener("click", () => navigate(1));
}

function updateYears() {
  const contest = selContest.value;
  const years = Object.keys(AMC_DATA[contest] || {}).sort((a, b) => b - a);
  selYear.innerHTML = "";
  years.forEach(y => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    selYear.appendChild(opt);
  });
}

// ── Navigation ──
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function startSession() {
  const contest = selContest.value;
  const year = selYear.value;
  const problems = AMC_DATA[contest]?.[year];
  if (!problems || problems.length === 0) {
    alert("No problems found for that selection.");
    return;
  }
  state = { contest, year, problems, index: 0, solutionVisible: false };
  showScreen("screen-problem");
  renderProblem();
}

function goBack() {
  showScreen("screen-select");
}

function navigate(dir) {
  const next = state.index + dir;
  if (next < 0 || next >= state.problems.length) return;
  state.index = next;
  state.solutionVisible = false;
  renderProblem();
  // Scroll to top of problem
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── Render ──
function formatProblemText(raw) {
  // Escape HTML special chars first
  const escaped = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Put a <br> before the answer choices block which always starts with $\textbf{(A)
  // Then replace every \qquad (choice separator) with a line break
  return escaped
    .replace('$\\textbf{(A)', '<br>$\\textbf{(A)')
    .replace(/\\qquad/g, '$<br>$');
}
function renderProblem() {
  const p = state.problems[state.index];
  const total = state.problems.length;

  contestLabel.textContent = `${state.contest} ${state.year}`;
  probCounter.textContent = `Problem ${p.num} of ${total}`;

  problemText.innerHTML = formatProblemText(p.problem);
  solutionText.textContent = p.solution;

  // Hide solution
  solutionBox.classList.add("hidden");
  btnSolution.textContent = "View Solution";
  state.solutionVisible = false;

  // Nav buttons
  btnPrev.disabled = state.index === 0;
  btnNext.disabled = state.index === total - 1;

  // Re-render MathJax
  if (window.MathJax) {
    MathJax.typesetPromise([problemText, solutionText]).catch(console.error);
  }
}

// ── Solution toggle ──
function toggleSolution() {
  state.solutionVisible = !state.solutionVisible;
  solutionBox.classList.toggle("hidden", !state.solutionVisible);
  btnSolution.textContent = state.solutionVisible ? "Hide Solution" : "View Solution";
}

// ── Copy ──
function problemPrompt() {
  const p = state.problems[state.index];
  return `${state.contest} ${state.year} — Problem ${p.num}\n\n${p.problem}`;
}

function chatGPTPrompt() {
  const p = state.problems[state.index];
  return `I am studying for math competitions (${state.contest}). Please help me with the following problem:

${state.contest} ${state.year} — Problem ${p.num}

${p.problem}

Please do the following:
1. Solve the problem step by step with a clear, detailed explanation.
2. Identify every mathematical concept, theorem, or technique used in the solution.
3. For each concept or theorem, explain it from the ground up — assume I may not know it. Include:
   - A clear definition
   - A proof or derivation (from first principles where possible)
   - Intuition for why it works
   - Any prerequisite concepts I should understand first
4. Suggest related topics I should study to deeply understand this type of problem.`;
}

function copyProblem() {
  const text = problemPrompt();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(showToast).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function askChatGPT() {
  const text = chatGPTPrompt();
  const copy = navigator.clipboard && navigator.clipboard.writeText
    ? navigator.clipboard.writeText(text)
    : Promise.resolve(fallbackCopy(text, true));

  copy.then(() => {
    showToast("Copied — paste into ChatGPT");
    // Small delay so clipboard is ready before switching apps
    setTimeout(() => {
      window.open("https://chat.openai.com/", "_blank");
    }, 300);
  }).catch(() => {
    fallbackCopy(text, true);
    setTimeout(() => window.open("https://chat.openai.com/", "_blank"), 300);
  });
}

function fallbackCopy(text, silent = false) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try { document.execCommand("copy"); if (!silent) showToast(); } catch (e) { alert("Copy failed — try long-pressing the problem text."); }
  document.body.removeChild(ta);
}

function showToast(msg = "Copied to clipboard") {
  copyToast.textContent = msg;
  copyToast.classList.remove("hidden");
  setTimeout(() => copyToast.classList.add("hidden"), 2500);
}

// ── Start ──
init();
