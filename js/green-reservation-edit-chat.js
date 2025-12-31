document.addEventListener('DOMContentLoaded', function() {
    initChat();
});

// ==========================================
// 聊天室功能
// ==========================================
function initChat() {
    const chatInput = document.querySelector('.chat-input');
    const sendBtn = document.querySelector('.send-btn');
    const chatMessages = document.getElementById('chatMessages');

    if (!chatInput || !sendBtn || !chatMessages) return;

    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // 建立新訊息元素
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message message-right';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = text;
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'message-info';
        
        // 取得預約人姓名
        const contactPersonInput = document.getElementById('contactPerson');
        const contactName = contactPersonInput ? contactPersonInput.value : '住戶';
        
        // 取得目前時間
        const now = new Date();
        const timeString = now.getFullYear() + '/' + 
                          (now.getMonth() + 1).toString().padStart(2, '0') + '/' + 
                          now.getDate().toString().padStart(2, '0') + ' ' + 
                          now.getHours().toString().padStart(2, '0') + ':' + 
                          now.getMinutes().toString().padStart(2, '0');
        
        infoDiv.textContent = contactName + ' ' + timeString;

        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(infoDiv);
        
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
            e.preventDefault(); // 防止表單提交
            sendMessage();
        }
    });
}

function receiveMessage(text) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message message-left';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
