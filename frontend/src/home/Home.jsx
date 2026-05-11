import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import MessageContainer from './components/MessageContainer.jsx';
import Sidebar from './components/Sidebar.jsx';

const Home = () => {

    const [selectedUser, setSelectedUser] = useState(null);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setIsSidebarVisible(false);
    }
    const handleShowSidebar = () => {
        setIsSidebarVisible(true);
        setSelectedUser(null);
    }

    const { authUser } = useAuth();
    return (
        <div className='flex justify-between min-w-full 
       md:min-w-150
       md:max-[65%] px-2 h-[80%]
        md:h-full rounded-xl shadow-lg bg-white/20 backdrop-blur-md border border-white/10'>
            <div className={`w-full py-2 md: flex ${isSidebarVisible ? '' : 'hidden md:block'}`}>
                <Sidebar onSelectUser={handleUserSelect} />
            </div>
            <div className={`divider divider-horizontal px-3 md:flex ${isSidebarVisible ? '' : 'hidden'} 
            ${selectedUser ? 'block' : 'hidden'}`}></div>
            <div className={`flex-auto ${selectedUser ? '' : 'hidden md:flex'}`}>
                <MessageContainer onBackUser={handleShowSidebar} />
            </div>
        </div>
    )
}

export default Home