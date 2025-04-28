import React, { useState, useEffect, useRef, useContext } from 'react';
import { AlertTriangle, Check, Wifi, Shield, ActivitySquare } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

const NetworkSecurityChatbot = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [step, setStep] = useState('welcome'); 
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [networkSpeed, setNetworkSpeed] = useState({ download: 0, upload: 0 });
  const [answers, setAnswers] = useState({
    networkType: '',
    usesVPN: '',
    publicWifi: '',
    passwordStrength: '',
    deviceUpdates: ''
  });
  const [securityScore, setSecurityScore] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
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
      content: "Hello! I'm your Network Security Assistant. I can help you with network security concepts, protocols, best practices, and troubleshooting. What would you like to know?"
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      
      setNetworkSpeed({
        download: Math.floor(Math.random() * 80) + 20,
        upload: Math.floor(Math.random() * 30) + 10
      });
      
      if (Math.random() > 0.95) {
        setConnectionStatus('unstable');
        setTimeout(() => setConnectionStatus('connected'), 3000);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const questions = [
    {
      id: 'networkType',
      question: 'What type of network are you primarily using?',
      options: ['Home WiFi', 'Work Network', 'Mobile Data', 'Public WiFi']
    },
    {
      id: 'usesVPN',
      question: 'Do you use a VPN service?',
      options: ['Yes, always', 'Sometimes', 'No', 'Not sure what a VPN is']
    },
    {
      id: 'publicWifi',
      question: 'How often do you connect to public WiFi networks?',
      options: ['Daily', 'Weekly', 'Rarely', 'Never']
    },
    {
      id: 'passwordStrength',
      question: 'How would you rate your WiFi password strength?',
      options: ['Very Strong (16+ characters, mixed types)', 'Strong (12+ characters)', 'Moderate (8-12 characters)', 'Weak or Default']
    },
    {
      id: 'deviceUpdates',
      question: 'How often do you update your devices and router firmware?',
      options: ['Automatic updates enabled', 'Monthly', 'When reminded', 'Rarely or never']
    }
  ];

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers({...answers, [questionId]: answer});
  };

  const handleNext = () => {
    if (step === 'welcome') {
      setStep('questions');
    } else if (step === 'questions') {
  
      if (Object.values(answers).filter(answer => answer !== '').length === questions.length) {
        setStep('analyzing');
        analyzeNetwork();
      } else {
        alert('Please answer all questions before proceeding.');
      }
    }
  };

  const analyzeNetwork = () => {
    setIsLoading(true);
    
    setTimeout(() => {
 
      let score = 0;
      const newRecommendations = [];
      
      if (answers.networkType === 'Home WiFi') score += 20;
      else if (answers.networkType === 'Work Network') score += 25;
      else if (answers.networkType === 'Mobile Data') score += 15;
      else if (answers.networkType === 'Public WiFi') {
        score += 5;
        newRecommendations.push('Using public WiFi introduces significant security risks. Always use a VPN when connected to public networks.');
      }
      
      if (answers.usesVPN === 'Yes, always') score += 25;
      else if (answers.usesVPN === 'Sometimes') {
        score += 15;
        newRecommendations.push('Consider using a VPN consistently to enhance your connection security.');
      }
      else if (answers.usesVPN === 'No') {
        score += 5;
        newRecommendations.push('Installing and using a reputable VPN service would significantly improve your network security.');
      }
      else if (answers.usesVPN === 'Not sure what a VPN is') {
        score += 0;
        newRecommendations.push('A VPN (Virtual Private Network) encrypts your internet connection and provides anonymity. We recommend learning about and using VPN services.');
      }
      
      if (answers.publicWifi === 'Never') score += 25;
      else if (answers.publicWifi === 'Rarely') score += 20;
      else if (answers.publicWifi === 'Weekly') {
        score += 10;
        newRecommendations.push('Be cautious when using public WiFi networks. Use a VPN and avoid accessing sensitive information.');
      }
      else if (answers.publicWifi === 'Daily') {
        score += 5;
        newRecommendations.push('Daily use of public WiFi is a significant security risk. Always use a VPN and consider using mobile data for sensitive tasks.');
      }
      
      if (answers.passwordStrength === 'Very Strong (16+ characters, mixed types)') score += 25;
      else if (answers.passwordStrength === 'Strong (12+ characters)') score += 20;
      else if (answers.passwordStrength === 'Moderate (8-12 characters)') {
        score += 15;
        newRecommendations.push('Consider strengthening your WiFi password to at least 12 characters with a mix of letters, numbers, and symbols.');
      }
      else if (answers.passwordStrength === 'Weak or Default') {
        score += 5;
        newRecommendations.push('Your WiFi password is a critical security element. Change it immediately to a strong password of at least 12 characters with mixed character types.');
      }
      
      if (answers.deviceUpdates === 'Automatic updates enabled') score += 25;
      else if (answers.deviceUpdates === 'Monthly') score += 20;
      else if (answers.deviceUpdates === 'When reminded') {
        score += 15;
        newRecommendations.push('Set up automatic updates for all your devices and router firmware to ensure security patches are applied promptly.');
      }
      else if (answers.deviceUpdates === 'Rarely or never') {
        score += 5;
        newRecommendations.push('Update all your devices and router firmware immediately, and set a regular schedule for future updates. This is critical for security.');
      }
      
      setSecurityScore(score);
      setRecommendations(newRecommendations);
      
      setIsLoading(false);
      setStep('results');
    }, 3000);
  };

  const handleReset = () => {
    setStep('welcome');
    setAnswers({
      networkType: '',
      usesVPN: '',
      publicWifi: '',
      passwordStrength: '',
      deviceUpdates: ''
    });
    setSecurityScore(0);
    setRecommendations([]);
  };

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
                  text: `You are a Network Security Assistant chatbot. Provide helpful, accurate network security advice. 
                  The user's message is: ${input}
                  Keep your response concise and focused on network security, protocols, encryption, firewalls, and related topics.
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

  const clearChat = () => {
    const welcomeMessage = {
      role: "assistant",
      content: "Chat cleared. How else can I help with your network security questions?"
    };
    setMessages([welcomeMessage]);
  };

  const renderConnectionStatus = () => {
    return (
      <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow mb-4">
        <div className="flex items-center">
          <Wifi className={connectionStatus === 'connected' ? 'text-green-500' : 'text-amber-500'} size={24} />
          <div className="ml-3">
            <p className="font-medium">Connection Status</p>
            <p className={`text-sm ${connectionStatus === 'connected' ? 'text-green-600' : 'text-amber-600'}`}>
              {connectionStatus === 'connected' ? 'Connected' : 'Unstable'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Download</div>
          <div className="font-bold">{networkSpeed.download} Mbps</div>
          <div className="text-xs text-gray-500 mt-1">Upload</div>
          <div className="font-bold">{networkSpeed.upload} Mbps</div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">Network Security Assessment</h2>
            <p className="mb-8">Welcome to the Network Security Chatbot! I'll ask you a few questions to evaluate your network security posture and provide recommendations.</p>
            <button 
              onClick={handleNext}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Assessment
            </button>
          </div>
        );
        
      case 'questions':
        const currentQuestion = questions.find(q => !answers[q.id]) || questions[0];
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Security Assessment</h2>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Question {questions.findIndex(q => q.id === currentQuestion.id) + 1} of {questions.length}</span>
                <span className="text-sm text-gray-500">
                  {Object.values(answers).filter(a => a !== '').length} answered
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(Object.values(answers).filter(a => a !== '').length / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">{currentQuestion.question}</h3>
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => (
                  <div 
                    key={index}
                    onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      answers[currentQuestion.id] === option 
                        ? 'bg-blue-100 border-blue-500' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between">
              <button 
                onClick={() => {
                  // Find previous unanswered question
                  const answeredIds = Object.keys(answers).filter(id => answers[id] !== '');
                  if (answeredIds.length > 0) {
                    const lastAnsweredId = answeredIds[answeredIds.length - 1];
                    const lastAnsweredIndex = questions.findIndex(q => q.id === lastAnsweredId);
                    if (lastAnsweredIndex > 0) {
                      // Clear the last answer to go back
                      setAnswers({...answers, [lastAnsweredId]: ''});
                    }
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={Object.values(answers).filter(a => a !== '').length === 0}
              >
                Back
              </button>
              <button 
                onClick={handleNext}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {Object.values(answers).filter(answer => answer !== '').length === questions.length ? 'Analyze Network' : 'Next'}
              </button>
            </div>
          </div>
        );
        
      case 'analyzing':
        return (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
            <h2 className="text-xl font-bold mb-4">Analyzing Your Network Security</h2>
            <p className="text-gray-600">Please wait while we assess your network security based on your responses...</p>
          </div>
        );
        
      case 'results':
        let securityLevel = 'Critical';
        let levelColor = 'text-red-600';
        
        if (securityScore >= 85) {
          securityLevel = 'Excellent';
          levelColor = 'text-green-600';
        } else if (securityScore >= 70) {
          securityLevel = 'Good';
          levelColor = 'text-blue-600';
        } else if (securityScore >= 50) {
          securityLevel = 'Fair';
          levelColor = 'text-amber-600';
        } else if (securityScore >= 30) {
          securityLevel = 'Poor';
          levelColor = 'text-orange-600';
        }
        
        return (
          <div>
            <h2 className="text-xl font-bold mb-6">Security Assessment Results</h2>
            
            <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Security Score</h3>
                <span className={`text-2xl font-bold ${levelColor}`}>{securityScore}/100</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className={`${
                    securityScore >= 85 ? 'bg-green-500' : 
                    securityScore >= 70 ? 'bg-blue-500' : 
                    securityScore >= 50 ? 'bg-amber-500' : 
                    securityScore >= 30 ? 'bg-orange-500' : 'bg-red-500'
                  } h-3 rounded-full`}
                  style={{ width: `${securityScore}%` }}
                ></div>
              </div>
              
              <p className={`text-right font-medium ${levelColor}`}>{securityLevel}</p>
            </div>
            
            {recommendations.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Recommendations</h3>
                <div className="space-y-3">
                  {recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start">
                      <AlertTriangle className="text-amber-500 mt-1 flex-shrink-0" size={18} />
                      <p className="ml-2">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
              <button 
                onClick={handleReset}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Start Over
              </button>
              <button 
                onClick={() => {
                  alert('Detailed report would be generated here with API integration.');
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate Detailed Report
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'} text-gray-800 flex flex-col`}>
      <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-700 border-blue-800'} p-4 shadow-lg border-b`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h1 className="text-2xl font-bold text-white">Network Security Assistant</h1>
          </div>
          <button 
            onClick={clearChat}
            className={`text-white hover:text-gray-200 ${
              isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-800 hover:bg-blue-900'
            } px-3 py-1 rounded-lg text-sm transition-colors`}
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
                  ? `${isDarkMode ? 'bg-blue-900 border-blue-800' : 'bg-blue-100 border-blue-200'} shadow-sm ml-auto border` 
                  : `${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm mr-auto border-l-4 border-blue-700`
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className={`font-medium text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {message.role === "user" ? "You" : "Network Security Assistant"}
                </div>
                {message.role === "assistant" && (
                  <button 
                    onClick={() => navigator.clipboard.writeText(message.content)}
                    className={`${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-700'} p-1 rounded-full transition-colors`}
                    title="Copy to clipboard"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                )}
              </div>
              <p className={`whitespace-pre-wrap leading-relaxed ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{message.content}</p>
            </div>
          ))}
          {isLoading && (
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 rounded-lg max-w-3xl mr-auto border-l-4 border-blue-700 shadow-sm`}>
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
      
      <footer className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} border-t p-4 shadow-inner`}>
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about network security, protocols, or best practices..."
            className={`flex-1 ${
              isDarkMode 
                ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600' 
                : 'bg-white text-gray-800 placeholder-gray-400 border-gray-300'
            } p-3 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border shadow-sm`}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`px-4 py-3 rounded-r-lg transition-colors flex items-center justify-center ${
              isLoading || !input.trim() 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
        </form>
        <div className={`max-w-4xl mx-auto mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>
          Network Security Assistant provides general information, not professional security services. Always consult security professionals for critical matters.
        </div>
      </footer>
    </div>
  );
};

export default NetworkSecurityChatbot;