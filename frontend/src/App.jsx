import Login from "./login/Login.jsx"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Route, Routes } from "react-router-dom";
import Register from "./register/Register.jsx";
import Home from "./home/Home.jsx";
import { VerifyUser } from "./utils/VerifyUser.jsx";
import Profile from "./home/components/Profile.jsx";
import ProtectedRoute from "./utils/ProtectedRoute.jsx";
import React, { useEffect, useState } from "react";
import Logo from "./assets/logo.png";
import SplashScreen from "./home/components/SplashScreen.jsx";


function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);


  if (showSplash) {
    return <SplashScreen logo={Logo} />;
  }

  return (
    <>
      <div className="p-2 w-screen h-screen flex items-center justify-center">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<VerifyUser />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>}>
            </Route>
          </Route>
        </Routes>
        <ToastContainer />
      </div>
    </>
  );
}

export default App
