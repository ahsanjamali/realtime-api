import React, { useState, useEffect } from 'react';
import '../styles/Sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faHouse, 
    faEnvelope, 
    faChartColumn, 
    faGem, 
    faRightFromBracket, 
    faBars, 
    faChevronLeft, 
    faChevronRight,
    faTimes
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
                    <div className="profile">
                        <img
                            src="./orb.gif"
                            alt="profile pic"
                        />
                        <span>Username</span>
                    </div>

                    <div className="indicator" id="indicator"></div>

                    <li>
                        <FontAwesomeIcon icon={faHouse} className="icon" />
                        <span>Home</span>
                    </li>
                    <li>
                        <FontAwesomeIcon icon={faEnvelope} className="icon" />
                        <span>Emails</span>
                    </li>
                    <li>
                        <FontAwesomeIcon icon={faChartColumn} className="icon" />
                        <span>Charts</span>
                    </li>
                    <li>
                        <FontAwesomeIcon icon={faGem} className="icon" />
                        <span>Premium</span>
                    </li>
                    <li>
                        <FontAwesomeIcon icon={faRightFromBracket} className="icon" />
                        <span>Logout</span>
                    </li>
                </ul>

                {/* Language Selector Only Visible When Sidebar is Open */}
                {(isOpen) && (
                    <div className="sidebar-footer">
                        {children}
                    </div>
                )}
            </div>

            {/* Toggle Button */}
            <button className="toggle-btn" onClick={handleToggle}>
                {isMobile ? (
                    isOpen ? (
                        <FontAwesomeIcon icon={faTimes} /> 
                    ) : (
                        <FontAwesomeIcon icon={faBars} />
                    )
                ) : (
                    <FontAwesomeIcon icon={isOpen ? faChevronLeft : faChevronRight} />
                )}
            </button>
        </div>
    );
}

export default Sidebar;







