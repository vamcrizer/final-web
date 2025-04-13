document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.sidebar');
    const maincont = document.querySelector('.main-container');
    const backBtn = document.querySelector('.back-btn');
    backBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
    });
});



const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const copyButton = document.getElementById('copyButton');
const clearButton = document.getElementById('clearButton');
const outputDiv = document.getElementById('output');
const languageSelect = document.getElementById('languageSelect');
const statusDiv = document.getElementById('status');
const chatMessagesDiv = document.getElementById('chatMessages');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');
const errorMessage = document.getElementById('errorMessage');
const typingIndicator = document.querySelector('.typing-indicator');
const fixTextButton = document.getElementById('fixTextButton');
const editButton = document.getElementById('editButton');
const transcriptInput = document.getElementById('transcriptInput');

document.addEventListener('DOMContentLoaded', function() {
    const sendButton = document.getElementById('sendButton');
    const chatInput = document.getElementById('chatInput');

    // Debug check
    console.log('Send button:', sendButton);
    console.log('Chat input:', chatInput);

    if(sendButton && chatInput) {
        // Click event
        sendButton.addEventListener('click', () => {
            console.log('Send button clicked');
            handleSend();
        });

        // Enter key event
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });
    }
});

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.interimResults = true;
recognition.continuous = true;
recognition.lang = languageSelect.value;

let finalTranscript = '';
let interimTranscript = '';
let silenceTimer = null;
let lastSpeechTime = Date.now();
const SILENCE_THRESHOLD = 3000; // 2 seconds of silence before new line
let isRecording = false;
let timerInterval;
let timerSeconds = 0;

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`; // Định dạng như mm:ss
}

// Start/Stop button
startButton.addEventListener('click', () => {
    if (!isRecording) {
        finalTranscript = '';
        interimTranscript = '';
        outputDiv.textContent = '';
        recognition.start();
        isRecording = true;
        startButton.innerHTML = '<img src="./stop-recording.png" alt="icon" style="width: 35px; height: 35px;">';
        timerInterval = setInterval(() => {
            timerSeconds++;
            document.getElementById('timer').textContent = formatTime(timerSeconds);
        }, 1000); // Cập nhật mỗi giây
    } else {
        recognition.stop();
        isRecording = false;
        startButton.innerHTML = '<img src="./record.png" alt="icon" style="width: 35px; height: 35px;">';
        clearInterval(timerInterval);
        timerSeconds = 0; // Đặt lại thời gian về 0
        document.getElementById('timer').textContent = formatTime(timerSeconds); // Cập nhật hiển thị
    }
});

// Language change
languageSelect.addEventListener('change', () => {
    if (isRecording) {
        recognition.stop();
        isRecording = false;
        startButton.innerHTML = '<img src="./record.png" alt="icon" style="width: 35px; height: 35px;">';
    }
    recognition.lang = languageSelect.value;
});

// Speech recognition result
recognition.onresult = (event) => {
    //if (!isRecording) return;
    interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
            clearTimeout(silenceTimer);
            lastSpeechTime = Date.now();
        } else {
            interimTranscript = transcript;
        }
    }

    outputDiv.innerHTML = finalTranscript + 
        '<span class="interim">' + interimTranscript + '</span>';
};

// Restart recognition after it stops
recognition.onend = () => {
    if (startButton.textContent === 'Stop Recording') {
        recognition.start();
    }
};

let isEditing = false;

editButton.addEventListener('click', () => {
    isEditing = !isEditing;
    const outputDiv = document.getElementById('output');

    if (isEditing) {
        // Bật chế độ chỉnh sửa
        outputDiv.setAttribute('contenteditable', 'true');
        outputDiv.classList.add('editing');
        outputDiv.focus();
        editButton.innerHTML = '<img src="./check.png" alt="icon" style="width: 30px; height: 30px;">';
    } else {
        // Tắt chế độ chỉnh sửa và lưu nội dung
        outputDiv.setAttribute('contenteditable', 'false');
        outputDiv.classList.remove('editing');
        editButton.innerHTML = '<img src="./edit-text.png" alt="icon" style="width: 35px; height: 35px;">';
        // Cập nhật finalTranscript
        finalTranscript = outputDiv.innerHTML;
    }
});

// Handle errors
recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    startButton.innerHTML = '<img src="./record.png" alt="icon" style="width: 35px; height: 35px;">';
    clearInterval(timerInterval);
    timerSeconds = 0; // Đặt lại thời gian về 0
    document.getElementById('timer').textContent = formatTime(timerSeconds); // Cập nhật hiển thị
};

// Copy to clipboard
copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(finalTranscript).then(() => {
        alert('Text copied to clipboard!');
    });
});

// Clear text
clearButton.addEventListener('click', () => {
    finalTranscript = '';
    interimTranscript = '';
    outputDiv.textContent = '';
});

function processMarkdown(text) {
    // Handle LaTeX blocks
    const codeBlocks = [];
    text = text.replace(/```(.*?)\n([\s\S]*?)```/g, (match, language, code) => {
        const id = codeBlocks.length;
        codeBlocks.push({
            language: language.trim(),
            code: code.trim()
        });
        // Sử dụng backtick đúng định dạng
        return `\`\`\`${language.trim()}\n${code.trim()}\n\`\`\``;
    });
    // Handle inline LaTeX
    text = text.replace(/\\\((.*?)\\\)/g, (match, formula) => {
        return `<span class="latex-inline">${formula}</span>`;
    });

    // Process headers
    text = text.replace(/^####\s+(.*?)$/gm, '<h4>$1</h4>');
    text = text.replace(/^###\s+(.*?)$/gm, '<h3>$1</h3>');
    text = text.replace(/^##\s+(.*?)$/gm, '<h2>$1</h2>');
    text = text.replace(/^#\s+(.*?)$/gm, '<h1>$1</h1>');

    // Handle bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle italic text
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Process bullet points
    text = text.replace(/^\s*-\s+(.*?)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*?<\/li>\s*)+/gs, '<ul>$&</ul>');
    
    // Process numbered lists
    const listItems = text.split(/(\d+\.\s)/);
    if (listItems.length > 1) {
        let formattedText = '';
        let isInList = false;
        
        for (let i = 0; i < listItems.length; i++) {
            if (listItems[i].match(/^\d+\.\s$/)) {
                if (!isInList) {
                    formattedText += '<ol>';
                    isInList = true;
                }
                formattedText += '<li>' + (listItems[i + 1] || '').trim() + '</li>';
                i++;
            } else {
                if (isInList) {
                    formattedText += '</ol>';
                    isInList = false;
                }
                formattedText += listItems[i];
            }
        }
        
        if (isInList) {
            formattedText += '</ol>';
        }
        text = formattedText;
    }

    // Handle line breaks
    text = text.replace(/\n\n+/g, '<br>');
    
    return text;
}



function displayMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;
    
    if (isUser) {
        // User messages don't need markdown processing
        messageDiv.textContent = message;
    } else {
        // Process bot messages with markdown and LaTeX
        messageDiv.innerHTML = processMarkdown(message);
        
        // Handle LaTeX if present
        if (message.includes('\\[') || message.includes('\\(')) {
            loadMathJax();
            if (window.MathJax) {
                window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, messageDiv]);
            }
        }
    }
    
    // Hide typing indicator
    typingIndicator.style.display = 'none';
    
    // Add message to chat
    chatMessages.insertBefore(messageDiv, typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hiển thị lỗi
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Hiển thị typing indicator
function showTypingIndicator() {
    typingIndicator.style.display = 'block';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Gọi API OpenAI
// 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    
    // Hàm gọi API OpenAI
    async function callOpenAI(message) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer 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'
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: `You are an friendly AI assistant. Your name is Miles AI, you are an education assistant, youll be answering question related to everything but more likely to education. When answering:
                            - Use Markdown to format answers
                            - Do not use bold or headings.
                            - Use ### for level 3 headings.
                            - Dont use too formal language. Make sure user can understand.  
                            - For math formulas, do not use latex formula, use simple plan text but understandable but in bold style.
                            - Ensure clear formatting with separated paragraphs
                            - Explain everything clearly and understandable and not too long.`
                        },
                        {
                            role: 'user',
                            content: message
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });
    
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
    
            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    function sendPrompt(promptText) {
        document.getElementById('chatInput').value = promptText;
        handleSend();  // Tự động gửi prompt sau khi nhấn nút
    }

// Xử lý sự kiện gửi tin nhắn
async function handleSend() {
    const message = chatInput.value.trim();
    if (!message) return;

    try {
        // Disable input và button
        chatInput.disabled = true;
        sendButton.disabled = true;

        // Hiển thị tin nhắn người dùng
        displayMessage(message, true);
        chatInput.value = '';

        // Hiển thị typing indicator
        showTypingIndicator();

        // Tạo context bao gồm văn bản tham chiếu và câu hỏi
        const contextMessage = finalTranscript.trim() ? 
            `Remember you are Miles AI, not GPT.Reference materials: "${finalTranscript.trim()}".\n\nUser asks: ${message}` :
            message;

        // Gọi API với context đầy đủ
        const response = await callOpenAI(contextMessage);
        
        // Hiển thị phản hồi
        displayMessage(response);
    } catch (error) {
        showError('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
        // Enable lại input và button
        chatInput.disabled = false;
        sendButton.disabled = false;
        chatInput.focus();
    }
}

// Event listeners
sendButton.addEventListener('click', handleSend);

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

// Auto-resize textarea
chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = (chatInput.scrollHeight) + 'px';
});

// Tin nhắn chào mừng
displayMessage("Hello! I am Miles AI. How can I help you?");
fixTextButton.addEventListener('click', async () => {
    // Lấy văn bản đã ghi âm từ outputDiv
    const recordedText = outputDiv.textContent.trim();
    
    if (!recordedText) {
        alert('Chưa có văn bản nào được ghi âm!');
        return;
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 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'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { 
                        role: 'system', 
                        content: 'You are a professional language assistant. Based on the context, please revise the following text to make it more coherent and grammatically correct. If the text you read does not make sense, you can completely revise it to make sense (because the voice detector may be faulty or the voice also uses English, for example the word "stack" may be mistaken for "star" so improvise depending on the context).' 
                    },
                    { 
                        role: 'user', 
                        content: recordedText 
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        const correctedText = responseData.choices[0].message.content;

        // Thay thế trực tiếp văn bản trong outputDiv
        finalTranscript = correctedText;
        outputDiv.textContent = correctedText;

    } catch (error) {
        console.error('Error:', error);
        alert('Có lỗi xảy ra khi sửa văn bản. Vui lòng thử lại sau.');
    }
    const displayMessage = (message, isUser = false) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;
        messageDiv.textContent = `${isUser ? 'Bạn' : 'Bot'}: ${message}`;
        chatMessagesDiv.appendChild(messageDiv);
        chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
    };
    

    
});
