import React, { useState } from 'react'

const getStrength = (key, opts) => {
  const { length, types } = opts;
  if (!key || length < 1) return { label: 'Too Short', color: 'bg-gray-400', percent: 0 };
  if (length < 20 || types < 2) return { label: 'Weak', color: 'bg-red-500', percent: 25 };
  if (length < 40 || types < 3) return { label: 'Medium', color: 'bg-yellow-500', percent: 60 };
  return { label: 'Strong', color: 'bg-green-500', percent: 100 };
};

const ApiKeyGenerator = () => {
  const [apiKey, setApiKey] = useState('')
  const [keyLength, setKeyLength] = useState(32)
  const [includeSpecialChars, setIncludeSpecialChars] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [prefix, setPrefix] = useState('')
  const [suffix, setSuffix] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [copyMsg, setCopyMsg] = useState('')

  const generateApiKey = () => {
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    const numbers = '0123456789'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'

    let characters = ''
    if (includeSpecialChars) characters += specialChars
    if (includeNumbers) characters += numbers
    if (includeUppercase) characters += uppercase
    if (includeLowercase) characters += lowercase

    if (characters === '') {
      alert('Please select at least one character type')
      return
    }

    let result = ''
    for (let i = 0; i < keyLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    setApiKey(prefix + result + suffix)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey)
    setCopyMsg('Copied!')
    setTimeout(() => setCopyMsg(''), 1500)
  }

  // Regenerate with same settings
  const handleRegenerate = () => {
    generateApiKey()
  }

  // Count how many character types are selected
  const charTypes = [includeSpecialChars, includeNumbers, includeUppercase, includeLowercase].filter(Boolean).length;
  const strength = getStrength(apiKey, { length: keyLength, types: charTypes });

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">API Key Generator</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-gray-700 dark:text-gray-300">Key Length: {keyLength}</label>
          <input
            type="range"
            min="16"
            max="64"
            value={keyLength}
            onChange={(e) => setKeyLength(parseInt(e.target.value))}
            className="w-48"
          />
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Prefix (optional)"
            value={prefix}
            onChange={e => setPrefix(e.target.value)}
            className="flex-1 p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
          />
          <input
            type="text"
            placeholder="Suffix (optional)"
            value={suffix}
            onChange={e => setSuffix(e.target.value)}
            className="flex-1 p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeSpecialChars}
              onChange={(e) => setIncludeSpecialChars(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="text-gray-700 dark:text-gray-300">Include Special Characters</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="text-gray-700 dark:text-gray-300">Include Numbers</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeUppercase}
              onChange={(e) => setIncludeUppercase(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="text-gray-700 dark:text-gray-300">Include Uppercase Letters</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeLowercase}
              onChange={(e) => setIncludeLowercase(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="text-gray-700 dark:text-gray-300">Include Lowercase Letters</span>
          </label>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={generateApiKey}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Generate API Key
          </button>
          <button
            onClick={handleRegenerate}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Regenerate
          </button>
        </div>
        {apiKey && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                readOnly
                className="flex-1 p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-2 py-2 rounded transition-colors duration-200"
                title={showKey ? 'Hide Key' : 'Show Key'}
              >
                {showKey ? '🙈' : '👁️'}
              </button>
              <button
                onClick={copyToClipboard}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors duration-200"
              >
                Copy
              </button>
            </div>
            {copyMsg && <div className="text-green-600 text-sm">{copyMsg}</div>}
            <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
              <div className={`h-3 rounded-full ${strength.color}`} style={{ width: `${strength.percent}%` }}></div>
            </div>
            <div className="text-sm font-semibold mt-1 text-gray-700 dark:text-gray-300">Strength: {strength.label}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ApiKeyGenerator 