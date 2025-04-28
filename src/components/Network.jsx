import React, { useState, useEffect } from 'react';
import { AlertTriangle, Check, Wifi, Shield, ActivitySquare } from 'lucide-react';

const NetworkSecurityChatbot = () => {
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="text-blue-600" size={28} />
            <h1 className="ml-2 text-xl font-bold">Network Security Analyzer</h1>
          </div>
          <div className="text-sm text-gray-500">v1.0</div>
        </div>
      </header>
      
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {renderConnectionStatus()}
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            {renderContent()}
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-gray-300 p-4 text-center text-sm">
        Network Security Analyzer &copy; {new Date().getFullYear()} | All rights reserved
      </footer>
    </div>
  );
};

export default NetworkSecurityChatbot;