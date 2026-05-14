import React, { useState } from 'react'; // Added useState import
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack } from "react-icons/io";
import { BiLogOutCircle } from "react-icons/bi";
import axios from 'axios';
import { toast } from 'react-toastify';

const Profile = () => {
    const { authUser, setAuthUser } = useAuth();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

    const handleLogOut = async () => {
        setLoading(true);
        try {
            await axios.post(`/api/auth/logout`);
            localStorage.removeItem('chat_app');
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

    return (
        <div className='flex flex-col items-center justify-center min-w-full h-screen p-4'>
            <div className='w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden backdrop-filter backdrop-blur-lg bg-opacity-90'>
                {/* Header with Back Button */}
                <div className='flex items-center p-6 bg-sky-600 text-white'>
                    <button
                        onClick={() => navigate(-1)}
                        className='hover:bg-sky-700 p-2 rounded-full transition-colors'
                    >
                        <IoMdArrowRoundBack size={24} />
                    </button>
                    <h2 className='text-xl font-bold ml-4'>My Profile</h2>
                </div>

                {/* Profile Content */}
                <div className='flex flex-col items-center p-8'>
                    <div className='relative group'>
                        <div className='w-32 h-32 rounded-full overflow-hidden border-4 border-sky-500 shadow-lg'>
                            <img
                                src={authUser?.profilepic}
                                alt="Profile"
                                className='w-full h-full object-cover'
                            />
                        </div>
                    </div>

                    <div className='mt-6 text-center space-y-2'>
                        <h1 className='text-2xl font-bold text-gray-900'>{authUser?.fullname}</h1>
                        <p className='text-sky-600 font-medium'>@{authUser?.username}</p>
                    </div>

                    {/* Stats or Info Section */}
                    <div className='w-full mt-8 grid grid-cols-1 gap-4'>
                        <div className='bg-gray-50 p-4 rounded-2xl border border-gray-100'>
                            <p className='text-xs text-gray-500 uppercase tracking-wider font-bold'>Account ID</p>
                            <p className='text-sm text-gray-700 truncate'>{authUser?._id}</p>
                        </div>

                        <div className='bg-gray-50 p-4 rounded-2xl border border-gray-100'>
                            <p className='text-xs text-gray-500 uppercase tracking-wider font-bold'>Status</p>
                            <div className='flex items-center gap-2'>
                                <span className='h-2 w-2 rounded-full bg-green-500'></span>
                                <p className='text-sm text-gray-700 font-medium'>Active</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className='w-full mt-8 flex flex-col gap-3'>
                        <button
                            onClick={() => setIsModalOpen(true)} // Opens the modal instead of logging out instantly
                            className='flex items-center justify-center gap-2 w-full py-3 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-colors border border-red-100'
                        >
                            <BiLogOutCircle size={25} />
                            Logout 
                        </button>
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {isModalOpen && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white p-6 rounded-3xl shadow-2xl text-center max-w-sm w-full'>
                        <h2 className='text-xl font-bold mb-4 text-gray-800'>Confirm Logout</h2>
                        <p className='text-gray-600 mb-6'>Are you sure you want to Logout?</p>
                        <div className='flex justify-center gap-3'>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className='flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-colors'
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleLogOut}
                                className='flex-1 px-4 py-3 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-colors shadow-lg shadow-red-200'
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <p className='mt-6 text-gray-500 text-sm'>
                Joined the community in 2026
            </p>
        </div>
    );
};

export default Profile;