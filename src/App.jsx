import React, { useState } from 'react'
import Hello from "./components/Hello"
import SecChatbot from "./components/SecChatbot"
import ApiKeyGenerator from "./components/ApiKeyGenerator"
import { ThemeProvider } from './context/ThemeContext'
import Navigation from './components/Navigation'

const App = () => {
  const [activeTab, setActiveTab] = useState('analyzer')

  const renderContent = () => {
    switch (activeTab) {
      case 'analyzer':
        return <Hello />
      case 'security':
        return <SecChatbot />
      case 'generator':
        return <ApiKeyGenerator />
      default:
        return <Hello />
    }
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="container mx-auto px-4">
          {renderContent()}
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App