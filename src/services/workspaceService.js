import { doc, setDoc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';

import { getNoveltyAnalysisHistory, deleteNoveltyAnalysis } from './aiPatentNoveltyService';
import { getClaimComparisonHistory, deleteClaimComparison } from './aiClaimComparisonService';
import { getSavedReports, deleteReport } from './aiReportGeneratorService';
import { getSavedPatents as getBookmarkedPatents, getSearchHistory, deleteSavedPatent as removeBookmarkPatent } from './patentResearchService';

/**
 * MODULE 19: PATENT PORTFOLIO & WORKSPACE SERVICE
 * Consolidates saved patents, bookmarked prior art, novelty history,
 * claim comparisons, reports, and search history.
 */

export function getDemoWorkspaceData() {
  return {
    savedPatents: [
      {
        id: "pat-demo-01",
        title: "AI-Powered Adaptive Energy Management System for Autonomous Smart Microgrids",
        description: "Closed-loop microgrid load dispatch utilizing optical telemetry and reinforcement learning algorithms.",
        savedDate: "2026-09-06",
        claimsCount: 3,
        status: "Analyzed",
        noveltyScore: 78,
        claims: "Claim 1: A microgrid control system comprising optical sensors, central AI processor, and wireless mesh transceiver."
      },
      {
        id: "pat-demo-02",
        title: "Multi-Modal Quantum Sensor Fusion Architecture for Autonomous Vehicles",
        description: "Fault-tolerant sensor fusion pipeline combining LiDAR, radar, and quantum optical magnetometers.",
        savedDate: "2026-09-02",
        claimsCount: 5,
        status: "In Progress",
        noveltyScore: 84,
        claims: "Claim 1: A quantum optical sensor array coupled to a multi-gate state estimator."
      }
    ],
    bookmarkedPriorArt: [
      {
        id: "bm-01",
        patentId: "US11284910B2",
        title: "Smart Microgrid Energy Controller & Grid Telemetry",
        assignee: "Siemens Energy AG",
        pubDate: "2021-04-15",
        relevance: "High",
        similarity: "74%",
        bookmarkedDate: "2026-09-06"
      },
      {
        id: "bm-02",
        patentId: "US10892641B1",
        title: "Autonomous Load Dispatch System for Renewable Microgrids",
        assignee: "Tesla Grid Solutions",
        pubDate: "2020-11-03",
        relevance: "High",
        similarity: "68%",
        bookmarkedDate: "2026-09-05"
      },
      {
        id: "bm-03",
        patentId: "EP3492019A1",
        title: "Distributed Edge Computing Protocol for Decentralized Power Networks",
        assignee: "Schneider Electric SE",
        pubDate: "2022-06-23",
        relevance: "Medium",
        similarity: "45%",
        bookmarkedDate: "2026-09-03"
      }
    ],
    noveltyAnalyses: [
      {
        id: "nov-demo-101",
        title: "AI-Powered Adaptive Energy Management System",
        analysisDate: "2026-09-06",
        noveltyScore: 78,
        noveltyStatus: "Moderate Novelty",
        matchesCount: 3
      },
      {
        id: "nov-demo-102",
        title: "Quantum Sensor Fusion Network",
        analysisDate: "2026-09-02",
        noveltyScore: 84,
        noveltyStatus: "High Novelty",
        matchesCount: 2
      }
    ],
    claimComparisons: [
      {
        id: "comp-demo-101",
        title: "Smart Microgrid Controller vs US11284910B2 & US10892641B1",
        claimsAnalyzedCount: 3,
        priorArtCount: 2,
        matchCount: 2,
        partialCount: 1,
        notFoundCount: 1,
        comparisonDate: "2026-09-06"
      }
    ],
    generatedReports: [
      {
        id: "rep-demo-101",
        title: "AI Patent Novelty & Technical Prior-Art Analysis Report",
        patentTitle: "AI-Powered Adaptive Energy Management System for Autonomous Smart Microgrids",
        analysisDate: "2026-09-07",
        noveltyScore: 78,
        status: "Moderate Novelty"
      }
    ],
    searches: [
      {
        id: "srch-01",
        query: "reinforcement learning microgrid load balancing",
        searchDate: "2026-09-06",
        resultsCount: 8
      },
      {
        id: "srch-02",
        query: "optical power sensor mesh network topology",
        searchDate: "2026-09-04",
        resultsCount: 12
      },
      {
        id: "srch-03",
        query: "blockchain P2P energy settlement ledger",
        searchDate: "2026-09-01",
        resultsCount: 5
      }
    ]
  };
}

/**
 * Fetches all consolidated workspace data across modules.
 */
export async function getWorkspaceData(isDemoMode = false) {
  try {
    const demoData = getDemoWorkspaceData();

    // 1. Saved Patents
    let savedPatents = JSON.parse(localStorage.getItem('patentiq_saved_patents') || '[]');
    if (savedPatents.length === 0 && isDemoMode) savedPatents = demoData.savedPatents;

    // 2. Bookmarked Prior Art
    let bookmarkedPriorArt = getBookmarkedPatents();
    if (bookmarkedPriorArt.length === 0 && isDemoMode) bookmarkedPriorArt = demoData.bookmarkedPriorArt;

    // 3. Novelty Analyses
    let noveltyAnalyses = await getNoveltyAnalysisHistory();
    if (noveltyAnalyses.length === 0 && isDemoMode) noveltyAnalyses = demoData.noveltyAnalyses;

    // 4. Claim Comparisons
    let claimComparisons = await getClaimComparisonHistory();
    if (claimComparisons.length === 0 && isDemoMode) claimComparisons = demoData.claimComparisons;

    // 5. Reports
    let generatedReports = await getSavedReports();
    if (generatedReports.length === 0 && isDemoMode) generatedReports = demoData.generatedReports;

    // 6. Search History
    let searches = getSearchHistory();
    if (searches.length === 0 && isDemoMode) searches = demoData.searches;

    return {
      savedPatents,
      bookmarkedPriorArt,
      noveltyAnalyses,
      claimComparisons,
      generatedReports,
      searches
    };
  } catch (err) {
    console.error("Error fetching workspace data:", err);
    return getDemoWorkspaceData();
  }
}

/**
 * Saves a new patent to the user's workspace portfolio.
 */
export async function savePatentToWorkspace(patent) {
  const existing = JSON.parse(localStorage.getItem('patentiq_saved_patents') || '[]');
  const newPatent = {
    id: patent.id || "pat-" + Date.now(),
    title: patent.title || "Untitled Invention",
    description: patent.description || patent.abstract || "No description provided.",
    savedDate: new Date().toISOString().split('T')[0],
    claimsCount: patent.claimsCount || 1,
    status: patent.status || "Draft",
    noveltyScore: patent.noveltyScore ?? null,
    claims: patent.claims || ""
  };

  const updated = [newPatent, ...existing.filter(p => p.id !== newPatent.id)];
  localStorage.setItem('patentiq_saved_patents', JSON.stringify(updated));

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, "user_saved_patents", newPatent.id), newPatent);
    } catch (e) {
      console.warn("Firestore save patent error:", e);
    }
  }
  return updated;
}

/**
 * Deletes a workspace item by type and ID.
 */
export async function deleteWorkspaceItem(type, id) {
  if (type === 'savedPatents') {
    const existing = JSON.parse(localStorage.getItem('patentiq_saved_patents') || '[]');
    const updated = existing.filter(p => p.id !== id);
    localStorage.setItem('patentiq_saved_patents', JSON.stringify(updated));
    if (isFirebaseConfigured() && db) {
      try { await deleteDoc(doc(db, "user_saved_patents", id)); } catch(e){}
    }
  } else if (type === 'bookmarkedPriorArt') {
    removeBookmarkPatent(id);
  } else if (type === 'noveltyAnalyses') {
    await deleteNoveltyAnalysis(id);
  } else if (type === 'claimComparisons') {
    await deleteClaimComparison(id);
  } else if (type === 'generatedReports') {
    await deleteReport(id);
  } else if (type === 'searches') {
    deleteSearchQuery(id);
  }
}

export function deleteSearchQuery(id) {
  const history = getSearchHistory();
  const updated = history.filter(s => s.id !== id);
  localStorage.setItem('patentiq_search_history', JSON.stringify(updated));
  return updated;
}
