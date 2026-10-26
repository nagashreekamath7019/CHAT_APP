import { create } from 'zustand';

// Safely load initial unread counts from localStorage
const getSavedUnread = () => {
    try {
        const saved = localStorage.getItem('unread_messages');
        return saved ? JSON.parse(saved) : {};
    } catch {
        return {};
    }
};

// Safely load cleared users list so a backend refresh won't resurrect cleared counts
export const getClearedUsers = () => {
    try {
        const saved = localStorage.getItem('cleared_unread_users');
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
};

const useConversation = create((set) => ({
    selectedConversation: null,
    setSelectedConversation: (selectedConversation) => set({ selectedConversation }),
    messages: [],
    setMessage: (messages) => set({ messages }),
    unreadMessages: getSavedUnread(),

    incrementUnread: (userId) => set((state) => {
        const updated = {
            ...state.unreadMessages,
            [userId]: (state.unreadMessages[userId] || 0) + 1,
        };
        localStorage.setItem('unread_messages', JSON.stringify(updated));

        // If the user was previously marked cleared, un-clear them because a new message arrived
        const cleared = getClearedUsers().filter(id => id !== userId);
        localStorage.setItem('cleared_unread_users', JSON.stringify(cleared));

        return { unreadMessages: updated };
    }),

    clearUnread: (userId) => set((state) => {
        const updated = {
            ...state.unreadMessages,
            [userId]: 0,
        };
        localStorage.setItem('unread_messages', JSON.stringify(updated));

        // Persist that this user's count has been read/cleared locally
        const cleared = Array.from(new Set([...getClearedUsers(), userId]));
        localStorage.setItem('cleared_unread_users', JSON.stringify(cleared));

        return { unreadMessages: updated };
    }),
}));

export default useConversation;