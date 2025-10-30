export interface CommitData {
  id: string;
  message: string;
  author: string;
  timestamp: Date;
  diff: string;
}

export interface ReviewRule {
  id: string;
  name: string;
  description?: string;
  rule: string;
  enabled: boolean;
}

export interface SystemPrompt {
  id: string;
  name: string;
  prompt: string;
  isActive: boolean;
}

export interface ReviewRequest {
  commitIds: string[];
  systemPrompt: string;
  rules: ReviewRule[];
  commits: CommitData[];
}

export interface ReviewFinding {
  commitId: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  title: string;
  description: string;
  filePath?: string;
  lineNumber?: number;
  suggestion?: string;
}

export interface ReviewResponse {
  findings: ReviewFinding[];
  summary: string;
}

export interface AIProviderConfig {
  apiKey: string;
  apiBaseUrl?: string;
  model: string;
  timeout?: number;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}
