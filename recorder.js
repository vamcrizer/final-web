const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const audioPlayback = document.getElementById("audioPlayback");

let mediaRecorder;
let audioChunks = [];

startBtn.addEventListener("click", async () => {
    // Yêu cầu quyền truy cập microphone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.start();
    startBtn.disabled = true;
    stopBtn.disabled = false;

    // Lưu trữ dữ liệu khi ghi âm
    mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
        // Tạo Blob từ dữ liệu ghi âm
        const audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioPlayback.src = audioUrl;
        audioChunks = [];  // Reset dữ liệu sau khi ghi xong
    };
});

stopBtn.addEventListener("click", () => {
    mediaRecorder.stop();
    startBtn.disabled = false;
    stopBtn.disabled = true;
});