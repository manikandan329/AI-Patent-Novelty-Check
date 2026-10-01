/**
 * NLP Text Preprocessing Pipeline for Patent Documents
 * 
 * Steps:
 * 1. Consolidate patent fields (Title, Summary, Problem, Solution, Novelty, Mechanics, Advantages, Applications)
 * 2. Lowercase conversion
 * 3. Remove punctuation & special characters
 * 4. Remove standard English stop words (while preserving technical terms like 'non-volatile', 'quantum', 'graphene')
 * 5. Normalize whitespace
 * 6. Term lemmatization & token extraction
 */

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
  'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d',
  'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s',
  'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
  'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll',
  'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which',
  'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d',
  'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

/**
 * Combines all relevant technical patent fields into a unified document string.
 */
export const consolidatePatentText = (patentData = {}) => {
  const parts = [
    patentData.title || '',
    patentData.summary || '',
    patentData.problemStatement || '',
    patentData.proposedSolution || '',
    patentData.novelFeatures || '',
    patentData.workingPrinciple || '',
    patentData.advantages || '',
    patentData.applications || '',
  ];

  return parts.filter(Boolean).join(' ');
};

/**
 * Preprocesses raw patent text using NLP rules.
 */
export const preprocessPatentText = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    return {
      rawText: '',
      cleanedText: '',
      tokens: [],
      stats: { rawLength: 0, cleanedLength: 0, tokenCount: 0, removedStopwords: 0 },
    };
  }

  const rawLength = rawText.length;

  // 1. Convert to lowercase
  let text = rawText.toLowerCase();

  // 2. Remove punctuation and special symbols except hyphens in technical compounds
  text = text.replace(/[^a-z0-9\s\-]/g, ' ');

  // 3. Split into words
  const words = text.split(/\s+/).filter(Boolean);

  let removedStopwordsCount = 0;
  const filteredTokens = [];

  // 4. Remove stopwords while preserving technical term compounds
  for (const word of words) {
    const cleanWord = word.replace(/^-+|-+$/g, '');
    if (!cleanWord) continue;

    if (STOP_WORDS.has(cleanWord) && !cleanWord.includes('-')) {
      removedStopwordsCount++;
    } else {
      // Basic lemmatization heuristics (stripping plurals & common suffixes)
      let lemmatized = cleanWord;
      if (lemmatized.length > 5) {
        if (lemmatized.endsWith('ing')) lemmatized = lemmatized.slice(0, -3);
        else if (lemmatized.endsWith('ion')) lemmatized = lemmatized.slice(0, -3);
        else if (lemmatized.endsWith('ies')) lemmatized = lemmatized.slice(0, -3) + 'y';
        else if (lemmatized.endsWith('es')) lemmatized = lemmatized.slice(0, -2);
        else if (lemmatized.endsWith('s') && !lemmatized.endsWith('ss')) lemmatized = lemmatized.slice(0, -1);
      }
      filteredTokens.push(lemmatized);
    }
  }

  const cleanedText = filteredTokens.join(' ');

  return {
    rawText,
    cleanedText,
    tokens: filteredTokens,
    stats: {
      rawLength,
      cleanedLength: cleanedText.length,
      tokenCount: filteredTokens.length,
      removedStopwords: removedStopwordsCount,
    },
  };
};
