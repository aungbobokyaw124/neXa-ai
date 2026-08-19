const STORAGE_KEYS = {
    CHATS: 'nexa_chats',
    CURRENT_CHAT: 'nexa_current_chat',
    SETTINGS: 'nexa_settings'
};

export const Storage = {
    getChats() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.CHATS);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    saveChats(chats) {
        localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
    },

    getCurrentChatId() {
        return localStorage.getItem(STORAGE_KEYS.CURRENT_CHAT);
    },

    setCurrentChatId(id) {
        if (id) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_CHAT, id);
        } else {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_CHAT);
        }
    },

    getSettings() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            return data ? JSON.parse(data) : { theme: 'dark' };
        } catch {
            return { theme: 'dark' };
        }
    },

    saveSettings(settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    },

    clearAll() {
        localStorage.removeItem(STORAGE_KEYS.CHATS);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_CHAT);
    }
};
