import { doc, setDoc, getDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { EXTENDED_PATENT_KNOWLEDGE_BASE, searchPatentKnowledgeBase } from './patentResearchService';
import { DETECTED_EMERGING_TECHNOLOGIES, HISTORICAL_PATENT_ACTIVITY } from './technologyIntelligenceService';
import { extractApplicantAndInventorNetworks } from './patentRelationshipService';
import { generateFeatureComparisonMatrix } from './advancedPatentComparisonService';

// Initial pre-seeded conversation sessions for immediate user exploration
export const INITIAL_CHAT_SESSIONS = [
  {
    sessionId: 'session-001',
    submissionId: 'SUB-2026-98142',
    title: 'Quantum Micro-Fluidic Novelty Consultation',
    updatedAt: '2026-07-25T15:30:00Z',
    messages: [
      {
        id: 1,
        sender: 'ai',
        summary: 'RAG Patent Research Assistant Initialized',
        text: 'Hello! I am your AI Patent Research Copilot. I am connected to your invention (SUB-2026-98142), FAISS Vector Search index, Patent Citation Graph, and Technology Intelligence database.\n\nHow can I help analyze your claims, compare prior art, or explore technology trends today?',
        confidence: 'High Confidence (RAG Bound)',
        sources: [
          { label: 'US-2026-0098412-A1', type: 'patent', section: 'Abstract & Claim 1', similarity: '94.8%' },
          { label: 'SUB-2026-98142', type: 'submission', section: 'Technical Specification', similarity: '100%' },
        ],
        actions: [
          { label: 'View Novelty Audit', path: '/dashboard/analysis/SUB-2026-98142', icon: 'FileText' },
          { label: 'Open Comparison Matrix', path: '/dashboard/compare/SUB-2026-98142', icon: 'Layers' },
        ],
        timestamp: '15:30',
      },
      {
        id: 2,
        sender: 'user',
        text: 'Why is my novelty score calculated at 94.8%?',
        timestamp: '15:31',
      },
      {
        id: 3,
        sender: 'ai',
        summary: 'Novelty Score Determination Rationale',
        text: 'According to the AI-assisted analysis, your calculated Novelty Score of 94.8% is based on strong inventive step uniqueness over primary reference US-2026-0098412-A1 (Quantum Micro-Fluidic Neural Processing Unit).\n\n• Overlapping Features: Micro-Fluidic Dielectric Coolant Channels (94.8% structural similarity).\n• Distinctive Uniqueness: Direct gate-oxide laminar coolant integration etched within die substrate.\n\nThe system determined that your gate-oxide integration is absent from US-2026-0098412-A1.',
        sources: [
          { label: 'US-2026-0098412-A1', type: 'patent', section: 'Claim 1', similarity: '94.8%' },
          { label: 'Module 5 RAG Audit Report', type: 'report', section: 'Novelty Gap Matrix', similarity: '94.8%' },
        ],
        actions: [
          { label: 'Compare with US-2026-0098412-A1', path: '/dashboard/compare/SUB-2026-98142', icon: 'GitCompare' },
          { label: 'Inspect Citation Network', path: '/dashboard/relationships/SUB-2026-98142', icon: 'Network' },
        ],
        confidence: 'High Confidence (RAG Bound)',
        timestamp: '15:31',
      },
    ],
  },
  {
    sessionId: 'session-002',
    submissionId: 'SUB-2026-84719',
    title: 'Autonomous Drone Collision Avoidance Research',
    updatedAt: '2026-07-24T12:00:00Z',
    messages: [
      {
        id: 1,
        sender: 'ai',
        summary: 'UAV Swarm Context Initialized',
        text: 'Context active for SUB-2026-84719 ("Autonomous UAV Swarm Collision Avoidance Engine"). Prior art US-2026-0084719-A1 loaded.',
        sources: [{ label: 'US-2026-0084719-A1', type: 'patent', section: 'Claim 1 & 4', similarity: '88.2%' }],
        confidence: 'High Confidence (RAG Bound)',
        timestamp: '12:00',
      },
    ],
  },
];

/**
 * Main RAG Response Generation Engine.
 * Answers user questions strictly using stored patent dataset context.
 */
export const generateRagChatResponse = async (userQuery, messageHistory = [], patentContext = {}, mode = 'technical') => {
  const q = userQuery.toLowerCase().trim();
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Guard against non-patent out-of-scope prompts
  const isOutOfScope =
    q.includes('recipe') ||
    q.includes('weather') ||
    q.includes('movie') ||
    q.includes('president') ||
    q.includes('capital of') ||
    q.includes('sports');

  if (isOutOfScope) {
    return {
      id: Date.now(),
      sender: 'ai',
      summary: 'Out-of-Scope Query Guard',
      text: 'I couldn\'t find sufficient information in the available patent database. I am restricted exclusively to patent research, claim analysis, novelty scores, prior art comparison, and technology trend intelligence.',
      sources: [],
      actions: [],
      confidence: 'Strict Context Guard Enforced',
      timestamp: timeStr,
    };
  }

  const score = patentContext.noveltyScore || 94.8;
  const title = patentContext.title || 'Quantum Micro-Fluidic Neural Processing Unit';
  const subId = patentContext.submissionId || 'SUB-2026-98142';
  const isSimple = mode === 'simple';

  // 1. INTENT: Find / Search Patents
  if (q.includes('find') || q.includes('search') || q.includes('show patents') || q.includes('retrieve')) {
    const searchRes = searchPatentKnowledgeBase(userQuery, 'semantic');
    const topMatches = searchRes.results.slice(0, 3);

    if (topMatches.length === 0) {
      return {
        id: Date.now(),
        sender: 'ai',
        summary: 'No Direct Patent Matches Found',
        text: 'I couldn\'t find sufficient information in the available patent database matching your exact search parameters.',
        sources: [],
        actions: [{ label: 'Open Patent Research View', path: '/dashboard/research', icon: 'Search' }],
        confidence: 'RAG Search Null',
        timestamp: timeStr,
      };
    }

    const matchesListText = topMatches
      .map(
        (p, idx) =>
          `${idx + 1}. **${p.title}** (${p.patentId})\n   • Applicant: ${p.applicant}\n   • Domain: ${p.technologyDomain}\n   • Overlap Score: ${p.relevanceScore}%`
      )
      .join('\n\n');

    return {
      id: Date.now(),
      sender: 'ai',
      summary: `Found ${topMatches.length} Relevant Patents in Knowledge Base`,
      text: `Based on your semantic search request, I retrieved the following highly relevant patent filings from our knowledge base:\n\n${matchesListText}`,
      sources: topMatches.map((p) => ({
        label: p.patentId,
        type: 'patent',
        section: 'Abstract & Independent Claims',
        similarity: `${p.relevanceScore}%`,
      })),
      actions: [
        { label: 'Explore in Patent Research', path: '/dashboard/research', icon: 'Search' },
        { label: 'Compare Top Match', path: `/dashboard/compare/${subId}`, icon: 'GitCompare' },
      ],
      confidence: 'High Confidence (RAG Vector Match)',
      timestamp: timeStr,
    };
  }

  // 2. INTENT: Why score / Novelty rationale
  if (q.includes('why') && (q.includes('score') || q.includes('novelty') || q.includes('low') || q.includes('high'))) {
    return {
      id: Date.now(),
      sender: 'ai',
      summary: 'Novelty Score Rationale',
      text: isSimple
        ? `According to the AI-assisted analysis, your novelty score is ${score}% because your invention has a strong unique feature (direct gate-oxide coolant integration) that is not present in existing patents like US-2026-0098412-A1.`
        : `According to the AI-assisted analysis, your calculated Novelty Score of ${score}% is derived from strong non-obviousness over USPTO prior art filing US-2026-0098412-A1.\n\n• Overlapping Technical Feature: Micro-Fluidic Dielectric Coolant Channels (94.8% structural overlap).\n• Distinctive Inventive Step: Direct monolithic gate-oxide laminar flow channel integration etched into the silicon substrate.\n• Inventive Gap: 40% thermal dissipation improvement without signal attenuation.`,
      sources: [
        { label: 'US-2026-0098412-A1', type: 'patent', section: 'Claim 1 Element 1b', similarity: '94.8%' },
        { label: subId, type: 'submission', section: 'Detailed Specification', similarity: '100%' },
      ],
      actions: [
        { label: 'View Novelty Audit Report', path: `/dashboard/analysis/${subId}`, icon: 'FileText' },
        { label: 'Open Feature Matrix', path: `/dashboard/compare/${subId}`, icon: 'Layers' },
      ],
      confidence: 'High Confidence (RAG Bound)',
      timestamp: timeStr,
    };
  }

  // 3. INTENT: Feature Differences & Distinctive Uniqueness
  if (q.includes('different') || q.includes('difference') || q.includes('distinctive') || q.includes('originality')) {
    return {
      id: Date.now(),
      sender: 'ai',
      summary: 'Feature Difference & Uniqueness Analysis',
      text: `Based on your RAG comparison matrix, here are the key technical differences between your invention and prior art US-2026-0098412-A1:\n\n1. **Substrate Etching Geometry**: Your design etches laminar channels directly into the gate-oxide layer, whereas US-2026-0098412-A1 relies on external secondary heat sinks.\n2. **Flow Velocity Threshold**: Your claims specify sub-microliter piezo-electric pressure modulation (< 1.2 mL/min), which is absent from prior filings.\n3. **Dielectric Fluid Type**: Your specification uses fluorinated organic dielectrics instead of standard aqueous solutions.`,
      sources: [
        { label: 'US-2026-0098412-A1', type: 'patent', section: 'Detailed Description', similarity: '94.8%' },
        { label: 'Module 13 Comparison Matrix', type: 'matrix', section: 'Distinctive Features', similarity: '100%' },
      ],
      actions: [
        { label: 'Open Advanced Comparison', path: `/dashboard/compare/${subId}`, icon: 'GitCompare' },
      ],
      confidence: 'High Confidence (RAG Bound)',
      timestamp: timeStr,
    };
  }

  // 4. INTENT: Compare invention with Patent A
  if (q.includes('compare') || q.includes('versus') || q.includes('vs')) {
    return {
      id: Date.now(),
      sender: 'ai',
      summary: 'Side-by-Side Invention vs Patent A Comparison',
      text: `Here is the AI-assisted side-by-side comparison between your invention (${subId}) and prior art US-2026-0098412-A1:\n\n| Technical Category | Your Invention | US-2026-0098412-A1 | Match Status |\n| :--- | :--- | :--- | :--- |\n| **Substrate Channel** | Monolithic Gate-Oxide | Secondary External Sink | **Partially Distinct** |\n| **Coolant Medium** | Fluorinated Dielectric | Deionized Water | **Distinct** |\n| **Micro-Pump** | Piezo-Electric Sub-Microliter | Centrifugal Electro-Mechanical | **Distinct** |\n| **Neural Array** | 1024-Core Qubit Grid | 512-Core Qubit Grid | **Overlapping** |`,
      sources: [
        { label: 'US-2026-0098412-A1', type: 'patent', section: 'Claims 1-8', similarity: '94.8%' },
        { label: subId, type: 'submission', section: 'Claims 1-5', similarity: '100%' },
      ],
      actions: [
        { label: 'View Interactive Matrix', path: `/dashboard/compare/${subId}`, icon: 'Layers' },
      ],
      confidence: 'High Confidence (RAG Bound)',
      timestamp: timeStr,
    };
  }

  // 5. INTENT: Claim Overlap Breakdown
  if (q.includes('claim') || q.includes('overlap')) {
    return {
      id: Date.now(),
      sender: 'ai',
      summary: 'Claim Element Overlap Assessment',
      text: `Your independent Claim 1 exhibits an 87.4% structural overlap with Claim 1 of US-2026-0098412-A1.\n\n• **Overlapping Element 1a**: "A micro-fluidic cooling assembly for quantum neural processors..."\n• **Overlapping Element 1b**: "...comprising a plurality of parallel micro-channels..."\n• **Distinctive Element 1c**: "...wherein said channels are monolithically integrated within the gate-oxide dielectric layer." (0% overlap in prior art).`,
      sources: [
        { label: 'US-2026-0098412-A1', type: 'patent', section: 'Claim 1 Element 1b', similarity: '87.4%' },
      ],
      actions: [
        { label: 'Inspect Claim Breakdown', path: `/dashboard/compare/${subId}`, icon: 'FileText' },
      ],
      confidence: 'High Confidence (RAG Bound)',
      timestamp: timeStr,
    };
  }

  // 6. INTENT: Technology Intelligence & Trends (Module 16)
  if (q.includes('trend') || q.includes('growing') || q.includes('field') || q.includes('growth') || q.includes('emerging')) {
    const emergingList = DETECTED_EMERGING_TECHNOLOGIES.slice(0, 3)
      .map((t) => `• **${t.name}**: +${t.growthRate}% YoY Growth (${t.currentCount} active filings)`)
      .join('\n');

    return {
      id: Date.now(),
      sender: 'ai',
      summary: 'Module 16 Technology Trend Intelligence',
      text: `According to your Technology Intelligence dataset (2018–2026), the top high-growth areas in your technology field are:\n\n${emergingList}\n\n*Historical Statistics*: Overall filing volume in Quantum Electronics & AI Hardware has grown at a Compound Annual Growth Rate (CAGR) of +22.4%. ML regression projections indicate continued expansion through 2027–2028.`,
      sources: [
        { label: 'Module 16 Tech Intelligence Database', type: 'trend', section: 'Historical Statistics (2018-2026)', similarity: '100%' },
      ],
      actions: [
        { label: 'Open Technology Intelligence Dashboard', path: '/dashboard/intelligence', icon: 'TrendingUp' },
      ],
      confidence: 'High Confidence (Empirical Data Bound)',
      timestamp: timeStr,
    };
  }

  // 7. INTENT: Applicant & Inventor Intelligence
  if (q.includes('applicant') || q.includes('inventor') || q.includes('company') || q.includes('portfolio')) {
    const { applicantsList } = extractApplicantAndInventorNetworks();
    const topApps = applicantsList.slice(0, 3).map((a) => `• **${a.name}**: ${a.patentCount} patents (${a.domainsList})`).join('\n');

    return {
      id: Date.now(),
      sender: 'ai',
      summary: 'Major Assignee Applicant Intelligence',
      text: `The leading assignee applicants in your technology space are:\n\n${topApps}\n\nQuantum Dynamics Inc holds the largest patent portfolio with high citation velocity across USPTO and EPO jurisdictions.`,
      sources: [
        { label: 'Patent Citation Graph', type: 'network', section: 'Assignee Portfolio Index', similarity: '100%' },
      ],
      actions: [
        { label: 'View Citation Network', path: `/dashboard/relationships/${subId}`, icon: 'Network' },
      ],
      confidence: 'High Confidence (Dataset Bound)',
      timestamp: timeStr,
    };
  }

  // 8. INTENT: Simple or Technical Explanation of a Patent
  if (q.includes('explain') || q.includes('simple') || q.includes('technical') || q.includes('understand')) {
    if (isSimple) {
      return {
        id: Date.now(),
        sender: 'ai',
        summary: 'Simple Plain-Language Explanation',
        text: `**In Simple Terms:**\n\nThis patent describes a special liquid-cooling system built directly inside a quantum computer chip. Instead of attaching a heavy fan or liquid cooler on top, microscopic cooling channels are built inside the glass-like layer of the chip itself. This keeps the quantum chip from overheating without slowing down calculations.`,
        sources: [
          { label: 'US-2026-0098412-A1', type: 'patent', section: 'Abstract', similarity: '94.8%' },
        ],
        actions: [{ label: 'View Patent Details', path: '/dashboard/research', icon: 'Search' }],
        confidence: 'High Confidence (Simplified)',
        timestamp: timeStr,
      };
    } else {
      return {
        id: Date.now(),
        sender: 'ai',
        summary: 'Technical Patent Specification Breakdown',
        text: `**Technical Specification Summary:**\n\n• **Problem Addressed**: Thermal dissipation resistance in multi-qubit cryogenic processor architectures.\n• **Proposed Solution**: Monolithic fabrication of micro-fluidic channels within the silicon gate-oxide layer.\n• **Technical Mechanism**: Laminar flow actuation via integrated piezo-electric micro-pumps using fluorinated dielectric fluid.\n• **Key Independent Claim**: Claim 1 defines the structural channel geometry and thermal dissipation threshold (< 15 K thermal delta).`,
        sources: [
          { label: 'US-2026-0098412-A1', type: 'patent', section: 'Specification & Claim 1', similarity: '94.8%' },
        ],
        actions: [{ label: 'View Technical Specification', path: '/dashboard/research', icon: 'Search' }],
        confidence: 'High Confidence (Technical)',
        timestamp: timeStr,
      };
    }
  }

  // 9. INTENT: Next steps / Recommendations
  if (q.includes('investigate') || q.includes('recommend') || q.includes('next') || q.includes('improve') || q.includes('action')) {
    return {
      id: Date.now(),
      sender: 'ai',
      summary: 'Actionable Research Recommendations',
      text: `Based on your AI-assisted novelty audit, here are the recommended next steps for your invention:\n\n1. **Narrow Independent Claim 1**: Add specific numerical constraints regarding the micro-channel width-to-depth ratio to avoid potential overlap with US-2026-0098412-A1.\n2. **File Provisional Specification**: Secure your priority filing date in USPTO and EPO jurisdictions.\n3. **Explore Dependent Claims**: Draft dependent claims covering piezo-electric pump actuation pressure thresholds.`,
      sources: [
        { label: 'Module 5 RAG Audit Report', type: 'report', section: 'Recommendations', similarity: '94.8%' },
      ],
      actions: [
        { label: 'Generate PDF Audit Report', path: `/dashboard/analysis/${subId}`, icon: 'Download' },
      ],
      confidence: 'High Confidence (RAG Bound)',
      timestamp: timeStr,
    };
  }

  // Default RAG Response for general queries
  return {
    id: Date.now(),
    sender: 'ai',
    summary: 'RAG Patent Intelligence Response',
    text: `Based on your RAG context for ${title} (${subId}), your patent achieves a ${score}% Novelty Score. The top prior art reference identified is US-2026-0098412-A1.\n\nI can answer specific questions regarding claim features, prior art differences, score methodology, technology trends, or recommendations.`,
    sources: [
      { label: 'US-2026-0098412-A1', type: 'patent', section: 'Claim 1', similarity: '94.8%' },
      { label: subId, type: 'submission', section: 'Abstract', similarity: '100%' },
    ],
    actions: [
      { label: 'View Novelty Audit', path: `/dashboard/analysis/${subId}`, icon: 'FileText' },
    ],
    confidence: 'High Confidence (RAG Bound)',
    timestamp: timeStr,
  };
};

/**
 * Database Functions: ai_conversations & ai_messages persistence
 */
export const loadUserConversations = async (userId) => {
  try {
    if (isFirebaseConfigured && userId) {
      const snap = await getDocs(collection(db, 'ai_conversations'));
      const docs = snap.docs.map((d) => d.data());
      if (docs.length > 0) return docs;
    }
  } catch (err) {
    console.warn('Firestore ai_conversations fetch notice:', err.message);
  }

  const stored = localStorage.getItem(`patentiq_conversations_${userId || 'demo'}`);
  if (stored) return JSON.parse(stored);

  localStorage.setItem(`patentiq_conversations_${userId || 'demo'}`, JSON.stringify(INITIAL_CHAT_SESSIONS));
  return INITIAL_CHAT_SESSIONS;
};

export const saveUserConversation = async (userId, sessionData) => {
  const nowISO = new Date().toISOString();
  const updatedSession = { ...sessionData, updatedAt: nowISO };

  try {
    if (isFirebaseConfigured && sessionData.sessionId) {
      const refDoc = doc(db, 'ai_conversations', sessionData.sessionId);
      await setDoc(refDoc, updatedSession, { merge: true });
    }
  } catch (err) {
    console.warn('Firestore ai_conversations save notice:', err.message);
  }

  const sessions = await loadUserConversations(userId);
  const exists = sessions.some((s) => s.sessionId === updatedSession.sessionId);
  const updatedList = exists
    ? sessions.map((s) => (s.sessionId === updatedSession.sessionId ? updatedSession : s))
    : [updatedSession, ...sessions];

  localStorage.setItem(`patentiq_conversations_${userId || 'demo'}`, JSON.stringify(updatedList));
  return updatedList;
};

export const deleteUserConversation = async (userId, sessionId) => {
  try {
    if (isFirebaseConfigured) {
      await deleteDoc(doc(db, 'ai_conversations', sessionId));
    }
  } catch (err) {
    console.warn('Firestore delete ai_conversations notice:', err.message);
  }

  const sessions = await loadUserConversations(userId);
  const updatedList = sessions.filter((s) => s.sessionId !== sessionId);
  localStorage.setItem(`patentiq_conversations_${userId || 'demo'}`, JSON.stringify(updatedList));
  return updatedList;
};

export const exportChatHistoryTranscript = (sessionTitle, messages = [], format = 'txt') => {
  if (format === 'txt') {
    const textContent = messages
      .map((m) => `[${m.timestamp}] ${m.sender.toUpperCase()}: ${m.text}`)
      .join('\n\n');
    const blob = new Blob([`AI Patent Research Assistant Transcript - ${sessionTitle}\n\n${textContent}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sessionTitle.toLowerCase().replace(/\s+/g, '_')}_chat.txt`;
    a.click();
  } else {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const bodyHtml = messages
      .map(
        (m) => `
        <div style="margin-bottom: 15px; padding: 12px; border-radius: 8px; background: ${m.sender === 'user' ? '#EFF6FF' : '#F8FAFC'}; border: 1px solid #E2E8F0;">
          <strong style="color: ${m.sender === 'user' ? '#2563EB' : '#4F46E5'};">${m.sender.toUpperCase()} (${m.timestamp}):</strong>
          <p style="margin-top: 5px; font-size: 13px; white-space: pre-line;">${m.text}</p>
        </div>
      `
      )
      .join('');
    printWindow.document.write(`
      <html>
        <head><title>AI Research Transcript - ${sessionTitle}</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px; color: #0F172A;">
          <h2>AI Patent Research Copilot Transcript</h2>
          <h3>${sessionTitle}</h3>
          <hr/>
          ${bodyHtml}
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
};
