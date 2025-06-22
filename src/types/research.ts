import { LucideIcon } from 'lucide-react'

export interface AgentMetadata {
  timestamp: string;
  version: string;
  status: 'success' | 'partial_success' | 'error';
}

export interface AgentResult {
  result?: string;
  error?: string;
  status: 'success' | 'error';
  timestamp: string;
}

export interface ResearchResults {
  manager: string;
  market: string;
  consumer: string;
  industry: string;
}

export interface ResearchResult {
  content: string;
  status: string;
  timestamp: string;
}

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

export interface ResearchResponse {
  metadata: {
    timestamp: string;
    version: string;
    status: string;
  };
  results: {
    manager?: ResearchResult;
    market?: ResearchResult;
    consumer?: ResearchResult;
    industry?: ResearchResult;
  };
  errors: Record<string, string>;
}

export interface ResearchRequest {
  product_name: string;
  context?: string;
}

export interface AgentConfig {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
} 