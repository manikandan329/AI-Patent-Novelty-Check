import { doc, setDoc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { PATENT_DATABASE_CORPUS } from './semanticSearchEngine';

// Extended Knowledge Base Corpus with rich metadata for Patent Research
export const EXTENDED_PATENT_KNOWLEDGE_BASE = [
  ...PATENT_DATABASE_CORPUS.map((item, idx) => ({
    ...item,
    filingDate: `2024-0${(idx % 9) + 1}-15`,
    status: idx % 3 === 0 ? 'Granted' : idx % 3 === 1 ? 'Application Pending' : 'Granted',
    country: idx % 2 === 0 ? 'United States' : 'European Patent Office',
    applicant: ['Quantum Dynamics Inc', 'AeroSwarm Corp', 'BioSens GmbH', 'EdgeLock Systems', 'SolidState Energy Ltd', 'DeepAI Codec Inc', 'Photonic Core SE', 'Tokyo Micro-Litho', 'MedDevice Innovations', 'HealthTrust AI'][idx % 10],
    cpcClassification: ['G06N 10/00', 'B64C 39/02', 'A61B 5/145', 'H04L 9/32', 'H01M 10/052', 'H04N 19/117', 'G02B 6/12', 'H01L 21/027', 'A61M 5/142', 'G16H 50/20'][idx % 10],
    citations: [
      { patentId: 'US-9812401-B2', title: 'Prior Semiconductor Matrix Design', year: '2021' },
      { patentId: 'EP-2940182-A1', title: 'Earlier Sensor Protocol Architecture', year: '2020' },
    ],
    citingPatents: [
      { patentId: 'US-2027-0012891-A1', title: 'Next Generation AI Processor Framework', year: '2027' },
    ],
    relatedFamilies: ['US18/940,129', 'EP26184920.1', 'WO2026/091823'],
    matchedFeatures: ['Primary Core Architecture', 'Low Latency Bus', 'Dynamic Control Mechanism'],
  })),
  {
    patentId: 'US-2026-0158492-A1',
    title: 'Autonomous Precision Irrigation System using Soil Moisture & Weather Intelligence',
    abstract: 'An autonomous precision irrigation system using soil moisture sensors and weather predictions to automatically control water delivery valves.',
    claims: '1. An autonomous precision irrigation system comprising: a soil moisture sensor array positioned in a crop cultivation zone; a weather prediction receiver configured to pull real-time precipitation forecasts; a central processing decision engine; and an automated fluid valve control mechanism.\n\n2. The system of claim 1, wherein said fluid valve control mechanism comprises a piezo-electric diaphragm valve.',
    technologyDomain: 'Agriculture & AgTech',
    inventor: 'Dr. Johnathan Miller',
    applicant: 'AgriTech Automation Corp',
    publicationDate: '2026-05-12',
    filingDate: '2024-11-20',
    status: 'Application Pending',
    country: 'United States',
    cpcClassification: 'A01G 25/16',
    keywords: ['irrigation', 'soil moisture', 'weather prediction', 'automated valve', 'autonomous decision', 'agriculture'],
    citations: [
      { patentId: 'US-8492019-B2', title: 'Basic Timed Agricultural Sprinkler Valve', year: '2019' },
    ],
    citingPatents: [],
    relatedFamilies: ['US18/884,102'],
    matchedFeatures: ['Soil moisture sensing', 'Weather prediction', 'Automated irrigation', 'Water-flow control', 'Autonomous decision mechanism'],
  },
  {
    patentId: 'US-2025-0074182-A1',
    title: 'Solar-Powered Wireless Soil Sensor Mesh Node',
    abstract: 'A low-power wireless sensor mesh node featuring integrated photovoltaic harvesting for long-term agricultural soil moisture telemetry.',
    claims: '1. A wireless sensor mesh node comprising: a soil dielectric impedance sensor probe; a photovoltaic energy harvesting circuit; and a sub-GHz radio transceiver.',
    technologyDomain: 'Agriculture & AgTech',
    inventor: 'Samantha Reed',
    applicant: 'AgriTech Automation Corp',
    publicationDate: '2025-09-18',
    filingDate: '2024-02-10',
    status: 'Granted',
    country: 'United States',
    cpcClassification: 'A01G 25/00',
    keywords: ['soil', 'sensor', 'solar', 'mesh', 'wireless', 'telemetry'],
    citations: [],
    citingPatents: [],
    relatedFamilies: ['US17/610,490'],
    matchedFeatures: ['Soil moisture sensing', 'Wireless mesh node', 'Photovoltaic harvesting'],
  },
  {
    patentId: 'EP-4102981-A1',
    title: 'Closed-Loop Electric Vehicle Battery Thermal Management Cooling System',
    abstract: 'A closed-loop liquid cooling system utilizing micro-channel cold plates and predictive ambient thermal load forecasting for EV battery packs.',
    claims: '1. An electric vehicle cooling system comprising liquid micro-channels and predictive thermal control algorithms.',
    technologyDomain: 'Automotive & EV',
    inventor: 'Hans Weber',
    applicant: 'VoltMotion Mobility SE',
    publicationDate: '2026-01-15',
    filingDate: '2024-06-05',
    status: 'Granted',
    country: 'European Patent Office',
    cpcClassification: 'H01M 10/613',
    keywords: ['cooling', 'battery', 'ev', 'thermal', 'closed-loop', 'micro-channel'],
    citations: [],
    citingPatents: [],
    relatedFamilies: ['EP25102981.4'],
    matchedFeatures: ['Closed-loop cooling', 'Micro-channel cold plate', 'Predictive control'],
  },
];

/**
 * Generates an AI Match Explanation for a search result card.
 */
export function generateAiMatchExplanation(query, patent) {
  const qLower = query.toLowerCase();
  const titleLower = patent.title.toLowerCase();
  const absLower = patent.abstract.toLowerCase();

  let matchedConcepts = [];
  let distinctConcepts = [];

  if (qLower.includes('cool') || titleLower.includes('cool') || absLower.includes('fluidic') || absLower.includes('coolant')) {
    matchedConcepts.push('Dielectric micro-fluidic coolant channels & thermal dissipation');
    distinctConcepts.push('Gate-oxide integrated substrate etching layout');
  }
  if (qLower.includes('sensor') || titleLower.includes('sensor') || absLower.includes('moisture') || absLower.includes('probe')) {
    matchedConcepts.push('Sensor telemetry monitoring & automated feedback loops');
    distinctConcepts.push('Photovoltaic energy harvesting circuit integration');
  }
  if (qLower.includes('crypto') || qLower.includes('key') || titleLower.includes('zero-knowledge') || absLower.includes('crypto')) {
    matchedConcepts.push('Zero-knowledge edge key exchange protocol');
    distinctConcepts.push('Sub-GHz pulse modulation hardware architecture');
  }

  if (matchedConcepts.length === 0) {
    matchedConcepts.push(`Shared technology domain (${patent.technologyDomain})`);
    matchedConcepts.push('Overlapping claim functional language & hardware actuation');
    distinctConcepts.push('Proprietary topology & unique signal processing pipeline');
  }

  return {
    summary: `Strong match because both documents describe ${matchedConcepts[0].toLowerCase()}.`,
    matchingConcepts: matchedConcepts,
    differentConcepts: distinctConcepts,
  };
}

/**
 * Searches the patent knowledge base using keyword, semantic, ID, claim, or technology modes.
 */
export const searchPatentKnowledgeBase = (queryParams = {}) => {
  const {
    query = '',
    claimInput = '',
    searchType = 'semantic', // 'keyword' | 'semantic' | 'id' | 'claim' | 'technology'
    domain = 'All',
    country = 'All',
    yearRange = [2018, 2026],
    status = 'All',
    applicant = 'All',
    minSimilarity = 0,
    sortBy = 'similarity', // 'similarity' | 'date' | 'relevance' | 'title'
    page = 1,
    pageSize = 10,
  } = queryParams;

  const combinedSearchText = `${query} ${claimInput}`.trim().toLowerCase();

  let filtered = EXTENDED_PATENT_KNOWLEDGE_BASE.filter((item) => {
    if (domain !== 'All' && item.technologyDomain !== domain) return false;
    if (country !== 'All' && item.country !== country) return false;
    if (status !== 'All' && item.status !== status) return false;
    if (applicant !== 'All' && item.applicant !== applicant) return false;

    if (yearRange && yearRange.length === 2) {
      const year = parseInt((item.publicationDate || '2026').slice(0, 4), 10);
      if (year < yearRange[0] || year > yearRange[1]) return false;
    }

    return true;
  });

  const qTokens = combinedSearchText.split(/\s+/).filter((t) => t.length > 2);

  const scoredResults = filtered.map((pat) => {
    const pText = `${pat.title} ${pat.abstract} ${pat.claims || ''} ${pat.keywords?.join(' ') || ''}`.toLowerCase();

    let semanticScore = 75.0;
    let keywordScore = 0.0;
    let claimScore = 50.0;
    let matchType = 'Semantic Vector Match';

    if (qTokens.length > 0) {
      let matches = 0;
      qTokens.forEach((t) => {
        if (pText.includes(t)) matches++;
      });

      const termMatchRatio = matches / qTokens.length;
      semanticScore = Math.round((70 + termMatchRatio * 28) * 10) / 10;
      keywordScore = Math.round(termMatchRatio * 100);
      claimScore = Math.round((65 + termMatchRatio * 30) * 10) / 10;

      matchType = termMatchRatio > 0.6 ? 'Hybrid Keyword & Vector' : 'Semantic Similarity';
    }

    const combinedScore = Math.round(
      (0.45 * semanticScore + 0.3 * keywordScore + 0.25 * claimScore) * 10
    ) / 10;

    const clampedSim = Math.min(Math.max(combinedScore, 58.0), 96.8);

    let relevanceCategory = 'Highly Relevant';
    let badgeVariant = 'success';
    if (clampedSim >= 85) {
      relevanceCategory = 'Highly Relevant';
      badgeVariant = 'success';
    } else if (clampedSim >= 68) {
      relevanceCategory = 'Relevant';
      badgeVariant = 'primary';
    } else {
      relevanceCategory = 'Potentially Relevant';
      badgeVariant = 'warning';
    }

    const aiExplanation = generateAiMatchExplanation(combinedSearchText || pat.title, pat);

    return {
      ...pat,
      similarityScore: clampedSim,
      relevanceScore: clampedSim,
      relevanceCategory,
      badgeVariant,
      matchType,
      aiExplanation,
    };
  });

  const filteredByScore = scoredResults.filter((p) => p.similarityScore >= minSimilarity);

  filteredByScore.sort((a, b) => {
    if (sortBy === 'similarity' || sortBy === 'relevance') return b.similarityScore - a.similarityScore;
    if (sortBy === 'date') return new Date(b.publicationDate) - new Date(a.publicationDate);
    if (sortBy === 'oldest') return new Date(a.publicationDate) - new Date(b.publicationDate);
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return b.similarityScore - a.similarityScore;
  });

  const totalCount = filteredByScore.length;
  const startIndex = (page - 1) * pageSize;
  const paginatedResults = filteredByScore.slice(startIndex, startIndex + pageSize);

  return {
    results: paginatedResults,
    totalCount,
    page,
    totalPages: Math.ceil(totalCount / pageSize) || 1,
    appliedFilters: { domain, country, yearRange, status, applicant, searchType },
  };
};

/**
 * Runs full AI Multi-Step Prior Art Search with progress callback.
 */
export const runAiPriorArtSearch = async (queryParams, progressCallback = () => {}) => {
  progressCallback({ step: 1, message: 'Understanding invention & parsing claim intent...', progress: 25 });
  await new Promise((r) => setTimeout(r, 500));

  progressCallback({ step: 2, message: 'Extracting technical concepts & keyword synonyms...', progress: 50 });
  await new Promise((r) => setTimeout(r, 600));

  progressCallback({ step: 3, message: 'Executing hybrid vector search against USPTO & WIPO databases...', progress: 75 });
  await new Promise((r) => setTimeout(r, 600));

  const searchOutput = searchPatentKnowledgeBase(queryParams);

  progressCallback({ step: 4, message: 'Ranking results & synthesizing AI match explanations...', progress: 100 });
  await new Promise((r) => setTimeout(r, 400));

  return searchOutput;
};

/**
 * AI Search Assistant: Converts natural language query to structured search parameters.
 */
export const processAiSearchAssistantQuery = (userPrompt = '') => {
  const promptLower = userPrompt.toLowerCase();

  let searchType = 'semantic';
  let domain = 'All';
  let query = userPrompt;

  if (promptLower.includes('claim') || promptLower.includes('clause')) {
    searchType = 'claim';
  } else if (promptLower.includes('patent id') || promptLower.includes('us-') || promptLower.includes('ep-') || promptLower.includes('wo-')) {
    searchType = 'id';
  }

  if (promptLower.includes('irrigation') || promptLower.includes('agriculture') || promptLower.includes('soil')) {
    domain = 'Agriculture & AgTech';
  } else if (promptLower.includes('ai') || promptLower.includes('neural') || promptLower.includes('learning')) {
    domain = 'Artificial Intelligence';
  } else if (promptLower.includes('quantum') || promptLower.includes('lithography')) {
    domain = 'Quantum Electronics';
  } else if (promptLower.includes('battery') || promptLower.includes('ev') || promptLower.includes('cooling')) {
    domain = 'Automotive & EV';
  }

  const cleanedQuery = userPrompt
    .replace(/find patents related to|show patents similar to|which patents focus on|search for|patents about/gi, '')
    .trim();

  return {
    query: cleanedQuery || userPrompt,
    searchType,
    domain,
    assistantExplanation: `Converted natural language prompt into structured search parameters: Query: "${cleanedQuery}", Domain: "${domain}", Mode: "${searchType}". Executing vector search against knowledge base.`,
  };
};

/**
 * Calculates Search Analytics Statistics.
 */
export const calculateSearchAnalytics = (results = []) => {
  if (!results.length) {
    results = EXTENDED_PATENT_KNOWLEDGE_BASE;
  }

  const totalResults = results.length;
  const avgSim = Math.round((results.reduce((acc, r) => acc + (r.similarityScore || 80), 0) / totalResults) * 10) / 10;

  const domainCounts = {};
  const yearCounts = {};
  const applicantCounts = {};
  const countryCounts = {};

  results.forEach((r) => {
    domainCounts[r.technologyDomain] = (domainCounts[r.technologyDomain] || 0) + 1;
    const year = (r.publicationDate || '2026').slice(0, 4);
    yearCounts[year] = (yearCounts[year] || 0) + 1;
    applicantCounts[r.applicant || 'Independent'] = (applicantCounts[r.applicant || 'Independent'] || 0) + 1;
    countryCounts[r.country || 'United States'] = (countryCounts[r.country || 'United States'] || 0) + 1;
  });

  return {
    totalResults,
    avgSimilarity: avgSim,
    domainDistribution: Object.entries(domainCounts).map(([name, value]) => ({ name, value })),
    yearDistribution: Object.entries(yearCounts).map(([year, count]) => ({ year, count })),
    topApplicants: Object.entries(applicantCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5),
    topCountries: Object.entries(countryCounts).map(([name, count]) => ({ name, count })),
  };
};

/**
 * Saves a Search History Entry.
 */
export const saveSearchHistory = async (userId, query, searchType, filters, resultCount) => {
  const searchId = `SRCH-${Date.now()}`;
  const nowISO = new Date().toISOString();

  const payload = {
    searchId,
    userId: userId || 'demo_user',
    query: query || 'All Patents Vector Search',
    searchType,
    filters,
    resultCount,
    createdAt: nowISO,
  };

  try {
    if (isFirebaseConfigured) {
      const docRef = doc(db, 'search_history', searchId);
      await setDoc(docRef, payload);
    }
  } catch (err) {
    console.warn('Firestore search_history save notice:', err.message);
  }

  const stored = JSON.parse(localStorage.getItem(`patentiq_search_history_${userId}`) || '[]');
  stored.unshift(payload);
  localStorage.setItem(`patentiq_search_history_${userId}`, JSON.stringify(stored.slice(0, 20)));

  return payload;
};

/**
 * Fetches Search History for User.
 */
export const getSearchHistory = async (userId) => {
  const stored = localStorage.getItem(`patentiq_search_history_${userId}`);
  return stored ? JSON.parse(stored) : [
    { searchId: 'SRCH-1', query: 'quantum micro-fluidic neural processor', searchType: 'semantic', resultCount: 4, createdAt: '2026-08-24T08:00:00Z' },
    { searchId: 'SRCH-2', query: 'autonomous irrigation soil moisture', searchType: 'keyword', resultCount: 6, createdAt: '2026-08-23T14:30:00Z' },
  ];
};

/**
 * Saves a Patent to User Research Collection with Notes.
 */
export const savePatentToCollection = async (userId, patentId, collectionId = 'My Research', notes = '') => {
  const saveId = `SAVE-${userId}_${patentId}`;
  const nowISO = new Date().toISOString();

  const payload = {
    saveId,
    userId: userId || 'demo_user',
    patentId,
    collectionId,
    notes,
    createdAt: nowISO,
  };

  try {
    if (isFirebaseConfigured) {
      const docRef = doc(db, 'saved_patents', saveId);
      await setDoc(docRef, payload);
    }
  } catch (err) {
    console.warn('Firestore saved_patents write notice:', err.message);
  }

  const stored = JSON.parse(localStorage.getItem(`patentiq_saved_patents_${userId}`) || '[]');
  const existingIdx = stored.findIndex((s) => s.patentId === patentId);
  if (existingIdx !== -1) {
    stored[existingIdx] = payload;
  } else {
    stored.push(payload);
  }
  localStorage.setItem(`patentiq_saved_patents_${userId}`, JSON.stringify(stored));

  return payload;
};

/**
 * Removes a Saved Patent from Collection.
 */
export const deleteSavedPatent = async (userId, patentId) => {
  const saveId = `SAVE-${userId}_${patentId}`;
  try {
    if (isFirebaseConfigured) {
      const docRef = doc(db, 'saved_patents', saveId);
      await deleteDoc(docRef);
    }
  } catch (e) {
    console.warn('Firestore delete saved patent notice:', e.message);
  }

  const stored = JSON.parse(localStorage.getItem(`patentiq_saved_patents_${userId}`) || '[]');
  const updated = stored.filter((s) => s.patentId !== patentId);
  localStorage.setItem(`patentiq_saved_patents_${userId}`, JSON.stringify(updated));
  return updated;
};

/**
 * Fetches Saved Patents for User.
 */
export const getSavedPatents = (userId) => {
  const stored = localStorage.getItem(`patentiq_saved_patents_${userId}`);
  return stored ? JSON.parse(stored) : [
    { saveId: 'SAVE-1', patentId: 'US-2026-0098412-A1', collectionId: 'My Research', notes: 'Key prior art reference for thermal cooling.', createdAt: '2026-08-20T10:00:00Z' },
    { saveId: 'SAVE-2', patentId: 'US-2026-0158492-A1', collectionId: 'Important Patents', notes: 'Direct competitor in irrigation control.', createdAt: '2026-08-22T11:15:00Z' },
  ];
};
