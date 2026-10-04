import { quizQuestions } from './questions';
const QUIZ_SECONDS = 90;
const SCORE_KEY = 'quickquiz-scores';
const CUSTOM_KEY = 'quickquiz-custom-questions';
let selectedDifficulty = 'Easy';
let activeQuestions = [];
let state = emptyState();
let seconds = QUIZ_SECONDS;
let intervalId;
function emptyState() { return { currentQuestionIndex: 0, score: 0, userAnswers: [], isFinished: false }; }
function el(id) { const node = document.getElementById(id); if (!node)
    throw new Error(`Missing #${id}`); return node; }
const home = el('home-view'), leaderboardView = el('leaderboard-view'), addView = el('add-question-view'), setup = el('setup-screen'), quizCard = el('quiz-card'), quizScreen = el('quiz-screen'), results = el('result-screen');
const qNumber = el('question-number'), progress = el('progress-bar'), timer = el('timer'), timerText = el('timer-text'), scoreText = el('score-counter'), question = el('question-text'), code = el('code-snippet'), choices = el('options-container'), feedback = el('feedback'), next = el('next-btn');
const finalScore = el('final-score'), totalCount = el('total-count'), resultTitle = el('result-title'), scoreMessage = el('score-message'), correctCount = el('correct-count'), accuracy = el('accuracy'), timeUsed = el('time-used'), playerName = el('player-name'), saveScore = el('save-score-btn');
const questionCount = el('question-count'), leaderboardList = el('leaderboard-list'), form = el('question-form'), choiceFields = el('choice-fields'), formMessage = el('form-message');
function customQuestions() { try {
    return JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]');
}
catch {
    return [];
} }
function allQuestions() { return [...quizQuestions, ...customQuestions()]; }
function setView(name) { window.clearInterval(intervalId); [home, leaderboardView, addView].forEach(view => view.classList.add('hidden')); document.querySelectorAll('.nav-links .nav-btn').forEach(btn => btn.classList.remove('active')); if (name === 'home')
    home.classList.remove('hidden'); if (name === 'leaderboard') {
    leaderboardView.classList.remove('hidden');
    renderLeaderboard();
} if (name === 'add-question')
    addView.classList.remove('hidden'); const button = document.querySelector(`.nav-links [data-view="${name}"]`); button?.classList.add('active'); }
function updateDifficultyCount() { const amount = allQuestions().filter(q => q.difficulty === selectedDifficulty).length; questionCount.textContent = `${amount} question${amount === 1 ? '' : 's'} selected`; }
function selectDifficulty(value) { selectedDifficulty = value; document.querySelectorAll('.difficulty-card').forEach(btn => btn.classList.toggle('selected', btn.dataset.difficulty === value)); updateDifficultyCount(); }
function startQuiz() { activeQuestions = allQuestions().filter(q => q.difficulty === selectedDifficulty); if (!activeQuestions.length)
    return; state = { currentQuestionIndex: 0, score: 0, userAnswers: new Array(activeQuestions.length).fill(null), isFinished: false }; seconds = QUIZ_SECONDS; setup.classList.add('hidden'); quizCard.classList.remove('hidden'); results.classList.add('hidden'); quizScreen.classList.remove('hidden'); renderQuestion(); startTimer(); }
function renderQuestion() {
    const q = activeQuestions[state.currentQuestionIndex];
    qNumber.textContent = `QUESTION ${String(state.currentQuestionIndex + 1).padStart(2, '0')} OF ${String(activeQuestions.length).padStart(2, '0')}`;
    progress.style.width = `${state.currentQuestionIndex / activeQuestions.length * 100}%`;
    scoreText.textContent = `${state.score} ${state.score === 1 ? 'point' : 'points'}`;
    question.textContent = q.question;
    code.textContent = q.codeSnippet || '';
    code.classList.toggle('hidden', !q.codeSnippet);
    choices.replaceChildren();
    feedback.textContent = '';
    feedback.className = 'feedback';
    next.disabled = true;
    next.innerHTML = 'Choose an answer <span>-></span>';
    q.options.forEach((answer, index) => { const button = document.createElement('button'); button.className = 'option-btn'; button.type = 'button'; button.innerHTML = `<span class="option-letter">${String.fromCharCode(65 + index)}</span><span>${answer}</span>`; button.addEventListener('click', () => choose(index)); choices.append(button); });
}
function choose(index) { if (state.userAnswers[state.currentQuestionIndex] !== null)
    return; const q = activeQuestions[state.currentQuestionIndex]; const isCorrect = index === q.correctAnswerIndex; state.userAnswers[state.currentQuestionIndex] = index; if (isCorrect)
    state.score++; scoreText.textContent = `${state.score} ${state.score === 1 ? 'point' : 'points'}`; choices.querySelectorAll('.option-btn').forEach((btn, i) => { btn.disabled = true; if (i === q.correctAnswerIndex)
    btn.classList.add('correct');
else if (i === index)
    btn.classList.add('wrong'); }); feedback.classList.toggle('incorrect', !isCorrect); feedback.innerHTML = isCorrect ? '<strong>Correct!</strong> Great command of TypeScript.' : `<strong>Not quite.</strong> The answer is ${q.options[q.correctAnswerIndex]}.`; next.disabled = false; next.innerHTML = state.currentQuestionIndex === activeQuestions.length - 1 ? 'See my results <span>-></span>' : 'Next question <span>-></span>'; }
function advance() { if (state.userAnswers[state.currentQuestionIndex] === null)
    return; if (state.currentQuestionIndex === activeQuestions.length - 1)
    showResults();
else {
    state.currentQuestionIndex++;
    renderQuestion();
} }
function formatTime(value) { return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`; }
function startTimer() { window.clearInterval(intervalId); updateTimer(); intervalId = window.setInterval(() => { seconds--; updateTimer(); if (seconds <= 0)
    showResults(); }, 1000); }
function updateTimer() { timerText.textContent = formatTime(Math.max(0, seconds)); timer.classList.toggle('warning', seconds <= 30 && seconds > 10); timer.classList.toggle('danger', seconds <= 10); }
function showResults() { if (state.isFinished)
    return; state.isFinished = true; window.clearInterval(intervalId); quizScreen.classList.add('hidden'); results.classList.remove('hidden'); progress.style.width = '100%'; const percent = Math.round(state.score / activeQuestions.length * 100); finalScore.textContent = String(state.score); totalCount.textContent = String(activeQuestions.length); correctCount.textContent = String(state.score); accuracy.textContent = `${percent}%`; timeUsed.textContent = formatTime(QUIZ_SECONDS - seconds); playerName.value = ''; saveScore.disabled = false; if (percent === 100) {
    resultTitle.textContent = 'Perfect score!';
    scoreMessage.textContent = 'You absolutely nailed this TypeScript challenge.';
}
else if (percent >= 67) {
    resultTitle.textContent = 'Strong work!';
    scoreMessage.textContent = 'You have a great grasp of the essentials.';
}
else {
    resultTitle.textContent = 'Keep growing!';
    scoreMessage.textContent = 'A little more practice and these concepts will click.';
} }
function scores() { try {
    return JSON.parse(localStorage.getItem(SCORE_KEY) || '[]');
}
catch {
    return [];
} }
function saveLeaderboardScore() { const name = playerName.value.trim() || 'Anonymous'; const updated = [...scores(), { name, score: state.score, total: activeQuestions.length, difficulty: selectedDifficulty, date: new Date().toLocaleDateString() }].sort((a, b) => b.score / b.total - a.score / a.total || b.score - a.score).slice(0, 10); localStorage.setItem(SCORE_KEY, JSON.stringify(updated)); saveScore.disabled = true; saveScore.textContent = 'Saved'; }
function renderLeaderboard() { const rows = scores(); leaderboardList.replaceChildren(); if (!rows.length) {
    leaderboardList.innerHTML = '<p class="empty-scores">No scores yet. Your next quiz could be first.</p>';
    return;
} rows.forEach((entry, index) => { const row = document.createElement('article'); row.className = 'score-row'; row.innerHTML = `<span class="score-rank">${index + 1}</span><div><span class="score-name">${escapeHtml(entry.name)}</span><span class="score-meta">${entry.difficulty} - ${entry.date}</span></div><span class="score-value">${entry.score}/${entry.total}</span>`; leaderboardList.append(row); }); }
function escapeHtml(value) { const node = document.createElement('span'); node.textContent = value; return node.innerHTML; }
function setupForm() { choiceFields.replaceChildren(); for (let i = 0; i < 4; i++) {
    const label = document.createElement('label');
    label.className = 'choice-field';
    label.innerHTML = `<input type="radio" name="correct" value="${i}" ${i === 0 ? 'checked' : ''}><input required type="text" maxlength="100" placeholder="Option ${i + 1}">`;
    choiceFields.append(label);
} }
function addCustomQuestion(event) { event.preventDefault(); const prompt = el('prompt').value.trim(); const snippet = el('snippet').value.trim(); const difficulty = el('form-difficulty').value; const topic = el('form-topic').value; const inputs = Array.from(choiceFields.querySelectorAll('input[type="text"]')); const answer = Number(choiceFields.querySelector('input[type="radio"]:checked')?.value || 0); if (!prompt || inputs.some(input => !input.value.trim())) {
    formMessage.textContent = 'Please add a prompt and all four answer choices.';
    formMessage.className = 'form-message error';
    return;
} const stored = customQuestions(); stored.push({ id: Date.now(), topic, difficulty, question: prompt, codeSnippet: snippet || undefined, options: inputs.map(input => input.value.trim()), correctAnswerIndex: answer, isCustom: true }); localStorage.setItem(CUSTOM_KEY, JSON.stringify(stored)); form.reset(); setupForm(); formMessage.textContent = 'Question added! It is ready in the selected difficulty.'; formMessage.className = 'form-message'; updateDifficultyCount(); }
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => setView(button.dataset.view || 'home')));
document.querySelectorAll('.difficulty-card').forEach(button => button.addEventListener('click', () => selectDifficulty(button.dataset.difficulty)));
el('start-btn').addEventListener('click', startQuiz);
next.addEventListener('click', advance);
el('restart-btn').addEventListener('click', () => { quizCard.classList.add('hidden'); setup.classList.remove('hidden'); });
saveScore.addEventListener('click', saveLeaderboardScore);
el('clear-scores').addEventListener('click', () => { localStorage.removeItem(SCORE_KEY); renderLeaderboard(); });
form.addEventListener('submit', addCustomQuestion);
setupForm();
selectDifficulty('Easy');
