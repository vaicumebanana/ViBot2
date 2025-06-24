const API_CONFIG = {
    URLofAPI: "https://api.groq.com/openai",
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
        typeWriterEffect(botResponse, 'bot');
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
        const url = `${API_CONFIG.URLofAPI}${API_CONFIG.endpoint}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "user",
                        content: userInput
                    }
                ],
                model: "llama3-70b-8192",
                temperature: 0.7,
                max_tokens: 1024,
                top_p: 1,
                stream: false,
                stop: null
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response:', errorData);
            throw new Error(errorData.error?.message || 'Erro desconhecido na API');
        }

        const data = await response.json();
        console.log('API Response:', data);

        // Ajuste para a estrutura de resposta da Groq API
        if (data.choices && data.choices[0]?.message?.content) {
            return data.choices[0].message.content;
        } else {
            throw new Error('Resposta da API não contém conteúdo válido');
        }
    } catch (error) {
        console.error('Error fetching bot response:', error);
        throw new Error('Falha ao obter resposta do bot: ' + error.message);
    }
}

function saveConversation() {
    const messages = Array.from(document.querySelectorAll('#chatbox .message'))
        .map(msg => ({
            text: msg.textContent,
            sender: msg.classList.contains('user') ? 'user' : 'bot'
        }));
    localStorage.setItem('conversation', JSON.stringify(messages));
}

function loadConversation() {
    const saved = localStorage.getItem('conversation');
    if (!saved) return;
    
    try {
        const conversation = JSON.parse(saved);
        conversation.forEach(msg => appendMessage(msg.text, msg.sender));
    } catch (e) {
        console.error('Error loading conversation:', e);
        localStorage.removeItem('conversation');
    }
}

function typeWriterEffect(text, sender) {
    const chatbox = document.getElementById('chatbox');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    chatbox.appendChild(messageElement);

    let i = 0;
    const speed = 10; // velocidade da digitação (ms por caractere)

    function type() {
        if (i < text.length) {
            messageElement.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
            chatbox.scrollTop = chatbox.scrollHeight;
        }
    }
    
    type();
}
