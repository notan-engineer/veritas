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

export const mockArticles: Article[] = [
  {
    id: "nvidia-ai-chip-2024",
    title: "NVIDIA Announces Revolutionary AI Chip with 10x Performance Boost",
    short_summary: "NVIDIA has unveiled its latest AI chip, promising unprecedented performance improvements for machine learning workloads.",
    tags: ["Tech", "AI", "Hardware"],
    bullet_summary: [
      "New H200 chip delivers 10x faster AI training compared to previous generation",
      "Features 141GB of HBM3 memory for large language model processing",
      "Expected to ship in Q2 2024 with major cloud providers already pre-ordering",
      "Priced at $40,000 per unit, targeting enterprise AI infrastructure",
      "Compatible with existing CUDA ecosystem for seamless integration"
    ],
    source_urls: [
      "https://www.nvidia.com/news/press-releases/2024/ai-chip-announcement",
      "https://techcrunch.com/2024/nvidia-h200-ai-chip",
      "https://www.theverge.com/2024/nvidia-ai-performance"
    ],
    created_at: "2024-12-15T10:30:00Z",
    language: "en"
  },
  {
    id: "fed-interest-rates-december",
    title: "Federal Reserve Maintains Interest Rates at 5.25-5.50%",
    short_summary: "The Federal Reserve has decided to keep interest rates unchanged, signaling a cautious approach to monetary policy.",
    tags: ["Finance", "Economy", "Federal Reserve"],
    bullet_summary: [
      "Federal funds rate remains at 5.25-5.50% for the third consecutive meeting",
      "Fed Chair Powell indicates potential rate cuts in 2024 if inflation continues to decline",
      "Core inflation rate at 3.1%, down from 4.1% in September",
      "Unemployment rate stable at 3.7%, showing strong labor market",
      "Markets react positively with S&P 500 gaining 1.2% following announcement"
    ],
    source_urls: [
      "https://www.federalreserve.gov/monetarypolicy/fomc.htm",
      "https://www.bloomberg.com/news/fed-interest-rates-december-2024",
      "https://www.wsj.com/articles/federal-reserve-interest-rates"
    ],
    created_at: "2024-12-14T14:00:00Z",
    language: "en"
  },
  {
    id: "spacex-starlink-launch",
    title: "SpaceX Successfully Launches 60 Starlink Satellites",
    short_summary: "SpaceX has completed another successful Starlink mission, expanding global internet coverage.",
    tags: ["Space", "Technology", "SpaceX"],
    bullet_summary: [
      "Falcon 9 rocket launches 60 Starlink satellites from Cape Canaveral",
      "First stage booster successfully lands on drone ship for 15th time",
      "Satellites deployed at 550km altitude for optimal internet coverage",
      "Starlink constellation now exceeds 4,000 active satellites",
      "Service now available in 60+ countries with 2+ million subscribers"
    ],
    source_urls: [
      "https://www.spacex.com/launches/starlink-mission-2024",
      "https://spaceflightnow.com/2024/spacex-starlink-launch",
      "https://www.nasa.gov/spacex-starlink-coverage"
    ],
    created_at: "2024-12-13T20:15:00Z",
    language: "en"
  },
  {
    id: "cop28-climate-agreement",
    title: "COP28 Reaches Historic Agreement on Fossil Fuel Phase-Out",
    short_summary: "World leaders at COP28 have agreed to transition away from fossil fuels, marking a significant climate milestone.",
    tags: ["Environment", "Climate", "COP28"],
    bullet_summary: [
      "195 countries agree to 'transition away from fossil fuels' by 2050",
      "Establishes $100 billion climate fund for developing nations",
      "Sets target of 60% reduction in global emissions by 2035",
      "Requires regular reporting on climate action progress",
      "Creates framework for carbon trading and offset mechanisms"
    ],
    source_urls: [
      "https://unfccc.int/cop28-agreement",
      "https://www.theguardian.com/environment/cop28-climate-agreement",
      "https://www.reuters.com/business/environment/cop28-fossil-fuels"
    ],
    created_at: "2024-12-12T16:45:00Z",
    language: "en"
  },
  {
    id: "semiconductor-supply-recovery",
    title: "Global Semiconductor Supply Chain Shows Strong Recovery",
    short_summary: "The semiconductor industry is experiencing a robust recovery with improved supply chain stability and increased production capacity.",
    tags: ["Tech", "Manufacturing", "Supply Chain"],
    bullet_summary: [
      "Global chip production capacity increased by 15% year-over-year",
      "TSMC, Samsung, and Intel report record quarterly revenues",
      "Automotive chip shortages largely resolved across major manufacturers",
      "New fabrication plants opening in US, Europe, and Asia",
      "Consumer electronics prices stabilizing after 2-year supply constraints"
    ],
    source_urls: [
      "https://www.semiconductors.org/supply-chain-report-2024",
      "https://www.bloomberg.com/news/semiconductor-recovery",
      "https://www.reuters.com/technology/semiconductor-supply"
    ],
    created_at: "2024-12-11T09:20:00Z",
    language: "en"
  },
  // Hebrew Articles
  {
    id: "israel-tech-startup-funding",
    title: "ישראל: חברות טכנולוגיה גייסו 2.5 מיליארד דולר ברבעון האחרון",
    short_summary: "אקוסיסטם הסטארט-אפים הישראלי ממשיך לפרוח עם גיוסים משמעותיים בחברות בינה מלאכותית וסייבר.",
    tags: ["טכנולוגיה", "סטארט-אפים", "ישראל"],
    bullet_summary: [
      "חברות טכנולוגיה ישראליות גייסו 2.5 מיליארד דולר ברבעון הרביעי של 2024",
      "חברות בינה מלאכותית הובילו עם 40% מהגיוסים הכוללים",
      "חברות סייבר גייסו 800 מיליון דולר, עלייה של 25% מהרבעון הקודם",
      "מרכזי פיתוח של חברות בינלאומיות גדולות נפתחים בתל אביב וירושלים",
      "הממשלה הכריזה על תכנית חדשה לתמיכה בחברות טכנולוגיה צעירות"
    ],
    source_urls: [
      "https://www.calcalist.co.il/tech/articles/0,7340,L-3987656,00.html",
      "https://www.globes.co.il/news/article.aspx?did=1001456789",
      "https://www.ynet.co.il/tech/article/rk8h8h9"
    ],
    created_at: "2024-12-15T08:30:00Z",
    language: "he"
  },
  {
    id: "jerusalem-archaeology-discovery",
    title: "גילוי ארכיאולוגי מרעיש בירושלים: נמצאו שרידים מתקופת בית ראשון",
    short_summary: "ארכיאולוגים חשפו ממצאים ייחודיים מתקופת בית המקדש הראשון בעיר דוד, כולל כלי קודש וכתובות עבריות עתיקות.",
    tags: ["ארכיאולוגיה", "ירושלים", "היסטוריה"],
    bullet_summary: [
      "נחשפו שרידים מתקופת בית המקדש הראשון (1000-586 לפנה\"ס)",
      "נמצאו כלי קודש עשויים זהב וכסף עם כתובות עבריות עתיקות",
      "הממצאים כוללים חותמות עם שמות מלכים מתקופת המקרא",
      "החפירות נערכו בעיר דוד בשיתוף רשות העתיקות ואוניברסיטת תל אביב",
      "הממצאים יוצגו במוזיאון ישראל החל מחודש מרץ 2025"
    ],
    source_urls: [
      "https://www.antiquities.org.il/he/Article.aspx?q=1234",
      "https://www.tau.ac.il/archaeology/jerusalem-discovery",
      "https://www.israelmuseum.org.il/he/exhibitions/ancient-jerusalem"
    ],
    created_at: "2024-12-14T12:15:00Z",
    language: "he"
  },
  {
    id: "israel-renewable-energy-2030",
    title: "ישראל מתכננת להפוך ל-100% אנרגיה מתחדשת עד 2030",
    short_summary: "משרד האנרגיה הכריז על תכנית שאפתנית להפוך את ישראל למדינה המובילה באנרגיה מתחדשת במזרח התיכון.",
    tags: ["אנרגיה", "סביבה", "ישראל"],
    bullet_summary: [
      "ישראל מתכננת להגיע ל-100% אנרגיה מתחדשת עד שנת 2030",
      "תכנית כוללת הקמת תחנות סולאריות בהיקף של 15 גיגה-וואט",
      "השקעה של 50 מיליארד שקל בתשתיות אנרגיה ירוקה",
      "יצירת 25,000 מקומות עבודה חדשים בענף האנרגיה המתחדשת",
      "הפחתה של 80% בפליטת גזי חממה עד 2030"
    ],
    source_urls: [
      "https://www.gov.il/he/departments/energy-renewable-2030",
      "https://www.ynet.co.il/environment/article/rk9h9h0",
      "https://www.globes.co.il/news/article.aspx?did=1001456790"
    ],
    created_at: "2024-12-13T16:45:00Z",
    language: "he"
  },
  {
    id: "tel-aviv-ai-conference-2024",
    title: "כנס בינה מלאכותית בינלאומי בתל אביב: 5,000 משתתפים מ-60 מדינות",
    short_summary: "תל אביב אירחה את הכנס הגדול ביותר לבינה מלאכותית במזרח התיכון עם השקת טכנולוגיות חדשניות.",
    tags: ["בינה מלאכותית", "כנס", "תל אביב"],
    bullet_summary: [
      "5,000 משתתפים מ-60 מדינות השתתפו בכנס AI בתל אביב",
      "הושקו 50 טכנולוגיות חדשות בתחום הבינה המלאכותית",
      "חברות ישראליות חתמו על הסכמי שיתוף פעולה בשווי 200 מיליון דולר",
      "נשיא המדינה נאם בפתיחת הכנס והדגיש את חשיבות הטכנולוגיה",
      "הכנס הבא יתקיים בשנת 2025 עם צפי ל-8,000 משתתפים"
    ],
    source_urls: [
      "https://www.telaviv-ai-conference.com/2024",
      "https://www.ynet.co.il/tech/article/rk7h7h8",
      "https://www.globes.co.il/news/article.aspx?did=1001456791"
    ],
    created_at: "2024-12-12T10:30:00Z",
    language: "he"
  },
  {
    id: "israel-medical-breakthrough",
    title: "פריצת דרך רפואית ישראלית: טיפול חדש לסרטן הלבלב",
    short_summary: "חוקרים ישראלים פיתחו טיפול חדשני לסרטן הלבלב שהראה תוצאות מבטיחות בניסויים קליניים.",
    tags: ["רפואה", "סרטן", "ישראל"],
    bullet_summary: [
      "חוקרים מאוניברסיטת תל אביב פיתחו טיפול חדשני לסרטן הלבלב",
      "הטיפול מבוסס על ננו-חלקיקים שמאתרים ומשמידים תאים סרטניים",
      "בניסויים קליניים הושגה הצלחה של 75% בהארכת תוחלת החיים",
      "הטיפול אושר על ידי FDA לניסויים קליניים מתקדמים",
      "הטכנולוגיה תורשה לחברות בינלאומיות לשיווק עולמי"
    ],
    source_urls: [
      "https://www.tau.ac.il/medicine/pancreatic-cancer-treatment",
      "https://www.ynet.co.il/health/article/rk6h6h7",
      "https://www.globes.co.il/news/article.aspx?did=1001456792"
    ],
    created_at: "2024-12-11T14:20:00Z",
    language: "he"
  }
];

export const topics = [
  "All", "Tech", "Finance", "Space", "Environment", "AI", "Economy", "Federal Reserve", "SpaceX", "Hardware", "Manufacturing", "Supply Chain", "Climate", "COP28",
  "טכנולוגיה", "סטארט-אפים", "ישראל", "ארכיאולוגיה", "ירושלים", "היסטוריה", "אנרגיה", "סביבה", "כנס", "תל אביב", "רפואה", "סרטן"
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