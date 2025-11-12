import React from "react";
import './SignUp.css'

import person_icon from '../assets/person icon.png'
import email_icon from '../assets/email icon.png'
import password_icon from '../assets/password icon.png'
import movie_icon from '../assets/movie icon.png'
import { Link } from 'react-router-dom';
import { useRef } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase-config.js';

const SignUp = () => {
    const usernameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();

    async function handleSubmit() {
      await createUserWithEmailAndPassword(auth, emailRef.current.value, passwordRef.current.value)
      .then(async (userCredential) => {
        const user = userCredential.user;
        const idToken = await user.getIdToken();

        console.log("Frontend attempting to send username:", usernameRef.current.value);
        console.log("Frontend attempting to send email:", emailRef.current.value);

        await fetch(`http://localhost:3001/api/web/users/${user.uid}/profile`, {
          method: "POST",
          body: JSON.stringify({
              uid: user.uid,
              email: emailRef.current.value,
              username: usernameRef.current.value
          }),
          headers: {
              "Authorization": `Bearer ${idToken}`,
              "Content-Type": "application/json"
          }
        })
        .then(res => res.json())
        .then(res => console.log(res));
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
    }

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
  )
}

export default SignUp



