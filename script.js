const API_CONFIG = {
    baseURL: "https://api.groq.com/openai",
    apiKey: "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",
    endpoint: "/v1/chat/completions"
};

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
        const { baseURL, apiKey, endpoint } = API_CONFIG;
        const url = `${baseURL}${endpoint}`;

        console.log(`Sending request to ${url} with API Key: ${apiKey}`); // Log the request URL and API Key

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "user",
                        content: userInput
                    }
                ],
                model: "meta-llama/llama-4-scout-17b-16e-instruct", // Modelo correto
                temperature: 1.77,
                max_tokens: 8192,
                top_p: 1,
                stream: true,
                stop: null
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`API Error: ${response.status} ${response.statusText}. Details: ${JSON.stringify(errorData)}`);
            throw new Error(`Erro na API: ${response.status} ${response.statusText}. Detalhes: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        console.log('API Response:', data);
        return data.choices[0].message.content; // Supondo que a resposta da API esteja em 'data.choices[0].message.content'
    } catch (error) {
        console.error(`Error with API Config ${baseURL} and API Key ${apiKey}:`, error.message);
        throw error;
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
