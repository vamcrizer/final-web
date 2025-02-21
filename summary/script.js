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

// Replace with your OpenAI API key
const OPENAI_API_KEY = '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';
const fileInput = document.getElementById('file-input');
const uploadArea = document.getElementById('upload-area');
const fileInfo = document.getElementById('file-info');
const errorMessage = document.getElementById('error-message');
const summarizeBtn = document.getElementById('summarize-btn');
const loadingDiv = document.getElementById('loading');
const summaryOutput = document.getElementById('summary-output');
const summarizeTextBtn = document.getElementById('summarize-text');
const summaryOutput1 = document.getElementById('summary-output1')
const errorMessage1 = document.getElementById('error-message1');
const loadingDiv1 = document.getElementById('loading1');

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

//Xử lý sự kiện kéo và thả
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#764ba2';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#667eea';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#667eea';
    const file = e.dataTransfer.files[0];
    handleFile(file);
});

// Xử lý sự kiện chọn file
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleFile(file);
});

//Hàm xử lý file
async function handleFile(file) {
    if (!file) return;

    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
        showError('Please upload a PDF or Word document.');
        return;
    }

    fileInfo.textContent = `Selected file: ${file.name}`;
    errorMessage.style.display = 'none';
    summarizeBtn.style.display = 'block';
    
    try {
        if (file.type === 'application/pdf') {
            fileContent = await extractPdfText(file);
        } else {
            // For Word documents, you'll need to implement a server-side solution
            // or use a different library as Word processing in browser is limited
            showError('Word document processing is currently not supported in this demo.');
            return;
        }
    } catch (error) {
        showError('Error processing file. Please try again.');
        console.error(error);
    }
}

//Hàm trích xuất văn bản từ PDF
async function extractPdfText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
    }

    return text;
}

//Hàm gọi API tóm tắt tài liệu
async function summarizeDocument() {
    const summaryLanguage = document.getElementById('summary-language').value;
    const modelSelect = document.getElementById('model-select').value;

    if (!fileContent) {
        showError('Please upload a document first.');
        return;
    }

    loadingDiv.style.display = 'block';
    summarizeBtn.style.display = 'none';
    summaryOutput.style.display = 'none';

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `As a professional document summarizer in ${summaryLanguage}, using a ${modelSelect} summary length, follow these guidelines:
                                1. Begin with a brief overview of the document's main topic
                                2. Identify and list key points in bullet format
                                3. Highlight important conclusions or recommendations
                                4. Structure the summary in clear sections: Overview, Key Points, Details, Conclusions
                                5. Maintain technical accuracy while making complex information accessible
                                6. Keep the summary concise but comprehensive
                                7. Do not use markdown like ### or italic or bold, whenever is a title, just write in all uppercase
                                8. Do not use asterisks (**) for bold text or any other formatting symbols.s`
                    },
                    {
                        role: "user",
                        content: `Please summarize the following document: ${fileContent}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate summary');
        }

        const data = await response.json();
        summaryOutput.value = data.choices[0].message.content;
        summaryOutput.style.display = 'block';
    } catch (error) {
        showError('Error generating summary. Please try again.');
        console.error(error);
    } finally {
        loadingDiv.style.display = 'none';
        summarizeBtn.style.display = 'block';
    }
}

// Hàm tóm tắt văn bản nhập vào
async function summarizeTextInput() {
    const textContent = document.getElementById('text-input').value;
    const summaryLanguage = document.getElementById('summary-language').value;
    const modelSelect = document.getElementById('model-select').value;

    if (!textContent.trim()) {
        showError1('Please enter some text to summarize.');
        return;
    }

    loadingDiv1.style.display = 'block';
    summarizeTextBtn.style.display = 'none';
    summaryOutput1.style.display = 'none';

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `As a professional document summarizerin ${summaryLanguage}, using a ${modelSelect} summary length, follow these guidelines:
                                  1. Begin with a brief overview of the main topic.
                                  2. Identify and list key points in bullet format.
                                  3. Highlight important conclusions or recommendations.
                                  4. Structure the summary in clear sections: Overview, Key Points, Details, Conclusions.
                                  5. Maintain technical accuracy while making complex information accessible.
                                  6. Keep the summary concise but comprehensive.
                                  7. Do not use markdown like ### or italic or bold, whenever is a title, just write in all uppercase
                                  8. Do not use asterisks (**) for bold text or any other formatting symbols.s`
                    },
                    {
                        role: "user",
                        content: `Please summarize the following text: ${textContent}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate summary');
        }

        const data = await response.json();
        summaryOutput1.value = data.choices[0].message.content;
        summaryOutput1.style.display = 'block';
    } catch (error) {
        showError1('Error generating summary. Please try again.');
        console.error(error);
    } finally {
        loadingDiv1.style.display = 'none';
        summarizeTextBtn.style.display = 'block';
    }
}


//Hàm hiển thị thông báo lỗi
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}
function showError1(message) {
    errorMessage1.textContent = message;
    errorMessage1.style.display = 'block';
}

//Gán sự kiện nút tóm tắt
summarizeBtn.addEventListener('click', summarizeDocument);
summarizeTextBtn.addEventListener('click', summarizeTextInput);
