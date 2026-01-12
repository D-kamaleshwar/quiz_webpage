// Multi-topic quiz logic with a dashboard
const quizSets = {
	General: [
		{ id: 1, text: 'Which language runs in a web browser?', choices: ['Java', 'C', 'Python', 'JavaScript'], answer: 3 },
		{ id: 2, text: 'What does CSS stand for?', choices: ['Central Style Sheets', 'Cascading Style Sheets', 'Computer Style Sheets', 'Creative Style Sheets'], answer: 1 },
		{ id: 3, text: 'Which HTML tag is used to define an unordered list?', choices: ['<ol>', '<ul>', '<li>', '<list>'], answer: 1 },
	],
	Web: [
		{ id: 1, text: 'What is the purpose of the <canvas> element?', choices: ['Create layouts', 'Draw graphics', 'Embed videos', 'Store data'], answer: 1 },
		{ id: 2, text: 'Which of these is a JavaScript framework?', choices: ['Laravel', 'React', 'Django', 'Rails'], answer: 1 },
	],
	Science: [
		{ id: 1, text: 'Water boils at what temperature (°C) at sea level?', choices: ['90', '100', '110', '120'], answer: 1 },
		{ id: 2, text: 'What is the chemical symbol for Gold?', choices: ['Au', 'Ag', 'Gd', 'Go'], answer: 0 },
	],
};

let currentTopic = null;
let questions = [];
let state = { index: 0, answers: [] };

const el = id => document.getElementById(id);

function renderDashboard() {
	const container = el('topics');
	container.innerHTML = '';
	Object.keys(quizSets).forEach(key => {
		const card = document.createElement('button');
		card.className = 'topic-card';
		card.textContent = key;
		card.addEventListener('click', () => startQuiz(key));
		container.appendChild(card);
	});
}

function startQuiz(topicKey) {
	currentTopic = topicKey;
	questions = quizSets[topicKey];
	state = { index: 0, answers: Array(questions.length).fill(null) };
	el('dashboard').classList.add('hidden');
	el('question-card').classList.remove('hidden');
	el('topic-name').textContent = `Topic: ${topicKey}`;
	renderQuestion();
}

function goBackToDashboard() {
	currentTopic = null;
	questions = [];
	state = { index: 0, answers: [] };
	el('question-card').classList.add('hidden');
	el('result').classList.add('hidden');
	el('dashboard').classList.remove('hidden');
}

function renderQuestion() {
	const q = questions[state.index];
	el('q-index').textContent = state.index + 1;
	el('q-total').textContent = questions.length;
	el('question-text').textContent = q.text;

	const ul = el('choices');
	ul.innerHTML = '';
	q.choices.forEach((c, i) => {
		const li = document.createElement('li');
		li.tabIndex = 0;
		li.className = state.answers[state.index] === i ? 'selected' : '';
		li.textContent = c;
		li.addEventListener('click', () => selectChoice(i));
		li.addEventListener('keydown', e => {
			if (e.key === 'Enter' || e.key === ' ') selectChoice(i);
		});
		ul.appendChild(li);
	});
}

function selectChoice(choiceIndex) {
	state.answers[state.index] = choiceIndex;
	renderQuestion();
}

function goNext() {
	if (state.index < questions.length - 1) {
		state.index++;
		renderQuestion();
	}
}

function goPrev() {
	if (state.index > 0) {
		state.index--;
		renderQuestion();
	}
}

function submitQuiz() {
	const unanswered = state.answers.filter(a => a === null).length;
	if (unanswered > 0) {
		if (!confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
	}

	let score = 0;
	const feedback = [];
	questions.forEach((q, i) => {
		const user = state.answers[i];
		if (user === q.answer) score++;
		feedback.push({ question: q.text, correct: q.choices[q.answer], chosen: user == null ? null : q.choices[user], ok: user === q.answer });
	});

	el('question-card').classList.add('hidden');
	el('result').classList.remove('hidden');
	el('score-text').textContent = `You scored ${score} out of ${questions.length}.`;

	const fb = el('feedback');
	fb.innerHTML = '';
	feedback.forEach((f, i) => {
		const p = document.createElement('p');
		p.innerHTML = `<strong>Q${i+1}:</strong> ${f.question} <br/>Your answer: <em>${f.chosen ?? '—'}</em> • Correct: <em>${f.correct}</em>`;
		p.className = f.ok ? 'feedback-correct' : 'feedback-wrong';
		fb.appendChild(p);
	});
}

function restartQuiz() {
	if (!currentTopic) return goBackToDashboard();
	state = { index: 0, answers: Array(questions.length).fill(null) };
	el('result').classList.add('hidden');
	el('question-card').classList.remove('hidden');
	renderQuestion();
}

document.addEventListener('DOMContentLoaded', () => {
	renderDashboard();
	el('next-btn').addEventListener('click', goNext);
	el('prev-btn').addEventListener('click', goPrev);
	el('submit-btn').addEventListener('click', submitQuiz);
	el('restart-btn').addEventListener('click', restartQuiz);
	el('back-btn').addEventListener('click', goBackToDashboard);
	el('back2-btn').addEventListener('click', goBackToDashboard);
	// Auth / mock Google sign-in handlers
	el('sign-in-btn').addEventListener('click', showLoginModal);
	el('mock-google-btn').addEventListener('click', () => {
		const email = el('mock-email').value.trim();
		mockSignIn(email);
	});
	el('close-login').addEventListener('click', hideLoginModal);
	el('sign-out-btn').addEventListener('click', signOut);

	updateAuthUI();
});

// --- Mock auth functions (client-side only demo) ---
function avatarFor(name) {
	if (!name) return '';
	const initials = name.split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase();
	const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='100%' height='100%' fill='%234f46e5'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='28' fill='white'>${initials}</text></svg>`;
	return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function updateAuthUI() {
	const raw = localStorage.getItem('quiz_user');
	const user = raw ? JSON.parse(raw) : null;
	if (user) {
		el('sign-in-btn').classList.add('hidden');
		el('user-info').classList.remove('hidden');
		el('user-name').textContent = user.name || user.email;
		el('user-avatar').src = avatarFor(user.name || user.email);
	} else {
		el('sign-in-btn').classList.remove('hidden');
		el('user-info').classList.add('hidden');
	}
}

function showLoginModal() {
	el('login-modal').classList.remove('hidden');
	el('mock-email').focus();
}

function hideLoginModal() {
	el('login-modal').classList.add('hidden');
}

function mockSignIn(email) {
	if (!email) return alert('Please enter an email (mock).');
	const name = email.split('@')[0].replace(/[._\-]/g, ' ');
	const user = { email, name };
	localStorage.setItem('quiz_user', JSON.stringify(user));
	hideLoginModal();
	updateAuthUI();
}

function signOut() {
	localStorage.removeItem('quiz_user');
	updateAuthUI();
}

