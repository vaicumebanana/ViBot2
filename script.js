const API_KEYS = [
"6cc7e55d9b07491a90088bb0f35dadb0",
"49ccca3884944148afe00d63da60a276",
"6afe493cea54495db230e18139c6e3b5",
"c16d5e174e494d0fa916ab4c25bc22d0"
];

const BASE_URL = "https://api.aimlapi.com";

document.addEventListener('DOMContentLoaded', () => {
loadConversation();
document.getElementById('userInput').addEventListener('keypress', handleKeyPress);

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
appendMessage("Error: " + error.message, 'bot');
}
}

function handleKeyPress(event) {
if (event.key === 'Enter') {
event.preventDefault();
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
  const lastBotMessage = document.querySelector('.bot:last-child')?.textContent || '';

  const endpoint = '/v1/chat/completions';
  const url = `${BASE_URL}${endpoint}`;

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
          content: "You are a simple agent. You just respond helping the user with their question."
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
    throw new Error(`API error: ${response.status} ${response.statusText}. Details: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  console.log("API Response:", data);

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('Empty response from the model.');
  }

  return content;
} catch (error) {
  console.error(`Error with API Key ${API_KEY}:`, error.message);
  // Try next key
}
}

throw new Error('All API keys failed or exhausted. Please try again later.');
}

function saveConversation() {
const messages = Array.from(document.querySelectorAll('#chatbox .message')).map(msg => ({

text: msg.textContent,
sender: msg.classList.contains('user') ? 'user' : 'bot'
}));
localStorage.setItem('conversation', JSON.stringify(messages));
}

function loadConversation() {
const conversation = JSON.parse(localStorage.getItem('conversation')) || [];
conversation.forEach(msg => appendMessage(msg.text, msg.sender));
}
