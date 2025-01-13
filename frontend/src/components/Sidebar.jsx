// Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom";
import '../styles/Sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faHouse, 
    faPhone, 
    faCalendarCheck, 
    faGem, 
    faRightFromBracket, 
    faBars, 
    faChevronLeft, 
    faChevronRight,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import LanguageSelector from "./LanguageSelector";
import useLanguageStore from "../components/store/useLanguageStore";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const { selectedLanguage, setSelectedLanguage } = useLanguageStore();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const indicator = document.getElementById('indicator');
        const menuItems = document.querySelectorAll('.sidebar ul li');

        menuItems.forEach((item) => {
            item.addEventListener('mouseover', () => {
                const itemHeight = item.offsetHeight;
                const offsetTop = item.offsetTop;
                indicator.style.top = `${offsetTop}px`;
                indicator.style.height = `${itemHeight}px`;
            });
        });
    }, []);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`sidebar-wrapper ${isOpen ? 'open' : ''}`}>
            {/* Sidebar Content */}
            <div className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
                <ul>
                    {/* Profile Section */}
                    <div className="profile">
                        <img src="./orb.gif" alt="profile pic" />
                        <span>Username</span>
                    </div>

                    <div className="indicator" id="indicator"></div>

                    {/* ✅ Glassmorphic NavLinks with Active Styling */}
                    <li>
                        <NavLink 
                            to="/" 
                            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                        >
                            <FontAwesomeIcon icon={faHouse} className="icon" />
                            <span>Home</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="/call-ai" 
                            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                        >
                            <FontAwesomeIcon icon={faPhone} className="icon" />
                            <span>Call the AI</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="/book-appointment" 
                            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                        >
                            <FontAwesomeIcon icon={faCalendarCheck} className="icon" />
                            <span>Book Appointment</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="/premium" 
                            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                        >
                            <FontAwesomeIcon icon={faGem} className="icon" />
                            <span>Premium</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="/logout" 
                            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                        >
                            <FontAwesomeIcon icon={faRightFromBracket} className="icon" />
                            <span>Logout</span>
                        </NavLink>
                    </li>
                </ul>

                {/* ✅ Language Selector - Controlled and Styled */}
                {(isOpen) && (
                    <div className="sidebar-footer">
                        <LanguageSelector
                            selectedLanguage={selectedLanguage}
                            setSelectedLanguage={setSelectedLanguage}
                        />
                    </div>
                )}
            </div>

            {/* ✅ Toggle Button: Hamburger for Mobile, Chevron for Desktop */}
            <button className="toggle-btn" onClick={handleToggle}>
                {isMobile ? (
                    isOpen ? <FontAwesomeIcon icon={faTimes} /> : <FontAwesomeIcon icon={faBars} />
                ) : (
                    <FontAwesomeIcon icon={isOpen ? faChevronLeft : faChevronRight} />
                )}
            </button>
        </div>
    );
};

export default Sidebar;











