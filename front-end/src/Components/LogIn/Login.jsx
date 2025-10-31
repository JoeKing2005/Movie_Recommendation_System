import React from "react";
import './LogIn.css'

import email_icon from '../assets/email icon.png'
import password_icon from '../assets/password icon.png'
import movie_icon from '../assets/movie icon.png'
import { Link } from 'react-router-dom';

const LogIn = () => {

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
            </div>
            <div className="inputs">
                <div className="input">
                    <img src={email_icon} height={25} width={25} alt="" />
                    <input type="email" placeholder='Email' />
                </div>
                <div className="input">
                    <img src={password_icon} height={25} width={25} alt="" />
                    <input type="password" placeholder='Password' />
                </div>
        </div>
        
        <div className="submit-container">
        <Link to="/welcome" className="submit">Log In</Link>
        </div>

      </div>
    </>
    )
}

export default LogIn