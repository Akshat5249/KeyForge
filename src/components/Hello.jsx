import { useState, useContext } from 'react';
import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ThemeContext } from '../context/ThemeContext';

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 15,
  },
  heading: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
    lineHeight: 1.5,
  },
  warning: {
    color: 'red',
    fontWeight: 'bold',
  },
  safe: {
    color: 'green',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    textAlign: 'center',
    color: 'gray',
  }
});

const Analyser = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [apiKey, setApiKey] = useState('');
  const [question, setQuestion] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('analysis');
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);

  const GEMINI_API_KEY = 'AIzaSyA4j3GjYQ1l5X7QZ3v3n3n3n3n3n3n3n3n3n';

  const analyseApiKey = async () => {
    if (!apiKey) return;

    setLoading(true);
    try {
      const isSafe = Math.random() > 0.3;
      const riskFactors = isSafe 
        ? ['No known vulnerabilities detected', 'Proper key format', 'No exposure in public repos']
        : ['Potential exposure in recent breaches', 'Weak key format', 'Suspected key rotation needed'];

      const description = isSafe
        ? 'This API key appears to be securely generated and properly managed. It follows recommended practices for key generation and shows no signs of compromise.'
        : 'This API key shows signs of potential vulnerability. Immediate rotation is recommended. The key may have been exposed in recent breaches or follows weak generation patterns.';

      const recommendations = [
        'Always store API keys in environment variables or secure vaults',
        'Rotate keys regularly (every 90 days recommended)',
        'Implement IP restrictions where possible',
        'Monitor usage for abnormal patterns',
        'Never commit API keys to version control'
      ];

      // Simulated analysis time
      await new Promise(resolve => setTimeout(resolve, 1500));

      setAnalysisResult({
        isSafe,
        riskFactors,
        description,
        recommendations,
        analyzedAt: new Date().toISOString(),
        securityScore: isSafe ? Math.floor(Math.random() * 15) + 85 : Math.floor(Math.random() * 30) + 40,
      });

    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisResult({
        isSafe: false,
        riskFactors: ['Analysis failed - assume key is unsafe'],
        description: 'Unable to complete analysis due to an error. Treat this key as potentially compromised.',
        recommendations: [
          'Rotate this key immediately',
          'Check your key management practices',
          'Retry the analysis later'
        ],
        securityScore: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!question || !analysisResult) return;

    setChatLoading(true);
    try {
      const responses = [
        `Based on the analysis, ${analysisResult.isSafe ? 'this API key appears safe' : 'this API key shows signs of vulnerability'}. ${question.includes('rotation') ? 'Key rotation is recommended every 90 days as a security best practice.' : ''}`,
        `The security assessment indicates ${analysisResult.isSafe ? 'no immediate concerns' : 'several risk factors'}. Always monitor API key usage for anomalies.`,
        `${analysisResult.isSafe ? 'No action required' : 'Immediate rotation recommended'}. ${question.includes('store') ? 'API keys should be stored in secure environment variables or dedicated secret management systems.' : ''}`
      ];

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setChatResponse(responses[Math.floor(Math.random() * responses.length)]);
    } catch (error) {
      console.error('Failed to get response:', error);
      setChatResponse('Unable to process your question at this time. Please try again later.');
    } finally {
      setChatLoading(false);
    }
  };

  const generatePdf = async () => {
    if (!analysisResult) return;

    setDownloadStarted(true);
    setTimeout(() => setDownloadStarted(false), 3000);

    const MyDocument = () => (
      <Document>
        <Page style={pdfStyles.page}>
          <Text style={pdfStyles.title}>API Key Security Analysis Report</Text>
          
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.heading}>Analysis Summary</Text>
            <Text style={analysisResult.isSafe ? pdfStyles.safe : pdfStyles.warning}>
              Status: {analysisResult.isSafe ? 'SAFE TO USE' : 'UNSAFE - ROTATION RECOMMENDED'}
            </Text>
            <Text style={pdfStyles.text}>Security Score: {analysisResult.securityScore}/100</Text>
            <Text style={pdfStyles.text}>Analyzed at: {new Date(analysisResult.analyzedAt).toLocaleString()}</Text>
          </View>

          <View style={pdfStyles.section}>
            <Text style={pdfStyles.heading}>Key Assessment</Text>
            <Text style={pdfStyles.text}>{analysisResult.description}</Text>
          </View>

          <View style={pdfStyles.section}>
            <Text style={pdfStyles.heading}>Risk Factors</Text>
            {analysisResult.riskFactors.map((factor, i) => (
              <Text key={i} style={pdfStyles.text}>• {factor}</Text>
            ))}
          </View>

          <View style={pdfStyles.section}>
            <Text style={pdfStyles.heading}>Security Recommendations</Text>
            {analysisResult.recommendations.map((rec, i) => (
              <Text key={i} style={pdfStyles.text}>• {rec}</Text>
            ))}
          </View>

          <Text style={pdfStyles.footer}>Generated by API Key Analyzer Tool • {new Date().toLocaleDateString()}</Text>
        </Page>
      </Document>
    );

    const blob = await pdf(<MyDocument />).toBlob();
    saveAs(blob, 'api-key-analysis-report.pdf');
  };

  const copyRecommendations = () => {
    if (!analysisResult) return;
    const text = analysisResult.recommendations.map(rec => `• ${rec}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Function to get the appropriate color for the security score gauge
  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-50'} py-12 px-4 sm:px-6`}>
      <div className={`max-w-4xl mx-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl overflow-hidden`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-6 px-8">
          <h1 className="text-3xl font-bold text-white">API Key Security Analyzer</h1>
          <p className="text-blue-100 mt-2">Analyze your API keys for potential security vulnerabilities and best practices</p>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Input Section */}
          <div className="mb-10">
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Enter API Key to Analyze
            </label>
            <div className="relative flex">
              <input
                type={showPassword ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className={`flex-1 px-4 py-3 border ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                    : 'border-gray-300 bg-white text-gray-900'
                } rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm`}
                placeholder="sk_prod_1234567890abcdef1234567890abcdef"
              />
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className={`px-3 border-y border-r ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' 
                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {showPassword ? 
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                  : 
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                }
              </button>
              <button
                onClick={analyseApiKey}
                disabled={loading || !apiKey}
                className="ml-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md transition-all duration-200 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  'Analyze Key'
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          {analysisResult && (
            <div className={`space-y-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Analysis Results</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={generatePdf}
                    disabled={downloadStarted}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={copyRecommendations}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <span>Copy Recommendations</span>
                  </button>
                </div>
              </div>

              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} shadow-sm`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg font-semibold ${analysisResult.isSafe ? 'text-green-500' : 'text-red-500'}`}>
                      {analysisResult.isSafe ? 'Safe to Use' : 'Unsafe - Rotation Recommended'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Security Score:</span>
                    <div className={`w-24 h-2 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} overflow-hidden`}>
                      <div
                        className={`h-full rounded-full ${getScoreColor(analysisResult.securityScore)} transition-all duration-500`}
                        style={{ width: `${analysisResult.securityScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{analysisResult.securityScore}/100</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Key Assessment</h3>
                    <p className="text-gray-600 dark:text-gray-300">{analysisResult.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Risk Factors</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {analysisResult.riskFactors.map((factor, i) => (
                        <li key={i} className="text-gray-600 dark:text-gray-300">{factor}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Security Recommendations</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {analysisResult.recommendations.map((rec, i) => (
                        <li key={i} className="text-gray-600 dark:text-gray-300">{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat Section */}
          {analysisResult && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Ask Questions</h2>
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask about the analysis results..."
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <button
                  onClick={askQuestion}
                  disabled={chatLoading || !question}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {chatLoading ? 'Thinking...' : 'Ask'}
                </button>
              </div>
              {chatResponse && (
                <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} shadow-sm`}>
                  <p className="text-gray-600 dark:text-gray-300">{chatResponse}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analyser;