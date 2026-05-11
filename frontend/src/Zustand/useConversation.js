import { create } from 'zustand';

const userConversation = create((set) => ({
    selectedConversation: null,
    setSelectedConversation: (selectedConversation) => set({ selectedConversation }),
    messages: [],
    setMessage: (messages) => set({ messages }),
    unreadMessages: {},
    incrementUnread: (userId) => set((state) => ({
        unreadMessages: {
            ...state.unreadMessages,
            [userId]:(state.unreadMessages[userId] || 0) +1 

        }
    })),
    clearUnread:(userId)=>set((state)=>({unreadMessages:{
        ...state.unreadMessages,
        [userId]:0
    }})),

}));

export default userConversation;