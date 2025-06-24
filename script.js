const API_KEY = "6cc7e55d9b07491a90088bb0f35dadb0";
const BASE_URL = "https://api.aimlapi.com/v1";

document.addEventListener('DOMContentLoaded', () => {
    loadConversation();
});

async function sendMessage() {
    const userInput = document.getElementById('userInput').value.trim();
    if (!userInput) return;

    appendMessage(userInput, 'user');
    document.getElementById('userInput').value = '';

    try {
        const botResponse = await getBotResponse(userInput);
        appendMessage(botResponse, 'bot');
        saveConversation();
    } catch (error) {
        appendMessage("Erro: " + error.message, 'bot');
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function appendMessage(message, sender) {
    const chatbox = document.getElementById('chatbox');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = message;
    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight;
}

async function getBotResponse(userInput) {
    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                prompt: userInput
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro na API: ${response.status} ${response.statusText}. Detalhes: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        return data.reply; // Supondo que a resposta da API esteja em 'data.reply'
    } catch (error) {
        throw new Error(`Erro ao obter resposta da API: ${error.message}`);
    }
}

function saveConversation() {
    const messages = Array.from(document.querySelectorAll('.chatbox .message'))
        .map(msg => ({ text: msg.textContent, sender: msg.classList.contains('user') ? 'user' : 'bot' }));
    localStorage.setItem('conversation', JSON.stringify(messages));
}

function loadConversation() {
    const conversation = JSON.parse(localStorage.getItem('conversation')) || [];
    conversation.forEach(msg => appendMessage(msg.text, msg.sender));
}
