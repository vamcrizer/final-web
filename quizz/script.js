document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.sidebar');
    const maincont = document.querySelector('.main-container');
    const backBtn = document.querySelector('.back-btn');
    loadingDiv.style.display = 'none';
    backBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
    });
});
// JavaScript để chuyển đổi giữa các tab
document.getElementById('text-tab').addEventListener('click', function() {
document.getElementById('document-container').style.display = 'none';
document.getElementById('text-container').style.display = 'block';

// Cập nhật trạng thái tab
this.classList.add('active');
document.getElementById('document-tab').classList.remove('active');
});

document.getElementById('document-tab').addEventListener('click', function() {
document.getElementById('document-container').style.display = 'block';
document.getElementById('text-container').style.display = 'none';

// Cập nhật trạng thái tab
this.classList.add('active');
document.getElementById('text-tab').classList.remove('active');
});


// Thay YOUR_API_KEY_HERE bằng API key của bạn
const OPENAI_API_KEY = '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';
    
let userAnswers = [];
let quizData = [];
let currentQuestion = 0;
let score = 0;
let answered = false;

const quiz = document.getElementById('quiz');
const submitBtn = document.getElementById('submit-btn');
const resultDiv = document.getElementById('result');
const generateBtn = document.getElementById('quizz-generate');
const inputSection = document.getElementById('text-input');
const quizSection = document.getElementById('quiz-section');
const loadingDiv = document.getElementById('loading');
const textTab = document.getElementById('text-tab');
const documentTab = document.getElementById('document-tab');
const reminder = document.getElementById('reminder');
let isReviewing = false;
const prevBtn = document.createElement('button');
const nextBtn = document.createElement('button');
const quizCount = document.getElementById('quiz-count').value;
const quizLanguage = document.getElementById('quiz-language').value;

document.getElementById('quiz-count').addEventListener('change', (event) => {
console.log('Số lượng câu hỏi:', event.target.value);
});

document.getElementById('quiz-language').addEventListener('change', (event) => {
console.log('Ngôn ngữ câu hỏi:', event.target.value);
});

function initializeQuiz() {
currentQuestion = 0;
score = 0;
answered = false;
submitBtn.style.display = 'block';
submitBtn.textContent = 'Trả lời';
resultDiv.innerHTML = '';
userAnswers = [];
currentQuestion = 0;
score = 0;
answered = false;
}



async function generateQuestions() {
const documentContent = document.getElementById('text-input').value;
const quizCount = document.getElementById('quiz-count').value;
const quizLanguage = document.getElementById('quiz-language').value;

if (!documentContent.trim()) {
    alert('Enter your document.');
    return;
}
loadingDiv.style.display = 'block';
inputSection.style.display = 'none';
textTab.style.display = 'none';
reminder.style.display = 'none';
documentTab.style.display = 'none';
try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo-0125",
            messages: [{
                role: "user",
                content: `Do not hallucinate.Based on the following document, create ${quizCount} multiple choice questions with 4 possible answers for each question. The questions and answers should be in ${quizLanguage}. The returned JSON format should be in the form:
                - Make sure to double check questions and answers to always have correct solution.
                {
                    "questions": [
                        {
                            "question": "Question",
                            "options": ["Answer 1", "Answer 2", "Answer 3", "Answer 4"],
                            "correct": 0
                        }
                    ]
                }
                
                Document: ${documentContent}`
            }]
        })
    });

    if (!response.ok) {
        throw new Error('Failed to generate questions');
    }

    const data = await response.json();
    try {
        quizData = JSON.parse(data.choices[0].message.content).questions;
    } catch (e) {
        console.error('Error parsing questions:', e);
        throw new Error('Invalid response format');
    }

    loadingDiv.style.display = 'none';
    quizSection.style.display = 'block';
    initializeQuiz();
    showQuestion();
} catch (error) {
    console.error('Error:', error);
    alert('An error occurred while generating questions. Please try again!');
    loadingDiv.style.display = 'none';
    inputSection.style.display = 'block';
}
}

function showQuestion() {
document.getElementById('current-question').textContent = currentQuestion + 1;
document.getElementById('total-questions').textContent = quizData.length;
updateProgressBar();

const questionData = quizData[currentQuestion];
const questionDiv = document.createElement('div');
questionDiv.classList.add('question');

const userAnswer = userAnswers[currentQuestion];
const isAnswered = userAnswer !== undefined;

questionDiv.innerHTML = `
    <h2>${questionData.question}</h2>
    <div class="options">
        ${questionData.options.map((option, index) => `
            <div class="option 
                ${isAnswered ? (index === questionData.correct ? 'correct' : 
                              index === userAnswer.selected ? 'wrong' : '') : ''}
                ${isAnswered ? 'disabled' : ''}"
                data-index="${index}">
                ${option}
            </div>
        `).join('')}
    </div>
`;

quiz.innerHTML = '';
quiz.appendChild(questionDiv);

// Thêm dòng này
if (!document.querySelector('.nav-btn')) {
    setupNavigationButtons();
}

if (!isReviewing && !isAnswered) {
    submitBtn.style.display = 'block';
    submitBtn.textContent = 'Submit';

    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.addEventListener('click', () => selectOption(option));
    });
} else {
    submitBtn.style.display = 'none';
}
}

function selectOption(selected) {
if (userAnswers[currentQuestion] !== undefined) return;

document.querySelectorAll('.option').forEach(option => {
    option.classList.remove('selected');
});
selected.classList.add('selected');
}

function updateProgressBar() {
const progress = ((currentQuestion + 1) / quizData.length) * 100;
document.querySelector('.progress-bar-fill').style.width = `${progress}%`;
}

function showResult() {
const percentage = (score / quizData.length) * 100;
let message = '';
if (percentage >= 80) {
    message = 'Excellent! 🎉';
} else if (percentage >= 60) {
    message = 'Very Well! 👍';
} else {
    message = 'Keep Trying! 💪';
}

resultDiv.innerHTML = `
    <div class="result-score">${score}/${quizData.length}</div>
    <div class="result-message">${message}</div>
    <div class="result-percentage">${percentage}%</div>
    <button id="review-btn" class="review-btn">Review</button>
    <button id="reset-btn" class="reset-btn">Generate Again</button>
`;

// Thêm event listeners cho các nút
document.getElementById('review-btn').addEventListener('click', startReview);
document.getElementById('reset-btn').addEventListener('click', resetQuiz);
prevBtn.style.display = 'none';
nextBtn.style.display = 'none';
generateBtn.style.display = 'none';
submitBtn.style.display = 'none';
}

function startReview() {
isReviewing = true;
currentQuestion = 0;
showQuestion();
submitBtn.style.display = 'none';
document.querySelectorAll('.nav-btn').forEach(btn => btn.style.display = 'block');
const reviewButton = document.getElementById("review-btn");
reviewButton.style.display = 'none';
const resetButton = document.getElementById("reset-btn");
resetButton.style.left = "50%";
}

function updateNavigationButtons() {
prevBtn.style.visibility = currentQuestion === 0 ? 'hidden' : 'visible';
nextBtn.style.visibility = currentQuestion === quizData.length - 1 ? 'hidden' : 'visible';
generateBtn.style.display = 'none';
}

function setupNavigationButtons() {
prevBtn.innerHTML = '&larr;';
nextBtn.innerHTML = '&rarr;';
prevBtn.className = 'nav-btn prev-btn';
nextBtn.className = 'nav-btn next-btn';

const quizContainer = document.getElementById('quiz');
quizContainer.appendChild(prevBtn);
quizContainer.appendChild(nextBtn);

prevBtn.onclick = () => navigateQuestion(-1);
nextBtn.onclick = () => navigateQuestion(1);
updateNavigationButtons();
generateBtn.style.display = 'none';
}



function navigateQuestion(direction) {
    currentQuestion = Math.max(0, Math.min(quizData.length - 1, currentQuestion + direction));
    showQuestion();
    updateNavigationButtons();
    generateBtn.style.display = 'none';

}

function checkAnswer() {
const selected = document.querySelector('.option.selected');
if (!selected && currentQuestion < quizData.length) {
    alert('Vui lòng chọn một đáp án!');
    return;
}

answered = true;
const selectedIndex = parseInt(selected.dataset.index);
const correct = quizData[currentQuestion].correct;

userAnswers[currentQuestion] = {
    selected: selectedIndex,
    correct: correct
};

if (selectedIndex === correct) {
    score++;
    selected.classList.add('correct');
} else {
    selected.classList.add('wrong');
    document.querySelectorAll('.option')[correct].classList.add('correct');
}

currentQuestion++;

if (currentQuestion < quizData.length) {
    submitBtn.textContent = 'Next Question';
} else {
    submitBtn.textContent = 'Finish';
}
}

function nextQuestion() {
if (currentQuestion < quizData.length) {
    answered = false;
    showQuestion();
    submitBtn.textContent = 'Submit';
} else {
    showResult();
}
}

function resetQuiz() {
inputSection.style.display = 'block';
quizSection.style.display = 'none';
resultDiv.innerHTML = '';
document.getElementById('text-input').value = '';
inputSection.style.display = 'block';
textTab.style.display = 'block';
reminder.style.display = 'block';
generateBtn.style.display = 'block';
documentTab.style.display = 'block';
isReviewing = false;
}

generateBtn.addEventListener('click', generateQuestions);

submitBtn.addEventListener('click', () => {
if (!answered) {
    checkAnswer();
} else {
    nextQuestion();
}
});
