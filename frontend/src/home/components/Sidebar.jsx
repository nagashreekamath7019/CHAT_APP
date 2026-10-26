import React, { useEffect, useState, useMemo } from 'react';
import { RiUserSearchLine } from "react-icons/ri";
import { IoArrowBackCircle, IoEllipsisVertical } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { RiChatDeleteFill } from "react-icons/ri";
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BiLogOutCircle } from "react-icons/bi";
import useConversation, { getClearedUsers } from '../../Zustand/useConversation.js';
import { useSocketContext } from '../../context/socketContext.jsx';
import Logo from '../../assets/logo.png';

const Sidebar = ({ onSelectUser }) => {
    const navigate = useNavigate();
    const { authUser, setAuthUser } = useAuth();
    const { onlineUsers, socket } = useSocketContext();

    const [searchInput, setSearchInput] = useState('');
    const [searchUser, setSearchUser] = useState([]);
    const [chatUser, setChatUser] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

    const { 
        setSelectedConversation, 
        selectedConversation, 
        unreadMessages, 
        incrementUnread, 
        clearUnread, 
        setMessage 
    } = useConversation();

    // Reorder sidebar list in real time when any message arrives (new or existing user)
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = async (newMessage) => {
            const senderId = newMessage.senderId;
            const receiverId = newMessage.receiverId;
            if (!senderId) return;

            const partnerId = senderId === authUser?._id ? receiverId : senderId;

            // Check if user already exists in current list
            const existingUser = chatUser.find(u => u?._id === partnerId);

            if (existingUser) {
                // Move existing chatter directly to top
                setChatUser((prev) => {
                    const remaining = prev.filter(u => u?._id !== partnerId);
                    return [existingUser, ...remaining];
                });
            } else {
                // Fetch the new user profile and put them at the top
                try {
                    const res = await axios.get(`${backendURL}/api/user/${partnerId}`, {
                        withCredentials: true,
                    });
                    if (res.data) {
                        setChatUser((prev) => {
                            const filtered = prev.filter(u => u?._id !== partnerId);
                            return [res.data, ...filtered];
                        });
                    }
                } catch (err) {
                    console.error("Error fetching new chat partner details:", err);
                }
            }

            // Increment unread count if message is from the other person and chat is not currently open
            if (senderId !== authUser?._id && selectedConversation?._id !== senderId) {
                incrementUnread(senderId);
            }
        };

        socket.on("newMessage", handleNewMessage);
        return () => socket.off("newMessage", handleNewMessage);
    }, [socket, selectedConversation, incrementUnread, backendURL, authUser, chatUser]);

    // Initial fetch of current chatters with persistent unread check
    useEffect(() => {
        const chatUserHandler = async () => {
            setLoading(true);
            try {
                const chatters = await axios.get(`${backendURL}/api/user/currentchatters`, {
                    withCredentials: true,
                });
                const fetchedUsers = Array.isArray(chatters.data) ? chatters.data : [];
                const clearedList = getClearedUsers();

                // Prevent backend unread counts from reviving already opened chats
                const sanitizedUsers = fetchedUsers.map(user => {
                    if (clearedList.includes(user._id)) {
                        return { ...user, unreadCount: 0 };
                    }
                    return user;
                });

                setChatUser(sanitizedUsers);
            } catch (error) {
                console.error("currentchatters error:", error);
                setChatUser([]);
            } finally {
                setLoading(false);
            }
        };
        chatUserHandler();
    }, [backendURL]);

    const handleUserClick = (user) => {
        onSelectUser(user);
        setSelectedConversation(user);
        clearUnread(user._id);

        // Move the clicked conversation to the top immediately & reset unread count
        setChatUser((prev) => {
            const remaining = prev.filter((u) => u._id !== user._id);
            const activeUser = { ...user, unreadCount: 0 };
            return [activeUser, ...remaining];
        });
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        if (!searchInput.trim()) return;
        setLoading(true);
        setIsSearching(true);
        try {
            const search = await axios.get(`${backendURL}/api/user/search?search=${encodeURIComponent(searchInput.trim())}`, {
                withCredentials: true
            });
            const results = search.data || [];
            setSearchUser(results);
            if (results.length === 0) {
                toast.error("User not found");
            }
        } catch (error) {
            console.error("Search API error:", error);
            setSearchUser([]); 
            toast.error(error.response?.data?.message || error.response?.data?.error || "Error searching for users");
        } finally {
            setLoading(false);
        }
    };

    const handleLocalClear = (userId) => {
        setChatUser(prev => prev.filter(u => u?._id !== userId));
        if (selectedConversation?._id === userId) {
            setSelectedConversation(null);
            setMessage([]);
        }
        toast.info("Chat removed from view.");
    };

    const handleLogOut = async () => {
        setLoading(true);
        try {
            await axios.post(`${backendURL}/api/auth/logout`, {}, {
                withCredentials: true
            });
            localStorage.removeItem('chat_app');
            localStorage.removeItem('unread_messages');
            localStorage.removeItem('cleared_unread_users');
            setAuthUser(null);
            navigate('/login');
            toast.success("Logged out successfully");
        } catch (error) {
            toast.error("Logout failed");
            console.error(error);
        } finally {
            setLoading(false);
            setIsModalOpen(false);
        }
    };

    const UserListItem = ({ user }) => {
        const isOnline = onlineUsers?.includes(user?._id);
        const isSelected = selectedConversation?._id === user?._id;
        const [showMenu, setShowMenu] = useState(false);

        const count = useMemo(() => {
            if (isSelected) return 0;
            if (unreadMessages[user?._id] !== undefined) {
                return unreadMessages[user?._id];
            }
            const clearedList = getClearedUsers();
            if (clearedList.includes(user?._id)) return 0;
            return user?.unreadCount || 0;
        }, [unreadMessages, user?._id, user?.unreadCount, isSelected]);

        if (!user) return null;

        return (
            <div className='relative group'>
                <div
                    onClick={() => handleUserClick(user)}
                    className={`flex gap-3 items-center rounded p-2 py-2 cursor-pointer transition-all ${isSelected ? 'bg-sky-500 text-white' : 'hover:bg-gray-200'}`}
                >
                    <div className='relative'>
                        <div className='w-10 h-10 rounded-full border border-gray-300 overflow-hidden'>
                            <img src={user.profilepic} alt="profile" className="object-cover w-full h-full" />
                        </div>
                        {isOnline && <span className='absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white'></span>}
                    </div>

                    <div className='flex flex-col flex-1'>
                        <div className='flex justify-between items-center'>
                            <p className={`font-bold ${isSelected ? 'text-white' : 'text-gray-950'}`}>{user.username || user.fullname}</p>
                            <div className='flex items-center gap-2'>
                                {count > 0 && !isSelected && (
                                    <span className='bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full'>
                                        {count}
                                    </span>
                                )}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                                    className={`p-1 rounded-full ${isSelected ? 'text-white' : 'text-gray-500 hover:bg-gray-300'}`}
                                >
                                    <IoEllipsisVertical size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {showMenu && (
                    <div className='absolute right-2 top-10 z-50 bg-white border border-gray-200 shadow-xl rounded-lg py-1 w-48 text-sm'>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleLocalClear(user._id); setShowMenu(false); }}
                            className='flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100'
                        >
                            <RiChatDeleteFill size={18} /> Clear from View
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className='h-full w-full flex flex-col px-1 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0'>
            <div className='flex justify-between gap-2 p-2'>
                <form onSubmit={handleSearchSubmit} className='w-full flex items-center justify-between bg-white rounded-full shadow-sm'>
                    {isSearching && (
                        <div onClick={() => { setIsSearching(false); setSearchInput(""); setSearchUser([]); }} className='pl-3 cursor-pointer text-gray-600 hover:text-sky-500 transition-colors'>
                            <IoArrowBackCircle size={25} />
                        </div>
                    )}
                    
                    <div className='relative flex-1 flex items-center'>
                        <input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            type="text"
                            className='pl-4 pr-10 py-2 w-full bg-transparent outline-none text-black placeholder:text-gray-500 text-sm'
                            placeholder='Search User...'
                        />
                        {searchInput && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchInput("");
                                    setSearchUser([]);
                                    setIsSearching(false);
                                }}
                                className='absolute right-2 text-gray-400 hover:text-gray-700 p-1 cursor-pointer z-10'
                            >
                                <IoMdClose size={20} />
                            </button>
                        )}
                    </div>

                    <button type='submit' className='btn btn-circle btn-sm bg-sky-600 hover:bg-gray-950 border-none m-1 shrink-0'>
                        <RiUserSearchLine color='white' size={18} />
                    </button>
                </form>
                <img onClick={() => navigate(`/profile/${authUser?._id}`)} src={authUser?.profilepic} className='self-center h-10 w-10 hover:scale-110 transition-transform cursor-pointer rounded-full border-2 border-sky-500 object-cover' alt="my profile" />
            </div>

            <div className='divider px-3 my-1'></div>

            <div className='flex-1 overflow-y-auto px-2'>
                {loading ? (
                    <div className='flex justify-center mt-10'><span className="loading loading-spinner text-sky-500"></span></div>
                ) : (
                    <div className='w-full'>
                        {isSearching ? (
                            searchUser.length > 0 ? (
                                searchUser
                                    .filter(user => user !== null)
                                    .map((user) => <UserListItem key={user._id} user={user} />)
                            ) : (
                                <div className='flex flex-col items-center justify-center mt-10 opacity-60'>
                                    <p className='text-red-800 font-semibold'>User not found!</p>
                                </div>
                            )
                        ) : (
                            chatUser && chatUser
                                .filter(user => user !== null)
                                .map((user, index) => (
                                    <React.Fragment key={user._id}>
                                        <UserListItem user={user} />
                                        {index < chatUser.length - 1 && <div className='divider px-2 my-1 opacity-50' />}
                                    </React.Fragment>
                                ))
                        )}
                    </div>
                )}
            </div>

            {!isSearching && (
                <div className='mt-auto p-3 flex items-center gap-2 border-t border-gray-200/50'>
                    <button onClick={() => setIsModalOpen(true)} className='flex items-center justify-center bg-gray-800 hover:bg-black w-10 h-10 rounded-full cursor-pointer text-white transition-all shadow-md'>
                        <BiLogOutCircle size={24} />
                    </button>
                    <p className='text-sm font-medium text-gray-700'>Logout</p>
                </div>
            )}

            {isModalOpen && (
                <div className='fixed inset-0 flex items-center justify-center z-100 p-4'>
                    <div className='bg-white p-6 rounded-3xl shadow-2xl text-center max-w-sm w-full'>
                        <h2 className='text-xl font-bold mb-4 text-gray-800'>Confirm Logout</h2>
                        <p className='text-gray-600 mb-6 text-sm'>Are you sure you want to Logout?</p>
                        <div className='flex justify-center gap-3'>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className='flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-colors text-sm'
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleLogOut}
                                className='flex-1 px-4 py-3 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-colors shadow-lg shadow-red-200 text-sm'
                            >
                                {loading ? <span className="loading loading-spinner loading-xs"></span> : "Logout"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;