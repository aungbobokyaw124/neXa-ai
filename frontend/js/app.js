import { Storage } from './storage.js';
import { UI } from './ui.js';
import { ChatAPI } from './chat.js';

let chats = [];
let currentChatId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Hide preloader
    setTimeout(() => UI.hidePreloader(), 600);

    // Load Settings
    const settings = Storage.getSettings();
    UI.setTheme(settings.theme);
    document.getElementById('setting-theme').value = settings.theme;

    // Load Chats
    chats = Storage.getChats();
    currentChatId = Storage.getCurrentChatId();

    if (currentChatId && chats.some(c => c.id === currentChatId)) {
        loadChat(currentChatId);
    } else {
        startNewChat();
    }

    setupEventListeners();
});

function setupEventListeners() {
    // Sidebar toggle
    document.getElementById('sidebar-toggle').addEventListener('click', () => UI.toggleSidebar(true));
    document.getElementById('sidebar-close').addEventListener('click', () => UI.toggleSidebar(false));
    document.getElementById('sidebar-backdrop').addEventListener('click', () => UI.toggleSidebar(false));

    // New Chat
    document.getElementById('new-chat-btn').addEventListener('click', () => {
        startNewChat();
        UI.toggleSidebar(false);
    });

    // Theme Toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
        const current = Storage.getSettings();
        const newTheme = current.theme === 'dark' ? 'light' : 'dark';
        Storage.saveSettings({ ...current, theme: newTheme });
        UI.setTheme(newTheme);
        document.getElementById('setting-theme').value = newTheme;
    });

    // Modals
    document.getElementById('settings-btn').addEventListener('click', () => {
        document.getElementById('settings-modal').classList.remove('hidden');
        UI.toggleSidebar(false);
    });
    document.getElementById('settings-close').addEventListener('click', () => {
        document.getElementById('settings-modal').classList.add('hidden');
    });

    document.getElementById('about-btn').addEventListener('click', () => {
        document.getElementById('about-modal').classList.remove('hidden');
        UI.toggleSidebar(false);
    });
    document.getElementById('about-close').addEventListener('click', () => {
        document.getElementById('about-modal').classList.add('hidden');
    });

    document.getElementById('setting-theme').addEventListener('change', (e) => {
        const newTheme = e.target.value;
        const current = Storage.getSettings();
        Storage.saveSettings({ ...current, theme: newTheme });
        UI.setTheme(newTheme);
    });

    document.getElementById('clear-all-chats').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete all conversations?')) {
            Storage.clearAll();
            chats = [];
            startNewChat();
            document.getElementById('settings-modal').classList.add('hidden');
        }
    });

    // Search
    document.getElementById('search-input').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = chats.filter(c => 
            c.title.toLowerCase().includes(query) || 
            c.messages.some(m => m.content.toLowerCase().includes(query))
        );
        UI.renderChatHistory(filtered, currentChatId, selectChat, deleteChat);
    });

    // Suggestion Cards
    document.querySelectorAll('.suggestion-card').forEach(card => {
        card.addEventListener('click', () => {
            const prompt = card.getAttribute('data-prompt');
            const input = document.getElementById('message-input');
            input.value = prompt + ' ';
            input.focus();
            autoResizeInput(input);
            checkSendButton();
        });
    });

    // Composer Input
    const input = document.getElementById('message-input');
    input.addEventListener('input', () => {
        autoResizeInput(input);
        checkSendButton();
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    document.getElementById('send-btn').addEventListener('click', handleSend);
}

function autoResizeInput(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
}

function checkSendButton() {
    const input = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    sendBtn.disabled = input.value.trim().length === 0;
}

function startNewChat() {
    currentChatId = null;
    Storage.setCurrentChatId(null);
    UI.showWelcomeScreen(true);
    UI.renderChatHistory(chats, currentChatId, selectChat, deleteChat);
    document.getElementById('current-chat-title').textContent = 'neXa AI';
    document.getElementById('message-input').value = '';
    checkSendButton();
}

function selectChat(id) {
    currentChatId = id;
    Storage.setCurrentChatId(id);
    loadChat(id);
    UI.toggleSidebar(false);
}

function loadChat(id) {
    const chat = chats.find(c => c.id === id);
    if (!chat) return;

    document.getElementById('current-chat-title').textContent = chat.title;
    UI.showWelcomeScreen(false);
    UI.renderMessages(chat.messages);
    UI.renderChatHistory(chats, currentChatId, selectChat, deleteChat);
}

function deleteChat(id) {
    chats = chats.filter(c => c.id !== id);
    Storage.saveChats(chats);
    if (currentChatId === id) {
        startNewChat();
    } else {
        UI.renderChatHistory(chats, currentChatId, selectChat, deleteChat);
    }
}

async function handleSend() {
    const input = document.getElementById('message-input');
    const content = input.value.trim();
    if (!content) return;

    input.value = '';
    input.style.height = 'auto';
    checkSendButton();

    let chat = chats.find(c => c.id === currentChatId);
    if (!chat) {
        chat = {
            id: 'chat_' + Date.now(),
            title: content.length > 30 ? content.substring(0, 30) + '...' : content,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            messages: []
        };
        chats.unshift(chat);
        currentChatId = chat.id;
        Storage.setCurrentChatId(chat.id);
        UI.showWelcomeScreen(false);
    }

    const userMessage = { id: 'msg_' + Date.now(), role: 'user', content, timestamp: Date.now() };
    chat.messages.push(userMessage);
    chat.updatedAt = Date.now();
    Storage.saveChats(chats);

    UI.renderMessages(chat.messages);
    UI.renderChatHistory(chats, currentChatId, selectChat, deleteChat);
    UI.setComposerLoading(true);

    try {
        const apiMessages = chat.messages.map(m => ({ role: m.role, content: m.content }));
        const reply = await ChatAPI.sendMessage(apiMessages);

        const assistantMessage = { id: 'msg_' + Date.now(), role: 'assistant', content: reply, timestamp: Date.now() };
        chat.messages.push(assistantMessage);
        chat.updatedAt = Date.now();
        Storage.saveChats(chats);

        UI.renderMessages(chat.messages);
    } catch (error) {
        const errorMessage = { id: 'msg_' + Date.now(), role: 'assistant', content: 'Error: ' + error.message, timestamp: Date.now() };
        chat.messages.push(errorMessage);
        UI.renderMessages(chat.messages);
    } finally {
        UI.setComposerLoading(false);
    }
}
