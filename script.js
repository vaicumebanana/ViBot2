const API_CONFIG = {
    baseURL: "https://api.groq.com",
    endpoint: "/v1/chat/completions",
    apiKey: "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",
    model: "llama3-70b-8192"
};

// Elementos do DOM
const elements = {
    chatbox: document.getElementById('chatbox'),
    userInput: document.getElementById('userInput'),
    sendButton: document.getElementById('sendButton')
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadConversation();
    elements.sendButton.addEventListener('click', sendMessage);
    elements.userInput.addEventListener('keypress', handleKeyPress);
});

// Função principal para enviar mensagem
async function sendMessage() {
    const userInput = elements.userInput.value.trim();
    if (!userInput) return;

    try {
        // Mostra mensagem do usuário imediatamente
        appendMessage(userInput, 'user');
        elements.userInput.value = '';
        elements.userInput.disabled = true;
        elements.sendButton.disabled = true;

        // Mostra indicador de digitação
        const typingIndicator = appendMessage('Digitando...', 'bot');
        
        // Obtém resposta do bot
        const botResponse = await getBotResponse(userInput);
        
        // Remove indicador e mostra resposta real
        elements.chatbox.removeChild(typingIndicator);
        typeWriterEffect(botResponse, 'bot');
        
        saveConversation();
    } catch (error) {
        appendMessage(`Erro: ${error.message}`, 'bot');
        console.error('Erro detalhado:', error);
    } finally {
        elements.userInput.disabled = false;
        elements.sendButton.disabled = false;
        elements.userInput.focus();
    }
}

// Manipulador de teclado
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Adiciona mensagem ao chat
function appendMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    messageElement.textContent = message;
    elements.chatbox.appendChild(messageElement);
    elements.chatbox.scrollTop = elements.chatbox.scrollHeight;
    return messageElement;
}

// Obtém resposta da API
async function getBotResponse(userInput) {
    const url = new URL(API_CONFIG.endpoint, API_CONFIG.baseURL).toString();
    
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_CONFIG.apiKey}`
        },
        body: JSON.stringify({
            messages: [{ role: "user", content: userInput }],
            model: API_CONFIG.model,
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 1,
            stream: false
        })
    };

    try {
        const response = await fetchWithTimeout(url, requestOptions, 30000); // 30s timeout
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `Erro HTTP ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.choices?.[0]?.message?.content) {
            throw new Error('Resposta da API em formato inesperado');
        }

        return data.choices[0].message.content;
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw new Error(`Não foi possível obter resposta: ${error.message}`);
    }
}

// Fetch com timeout
async function fetchWithTimeout(resource, options, timeout) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(resource, {
        ...options,
        signal: controller.signal
    });
    
    clearTimeout(id);
    return response;
}

// Efeito de máquina de escrever
function typeWriterEffect(text, sender) {
    const messageElement = appendMessage('', sender);
    let i = 0;
    const speed = 10; // ms por caractere

    return new Promise(resolve => {
        function type() {
            if (i < text.length) {
                messageElement.textContent += text.charAt(i);
                i++;
                elements.chatbox.scrollTop = elements.chatbox.scrollHeight;
                setTimeout(type, speed);
            } else {
                resolve();
            }
        }
        type();
    });
}

// Salva conversa no localStorage
function saveConversation() {
    const messages = Array.from(elements.chatbox.querySelectorAll('.message'))
        .map(msg => ({
            text: msg.textContent,
            sender: msg.classList.contains('user') ? 'user' : 'bot'
        }));
    
    try {
        localStorage.setItem('conversation', JSON.stringify(messages));
    } catch (e) {
        console.error('Erro ao salvar conversa:', e);
    }
}

// Carrega conversa do localStorage
function loadConversation() {
    try {
        const saved = localStorage.getItem('conversation');
        if (saved) {
            const conversation = JSON.parse(saved);
            conversation.forEach(msg => appendMessage(msg.text, msg.sender));
        }
    } catch (e) {
        console.error('Erro ao carregar conversa:', e);
        localStorage.removeItem('conversation');
    }
}
