/**
 * Flourish Management — Institutional Diligence Tear-Sheets Data
 * Single source of truth for web display, API endpoints, and email delivery.
 */

const DILIGENCE_SHEETS = [
  {
    id: 'multifamily-matrix',
    docId: 'FM-RE-TEARSHEET-01',
    badge: 'FM-RE-01',
    category: 'real-estate',
    categoryLabel: 'Residential & Commercial Real Estate',
    title: 'The 15-Minute Real Estate Acquisition Screening Matrix',
    shortTitle: 'Real Estate Acquisition Matrix',
    subtitle: 'Rapid Institutional Hurdle Filter for Residential & Commercial Real Estate Underwriting',
    summary: 'The 15-minute quantitative screening filter we use to stress-test real estate cash flow, verify 50% OpEx baselines, and walk away from unviable debt structures.',
    flourishAdoption: 'Flourish unconditionally runs every underwriting model at 50% operating expenses with confirmed third-party insurance quotes, walking away whenever in-place yields drop below our 6.5% baseline.',
    format: 'Institutional 1-Page Brief &middot; Printable PDF',
    url: '/sheets/multifamily-matrix.html',
    highlights: [
      '50% Operating Expense Rule (eliminates broker pro-forma bias)',
      'Sub-replacement cost hurdle (≤ 75% of reproduction basis)',
      'Minimum 9.5% unlevered debt yield & 1.35x fixed DSCR',
      'Physical infrastructure audit & zero floating-rate bridge debt'
    ],
    rules: [
      {
        num: 1,
        title: 'The 50% Operating Expense Ratio Rule',
        desc: 'Always deduct 50% of gross scheduled rent for operating costs before debt service. If net cash flow cannot cover debt service by at least 1.35x, walk away.'
      },
      {
        num: 2,
        title: 'Sub-Replacement Cost Hurdle (≤ 75% Basis)',
        desc: 'Acquisition basis per unit or square foot must be at least 25% below reproduction cost. Building new facilities takes years; buying below replacement cost protects capital.'
      },
      {
        num: 3,
        title: '9.5% Unlevered Debt Yield & Fixed Debt Only',
        desc: 'Net operating income divided by loan amount must exceed 9.5% on day-one in-place numbers. We never accept floating-rate bridge loans.'
      },
      {
        num: 4,
        title: 'Physical Infrastructure & Power Grid Audit',
        desc: 'Mandatory camera scopes of main sewer lines, roof membrane inspections, and verification of regional electric substation transformer capacity.'
      }
    ],
    redFlagTrigger: 'Broker expense ratio < 48%, floating-rate bridge debt, or deferred utility maintenance.'
  },
  {
    id: 'seed-safe-audit',
    docId: 'FM-VC-TEARSHEET-02',
    badge: 'FM-VC-02',
    category: 'venture-capital',
    categoryLabel: 'Early-Stage Venture Capital',
    title: 'The Seed Angel SAFE & Cap Table Dilution Audit',
    shortTitle: 'Seed Dilution & SAFE Audit',
    subtitle: 'Seed Capital Defense Architecture: Dilution Math, Protective Covenants & Velocity Scoring',
    summary: 'Our cap table stress test to protect founder equity, prevent dilution traps, and evaluate team execution speed before wiring seed checks.',
    flourishAdoption: 'Flourish rejects superficial API wrappers, backing seed founders building vertical systems with proprietary enterprise data integration and defensible switching costs.',
    format: 'Institutional 1-Page Brief &middot; Printable PDF',
    url: '/sheets/seed-safe-audit.html',
    highlights: [
      'Dual-Track Engine: Programmatic capital velocity vs active co-development',
      'Post-money SAFE stack ceiling (< 20% aggregate seed dilution)',
      '72-hour founder execution & diligence velocity filter',
      'Contractual pro-rata & anti-dilution defense'
    ],
    rules: [
      {
        num: 1,
        title: 'Post-Money SAFE Ceiling (< 20% Aggregate Dilution)',
        desc: 'Unpriced SAFE notes prior to Series A must never exceed 20% aggregate dilution on the fully diluted cap table, preserving founder motivation.'
      },
      {
        num: 2,
        title: '72-Hour Founder Execution Velocity Test',
        desc: 'Measure responsiveness on unvarnished churn metrics, customer acquisition costs, and hiring roadmaps over a single weekend.'
      },
      {
        num: 3,
        title: 'Contractual Pro-Rata & MFN Side Letter Defense',
        desc: 'Always secure contractual pro-rata rights and Most Favored Nation (MFN) provisions to prevent Series A institutional dilution traps.'
      },
      {
        num: 4,
        title: 'Proprietary Vertical Data Moats',
        desc: 'Reject surface-level API wrappers. Back founders whose software captures private vertical operational data that foundation models cannot scrape.'
      }
    ],
    redFlagTrigger: 'Total unpriced SAFEs > $2.5M, unallocated option pool trap, or hesitation on raw churn data.'
  },
  {
    id: 'delta-hedging-matrix',
    docId: 'FM-MM-TEARSHEET-03',
    badge: 'FM-MM-03',
    category: 'capital-markets',
    categoryLabel: 'Quantitative Options & Hedging',
    title: 'The Quantitative Delta-Hedging & Volatility Parameter Matrix',
    shortTitle: 'Delta-Hedging Parameter Sheet',
    subtitle: 'Systematic 0.18 Delta Overlay Calibration, Asymmetric Put Budgets & VIX Regimes',
    summary: 'Our mathematical trading rulebook for systematic covered call writing, volatility monetization, and pre-funded crash put insurance.',
    flourishAdoption: 'Flourish systematically writes 0.18 delta calls into heightened tech implied volatility, sweeping cash into short Treasuries while pre-funding deep crash puts with 20% of harvested premium.',
    format: 'Institutional 1-Page Brief &middot; Printable PDF',
    url: '/sheets/delta-hedging-matrix.html',
    highlights: [
      '0.18 Delta systematic call overlay (30–45 DTE, 82% statistical win rate)',
      'Three-tier VIX regime playbook (VIX <15, 15–28, >28)',
      'Pre-funded crash put insurance (+500% to +1,000% payouts)',
      '100% US Treasury cash collateral sweep'
    ],
    rules: [
      {
        num: 1,
        title: 'Systematic 0.18 Delta Call Overlay',
        desc: 'Sell 30–45 day out-of-the-money calls at 0.18 delta against core equity allocations, harvesting 10% to 14% annualized cash yield without directional speculation.'
      },
      {
        num: 2,
        title: '20% Pre-Funded Crash Put Budget',
        desc: 'Reinvest 20% of collected call premiums into deep out-of-the-money disaster puts, pre-funding crash protection that surges during liquidity shocks.'
      },
      {
        num: 3,
        title: 'Three-Tier Volatility Regime Playbook',
        desc: 'VIX < 15: Tight spreads, conservative sizing. VIX 15–28: Standard 0.18 delta harvesting. VIX > 28: Monetize put gains and widen strike buffers.'
      },
      {
        num: 4,
        title: '100% Cash-Secured Collateral in Treasuries',
        desc: 'Zero naked options. Zero margin borrowing. All cash collateral sweeps into 4-week US Treasury bills earning risk-free daily interest.'
      }
    ],
    redFlagTrigger: 'Naked options writing, holding unhedged delta into IV spikes, or using margin debt.'
  }
];

function getSheetById(sheetId) {
  if (!sheetId) return null;
  return DILIGENCE_SHEETS.find(s => s.id === sheetId || s.docId === sheetId || s.badge === sheetId) || null;
}

module.exports = {
  DILIGENCE_SHEETS,
  getSheetById
};
