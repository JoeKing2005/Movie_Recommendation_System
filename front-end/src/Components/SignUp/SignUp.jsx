import React from "react";
import './SignUp.css'

import person_icon from '../assets/person icon.png'
import email_icon from '../assets/email icon.png'
import password_icon from '../assets/password icon.png'
import movie_icon from '../assets/movie icon.png'
import { Link } from 'react-router-dom';

const SignUp = () => {
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
            <input type="text" placeholder='First Name' />
          </div>
          <div className="input">
            <img src={person_icon} height={25} width={25} alt="" />
            <input type="text" placeholder='Last Name' />
          </div>
          <div className="input">
            <img src={email_icon} height={25} width={25} alt="" />
            <input type="email" placeholder='Email' />
          </div>
          <div className="input">
            <img src={password_icon} height={25} width={25} alt="" />
            <input type="password" placeholder='Password' />
          </div>
        </div>

          <div className="submit">Sign Up</div>
        </div>
    </>
  )
}

export default SignUp



