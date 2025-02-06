// Home.jsx
import React, { useEffect } from "react";
import Title from "../components/Title";
//import CustomOrb from "../components/CustomOrb";
import Orb from "../components/Orb";
import AudioVisualizer from "../components/AudioVisualizer";
import Chat from "../components/Chat";
import useAudioStore from "../components/store/audioStore";



const Home = () => {
    const { isPlaying } = useAudioStore();
   

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    return (
        <div className="home-container">
            <Title  pageIndex={0}/>
            {isPlaying ? <AudioVisualizer /> : <Orb/>}

            <Chat />
            
            {/* ✅ Displaying the selected language from the Sidebar */}
        </div>
    );
};

export default Home;



