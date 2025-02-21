import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ChatInputWidget from "./ChatInputWidget";
import useAudioStore from "./store/audioStore";
import ReactMarkdown from "react-markdown";
import "../styles/Chat.css";
import { io } from "socket.io-client";

const Chat = () => {
  const [chats, setChats] = useState([
    { msg: "Hi there! How can I assist you today?", who: "bot" },
  ]);
  const [loading, setLoading] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const chatContentRef = useRef(null);
  const { setAudioUrl } = useAudioStore();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const scrollToBottom = () => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTo({
        top: chatContentRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats, loading]);

  useEffect(() => {
    const newSocket = io("http://localhost:5000", {
      transports: ["websocket"],
      cors: {
        origin: "http://localhost:3000",
        credentials: true,
      },
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to WebSocket");
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from WebSocket");
    });

    newSocket.on("status", (data) => {
      console.log("Received status:", data);
      if (data.status === "processing") {
        setLoading(true);
      }
    });

    newSocket.on("response", (data) => {
      console.log("Received response:", data);
      const { response: botResponse, audio } = data;

      setChats((prevChats) => [...prevChats, { msg: botResponse, who: "bot" }]);

      if (audio) {
        const audioBlob = base64ToBlob(audio, "audio/mp3");
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
      }

      setLoading(false);
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
      setLoading(false);
      setChats((prevChats) => [
        ...prevChats,
        { msg: "Sorry, an error occurred. Please try again.", who: "bot" },
      ]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleNewMessage = async (data) => {
    if (!isConnected) {
      console.error("Not connected to WebSocket");
      return;
    }

    console.log("Socket status:", socket?.connected); // Debug socket connection
    console.log("Sending message:", data);

    if (data.text && data.text.trim().length > 0) {
      setChats((prevChats) => [...prevChats, { msg: data.text, who: "me" }]);

      // Send message through WebSocket with explicit event name
      try {
        socket.emit("message", { input: data.text });
        console.log("Message emitted successfully");
      } catch (error) {
        console.error("Error emitting message:", error);
      }
    }
  };

  const toggleChatVisibility = () => {
    setIsChatVisible((prevState) => !prevState);
  };

  const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length)
        .fill()
        .map((_, i) => slice.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: mimeType });
  };

  return (
    <>
      {isChatVisible && (
        <div className="chat-content" ref={chatContentRef}>
          {chats.map((chat, index) => (
            <div key={index} className={`chat-message ${chat.who}`}>
              {chat.who === "bot" && (
                <figure className="avatar">
                  <img src="./avatar.gif" alt="avatar" />
                </figure>
              )}
              <div className="message-text">
                {chat.who === "bot" ? (
                  <ReactMarkdown>{chat.msg}</ReactMarkdown>
                ) : (
                  chat.msg
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-message loading">
              <figure className="avatar">
                <img src="./avatar.gif" alt="avatar" />
              </figure>
              <div
                style={{
                  padding: "5px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <lottie-player
                  src="https://lottie.host/47000d95-a3cd-43b8-ba63-fc7b3216f1cf/6gPsoPB6JM.json"
                  style={{ width: "130px", height: "130px" }}
                  loop
                  autoplay
                  speed="1"
                  direction="1"
                  mode="normal"
                ></lottie-player>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="chat-footer">
        <ChatInputWidget onSendMessage={handleNewMessage} />
        <button className="toggle-button" onClick={toggleChatVisibility}>
          {isChatVisible ? "-" : "+"}
        </button>
      </div>
    </>
  );
};

export default Chat;
