import React, { useEffect, useRef, useState } from 'react';
import userConversation from '../../Zustand/useConversation.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { PiChatsFill } from "react-icons/pi";
import { IoMdArrowRoundBack, IoMdClose } from "react-icons/io";
import axios from 'axios';
import { BiSolidSend } from "react-icons/bi";
import { useSocketContext } from '../../context/socketContext.jsx';
import notify from '../../assets/sound/notificationSound.mp3';
import { RiDeleteBin6Line } from "react-icons/ri"; 
import { toast } from 'react-toastify';

const MessageContainer = ({ onBackUser }) => {
  const { messages, selectedConversation, setMessage } = userConversation();
  const { socket } = useSocketContext();
  const { authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendData, setSendData] = useState("");
  const lastMessageRef = useRef();
  const { clearUnread } = userConversation();

  // --- BULK DELETE STATES ---
  const [selectedMessages, setSelectedMessages] = useState([]); 
  const [selectionMode, setSelectionMode] = useState(false);

  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  useEffect(() => {
    socket?.on("newMessage", (newMessage) => {
      const sound = new Audio(notify);
      sound.play();
      if (newMessage.senderId === selectedConversation?._id) {
        setMessage([...messages, newMessage]);
        clearUnread(newMessage.senderId);
      }
    });
    return () => socket?.off("newMessage");
  }, [socket, setMessage, messages, selectedConversation, clearUnread]);

  useEffect(() => {
    setTimeout(() => {
      lastMessageRef?.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages]);

  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/message/${selectedConversation?._id}`);
        setMessage(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    if (selectedConversation?._id) getMessages();
    cancelSelection(); // Reset selection when changing chats
  }, [selectedConversation?._id, setMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sendData.trim()) return;
    setSending(true);
    try {
      const res = await axios.post(`/api/message/send/${selectedConversation?._id}`, { messages: sendData });
      setMessage([...messages, res.data]);
      setSendData("");
    } catch (error) {
      console.log(error);
    } finally {
      setSending(false);
    }
  };

  // --- BULK DELETE LOGIC ---
  const handleSelect = (id) => {
    if (selectedMessages.includes(id)) {
      const newSelection = selectedMessages.filter(mId => mId !== id);
      setSelectedMessages(newSelection);
      if (newSelection.length === 0) setSelectionMode(false);
    } else {
      setSelectedMessages([...selectedMessages, id]);
    }
  };

  const cancelSelection = () => {
    setSelectionMode(false);
    setSelectedMessages([]);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedMessages.length} messages permanently?`)) return;

    try {
      await axios.delete(`/api/message/delete-bulk`, {
        data: { 
          messageIds: selectedMessages, 
          conversationId: selectedConversation._id 
        }
      });

      const filtered = messages.filter(msg => !selectedMessages.includes(msg._id));
      setMessage(filtered);
      toast.success("Messages deleted");
      cancelSelection();
    } catch (error) {
      toast.error("Failed to delete messages");
    }
  };

  return (
    <div className="md:min-w-125 h-[99%] flex flex-col py-2">
      {!selectedConversation ? (
        <div className='flex items-center justify-center w-full h-full'>
          <div className='px-4 text-center text-gray-950 font-semibold flex flex-col items-center gap-2'>
            <p className='text-2xl'>Welcome!!🙏 {authUser.fullname}😊 </p>
            <p className='text-lg'> Select a person to start messaging..</p>
            <PiChatsFill className='text-6xl' />
          </div>
        </div>
      ) : (
        <>
          {/* HEADER (Selection Mode aware) */}
          <div className={`flex justify-between gap-1 ml-2 md:px-2 rounded-lg h-10 md:h-12 transition-colors duration-300 ${selectionMode ? 'bg-gray-800' : 'bg-sky-600'}`}>
            {selectionMode ? (
              <div className='flex items-center justify-between w-full px-2 text-white'>
                <div className='flex items-center gap-4'>
                  <button onClick={cancelSelection}><IoMdClose size={24} /></button>
                  <span className='font-bold'>{selectedMessages.length} Selected</span>
                </div>
                <button onClick={handleBulkDelete} className='bg-red-600 p-2 rounded-full hover:bg-red-700 transition-colors'>
                  <RiDeleteBin6Line size={20} />
                </button>
              </div>
            ) : (
              <div className='flex gap-2 items-center w-full'>
                <div className='md:hidden ml-1'>
                  <button onClick={() => onBackUser(true)} className='bg-white rounded-full px-2 py-1'>
                    <IoMdArrowRoundBack size={25} />
                  </button>
                </div>
                <div className='flex gap-2 items-center'>
                  <img className='rounded-full w-8 h-8 md:w-10 md:h-10 object-cover' src={selectedConversation?.profilepic} alt="" />
                  <span className='text-gray-950 text-sm md:text-xl font-bold'>{selectedConversation?.fullname}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto px-4 select-none">
            {loading && <div className='flex justify-center mt-10'><div className='loading loading-spinner'></div></div>}
            {!loading && messages?.length === 0 && <p className='text-center text-white mt-4'><i>Start a Conversation..</i></p>}

            {!loading && messages?.length > 0 && messages.map((message, index) => {
              const currentDate = new Date(message.createdAt).toDateString();
              const previousDate = index > 0 ? new Date(messages[index - 1].createdAt).toDateString() : null;
              const showDateHeader = currentDate !== previousDate;
              const isSelected = selectedMessages.includes(message._id);

              return (
                <div key={message._id}>
                  {showDateHeader && (
                    <div className="flex justify-center my-4">
                      <span className="bg-gray-800 text-white text-[12px] px-3 py-1 rounded-md opacity-90">
                        {formatDateHeader(message.createdAt)}
                      </span>
                    </div>
                  )}
                  <div 
                    ref={index === messages.length - 1 ? lastMessageRef : null}
                    onClick={() => selectionMode && handleSelect(message._id)}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        setSelectionMode(true);
                        handleSelect(message._id);
                    }}
                    className={`chat transition-all duration-200 ${message.senderId === authUser._id ? 'chat-end' : 'chat-start'} ${isSelected ? 'opacity-50 scale-95' : ''}`}>
                    <div className={`chat-bubble max-w-[80%] cursor-pointer ${isSelected ? 'ring-4 ring-sky-400' : ''} ${message.senderId === authUser._id ? 'bg-sky-600 text-white' : 'bg-gray-200 text-black'}`}>
                      {message?.message}
                    </div>
                    <div className='chat-footer text-[10px] opacity-70 mt-1'>
                      {new Date(message?.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!selectionMode && (
            <form onSubmit={handleSubmit} className='p-2'>
              <div className='w-full rounded-full flex items-center bg-white border'>
                <input value={sendData} onChange={(e) => setSendData(e.target.value)} required type='text'
                  placeholder="Type a message..." className='w-full bg-transparent outline-none px-4 py-2 text-black' />
                <button type='submit' disabled={sending}>
                  {sending ? <div className='loading loading-spinner mx-2'></div> :
                    <BiSolidSend size={20} className='text-sky-700 bg-gray-800 w-10 h-10 p-2 m-1 rounded-full' />
                  }
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default MessageContainer;