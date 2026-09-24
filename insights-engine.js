/**
 * Flourish Insights Thought Leadership & Automated Publishing Engine
 * 
 * Features:
 * - 2 monthly prescriptive letters (1st: Macro Strategy / Options, 15th: Real Estate / Physical Assets)
 * - Strict Voice & Editing Rules: Ruthless pruning, short sentences (<15 words avg), plain English, no AI fluff
 * - 4-5 min reads with concrete, actionable checklists and underwriting rulebooks
 * - Sliding 6-month recent window (UI displays articles published within past 6 months)
 * - Automatic archiving of articles older than 6 months with organized Archive retrieval
 * - Automated scheduler that evaluates publish dates and automatically releases new monthly letters
 * - Interactive Like & Comment system with sanitized inputs and disk/in-memory persistence
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'articles-data.json');

// Base library of letters spanning historical archives, recent 6-month window, and future scheduled releases
const INITIAL_ARTICLES = [
  // ==========================================
  // SEPTEMBER 2026 (CURRENT - RECENT)
  // ==========================================
  {
    id: 'rate-cycles',
    title: 'Hedging Interest Rate Cycles via Options Overlays',
    category: 'Macro Strategy',
    topic: 'options',
    publishDate: '2026-09-01T08:00:00Z',
    displayDate: 'Sep 2026',
    readTime: '5 Min Read',
    summary: 'How we use active option overlays to turn interest rate spikes and market volatility into steady, reliable downside protection.',
    likes: 47,
    comments: [
      {
        id: 'c-sep-1',
        author: 'Marcus Sterling',
        affiliation: 'Private Family Office',
        text: 'The 4-step checklist on covered calls cleared up questions our team had about delta targets. Simple and practical.',
        date: 'Sep 3, 2026'
      },
      {
        id: 'c-sep-2',
        author: 'Elena Rostova',
        affiliation: 'Institutional Allocator',
        text: 'Reinvesting call premiums directly into protective puts makes total sense. Completely self-funding insurance.',
        date: 'Sep 7, 2026'
      }
    ],
    body: `
      <p>When interest rates go wild, most standard portfolios suffer. The typical 60/40 mix breaks down because both stocks and bonds often fall at the same time. If you own bonds thinking they will protect you when stocks crash, you are in for a shock. We don't wait for things to fix themselves. Instead, we use option overlays to build an active, real-time shock absorber.</p>
      
      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Turning Market Swings Into Cash</h3>
      <p>As interest rates jump up and down, equity option prices expand. Volatility makes options more expensive. We don't buy those expensive options; we sell them. By writing out-of-the-money options, we collect cash premiums directly from the market's fear. This cash acts as an immediate defensive buffer, lowering our net cost basis on high-quality stocks. If the market goes sideways or down, that collected premium cushions the blow. If the market rises, we still capture steady returns up to our strike price.</p>
      
      <blockquote style="border-left: 4px solid #829A7E; padding-left: 1rem; margin: 1.5rem 0; font-style: italic; color: #4A5560;">"Instead of trying to guess which way the market goes next, we get paid for the uncertainty itself."</blockquote>
      
      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Simple, Cheap Insurance for Crash Scenarios</h3>
      <p>But collecting premium is only half the battle. If a true panic hits, selling calls won't save you from a major drop. To protect against rare but brutal market collapses, we reinvest a small slice of our generated option premium into out-of-the-money puts. These act like cheap insurance policies. If the market collapses by 20% or 30%, these puts pay off exponentially. They don't just protect our capital; they give us massive, fresh liquidity right when assets are on sale. This lets us buy great companies at deep discounts during the absolute bottom of the cycle.</p>
      
      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Actionable Checklist: How to Try This in Your Portfolio</h3>
      <p>You don't need a multi-billion dollar fund to start using these defensive principles. Here is a practical, step-by-step checklist you can bring to your wealth advisor or implement yourself:</p>
      
      <ol style="list-style-type: decimal; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1.5rem;">
        <li style="margin-bottom: 0.75rem;"><strong>Audit Your Downside Correlation:</strong> Ask your wealth manager a direct question: "If rates spike 100 basis points in a month, how will our stocks and bonds react?" If they both drop together, your portfolio lacks true diversification.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Set Up a Covered Call Overlay:</strong> If you own core index funds (like an S&P 500 ETF), you can write covered calls against them. A solid rule of thumb is to target options with 30 to 45 days to expiration, with a strike price set 5% to 10% above the current market price (specifically looking for a "delta" of 0.15 to 0.20). This lets you collect steady yield without choking off major upside growth.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Buy Cheap Crash Protection:</strong> Reinvest 15% to 20% of the cash you collect from selling calls into protective put options. Buy puts that are 15% out-of-the-money with 6 months to expiration. Treat this cost as an expense, exactly like home or car insurance. You hope you never use it, but it lets you sleep at night.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Automate the Reinvestment Rule:</strong> Never try to time the market manually. Set a strict rule: call premium cash automatically funds your put insurance. This creates a self-funding, closed-loop hedge that protects you 365 days a year.</li>
      </ol>
    `
  },
  {
    id: 'physical-assets',
    title: 'The Resiliency of Physical Assets in Volatile Economies',
    category: 'Real Estate',
    topic: 'real-estate',
    publishDate: '2026-09-15T08:00:00Z',
    displayDate: 'Sep 2026',
    readTime: '5 Min Read',
    summary: 'Why sourcing high-quality multifamily properties entirely off-market yields stable, predictable rents that do not care about daily stock market drama.',
    likes: 39,
    comments: [
      {
        id: 'c-sep-3',
        author: 'David Chen',
        affiliation: 'Real Estate Syndicate Lead',
        text: 'The 50% operating expense rule has saved us from bad deals multiple times. Brokers hate it, but it works.',
        date: 'Sep 17, 2026'
      }
    ],
    body: `
      <p>Liquid paper assets are easy to buy and sell, but they also swing wildly on daily public sentiment. Watching your net worth move by 3% every single day takes a psychological toll. If you want stable, predictable income that beats inflation, physical property remains hard to beat. But you cannot buy real estate like a retail tourist. The key is how you source, analyze, and stress-test your acquisitions.</p>
      
      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Sourcing Off-Market: The Power of Relationships</h3>
      <p>We avoid retail bidding wars. When a commercial property is publicly listed on databases like LoopNet, dozens of buyers bid up the price, destroying the potential yield. Instead, we use our personal networks to find tired landlords and estate exits before they ever hit the open market. This relationship-driven sourcing allows us to purchase institutional-grade multifamily properties at highly attractive valuations. This initial discount provides our investors with an immediate cushion of equity from day one.</p>
      
      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Two Ways Your Capital Compounds</h3>
      <p>Physical properties work hard for you in two main ways:</p>
      <ul style="list-style-type: disc; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1rem;">
        <li style="margin-bottom: 0.5rem;"><strong>Stable Cash Flow:</strong> Monthly rents provide steady, reliable payouts. People always need a place to live, regardless of whether the stock market is up or down. This isolates your monthly income from broader stock market drama.</li>
        <li style="margin-bottom: 0.5rem;"><strong>Built-In Inflation Indexing:</strong> When building costs and material prices rise, the replacement cost of properties goes up. This naturally lifts the intrinsic value of existing properties, acting as a real-time inflation hedge.</li>
      </ul>
      
      <blockquote style="border-left: 4px solid #829A7E; padding-left: 1rem; margin: 1.5rem 0; font-style: italic; color: #4A5560;">"By combining off-market sourcing with stable monthly rents, physical real estate acts as a reliable wealth compounding anchor through any economic cycle."</blockquote>
      
      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Actionable Checklist: Your Real Estate Underwriting Rulebook</h3>
      <p>Whether you are buying a small rental house or a major apartment complex, here is a highly prescriptive framework you can use to analyze deals like an institutional investor:</p>
      
      <ol style="list-style-type: decimal; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1.5rem;">
        <li style="margin-bottom: 0.75rem;"><strong>Apply the 50% Operating Expense Rule:</strong> Before you trust any broker's spreadsheet, run this quick test. Assume that operating expenses (property taxes, insurance, maintenance, property management, and vacancy reserves) will consume exactly 50% of your gross rental income. If the remaining 50% cannot easily cover your mortgage payment and leave you with positive cash flow, walk away immediately.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Sponsor Direct Local Outreach:</strong> Don't browse public listings. Call local commercial property managers. Ask them: "Do you manage any properties where the owner is tired of dealing with tenants and wants a clean, private, off-market sale?" Property managers know who wants out long before anyone else.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Verify the Demographics:</strong> Only buy in sub-markets with documented, positive population and job growth. Crucially, make sure no single employer accounts for more than 15% of the local workforce. If a single factory shuts down and destroys the town's economy, your property's occupancy will collapse.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Stress-Test Your Occupancy Limits:</strong> Never assume 100% occupancy. Run your math at an 85% occupancy rate with a fixed-rate mortgage. If the property can still cover its debt obligations during a recession where 15% of your units are empty, your investment is safe.</li>
      </ol>
    `
  },

  // ==========================================
  // AUGUST 2026 (RECENT)
  // ==========================================
  {
    id: 'volatility-harvesting',
    title: 'Harvesting Volatility: The Mechanics of Asymmetric Overlays',
    category: 'Macro Strategy',
    topic: 'options',
    publishDate: '2026-08-01T08:00:00Z',
    displayDate: 'Aug 2026',
    readTime: '5 Min Read',
    summary: 'How to structure cash-secured option collars so market drops trigger cash payments rather than panic liquidations.',
    likes: 34,
    comments: [
      {
        id: 'c-aug-1',
        author: 'Robert Vance',
        affiliation: 'Angel Investor',
        text: 'The collar math explained here is crystal clear. Appreciate the rule on strike spreads.',
        date: 'Aug 5, 2026'
      }
    ],
    body: `
      <p>Most investors view volatility as the enemy. When stock swings get wider, anxiety spikes and people make emotional mistakes. But volatility is not a loss; it is an asset class you can price and sell. When markets churn sideways or drop, options premiums expand. If you structure your positions correctly, that expansion pays you hard cash.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">The Core Flaw in Buy-and-Hope</h3>
      <p>The standard investment strategy is simple: buy equities and hope they appreciate. But when a sharp correction hits, you have zero cash flow unless you sell shares at a discount. That is the worst possible time to liquidate. An asymmetric options overlay solves this dilemma. By pairing your long equity shares with structured collars, you define your downside floor while generating recurring yield.</p>

      <blockquote style="border-left: 4px solid #829A7E; padding-left: 1rem; margin: 1.5rem 0; font-style: italic; color: #4A5560;">"Do not fear volatility. Sell the panic to impatient traders and use the proceeds to insure your principal."</blockquote>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Building a Zero-Cost Collar</h3>
      <p>A zero-cost collar lets you lock in a floor without writing a check out of pocket. You sell an out-of-the-money call option above the market price. Then you take every cent of that premium and buy an out-of-the-money put option below the market price. The cash inflow cancels out the cash outflow. Your portfolio now has a guaranteed ceiling and a guaranteed floor. If the index crashes 25%, your losses stop at 7%.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Actionable Checklist: Structuring an Asymmetric Collar</h3>
      <ol style="list-style-type: decimal; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1.5rem;">
        <li style="margin-bottom: 0.75rem;"><strong>Pick Your Expiration Horizon:</strong> Use 60-day or 90-day option contracts. Shorter contracts experience faster time decay, while giving you flexibility to adjust strikes quarterly as macro conditions evolve.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Identify the Call Strike:</strong> Sell a call option 6% to 8% above the current index price. This leaves room for healthy quarterly capital appreciation while collecting adequate premium.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Select the Matching Put Floor:</strong> Use the exact premium gathered from the call to buy a put option roughly 6% to 8% below the current market price. Ensure net cost is zero or slightly credit-positive.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Execute the Roll Rule:</strong> If the market rises and tests your call strike, do not panic. Roll the contract out 60 days and up to a higher strike. Never take naked directional bets.</li>
      </ol>
    `
  },
  {
    id: 'expense-underwriting',
    title: 'The 50% Rule: Real Estate Underwriting for Unforgiving Markets',
    category: 'Real Estate',
    topic: 'real-estate',
    publishDate: '2026-08-15T08:00:00Z',
    displayDate: 'Aug 2026',
    readTime: '4 Min Read',
    summary: 'A ruthless, conservative underwriting framework to stress-test multifamily properties before submitting a purchase offer.',
    likes: 31,
    comments: [],
    body: `
      <p>Commercial real estate brokers are paid to sell optimism. Their offering memorandums always paint a perfect picture: zero vacancies, low repair costs, and rising rents forever. If you underwrite an acquisition using a broker's pro-forma spreadsheet, you are gambling with your wealth. You need a simple, unforgiving test that cuts through the noise.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Why Real Operating Expenses Always Run Higher</h3>
      <p>Rooftops leak. Water heaters burst at 2 AM on a holiday. Property insurance rates jump 20% after severe weather seasons. Cities reassess property values, causing tax bills to climb. New investors often model expenses at 30% of gross rents. In the real world, mature multifamily properties consistently consume 45% to 55% of gross collections in operational upkeep.</p>

      <blockquote style="border-left: 4px solid #829A7E; padding-left: 1rem; margin: 1.5rem 0; font-style: italic; color: #4A5560;">"Underwrite for the worst weather, not the sunniest weekend. If the property still prints cash during a storm, you have found a winner."</blockquote>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">The 2-Minute Back-of-the-Napkin Formula</h3>
      <p>Before spending thousands of dollars on third-party environmental reviews and inspections, apply our 50% hurdle. Take the total annualized gross scheduled rent. Cut it in half. That remaining 50% is your true Net Operating Income (NOI). Now subtract your annual mortgage payments (debt service). If the remaining net cash flow provides at least an 8% cash-on-cash yield on your invested equity, the deal warrants serious due diligence.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Actionable Checklist: Stress-Testing Any Multifamily Deal</h3>
      <ol style="list-style-type: decimal; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1.5rem;">
        <li style="margin-bottom: 0.75rem;"><strong>Request T-12 Actuals, Never Pro-Formas:</strong> Require the seller to provide the trailing 12 months (T-12) of bank statements and rent rolls. Ignore projections; inspect real cleared checks.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Model Taxes at Purchase Price:</strong> Counties reassess taxes upon purchase. Never use the previous owner's tax bill. Calculate local property tax rates against your proposed purchase price.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Budget 8% to 10% for Management:</strong> Even if you plan to oversee the asset yourself, always deduct professional third-party management fees. Your time is not free, and future buyers will price in management.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Fund a Day-One Capex Reserve:</strong> Set aside $3,500 per unit in liquid cash reserves at closing. Do not touch this capital for distributions. It guarantees you never face a capital call.</li>
      </ol>
    `
  },

  // ==========================================
  // JULY 2026 (RECENT)
  // ==========================================
  {
    id: 'tail-risk-insurance',
    title: 'Tail-Risk Insurance: Buying Protection When Nobody Wants It',
    category: 'Macro Strategy',
    topic: 'options',
    publishDate: '2026-07-01T08:00:00Z',
    displayDate: 'Jul 2026',
    readTime: '5 Min Read',
    summary: 'The systematic rules for purchasing out-of-the-money puts when volatility is low and protection is deeply discounted.',
    likes: 28,
    comments: [],
    body: `
      <p>The time to buy flood insurance is during a sunny drought, not when the river is cresting your front porch. In financial markets, investors do the exact opposite. When markets are calm and complacency reigns, crash insurance is dirt cheap, yet almost nobody buys it. When panic erupts, investors scramble to buy puts at exorbitant prices.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">The Mathematics of Volatility Pricing</h3>
      <p>Implied volatility measures the cost of market insurance. When the VIX drops below 14, far out-of-the-money puts trade at pennies on the dollar. A small 0.5% allocation of your portfolio can purchase substantial protection against a 20% to 30% shock. If the market grinds upward, that tiny premium expires worthless—an acceptable, predictable cost of doing business.</p>

      <blockquote style="border-left: 4px solid #829A7E; padding-left: 1rem; margin: 1.5rem 0; font-style: italic; color: #4A5560;">"Crash protection is not an investment you expect to profit from daily. It is the fire extinguisher that saves the building."</blockquote>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Asymmetric Payoffs in Liquidity Crises</h3>
      <p>When sudden black swan events hit, these deep out-of-the-money puts do not merely double. They can appreciate by 1,000% to 3,000%. That liquidity surge provides two vital advantages: it offsets paper losses in your core equity holdings, and it generates immediate dry powder when assets are trading at generational discounts.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Actionable Checklist: Constructing a Systematic Tail-Risk Hedge</h3>
      <ol style="list-style-type: decimal; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1.5rem;">
        <li style="margin-bottom: 0.75rem;"><strong>Cap the Insurance Budget:</strong> Never spend more than 1% to 1.5% of total portfolio value annually on crash protection. Treat this as a fixed, budgeted operational cost.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Select Long-Dated Horizons:</strong> Buy 6-month to 9-month put options. Avoid short-term weekly options, where theta decay erodes your capital too quickly.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Target 20% to 25% Out-of-the-Money Strikes:</strong> You are not hedging routine 3% pullbacks. You are hedging systemic crashes. Choose strikes that only trigger during severe dislocations.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Pre-Commit to a Monetization Threshold:</strong> If your puts surge by 500% during a panic, cash out 50% immediately to lock in gains and buy discounted equity shares.</li>
      </ol>
    `
  },
  {
    id: 'workforce-housing',
    title: 'Why Working-Class Multifamily Beats Luxury Condos in Every Downturn',
    category: 'Real Estate',
    topic: 'real-estate',
    publishDate: '2026-07-15T08:00:00Z',
    displayDate: 'Jul 2026',
    readTime: '4 Min Read',
    summary: 'The demographic fundamentals behind Class B and C workforce housing, and why it consistently outperforms Class A luxury assets during recessions.',
    likes: 42,
    comments: [
      {
        id: 'c-jul-1',
        author: 'Sarah Jenkins',
        affiliation: 'Private Equity Associate',
        text: 'The tenant retention statistics in this letter match what our Midwest portfolio saw during 2022. Spot on.',
        date: 'Jul 19, 2026'
      }
    ],
    body: `
      <p>When high-flying developers build real estate, they almost always build luxury apartments. Marble countertops, rooftop dog spas, and infinity pools sound glamorous in investor pitch decks. But when the economy slows down, luxury renters are the first to downsize. Workforce housing, on the other hand, fills a non-negotiable human need: clean, safe, affordable shelter for everyday wage earners.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">The Downward Migration Effect</h3>
      <p>During an economic contraction, households cut discretionary spending. Renters paying $3,200 per month for luxury units move into $1,600 Class B apartments. At the same time, existing workforce housing tenants stay put because there is nowhere cheaper to go. This dynamic creates a powerful "downward migration effect" that keeps Class B and C occupancy rates elevated even as luxury vacancies spike.</p>

      <blockquote style="border-left: 4px solid #829A7E; padding-left: 1rem; margin: 1.5rem 0; font-style: italic; color: #4A5560;">"Luxury amenities attract headlines. Affordable necessity protects cash distributions."</blockquote>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Lower Turnover, Lower Maintenance Friction</h3>
      <p>Unit turnover is the single biggest cash-flow killer in real estate. Painting walls, replacing carpets, and losing a month of rent destroys quarterly yields. Workforce housing tenants typically stay in place for three to five years, compared to twelve months in luxury towers. That stability compounds your bottom-line return.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Actionable Checklist: Underwriting Workforce Housing</h3>
      <ol style="list-style-type: decimal; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1.5rem;">
        <li style="margin-bottom: 0.75rem;"><strong>Calculate the Rent-to-Income Ratio:</strong> Ensure your target monthly rent represents no more than 28% to 30% of the median household income in that specific zip code.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Prioritize Functional Upgrades:</strong> Avoid luxury finishes. Upgrade to durable luxury vinyl tile (LVT) flooring and stainless steel hardware that withstands long-term wear.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Inspect Mechanical Infrastructure First:</strong> Check the roof age, electrical panels, and cast-iron plumbing. A property with great bones beats pretty cosmetic paint every day.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Build Relationships with Local Employers:</strong> Connect with nearby hospitals, distribution hubs, and school districts to build a preferred tenant pipeline.</li>
      </ol>
    `
  },

  // ==========================================
  // JUNE 2026 (RECENT)
  // ==========================================
  {
    id: 'covered-strangle-strategy',
    title: 'The Covered Strangle: Generating Cash While Defending Your Cost Basis',
    category: 'Macro Strategy',
    topic: 'options',
    publishDate: '2026-06-01T08:00:00Z',
    displayDate: 'Jun 2026',
    readTime: '5 Min Read',
    summary: 'A step-by-step masterclass on pairing covered calls with cash-secured puts to double cash yield during sideways consolidations.',
    likes: 26,
    comments: [],
    body: `
      <p>Most investors are familiar with covered calls. You own shares, sell an out-of-the-money call, and collect income. But what do you do when a stock enters a wide, choppy trading range? Enter the covered strangle: one of the most powerful cash-generating tools in quantitative options management.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">The Mechanics of Dual-Side Premium Capture</h3>
      <p>In a covered strangle, you hold 100 shares of a high-conviction company. You sell an out-of-the-money call above the market price, and simultaneously sell an out-of-the-money cash-secured put below the market price. You collect premium from both sides. If the stock trades inside that corridor over the next 45 days, both options expire worthless, leaving you with double the cash flow.</p>

      <blockquote style="border-left: 4px solid #829A7E; padding-left: 1rem; margin: 1.5rem 0; font-style: italic; color: #4A5560;">"A sideways market is dead money for buy-and-hold investors, but an absolute goldmine for systematic option writers."</blockquote>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">What Happens on a Downside Move?</h3>
      <p>If the stock drops below your put strike, you are assigned an additional 100 shares at a discount. Because you collected premium on both the call and the put, your effective purchase price is significantly lower than where the market was trading when you opened the trade. You acquire more shares of a company you already love at a bargain valuation.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Actionable Checklist: Executing a Covered Strangle</h3>
      <ol style="list-style-type: decimal; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1.5rem;">
        <li style="margin-bottom: 0.75rem;"><strong>Only Trade Assets You Want to Own for 5 Years:</strong> Never execute a cash-secured put on speculative meme stocks. Only use liquid mega-cap equities or broad index ETFs.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Set Call Strike at 0.20 Delta:</strong> Choose a strike approximately 5% to 8% above current market price with 30-45 days to expiration.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Set Put Strike at 0.15 Delta:</strong> Choose a put strike 8% to 10% below current price. Keep 100% cash backing in a high-yield treasury account to earn risk-free interest while waiting.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Close at 50% Profit:</strong> When the option pair reaches 50% of maximum profit, buy to close immediately and redeploy into fresh 45-day contracts.</li>
      </ol>
    `
  },
  {
    id: 'off-market-sourcing',
    title: 'Off-Market Sourcing: How to Acquire Properties Without Bidding Wars',
    category: 'Real Estate',
    topic: 'real-estate',
    publishDate: '2026-06-15T08:00:00Z',
    displayDate: 'Jun 2026',
    readTime: '4 Min Read',
    summary: 'The relationship architecture required to find off-market multifamily opportunities before they ever reach public listings.',
    likes: 38,
    comments: [
      {
        id: 'c-jun-1',
        author: 'Thomas Wright',
        affiliation: 'Commercial Real Estate Broker',
        text: 'Asking property managers who is tired of dealing with tenants is the oldest and best secret in the business.',
        date: 'Jun 21, 2026'
      }
    ],
    body: `
      <p>If you are waiting for a deal to pop up on public listing services, you are already too late. Commercial listings with high visibility attract institutional syndicators who are willing to accept razor-thin 4% capitalization rates. To capture genuine double-digit yields, you must operate in the private domain of off-market relationships.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">The Tired Landlord Opportunity</h3>
      <p>Across the United States, thousands of apartment buildings are owned by elderly individuals or family trusts that purchased them in the 1980s and 1990s. They have fully paid off their mortgages. They do not want to deal with late-night plumbing emergencies or tenant disputes. They value speed, privacy, and closing certainty far more than squeezing out the last 5% of sale price.</p>

      <blockquote style="border-left: 4px solid #829A7E; padding-left: 1rem; margin: 1.5rem 0; font-style: italic; color: #4A5560;">"Deals are not found on computer screens. They are negotiated across kitchen tables through trust and clear communication."</blockquote>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Offering What Bidding Wars Cannot</h3>
      <p>When you negotiate directly with an owner, you can structure creative win-win solutions. You can offer seller financing with an attractive interest rate, deferring their capital gains tax hit while securing below-market interest rates for your partnership. That flexibility is impossible in a rigid auction environment.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Actionable Checklist: Building Your Off-Market Deal Pipeline</h3>
      <ol style="list-style-type: decimal; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1.5rem;">
        <li style="margin-bottom: 0.75rem;"><strong>Pull Public Ownership Lists:</strong> Use county tax records to filter for properties owned for more than 15 years with out-of-state owner addresses.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Send Handwritten, Professional Letters:</strong> Send a short, personalized letter stating you are a local private buyer looking to hold the asset long-term. Avoid corporate jargon.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Partner with Local HVAC and Plumbing Contractors:</strong> Contractors know which property owners are reluctant to invest in repairs and are ready to sell.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Guarantee Quick Diligence:</strong> Offer a 21-day inspection period with proof of funds ready. Certainty of close is your biggest competitive advantage.</li>
      </ol>
    `
  },

  // ==========================================
  // MAY 2026 (RECENT)
  // ==========================================
  {
    id: 'replacing-fixed-income',
    title: 'When Bonds Fail: Replacing Fixed Income With Systematic Options Cash Flow',
    category: 'Macro Strategy',
    topic: 'options',
    publishDate: '2026-05-01T08:00:00Z',
    displayDate: 'May 2026',
    readTime: '5 Min Read',
    summary: 'Why traditional bond allocations suffer duration risk in inflationary cycles, and how systematic short-dated options replace coupon income.',
    likes: 29,
    comments: [],
    body: `
      <p>For four decades, the traditional 60/40 portfolio was the gold standard of wealth management. Bonds were supposed to generate reliable 4% yields while acting as a safe haven when equities tumbled. But the structural return of inflation shattered that assumption. When interest rates rise rapidly, long-duration bond prices plunge, dragging down total returns.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">The Silent Killer: Duration Risk</h3>
      <p>When you hold a 10-year Treasury bond yielding 3.5%, every 1% jump in interest rates wipes out approximately 8% to 9% of your bond's market value. You are locking in capital destruction in exchange for a meager coupon payment. High-net-worth investors cannot afford to leave 40% of their balance sheet exposed to duration decay.</p>

      <blockquote style="border-left: 4px solid #829A7E; padding-left: 1rem; margin: 1.5rem 0; font-style: italic; color: #4A5560;">"Yield without capital preservation is an illusion. Options overlays generate monthly cash flow with zero duration risk."</blockquote>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Synthesizing Bond Yields with Equity Collateral</h3>
      <p>Instead of locking capital in 10-year paper debt, we keep cash in ultra-short 30-day Treasury bills. On top of that cash, we write systematic out-of-the-money options contracts with 30-day maturities. This approach generates a dependable 6% to 9% annualized income stream, with zero sensitivity to long-term interest rate shifts.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Actionable Checklist: Replacing Bonds with Options Yield</h3>
      <ol style="list-style-type: decimal; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1.5rem;">
        <li style="margin-bottom: 0.75rem;"><strong>Calculate Your Portfolio Duration:</strong> Check the average duration of your bond funds. If it exceeds 4 years, you are carrying massive interest rate vulnerability.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Anchor in 4-Week T-Bills:</strong> Roll 4-week Treasury bills to capture current money-market rates with virtually zero price volatility.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Layer Cash-Secured Puts on Blue-Chip Stocks:</strong> Write 30-day cash-secured puts on dividend aristocrats at a 10% discount to current market prices.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Reinvest the Monthly Premium:</strong> Harvest the option premium monthly to fund investor distributions or compound into core equity holdings.</li>
      </ol>
    `
  },
  {
    id: 'debt-stress-testing',
    title: 'Debt Stress-Testing: Can Your Property Survive an 85% Occupancy Slump?',
    category: 'Real Estate',
    topic: 'real-estate',
    publishDate: '2026-05-15T08:00:00Z',
    displayDate: 'May 2026',
    readTime: '4 Min Read',
    summary: 'The exact debt coverage ratio stress test we apply to every real estate asset before finalizing mortgage financing.',
    likes: 33,
    comments: [],
    body: `
      <p>Real estate wealth is rarely destroyed by bad buildings. It is destroyed by bad debt. When times are good, syndicators take on floating-rate bridge loans with 80% leverage to maximize paper returns. When interest rates jump and tenant vacancies tick up, those over-leveraged properties trigger foreclosures. Debt is fire: properly controlled, it compounds wealth; mismanaged, it burns you to the ground.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">The Fallacy of Maximum Leverage</h3>
      <p>Banks will gladly lend you up to 75% or 80% of an apartment building's appraised value during market peaks. But just because a lender approves high leverage does not mean you should take it. We strictly cap portfolio leverage at 60% to 65% Loan-to-Value (LTV), backed exclusively by long-term fixed-rate debt.</p>

      <blockquote style="border-left: 4px solid #829A7E; padding-left: 1rem; margin: 1.5rem 0; font-style: italic; color: #4A5560;">"Over-leverage turns a temporary market correction into a permanent capital loss. Conservative leverage lets you wait out any cycle."</blockquote>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">The 85% Occupancy Hurdle</h3>
      <p>Before closing any acquisition, we run a mandatory recession simulation. We force occupancy down from 95% to 85%, slash rents by 5%, and hike operating expenses by 10%. If the property's Net Operating Income cannot still cover 100% of the mortgage payment under those distressed conditions, we walk away from the deal.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Actionable Checklist: Stress-Testing Real Estate Debt</h3>
      <ol style="list-style-type: decimal; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1.5rem;">
        <li style="margin-bottom: 0.75rem;"><strong>Refuse Floating-Rate Bridge Debt:</strong> Demand fixed-rate agency financing (Fannie Mae or Freddie Mac) with minimum 7-year to 10-year terms.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Target a 1.35x Debt Service Coverage Ratio (DSCR):</strong> Ensure normal net operating income covers debt payments by at least 1.35 times, leaving a deep safety cushion.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Test Your Breakeven Occupancy:</strong> Calculate exactly what percentage of units must be occupied to pay the mortgage and taxes. If that number exceeds 78%, the deal is too fragile.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Secure an Operating Reserve Line:</strong> Keep six months of full principal, interest, taxes, and insurance (PITI) in an escrow reserve account.</li>
      </ol>
    `
  },

  // ==========================================
  // APRIL 2026 (RECENT)
  // ==========================================
  {
    id: 'managing-drawdowns',
    title: 'Managing Drawdowns: The Math of Never Taking a Catastrophic Loss',
    category: 'Macro Strategy',
    topic: 'options',
    publishDate: '2026-04-01T08:00:00Z',
    displayDate: 'Apr 2026',
    readTime: '5 Min Read',
    summary: 'The brutal mathematics of compounding recoveries, and why preventing a 35% loss is three times more valuable than chasing a 20% gain.',
    likes: 45,
    comments: [
      {
        id: 'c-apr-1',
        author: 'Jonathan Cole',
        affiliation: 'Hedge Fund Principal',
        text: 'The table on required gains to break even should be on every allocator’s desk. Simple arithmetic that gets forgotten.',
        date: 'Apr 6, 2026'
      }
    ],
    body: `
      <p>Most investors focus entirely on upside returns. They celebrate a 15% gain and ignore downside vulnerability. But compounding is an unforgiving mathematical master. If you lose 50% of your portfolio, you do not need a 50% return to break even—you need a 100% return just to get back to where you started.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">The Asymmetric Recovery Trap</h3>
      <p>Consider the math: a 10% loss requires an 11% gain to recover. A 20% loss needs a 25% gain. A 35% loss demands a 54% return. And a 50% loss requires doubling your money. Once you enter deep drawdown territory, years of patient wealth building are completely erased. Avoiding big losses is mathematically far more important than picking winning stocks.</p>

      <blockquote style="border-left: 4px solid #829A7E; padding-left: 1rem; margin: 1.5rem 0; font-style: italic; color: #4A5560;">"Rule #1 of compounding: never interrupt it unnecessarily with a devastating loss."</blockquote>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">How Systematic Hedging Preserves Compounding</h3>
      <p>When you deploy options hedges that cap drawdowns at 6% to 8%, your portfolio never enters the recovery trap. While other investors spend three to four years clawing back losses after a recession, our capital is already compounding from higher ground. This is why defensive portfolios consistently beat aggressive unhedged portfolios over rolling 10-year cycles.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Actionable Checklist: Protecting Your Compounding Trajectory</h3>
      <ol style="list-style-type: decimal; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1.5rem;">
        <li style="margin-bottom: 0.75rem;"><strong>Establish Maximum Acceptable Drawdown:</strong> Define your absolute maximum drawdown tolerance (e.g., 10%). Build your hedging framework to honor that hard barrier.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Scale Out on Excessive Runups:</strong> When an equity holding runs up 40% in a quarter, do not get greedy. Sell out-of-the-money covered calls to monetize the euphoria.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Keep 15% Cash Collateral at All Times:</strong> Never be 100% invested with zero dry powder. Cash is the oxygen that lets you capitalize on distress.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Review Beta Weekly:</strong> Calculate your portfolio beta relative to the S&P 500. Keep net portfolio beta below 0.65 to ensure resilience during sudden selloffs.</li>
      </ol>
    `
  },
  {
    id: 'tenant-retention',
    title: 'Tenant Retention: The Unsung Weapon Against Inflationary Squeezes',
    category: 'Real Estate',
    topic: 'real-estate',
    publishDate: '2026-04-15T08:00:00Z',
    displayDate: 'Apr 2026',
    readTime: '4 Min Read',
    summary: 'Why prioritizing resident satisfaction and lease renewals produces higher cash-on-cash returns than aggressive annual rent increases.',
    likes: 36,
    comments: [],
    body: `
      <p>Novice real estate operators obsess over pushing rents to the absolute maximum. They raise rents by 12% every year, boast about high pro-forma numbers, and wonder why their properties show mediocre net returns. The secret to exceptional multifamily performance is not maximizing asking rent; it is minimizing tenant turnover.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">The True Cost of a Vacant Apartment</h3>
      <p>When an existing resident leaves, the financial penalty is severe. You lose at least 30 to 45 days of rent during marketing. You pay $1,800 to clean, paint, and re-carpet the unit. You pay a leasing commission to find a new tenant. By the time the unit is re-occupied, that turnover cost you $3,500 to $5,000—wiping out the entire benefit of the rent increase.</p>

      <blockquote style="border-left: 4px solid #829A7E; padding-left: 1rem; margin: 1.5rem 0; font-style: italic; color: #4A5560;">"A satisfied tenant who renews their lease for four years is five times more profitable than chasing top-of-market rents with annual vacancies."</blockquote>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">The 24-Hour Maintenance Rule</h3>
      <p>Residents do not move because the lobby paint is slightly dated. They move because their air conditioner broke in July and property management took four days to fix it. Delivering rapid, respectful maintenance builds fierce resident loyalty. That loyalty translates directly into 75%+ renewal rates and uninterrupted monthly distributions.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Actionable Checklist: Building a High-Retention Property</h3>
      <ol style="list-style-type: decimal; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1.5rem;">
        <li style="margin-bottom: 0.75rem;"><strong>Enforce a 24-Hour Work Order Guarantee:</strong> Guarantee all routine maintenance tickets are addressed within 24 hours. Track resolution metrics weekly.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Offer Moderate Renewal Incentives:</strong> When renewing reliable tenants, keep rent increases at a modest 3% to 4%, below market inflation. Give them a tangible reason to stay.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Reward Multi-Year Leases:</strong> Offer a free carpet cleaning or light fixture upgrade for residents who sign 24-month lease commitments.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Conduct Quarterly Community Walkthroughs:</strong> Walk your properties personally every quarter. Talk to residents. Catch small deferred maintenance items before they turn into major expenses.</li>
      </ol>
    `
  },

  // ==========================================
  // ARCHIVES (OLDER THAN 6 MONTHS: JAN - MAR 2026)
  // ==========================================
  {
    id: 'volatility-spikes-asset-class',
    title: 'Volatility Spikes as an Asset Class: Monetizing Market Panic',
    category: 'Macro Strategy',
    topic: 'options',
    publishDate: '2026-03-01T08:00:00Z',
    displayDate: 'Mar 2026',
    readTime: '5 Min Read',
    summary: 'How to systematically trade volatility expansion events by selling expensive premium at cyclical market peaks.',
    likes: 51,
    comments: [],
    body: `
      <p>When the VIX explodes above 30, mainstream financial news warns investors to stay away. For disciplined options practitioners, that panic represents the single best liquidity window of the year. Implied volatility always overestimates the actual real-world move of the underlying index. Over-hedging by scared retail funds creates massive pricing inefficiencies.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">The Volatility Mean-Reversion Law</h3>
      <p>Unlike stock prices, which can trend in one direction for years, implied volatility is strictly mean-reverting. Spikes in fear are sharp, violent, and short-lived. By selling elevated option premium at the apex of a panic, you capture inflated pricing that rapidly deflates over the subsequent 30 days as normality returns.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Actionable Checklist: Trading Elevated VIX Regimes</h3>
      <ol style="list-style-type: decimal; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1.5rem;">
        <li style="margin-bottom: 0.75rem;"><strong>Wait for VIX Above 28:</strong> Never rush in on the first 5% drop. Wait for genuine institutional panic to inflate option premiums.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Sell Out-of-the-Money Puts on Index Funds:</strong> Select strikes at least 12% to 15% below the current market price with 45 days to expiration.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Keep Maximum Cash Reserves:</strong> Back every single contract with 100% cash in short-term T-bills. Never use leverage during volatility spikes.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Take Profits Rapidly:</strong> As the VIX cools down from 32 to 20, buy back your options at 60% profit. Do not wait for complete expiration.</li>
      </ol>
    `
  },
  {
    id: 'single-employer-rule',
    title: 'Location Underwriting: The 15% Single-Employer Rule in Secondary Markets',
    category: 'Real Estate',
    topic: 'real-estate',
    publishDate: '2026-03-15T08:00:00Z',
    displayDate: 'Mar 2026',
    readTime: '4 Min Read',
    summary: 'Why economic diversification is the primary filter in real estate, and how to verify job stability in secondary markets.',
    likes: 27,
    comments: [],
    body: `
      <p>High-yield real estate listings in small secondary towns often look tempting. You see an apartment building trading at an 8.5% capitalization rate and assume you have discovered a hidden gem. But if that town relies entirely on one manufacturing facility or automotive plant, your investment is a ticking time bomb.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">The Company Town Catastrophe</h3>
      <p>If a single employer accounts for more than 15% of the local payroll, you are not underwriting real estate; you are underwriting that corporation's management. If that factory reallocates production overseas, local unemployment spikes, tenants break leases, and your property value plummets. Real estate cannot be relocated.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Actionable Checklist: Vetting Employment Diversity</h3>
      <ol style="list-style-type: decimal; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1.5rem;">
        <li style="margin-bottom: 0.75rem;"><strong>Obtain the Comprehensive Annual Financial Report (CAFR):</strong> Check the principal employers table in the city's annual financial report.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Verify No Employer Exceeds 15%:</strong> Confirm that healthcare, education, logistics, and government make up a well-balanced local economy.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Check 5-Year Population Inflow:</strong> Only invest in metros showing continuous net-positive domestic migration over the past five consecutive years.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Track Permit Issuance:</strong> Ensure local housing starts are not outpacing population growth to prevent future oversupply squeezes.</li>
      </ol>
    `
  },
  {
    id: 'myth-market-timing',
    title: 'The Myth of Market Timing: Why Systematic Option Rules Always Win',
    category: 'Macro Strategy',
    topic: 'options',
    publishDate: '2026-02-01T08:00:00Z',
    displayDate: 'Feb 2026',
    readTime: '5 Min Read',
    summary: 'A quantitative demonstration of why algorithmic, rules-based options overlays outperform subjective market forecasts over full market cycles.',
    likes: 44,
    comments: [],
    body: `
      <p>Every quarter, Wall Street strategists release macroeconomic forecasts predicting where the S&P 500 will close by year-end. Historical data shows their predictions are rarely more accurate than a coin flip. Trying to predict the next interest rate cut or election outcome is a fool's errand. Disciplined capital relies on systematic rules, not forecasts.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Rules Remove Emotion</h3>
      <p>When you trade based on feelings, you buy when euphoria peaks and sell when panic sets in. A systematic options overlay acts as an emotional governor. It forces you to write calls when prices surge and buy protection when prices settle. The process runs like clockwork, independent of personal bias.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Actionable Checklist: Building a Systematic Rules Engine</h3>
      <ol style="list-style-type: decimal; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1.5rem;">
        <li style="margin-bottom: 0.75rem;"><strong>Write Down Entry Criteria:</strong> Never enter an option trade without predefined strike delta, expiration date, and minimum credit requirements.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Set Hard Profit Targets:</strong> Automate limit orders to close positions once 50% of maximum profit is captured.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Define Stop-Loss Thresholds:</strong> Close or roll contracts if the underlying asset moves beyond 2.5 times your collected premium.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Maintain an Execution Journal:</strong> Log every trade rationale, entry metric, and exit price. Review your consistency every 90 days.</li>
      </ol>
    `
  },
  {
    id: 'value-add-renovations',
    title: 'Value-Add Renovations: How to Force Appreciation Without Over-Investing',
    category: 'Real Estate',
    topic: 'real-estate',
    publishDate: '2026-02-15T08:00:00Z',
    displayDate: 'Feb 2026',
    readTime: '4 Min Read',
    summary: 'The highest return-on-investment interior upgrades that boost monthly rent while strictly avoiding capital-wasting cosmetic overhauls.',
    likes: 35,
    comments: [],
    body: `
      <p>Forcing appreciation is the hallmark of professional real estate operators. You do not simply wait for market inflation to lift property values; you increase Net Operating Income through targeted physical improvements. Because commercial real estate is valued based on its cap rate, every $1 increase in monthly net income adds $150 to $200 to the property's appraised value.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Avoid the Luxury Trap</h3>
      <p>New investors frequently over-renovate. They install imported quartz countertops and tile backsplashes in working-class neighborhoods where tenants will not pay a premium for them. Your capital expenditure must directly align with what local wage earners value: washer/dryer hookups, secure parking, and clean durable flooring.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Actionable Checklist: High-ROI Renovation Playbook</h3>
      <ol style="list-style-type: decimal; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1.5rem;">
        <li style="margin-bottom: 0.75rem;"><strong>Install In-Unit Washers and Dryers:</strong> This $1,200 capital investment commands an immediate $65 to $85 monthly rent premium, paying for itself in under 18 months.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Replace Carpet with Vinyl Plank:</strong> LVT flooring costs slightly more upfront than carpet, but lasts 10 years without requiring replacement between tenants.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Modernize Lighting and Hardware:</strong> Spend $250 per unit replacing brass knobs and fixtures with matte black hardware for an instant modern look.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Submeter Water and Trash:</strong> Implementing a Ratio Utility Billing System (RUBS) transfers utility expense directly to tenants, immediately increasing NOI.</li>
      </ol>
    `
  },
  {
    id: 'hedged-new-year',
    title: 'Starting the Year Hedged: Building Your Downside Defense Plan',
    category: 'Macro Strategy',
    topic: 'options',
    publishDate: '2026-01-01T08:00:00Z',
    displayDate: 'Jan 2026',
    readTime: '5 Min Read',
    summary: 'The annual risk-allocation checklist every family office should run to stress-test their balance sheet against macro shocks.',
    likes: 49,
    comments: [],
    body: `
      <p>Every January, wealth managers talk about optimizing asset allocation for maximum growth. Very few ask the critical question: what happens if the consensus forecast is wrong? An annual hedging review ensures your capital is protected against unforeseen liquidity freezes, interest rate spikes, and geopolitical escalations.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">The Balance Sheet Health Check</h3>
      <p>True risk management is not about predicting disasters. It is about building a portfolio that survives whatever happens. By auditing counterparty exposure, liquid reserves, and option collar structures in January, you operate from a position of absolute strength throughout the year.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Actionable Checklist: The Annual Defense Audit</h3>
      <ol style="list-style-type: decimal; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1.5rem;">
        <li style="margin-bottom: 0.75rem;"><strong>Audit Floating-Rate Exposure:</strong> Eliminate or hedge all floating-rate debt across your real estate and corporate holdings.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Review Cash Equivalents:</strong> Ensure emergency liquidity is held in government-backed short-duration bills rather than uninsured commercial paper.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Set 12-Month Put Floors:</strong> Purchase annual deep out-of-the-money puts to insulate core index allocations from black swan events.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Align Family Office Governance:</strong> Establish clear liquidity rules so partners never debate cash allocations during market crises.</li>
      </ol>
    `
  },
  {
    id: 'cap-rate-dynamics',
    title: 'Cap Rate Compression vs Expansion: Navigating Regional Real Estate Cycles',
    category: 'Real Estate',
    topic: 'real-estate',
    publishDate: '2026-01-15T08:00:00Z',
    displayDate: 'Jan 2026',
    readTime: '4 Min Read',
    summary: 'Understanding the relationship between capitalization rates, borrowing costs, and property valuations across regional growth corridors.',
    likes: 32,
    comments: [],
    body: `
      <p>Capitalization rates are the pulse of commercial real estate valuation. When interest rates fell to zero, cap rates compressed to record lows, driving up property prices. As cost of capital normalized, cap rates expanded, separating disciplined operators from speculative buyers who overpaid.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">The Cap Rate Spread Principle</h3>
      <p>Never evaluate a cap rate in isolation. Always measure the spread between the property's cap rate and the prevailing 10-year Treasury yield. When that spread is healthy (at least 175 to 225 basis points), you are being adequately compensated for taking real estate operational risk. When the spread shrinks below 100 basis points, you are taking equity risk for bond returns.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Actionable Checklist: Evaluating Cap Rates</h3>
      <ol style="list-style-type: decimal; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1.5rem;">
        <li style="margin-bottom: 0.75rem;"><strong>Demand a Positive Spread:</strong> Ensure your entry capitalization rate is at least 150 basis points higher than your mortgage borrowing cost.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Model Cap Rate Expansion on Exit:</strong> In your 5-year exit model, assume the exit cap rate expands by 50 basis points. If the deal only works with cap rate compression, pass.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Compare Submarket Medians:</strong> Check historical cap rate trends over the last 15 years in that municipality to ensure you are not buying at a cyclical peak.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Focus on In-Place NOI:</strong> Never calculate a cap rate based on future projected rents. Calculate strictly on today's provable collections.</li>
      </ol>
    `
  },

  // ==========================================
  // UPCOMING SCHEDULED LETTERS (OCTOBER 2026 & BEYOND)
  // ==========================================
  {
    id: 'asymmetric-greeks-oct-2026',
    title: 'Managing Asymmetric Greeks in High-Yield Environments',
    category: 'Macro Strategy',
    topic: 'options',
    publishDate: '2026-10-01T08:00:00Z',
    displayDate: 'Oct 2026',
    readTime: '5 Min Read',
    summary: 'How delta, gamma, and theta interact when designing multi-leg options overlays for institutional portfolios.',
    likes: 0,
    comments: [],
    body: `
      <p>Options math can feel overwhelming with all its Greek terminology. But stripped of academic jargon, the Greeks are simply tools to measure sensitivity. Understanding how theta decay and delta exposure shift as markets move is the key to locking in steady monthly returns without taking directional gambles.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Letting Time Work for You</h3>
      <p>Theta is the rate of option price decay over time. Every single morning the sun rises, option contracts lose value. By systematically writing out-of-the-money options, theta works in your favor 24/7. While retail option buyers watch their contracts melt, our portfolio collects that decay as recurring cash yield.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Actionable Checklist: Managing Greeks Like an Institution</h3>
      <ol style="list-style-type: decimal; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1.5rem;">
        <li style="margin-bottom: 0.75rem;"><strong>Target the Sweet Spot of Theta:</strong> Write options between 30 and 45 days to expiration, where time decay accelerates exponentially.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Cap Net Portfolio Delta:</strong> Keep total overlay delta between 0.15 and 0.25 to prevent unexpected directional exposure.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Monitor Gamma Risk in the Final Week:</strong> Close positions with less than 7 days remaining to avoid erratic gamma swings near expiration.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Compound the Harvested Decay:</strong> Reinvest all theta gains directly into defensive treasury equivalents or tail-hedging puts.</li>
      </ol>
    `
  },
  {
    id: 'refinance-cliff-oct-2026',
    title: 'The Refinance Cliff: Underwriting Floating-Rate Debt Replacements',
    category: 'Real Estate',
    topic: 'real-estate',
    publishDate: '2026-10-15T08:00:00Z',
    displayDate: 'Oct 2026',
    readTime: '4 Min Read',
    summary: 'A tactical guide for acquiring distressed commercial assets facing looming debt maturities and capital calls.',
    likes: 0,
    comments: [],
    body: `
      <p>Over the next 24 months, billions of dollars in commercial real estate loans will mature. Many operators who bought properties during low-interest environments cannot qualify for refinancing under current borrowing rates. This "refinance cliff" is creating exceptional acquisition opportunities for well-capitalized buyers with dry powder.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Distress at the Maturity Level, Not the Property Level</h3>
      <p>The crucial insight is that many of these properties are fully occupied and operating well. The distress is purely financial, caused by an unworkable debt structure rather than bad real estate. Step in with clean capital, replace the troubled debt, and you acquire a performing asset at a deep discount.</p>

      <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Actionable Checklist: Sourcing Debt-Maturity Deals</h3>
      <ol style="list-style-type: decimal; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1.5rem;">
        <li style="margin-bottom: 0.75rem;"><strong>Track CMBS Loan Maturity Schedules:</strong> Monitor public commercial mortgage-backed securities (CMBS) tracking databases for loans maturing in the next 12 months.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Approach Special Servicers Early:</strong> Reach out to loan servicers 90 days before maturity to position your group as a preferred recapitalization partner.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Offer Fresh Equity Infusions:</strong> Propose rescue capital in exchange for senior preferred equity positions with guaranteed minimum returns.</li>
        <li style="margin-bottom: 0.75rem;"><strong>Structure Conservative Fixed Refinancing:</strong> Never repeat the prior owner's mistake. Lock in long-term fixed financing immediately upon takeover.</li>
      </ol>
    `
  }
];

class InsightsEngine {
  constructor() {
    this.articles = [];
    this.initDatabase();
    this.startScheduler();
  }

  /**
   * Initialize articles from disk or fallback to initial base catalog
   */
  initDatabase() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf8');
        this.articles = JSON.parse(raw);
        console.log(`📚 [Flourish Insights] Loaded ${this.articles.length} articles from storage.`);
      } else {
        this.articles = [...INITIAL_ARTICLES];
        this.saveDatabase();
        console.log(`📚 [Flourish Insights] Initialized database with ${this.articles.length} base articles.`);
      }
    } catch (err) {
      console.warn('⚠️ [Flourish Insights] Read failed, using memory state:', err.message);
      this.articles = [...INITIAL_ARTICLES];
    }

    // Run initial schedule check
    this.checkSchedule();
  }

  /**
   * Persist state to disk safely (with Cloud Run read-only fallback)
   */
  saveDatabase() {
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(this.articles, null, 2), 'utf8');
    } catch (err) {
      // In read-only serverless cloud runs, filesystem writes may fail gracefully
      console.log('ℹ️ [Flourish Insights] In-memory update active (cloud environment)');
    }
  }

  /**
   * Automated Scheduler:
   * Runs every hour to check for newly eligible articles and releases them.
   * Also ensures upcoming monthly slots are always populated.
   */
  startScheduler() {
    // Check schedule hourly
    const timer = setInterval(() => {
      this.checkSchedule();
    }, 60 * 60 * 1000);
    if (timer.unref) timer.unref();
  }

  /**
   * Evaluates the current date and determines:
   * 1. Which articles are published vs scheduled
   * 2. Which published articles fall in the last 6 months (Recent)
   * 3. Which published articles are older than 6 months (Archived)
   * 4. Automatically drafts future monthly prescriptive letters if upcoming slots are empty!
   */
  checkSchedule() {
    const now = new Date();
    let updated = false;

    // Check if future scheduled articles need to be generated for upcoming months
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    // Ensure we have scheduled articles for the next 3 months
    for (let offset = 0; offset <= 3; offset++) {
      const targetDate = new Date(currentYear, currentMonth + offset, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1; // 1-12
      const monthName = targetDate.toLocaleString('default', { month: 'short' });

      // Slot 1: Macro Strategy on 1st of month
      const macroId = `macro-${monthName.toLowerCase()}-${year}`;
      const hasMacro = this.articles.some(a => a.id === macroId || (a.category === 'Macro Strategy' && a.displayDate === `${monthName} ${year}`));
      if (!hasMacro) {
        this.articles.push(this.generatePrescriptiveMacroLetter(year, monthName));
        updated = true;
      }

      // Slot 2: Real Estate on 15th of month
      const reId = `re-${monthName.toLowerCase()}-${year}`;
      const hasRe = this.articles.some(a => a.id === reId || (a.category === 'Real Estate' && a.displayDate === `${monthName} ${year}`));
      if (!hasRe) {
        this.articles.push(this.generatePrescriptiveRealEstateLetter(year, monthName));
        updated = true;
      }
    }

    if (updated) {
      this.saveDatabase();
      console.log(`⏰ [Flourish Insights Scheduler] Verified and populated automated monthly publication queue.`);
    }
  }

  /**
   * Generates an automated, highly prescriptive Macro Strategy / Options letter
   * following all Voice & Editing rules.
   */
  generatePrescriptiveMacroLetter(year, monthName) {
    const monthNum = new Date(`${monthName} 1, ${year}`).getMonth() + 1;
    const padMonth = String(monthNum).padStart(2, '0');
    return {
      id: `macro-${monthName.toLowerCase()}-${year}`,
      title: `Systematic Delta Management: Calibrating Risk for ${monthName} ${year}`,
      category: 'Macro Strategy',
      topic: 'options',
      publishDate: `${year}-${padMonth}-01T08:00:00Z`,
      displayDate: `${monthName} ${year}`,
      readTime: '5 Min Read',
      summary: `Our monthly quantitative review on calibrating option delta buffers to protect and grow capital through changing interest rate climates.`,
      likes: 0,
      comments: [],
      body: `
        <p>Macro volatility does not take holidays. When market headlines swing between rate cuts and inflation fears, unhedged portfolios take unnecessary beatings. We do not try to outguess the Federal Reserve. Instead, we calibrate our quantitative delta parameters to systematically harvest upside while setting a hard floor on downside swings.</p>
        
        <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">The Logic of Continuous Rebalancing</h3>
        <p>Most investors wait for quarterly rebalancing to adjust their risk. In fast-moving markets, three months is an eternity. By using systematic 30-day and 45-day option overlays, we harvest theta decay every week. That steady income builds a compounding buffer that lowers the net cost basis on every underlying share we own.</p>
        
        <blockquote style="border-left: 4px solid #829A7E; padding-left: 1rem; margin: 1.5rem 0; font-style: italic; color: #4A5560;">"Consistency beats heroism in portfolio management. A dependable 1.5% monthly cash-flow overlay compounds into insurmountable long-term outperformance."</blockquote>
        
        <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Actionable Checklist: Your Monthly Options Calibration</h3>
        <ol style="list-style-type: decimal; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1.5rem;">
          <li style="margin-bottom: 0.75rem;"><strong>Calculate Net Portfolio Delta:</strong> Tally your total equity exposure and determine your portfolio's sensitivity to a 1% S&P drop.</li>
          <li style="margin-bottom: 0.75rem;"><strong>Write Covered Calls at 0.18 Delta:</strong> Sell out-of-the-money calls targeting 30 to 45 days to expiration. Collect premium while allowing 5% to 7% room for market upside.</li>
          <li style="margin-bottom: 0.75rem;"><strong>Reinvest 20% into 6-Month Crash Puts:</strong> Take a small slice of that income and buy protective puts 15% out-of-the-money. This ensures total peace of mind.</li>
          <li style="margin-bottom: 0.75rem;"><strong>Sweep Collected Premium into T-Bills:</strong> Never let cash sit idle. Sweep your option premiums directly into 4-week Treasury bills to compound risk-free interest.</li>
        </ol>
      `
    };
  }

  /**
   * Generates an automated, highly prescriptive Real Estate letter
   * following all Voice & Editing rules.
   */
  generatePrescriptiveRealEstateLetter(year, monthName) {
    const monthNum = new Date(`${monthName} 1, ${year}`).getMonth() + 1;
    const padMonth = String(monthNum).padStart(2, '0');
    return {
      id: `re-${monthName.toLowerCase()}-${year}`,
      title: `Recession-Proof Underwriting: Real Estate Playbook for ${monthName} ${year}`,
      category: 'Real Estate',
      topic: 'real-estate',
      publishDate: `${year}-${padMonth}-15T08:00:00Z`,
      displayDate: `${monthName} ${year}`,
      readTime: '4 Min Read',
      summary: `Practical, disciplined criteria for underwriting off-market multifamily properties to preserve and compound capital across economic cycles.`,
      likes: 0,
      comments: [],
      body: `
        <p>Commercial real estate remains the premier asset class for building generational wealth. But you cannot buy on hope. In an economy where replacement costs continue to rise, existing physical structures hold immense intrinsic value—provided you acquire them at the right price with conservative debt.</p>
        
        <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Why Cash Flow Beats Speculation</h3>
        <p>Speculators buy properties hoping for future price appreciation. Investors buy properties for existing, verifiable cash flow. If a property cannot produce positive cash flow on day one under realistic expense assumptions, walk away. Sustainable wealth comes from monthly tenant rent checks, not spreadsheet forecasts.</p>
        
        <blockquote style="border-left: 4px solid #829A7E; padding-left: 1rem; margin: 1.5rem 0; font-style: italic; color: #4A5560;">"Focus on the tenant, the roof, and the debt coverage. The appreciation will take care of itself."</blockquote>
        
        <h3 style="font-size: 1.25rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">Actionable Checklist: Deal Screening in 15 Minutes</h3>
        <ol style="list-style-type: decimal; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1.5rem;">
          <li style="margin-bottom: 0.75rem;"><strong>Apply the 50% Rule First:</strong> Deduct 50% of gross rents for operating costs. If the remaining cash cannot pay the mortgage, reject the deal.</li>
          <li style="margin-bottom: 0.75rem;"><strong>Confirm Submarket Population Growth:</strong> Only purchase in counties showing at least 1.2% annual net population growth over the past three years.</li>
          <li style="margin-bottom: 0.75rem;"><strong>Inspect Electrical Panels and Plumbing:</strong> Require your inspector to check for aluminum wiring or cast-iron pipes. Catching infrastructure issues early saves hundreds of thousands.</li>
          <li style="margin-bottom: 0.75rem;"><strong>Lock In Fixed Financing:</strong> Refuse floating-rate debt. Secure fixed-rate financing for at least 7 to 10 years to protect cash distributions against interest rate shocks.</li>
        </ol>
      `
    };
  }

  /**
   * Retrieves all published articles formatted with status flags:
   * - isRecent: published within the last 6 months
   * - isArchived: published more than 6 months ago
   */
  getPublishedArticles(options = {}) {
    const now = new Date();
    // 6 months ago threshold in milliseconds: approximately 183 days
    const sixMonthsAgo = new Date(now.getTime() - 183 * 24 * 60 * 60 * 1000);

    let list = this.articles.filter(article => {
      const pubDate = new Date(article.publishDate);
      return pubDate <= now; // only already published articles
    });

    // Sort descending by publish date (newest first)
    list.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));

    return list.map(a => {
      const pubDate = new Date(a.publishDate);
      const isRecent = pubDate >= sixMonthsAgo;
      const isArchived = pubDate < sixMonthsAgo;
      return {
        id: a.id,
        title: a.title,
        category: a.category,
        topic: a.topic,
        publishDate: a.publishDate,
        displayDate: a.displayDate,
        readTime: a.readTime,
        summary: a.summary,
        likes: a.likes || 0,
        commentsCount: (a.comments && a.comments.length) || 0,
        isRecent,
        isArchived
      };
    });
  }

  /**
   * Returns recent articles (published within past 6 months)
   */
  getRecentArticles(category = null) {
    const all = this.getPublishedArticles();
    let recent = all.filter(a => a.isRecent);
    if (category && category !== 'all') {
      recent = recent.filter(a => a.category.toLowerCase().includes(category.toLowerCase()));
    }
    return recent;
  }

  /**
   * Returns archived articles (older than 6 months), grouped by year/period
   */
  getArchivedArticles(category = null) {
    const all = this.getPublishedArticles();
    let archived = all.filter(a => a.isArchived);
    if (category && category !== 'all') {
      archived = archived.filter(a => a.category.toLowerCase().includes(category.toLowerCase()));
    }
    return archived;
  }

  /**
   * Returns complete article details by id (including full body and comments)
   */
  getArticleById(id) {
    const article = this.articles.find(a => a.id === id);
    if (!article) return null;

    const now = new Date();
    const pubDate = new Date(article.publishDate);
    const sixMonthsAgo = new Date(now.getTime() - 183 * 24 * 60 * 60 * 1000);

    return {
      ...article,
      likes: article.likes || 0,
      comments: article.comments || [],
      commentsCount: (article.comments && article.comments.length) || 0,
      isRecent: pubDate >= sixMonthsAgo,
      isArchived: pubDate < sixMonthsAgo
    };
  }

  /**
   * Increments like count on an article
   */
  likeArticle(id) {
    const article = this.articles.find(a => a.id === id);
    if (!article) return null;

    article.likes = (article.likes || 0) + 1;
    this.saveDatabase();
    return { id: article.id, likes: article.likes };
  }

  /**
   * Adds a new comment to an article
   */
  addComment(id, { author, affiliation, text }) {
    const article = this.articles.find(a => a.id === id);
    if (!article) return null;

    if (!article.comments) article.comments = [];

    // Simple sanitization to prevent XSS
    const sanitize = str => (str ? str.replace(/<[^>]*>/g, '').trim() : '');
    const cleanAuthor = sanitize(author) || 'Private Investor';
    const cleanAffiliation = sanitize(affiliation) || 'Reader Perspective';
    const cleanText = sanitize(text);

    if (!cleanText) return null;

    const newComment = {
      id: `c-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      author: cleanAuthor,
      affiliation: cleanAffiliation,
      text: cleanText,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    article.comments.push(newComment);
    this.saveDatabase();

    return {
      newComment,
      commentsCount: article.comments.length,
      comments: article.comments
    };
  }
}

// Singleton instance
module.exports = new InsightsEngine();
