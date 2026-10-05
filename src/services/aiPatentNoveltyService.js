import { doc, setDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { parsePatentSections } from './patentDocumentProcessor';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const DISCLAIMER_TEXT =
  'AI-assisted preliminary novelty analysis. This report is an automated research assessment and does not constitute a formal legal opinion or guarantee patentability.';

export const extractTextFromFile = async (file) => {
  if (!file) {
    return {
      success: false,
      error: 'No file provided.'
    };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;

      if (!text || typeof text !== 'string') {
        resolve({
          success: false,
          error: 'Could not extract readable text from document.'
        });
        return;
      }

      const parsedSections = parsePatentSections(text);

      resolve({
        success: true,
        rawText: text,
        parsedSections
      });
    };

    reader.onerror = () => {
      resolve({
        success: false,
        error: 'Error reading file contents.'
      });
    };

    reader.readAsText(file);
  });
};

export const parseClaimsToStructure = (claimsText) => {
  if (!claimsText || typeof claimsText !== 'string') {
    return [];
  }

  const cleanedClaims = claimsText.trim();

  if (!cleanedClaims) {
    return [];
  }

  const claimBlocks = cleanedClaims
    .split(/(?=\bClaim\s+\d+|\b\d+\.\s+)/i)
    .map((claim) => claim.trim())
    .filter((claim) => claim.length > 5);

  if (claimBlocks.length === 0) {
    return [
      {
        id: 'claim-1',
        number: 1,
        type: 'Independent',
        text: cleanedClaims,
        features: extractFeaturesFromText(cleanedClaims)
      }
    ];
  }

  return claimBlocks.map((block, index) => {
    const numberMatch = block.match(/^(?:Claim\s+)?(\d+)\./i);
    const number = numberMatch
      ? Number(numberMatch[1])
      : index + 1;

    const isDependent =
      /wherein|of claim|according to claim|claim \d+/i.test(block);

    return {
      id: `claim-${number}`,
      number,
      type: isDependent
        ? 'Dependent'
        : 'Independent',
      text: block,
      features: extractFeaturesFromText(block)
    };
  });
};

function extractFeaturesFromText(text) {
  const sentences = text
    .replace(/^\s*(?:Claim\s+)?\d+\.\s*/i, '')
    .split(/[,;.\n]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 12);

  if (sentences.length > 0) {
    return sentences.slice(0, 4);
  }

  return [text.trim()];
}

export const searchPriorArtMatches = async (patentData) => {
  const title = patentData?.title?.trim() || '';
  const abstract = patentData?.abstract?.trim() || '';

  if (!title || !abstract) {
    throw new Error('Patent title and abstract are required.');
  }

  const response = await fetch(
    `${API_BASE_URL}/api/novelty/analyze`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        abstract,
        top_k: 5
      })
    }
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({}));

    throw new Error(
      errorData.detail ||
        `Patent ML analysis failed with status ${response.status}.`
    );
  }

  const data = await response.json();

  return (data.results || []).map((patent) => ({
    id: patent.patentId,
    patentNumber: patent.patentId,
    title: patent.title,
    applicant: 'HUPD Patent Dataset',
    publicationDate: 'Dataset record',
    source: patent.source || 'HUPD patent dataset',
    similarityScore: patent.overallSimilarityPercent,
    overallSimilarity: patent.overallSimilarityPercent,
    titleSimilarity: patent.titleSimilarityPercent,
    abstractSimilarity: patent.abstractSimilarityPercent,
    technicalRelatedness: patent.technicalRelatedness,
    similarityLevel: patent.similarityLevel,
    relevantMatchingFeatures: [
      `Overall similarity: ${patent.overallSimilarityPercent}%`,
      `Title similarity: ${patent.titleSimilarityPercent}%`,
      `Abstract similarity: ${patent.abstractSimilarityPercent}%`,
      `Technical relatedness: ${patent.technicalRelatedness}`
    ],
    abstract:
      patent.abstract ||
      'Patent abstract was not returned by the ML API.'
  }));
};

export const buildClaimToPriorArtMapping = (
  structuredClaims,
  priorArtList
) => {
  if (!structuredClaims.length) {
    return [];
  }

  const topMatch = priorArtList[0] || null;

  return structuredClaims.map((claim) => ({
    claimNumber: claim.number,
    claimType: claim.type,
    claimText: claim.text,
    featureMappings: [
      {
        featureName:
          'Document-level ML screening evidence',
        status: topMatch
          ? 'Potential Technical Overlap'
          : 'No Retrieved Match',
        matchedPatent:
          topMatch?.patentNumber || 'None',
        matchedTitle:
          topMatch?.title ||
          'No matching patent retrieved',
        similarityScore:
          topMatch?.similarityScore || 0,
        matchType:
          topMatch
            ? 'Document-Level Similarity'
            : 'No Match'
      }
    ]
  }));
};

export const calculateNoveltyScore = () => {
  return {
    noveltyScore: null,
    noveltyStatus: 'Preliminary Screening',
    badgeVariant: 'primary',
    confidenceLevel: 'Not a legal confidence score'
  };
};

export const runFullPatentNoveltyAnalysis = async (
  patentInput,
  progressCallback = () => {},
  isDemo = false
) => {
  const title =
    patentInput?.title?.trim() || '';

  const abstract =
    patentInput?.abstract?.trim() || '';

  if (!title) {
    throw new Error(
      'Patent title is required.'
    );
  }

  if (!abstract) {
    throw new Error(
      'Patent abstract is required for ML analysis.'
    );
  }

  progressCallback({
    step: 1,
    message:
      'Validating patent title and abstract...',
    progress: 20
  });

  await new Promise((resolve) =>
    setTimeout(resolve, 250)
  );

  progressCallback({
    step: 2,
    message:
      'Applying TF-IDF feature transformation...',
    progress: 40
  });

  await new Promise((resolve) =>
    setTimeout(resolve, 250)
  );

  progressCallback({
    step: 3,
    message:
      'Searching 11,532 patent records...',
    progress: 60
  });

  const response = await fetch(
    `${API_BASE_URL}/api/novelty/analyze`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        abstract,
        top_k: 5
      })
    }
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({}));

    throw new Error(
      errorData.detail ||
        `Patent ML analysis failed with status ${response.status}.`
    );
  }

  const mlResult = await response.json();

  progressCallback({
    step: 4,
    message:
      'Applying Logistic Regression relatedness analysis...',
    progress: 80
  });

  await new Promise((resolve) =>
    setTimeout(resolve, 250)
  );

  const claimsList =
    parseClaimsToStructure(
      patentInput?.claims || ''
    );

  const priorArtMatches =
    (mlResult.results || []).map(
      (patent) => ({
        id: patent.patentId,
        patentNumber: patent.patentId,
        title: patent.title,
        applicant: 'HUPD Patent Dataset',
        publicationDate: 'Dataset record',
        source:
          patent.source ||
          'HUPD patent dataset',
        similarityScore:
          patent.overallSimilarityPercent,
        overallSimilarity:
          patent.overallSimilarityPercent,
        titleSimilarity:
          patent.titleSimilarityPercent,
        abstractSimilarity:
          patent.abstractSimilarityPercent,
        technicalRelatedness:
          patent.technicalRelatedness,
        similarityLevel:
          patent.similarityLevel,
        relevantMatchingFeatures: [
          `Overall similarity: ${patent.overallSimilarityPercent}%`,
          `Title similarity: ${patent.titleSimilarityPercent}%`,
          `Abstract similarity: ${patent.abstractSimilarityPercent}%`,
          `Technical relatedness: ${patent.technicalRelatedness}`
        ],
        abstract:
          patent.abstract ||
          'Patent abstract was not returned by the ML API.'
      })
    );

  const claimMapping =
    buildClaimToPriorArtMapping(
      claimsList,
      priorArtMatches
    );

  const topMatch =
    priorArtMatches[0] || null;

  const highestSimilarity =
    Number(
      mlResult.highestSimilarityPercent || 0
    );

  progressCallback({
    step: 5,
    message:
      'Preparing preliminary screening report...',
    progress: 100
  });

  await new Promise((resolve) =>
    setTimeout(resolve, 250)
  );

  const analysisId =
    `ml_novelty_${Date.now()}`;

  const nowISO =
    new Date().toISOString();

  const result = {
    id: analysisId,
    title,
    inventor:
      patentInput?.inventor?.trim() || '',
    abstract,
    claimsRaw:
      patentInput?.claims || '',
    analysisDate: nowISO,

    noveltyScore: null,

    noveltyStatus:
      mlResult.screeningResult ||
      'UNKNOWN',

    badgeVariant:
      highestSimilarity >= 40
        ? 'danger'
        : highestSimilarity >= 20
        ? 'warning'
        : 'success',

    confidenceLevel:
      'Logistic Regression document-level screening',

    overallSimilarityScore:
      highestSimilarity,

    claimsAnalyzedCount:
      claimsList.length,

    relevantPriorArtCount:
      priorArtMatches.length,

    mlModel:
      'Logistic Regression',

    screeningResult:
      mlResult.screeningResult ||
      'UNKNOWN',

    claimsList,

    priorArtMatches,

    claimMapping,

    aiExplanation: {
      noveltyRationale:
        topMatch
          ? `The ML screening identified a highest document-level similarity of ${highestSimilarity}% with ${topMatch.patentNumber} (${topMatch.title}). This indicates potential technical overlap and should be reviewed at the claim level. It does not establish lack of novelty.`
          : 'The ML screening did not retrieve a sufficiently similar patent record from the available corpus.',

      disclosedFeatures: priorArtMatches
        .slice(0, 3)
        .map(
          (patent) =>
            `${patent.title} (${patent.similarityScore}% overall similarity)`
        ),

      distinctiveFeatures: [
        'The current model performs document-level title and abstract screening.',
        'The model does not determine legal claim-level anticipation.',
        'Further claim-by-claim comparison is recommended.'
      ],

      mostRelevantDocuments:
        priorArtMatches
          .slice(0, 3)
          .map(
            (patent) =>
              `${patent.patentNumber}: ${patent.title} (${patent.similarityScore}% similarity)`
          )
    },

    recommendations: [
      'Review the highest-similarity patent record in detail.',
      'Compare the independent claims of the invention with the retrieved prior-art documents.',
      'Perform a broader prior-art search using additional technical keywords.',
      'Do not treat document similarity as a legal probability of patentability.',
      'Obtain professional patent examination or legal advice before filing decisions.'
    ],

    disclaimer:
      mlResult.disclaimer ||
      DISCLAIMER_TEXT,

    isDemo
  };

  try {
    const existing =
      JSON.parse(
        localStorage.getItem(
          'patentiq_novelty_analyses'
        ) || '[]'
      );

    existing.unshift(result);

    localStorage.setItem(
      'patentiq_novelty_analyses',
      JSON.stringify(existing)
    );

    if (isFirebaseConfigured) {
      const docRef = doc(
        db,
        'patent_novelty_analyses',
        analysisId
      );

      await setDoc(
        docRef,
        result
      );
    }
  } catch (err) {
    console.warn(
      'Novelty analysis storage notice:',
      err.message
    );
  }

  return result;
};

export const getNoveltyAnalysisHistory =
  async () => {
    const localData =
      JSON.parse(
        localStorage.getItem(
          'patentiq_novelty_analyses'
        ) || '[]'
      );

    if (isFirebaseConfigured) {
      try {
        const querySnap =
          await getDocs(
            collection(
              db,
              'patent_novelty_analyses'
            )
          );

        const dbList = [];

        querySnap.forEach(
          (docSnap) =>
            dbList.push(docSnap.data())
        );

        if (dbList.length > 0) {
          return dbList.sort(
            (a, b) =>
              new Date(b.analysisDate) -
              new Date(a.analysisDate)
          );
        }
      } catch (e) {
        console.warn(
          'Firestore fetch novelty history notice:',
          e.message
        );
      }
    }

    return localData;
  };

export const getNoveltyAnalysisById =
  async (analysisId) => {
    const history =
      await getNoveltyAnalysisHistory();

    return (
      history.find(
        (item) => item.id === analysisId
      ) || null
    );
  };

export async function deleteNoveltyAnalysis(
  id
) {
  const localData =
    JSON.parse(
      localStorage.getItem(
        'patentiq_novelty_analyses'
      ) || '[]'
    );

  const updated =
    localData.filter(
      (item) => item.id !== id
    );

  localStorage.setItem(
    'patentiq_novelty_analyses',
    JSON.stringify(updated)
  );

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(
        doc(
          db,
          'patent_novelty_analyses',
          id
        )
      );
    } catch (e) {
      console.warn(
        'Firestore delete novelty analysis error:',
        e
      );
    }
  }

  return updated;
}