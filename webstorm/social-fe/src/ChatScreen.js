import React, { useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import "./ChatScreen.css";

function ChatScreen() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        {
            name: 'anan',
            image: 'https://upload.wikimedia.org/wikipedia/en/e/e0/WPVG_icon_2016.svg',
            message: 'whats up',
        },
        {
            name: 'anan2',
            image: 'https://upload.wikimedia.org/wikipedia/en/e/e0/WPVG_icon_2016.svg',
            message: 'Not bad, how are you',
        },
        {
            message: "Hi! How are you Baby!",
        },

    ]);

    const handleSend = (e) => {
        e.preventDefault(); //otherwise it ll refresh when you enter
        setMessages([...messages, {message: input}]);
        setInput("");
    };

    return ( 
    <div className="chatScreen">
        <p className="chatScreen__timestamp">
            You matched with NANA
        </p>
        {messages.map((message) => 
            message.name ? (
                <div className="chatScreen__message">
                <Avatar 
                    className="chatScreen__image"
                    alt={message.name}
                    src={message.image}
                />
                <p className="chatScreen__text">{message.message}</p>
            </div>
        ) : (
            <div className="chatScreen__message">
              <p className="chatScreen__textUser">{message.message}</p>
            </div>
        )
        )}
        
        <form className="chatScreen__form">
        <input
          className="chatScreen__input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          onClick={handleSend}
          type="submit"
          className="chatScreen__button"
        >
          SEND
        </button>
        </form>
      </div>
    );
}

export default ChatScreen;