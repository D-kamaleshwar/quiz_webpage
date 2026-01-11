// Simple interactive quiz logic
const questions = [
	{
		id: 1,
		text: 'Which language runs in a web browser?',
		choices: ['Java', 'C', 'Python', 'JavaScript'],
		answer: 3,
	},
	{
		id: 2,
		text: 'What does CSS stand for?',
		choices: ['Central Style Sheets', 'Cascading Style Sheets', 'Computer Style Sheets', 'Creative Style Sheets'],
		answer: 1,
	},
	{
		id: 3,
		text: 'Which HTML tag is used to define an unordered list?',
		choices: ['<ol>', '<ul>', '<li>', '<list>'],
		answer: 1,
	},
	{
		id: 4,
		text: 'Which company developed the React library?',
		choices: ['Google', 'Microsoft', 'Facebook', 'Twitter'],
		answer: 2,
	},
];

let state = {
	index: 0,
	answers: Array(questions.length).fill(null),
};

const el = id => document.getElementById(id);

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
		feedback.push({question: q.text, correct: q.choices[q.answer], chosen: user == null ? null : q.choices[user], ok: user === q.answer});
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
	state = {index:0, answers: Array(questions.length).fill(null)};
	el('result').classList.add('hidden');
	el('question-card').classList.remove('hidden');
	renderQuestion();
}

document.addEventListener('DOMContentLoaded', () => {
	renderQuestion();
	el('next-btn').addEventListener('click', goNext);
	el('prev-btn').addEventListener('click', goPrev);
	el('submit-btn').addEventListener('click', submitQuiz);
	el('restart-btn').addEventListener('click', restartQuiz);
});

