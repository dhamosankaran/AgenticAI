'use client'
//filename: page.tsx
import { useState, useEffect } from 'react'
import { useCompletion } from 'ai/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ResearchResults } from '@/components/ResearchResults'
import { Loader2, Search, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { VoiceSearch } from '@/components/VoiceSearch'

type AnalysisStatus = 'success' | 'error' | 'partial_success'
type AgentType = 'manager' | 'market' | 'consumer' | 'industry'
interface ChartData {
    type: 'bar' | 'line' | 'pie';
    title: string;
    data: {
        labels: string[];
        datasets: {
            label: string;
            data: number[];
        }[];
    };
}
interface TableData {
    title: string;
    headers: string[];
    rows: Record<string, string>[];
}

interface AgentResult {
    content?: string;
    charts?: ChartData[];
    tables?: TableData[];
    error?: string;
    status: 'success' | 'error';
    timestamp: string;
}

interface AnalysisState {
    metadata: {
        timestamp: string;
        version: string;
        status: AnalysisStatus;
    };
    results: {
        manager: AgentResult;
        market: AgentResult;
        consumer: AgentResult;
        industry: AgentResult;
    };
    errors: Record<string, string>;
}

interface SavedSearch {
  id: string;
  query: string;
  context: string;
  timestamp: string;
}

interface Template {
  id: string;
  name: string;
  context: string;
}

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'market-analysis',
    name: 'Market Analysis',
    context: 'Focus on market size, growth trends, key players, and competitive landscape'
  },
  {
    id: 'consumer-behavior',
    name: 'Consumer Behavior',
    context: 'Analyze target demographics, buying patterns, preferences, and pain points'
  },
  {
    id: 'competitive-analysis',
    name: 'Competitive Analysis',
    context: 'Deep dive into main competitors, their strategies, strengths, and weaknesses'
  }
]

export default function MarketResearchPage() {
    const [productName, setProductName] = useState('')
    const [context, setContext] = useState('')
    const [isListening, setIsListening] = useState(false)
    const initialAgentResult: AgentResult = {
        status: 'success',
        timestamp: new Date().toISOString(),
    };
    const [analysisResults, setAnalysisResults] = useState<AnalysisState>({
        metadata: {
            timestamp: new Date().toISOString(),
            version: '2.0',
            status: 'success'
        },
        results: {
            manager: {
                status: 'success',
                timestamp: new Date().toISOString()
            },
            market: {
                status: 'success',
                timestamp: new Date().toISOString()
            },
            consumer: {
                status: 'success',
                timestamp: new Date().toISOString()
            },
            industry: {
                status: 'success',
                timestamp: new Date().toISOString()
            }
        },
        errors: {}
    })

    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

    // Debug logging for API configuration
    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_INTERNAL_API_KEY;
        console.log('API Configuration Debug:', {
            hasApiKey: !!apiKey,
            apiKeyLength: apiKey?.length,
            isDevelopment: process.env.NODE_ENV === 'development',
            envVars: Object.keys(process.env).filter(key => key.includes('INTERNAL_API_KEY'))
        });
    }, []);

    // Add debug logging for state changes
    useEffect(() => {
        console.log('Analysis results updated:', analysisResults)
    }, [analysisResults])

    const { complete, isLoading } = useCompletion({
        api: '/api/chat',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.NEXT_PUBLIC_INTERNAL_API_KEY || ''
        },
        onResponse: async (response) => {
            // Log headers being sent
            console.log('Request Headers:', {
                hasApiKey: !!process.env.NEXT_PUBLIC_INTERNAL_API_KEY,
                apiKeyLength: process.env.NEXT_PUBLIC_INTERNAL_API_KEY?.length
            });
            // Add response debug logging
            console.log('Response Debug:', {
                status: response.status,
                url: response.url,
                headers: Object.fromEntries(response.headers.entries())
            });
            console.log('Response received:', response.status)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            setIsAnalysisLoading(true);

            const reader = response.body?.getReader()
            const decoder = new TextDecoder()
            let buffer = ''

            try {
                while (true) {
                    const { done, value } = await reader!.read()
                    if (done) break

                    const chunk = decoder.decode(value)
                    buffer += chunk

                    // Process complete messages
                    const lines = buffer.split('\n')
                    buffer = lines.pop() || '' // Keep incomplete line

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const jsonData = JSON.parse(line.slice(6))
                                console.log('Parsed streaming data:', jsonData)

                                // Handle the complete response object with results
                                if (jsonData.metadata && jsonData.results) {
                                    const newResults: Record<string, AgentResult> = {};
                                    Object.entries(jsonData.results).forEach(([key, value]) => {
                                        if (key === 'manager' || key === 'market' || key === 'consumer' || key === 'industry') {
                                            newResults[key] = {
                                                content: typeof value === 'string' ? value : (value as any)?.content,
                                                charts: (value as any)?.charts || [],
                                                tables: (value as any)?.tables || [],
                                                status: 'success',
                                                timestamp: new Date().toISOString()
                                            };
                                        }
                                    });

                                    setAnalysisResults(prev => ({
                                        metadata: {
                                            timestamp: jsonData.metadata.timestamp || new Date().toISOString(),
                                            version: jsonData.metadata.version || '2.0',
                                            status: jsonData.metadata.status || 'error'
                                        },
                                        results: {
                                            ...prev.results,
                                            ...newResults
                                        },
                                        errors: jsonData.errors || {}
                                    }));
                                }

                                // Handle streaming updates
                                if (jsonData.results) {
                                    const newResults: Record<string, AgentResult> = {};
                                    Object.entries(jsonData.results).forEach(([key, value]) => {
                                        if (key === 'manager' || key === 'market' || key === 'consumer' || key === 'industry') {
                                            newResults[key] = {
                                                content: typeof value === 'string' ? value : (value as any)?.content,
                                                charts: (value as any)?.charts || [],
                                                tables: (value as any)?.tables || [],
                                                status: 'success',
                                                timestamp: new Date().toISOString()
                                            };
                                        }
                                    });

                                    setAnalysisResults(prev => ({
                                        ...prev,
                                        results: {
                                            ...prev.results,
                                            ...newResults
                                        }
                                    }));
                                }
                            } catch (err) {
                                console.error('Error parsing JSON:', err)
                                setAnalysisResults(prev => ({
                                    ...prev,
                                    metadata: { ...prev.metadata, status: 'error' },
                                    errors: {
                                        ...prev.errors,
                                        parsing: `Error parsing response: ${err instanceof Error ? err.message : 'Unknown error'}`
                                    }
                                }))
                            }
                        }
                    }
                }
            } catch (err) {
                console.error('Error reading stream:', err)
                setAnalysisResults(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata, status: 'error' },
                    errors: {
                        ...prev.errors,
                        stream: `Error reading stream: ${err instanceof Error ? err.message : 'Unknown error'}`
                    }
                }))
            } finally {
                reader?.releaseLock()
                 setIsAnalysisLoading(false);
            }
        },
        onFinish: () => {
            console.log('Analysis completed, final results:', analysisResults)
            if (Object.keys(analysisResults.errors).length === 0) {
                setAnalysisResults(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata, status: 'success' }
                }))
                toast.success('Analysis completed successfully!')
            }
            setIsAnalysisLoading(false);
        },
        onError: (error) => {
            console.error('Analysis error:', error)
            setAnalysisResults(prev => ({
                ...prev,
                metadata: { ...prev.metadata, status: 'error' },
                errors: {
                    ...prev.errors,
                    system: error.message || 'Failed to analyze'
                }
            }))
            toast.error(error.message || 'Analysis failed')
            setIsAnalysisLoading(false);
        }
    })

    const handleSubmit = async () => {
        if (!productName) {
            toast.error('Please enter a product or service name')
            return
        }

        try {
            console.log('Starting new analysis')
            // Reset results before starting new analysis
            setAnalysisResults({
                metadata: {
                    timestamp: new Date().toISOString(),
                    version: '2.0',
                    status: 'success'
                },
                results: {
                    manager: initialAgentResult,
                    market: initialAgentResult,
                    consumer: initialAgentResult,
                    industry: initialAgentResult
                },
                errors: {}
            })
            setIsAnalysisLoading(true)

            const requestBody = {
                product_name: productName,
                context: context || ''
            };

            console.log('Submitting analysis with payload:', requestBody)
            await complete(JSON.stringify(requestBody))

        } catch (err: any) {
            console.error('Error during analysis:', {
                error: err,
                message: err.message,
                stack: err.stack
            })
            setAnalysisResults(prev => ({
                ...prev,
                metadata: {
                    ...prev.metadata,
                    status: 'error'
                },
                errors: {
                    ...prev.errors,
                    system: err.message || 'Failed to complete analysis'
                }
            }))
            toast.error('Failed to complete analysis. Please try again.')
        }
    }

    const handleVoiceResult = (transcript: string) => {
        setProductName(transcript)
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 sm:py-12">
                {/* Header Section */}
                <div className="flex flex-col items-center space-y-3 sm:space-y-4 text-center mb-6 sm:mb-8">
                    <Search className="h-8 w-8 sm:h-12 sm:w-12 text-blue-500" />
                    <h1 className="text-xl sm:text-4xl font-bold text-blue-500 leading-tight">
                        AI Market Research System
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600">Powered by Advanced AI</p>
                </div>

                {/* Main Input Section */}
                <div className="space-y-4 bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                    {/* Search Input Group */}
                    <div className="flex flex-col space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter product or market name"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                className="flex-1 h-10 sm:h-12 text-base sm:text-lg"
                            />
                            <VoiceSearch
                                onResult={handleVoiceResult}
                                isListening={isListening}
                                setIsListening={setIsListening}
                            />
                        </div>
                    </div>

                    {/* Context Textarea */}
                    <Textarea
                        placeholder="Add additional context or requirements (optional)"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                    />

                    {/* Action Button */}
                    <div className="flex justify-center">
                        <Button 
                            onClick={handleSubmit} 
                            className="w-full sm:w-auto h-12 text-base px-8"
                            disabled={isLoading || !productName}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    <span className="text-sm sm:text-base">Analyzing Market</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-sm sm:text-base">Analyze Market</span>
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Results Section */}
                {(isAnalysisLoading || Object.values(analysisResults.results).some((r: AgentResult) => 
                    Boolean(r?.content) || (r?.charts && r.charts.length > 0) || (r?.tables && r.tables.length > 0)
                )) && (
                    <div className="mt-6 sm:mt-8">
                        <ResearchResults
                            content={analysisResults}
                            isLoading={isAnalysisLoading}
                            onRetry={(agentId) => {
                                console.log('Retry requested for:', agentId)
                                // Implement retry logic here
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}