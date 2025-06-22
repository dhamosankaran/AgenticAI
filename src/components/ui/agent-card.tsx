import React from 'react'
import { cn } from '@/lib/utils'
import { AgentConfig } from '@/types/research'
import { Loader2 } from 'lucide-react'
import { Button } from './button'
import { Copy, RefreshCw } from 'lucide-react'

interface AgentCardProps {
  agent: AgentConfig;
  content?: string;
  error?: string;
  isLoading?: boolean;
  onCopy?: (text: string) => void;
  onRetry?: (agentId: string) => void;
}

export function AgentCard({
  agent,
  content,
  error,
  isLoading,
  onCopy,
  onRetry
}: AgentCardProps) {
  const Icon = agent.icon

  return (
    <div className={cn(
      "rounded-xl p-6 border shadow-lg",
      agent.bgColor,
      agent.borderColor
    )}>
      <div className="prose prose-lg max-w-none">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-xl bg-white shadow-sm", agent.color)}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">{agent.title}</h2>
              <p className="text-gray-600 m-0">{agent.description}</p>
            </div>
          </div>
          {content && onCopy && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy(content)}
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy
            </Button>
          )}
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="text-red-700">{error}</div>
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRetry(agent.id)}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-4 prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-strong:text-gray-900">
            {isLoading && !content ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : (
              content
            )}
          </div>
        )}
      </div>
    </div>
  )
} 