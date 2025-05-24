import React, { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import UserProfileForm from './components/UserProfileForm'

interface UserProfileData {
  name: string
  age: number
  income: number
  risk_tolerance: string
  investment_goal: string
  investment_horizon: string
}

const App: React.FC = () => {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasProfile, setHasProfile] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Check if user profile exists
    const checkProfile = async () => {
      try {
        const res = await fetch('/api/v1/portfolio/summary')
        if (res.ok) {
          const data = await res.json()
          setHasProfile(true)
          setUserId(data.user_id)
        }
      } catch (err) {
        console.error('Error checking profile:', err)
      }
    }

    checkProfile()
  }, [])

  const handleProfileSubmit = async (data: UserProfileData) => {
    try {
      const res = await fetch('/api/v1/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        throw new Error('Failed to create profile')
      }

      const profileData = await res.json()
      setUserId(profileData.user_id)
      setHasProfile(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, user_id: userId }),
      })

      if (!res.ok) {
        throw new Error('Failed to get response')
      }

      const data = await res.json()
      setResponse(data.response)
      setMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Financial Investment Advisor</h1>
        
        {!hasProfile ? (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Your Profile</h2>
            <UserProfileForm onSubmit={handleProfileSubmit} />
          </div>
        ) : (
          <>
            {/* Dashboard Section */}
            <div className="mb-8">
              <Dashboard />
            </div>

            {/* Chat Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Ask your investment question
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={4}
                    placeholder="e.g., What's a good investment strategy for retirement?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    loading || !message.trim()
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {loading ? 'Processing...' : 'Send'}
                </button>
              </form>

              {error && (
                <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  <strong className="font-bold">Error!</strong>
                  <span className="block sm:inline"> {error}</span>
                </div>
              )}

              {response && (
                <div className="mt-4">
                  <h2 className="text-lg font-medium text-gray-900">Response:</h2>
                  <div className="mt-2 p-4 bg-gray-50 rounded-md">
                    <p className="text-gray-700 whitespace-pre-wrap">{response}</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App 