// GitHub Contributors Service
// Maps users to their GitHub statistics and validates contributor access

export interface ContributorStats {
  totalCommits: number;
  linesAdded: number;
  netLines: number;
  developmentDays: number;
  peakActivityDays: { date: string; commits: number; label: string }[];
  topModifiedFiles: { name: string; modifications: number; category: string }[];
  timelineData: TimelineItem[];
}

export interface TimelineItem {
  date: string;
  title: string;
  description: string;
  commits: number;
  type: 'foundation' | 'development' | 'enhancement' | 'optimization' | 'finalization';
  icon: any;
  achievements: string[];
}

// GitHub contributor mapping - maps emails to GitHub usernames and their stats
const GITHUB_CONTRIBUTORS: Record<string, ContributorStats> = {
  'juan294@gmail.com': {
    totalCommits: 73,
    linesAdded: 37560,
    netLines: 30118,
    developmentDays: 26,
    peakActivityDays: [
      { date: "2025-06-21", commits: 11, label: "Peak Day #1" },
      { date: "2025-06-10", commits: 11, label: "Peak Day #2" },
      { date: "2025-06-29", commits: 7, label: "Feature Sprint" },
      { date: "2025-06-23", commits: 7, label: "Feature Sprint" },
      { date: "2025-06-22", commits: 6, label: "High Activity" },
      { date: "2025-06-19", commits: 6, label: "High Activity" }
    ],
    topModifiedFiles: [
      { name: "SpanishTranslations.ts", modifications: 37, category: "Localization" },
      { name: "App.tsx", modifications: 24, category: "Core Architecture" },
      { name: "ModernSidebar.tsx", modifications: 11, category: "UI Components" },
      { name: "Dashboard.tsx", modifications: 10, category: "Main Interface" },
      { name: "Services.tsx", modifications: 8, category: "Feature Pages" }
    ],
    timelineData: [
      {
        date: "June 10, 2025",
        title: "Project Genesis",
        description: "Initial foundation and architecture setup",
        commits: 11,
        type: "foundation",
        icon: null, // Will be set in the component
        achievements: ["Project scaffolding", "Core architecture", "Initial routing"]
      },
      {
        date: "June 15, 2025",
        title: "Core Development",
        description: "Building essential features and components",
        commits: 18,
        type: "development",
        icon: null,
        achievements: ["Dashboard implementation", "Authentication flow", "Component library"]
      },
      {
        date: "June 20, 2025",
        title: "AI Integration",
        description: "Revolutionary AI-powered services implementation",
        commits: 21,
        type: "enhancement",
        icon: null,
        achievements: ["Storytelling service", "Real-time illustrations", "Voice integration"]
      },
      {
        date: "June 25, 2025",
        title: "Localization Excellence",
        description: "Comprehensive bilingual system implementation",
        commits: 15,
        type: "enhancement",
        icon: null,
        achievements: ["Hybrid translation", "Spanish dictionary", "Component localization"]
      },
      {
        date: "June 30, 2025",
        title: "Platform Finalization",
        description: "Final optimizations and feature completion",
        commits: 8,
        type: "finalization",
        icon: null,
        achievements: ["Performance optimization", "UI refinements", "Production readiness"]
      }
    ]
  },
  // Francisco Rivas - Second developer
  'franciscojrivash@gmail.com': {
    totalCommits: 45,
    linesAdded: 28000,
    netLines: 25400,
    developmentDays: 22,
    peakActivityDays: [
      { date: "2025-06-12", commits: 8, label: "Backend Focus" },
      { date: "2025-06-18", commits: 7, label: "API Development" },
      { date: "2025-06-25", commits: 6, label: "Database Work" }
    ],
    topModifiedFiles: [
      { name: "auth.ts", modifications: 15, category: "Authentication" },
      { name: "supabase.ts", modifications: 12, category: "Database" },
      { name: "serverless.ts", modifications: 10, category: "Backend" }
    ],
    timelineData: [
      {
        date: "June 12, 2025",
        title: "Backend Foundation",
        description: "Core backend services and API setup",
        commits: 15,
        type: "foundation",
        icon: null,
        achievements: ["API architecture", "Database schema", "Authentication"]
      },
      {
        date: "June 18, 2025",
        title: "Service Implementation",
        description: "Building robust backend services",
        commits: 20,
        type: "development",
        icon: null,
        achievements: ["CRUD operations", "Data validation", "Error handling"]
      },
      {
        date: "June 25, 2025",
        title: "Integration & Testing",
        description: "Frontend-backend integration and testing",
        commits: 10,
        type: "finalization",
        icon: null,
        achievements: ["API integration", "Testing suite", "Documentation"        ]
      }
    ]
  },
  // Francisco Rivas - Alternative Roots email mapping
  'fran@roots.com': {
    totalCommits: 45,
    linesAdded: 28000,
    netLines: 25400,
    developmentDays: 22,
    peakActivityDays: [
      { date: "2025-06-12", commits: 8, label: "Backend Focus" },
      { date: "2025-06-18", commits: 7, label: "API Development" },
      { date: "2025-06-25", commits: 6, label: "Database Work" }
    ],
    topModifiedFiles: [
      { name: "auth.ts", modifications: 15, category: "Authentication" },
      { name: "supabase.ts", modifications: 12, category: "Database" },
      { name: "serverless.ts", modifications: 10, category: "Backend" }
    ],
    timelineData: [
      {
        date: "June 12, 2025",
        title: "Backend Foundation",
        description: "Core backend services and API setup",
        commits: 15,
        type: "foundation",
        icon: null,
        achievements: ["API architecture", "Database schema", "Authentication"]
      },
      {
        date: "June 18, 2025",
        title: "Service Implementation",
        description: "Building robust backend services",
        commits: 20,
        type: "development",
        icon: null,
        achievements: ["CRUD operations", "Data validation", "Error handling"]
      },
      {
        date: "June 25, 2025",
        title: "Integration & Testing",
        description: "Frontend-backend integration and testing",
        commits: 10,
        type: "finalization",
        icon: null,
        achievements: ["API integration", "Testing suite", "Documentation"]
      }
    ]
  }
};

export class GitHubContributorsService {
  /**
   * Check if a user email is a valid GitHub contributor
   */
  static isValidContributor(email: string): boolean {
    return email in GITHUB_CONTRIBUTORS;
  }

  /**
   * Get contributor statistics for a specific user
   */
  static getContributorStats(email: string): ContributorStats | null {
    return GITHUB_CONTRIBUTORS[email] || null;
  }

  /**
   * Get all contributor emails (for menu access control)
   */
  static getAllContributorEmails(): string[] {
    return Object.keys(GITHUB_CONTRIBUTORS);
  }

  /**
   * Get contributor display name from email
   */
  static getContributorDisplayName(email: string): string {
    // You can customize this mapping if needed
    const nameMap: Record<string, string> = {
      'juan294@gmail.com': 'Juan González',
      'franciscojrivash@gmail.com': 'Francisco Rivas',
      'fran@roots.com': 'Francisco Rivas'
    };
    return nameMap[email] || email.split('@')[0];
  }

  /**
   * Add a new contributor (for future extensibility)
   */
  static addContributor(email: string, stats: ContributorStats): void {
    GITHUB_CONTRIBUTORS[email] = stats;
  }
} 