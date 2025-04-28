import { useState, useRef, useEffect } from 'react';

function SecChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const API_KEY = "AIzaSyAFWuD7AvPWLPmk1lkc8o45OUJ9v59Fh6Q";
  const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const welcomeMessage = {
      role: "assistant",
      content: "Hello! I'm your Security Assistant. How can I help you with cybersecurity questions, privacy concerns, or general security best practices today?"
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a Security Assistant chatbot. Provide helpful, accurate security advice. 
                  The user's message is: ${input}
                  Keep your response concise and focused on cybersecurity, data protection, privacy, secure practices, and security-related information.
                  IMPORTANT: Do not use asterisks or markdown formatting in your responses. Provide plain text responses only.`
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      
      let assistantResponse;
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        // Remove any asterisks from the response
        assistantResponse = data.candidates[0].content.parts[0].text.replace(/\*/g, '');
      } else {
        assistantResponse = "I'm sorry, I couldn't generate a response. Please try again.";
      }

      const assistantMessage = { role: "assistant", content: assistantResponse };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = { 
        role: "assistant", 
        content: "Sorry, there was an error processing your request. Please check your API key and try again." 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      if (speaking) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const clearChat = () => {
    const welcomeMessage = {
      role: "assistant",
      content: "Chat cleared. How else can I help with your security questions?"
    };
    setMessages([welcomeMessage]);
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <header className="bg-blue-700 p-4 shadow-lg border-b border-blue-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h1 className="text-2xl font-bold text-white">Security Assistant</h1>
          </div>
          <button 
            onClick={clearChat}
            className="text-white hover:text-gray-200 bg-blue-800 hover:bg-blue-900 px-3 py-1 rounded-lg text-sm transition-colors"
          >
            Clear Chat
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 overflow-auto">
        <div className="space-y-4 mb-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg max-w-3xl ${
                message.role === "user" 
                  ? "bg-blue-100 shadow-sm ml-auto border border-blue-200" 
                  : "bg-white shadow-sm mr-auto border-l-4 border-blue-700"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-sm">
                  {message.role === "user" ? "You" : "Security Assistant"}
                </div>
                {message.role === "assistant" && (
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => navigator.clipboard.writeText(message.content)}
                      className="text-gray-500 hover:text-blue-700 p-1 rounded-full transition-colors"
                      title="Copy to clipboard"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => speakText(message.content)}
                      className="text-gray-500 hover:text-blue-700 p-1 rounded-full transition-colors"
                      title={speaking ? "Stop speaking" : "Speak text"}
                    >
                      {speaking ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 010-7.072m12.728 0l-4.5-4.5a1 1 0 00-1.414 0L7.757 8.464" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
            </div>
          ))}
          {loading && (
            <div className="bg-white p-4 rounded-lg max-w-3xl mr-auto border-l-4 border-blue-700 shadow-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="bg-gray-100 border-t border-gray-200 p-4 shadow-inner">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about cybersecurity, privacy, or security best practices..."
            className="flex-1 bg-white text-gray-800 p-3 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 placeholder-gray-400 shadow-sm"
            disabled={loading}
          />
          <button
            type="submit"
            className={`px-4 py-3 rounded-r-lg transition-colors flex items-center justify-center ${loading || !input.trim() ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
        </form>
        <div className="max-w-4xl mx-auto mt-2 text-xs text-gray-500 text-center">
          Security Assistant provides general information, not professional security services. Always consult security professionals for critical matters.
        </div>
      </footer>
    </div>
  );
}

export default SecChatbot;