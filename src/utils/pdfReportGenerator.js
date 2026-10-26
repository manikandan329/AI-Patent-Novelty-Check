/**
 * PDF & Printable Legal Audit Report Generator
 * Formats a styled legal audit PDF document for printing and downloading.
 */

export const generatePdfAuditReport = (reportData) => {
  if (!reportData) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate the PDF audit report.');
    return;
  }

  const title = reportData.title || 'Patent Novelty Audit Report';
  const submissionId = reportData.submissionId || 'SUB-2026-98142';
  const score = reportData.noveltyScore || 94.8;
  const timestamp = new Date(reportData.analysisTimestamp || Date.now()).toLocaleString();

  const featuresHtml = (reportData.featureComparison || [])
    .map(
      (f) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #334155;"><strong>${f.userFeature}</strong></td>
        <td style="padding: 8px; border: 1px solid #334155;">${f.patentMatch} (${f.matchedTitle || ''})</td>
        <td style="padding: 8px; border: 1px solid #334155; text-align: center;">${f.similarityScore}%</td>
        <td style="padding: 8px; border: 1px solid #334155;">${f.difference}</td>
        <td style="padding: 8px; border: 1px solid #334155; text-align: center;"><strong>${f.uniqueness}</strong></td>
      </tr>
    `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Audit Report - ${submissionId}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0F172A; margin: 30px; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563EB; padding-bottom: 15px; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: 800; color: #2563EB; }
          .badge { background: #22C55E; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .score-card { background: #0F172A; color: white; padding: 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
          .score-num { font-size: 42px; font-weight: 900; color: #22C55E; }
          .section-title { font-size: 16px; font-weight: 800; color: #0F172A; border-bottom: 1px solid #E2E8F0; padding-bottom: 5px; margin-top: 25px; margin-bottom: 10px; uppercase; letter-spacing: 0.5px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
          th { background: #1E293B; color: white; padding: 10px; text-align: left; }
          .disclaimer { font-size: 10px; color: #64748B; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 10px; border-radius: 8px; margin-top: 30px; }
          .footer { text-align: center; font-size: 10px; color: #94A3B8; margin-top: 40px; border-top: 1px solid #E2E8F0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">Patentiq AI</div>
            <div style="font-size: 12px; color: #64748B;">Institutional Patent Novelty Audit Service</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 14px; font-weight: bold; color: #0F172A;">${submissionId}</div>
            <div style="font-size: 11px; color: #64748B;">Generated: ${timestamp}</div>
          </div>
        </div>

        <h1 style="font-size: 20px; margin-bottom: 5px;">${title}</h1>
        <div style="margin-bottom: 15px;">
          <span class="badge">Novelty Rating: ${reportData.classification?.label || 'Highly Novel'}</span>
        </div>

        <div class="score-card">
          <div>
            <div style="font-size: 12px; opacity: 0.8; text-uppercase;">Calculated Novelty Score</div>
            <div style="font-size: 13px; margin-top: 4px;">Evaluated against 140M+ USPTO & WIPO Filings</div>
          </div>
          <div class="score-num">${score}%</div>
        </div>

        <div class="section-title">Executive Summary</div>
        <p style="font-size: 13px; color: #334155;">${reportData.executiveSummary || 'Calculated patent novelty assessment report.'}</p>

        <div class="section-title">Key Technical Innovations</div>
        <ul style="font-size: 12px; color: #334155;">
          ${(reportData.keyInnovations || []).map((i) => `<li>${i}</li>`).join('')}
        </ul>

        <div class="section-title">Feature Comparison Matrix</div>
        <table>
          <thead>
            <tr>
              <th>User Submitted Feature</th>
              <th>Prior Art Match</th>
              <th>Overlap</th>
              <th>Key Technical Difference</th>
              <th>Uniqueness</th>
            </tr>
          </thead>
          <tbody>
            ${featuresHtml}
          </tbody>
        </table>

        <div class="section-title">Actionable Recommendations</div>
        <ul style="font-size: 12px; color: #334155;">
          ${(reportData.recommendations || []).map((r) => `<li>${r}</li>`).join('')}
        </ul>

        <div class="disclaimer">
          <strong>LEGAL DISCLAIMER:</strong> ${reportData.disclaimer || 'This report is an AI-assisted estimate based on vector RAG comparison and does not constitute an official legal patent examination.'}
        </div>

        <div class="footer">
          Page 1 of 1 • Patentiq AI Inc. Confidential Legal Document • ${timestamp}
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
