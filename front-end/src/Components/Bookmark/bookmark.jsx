import React, { useState } from "react";
import './bookmark.css'


import movie_icon from '../assets/movie icon.png'
import { Link } from "react-router-dom";

const Bookmark = () => {
    return (
        <>
            <div className="top-right-container">
                <div className="title">Movie Recommendation System</div>
                <div className="logo">
                    <img src = {movie_icon} height ={50} width={50} alt="" />
                </div>
            </div>

            <div className='container'>
                <div className="header">
                    <div className="text">Current Bookmarks</div>
                    <div className="underline"></div>
                </div>
            </div>
        </>
    )
}