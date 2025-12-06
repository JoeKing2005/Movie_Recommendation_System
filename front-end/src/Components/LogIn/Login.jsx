import React, { useRef } from "react";
import './LogIn.css'

import email_icon from '../assets/email icon.png'
import password_icon from '../assets/password icon.png'
import movie_icon from '../assets/movie icon.png'
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase-config.js';

const LogIn = () => {
    const emailRef = useRef();
    const passwordRef = useRef();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                emailRef.current.value,
                passwordRef.current.value
            );
            const user = userCredential.user;
            const idToken = await user.getIdToken();
            await fetch("http://localhost:3001/api/session/login", {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken })
            });

            const res = await fetch(`http://localhost:3001/api/web/users/${user.uid}/profile`, {
                method: "GET",
                credentials: "include",
                headers: {authorization: `Bearer ${idToken}`}
            });

            if (!res.ok) {
                throw new Error("Could not load user profile");
            }
            const profile = await res.json();
            console.log("User profile:", profile);

            navigate("/questionnaire")
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    return (
    <>
        <div className='top-right-container'>
              <div className='title'>Movie Recommendation System</div>
              <div className='logo'>
                <img src = {movie_icon} height={50} width={50} alt="" />
              </div>
            </div>
        
        <div className="container">
            <div className="header">
                <div className="text">Log In</div>
                <div className="underline"></div>
                <div className='signUpLink'>
                Need an Account? <Link to="/signup">Sign up</Link>
                </div>
                <div className="resetLink">
                    Forgot Password? <Link to="/reset">Reset Password</Link>
                </div>
            </div>
            <div className="inputs">
                <div className="input">
                    <img src={email_icon} height={25} width={25} alt="" />
                    <input ref={emailRef} type="email" placeholder='Email' />
                </div>
                <div className="input">
                    <img src={password_icon} height={25} width={25} alt="" />
                    <input ref={passwordRef} type="password" placeholder='Password' />
                </div>
        </div>
        
        <div className="submit-container">
        <button onClick={handleLogin} className="submit">Log In</button>
        </div>
      </div>
    </>
    )
}

export default LogIn