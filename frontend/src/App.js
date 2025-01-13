// App.js
import React, { useEffect } from "react";
import Title from "./components/Title";
import LanguageSelector from "./components/LanguageSelector";
import CustomOrb from "./components/CustomOrb";
import AudioVisualizer from "./components/AudioVisualizer";
import Chat from "./components/Chat";
import useLanguageStore from "./components/store/useLanguageStore";
import useAudioStore from "./components/store/audioStore";
import "./App.css";
import Sidebar from "./components/Sidebar";

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
      {/* Moved LanguageSelector into Sidebar */}
      <Sidebar>
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
        />
      </Sidebar>
      <Title />
      {isPlaying ? <AudioVisualizer /> : <CustomOrb />}
      <Chat />
    </div>
  );
}

export default App;





