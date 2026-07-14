
export enum AppID {
  BROWSER = 'browser',
  SHEET = 'sheet',
  WORD = 'word',
  GUIDE = 'guide',
  SETTINGS = 'settings',
  EXPLORER = 'explorer',
  BANNER = 'banner',
  HEALTH_MANAGEMENT = 'health-management'
}

export interface WindowState {
  id: AppID;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export type FolderType = 'downloads' | 'documents' | 'desktop' | 'trash' | 'root';

export interface VirtualFile {
  id: string;
  name: string;
  type: 'csv' | 'pdf' | 'doc' | 'img' | 'poster';
  folder: FolderType;
  content: any; 
  createdAt: Date;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  objective: string;
  correctSystem: 'SINAN' | 'SIM' | 'SIH' | 'SINASC'; // DATASUS System
  recommendedKeywords: string[];
}

export interface TabnetData {
  title: string;
  system: string; // SIM, SINAN, SIH
  columns: string[]; 
  rows: {
    label: string; 
    values: number[];
  }[];
  source: string;
}

export interface ArticleHit {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  abstract: string;
  cited?: boolean; // If the user saved this to their library
  isGoodStudy?: boolean;
  flawDescription?: string;
}

export enum EcologicalStep {
  SCENARIO_SELECTION = 0,
  STUDY_DESIGN_CHOICE = 1,
  PICO_FORMULATION = 2,
  DATA_COLLECTION = 3,
  ANALYSIS = 4,
  WRITING = 5,
  SUBMISSION = 6,
  AWAITING_REVIEW = 7,
  BANNER_CREATION = 8,
  JOURNAL_SUBMISSION = 9,
  CONGRESS_SUBMISSION = 10,
  LATTES_REGISTRATION = 11,
  HEALTH_MANAGEMENT = 12,
  COMPLETED = 13
}

export interface ClipboardItem {
  type: 'chart' | 'table';
  data: any; // MUST BE RAW JSON. NO REACT COMPONENTS.
  title?: string;
  timestamp: number;
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctIdx: number;
    explanation: string;
}

export interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  read: boolean;
  date: Date;
  hasAction?: boolean; 
  actionLabel?: string;
  quiz?: QuizQuestion; // New: Embedded Quiz
  quizSolved?: boolean;
}

export interface PICOResponse {
    feedback: string;
    isCorrect: boolean;
    suggestion?: string;
}

export interface GameStats {
    badSearchQueries: number;
    wrongDesignChoices: number;
    picoRetries: number;
    articlesRead: number;
    quizMistakes: number;
    
    // New Skills Tracking
    predatorySubmission?: boolean;
    managementMistakes?: number;
    integrityMistakes?: number;
}

export interface GameState {
    savedReferences: ArticleHit[];
    hasDownloadedData: boolean;
    hasPastedResults: boolean;
}
