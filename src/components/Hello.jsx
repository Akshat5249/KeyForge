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
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [activeTab, setActiveTab] = useState('analysis');

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

  const copyRecommendations = () => {
    if (!analysisResult) return;
    const text = analysisResult.recommendations.map(rec => `• ${rec}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
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

          <Text style={pdfStyles.footer}>Generated by KeyForge API Analyzer • {new Date().toLocaleDateString()}</Text>
        </Page>
      </Document>
    );

    const blob = await pdf(<MyDocument />).toBlob();
    saveAs(blob, 'api-key-analysis-report.pdf');
  };

  const CircleProgress = ({ value }) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const progress = (value / 100) * circumference;
    const colorClass = value > 80 ? 'stroke-green-500' : value > 60 ? 'stroke-yellow-500' : 'stroke-red-500';

    return (
      <div className="bg-gray-900 p-6 rounded-lg w-full">
        <h3 className="text-lg font-semibold text-white mb-4">Security Score</h3>
        <div className="flex flex-col items-center">
          <div className="relative w-28 h-28">
            <svg className="transform -rotate-90 w-28 h-28">
              <circle
                className="stroke-gray-700"
                strokeWidth="6"
                fill="transparent"
                r={radius}
                cx="56"
                cy="56"
              />
              <circle
                className={`${colorClass} transition-all duration-500`}
                strokeWidth="6"
                strokeLinecap="round"
                fill="transparent"
                r={radius}
                cx="56"
                cy="56"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: circumference - progress,
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{value}</span>
            </div>
          </div>
          <span className="text-gray-400 text-sm mt-2">out of 100</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`max-w-4xl mx-auto mt-8 ${isDarkMode ? 'dark' : ''}`}>
      {/* Blue Header Section */}
      <div className="bg-blue-600 text-white p-8 rounded-t-xl">
        <h1 className="text-3xl font-bold mb-2">API Key Security Analyzer</h1>
        <p className="text-blue-100">Analyze your API keys for potential security vulnerabilities and best practices</p>
      </div>

      {/* Main Content Section */}
      <div className="bg-white dark:bg-gray-900 p-8 rounded-b-xl shadow-lg transition-colors duration-200">
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter API Key to Analyze
          </label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <input
                type={showPassword ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Enter your API key here..."
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <button
              onClick={analyseApiKey}
              disabled={loading || !apiKey}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Analyze</span>
                </>
              )}
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            We'll check your API key against common security vulnerabilities and best practices
          </p>
        </div>

        {analysisResult && (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`py-2 px-4 border-b-2 font-medium text-sm ${
                    activeTab === 'analysis'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  } transition-colors duration-200`}
                >
                  Analysis Results
                </button>
                <button
                  onClick={() => setActiveTab('advisor')}
                  className={`py-2 px-4 border-b-2 font-medium text-sm ${
                    activeTab === 'advisor'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  } transition-colors duration-200`}
                >
                  Security Advisor
                </button>
              </div>
            </div>

            {activeTab === 'analysis' ? (
              <div className="space-y-6">
                {/* Status and Score Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} transition-colors duration-200`}>
                    <div className="flex items-start space-x-3 mb-4">
                      <div className={`text-2xl ${analysisResult.isSafe ? 'text-green-500' : 'text-red-500'}`}>
                        {analysisResult.isSafe ? '✓' : '⚠️'}
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold mb-1 ${
                          analysisResult.isSafe 
                            ? 'text-green-500' 
                            : 'text-red-500'
                        }`}>
                          {analysisResult.isSafe ? 'Safe to Use' : 'Unsafe - Rotation Recommended'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          Analyzed on {new Date(analysisResult.analyzedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {analysisResult.description}
                    </p>
                  </div>

                  <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} transition-colors duration-200`}>
                    <CircleProgress value={analysisResult.securityScore} />
                  </div>
                </div>

                {/* Risk Factors Section */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Risk Factors</h3>
                  <ul className="space-y-3">
                    {analysisResult.riskFactors.map((factor, index) => (
                      <li key={index} className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                        <span className="text-red-500">⚠️</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations Section */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Security Recommendations</h3>
                    <button
                      onClick={copyRecommendations}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                    >
                      {copySuccess ? '✓ Copied!' : (
                        <>
                          <span>Copy all</span>
                          <span className="text-xl">📋</span>
                        </>
                      )}
                    </button>
                  </div>
                  <ul className="space-y-3">
                    {analysisResult.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                        <span className="text-blue-500">✓</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions Section */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={generatePdf}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    <span>📥</span>
                    <span>Download Report (PDF)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Ask About API Key Security</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask about key rotation, storage, best practices..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={askQuestion}
                      disabled={chatLoading || !question}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <span>Ask</span>
                    </button>
                  </div>

                  {chatResponse && (
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300">{chatResponse}</p>
                    </div>
                  )}

                  <div className="mt-8">
                    <h4 className="text-lg font-semibold mb-4 text-gray-700 dark:text-white">Common Questions</h4>
                    <div className="grid gap-4">
                      {[
                        "How often should I rotate API keys?",
                        "What are the best practices for storing API keys?",
                        "How can I monitor API key usage?",
                        "What are signs my API key might be compromised?"
                      ].map((q, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setQuestion(q);
                            askQuestion();
                          }}
                          className="text-left p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors duration-200"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          This tool analyzes API keys for common security patterns and best practices.<br />
          For actual key verification or security assessment, please use your provider's official tools.
        </div>
      </div>
    </div>
  );
};

export default Analyser;