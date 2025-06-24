const API_KEYS = [
    "AIzaSyD-YepsfylqOChcTHi-7GiIbzSP0Lj-oFk",
    "AIzaSyCUu44sgw3iE_o_8Q3WyILNhQk1trtQVKw",
    "AIzaSyCpseaK6lq5-EA0R5yOraAg_pasMZIbX8M"
];
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEYS}";

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
        appendMessage("Desculpe, não foi possível obter uma resposta do bot. Verifique sua conexão ou tente novamente mais tarde.", 'bot');
        console.error(error);
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
    let errorOccurred = true;
    let responseText = "";

    for (let i = 0; i < API_KEYS.length; i++) {
        try {
            const apiKey = API_KEYS[i];
            const url = `${BASE_URL}?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: {
                        text: userInput
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Erro na API com chave ${apiKey}: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            responseText = data.candidates[0].content.parts[0].text;
            errorOccurred = false;
            break;
        } catch (error) {
            console.error(`Tentativa com chave ${API_KEYS[i]} falhou:`, error);
        }
    }

    if (errorOccurred) {
        throw new Error("Todas as chaves de API falharam.");
    }

    return responseText;
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
