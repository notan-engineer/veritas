-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  short_summary TEXT NOT NULL,
  tags TEXT[] NOT NULL,
  bullet_summary TEXT[] NOT NULL,
  source_urls TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  language TEXT CHECK (language IN ('en', 'he')) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON articles
  FOR SELECT USING (true);

-- Insert mock data
INSERT INTO articles (id, title, short_summary, tags, bullet_summary, source_urls, created_at, language) VALUES
(
  'nvidia-ai-chip-2024',
  'NVIDIA Announces Revolutionary AI Chip with 10x Performance Boost',
  'NVIDIA has unveiled its latest AI chip, promising unprecedented performance improvements for machine learning workloads.',
  ARRAY['Tech', 'AI', 'Hardware'],
  ARRAY[
    'New H200 chip delivers 10x faster AI training compared to previous generation',
    'Features 141GB of HBM3 memory for large language model processing',
    'Expected to ship in Q2 2024 with major cloud providers already pre-ordering',
    'Priced at $40,000 per unit, targeting enterprise AI infrastructure',
    'Compatible with existing CUDA ecosystem for seamless integration'
  ],
  ARRAY[
    'https://www.nvidia.com/news/press-releases/2024/ai-chip-announcement',
    'https://techcrunch.com/2024/nvidia-h200-ai-chip',
    'https://www.theverge.com/2024/nvidia-ai-performance'
  ],
  '2024-12-15T10:30:00Z',
  'en'
),
(
  'fed-interest-rates-december',
  'Federal Reserve Maintains Interest Rates at 5.25-5.50%',
  'The Federal Reserve has decided to keep interest rates unchanged, signaling a cautious approach to monetary policy.',
  ARRAY['Finance', 'Economy', 'Federal Reserve'],
  ARRAY[
    'Federal funds rate remains at 5.25-5.50% for the third consecutive meeting',
    'Fed Chair Powell indicates potential rate cuts in 2024 if inflation continues to decline',
    'Core inflation rate at 3.1%, down from 4.1% in September',
    'Unemployment rate stable at 3.7%, showing strong labor market',
    'Markets react positively with S&P 500 gaining 1.2% following announcement'
  ],
  ARRAY[
    'https://www.federalreserve.gov/monetarypolicy/fomc.htm',
    'https://www.bloomberg.com/news/fed-interest-rates-december-2024',
    'https://www.wsj.com/articles/federal-reserve-interest-rates'
  ],
  '2024-12-14T14:00:00Z',
  'en'
),
(
  'spacex-starlink-launch',
  'SpaceX Successfully Launches 60 Starlink Satellites',
  'SpaceX has completed another successful Starlink mission, expanding global internet coverage.',
  ARRAY['Space', 'Technology', 'SpaceX'],
  ARRAY[
    'Falcon 9 rocket launches 60 Starlink satellites from Cape Canaveral',
    'First stage booster successfully lands on drone ship for 15th time',
    'Satellites deployed at 550km altitude for optimal internet coverage',
    'Starlink constellation now exceeds 4,000 active satellites',
    'Service now available in 60+ countries with 2+ million subscribers'
  ],
  ARRAY[
    'https://www.spacex.com/launches/starlink-mission-2024',
    'https://spaceflightnow.com/2024/spacex-starlink-launch',
    'https://www.nasa.gov/spacex-starlink-coverage'
  ],
  '2024-12-13T20:15:00Z',
  'en'
),
(
  'cop28-climate-agreement',
  'COP28 Reaches Historic Agreement on Fossil Fuel Phase-Out',
  'World leaders at COP28 have agreed to transition away from fossil fuels, marking a significant climate milestone.',
  ARRAY['Environment', 'Climate', 'COP28'],
  ARRAY[
    '195 countries agree to ''transition away from fossil fuels'' by 2050',
    'Establishes $100 billion climate fund for developing nations',
    'Sets target of 60% reduction in global emissions by 2035',
    'Requires regular reporting on climate action progress',
    'Creates framework for carbon trading and offset mechanisms'
  ],
  ARRAY[
    'https://unfccc.int/cop28-agreement',
    'https://www.theguardian.com/environment/cop28-climate-agreement',
    'https://www.reuters.com/business/environment/cop28-fossil-fuels'
  ],
  '2024-12-12T16:45:00Z',
  'en'
),
(
  'semiconductor-supply-recovery',
  'Global Semiconductor Supply Chain Shows Strong Recovery',
  'The semiconductor industry is experiencing a robust recovery with improved supply chain stability and increased production capacity.',
  ARRAY['Tech', 'Manufacturing', 'Supply Chain'],
  ARRAY[
    'Global chip production capacity increased by 15% year-over-year',
    'TSMC, Samsung, and Intel report record quarterly revenues',
    'Automotive chip shortages largely resolved across major manufacturers',
    'New fabrication plants opening in US, Europe, and Asia',
    'Consumer electronics prices stabilizing after 2-year supply constraints'
  ],
  ARRAY[
    'https://www.semiconductors.org/supply-chain-report-2024',
    'https://www.bloomberg.com/news/semiconductor-recovery',
    'https://www.reuters.com/technology/semiconductor-supply'
  ],
  '2024-12-11T09:20:00Z',
  'en'
),
(
  'israel-tech-startup-funding',
  'ישראל: חברות טכנולוגיה גייסו 2.5 מיליארד דולר ברבעון האחרון',
  'אקוסיסטם הסטארט-אפים הישראלי ממשיך לפרוח עם גיוסים משמעותיים בחברות בינה מלאכותית וסייבר.',
  ARRAY['טכנולוגיה', 'סטארט-אפים', 'ישראל'],
  ARRAY[
    'חברות טכנולוגיה ישראליות גייסו 2.5 מיליארד דולר ברבעון הרביעי של 2024',
    'חברות בינה מלאכותית הובילו עם 40% מהגיוסים הכוללים',
    'חברות סייבר גייסו 800 מיליון דולר, עלייה של 25% מהרבעון הקודם',
    'מרכזי פיתוח של חברות בינלאומיות גדולות נפתחים בתל אביב וירושלים',
    'הממשלה הכריזה על תכנית חדשה לתמיכה בחברות טכנולוגיה צעירות'
  ],
  ARRAY[
    'https://www.calcalist.co.il/tech/articles/0,7340,L-3987656,00.html',
    'https://www.globes.co.il/news/article.aspx?did=1001456789',
    'https://www.ynet.co.il/tech/article/rk8h8h9'
  ],
  '2024-12-15T08:30:00Z',
  'he'
),
(
  'jerusalem-archaeology-discovery',
  'גילוי ארכיאולוגי מרעיש בירושלים: נמצאו שרידים מתקופת בית ראשון',
  'ארכיאולוגים חשפו ממצאים ייחודיים מתקופת בית המקדש הראשון בעיר דוד, כולל כלי קודש וכתובות עבריות עתיקות.',
  ARRAY['ארכיאולוגיה', 'ירושלים', 'היסטוריה'],
  ARRAY[
    'נחשפו שרידים מתקופת בית המקדש הראשון (1000-586 לפנה"ס)',
    'נמצאו כלי קודש עשויים זהב וכסף עם כתובות עבריות עתיקות',
    'הממצאים כוללים חותמות עם שמות מלכים מתקופת המקרא',
    'החפירות נערכו בעיר דוד בשיתוף רשות העתיקות ואוניברסיטת תל אביב',
    'הממצאים יוצגו במוזיאון ישראל החל מחודש מרץ 2025'
  ],
  ARRAY[
    'https://www.antiquities.org.il/he/Article.aspx?q=1234',
    'https://www.tau.ac.il/archaeology/jerusalem-discovery',
    'https://www.israelmuseum.org.il/he/exhibitions/ancient-jerusalem'
  ],
  '2024-12-14T12:15:00Z',
  'he'
),
(
  'israel-renewable-energy-2030',
  'ישראל מתכננת להפוך ל-100% אנרגיה מתחדשת עד 2030',
  'משרד האנרגיה הכריז על תכנית שאפתנית להפוך את ישראל למדינה המובילה באנרגיה מתחדשת במזרח התיכון.',
  ARRAY['אנרגיה', 'סביבה', 'ישראל'],
  ARRAY[
    'ישראל מתכננת להגיע ל-100% אנרגיה מתחדשת עד שנת 2030',
    'תכנית כוללת הקמת תחנות סולאריות בהיקף של 15 גיגה-וואט',
    'השקעה של 50 מיליארד שקל בתשתיות אנרגיה ירוקה',
    'יצירת 25,000 מקומות עבודה חדשים בענף האנרגיה המתחדשת',
    'הפחתה של 80% בפליטת גזי חממה עד 2030'
  ],
  ARRAY[
    'https://www.gov.il/he/departments/energy-renewable-2030',
    'https://www.ynet.co.il/environment/article/rk9h9h0',
    'https://www.globes.co.il/news/article.aspx?did=1001456790'
  ],
  '2024-12-13T16:45:00Z',
  'he'
),
(
  'tel-aviv-ai-conference-2024',
  'כנס בינה מלאכותית בינלאומי בתל אביב: 5,000 משתתפים מ-60 מדינות',
  'תל אביב אירחה את הכנס הגדול ביותר לבינה מלאכותית במזרח התיכון עם השקת טכנולוגיות חדשניות.',
  ARRAY['בינה מלאכותית', 'כנס', 'תל אביב'],
  ARRAY[
    '5,000 משתתפים מ-60 מדינות השתתפו בכנס AI בתל אביב',
    'הושקו 50 טכנולוגיות חדשות בתחום הבינה המלאכותית',
    'חברות ישראליות חתמו על הסכמי שיתוף פעולה בשווי 200 מיליון דולר',
    'נשיא המדינה נאם בפתיחת הכנס והדגיש את חשיבות הטכנולוגיה',
    'הכנס הבא יתקיים בשנת 2025 עם צפי ל-8,000 משתתפים'
  ],
  ARRAY[
    'https://www.telaviv-ai-conference.com/2024',
    'https://www.ynet.co.il/tech/article/rk7h7h8',
    'https://www.globes.co.il/news/article.aspx?did=1001456791'
  ],
  '2024-12-12T10:30:00Z',
  'he'
),
(
  'israel-medical-breakthrough',
  'פריצת דרך רפואית ישראלית: טיפול חדש לסרטן הלבלב',
  'חוקרים ישראלים פיתחו טיפול חדשני לסרטן הלבלב שהראה תוצאות מבטיחות בניסויים קליניים.',
  ARRAY['רפואה', 'סרטן', 'ישראל'],
  ARRAY[
    'חוקרים מאוניברסיטת תל אביב פיתחו טיפול חדשני לסרטן הלבלב',
    'הטיפול מבוסס על ננו-חלקיקים המאתרים ומשמידים תאים סרטניים',
    'בניסויים קליניים שלב 2 הראה הטיפול שיפור של 60% בהישרדות',
    'הטיפול אושר על ידי FDA לניסויים קליניים שלב 3',
    'הטיפול צפוי להיות זמין לשימוש קליני עד שנת 2026'
  ],
  ARRAY[
    'https://www.tau.ac.il/medicine/pancreatic-cancer-treatment',
    'https://www.ynet.co.il/health/article/rk6h6h7',
    'https://www.globes.co.il/news/article.aspx?did=1001456792'
  ],
  '2024-12-11T14:20:00Z',
  'he'
); 