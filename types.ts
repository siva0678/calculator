
export interface Calculation {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface AIResponse {
  solution: string;
  explanation: string;
  steps: string[];
}

export enum CalcMode {
  BASIC = 'BASIC',
  SCIENTIFIC = 'SCIENTIFIC',
  AI = 'AI'
}
