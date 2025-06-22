import { AgentConfig } from '@/types/research'
import { BarChart2, Search, Users, Lightbulb } from 'lucide-react'

export const agents: AgentConfig[] = [
  {
    id: 'manager',
    title: 'Research Manager',
    description: 'Strategy & Overview',
    icon: BarChart2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'market',
    title: 'Market Analyst',
    description: 'Market Trends & Competition',
    icon: Search,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  {
    id: 'consumer',
    title: 'Consumer Expert',
    description: 'Consumer Behavior & Segments',
    icon: Users,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200'
  },
  {
    id: 'industry',
    title: 'Industry Specialist',
    description: 'Technical & Industry Analysis',
    icon: Lightbulb,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200'
  }
]

export const API_ENDPOINTS = {
  analyze: '/api/analyze',
  health: '/api/health',
  cacheStats: '/api/cache/stats',
  cacheClear: '/api/cache/clear'
} as const 