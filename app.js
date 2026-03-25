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
function renderProblem() {
  const p = state.problems[state.index];
  const total = state.problems.length;

  contestLabel.textContent = `${state.contest} ${state.year}`;
  probCounter.textContent = `Problem ${p.num} of ${total}`;

  problemText.textContent = p.problem;
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
function copyProblem() {
  const p = state.problems[state.index];
  const text = `${state.contest} ${state.year} — Problem ${p.num}\n\n${p.problem}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(showToast).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try { document.execCommand("copy"); showToast(); } catch (e) { alert("Copy failed — try long-pressing the problem text."); }
  document.body.removeChild(ta);
}

function showToast() {
  copyToast.classList.remove("hidden");
  setTimeout(() => copyToast.classList.add("hidden"), 2000);
}

// ── Start ──
init();
