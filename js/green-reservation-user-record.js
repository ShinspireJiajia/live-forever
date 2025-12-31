document.addEventListener('DOMContentLoaded', function() {
    initSignaturePad();
    initChat();
});

// ==========================================
// 簽名板功能
// ==========================================
function initSignaturePad() {
    const canvas = document.getElementById('signatureCanvas');
    const ctx = canvas.getContext('2d');
    const clearBtn = document.getElementById('clearSignature');
    const confirmBtn = document.getElementById('confirmSignature');
    const placeholder = document.querySelector('.signature-placeholder');
    let isDrawing = false;
    let hasSignature = false;

    // 設定 Canvas 大小
    function resizeCanvas() {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        ctx.scale(ratio, ratio);
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // 繪圖事件
    function startDrawing(e) {
        isDrawing = true;
        hasSignature = true;
        placeholder.style.display = 'none';
        draw(e);
    }

    function stopDrawing() {
        isDrawing = false;
        ctx.beginPath();
    }

    function draw(e) {
        if (!isDrawing) return;

        e.preventDefault(); // 防止觸控捲動

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    // 滑鼠事件
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseleave', stopDrawing);

    // 觸控事件
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchmove', draw);

    // 清除簽名
    clearBtn.addEventListener('click', function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 清除畫布時使用實際寬高
        placeholder.style.display = 'block';
        hasSignature = false;
    });

    // 確認簽名
    confirmBtn.addEventListener('click', function() {
        if (!hasSignature) {
            alert('請先進行簽名！');
            return;
        }
        // 這裡可以加入儲存簽名的邏輯，例如將 canvas 轉為 base64
        // const signatureData = canvas.toDataURL();
        alert('簽名已確認！');
    });
}

// ==========================================
// 聊天室功能
// ==========================================
function initChat() {
    const chatInput = document.querySelector('.chat-input');
    const sendBtn = document.querySelector('.send-btn');
    const chatMessages = document.getElementById('chatMessages');

    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // 建立新訊息元素
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message message-right';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = text;
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        
        // 取得目前時間
        const now = new Date();
        const timeString = now.getFullYear() + '/' + 
                          (now.getMonth() + 1).toString().padStart(2, '0') + '/' + 
                          now.getDate().toString().padStart(2, '0') + ' ' + 
                          now.getHours().toString().padStart(2, '0') + ':' + 
                          now.getMinutes().toString().padStart(2, '0');
        
        timeDiv.textContent = timeString;

        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);
        
        chatMessages.appendChild(messageDiv);
        
        // 捲動到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // 清空輸入框
        chatInput.value = '';

        // 模擬自動回覆 (可選)
        // setTimeout(() => {
        //     receiveMessage("收到您的訊息，我們會盡快處理。");
        // }, 1000);
    }

    sendBtn.addEventListener('click', sendMessage);
    
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

function receiveMessage(text) {
    const chatMessages = document.getElementById('chatMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message message-left';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
