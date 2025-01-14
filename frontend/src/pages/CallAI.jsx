import React, { useEffect } from "react";
import "../styles/CallAI.css";
const CallAI = () => {
  useEffect(() => {
    let animating = false;
    let cardsCounter = 0;
    const numOfCards = 6;
    const decisionVal = 80;
    let pullDeltaX = 0;
    let deg = 0;
    let card;

    const pullChange = () => {
      animating = true;
      deg = pullDeltaX / 10;
      card.style.transform = `translateX(${pullDeltaX}px) rotate(${deg}deg)`;
    };

    const release = () => {
      if (pullDeltaX >= decisionVal) {
        card.classList.add("to-right");
      } else if (pullDeltaX <= -decisionVal) {
        card.classList.add("to-left");
      }

      if (Math.abs(pullDeltaX) >= decisionVal) {
        card.classList.add("inactive");

        setTimeout(() => {
          card.parentElement.appendChild(card);
          card.classList.remove("inactive", "to-left", "to-right");
          document.querySelectorAll(".demo__card").forEach((el) => {
            el.style.transform = "";
          });

          cardsCounter++;
          if (cardsCounter === numOfCards) {
            cardsCounter = 0;
          }

          updateCardStyles();
        }, 300);
      }

      if (Math.abs(pullDeltaX) < decisionVal) {
        card.classList.add("reset");
      }

      setTimeout(() => {
        card.style.transform = "";
        card.classList.remove("reset");
        pullDeltaX = 0;
        animating = false;
        updateCardStyles();
      }, 300);
    };

    const startDrag = (e) => {
      if (animating) return;

      const cardElement = e.target.closest(".demo__card");

      if (cardElement && !cardElement.classList.contains("inactive")) {
        card = cardElement;
        const startX = e.type === "mousedown" ? e.pageX : e.touches[0].pageX;

        const moveHandler = (e) => {
          const x = e.type === "mousemove" ? e.pageX : e.touches[0].pageX;
          pullDeltaX = x - startX;

          if (Math.abs(pullDeltaX) > 0) {
            pullChange();
          }
        };

        const endHandler = () => {
          document.removeEventListener("mousemove", moveHandler);
          document.removeEventListener("touchmove", moveHandler);
          document.removeEventListener("mouseup", endHandler);
          document.removeEventListener("touchend", endHandler);

          if (Math.abs(pullDeltaX) > 0) {
            release();
          }
        };

        document.addEventListener("mousemove", moveHandler);
        document.addEventListener("touchmove", moveHandler);
        document.addEventListener("mouseup", endHandler);
        document.addEventListener("touchend", endHandler);
      }
    };

    const updateCardStyles = () => {
      const cards = document.querySelectorAll(".demo__card");
      cards.forEach((card, index) => {
        const zIndex = 6 - index;
        const scale = 1 - index * 0.05;
        const translateY = index * 10;

        if (!card.classList.contains("below")) {
          card.style.zIndex = zIndex;
          card.style.transform = `translateY(${translateY}px) scale(${scale})`;
        } else {
          card.style.zIndex = 1;
        }
      });
    };

    document.addEventListener("mousedown", startDrag);
    document.addEventListener("touchstart", startDrag);

    updateCardStyles();

    return () => {
      document.removeEventListener("mousedown", startDrag);
      document.removeEventListener("touchstart", startDrag);
    };
  }, []);

  return (
    <div className="demo">
      <div className="demo__content">
        <div className="demo__card-cont">
          {[1, 2, 3].map((item, index) => (
            <div className="demo__card" key={index}>
              <div className={`demo__card__top ${["purple", "blue", "indigo"][index]}`}>
                <div
                  className="demo__card__img"
                  style={{
                    backgroundImage: `url('https://picsum.photos/200?random=${index + 1}')`,
                  }}
                ></div>
                <p className="demo__card__name">Agent {item}</p>
                <p className="demo__card__role">Role: AI Assistant</p>
              </div>
              <div className="demo__card__mic">
                <i className="fas fa-microphone"></i>
              </div>
              <div className="demo__card__drag"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CallAI;



