import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext.jsx';

const SocketContext = createContext();

export const useSocketContext = () => {
    return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const { authUser } = useAuth();

    // Dynamically choose backend URL based on environment or fallback to localhost
    const socketURL = import.meta.env.VITE_BACKEND_URL || `https://chatter-node-backend.onrender.com`;

    useEffect(() => {
        if (authUser) {
            const newSocket = io(socketURL, {
                query: {
                    userId: authUser?._id,
                },
                withCredentials: true,
            });

            setSocket(newSocket);

            newSocket.on("getOnlineUsers", (users) => {
                setOnlineUsers(users);
            });

            return () => {
                newSocket.close();
                setSocket(null);
            };
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [authUser]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};