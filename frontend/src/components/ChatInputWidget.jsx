import React, { useState, useRef } from "react";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import "../styles/ChatInputWidget.css";

const ChatInputWidget = ({ onSendMessage, isDisabled }) => {
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const textAreaRef = useRef(null);

  const adjustTextAreaHeight = (inputValue, reset = false) => {
    if (textAreaRef.current) {
      if (reset) {
        textAreaRef.current.style.height = "25px";
        return;
      }

      textAreaRef.current.style.height = "25px";
      textAreaRef.current.value = inputValue || textAreaRef.current.value;
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  };

  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setInputText(newValue);
    adjustTextAreaHeight(newValue);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (inputText.trim().length > 0) {
        handleSendMessage();
      }
    }
  };

  const handleSendMessage = () => {
    if (inputText.trim().length > 0) {
      onSendMessage({ text: inputText });
      setInputText("");
      adjustTextAreaHeight("", true);
    }
  };

  const handleButtonClick = () => {
    if (isDisabled) return; // Don't do anything if disabled

    if (inputText.trim().length > 0) {
      handleSendMessage();
    } else {
      const newRecordingState = !isRecording;
      setIsRecording(newRecordingState);
      onSendMessage({
        type: "session.update",
        session: {
          turn_detection: newRecordingState ? { type: "server_vad" } : null,
        },
      });
    }
  };

  return (
    <div className="chat-container">
      <textarea
        ref={textAreaRef}
        className="chat-input"
        placeholder={isDisabled ? "Connecting..." : "Type a message..."}
        value={inputText}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        rows={1}
        disabled={isDisabled}
      />
      <button
        className={`icon-btn ${
          isRecording && !inputText.trim() ? "recording" : ""
        } ${isDisabled ? "disabled" : ""}`}
        onClick={handleButtonClick}
        disabled={isDisabled}
      >
        {isDisabled ? (
          <div className="loading-spinner"></div>
        ) : inputText.trim().length > 0 ? (
          <SendIcon />
        ) : isRecording ? (
          <MicIcon />
        ) : (
          <MicOffIcon />
        )}
      </button>
    </div>
  );
};

export default ChatInputWidget;
