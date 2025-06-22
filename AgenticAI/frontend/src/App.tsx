import React, { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import UserProfileForm from './components/UserProfileForm'
import Portfolio from './components/Portfolio'
import Journal from './components/Journal'
import ChatBubble from './components/ChatBubble'
import ChatWindow from './components/ChatWindow'

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
  const [showEdit, setShowEdit] = useState(false)
  const [profileData, setProfileData] = useState<UserProfileData | null>(null)
  const [investmentProposal, setInvestmentProposal] = useState<string | null>(null)
  const [mcpContext, setMcpContext] = useState<any>(null);
  const [mcpHistory, setMcpHistory] = useState<any[]>([]);
  const [mcpLoading, setMcpLoading] = useState(false);
  const [mcpError, setMcpError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    // Check if user profile exists
    const checkProfile = async () => {
      try {
        const res = await fetch('/api/v1/portfolio/summary')
        if (res.ok) {
          const data = await res.json()
          if (data.no_profile) {
            setHasProfile(false)
            setUserId(null)
            setProfileData(null)
          } else {
            setHasProfile(true)
            setUserId(data.user_id)
            setProfileData({
              name: data.name,
              age: 0, // You may want to fetch age/income from a dedicated endpoint if not present
              income: 0,
              risk_tolerance: data.risk_tolerance,
              investment_goal: data.investment_goal,
              investment_horizon: data.investment_horizon,
            })
          }
        }
      } catch (err) {
        console.error('Error checking profile:', err)
      }
    }
    checkProfile()
  }, [])

  const reloadDashboard = async () => {
    try {
      const res = await fetch('/api/v1/portfolio/summary')
      if (res.ok) {
        const data = await res.json()
        if (data.no_profile) {
          setHasProfile(false)
          setUserId(null)
          setProfileData(null)
        } else {
          setHasProfile(true)
          setUserId(data.user_id)
          setProfileData({
            name: data.name,
            age: 0,
            income: 0,
            risk_tolerance: data.risk_tolerance,
            investment_goal: data.investment_goal,
            investment_horizon: data.investment_horizon,
          })
        }
      }
    } catch (err) {
      console.error('Error reloading dashboard:', err)
    }
  }

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
      await reloadDashboard()
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

  const runMcpAnalysis = async () => {
    if (!profileData) return;
    setMcpLoading(true);
    setMcpError(null);
    try {
      const res = await fetch('/api/v1/mcp/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profileData }),
      });
      if (!res.ok) throw new Error('Failed to run MCP analysis');
      const data = await res.json();
      setMcpContext(data.mcp_context);
      setMcpHistory(data.mcp_context?.history || []);
    } catch (err) {
      setMcpError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setMcpLoading(false);
    }
  };

  const renderContent = () => {
    if (!hasProfile) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create Your Profile</h2>
            <UserProfileForm onSubmit={async (data) => { await handleProfileSubmit(data); }} />
          </div>
        </div>
      );
    }
    
    if (showEdit && profileData) {
      return (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Your Profile</h2>
          <UserProfileForm
            onSubmit={async () => { await reloadDashboard(); }}
            initialValues={profileData}
            mode="edit"
            userId={userId || ''}
            onProposal={async (proposal) => {
              setInvestmentProposal(proposal)
              setShowEdit(false)
              await reloadDashboard()
            }}
          />
        </div>
      )
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <div className="mb-8">
              <Dashboard mcpContext={mcpContext} mcpHistory={mcpHistory} />
              <div className="flex gap-4 mt-4">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => setShowEdit(true)}
                >
                  Edit Profile
                </button>
                <button
                  className={`px-4 py-2 rounded text-white ${mcpLoading ? 'bg-blue-300' : 'bg-blue-700 hover:bg-blue-800'}`}
                  onClick={runMcpAnalysis}
                  disabled={mcpLoading}
                >
                  {mcpLoading ? 'Analyzing...' : 'Run MCP Analysis'}
                </button>
              </div>
              {mcpError && (
                <div className="mt-4 text-red-500">Error: {mcpError}</div>
              )}
            </div>
          </>
        );
      case 'portfolio':
        return <Portfolio />;
      case 'journal':
        return <Journal />;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Financial Investment Advisor</h1>
        
        {hasProfile && (
          <div className="mb-8 border-b border-gray-200">
            <nav className="-mb-px flex gap-6">
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'portfolio'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('portfolio')}
              >
                My Portfolio
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'journal'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('journal')}
              >
                Journal
              </button>
            </nav>
          </div>
        )}

        {renderContent()}

        {investmentProposal && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900">Investment Proposal:</h2>
            <div className="mt-2 p-4 bg-gray-50 rounded-md">
              <p className="text-gray-700 whitespace-pre-wrap">{investmentProposal}</p>
            </div>
          </div>
        )}
        
        {hasProfile && (
          <>
            <ChatBubble onClick={() => setIsChatOpen(true)} />
            <ChatWindow 
              isOpen={isChatOpen} 
              onClose={() => setIsChatOpen(false)}
              userId={userId}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default App 