// First, add PDF.js library to your HTML
document.addEventListener('DOMContentLoaded', function() {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    document.head.appendChild(script);
    });
    
    // PDF handling and quiz generation code
    let quizData2 = [];
    let userAnswers2 = [];
    let currentQuestion2 = 0;
    let score2 = 0;
    const submitBtn2 = document.getElementById('submit-btn2');
    let answered2 = false;
    let isReviewing2 = false;
    const prevBtn2 = document.createElement('button');
    const nextBtn2 = document.createElement('button');
    
    // Initialize PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    // File handling setup
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const resultDiv2 = document.getElementById('result2');
    const errorMessage = document.getElementById('error-message');
    const loadingDiv2 = document.getElementById('loading2');
    const generateBtn2 = document.getElementById('quizz-generate2');
    const quizSection2 = document.getElementById('quiz-section2');
    
    dropArea.addEventListener('click', function(e) {
    fileInput.click(); // Trigger click event trên input file
    e.preventDefault(); // Ngăn chặn hành vi mặc định
    });
    
    // Ngăn chặn sự kiện click lan truyền từ input file
    fileInput.addEventListener('click', function(e) {
    e.stopPropagation();
    });
    
    // Drag and drop handlers
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight(e) {
    dropArea.classList.add('highlight');
    }
    
    function unhighlight(e) {
    dropArea.classList.remove('highlight');
    }
    
    dropArea.addEventListener('drop', handleDrop, false);
    fileInput.addEventListener('change', handleFileSelect, false);
    
    function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
    }
    
    function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
    }
    
    function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        if (file.type === 'application/pdf') {
            displayFileInfo(file);
            errorMessage.textContent = '';
        } else {
            errorMessage.textContent = 'Please upload a PDF file.';
            fileInfo.textContent = '';
        }
    }
    }
    
    function displayFileInfo(file) {
    fileInfo.textContent = `File: ${file.name} (${formatFileSize(file.size)})`;
    }
    
    function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
    }
    
    return fullText;
    }
    
    // Quiz generation and handling functions
    function initializeQuiz2() {
    currentQuestion2 = 0;
    score2 = 0;
    answered2 = false;
    const submitBtn2 = document.getElementById('submit-btn2');
    submitBtn2.style.display = 'block';
    submitBtn2.textContent = 'Submit';
    document.getElementById('result2').innerHTML = '';
    userAnswers2 = [];
    }
    
    async function generateQuestionsFromPDF() {
    const fileInput = document.getElementById('file-input');
    const quizCount = document.getElementById('quiz-count').value;
    const quizLanguage = document.getElementById('quiz-language').value;
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('Please select a PDF file.');
        return;
    }
    
    const file = fileInput.files[0];
    loadingDiv2.style.display = 'block';
    generateBtn2.style.display = 'none';
    
    try {
        const extractedText = await extractTextFromPDF(file);
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
                    
                    Document: ${extractedText}`
                }]
            })
        });
    
        if (!response.ok) {
            throw new Error('Failed to generate questions');
        }
    
        const data = await response.json();
        quizData2 = JSON.parse(data.choices[0].message.content).questions;
    
        loadingDiv2.style.display = 'none';
        quizSection2.style.display = 'block';
        dropArea.style.display = 'none';
        initializeQuiz2();
        showQuestion2();
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while processing the PDF. Please try again!');
        loadingDiv2.style.display = 'none';
        generateBtn2.style.display = 'block';
    }
    }
    
    function showQuestion2() {
    document.getElementById('current-question2').textContent = currentQuestion2 + 1;
    document.getElementById('total-questions2').textContent = quizData2.length;
    updateProgressBar2();
    
    const questionData = quizData2[currentQuestion2];
    const questionDiv = document.createElement('div');
    questionDiv.classList.add('question');
    
    const userAnswer2 = userAnswers2[currentQuestion2];
    const isAnswered2 = userAnswer2 !== undefined;

    questionDiv.innerHTML = `
        <h2>${questionData.question}</h2>
            <div class="options">
                ${questionData.options.map((option, index) => `
                    <div class="option 
                        ${isAnswered2 ? (index === questionData.correct ? 'correct' : 
                                    index === userAnswer2.selected ? 'wrong' : '') : ''}
                        ${isAnswered2 ? 'disabled' : ''}"
                        data-index="${index}">
                        ${option}
                    </div>
                `).join('')}
    </div>
    `;
    
    const quiz2 = document.getElementById('quiz2');
    quiz2.innerHTML = '';
    quiz2.appendChild(questionDiv);
    
    if (!document.querySelector('.nav-btn2')) {
        setupNavigationButtons2();
    }
    
    if (!isReviewing2 && !isAnswered2) {
        const submitBtn2 = document.getElementById('submit-btn2');
        submitBtn2.style.display = 'block';
    
        const options = questionDiv.querySelectorAll('.option');
        options.forEach(option => {
            option.addEventListener('click', () => selectOption2(option));
        });
    } else {
        submitBtn.style.display = 'none';
    }
    
    }


    
    function selectOption2(selected) {
        if (userAnswers2[currentQuestion2] !== undefined) return;

        document.querySelectorAll('.option').forEach(option => {
            option.classList.remove('selected');
        });
        selected.classList.add('selected');
        }
        
        function updateProgressBar2() {
        const progress = ((currentQuestion2 + 1) / quizData2.length) * 100;
        document.querySelector('.progress-bar-fill').style.width = `${progress}%`;
    }
    
    function checkAnswer2() {
    const selected = document.querySelector('#quiz2 .option.selected');
    if (!selected && currentQuestion2 < quizData2.length) {
        alert('Please select an answer!');
        return;
    }
    
    answered2 = true;
    const selectedIndex = parseInt(selected.dataset.index);
    const correct = quizData2[currentQuestion2].correct;
    
    userAnswers2[currentQuestion2] = {
        selected: selectedIndex,
        correct: correct
    };

    if (selectedIndex === correct) {
        score2++;
        selected.classList.add('correct');
    } else {
        selected.classList.add('wrong');
        document.querySelectorAll('#quiz2 .option')[correct].classList.add('correct');
    }
    
    currentQuestion2++;
    
    const submitBtn2 = document.getElementById('submit-btn2');
    if (currentQuestion2 < quizData2.length) {
        submitBtn2.textContent = 'Next Question';
    } else {
        submitBtn2.textContent = 'Finish';
    }
    }
    
    function nextQuestion2() {
    if (currentQuestion2 < quizData2.length) {
        answered2 = false;
        showQuestion2();
        document.getElementById('submit-btn2').textContent = 'Submit';
    } else {
        showResult2();
    }
    }
    
    function showResult2() {
    const percentage = (score2 / quizData2.length) * 100;
    let message = '';
    if (percentage >= 80) {
        message = 'Excellent! 🎉';
    } else if (percentage >= 60) {
        message = 'Very Well! 👍';
    } else {
        message = 'Keep Trying! 💪';
    }
    resultDiv2.innerHTML = `
        <div class="result-score">${score2}/${quizData2.length}</div>
        <div class="result-message">${message}</div>
        <div class="result-percentage">${percentage}%</div>
        <button id="review-btn2" class="review-btn">Review</button>
        <button id="reset-btn2" class="reset-btn">Generate Again</button>
    `;
    
    document.getElementById('review-btn2').addEventListener('click', startReview2);
    document.getElementById('reset-btn2').addEventListener('click', resetQuiz2);
    prevBtn2.style.display = 'none';
    nextBtn2.style.display = 'none';
    generateBtn2.style.display = 'none';
    submitBtn2.style.display = 'none';
    }
    
    function startReview2() {
        isReviewing2 = true;
        currentQuestion2 = 0;
        showQuestion2();
        submitBtn2.style.display = 'none';
        document.querySelectorAll('.nav-btn2').forEach(btn => btn.style.display = 'block');
        const reviewButton = document.getElementById("review-btn2");
        reviewButton.style.display = 'none';
        const resetButton = document.getElementById("reset-btn2");
        resetButton.style.left = "50%";
    }
    
    function setupNavigationButtons2() {
    prevBtn2.innerHTML = '&larr;';
    nextBtn2.innerHTML = '&rarr;';
    prevBtn2.className = 'nav-btn2 prev-btn2';
    nextBtn2.className = 'nav-btn2 next-btn2';
    
    const quiz2 = document.getElementById('quiz2');
    quiz2.appendChild(prevBtn2);
    quiz2.appendChild(nextBtn2);
    
    prevBtn2.onclick = () => navigateQuestion2(-1);
    nextBtn2.onclick = () => navigateQuestion2(1);
    updateNavigationButtons2();
    generateBtn2.style.display = 'none';
    }
    
    function updateNavigationButtons2() {
    prevBtn2.style.visibility = currentQuestion2 === 0 ? 'hidden' : 'visible';
    nextBtn2.style.visibility = currentQuestion2 === quizData2.length - 1 ? 'hidden' : 'visible';
    generateBtn2.style.display = 'none';
    }
    
    function navigateQuestion2(direction) {
    currentQuestion2 = Math.max(0, Math.min(quizData2.length - 1, currentQuestion2 + direction));
    showQuestion2();
    updateNavigationButtons2();
    generateBtn2.style.display = 'none';
    }
    
    function resetQuiz2() {
    fileInput.value = '';
    fileInfo.textContent = '';
    quizSection2.style.display = 'none';
    document.getElementById('result2').innerHTML = '';
    generateBtn2.style.display = 'block';
    isReviewing2 = false;
    dropArea.style.display = 'block';
    }
    
    // Event listeners
    generateBtn2.addEventListener('click', generateQuestionsFromPDF);
    
    document.getElementById('submit-btn2').addEventListener('click', () => {
    if (!answered2) {
        checkAnswer2();
    } else {
        nextQuestion2();
    }
    });