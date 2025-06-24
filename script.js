const API_KEYS = [
    "6cc7e55d9b07491a90088bb0f35dadb0",
    "49ccca3884944148afe00d63da60a276",
    "6afe493cea54495db230e18139c6e3b5",
    "c16d5e174e494d0fa916ab4c25bc22d0"
];
const BASE_URL = "https://api.aimlapi.com";

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
    for (const API_KEY of API_KEYS) {
        try {
            // Obter a última resposta do bot
            const lastBotMessage = document.querySelector('.bot:last-child')?.textContent || '';

            const endpoint = '/v1/chat/completions'; // Ajuste o endpoint conforme a documentação
            const url = `${BASE_URL}${endpoint}`;

            console.log(`Sending request to ${url} with API Key: ${API_KEY}`); // Log the request URL and API Key

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: "mistralai/Mistral-7B-Instruct-v0.2",
                    messages: [
                        {
                            role: "system",
                            content: "You are a simple agent. You Just respond helping the user with his question."
                        },
                        {
                            role: "user",
                            content: userInput
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 256
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro na API: ${response.status} ${response.statusText}. Detalhes: ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            return data.choices[0].message.content; // Supondo que a resposta da API esteja em 'data.choices[0].message.content'
        } catch (error) {
            console.error(`Error with API Key ${API_KEY}:`, error.message);
            // Continue to the next API key
        }
    }
    throw new Error('All API keys have been tried and failed.');
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
