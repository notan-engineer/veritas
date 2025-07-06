import { Factoid, Tag, Source } from './data-service'

export const mockFactoids: Factoid[] = [
  {
    id: "nvidia-ai-chip-2024",
    title: "NVIDIA Announces Revolutionary AI Chip with 10x Performance Boost",
    description: "NVIDIA has unveiled its latest AI chip, promising unprecedented performance improvements for machine learning workloads.",
    bullet_points: [
      "New H200 chip delivers 10x faster AI training compared to previous generation",
      "Features 141GB of HBM3 memory for large language model processing",
      "Expected to ship in Q2 2024 with major cloud providers already pre-ordering",
      "Priced at $40,000 per unit, targeting enterprise AI infrastructure",
      "Compatible with existing CUDA ecosystem for seamless integration"
    ],
    language: "en",
    confidence_score: 0.95,
    status: "published",
    created_at: "2024-12-15T10:30:00Z",
    updated_at: "2024-12-15T10:30:00Z",
    tags: [
      {
        id: "tag-1",
        name: "Technology",
        slug: "technology",
        description: "Technology and innovation",
        level: 1,
        is_active: true
      },
      {
        id: "tag-2",
        name: "AI",
        slug: "ai",
        description: "Artificial Intelligence",
        level: 1,
        is_active: true
      },
      {
        id: "tag-3",
        name: "Hardware",
        slug: "hardware",
        description: "Computer hardware and devices",
        level: 2,
        is_active: true
      }
    ],
    sources: [
      {
        id: "source-1",
        name: "TechCrunch",
        domain: "techcrunch.com",
        url: "https://techcrunch.com",
        description: "Technology news and analysis",
        is_active: true
      }
    ]
  },
  {
    id: "fed-interest-rates-december",
    title: "Federal Reserve Maintains Interest Rates at 5.25-5.50%",
    description: "The Federal Reserve has decided to keep interest rates unchanged, signaling a cautious approach to monetary policy.",
    bullet_points: [
      "Federal funds rate remains at 5.25-5.50% for the third consecutive meeting",
      "Fed Chair Powell indicates potential rate cuts in 2024 if inflation continues to decline",
      "Core inflation rate at 3.1%, down from 4.1% in September",
      "Unemployment rate stable at 3.7%, showing strong labor market",
      "Markets react positively with S&P 500 gaining 1.2% following announcement"
    ],
    language: "en",
    confidence_score: 0.92,
    status: "published",
    created_at: "2024-12-14T14:00:00Z",
    updated_at: "2024-12-14T14:00:00Z",
    tags: [
      {
        id: "tag-4",
        name: "Finance",
        slug: "finance",
        description: "Financial news and markets",
        level: 1,
        is_active: true
      },
      {
        id: "tag-5",
        name: "Economy",
        slug: "economy",
        description: "Economic news and trends",
        level: 2,
        is_active: true
      }
    ],
    sources: [
      {
        id: "source-2",
        name: "Reuters",
        domain: "reuters.com",
        url: "https://reuters.com",
        description: "International news and business",
        is_active: true
      }
    ]
  },
  {
    id: "spacex-starlink-launch",
    title: "SpaceX Successfully Launches 60 Starlink Satellites",
    description: "SpaceX has completed another successful Starlink mission, expanding global internet coverage.",
    bullet_points: [
      "Falcon 9 rocket launches 60 Starlink satellites from Cape Canaveral",
      "First stage booster successfully lands on drone ship for 15th time",
      "Satellites deployed at 550km altitude for optimal internet coverage",
      "Starlink constellation now exceeds 4,000 active satellites",
      "Service now available in 60+ countries with 2+ million subscribers"
    ],
    language: "en",
    confidence_score: 0.94,
    status: "published",
    created_at: "2024-12-13T20:15:00Z",
    updated_at: "2024-12-13T20:15:00Z",
    tags: [
      {
        id: "tag-6",
        name: "Space",
        slug: "space",
        description: "Space exploration and astronomy",
        level: 1,
        is_active: true
      },
      {
        id: "tag-1",
        name: "Technology",
        slug: "technology",
        description: "Technology and innovation",
        level: 1,
        is_active: true
      }
    ],
    sources: [
      {
        id: "source-3",
        name: "The Verge",
        domain: "theverge.com",
        url: "https://theverge.com",
        description: "Technology, science, art, and culture",
        is_active: true
      }
    ]
  },
  {
    id: "cop28-climate-agreement",
    title: "COP28 Reaches Historic Agreement on Fossil Fuel Phase-Out",
    description: "World leaders at COP28 have agreed to transition away from fossil fuels, marking a significant climate milestone.",
    bullet_points: [
      "195 countries agree to 'transition away from fossil fuels' by 2050",
      "Establishes $100 billion climate fund for developing nations",
      "Sets target of 60% reduction in global emissions by 2035",
      "Requires regular reporting on climate action progress",
      "Creates framework for carbon trading and offset mechanisms"
    ],
    language: "en",
    confidence_score: 0.91,
    status: "published",
    created_at: "2024-12-12T16:45:00Z",
    updated_at: "2024-12-12T16:45:00Z",
    tags: [
      {
        id: "tag-7",
        name: "Environment",
        slug: "environment",
        description: "Environmental news and climate",
        level: 1,
        is_active: true
      }
    ],
    sources: [
      {
        id: "source-4",
        name: "Bloomberg",
        domain: "bloomberg.com",
        url: "https://bloomberg.com",
        description: "Business and financial news",
        is_active: true
      }
    ]
  },
  {
    id: "israel-tech-startup-funding",
    title: "ישראל: חברות טכנולוגיה גייסו 2.5 מיליארד דולר ברבעון האחרון",
    description: "אקוסיסטם הסטארט-אפים הישראלי ממשיך לפרוח עם גיוסים משמעותיים בחברות בינה מלאכותית וסייבר.",
    bullet_points: [
      "חברות טכנולוגיה ישראליות גייסו 2.5 מיליארד דולר ברבעון הרביעי של 2024",
      "חברות בינה מלאכותית הובילו עם 40% מהגיוסים הכוללים",
      "חברות סייבר גייסו 800 מיליון דולר, עלייה של 25% מהרבעון הקודם",
      "מרכזי פיתוח של חברות בינלאומיות גדולות נפתחים בתל אביב וירושלים",
      "הממשלה הכריזה על תכנית חדשה לתמיכה בחברות טכנולוגיה צעירות"
    ],
    language: "he",
    confidence_score: 0.88,
    status: "published",
    created_at: "2024-12-15T08:30:00Z",
    updated_at: "2024-12-15T08:30:00Z",
    tags: [
      {
        id: "tag-8",
        name: "ישראל",
        slug: "israel",
        description: "Israeli news and developments",
        level: 1,
        is_active: true
      },
      {
        id: "tag-1",
        name: "Technology",
        slug: "technology",
        description: "Technology and innovation",
        level: 1,
        is_active: true
      },
      {
        id: "tag-9",
        name: "Startups",
        slug: "startups",
        description: "Startup companies and funding",
        level: 2,
        is_active: true
      }
    ],
    sources: [
      {
        id: "source-5",
        name: "Ynet",
        domain: "ynet.co.il",
        url: "https://ynet.co.il",
        description: "Israeli news portal",
        is_active: true
      }
    ]
  }
]

export const mockTags: Tag[] = [
  {
    id: "tag-1",
    name: "Technology",
    slug: "technology",
    description: "Technology and innovation",
    level: 1,
    is_active: true
  },
  {
    id: "tag-2",
    name: "AI",
    slug: "ai",
    description: "Artificial Intelligence",
    level: 1,
    is_active: true
  },
  {
    id: "tag-3",
    name: "Hardware",
    slug: "hardware",
    description: "Computer hardware and devices",
    level: 2,
    is_active: true
  },
  {
    id: "tag-4",
    name: "Finance",
    slug: "finance",
    description: "Financial news and markets",
    level: 1,
    is_active: true
  },
  {
    id: "tag-5",
    name: "Economy",
    slug: "economy",
    description: "Economic news and trends",
    level: 2,
    is_active: true
  },
  {
    id: "tag-6",
    name: "Space",
    slug: "space",
    description: "Space exploration and astronomy",
    level: 1,
    is_active: true
  },
  {
    id: "tag-7",
    name: "Environment",
    slug: "environment",
    description: "Environmental news and climate",
    level: 1,
    is_active: true
  },
  {
    id: "tag-8",
    name: "ישראל",
    slug: "israel",
    description: "Israeli news and developments",
    level: 1,
    is_active: true
  },
  {
    id: "tag-9",
    name: "Startups",
    slug: "startups",
    description: "Startup companies and funding",
    level: 2,
    is_active: true
  }
]

export const mockSources: Source[] = [
  {
    id: "source-1",
    name: "TechCrunch",
    domain: "techcrunch.com",
    url: "https://techcrunch.com",
    description: "Technology news and analysis",
    is_active: true
  },
  {
    id: "source-2",
    name: "Reuters",
    domain: "reuters.com",
    url: "https://reuters.com",
    description: "International news and business",
    is_active: true
  },
  {
    id: "source-3",
    name: "The Verge",
    domain: "theverge.com",
    url: "https://theverge.com",
    description: "Technology, science, art, and culture",
    is_active: true
  },
  {
    id: "source-4",
    name: "Bloomberg",
    domain: "bloomberg.com",
    url: "https://bloomberg.com",
    description: "Business and financial news",
    is_active: true
  },
  {
    id: "source-5",
    name: "Ynet",
    domain: "ynet.co.il",
    url: "https://ynet.co.il",
    description: "Israeli news portal",
    is_active: true
  }
]

// Legacy compatibility functions
export const mockArticles = mockFactoids.map(factoid => ({
  id: factoid.id,
  title: factoid.title,
  short_summary: factoid.description,
  tags: factoid.tags.map(tag => tag.name),
  bullet_summary: factoid.bullet_points,
  source_urls: factoid.sources.map(source => source.url),
  created_at: factoid.created_at,
  language: factoid.language as 'en' | 'he'
}))

// Helper functions for filtering
export function getFactoidsByTopic(topic: string): Factoid[] {
  return mockFactoids.filter(factoid => 
    factoid.tags.some(tag => tag.name.toLowerCase() === topic.toLowerCase())
  )
}

export function getFactoidsByLanguage(language: 'en' | 'he' | 'ar' | 'other'): Factoid[] {
  return mockFactoids.filter(factoid => factoid.language === language)
}

export function searchFactoids(query: string): Factoid[] {
  const lowerQuery = query.toLowerCase()
  return mockFactoids.filter(factoid => 
    factoid.title.toLowerCase().includes(lowerQuery) ||
    factoid.description.toLowerCase().includes(lowerQuery) ||
    factoid.tags.some(tag => tag.name.toLowerCase().includes(lowerQuery))
  )
}

export interface Article {
  id: string;
  title: string;
  short_summary: string;
  tags: string[];
  bullet_summary: string[];
  source_urls: string[];
  created_at: string;
  language: 'en' | 'he';
}

// Dynamically derive topics from mockTags to ensure consistency
export const topics = [
  "All", 
  ...mockTags
    .filter(tag => tag.is_active)
    .map(tag => tag.name)
    .sort() // Sort alphabetically for consistent ordering
];

export function getArticlesByTopic(topic: string): Article[] {
  if (topic === "All") {
    return mockArticles;
  }
  return mockArticles.filter(article => article.tags.includes(topic));
}

export function getArticleById(id: string): Article | undefined {
  return mockArticles.find(article => article.id === id);
} 