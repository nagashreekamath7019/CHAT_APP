import React from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext.jsx';
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa";

const Register = () => {
    const navigate = useNavigate();
    const {setAuthUser} = useAuth();
    const [loading, setLoading] = useState(false);
    const [inputData, setInputData] = useState({})
    const handleInput = (e) => {
        setInputData({
            ...inputData, [e.target.id]: e.target.value
        })
    }
    console.log(inputData);

    const selectGender = (selectGender) => {
        setInputData((prev) => ({
            ...prev, gender: selectGender === inputData.gender ? '' : selectGender
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        if (inputData.password !== inputData.confpassword.toLowerCase()) {
            setLoading(false)
            return toast.error("Password doesn't match");
        }
        try {
            const register = await axios.post(`/api/auth/register`, inputData);
            const data = register.data;
            if (data.success === false) {
                setLoading(false);
                toast.error(data.message);
                console.log(data.message);
            }
            toast.success(data?.message)
            localStorage.setItem('chat_app', JSON.stringify(data));
            setAuthUser(data)
            setLoading(false)
            navigate('/login');
        } catch (error) {
            setLoading(false);
            console.log(error);
            toast.error(error.response?.data?.message);
        }
    }
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    return (
        <div className='flex flex-col items-center justify-center mix-w-full mx-auto'>
            <div className='w-full p-6 rounded-lg shadow-md 
      bg-white/20 backdrop-blur-md border border-white/10'>
                <h1 className='text-3xl font-bold text-center text-gray-300'>Register into
                    <span className="text-gray-950"> CHAT APP </span>
                </h1>
                <form onSubmit={handleSubmit} className='flex flex-col text-black'>
                    <div>
                        <label className='label p-2'>
                            <span className='font-bold text-gray-950 text-xl label-text'>Fullname :</span>
                        </label>
                        <input id='fullname'
                            type='text'
                            onChange={handleInput}
                            placeholder='Enter your fullname'
                            required
                            className='w-full input input-bordered h-10 placeholder:text-gray-500 text-black' />
                    </div>
                    <div>
                        <label className='label p-2'>
                            <span className='font-bold text-gray-950 text-xl label-text'>Username :</span>
                        </label>
                        <input id='username'
                            type='text'
                            onChange={handleInput}
                            placeholder='Enter your username'
                            required
                            className='w-full input input-bordered h-10 placeholder:text-gray-500 text-black' />
                    </div>
                    <div>
                        <label className='label p-2'>
                            <span className='font-bold text-gray-950 text-xl label-text'>Email :</span>
                        </label>
                        <input id='email'
                            type='email'
                            onChange={handleInput}
                            placeholder='Enter your Email Id'
                            required
                            className='w-full input input-bordered h-10 placeholder:text-gray-500 text-black' />
                    </div>

                    {/* Password Section */}
                    <div className="flex flex-col mt-2">
                        <label className='label p-2'>
                            <span className='text-base font-bold text-gray-900 label-text'>Password :</span>
                        </label>

                        <div className='relative flex items-center'>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                onChange={handleInput}
                                placeholder="Enter your Password"
                                required
                                className="w-full input input-bordered h-10 pr-10 text-black placeholder:text-gray-500"
                            />
                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                className='absolute right-3 cursor-pointer'
                            >
                                {showPassword ? <IoEyeSharp /> : <FaEyeSlash />}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col mt-2">
                        <label className='label p-2'>
                            <span className='text-base font-bold text-gray-900 label-text'>Confirm Password :</span>
                        </label>

                        <div className='relative flex items-center'>
                            <input
                                id="confpassword"
                                type={showConfirmPassword ? "text" : "password"}
                                onChange={handleInput}
                                placeholder="Confirm your Password"
                                required
                                className="w-full input input-bordered h-10 pr-10 text-black placeholder:text-gray-500"
                            />
                            <span
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className='absolute right-3 cursor-pointer'
                            >
                                {showConfirmPassword ? <IoEyeSharp /> : <FaEyeSlash />}
                            </span>
                        </div>
                    </div>

                    <div
                        id='gender' className='flex gap-2 mt-2'>
                        <label className="cursor-pointer label flex gap-2">
                            <span className='label-text font-semibold text-gray-950'>Male</span>
                            <input
                                onChange={() => selectGender('male')}
                                checked={inputData.gender === 'male'}
                                type='checkbox' className='checkbox checkbox-info' />
                        </label>
                        <label className="cursor-pointer label flex gap-2">
                            <span className='label-text font-semibold text-gray-950'>Female</span>
                            <input
                                checked={inputData.gender === 'female'}
                                onChange={() => selectGender('female')}
                                type='checkbox' className='checkbox checkbox-info' />
                        </label>
                    </div>

                    <button type='submit'
                        className='mt-4 self-center w-auto px-2 py-1 bg-gray-800 text-lg text-white rounded-lg hover:scale-105'>
                        {loading ? "loading..." : "Register"}
                    </button>
                </form>

                <div className="pt-2">
                    <p className='text-sm front-semibold text-gray-950'>
                        Do you have an Account? <Link to={'/login'}>
                            <span className='text-gray-950 font-bold underline cursor-pointer hover:text-green-950'>
                                Login Now!
                            </span>
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register