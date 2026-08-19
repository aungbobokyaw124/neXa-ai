export const ChatAPI = {
    async sendMessage(messages) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messages })
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Unable to contact AI service.');
            }

            return data.message;
        } catch (error) {
            throw error;
        }
    }
};
