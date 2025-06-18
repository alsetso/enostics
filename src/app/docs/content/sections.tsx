import { ReactNode } from 'react'
import { 
  Rocket, 
  Lightbulb, 
  Globe, 
  Layers, 
  Activity, 
  Shield,
  Heart,
  Smartphone,
  Settings,
  Database,
  Code,
  Zap,
  Puzzle,
  Users,
  Cloud,
  HelpCircle
} from 'lucide-react'

export interface DocSection {
  id: string
  title: string
  description: string
  icon: ReactNode
  category: 'getting-started' | 'concepts' | 'guides' | 'reference' | 'examples' | 'advanced'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  tags: string[]
  content: string
  nextSection?: string
  prevSection?: string
}

// Content components will be imported dynamically

const docSections: DocSection[] = [
  // Getting Started
  {
    id: 'quick-start',
    title: 'Quick Start Guide',
    description: 'Get your first endpoint running in under 5 minutes. Perfect for newcomers to understand the core concept.',
    icon: <Rocket className="h-6 w-6" />,
    category: 'getting-started',
    difficulty: 'beginner',
    estimatedTime: '5 min',
    tags: ['setup', 'first-steps', 'tutorial'],
    content: 'quick-start',
    nextSection: 'what-is-enostics'
  },
  {
    id: 'what-is-enostics',
    title: 'What is Enostics?',
    description: 'Understanding the personal API concept and how Enostics transforms you into your own app platform.',
    icon: <Lightbulb className="h-6 w-6" />,
    category: 'concepts',
    difficulty: 'beginner',
    estimatedTime: '8 min',
    tags: ['concept', 'overview', 'philosophy'],
    content: 'what-is-enostics',
    prevSection: 'quick-start',
    nextSection: 'creating-endpoints'
  },
  {
    id: 'creating-endpoints',
    title: 'Creating Your First Endpoint',
    description: 'Step-by-step guide to creating, configuring, and testing your personal API endpoints.',
    icon: <Globe className="h-6 w-6" />,
    category: 'getting-started',
    difficulty: 'beginner',
    estimatedTime: '10 min',
    tags: ['endpoints', 'creation', 'configuration'],
    content: 'coming-soon',
    prevSection: 'what-is-enostics'
  },

  // Core Concepts
  {
    id: 'endpoint-architecture',
    title: 'Endpoint Architecture',
    description: 'Deep dive into how endpoints work, data flow, and the underlying infrastructure.',
    icon: <Layers className="h-6 w-6" />,
    category: 'concepts',
    difficulty: 'intermediate',
    estimatedTime: '15 min',
    tags: ['architecture', 'technical', 'infrastructure'],
    content: 'coming-soon'
  },
  {
    id: 'data-flow',
    title: 'Understanding Data Flow',
    description: 'How data lands, loads, and launches through your personal endpoint ecosystem.',
    icon: <Activity className="h-6 w-6" />,
    category: 'concepts',
    difficulty: 'intermediate',
    estimatedTime: '12 min',
    tags: ['data', 'flow', 'processing'],
    content: 'coming-soon'
  },
  {
    id: 'authentication',
    title: 'Authentication & Security',
    description: 'Securing your endpoints with API keys, tokens, and access controls.',
    icon: <Shield className="h-6 w-6" />,
    category: 'concepts',
    difficulty: 'intermediate',
    estimatedTime: '18 min',
    tags: ['security', 'auth', 'api-keys'],
    content: 'coming-soon'
  },

  // User Guides
  {
    id: 'health-data-integration',
    title: 'Health Data Integration',
    description: 'Connect health devices, apps, and providers to your personal health endpoint.',
    icon: <Heart className="h-6 w-6" />,
    category: 'guides',
    difficulty: 'beginner',
    estimatedTime: '20 min',
    tags: ['health', 'devices', 'integration'],
    content: 'coming-soon'
  },
  {
    id: 'iot-device-setup',
    title: 'IoT Device Setup',
    description: 'Connect smart home devices, sensors, and IoT gadgets to your endpoint.',
    icon: <Smartphone className="h-6 w-6" />,
    category: 'guides',
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    tags: ['iot', 'devices', 'sensors'],
    content: 'coming-soon'
  },
  {
    id: 'dashboard-management',
    title: 'Dashboard Management',
    description: 'Master the dashboard interface for monitoring, analytics, and endpoint management.',
    icon: <Settings className="h-6 w-6" />,
    category: 'guides',
    difficulty: 'beginner',
    estimatedTime: '15 min',
    tags: ['dashboard', 'management', 'ui'],
    content: 'coming-soon'
  },
  {
    id: 'data-export',
    title: 'Data Export & Analytics',
    description: 'Export your data, create reports, and analyze patterns in your personal data.',
    icon: <Database className="h-6 w-6" />,
    category: 'guides',
    difficulty: 'intermediate',
    estimatedTime: '22 min',
    tags: ['export', 'analytics', 'reporting'],
    content: 'coming-soon'
  },

  // API Reference
  {
    id: 'api-reference',
    title: 'Complete API Reference',
    description: 'Comprehensive API documentation with all endpoints, parameters, and response formats.',
    icon: <Code className="h-6 w-6" />,
    category: 'reference',
    difficulty: 'intermediate',
    estimatedTime: '30 min',
    tags: ['api', 'reference', 'documentation'],
    content: 'coming-soon'
  },
  {
    id: 'webhook-reference',
    title: 'Webhook Documentation',
    description: 'Everything about sending data to your endpoints via webhooks and HTTP requests.',
    icon: <Zap className="h-6 w-6" />,
    category: 'reference',
    difficulty: 'intermediate',
    estimatedTime: '20 min',
    tags: ['webhooks', 'http', 'integration'],
    content: 'coming-soon'
  },
  {
    id: 'sdk-libraries',
    title: 'SDKs & Libraries',
    description: 'Official SDKs for JavaScript, Python, and other languages to integrate with Enostics.',
    icon: <Puzzle className="h-6 w-6" />,
    category: 'reference',
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    tags: ['sdk', 'libraries', 'integration'],
    content: 'coming-soon'
  },

  // Examples & Use Cases
  {
    id: 'health-monitoring',
    title: 'Health Monitoring Example',
    description: 'Build a complete health monitoring system with wearables, apps, and automated insights.',
    icon: <Heart className="h-6 w-6" />,
    category: 'examples',
    difficulty: 'intermediate',
    estimatedTime: '35 min',
    tags: ['health', 'monitoring', 'example'],
    content: 'coming-soon'
  },
  {
    id: 'smart-home-automation',
    title: 'Smart Home Automation',
    description: 'Create intelligent home automation using IoT devices and your personal endpoint.',
    icon: <Smartphone className="h-6 w-6" />,
    category: 'examples',
    difficulty: 'advanced',
    estimatedTime: '45 min',
    tags: ['smart-home', 'automation', 'iot'],
    content: 'coming-soon'
  },
  {
    id: 'business-integration',
    title: 'Business Integration Example',
    description: 'Integrate business tools, CRM systems, and workflows through your endpoint.',
    icon: <Users className="h-6 w-6" />,
    category: 'examples',
    difficulty: 'advanced',
    estimatedTime: '40 min',
    tags: ['business', 'integration', 'workflow'],
    content: 'coming-soon'
  },

  // Advanced Topics
  {
    id: 'custom-agents',
    title: 'Building Custom Agents',
    description: 'Create AI agents that can interact with your endpoint and automate complex workflows.',
    icon: <Zap className="h-6 w-6" />,
    category: 'advanced',
    difficulty: 'advanced',
    estimatedTime: '60 min',
    tags: ['ai', 'agents', 'automation'],
    content: 'coming-soon'
  },
  {
    id: 'enterprise-deployment',
    title: 'Enterprise Deployment',
    description: 'Deploy Enostics at scale for teams and organizations with advanced security and management.',
    icon: <Cloud className="h-6 w-6" />,
    category: 'advanced',
    difficulty: 'advanced',
    estimatedTime: '50 min',
    tags: ['enterprise', 'deployment', 'scale'],
    content: 'coming-soon'
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting Guide',
    description: 'Common issues, debugging techniques, and solutions for endpoint problems.',
    icon: <HelpCircle className="h-6 w-6" />,
    category: 'advanced',
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    tags: ['troubleshooting', 'debugging', 'support'],
    content: 'coming-soon'
  }
]

export function getAllSections(): DocSection[] {
  return docSections
}

export function getSectionContent(sectionId: string): DocSection | null {
  return docSections.find(section => section.id === sectionId) || null
}

export function getSectionsByCategory(category: DocSection['category']): DocSection[] {
  return docSections.filter(section => section.category === category)
}

export function getNextSection(currentSectionId: string): DocSection | null {
  const currentSection = getSectionContent(currentSectionId)
  return currentSection?.nextSection ? getSectionContent(currentSection.nextSection) : null
}

export function getPrevSection(currentSectionId: string): DocSection | null {
  const currentSection = getSectionContent(currentSectionId)
  return currentSection?.prevSection ? getSectionContent(currentSection.prevSection) : null
} 