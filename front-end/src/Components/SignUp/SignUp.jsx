import React from "react";
import './SignUp.css'  

import person_icon from '../assets/person icon.png'
import email_icon from '../assets/email icon.png'
import password_icon from '../assets/password icon.png'
import movie_icon from '../assets/movie icon.png'
import { Link, useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase-config.js';

const SignUp = () => {
    const usernameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const navigate = useNavigate();

    const handleSubmit = async () => {
      try {

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          emailRef.current.value,
          passwordRef.current.value
        );
        const user = userCredential.user;

        const idToken = await user.getIdToken();

        const res = await fetch(`http://localhost:3001/api/web/users/${user.uid}/profile`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${idToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: usernameRef.current.value
          })
        });

        if (!res.ok) {
          throw new Error("Failed to create profile on backend");
        }

        const data = await res.json();
        console.log("Profile created:", data);

        navigate("/questionnaire");
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
          <img src={movie_icon} height={50} width={50} alt="" />
        </div>
      </div>

      <div className='container'>
        <div className="header">
          <div className="text">Create an Account</div>
          <div className="underline"></div>
          <div className='signInLink'>
            Already have an account? <Link to='/login'>Sign in</Link>
          </div>
        </div>

        <div className="inputs">
          <div className="input">
            <img src={person_icon} height={25} width={25} alt="" />
            <input ref={usernameRef} type="text" placeholder='Username' />
          </div>
          <div className="input">
            <img src={email_icon} height={25} width={25} alt="" />
            <input ref={emailRef} type="email" placeholder='Email' />
          </div>
          <div className="input">
            <img src={password_icon} height={25} width={25} alt="" />
            <input ref={passwordRef} type="password" placeholder='Password' />
          </div>
        </div>

          <div onClick={handleSubmit} className="submit">Sign Up</div>
        </div>
    </>
  );
};

export default SignUp
