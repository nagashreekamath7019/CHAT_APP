import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack, IoMdCheckmarkCircleOutline } from "react-icons/io";
import { BiLogOutCircle, BiEditAlt } from "react-icons/bi";
import { MdCancel } from "react-icons/md";
import axios from 'axios';
import { toast } from 'react-toastify';

const Profile = () => {
    const { authUser, setAuthUser } = useAuth();
    const navigate = useNavigate();

    // State for toggling which field is being edited
    const [editMode, setEditMode] = useState(null); // 'fullname', 'username', or 'gender'

    // States for the input values
    const [newUsername, setNewUsername] = useState(authUser?.username || "");
    const [newFullname, setNewFullname] = useState(authUser?.fullname || "");
    const [newGender, setNewGender] = useState(authUser?.gender || "male");
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // Added for logout modal

    const handleUpdateProfile = async (field) => {
        let value;
        if (field === 'username') value = newUsername;
        else if (field === 'fullname') value = newFullname;
        else value = newGender;

        // Validation
        if (value === authUser[field]) return setEditMode(null);
        if (field !== 'gender' && value.trim().length < 3) {
            return toast.error(`${field} is too short!`);
        }

        setLoading(true);
        try {
            const res = await axios.post(`/api/user/update-${field}`, {
                userId: authUser._id,
                [field]: value
            });

            if (res.data.error) throw new Error(res.data.error);

            // Update Global Auth State & Local Storage
            const updatedUser = { ...authUser, [field]: value };
            setAuthUser(updatedUser);
            localStorage.setItem('chat_app', JSON.stringify(updatedUser));

            toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated!`);
            setEditMode(null);
        } catch (error) {
            toast.error(error.response?.data?.error || "Update failed!");
        } finally {
            setLoading(false);
        }
    };

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
        <div className='flex flex-col items-center justify-center min-w-full h-screen p-4 '>
            <div className='w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden'>
                {/* Header */}
                <div className='flex items-center p-6 bg-sky-600 text-white'>
                    <button onClick={() => navigate(-1)} className='hover:bg-sky-700 p-2 rounded-full transition-colors'>
                        <IoMdArrowRoundBack size={24} />
                    </button>
                    <h2 className='text-xl font-bold ml-4'>My Profile</h2>
                </div>

                <div className='flex flex-col items-center p-8'>
                    <div className='w-24 h-24 rounded-full overflow-hidden border-4 border-sky-500 shadow-lg mb-4'>
                        <img src={authUser?.profilepic} alt="Profile" className='w-full h-full object-cover' />
                    </div>

                    {/* FULL NAME */}
                    <div className='w-full flex flex-col items-center mb-1'>
                        {editMode === 'fullname' ? (
                            <div className='flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-sky-300 w-full'>
                                <input type="text" value={newFullname} onChange={(e) => setNewFullname(e.target.value)} className='bg-transparent outline-none text-gray-900 font-bold text-xl text-center flex-1' autoFocus />
                                <button onClick={() => handleUpdateProfile('fullname')} className='text-green-600'><IoMdCheckmarkCircleOutline size={24} /></button>
                                <button onClick={() => setEditMode(null)} className='text-red-500'><MdCancel size={24} /></button>
                            </div>
                        ) : (
                            <div className='flex items-center gap-2 group cursor-pointer' onClick={() => setEditMode('fullname')}>
                                <h1 className='text-2xl font-bold text-gray-900'>{authUser?.fullname}</h1>
                                <BiEditAlt className='text-gray-400 group-hover:text-sky-500' size={18} />
                            </div>
                        )}
                    </div>

                    {/* USERNAME */}
                    <div className='w-full flex flex-col items-center'>
                        {editMode === 'username' ? (
                            <div className='flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-sky-300 w-full'>
                                <span className='text-sky-600 font-bold pl-2'>@</span>
                                <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className='bg-transparent outline-none text-sky-700 font-medium flex-1' autoFocus />
                                <button onClick={() => handleUpdateProfile('username')} className='text-green-600'><IoMdCheckmarkCircleOutline size={24} /></button>
                                <button onClick={() => setEditMode(null)} className='text-red-500'><MdCancel size={24} /></button>
                            </div>
                        ) : (
                            <div className='flex items-center gap-2 group cursor-pointer' onClick={() => setEditMode('username')}>
                                <p className='text-sky-600 font-medium text-lg'>@{authUser?.username}</p>
                                <BiEditAlt className='text-gray-400 group-hover:text-sky-500' size={18} />
                            </div>
                        )}
                    </div>

                    {/* GENDER BOX */}
                    <div className='w-full mt-6'>
                        <div className='bg-gray-50 p-4 rounded-2xl border border-gray-100'>
                            <p className='text-xs text-gray-500 uppercase font-bold mb-1'>Gender</p>
                            {editMode === 'gender' ? (
                                <div className='flex items-center gap-2'>
                                    <select
                                        value={newGender}
                                        onChange={(e) => setNewGender(e.target.value)}
                                        className='bg-white border border-sky-300 rounded-lg p-1 flex-1 outline-none text-sm'
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <button onClick={() => handleUpdateProfile('gender')} className='text-green-600'><IoMdCheckmarkCircleOutline size={20} /></button>
                                    <button onClick={() => setEditMode(null)} className='text-red-500'><MdCancel size={20} /></button>
                                </div>
                            ) : (
                                <div className='flex justify-between items-center group cursor-pointer' onClick={() => setEditMode('gender')}>
                                    <p className='text-sm text-gray-700 font-medium capitalize'>{authUser?.gender || "Not Specified"}</p>
                                    <BiEditAlt className='text-gray-400 group-hover:text-sky-500' size={16} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className='w-full mt-6 p-3 flex items-center gap-2 border-t border-gray-200/50'>
                        {/* Trigger the Modal instead of direct logout */}
                        <button onClick={() => setIsModalOpen(true)} className='flex items-center justify-center bg-gray-800 hover:bg-black w-10 h-10 rounded-full cursor-pointer text-white transition-all shadow-md'>
                            <BiLogOutCircle size={24} />
                        </button>
                        <p className='text-sm font-medium text-gray-700'>Logout</p>
                    </div>

                    {/* Logout Confirmation Modal */}
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
            </div>
        </div>
    );
};

export default Profile;