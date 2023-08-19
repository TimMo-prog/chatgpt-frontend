// ChatGPT frontend


import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';

import './App.css';
import userAvatar from './images/userAvatar.svg'; // Reference: https://freesvg.org/vector-clip-art-of-user-symbol
import chatbotAvatar from './images/chatbotAvatar.svg'; // Reference: https://freesvg.org/1538298822


function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatGPTOutput, setChatGPTOutput] = useState([]);
  const [latestChatGPTMessage, setLatestChatGPTMessage] = useState('');
  const [showPopup, setShowPopup] = useState(true);
  const [showTaskDescription, setShowTaskDescription] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [feedback, setFeedback] = useState('');

  const userMessageEvent = new Event('userMessageEvent');
  const chatGPTMessageEvent = new Event('chatGPTMessageEvent');
  const handleKeyUp = (event) => {
    console.log(event);
};


    useEffect(() => {
        if (window.LogUI) {
        let configurationObject = {
            logUIConfiguration: {
                endpoint: 'ws://127.0.0.1:8000/ws/endpoint/', 
                authorisationToken: 'eyJ0eXBlIjoibG9nVUktYXV0aG9yaXNhdGlvbi1vYmplY3QiLCJhcHBsaWNhdGlvbklEIjoiODY0NmZjNmQtMWRkNC00MzJjLTg5N2ItNzcyYmFhNTA1N2NiIiwiZmxpZ2h0SUQiOiJiYWRiZDdmNy01NGJmLTRjMGUtODI2Ni0yMjM2NjQyOTlmYmEifQ:1qV9qG:L0KWpXJv-ub5bU2n0TmLRkyKyfBpA9IUia7S2NXmt4M', 
                verbose: true,
                browserEvents: {
                },
            },
            applicationSpecificData: {
                userID: 'user123', 
            },
            trackingConfiguration: {
                'input-change': {
                    selector: '.chat-input input',
                    event: 'keyup',
                    name: 'INPUT_CHANGE',
                    metadata: [
                        {
                            nameForLog: 'inputValue',
                            sourcer: 'elementProperty',
                            lookFor: 'value',
                        }
                    ]
                },

                // Click event
                'message-send': {
                    selector: '.chat-input button',
                    event: 'click',
                    name: 'MESSAGE_SEND'
                },
                'feedback-popup-opened': {
                    selector: '.feedback-button',
                    event: 'click',
                    name: 'FEEDBACK_POPUP_OPENED'
                },
                'save-feedback': {
                    selector: '.feedback-saving-button',
                    event: 'click',
                    name: 'FEEDBACK_SAVED',
                },
                'task-started': {
                    selector: '.start-button',
                    event: 'click',
                    name: 'TASK_STARTED'
                },
                'task-description-viewed': {
                    selector: '.task-description-button',
                    event: 'click',
                    name: 'TASK_DESCRIPTION_VIEWED'
                },
                'task-description-closed': {
                    selector: '.task-description-closed-button',
                    event: 'click',
                    name: 'TASK_DESCRIPTION_CLOSED',
                },
                'task-completed': {
                    selector: '.finish-button',
                    event: 'click',
                    name: 'TASK_COMPLETED'
                },

                // Focus event
                'input-focus': {
                  selector: '.chat-input input',
                  event: 'focus',
                  name: 'INPUT_FOCUSED',
                },
                // DOMNodeInserted
                'user-message-event': {
                  selector: '.chat-window',
                  event: 'userMessageEvent',
                  name: 'USER_MESSAGE_EVENT',
                  metadata: [
                    {
                      nameForLog: 'messageContent',
                      sourcer: 'elementProperty',
                      lookFor: 'detail.content',
                    }
                  ]
                },
'chatgpt-message-event': {
    selector: '.chat-window',
    event: 'chatGPTMessageEvent',
    name: 'CHATGPT_MESSAGE_EVENT',
    metadata: [
        {
            nameForLog: 'latestChatGPTMessage',
            sourcer: 'elementProperty',
            lookFor: 'value',
            onElement: '#latestChatGPTMessage',
        }
    ]
}
            },
        };
            window.LogUI.init(configurationObject);
        } else {
        console.error("LogUI is not available!");
    }
    }, []);

useEffect(() => {
    const chatWindow = document.querySelector('.chat-window');
    const observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
          const addedNodes = Array.from(mutation.addedNodes);
          addedNodes.forEach(node => {
            if (node.classList.contains('user')) {
              // User message added
              const userMessageContent = node.querySelector('span').innerText;
              const userMessageEvent = new CustomEvent('userMessageEvent', {
                detail: { content: userMessageContent }
              });
              console.log("Dispatching userMessageEvent:", userMessageEvent); // Log the event
              chatWindow.dispatchEvent(userMessageEvent);
            } else if (node.classList.contains('chatgpt')) {
                // ChatGPT message added
                const chatGPTMessageContent = node.querySelector('span').innerText;
                document.getElementById('latestChatGPTMessage').value = chatGPTMessageContent;
                setChatGPTOutput(prevOutput => [...prevOutput, chatGPTMessageContent]); // Update the state here
                const chatGPTMessageEvent = new CustomEvent('chatGPTMessageEvent', {
                    detail: { content: chatGPTMessageContent }
                });
                console.log("Dispatching chatGPTMessageEvent:", chatGPTMessageEvent); // Log the event
                chatWindow.dispatchEvent(chatGPTMessageEvent);
            }
          });
        }
      }
    });

    if (chatWindow) {
      observer.observe(chatWindow, { childList: true });
    }

    return () => {
      observer.disconnect();
    };
}, []);


  const handleSend = async () => {
    if (input.trim() === '') return;


    setInput('');

    setMessages([...messages, { type: 'User', text: input }]);

    try {
      const response = await fetch('http://145.94.241.187:3000/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();


setMessages(prevMessages => [...prevMessages, { 
    type: 'ChatGPT', 
    text: data.message, 
    name: `CHATGPT_RESPONSE_${data.message.substring(0, 10).toUpperCase().replace(/\s+/g, '_')}` // It takes the first 10 characters of the message, make it uppercase, and replace spaces with underscores.
}]);


    } catch (error) {
      console.error("Error communicating with backend:", error);
      setMessages(prevMessages => [...prevMessages, { type: 'ChatGPT', text: "Sorry, I couldn't process that request." }]);
    }

  };

  const handleStart = () => {
  setShowPopup(false);
};

const handleFeedbackPopup = () => {
  setShowFeedbackPopup(true);
};

const saveFeedback = () => {
  // You can add logic here to store the feedback, send it to the server, etc.
  console.log(feedback);
  setFeedback('');
  setShowFeedbackPopup(false);
};

const navigate = useNavigate();

const handleFinish = () => {
    navigate('/finish');
};

const handleTaskDescriptionToggle = () => {   
    setShowTaskDescription(!showTaskDescription);
};

return (
  <>
    {/* Feedback Popup */}
    {showFeedbackPopup && (
      <div className="popup-overlay">
        <div className="popup">
          <p>Please provide your feedback:</p>
          <textarea 
            rows="4" 
            cols="50" 
            value={feedback} 
            onChange={(e) => setFeedback(e.target.value)}
          />
          <button className="feedback-saving-button" onClick={saveFeedback}>Save Feedback</button>
        </div>
      </div>
    )}

    {/* Task Starting Popup */}
    {showPopup && (
      <div className="popup-overlay">
        <div className="popup">
          <h3> Welcome to the Chat with ChatGPT!</h3>
          <p>Your task is to acquire information about the different types of prophylaxis medications for altitude sickness.</p>
          <p>If you forget the task contents, you can click the 'Task Description' button on the top left corner.</p>
          <p>
            When you complete the conversation, you can click the "I am done!" button at the top right of your screen to take you to another page where you can know what to do next.
          </p>
          <button className="start-button" onClick={handleStart}>Start</button>
        </div>
      </div>
    )}

    {/* Task Description Popup */}
    {showTaskDescription && ( 
      <div className="popup-overlay">
        <div className="popup">
          <p>In this task you are required to acquire information about the different types of prophylaxis medications for altitude sickness.</p>
          <button className="task-description-closed-button" onClick={handleTaskDescriptionToggle}>Close</button>
        </div>
      </div>
    )}

    {/* Main Chat Interface */}
    <div className="App">
      <div className="chat-header">
        <button className="task-description-button" onClick={handleTaskDescriptionToggle}>Task Description</button>
        Chat with ChatGPT 
        <button className="finish-button" onClick={handleFinish}>I am done!</button>
      </div>

<div className="chat-window">
    {messages.map((message, index) => (
        <div key={index} className={`message ${message.type.toLowerCase()}`}>
            <img src={message.type === 'User' ? userAvatar : chatbotAvatar} alt={`${message.type} avatar`} className="avatar" />
            <span data-name={message.name}><strong>{message.type}:</strong> {message.text}</span>
            {message.type === 'ChatGPT' && 
                <button className="feedback-button" onClick={handleFeedbackPopup}>Provide Feedback</button>}
        </div>
    ))}
    <input type="hidden" id="latestChatGPTMessage" value={latestChatGPTMessage} />
</div>



      <div className="chat-input">
        <input 
            placeholder="Type your message..." 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            onKeyUp={(e) => handleKeyUp(e)}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  </>
);


}

function FinishPage() {
    return (
        <div className="finish-page-container">
            <div className="finish-page-content">
                <h1>Completion Instructions</h1>
                <ol>
                    <li>Please copy the [code] to the qualtrics.</li>
                    <li>Close this page.</li>
                </ol>
            </div>
        </div>
    );
}


function Main() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/finish" element={<FinishPage />} />
            </Routes>
        </Router>
    );
}

export default Main;
