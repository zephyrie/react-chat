import React, { useState, useEffect, useRef } from 'react';
import initialMessages from './messages.json';

const Chat = ({ openAIKey }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const sendMessageToServer = async (userMessage) => {
    // Simulate a 2-second delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock function to simulate sending user message to the server and receiving a response
    const response = `Server response to: ${userMessage}`;
    return Promise.resolve(response);
  };

  useEffect(() => {
    // Load initial chat messages from the mock JSON file
    setMessages(initialMessages);
  }, []);

  useEffect(() => {
    // Scroll to the bottom of the chat when new messages are added
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputText.trim() === '' || isLoading) return; // Disable sending when already loading

    // Add the user's message to the chat (align to the right)
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: inputText, isUserMessage: true },
    ]);
    setInputText('');

    try {
      setIsLoading(true);

      // Send the user's message to the server
      const response = await sendMessageToServer(inputText);

      setIsLoading(false);

      // Add the server's response to the chat (align to the left)
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: response, isUserMessage: false },
      ]);
    } catch (error) {
      setIsLoading(false);
      console.error('Error sending message:', error);
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('openAIKey');
    setMessages(initialMessages); // Reset message history to initial messages
    window.location.reload(); // Reload the page to take the user back to the App.jsx page
  };

  return (
    <div className="chat min-h-screen flex flex-col w-full">
      {/* Header Bar */}
      <div className="nvidia-green text-white py-4 px-8 fixed top-0 left-0 w-full font-bold text-center flex items-center justify-between">
        <div className="flex-1 flex items-center justify-center">
          <span>NVIDIA Holochat</span>
        </div>
        <button
          className="text-white absolute right-5 font-bold px-4 py-2 rounded-lg border border-white hover:bg-white hover:text-green-500 transition-all duration-300 focus:outline-none"
          onClick={handleClearApiKey}
        >
          Clear API Key
        </button>
      </div>

      <div className="chat-container flex-1 px-4 p-16 pb-24 overflow-y-auto md:w-[50%] w-[90%] mx-auto whitespace-normal"> {/* Set width based on screen size and allow text wrapping */}
        <div className="messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${
                message.isUserMessage ? 'user' : 'server'
              } px-4 py-2 border-b-1 ${
                message.isUserMessage
                  ? 'self-end bg-gray-200 text-black text-right'
                  : 'self-start nvidia-green text-white'
              }`}
            >
              {message.text}
            </div>
          ))}
          {isLoading && (
            <div className="message server px-4 py-2 self-start nvidia-green text-white">
              Loading{Array.from({ length: 3 }, (_, i) => '.').join('')}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full py-4 px-8 bg-white">
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className={`flex-1 py-2 px-4 rounded-lg border 'border-gray-300' focus:outline-none focus:ring focus:border-green-500`}
          />
          <button
            type="submit"
            className={`ml-4 py-2 px-6 rounded-lg ${
              isLoading ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'nvidia-green text-white hover:bg-green-600'
            } focus:outline-none focus:ring focus:border-green-500`}
            disabled={isLoading} // Disable button while loading
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
