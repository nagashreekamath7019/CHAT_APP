import React from 'react'
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext.jsx';
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa";


const Login = () => {
  const navigate = useNavigate();
  const {setAuthUser} = useAuth();
  const [userInput, setUserInput] = useState({});
  const [loading, setLoading] = useState(false)


  const handleInput = (e) => {
    setUserInput({
      ...userInput, [e.target.id]: e.target.value
    })
  }
  console.log(userInput);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const login = await axios.post(`/api/auth/login`, userInput);
      const data = login.data;

      if (data.success === false) {
        setLoading(false);

        console.log(data.message)
      }
      toast.success(data.message)
      localStorage.setItem('chat_app', JSON.stringify(data));
      setAuthUser(data);
      setLoading(false);
      navigate('/');
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error(error.response?.data?.message);
    }
  };
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className='flex flex-col items-center justify-center mix-w-full mx-auto'>
      <div className='w-full p-6 rounded-lg shadow-md 
      bg-white/20 backdrop-blur-md border border-white/10'>
        <h1 className='text-3xl font-bold text-center text-gray-300'>Login into
          <span className="text-gray-950"> CHAT APP </span>
        </h1>
        <form onSubmit={handleSubmit} className='flex flex-col text-black'>
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
                {showPassword ? <IoEyeSharp />: <FaEyeSlash />}
              </span>
            </div>
          </div>

          <button type='submit'
            className='mt-4 self-center w-auto px-2 py-1 bg-gray-800 text-lg text-white rounded-lg hover:scale-105'>
            {loading ? "loading..." : "Login"}
          </button>
        </form>
        <div className="pt-2">
          <p className='text-sm front-semibold text-gray-800'>
            Don't have an Account? <Link to={'/register'}>
              <span className='text-gray-950 font-bold underline cursor-pointer hover:text-green-950'>
                Register Now!
              </span>
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}

export default Login