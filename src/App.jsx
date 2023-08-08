import React, { useReducer, useEffect } from 'react';
import Chat from './Chat';
import './App.css';

const initialState = {
  openAIKey: '', // To store the user's OpenAI API key
  showChat: false, // To toggle the chat interface visibility
  error: '', // To store any validation error message
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_OPENAI_KEY':
      return { ...state, openAIKey: action.payload };
    case 'TOGGLE_CHAT':
      return { ...state, showChat: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { openAIKey, showChat, error } = state;

  useEffect(() => {
    // Check if the user has already provided the OpenAI key (e.g., saved in localStorage)
    const savedOpenAIKey = localStorage.getItem('openAIKey');
    if (savedOpenAIKey) {
      // Validate the OpenAI Key on load
      const isValidKey = /^sk-[a-zA-Z0-9]{48}$/.test(savedOpenAIKey);
      if (isValidKey) {
        dispatch({ type: 'SET_OPENAI_KEY', payload: savedOpenAIKey });
        dispatch({ type: 'TOGGLE_CHAT', payload: true });
      } else {
        localStorage.removeItem('openAIKey'); // Remove invalid key from local storage
      }
    }
  }, []);

  const handleOpenAIKeySubmit = async (e) => {
    e.preventDefault();

    // Validate the OpenAI Key
    const isValidKey = /^sk-[a-zA-Z0-9]{48}$/.test(openAIKey);
    if (!isValidKey) {
      dispatch({ type: 'SET_ERROR', payload: 'Invalid OpenAI Key. Please check your key and try again.' });
      return;
    }

    // Perform additional API call here to validate the key with the OpenAI service (not implemented here)

    localStorage.setItem('openAIKey', openAIKey);
    dispatch({ type: 'TOGGLE_CHAT', payload: true });
  };

  const handleOpenAIKeyChange = (e) => {
    dispatch({ type: 'SET_OPENAI_KEY', payload: e.target.value });
    dispatch({ type: 'SET_ERROR', payload: '' }); // Clear the error message when the user types
  };

  return (
    <div className="app">
      {showChat ? (
        <Chat openAIKey={openAIKey} />
      ) : (
        <div className="overlay">
          <div className="input-container">
            <h1>Welcome to NVIDIA Holochat!</h1>
            <form onSubmit={handleOpenAIKeySubmit}>
              <input
                type="text"
                placeholder="Enter your OpenAI Key"
                value={openAIKey}
                onChange={handleOpenAIKeyChange}
              />
              {error && <p className="error-message mb-2">{error}</p>}
              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
