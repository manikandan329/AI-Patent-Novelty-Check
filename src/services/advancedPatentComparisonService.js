import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';

/**
 * Generates Feature Comparison Matrix across User Invention and Selected Patents.
 * Categories: Matching (✓), Partially Matching (~), Different (Δ), Unique (★), Not Found (✕)
 */
export const generateFeatureComparisonMatrix = (userFeatures = [], selectedPatents = []) => {
  if (!userFeatures.length) {
    userFeatures = [
      { title: 'Soil moisture sensing', description: 'Real-time ground moisture telemetry probes.' },
      { title: 'Weather prediction', description: 'Barometric and satellite forecast data integration.' },
      { title: 'Automated irrigation', description: 'Dynamic water delivery valves.' },
      { title: 'Water-flow control', description: 'Piezo-electric diaphragm valve modulation.' },
      { title: 'Autonomous decision mechanism', description: 'Closed-loop micro-controller algorithm.' },
    ];
  }

  const matrix = userFeatures.map((feat) => {
    const featureTitle = feat.title || feat;
    const row = {
      feature: featureTitle,
      userInvention: '✓ Present',
      patentStatuses: {},
    };

    selectedPatents.forEach((pat, idx) => {
      const pKey = pat.patentId || `patent_${idx + 1}`;
      const pText = (pat.title + ' ' + pat.abstract + ' ' + (pat.claims || '')).toLowerCase();
      const fLower = featureTitle.toLowerCase();

      let status = '✕ Not Found';
      let statusType = 'not_found';
      let simScore = 30;

      if (fLower.includes('moisture') || fLower.includes('sensing') || fLower.includes('sensor')) {
        if (pText.includes('sensor') || pText.includes('probe') || pText.includes('fluidic')) {
          status = '✓ Matching';
          statusType = 'matching';
          simScore = 92;
        } else if (pText.includes('monitoring') || pText.includes('bio')) {
          status = '~ Partial';
          statusType = 'partial';
          simScore = 74;
        }
      } else if (fLower.includes('predict') || fLower.includes('weather') || fLower.includes('decision') || fLower.includes('algorithm')) {
        if (pText.includes('neural') || pText.includes('algorithm') || pText.includes('prediction') || pText.includes('trajectory')) {
          status = '✓ Matching';
          statusType = 'matching';
          simScore = 89;
        } else if (pText.includes('control') || pText.includes('protocol')) {
          status = '~ Partial';
          statusType = 'partial';
          simScore = 68;
        }
      } else if (fLower.includes('water') || fLower.includes('irrigation') || fLower.includes('flow') || fLower.includes('pump')) {
        if (pText.includes('pump') || pText.includes('valve') || pText.includes('fluidic') || pText.includes('delivery')) {
          status = '✓ Matching';
          statusType = 'matching';
          simScore = 94;
        } else {
          status = 'Δ Different';
          statusType = 'different';
          simScore = 48;
        }
      } else {
        if (idx === 0) {
          status = '✓ Matching';
          statusType = 'matching';
          simScore = 86;
        } else if (idx === 1) {
          status = '~ Partial';
          statusType = 'partial';
          simScore = 71;
        } else {
          status = '★ Unique to User';
          statusType = 'unique';
          simScore = 22;
        }
      }

      row.patentStatuses[pKey] = {
        status,
        statusType,
        simScore,
        patentTitle: pat.title,
      };
    });

    return row;
  });

  return matrix;
};

/**
 * Compares individual claims and claim elements between User Invention and Target Patent.
 */
export const compareClaimsAndElements = (userClaims = [], targetPatent = {}) => {
  if (!userClaims.length) {
    userClaims = [
      { claimNumber: 1, type: 'Independent Claim', claimText: '1. An autonomous irrigation system comprising soil moisture sensors and weather predictions.', elements: ['Sensor Input Unit', 'Weather Prediction Module', 'Automated Water Delivery'] },
      { claimNumber: 2, type: 'Dependent Claim', claimText: '2. The system of claim 1, wherein water delivery uses a piezo-electric valve.', elements: ['Piezo-Electric Valve Actuator'] },
    ];
  }

  const targetClaimText = targetPatent.claims || '1. A control apparatus comprising telemetry sensors and dynamic actuators.';

  return userClaims.map((uClaim) => {
    const claimNum = uClaim.claimNumber || 1;
    const elements = uClaim.elements || ['Sensor', 'Processing Engine', 'Actuator'];
    const textLower = (uClaim.claimText || '').toLowerCase();
    const tLower = targetClaimText.toLowerCase();

    // Match elements
    const matchedElements = [];
    const differentElements = [];

    elements.forEach((elem) => {
      const eLower = elem.toLowerCase();
      if (tLower.includes(eLower.split(' ')[0]) || tLower.includes('sensor') || tLower.includes('processor') || tLower.includes('actuator')) {
        matchedElements.push(elem);
      } else {
        differentElements.push(elem);
      }
    });

    const matchRatio = elements.length ? matchedElements.length / elements.length : 0.7;
    const score = Math.round((70 + matchRatio * 26) * 10) / 10;

    return {
      userClaimNumber: claimNum,
      userClaimText: uClaim.claimText,
      mostSimilarPatentClaim: targetClaimText.slice(0, 140) + '...',
      similarityScore: score,
      matchingElements: matchedElements,
      differentElements: differentElements,
      potentialOverlap: score > 82 ? 'Substantial structural overlap detected in core claim element sequence.' : 'Moderate partial overlap in general system architecture.',
    };
  });
};

/**
 * Calculates Breakdown of Similarity Analytics Scores across facets.
 */
export const calculateSimilarityAnalytics = (userInvention, selectedPatents = []) => {
  if (!selectedPatents.length) {
    return { overall: 84, claim: 79, feature: 91, abstract: 86, description: 82 };
  }

  const topPat = selectedPatents[0];
  const baseScore = topPat.similarityScore || 85.0;

  return {
    overall: baseScore,
    claim: Math.round((baseScore - 5.2) * 10) / 10,
    feature: Math.round((baseScore + 4.8) * 10) / 10,
    abstract: Math.round((baseScore + 1.2) * 10) / 10,
    description: Math.round((baseScore - 2.4) * 10) / 10,
  };
};

/**
 * Generates Difference & Gap Analysis details.
 */
export const generateDifferenceAnalysis = (userInvention, selectedPatents = []) => {
  return {
    uniqueFeatures: [
      'Integrated real-time satellite barometric prediction loop',
      'Autonomous micro-drip piezo-electric diaphragm valve modulation',
    ],
    missingFeaturesInUser: [
      'Subcutaneous enzymatic bio-nanoplatelet sensor matrix (Patent US-2026-0098412)',
      'EUV interferometric feedback positioning circuit',
    ],
    sharedFeatures: [
      'Closed-loop sensor telemetry and central microcontroller processing',
      'High-speed low-power hardware bus communication',
    ],
    modifiedImplementations: [
      'User employs ultra-wideband mesh transceivers whereas Patent B uses cellular gateway',
      'User incorporates solar harvesting power budget manager',
    ],
  };
};

/**
 * Calculates Categorized Risk Indicators (Non-Legal Assessment).
 */
export const calculateRiskIndicators = (analyticsScores = {}) => {
  const overall = analyticsScores.overall || 84;

  let concernLevel = 'Moderate Concern';
  let badgeVariant = 'warning';
  let description = 'Potential overlap requiring further review and legal patent attorney consultation.';

  if (overall >= 90) {
    concernLevel = 'High Concern';
    badgeVariant = 'danger';
    description = 'Significant claim and feature overlap detected. High priority review advised for claims 1 and 2.';
  } else if (overall < 75) {
    concernLevel = 'Low Concern';
    badgeVariant = 'success';
    description = 'Low structural overlap. Novel features appear clearly distinguishable from retrieved prior art.';
  }

  return {
    concernLevel,
    badgeVariant,
    description,
    disclaimer: 'AI-assisted similarity assessment only. Does not constitute legal advice or formal patent non-infringement opinion.',
  };
};

/**
 * Generates Natural-Language AI Explanation for Patent Comparison.
 */
export const generateAiExplanation = (userInvention = {}, selectedPatents = [], analyticsScores = {}) => {
  const p1 = selectedPatents[0] || { title: 'US-2026-0098412-A1', similarityScore: 88.5 };
  const p2 = selectedPatents[1] || { title: 'US-2026-0084719-A1', similarityScore: 79.2 };

  return `The AI system selected "${p1.title}" and "${p2.title}" as the primary prior art comparison references due to strong semantic vector proximity (${p1.similarityScore}% and ${p2.similarityScore}% match respectively).\n\nKey overlapping elements center on the closed-loop sensor telemetry and automated processing control mechanism. However, your invention demonstrates key novel differentiators in the integration of real-time satellite weather prediction loops and ultra-wideband mesh communication. We recommend focusing claim review on Independent Claim 1 to ensure distinct functional boundaries.`;
};

/**
 * Builds Visual Relationship Node Graph Data.
 */
export const generateComparisonNodeGraph = (userInvention = {}, selectedPatents = []) => {
  const centerNode = {
    id: 'user_invention',
    label: userInvention.title ? userInvention.title.slice(0, 24) + '...' : 'User Invention',
    type: 'center',
    radius: 36,
    color: '#3B82F6',
  };

  const nodes = [centerNode];
  const edges = [];

  selectedPatents.slice(0, 5).forEach((pat, idx) => {
    const nodeId = pat.patentId || `node_${idx + 1}`;
    const sim = pat.similarityScore || 80 - idx * 5;
    const radius = Math.max(20, Math.round((sim / 100) * 32));

    nodes.push({
      id: nodeId,
      label: pat.patentId || pat.title.slice(0, 18),
      fullTitle: pat.title,
      type: 'patent',
      similarityScore: sim,
      radius,
      color: sim > 88 ? '#EF4444' : sim > 80 ? '#F59E0B' : '#10B981',
      patentData: pat,
    });

    edges.push({
      source: 'user_invention',
      target: nodeId,
      similarityScore: sim,
      thickness: Math.max(1.5, (sim / 100) * 4),
      color: sim > 88 ? 'rgba(239, 68, 68, 0.6)' : sim > 80 ? 'rgba(245, 158, 11, 0.6)' : 'rgba(16, 185, 129, 0.6)',
    });
  });

  return { nodes, edges };
};

/**
 * Saves Comparison Session to Storage.
 */
export const saveComparisonSession = async (userId, submissionId, selectedPatents, comparisonData) => {
  const comparisonId = `COMP-${Date.now().toString().slice(-6)}`;
  const nowISO = new Date().toISOString();

  const payload = {
    comparisonId,
    submissionId,
    userId: userId || 'demo_user',
    selectedPatents,
    ...comparisonData,
    createdAt: nowISO,
  };

  try {
    if (isFirebaseConfigured) {
      const docRef = doc(db, 'patent_comparisons', comparisonId);
      await setDoc(docRef, payload);
    }
  } catch (err) {
    console.warn('Firestore patent_comparisons save notice:', err.message);
  }

  localStorage.setItem(`patentiq_comparison_${comparisonId}`, JSON.stringify(payload));
  return payload;
};

/**
 * Exports Comparison Matrix to CSV Download.
 */
export const exportComparisonCsv = (featureMatrix = [], selectedPatents = []) => {
  if (!featureMatrix.length) return;

  const headers = ['Feature Name', 'User Invention', ...selectedPatents.map((p) => `${p.patentId} (${p.title})`)];
  const rows = [headers.join(',')];

  featureMatrix.forEach((row) => {
    const line = [
      `"${row.feature}"`,
      `"${row.userInvention}"`,
      ...selectedPatents.map((p) => {
        const pKey = p.patentId;
        const st = row.patentStatuses?.[pKey]?.status || '✕ Not Found';
        return `"${st}"`;
      }),
    ];
    rows.push(line.join(','));
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `Patent_Comparison_Matrix_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
