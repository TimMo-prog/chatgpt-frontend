// ChatGPT frontend


import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';


import './App.css';
import userAvatar from './images/userAvatar.svg'; // Reference: https://freesvg.org/vector-clip-art-of-user-symbol
import chatbotAvatar from './images/chatbotAvatar.svg'; // Reference: https://freesvg.org/1538298822


function App() {
  const [userID, setUserID] = useState('user123');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatGPTOutput, setChatGPTOutput] = useState([]);
  const [latestInput, setLatestInput] = useState('');
  const [latestChatGPTMessage, setLatestChatGPTMessage] = useState('');
  const [showPopup, setShowPopup] = useState(true);
  const [showTaskDescription, setShowTaskDescription] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [feedback, setFeedback] = useState('');


  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const topicName = searchParams.get('TOPIC_NAME');
  const prolificPid = searchParams.get('PROLIFIC_PID');

  const userMessageEvent = new Event('userMessageEvent');
  const chatGPTMessageEvent = new Event('chatGPTMessageEvent');
  const handleKeyUp = (event) => {
    console.log(event);
};


  // Assigning PROLIFIC_PID to userID
  useEffect(() => {
    if (prolificPid) {
      setUserID(prolificPid);
    }
  }, [prolificPid]);

  const getTaskDescription = (topic) => {
    const descriptions = {
      'altitude_sickness': 'Your task is to acquire information about the different treatments for altitude sickness.',
      
      'american_revolutionary_war': 'Your task is to acquire information about key battles of the American Revolutionary War and their impact.',
      
      'carpenter_bees': 'Your task is to acquire information about types of habitats carpenter bees prefer.',
      
      'theory_of_evolution':'Your task is to acquire information about main criticisms of the theory of evolution.',
      
      'NASA':'Your task is to acquire information about major discoveries from NASA’s Mars Opportunity Rover.',
    };
    return descriptions[topic] || 'TOPIC_NAME does not exist';
  };



useEffect(() => {
    if (latestChatGPTMessage) {
        const chatWindow = document.querySelector('.chat-window');
        const chatGPTMessageEvent = new CustomEvent('chatGPTMessageEvent', {
            detail: { content: latestChatGPTMessage }
        });
        console.log("Dispatching chatGPTMessageEvent:", chatGPTMessageEvent);
        chatWindow.dispatchEvent(chatGPTMessageEvent);
    }
}, [latestChatGPTMessage]);

useEffect(() => {
    if (latestInput) {
        const chatWindow = document.querySelector('.chat-window');
        const userMessageEvent = new CustomEvent('userMessageEvent', {
            detail: { content: latestInput }
        });
        console.log("Dispatching userMessageEvent:", userMessageEvent);
        chatWindow.dispatchEvent(userMessageEvent);
    }
}, [latestInput]);




  const handleSend = async () => {
    if (input.trim() === '') return;


    setInput('');

    setMessages([...messages, { type: 'User', text: input }]);
    setLatestInput(input);

    try {
      const response = await fetch('http://localhost:3000/ask', {
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
    name: `CHATGPT_RESPONSE_${data.message.substring(0, 10).toUpperCase().replace(/\s+/g, '_')}` // Take the first 10 characters of the message, make it uppercase, and replace spaces with underscores.
}]);

setLatestChatGPTMessage(data.message);


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
            <div className="task-description-frame">
            <p>{getTaskDescription(topicName)}</p>
            </div>
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
            <p>{getTaskDescription(topicName)}</p>
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
    <input type="hidden" id="latestInput" value={latestInput} />
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
                <h1>Thank you for intertacting with the ChatGPT bot!</h1>
                <ol>
                    <li>Please copy the CBZF8LI to the Qualtrics.</li>
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
