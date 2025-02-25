import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
import ChatInputWidget from "./ChatInputWidget";
// import useAudioStore from "./store/audioStore";
import ReactMarkdown from "react-markdown";
import "../styles/Chat.css";

const Chat = () => {
  const [chats, setChats] = useState([
    { msg: "Hi there! How can I assist you today?", who: "bot" },
  ]);
  const [loading, setLoading] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const chatContentRef = useRef(null);
  // const { setAudioUrl } = useAudioStore();

  // Add WebRTC state
  const [isWebRTCActive, setIsWebRTCActive] = useState(false);
  const [peerConnection, setPeerConnection] = useState(null);
  const [dataChannel, setDataChannel] = useState(null);

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

  // Modify the data channel message handler
  const addMessageToChat = (text, isUser = false) => {
    if (!text) return; // Don't add empty messages

    setChats((prev) => {
      const lastMessage = prev[prev.length - 1];

      // If the last message is from the same sender and incomplete, append to it
      if (
        lastMessage &&
        lastMessage.who === (isUser ? "me" : "bot") &&
        !lastMessage.complete
      ) {
        return [
          ...prev.slice(0, -1),
          { ...lastMessage, msg: lastMessage.msg + text },
        ];
      }

      // Otherwise, add a new message
      return [
        ...prev,
        {
          msg: text,
          who: isUser ? "me" : "bot",
          complete: isUser, // User messages are always complete, bot messages may not be
        },
      ];
    });
  };

  // Create data channel handler
  const createDataChannel = (pc) => {
    const channel = pc.createDataChannel("response");

    channel.addEventListener("open", () => {
      console.log("Data channel opened");
      configureData(channel);
    });

    channel.addEventListener("message", async (ev) => {
      const msg = JSON.parse(ev.data);
      console.log("Received message type:", msg.type, "Full message:", msg);

      switch (msg.type) {
        case "conversation.item.input_audio_transcription.completed":
          addMessageToChat(msg.transcript, true);
          break;

        case "response.text.delta":
          // For streaming text responses
          setChats((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (
              lastMessage &&
              lastMessage.who === "bot" &&
              !lastMessage.complete
            ) {
              // Append to the last bot message
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, msg: lastMessage.msg + msg.delta },
              ];
            } else {
              // Start a new bot message
              return [...prev, { msg: msg.delta, who: "bot", complete: false }];
            }
          });
          break;

        case "response.done":
          // Mark the last message as complete
          setChats((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.who === "bot") {
              return [...prev.slice(0, -1), { ...lastMessage, complete: true }];
            }
            return prev;
          });

          // Handle any final output content
          if (msg.response?.output?.[0]?.content) {
            msg.response.output[0].content.forEach((content) => {
              if (content.type === "text") {
                addMessageToChat(content.text, false);
              } else if (content.type === "audio" && content.transcript) {
                addMessageToChat(content.transcript, false);
              }
            });
          }
          break;

        case "response.function_call_arguments.done":
          // Handle function calls if needed
          break;

        default:
          console.log("Unhandled message type:", msg.type);
      }
    });

    setDataChannel(channel);
  };

  // Configure data channel
  const configureData = (channel) => {
    const event = {
      type: "session.update",
      session: {
        instructions:
          "You are a Patient Virtual Assistant for Doctor Samir Abbas Hospital in Jeddah...",
        modalities: ["text", "audio"],
        turn_detection: null,
        input_audio_transcription: {
          model: "whisper-1",
        },
        // Add other configuration as needed
      },
    };
    channel.send(JSON.stringify(event));
  };

  // Handle new message from ChatInputWidget
  const handleNewMessage = async (data) => {
    setIsChatVisible(true);

    if (!isWebRTCActive || !dataChannel) {
      alert("Please start the connection first");
      return;
    }

    if (data.text && data.text.trim().length > 0) {
      // Add user message to chat immediately
      addMessageToChat(data.text, true);

      // Create conversation item with text
      const createMessage = {
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text: data.text,
            },
          ],
        },
      };

      // Send the message
      dataChannel.send(JSON.stringify(createMessage));

      // Request response from the model
      const createResponse = {
        type: "response.create",
        response: {
          modalities: ["text", "audio"],
        },
      };

      dataChannel.send(JSON.stringify(createResponse));
    } else if (data.audioFile) {
      // Handle audio file if needed
      // Add a temporary message showing that audio is being processed
      addMessageToChat("🎤 Audio message sent...", true);
    }
  };

  // Add WebRTC controls
  const startWebRTC = async () => {
    const pc = new RTCPeerConnection();
    setPeerConnection(pc);

    pc.ontrack = (event) => {
      const el = document.createElement("audio");
      el.srcObject = event.streams[0];
      el.autoplay = el.controls = true;
      document.body.appendChild(el);
    };

    createDataChannel(pc);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream
        .getTracks()
        .forEach((track) =>
          pc.addTransceiver(track, { direction: "sendrecv" })
        );

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const response = await fetch("http://localhost:8813/api/rtc-connect", {
        method: "POST",
        body: offer.sdp,
        headers: {
          "Content-Type": "application/sdp",
        },
      });

      const answer = await response.text();
      await pc.setRemoteDescription({ sdp: answer, type: "answer" });

      setIsWebRTCActive(true);
    } catch (error) {
      console.error("Error starting WebRTC:", error);
    }
  };

  // Add cleanup function
  useEffect(() => {
    return () => {
      if (peerConnection) {
        peerConnection.close();
      }
      if (dataChannel) {
        dataChannel.close();
      }
    };
  }, []);

  const toggleChatVisibility = () => {
    setIsChatVisible((prevState) => !prevState);
  };

  // const base64ToBlob = (base64, mimeType) => {
  //   const byteCharacters = atob(base64);
  //   const byteArrays = [];
  //   for (let offset = 0; offset < byteCharacters.length; offset += 512) {
  //     const slice = byteCharacters.slice(offset, offset + 512);
  //     const byteNumbers = new Array(slice.length)
  //       .fill()
  //       .map((_, i) => slice.charCodeAt(i));
  //     const byteArray = new Uint8Array(byteNumbers);
  //     byteArrays.push(byteArray);
  //   }
  //   return new Blob(byteArrays, { type: mimeType });
  // };

  return (
    <>
      <button onClick={startWebRTC} disabled={isWebRTCActive}>
        {isWebRTCActive ? "Connected" : "Connect"}
      </button>
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
