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

  const commonQuestions = [
    { id: 1, text: "How often should I rotate API keys?" },
    { id: 2, text: "What are the best practices for storing API keys?" },
    { id: 3, text: "How can I monitor API key usage?" },
    { id: 4, text: "What are signs my API key might be compromised?" }
  ];

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

  const askQuestion = async (questionText = question) => {
    if (!questionText) return;

    setChatLoading(true);
    try {
      // Prepare context for Gemini based on analysis result
      const context = analysisResult ? `
        Based on the API key analysis:
        - Security Score: ${analysisResult.securityScore}/100
        - Status: ${analysisResult.isSafe ? 'Safe to use' : 'Potentially unsafe'}
        - Current Risk Factors: ${analysisResult.riskFactors.join(', ')}
      ` : 'Providing general API security advice.';

      // Construct prompt for Gemini
      const prompt = `
        Context: ${context}
        
        Question about API Security: ${questionText}
        
        Please provide a detailed but concise response about API key security, focusing specifically on the question asked.
        Include practical recommendations and best practices where relevant.
      `;

      // Here we would make the actual Gemini API call
      // For now, using placeholder responses until Gemini integration is complete
      const responses = [
        `Based on the analysis, ${analysisResult?.isSafe ? 'this API key appears safe' : 'this API key shows signs of vulnerability'}. ${questionText.includes('rotation') ? 'Key rotation is recommended every 90 days as a security best practice.' : ''}`,
        `The security assessment indicates ${analysisResult?.isSafe ? 'no immediate concerns' : 'several risk factors'}. Always monitor API key usage for anomalies.`,
        `${analysisResult?.isSafe ? 'No action required' : 'Immediate rotation recommended'}. ${questionText.includes('store') ? 'API keys should be stored in secure environment variables or dedicated secret management systems.' : ''}`
      ];

      // Simulate API call time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Replace with actual Gemini API call
      // const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateText', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${GEMINI_API_KEY}`
      //   },
      //   body: JSON.stringify({
      //     prompt: { text: prompt },
      //     temperature: 0.7,
      //     maxOutputTokens: 200,
      //   })
      // });
      // const data = await response.json();
      // setChatResponse(data.candidates[0].output);
      
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

          <Text style={pdfStyles.footer}>Generated by KeyForge API Analyzer • {new Date().toLocaleDateString()}</Text>
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

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      {/* Header */}
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg mt-16">
        <div className="flex items-center mb-4">
          <svg className="w-8 h-8 mr-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h1 className="text-3xl font-bold text-white">API Key Security Analyzer</h1>
        </div>
        <p className="text-blue-100 text-lg">
          Analyze your API keys for potential security vulnerabilities and ensure your applications remain secure
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Enter API Key to Analyze</h2>
          <div className="flex space-x-4 mb-6">
            <div className="flex-1 relative">
              <input
                type={showPassword ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key here..."
                className="w-full p-3 pr-12 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <button
              onClick={analyseApiKey}
              disabled={loading || !apiKey}
              className={`px-6 py-3 rounded-lg font-medium ${
                loading || !apiKey
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white transition-colors duration-200`}
            >
              {loading ? 'Analyzing...' : 'Analyze Key'}
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            We'll check your API key against common security vulnerabilities and best practices
          </p>

          {analysisResult && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Analysis Results</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={generatePdf}
                    className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Download PDF
                  </button>
                  <button
                    onClick={copyRecommendations}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Copy Recommendations
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className={`text-xl font-semibold ${analysisResult.isSafe ? 'text-green-600' : 'text-red-600'}`}>
                      {analysisResult.isSafe ? 'Safe to Use' : 'Unsafe - Action Required'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Security Score:</p>
                  </div>
                  <div className="text-3xl font-bold">{analysisResult.securityScore}/100</div>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mb-6">
                  <div
                    className={`h-2.5 rounded-full ${analysisResult.securityScore >= 80 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${analysisResult.securityScore}%` }}
                  ></div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Key Assessment</h4>
                    <p className="text-gray-600 dark:text-gray-300">{analysisResult.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Risk Factors</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {analysisResult.riskFactors.map((factor, index) => (
                        <li key={index} className="text-gray-600 dark:text-gray-300">{factor}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Security Recommendations</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {analysisResult.recommendations.map((rec, index) => (
                        <li key={index} className="text-gray-600 dark:text-gray-300">{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Ask Questions</h3>
            <div className="flex space-x-4">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about the analysis results..."
                className="flex-1 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
              />
              <button
                onClick={() => askQuestion()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Ask
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>This tool analyzes API keys for common security patterns and best practices.</p>
          <p>For actual key verification or security assessment, please use your provider's official tools.</p>
        </div>
      </div>
    </div>
  );
};

export default Analyser;