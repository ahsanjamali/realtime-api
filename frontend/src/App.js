// App.js
import React, { useEffect } from "react";
import Title from "./components/Title";
import LanguageSelector from "./components/LanguageSelector";
import CustomOrb from "./components/CustomOrb";
import AudioVisualizer from "./components/AudioVisualizer";
import Chat from "./components/Chat";
import Navbar from "./components/Navbar";
import useLanguageStore from "./components/store/useLanguageStore";
import useAudioStore from "./components/store/audioStore";
import "./App.css";

function App() {
  const { selectedLanguage, setSelectedLanguage } = useLanguageStore();
  const { isPlaying } = useAudioStore();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="App">
      <Navbar />
      <Title />
      {isPlaying ? <AudioVisualizer /> : <CustomOrb />}
      <Chat />
      <LanguageSelector
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
      />
    </div>
  );
}

export default App;




