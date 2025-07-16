import { Factoid, Tag, Source } from './data-service'

export const mockFactoids: Factoid[] = [
  {
    id: "lorem-ipsum-factoid-1",
    title: "Lorem Ipsum Dolor Sit Amet Consectetur Adipiscing",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    bullet_points: [
      "Ut enim ad minim veniam quis nostrud exercitation ullamco laboris",
      "Duis aute irure dolor in reprehenderit in voluptate velit esse",
      "Excepteur sint occaecat cupidatat non proident sunt in culpa",
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem",
      "Neque porro quisquam est qui dolorem ipsum quia dolor sit"
    ],
    language: "en",
    confidence_score: 0.95,
    status: "published",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: [
      {
        id: "tag-1",
        name: "Lorem Technology",
        slug: "lorem-technology",
        description: "Lorem ipsum technology sample",
        is_active: true
      },
      {
        id: "tag-2",
        name: "Ipsum AI",
        slug: "ipsum-ai",
        description: "Lorem ipsum artificial intelligence sample",
        is_active: true
      },
      {
        id: "tag-3",
        name: "Dolor Hardware",
        slug: "dolor-hardware",
        description: "Lorem ipsum hardware sample",
        is_active: true
      }
    ],
    sources: [
      {
        id: "source-1",
        name: "Lorem News",
        domain: "lorem-news.example",
        url: "https://lorem-news.example"
      }
    ]
  },
  {
    id: "lorem-ipsum-factoid-2",
    title: "Sed Do Eiusmod Tempor Incididunt Ut Labore",
    description: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation.",
    bullet_points: [
      "Lorem ipsum dolor sit amet consectetur adipiscing elit sed",
      "Do eiusmod tempor incididunt ut labore et dolore magna aliqua",
      "Ut enim ad minim veniam quis nostrud exercitation ullamco",
      "Laboris nisi ut aliquip ex ea commodo consequat duis",
      "Aute irure dolor in reprehenderit in voluptate velit esse"
    ],
    language: "en",
    confidence_score: 0.92,
    status: "published",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    tags: [
      {
        id: "tag-4",
        name: "Consectetur Finance",
        slug: "consectetur-finance",
        description: "Lorem ipsum finance sample",
        is_active: true
      },
      {
        id: "tag-5",
        name: "Adipiscing Economy",
        slug: "adipiscing-economy",
        description: "Lorem ipsum economy sample",
        is_active: true
      }
    ],
    sources: [
      {
        id: "source-2",
        name: "Ipsum Today",
        domain: "ipsum-today.example",
        url: "https://ipsum-today.example"
      }
    ]
  },
  {
    id: "lorem-ipsum-factoid-3",
    title: "Ut Enim Ad Minim Veniam Quis Nostrud",
    description: "Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    bullet_points: [
      "Cillum dolore eu fugiat nulla pariatur excepteur sint occaecat",
      "Cupidatat non proident sunt in culpa qui officia deserunt",
      "Mollit anim id est laborum sed ut perspiciatis unde omnis",
      "Iste natus error sit voluptatem accusantium doloremque laudantium",
      "Totam rem aperiam eaque ipsa quae ab illo inventore"
    ],
    language: "en",
    confidence_score: 0.94,
    status: "published",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: [
      {
        id: "tag-6",
        name: "Veniam Space",
        slug: "veniam-space",
        description: "Lorem ipsum space sample",
        is_active: true
      },
      {
        id: "tag-1",
        name: "Lorem Technology",
        slug: "lorem-technology",
        description: "Lorem ipsum technology sample",
        is_active: true
      }
    ],
    sources: [
      {
        id: "source-3",
        name: "Dolor Weekly",
        domain: "dolor-weekly.example",
        url: "https://dolor-weekly.example"
      }
    ]
  },
  {
    id: "lorem-ipsum-factoid-4",
    title: "Duis Aute Irure Dolor In Reprehenderit",
    description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    bullet_points: [
      "Excepteur sint occaecat cupidatat non proident sunt in culpa",
      "Qui officia deserunt mollit anim id est laborum sed ut",
      "Perspiciatis unde omnis iste natus error sit voluptatem",
      "Accusantium doloremque laudantium totam rem aperiam eaque",
      "Ipsa quae ab illo inventore veritatis et quasi architecto"
    ],
    language: "en",
    confidence_score: 0.91,
    status: "published",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    tags: [
      {
        id: "tag-7",
        name: "Irure Environment",
        slug: "irure-environment",
        description: "Lorem ipsum environment sample",
        is_active: true
      }
    ],
    sources: [
      {
        id: "source-4",
        name: "Elit Business",
        domain: "elit-business.example",
        url: "https://elit-business.example"
      }
    ]
  },
  {
    id: "lorem-ipsum-factoid-5",
    title: "אמת לורם איפסום דולור סיט אמט",
    description: "לורם איפסום דולור סיט אמט, קונסקטטור אדיפיסינג אלית סד דו איוסמוד טמפור אינסידידונט.",
    bullet_points: [
      "אוט לבוריס ניסי אוט אליקיפ אקס אע קומודו קונסקוואט",
      "דויס אוטה אירורה דולור אין רפרהנדריט אין וולופטטה",
      "וליט אסה צילום דולורה אאו פוגיאט נולה פריאטור",
      "אקספטיר סינט אוקיקאט קופידאטאט נון פרוידנט",
      "סונט אין קולפא קווי אופיסיה דסרונט מולית אנים"
    ],
    language: "he",
    confidence_score: 0.88,
    status: "published",
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    tags: [
      {
        id: "tag-8",
        name: "לורם ישראל",
        slug: "lorem-israel",
        description: "לורם איפסום ישראל דוגמא",
        is_active: true
      },
      {
        id: "tag-1",
        name: "Lorem Technology",
        slug: "lorem-technology",
        description: "Lorem ipsum technology sample",
        is_active: true
      },
      {
        id: "tag-9",
        name: "Dolor Startups",
        slug: "dolor-startups",
        description: "Lorem ipsum startups sample",
        is_active: true
      }
    ],
    sources: [
      {
        id: "source-5",
        name: "איפסום חדשות",
        domain: "ipsum-news.example",
        url: "https://ipsum-news.example"
      }
    ]
  }
]

export const mockTags: Tag[] = [
  {
    id: "tag-1",
    name: "Lorem Technology",
    slug: "lorem-technology",
    description: "Lorem ipsum technology sample",
    is_active: true
  },
  {
    id: "tag-2",
    name: "Ipsum AI",
    slug: "ipsum-ai",
    description: "Lorem ipsum artificial intelligence sample",
    is_active: true
  },
  {
    id: "tag-3",
    name: "Dolor Hardware",
    slug: "dolor-hardware",
    description: "Lorem ipsum hardware sample",
    is_active: true
  },
  {
    id: "tag-4",
    name: "Consectetur Finance",
    slug: "consectetur-finance",
    description: "Lorem ipsum finance sample",
    is_active: true
  },
  {
    id: "tag-5",
    name: "Adipiscing Economy",
    slug: "adipiscing-economy",
    description: "Lorem ipsum economy sample",
    is_active: true
  },
  {
    id: "tag-6",
    name: "Veniam Space",
    slug: "veniam-space",
    description: "Lorem ipsum space sample",
    is_active: true
  },
  {
    id: "tag-7",
    name: "Irure Environment",
    slug: "irure-environment",
    description: "Lorem ipsum environment sample",
    is_active: true
  },
  {
    id: "tag-8",
    name: "לורם ישראל",
    slug: "lorem-israel",
    description: "לורם איפסום ישראל דוגמא",
    is_active: true
  },
  {
    id: "tag-9",
    name: "Dolor Startups",
    slug: "dolor-startups",
    description: "Lorem ipsum startups sample",
    is_active: true
  }
]

export const mockSources: Source[] = [
  {
    id: "source-1",
    name: "Lorem News",
    domain: "lorem-news.example",
    url: "https://lorem-news.example"
  },
  {
    id: "source-2",
    name: "Ipsum Today",
    domain: "ipsum-today.example",
    url: "https://ipsum-today.example"
  },
  {
    id: "source-3",
    name: "Dolor Weekly",
    domain: "dolor-weekly.example",
    url: "https://dolor-weekly.example"
  },
  {
    id: "source-4",
    name: "Elit Business",
    domain: "elit-business.example",
    url: "https://elit-business.example"
  },
  {
    id: "source-5",
    name: "איפסום חדשות",
    domain: "ipsum-news.example",
    url: "https://ipsum-news.example"
  }
]

// Simplified topics derived from active tags
export const topics = [
  "All", 
  ...mockTags
    .filter(tag => tag.is_active)
    .map(tag => tag.name)
    .sort()
]; 