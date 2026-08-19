export const UI = {
    hidePreloader() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            setTimeout(() => preloader.remove(), 400);
        }
    },

    toggleSidebar(open) {
        const sidebar = document.getElementById('sidebar');
        const backdrop = document.getElementById('sidebar-backdrop');
        if (open) {
            sidebar.classList.add('open');
            backdrop.classList.add('open');
        } else {
            sidebar.classList.remove('open');
            backdrop.classList.remove('open');
        }
    },

    setTheme(theme) {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    },

    showWelcomeScreen(show) {
        const welcome = document.getElementById('welcome-screen');
        const messagesList = document.getElementById('messages-list');
        if (show) {
            welcome.classList.remove('hidden');
            messagesList.classList.add('hidden');
        } else {
            welcome.classList.add('hidden');
            messagesList.classList.remove('hidden');
        }
    },

    renderChatHistory(chats, currentChatId, onSelect, onDelete) {
        const list = document.getElementById('chat-history-list');
        list.innerHTML = '';

        if (chats.length === 0) {
            list.innerHTML = '<div style="font-size:12px; color:var(--text-secondary); padding:8px 0;">No recent conversations</div>';
            return;
        }

        chats.forEach(chat => {
            const item = document.createElement('div');
            item.className = `history-item ${chat.id === currentChatId ? 'active' : ''}`;
            
            const titleSpan = document.createElement('span');
            titleSpan.className = 'history-item-title';
            titleSpan.textContent = chat.title || 'New Conversation';
            titleSpan.addEventListener('click', () => onSelect(chat.id));

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'history-delete';
            deleteBtn.textContent = '🗑️';
            deleteBtn.title = 'Delete chat';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                onDelete(chat.id);
            });

            item.appendChild(titleSpan);
            item.appendChild(deleteBtn);
            list.appendChild(item);
        });
    },

    renderMessages(messages, onRegenerate) {
        const list = document.getElementById('messages-list');
        list.innerHTML = '';

        messages.forEach((msg, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = `message ${msg.role}`;

            const bubble = document.createElement('div');
            bubble.className = 'message-bubble';
            bubble.textContent = msg.content; // Basic clean rendering to avoid XSS

            wrapper.appendChild(bubble);

            if (msg.role === 'assistant') {
                const actions = document.createElement('div');
                actions.className = 'message-actions';

                const copyBtn = document.createElement('button');
                copyBtn.className = 'action-btn';
                copyBtn.textContent = 'Copy';
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(msg.content);
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => copyBtn.textContent = 'Copy', 2000);
                });

                actions.appendChild(copyBtn);
                wrapper.appendChild(actions);
            }

            list.appendChild(wrapper);
        });

        const container = document.getElementById('chat-container');
        container.scrollTop = container.scrollHeight;
    },

    setComposerLoading(isLoading) {
        const input = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-btn');
        if (isLoading) {
            input.disabled = true;
            sendBtn.disabled = true;
        } else {
            input.disabled = false;
            sendBtn.disabled = input.value.trim().length === 0;
            input.focus();
        }
    }
};
