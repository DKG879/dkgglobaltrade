export type Contact = {
  role: string;
  why: string;
  ask: string;
};

export type Step = {
  label: string;
  detail: string;
  owner: string;
  docs?: string[];
};

export type Playbook = {
  slug: string;
  name: string;
  symbol: string;
  tagline: string;
  units: string;
  typicalIncoterms: string[];
  routes: string;
  contacts: Contact[];
  steps: Step[];
  documents: string[];
  redFlags: string[];
};

const commonRedFlags = [
  "Seller asks for any payment before documents or inspection are agreed.",
  "\"Mandate\" who cannot produce a signed authorisation from the titleholder.",
  "Chain of five brokers with no direct line to the actual seller or buyer.",
  "Refusal of independent inspection (SGS / Alfred H Knight / Bureau Veritas).",
  "Documents emailed as photos only, never originals through banks.",
];

export const playbooks: Playbook[] = [
  {
    slug: "gold",
    name: "Gold",
    symbol: "Au",
    tagline: "Doré bars, dust and refined bullion — the most fraud-heavy market you will touch.",
    units: "kg (doré), troy oz (refined)",
    typicalIncoterms: ["FCA airport", "CIF refinery", "DAP refinery"],
    routes: "West/East Africa & Latin America → Dubai, Switzerland, India refineries",
    contacts: [
      {
        role: "Titleholder / mine or licensed exporter",
        why: "Only they can produce the export licence and assay in their own name.",
        ask: "Show mining/export licence, tax clearance and last export declaration.",
      },
      {
        role: "Refinery or LBMA-accredited buyer",
        why: "Sets the payable percentage, refining terms and settlement window.",
        ask: "Confirm refining charge, payable %, settlement days after melt.",
      },
      {
        role: "Assayer / inspection lab",
        why: "Independent purity and weight before any money moves.",
        ask: "Can you attend at origin and issue a signed assay certificate?",
      },
      {
        role: "Secured logistics (Brinks, Malca-Amit, Loomis)",
        why: "Gold moves under valuable-cargo protocol, not normal freight.",
        ask: "Quote door-to-refinery with insurance value and airway bill terms.",
      },
      {
        role: "Bank / escrow agent",
        why: "Payment against documents; never buyer-to-seller wire on trust.",
        ask: "Will you handle escrow or DLC against assay and airway bill?",
      },
    ],
    steps: [
      {
        label: "Qualify both sides",
        detail:
          "Verify who actually owns the metal and who actually has funds. Ask for company registration, licence, and a named signatory. Kill the deal if either side is only reachable through intermediaries.",
        owner: "Broker (you)",
        docs: ["Company registration", "Export licence", "Passport of signatory"],
      },
      {
        label: "NCNDA / IMFPA signed",
        detail:
          "Protect your commission in writing before any introduction. Name the parties, the commodity, quantity, term and your fee per kg or percentage.",
        owner: "Broker + both principals",
        docs: ["NCNDA", "IMFPA (fee protection agreement)"],
      },
      {
        label: "Seller issues FCO / SCO",
        detail:
          "Full Corporate Offer with quantity, purity range, payable %, delivery point, and validity date. Buyer replies with ICPO on letterhead.",
        owner: "Seller → Buyer",
        docs: ["FCO / SCO", "ICPO"],
      },
      {
        label: "SPA / contract signed",
        detail:
          "Contract fixes purity basis, weighing method, payable percentage, refining charge, discrepancy clause, jurisdiction and arbitration.",
        owner: "Both principals",
        docs: ["Sales & Purchase Agreement"],
      },
      {
        label: "Origin verification and assay",
        detail:
          "Independent lab weighs and assays in front of both representatives at the vault or refinery gate. Photograph seals and bar numbers.",
        owner: "Inspection lab",
        docs: ["Assay certificate", "Bar list with serial numbers"],
      },
      {
        label: "Export clearance and secured freight",
        detail:
          "Export declaration, royalty/tax paid, valuable-cargo airway bill with insurance at market value. Consignee is the refinery, not a person.",
        owner: "Exporter + logistics",
        docs: ["Export declaration", "AWB", "Insurance certificate"],
      },
      {
        label: "Refinery melt and final assay",
        detail:
          "Refinery melts, issues outturn report. Compare against origin assay; discrepancy clause governs any gap.",
        owner: "Refinery",
        docs: ["Outturn / melt report"],
      },
      {
        label: "Settlement and commission",
        detail:
          "Payment released against documents (escrow or DLC). Your commission is paid from the buyer or seller side exactly as the IMFPA states — chase the paying bank, not the counterparty.",
        owner: "Bank",
        docs: ["SWIFT confirmation", "Commission invoice"],
      },
    ],
    documents: [
      "NCNDA / IMFPA",
      "FCO, ICPO, SPA",
      "Export licence & declaration",
      "Assay certificate & bar list",
      "AWB + insurance",
      "Refinery outturn report",
    ],
    redFlags: [
      "\"Advance payment for export tax\" — the classic gold scam.",
      "Purity quoted as 96%+ doré with no lab report.",
      ...commonRedFlags.slice(0, 3),
    ],
  },
  {
    slug: "aluminium",
    name: "Aluminium",
    symbol: "Al",
    tagline: "Ingots, billets, wire rod and scrap priced off LME plus a regional premium.",
    units: "MT (metric tonnes)",
    typicalIncoterms: ["FOB", "CIF", "CFR", "DAP"],
    routes: "Gulf, India, China, Russia → EU, Turkey, SE Asia",
    contacts: [
      {
        role: "Smelter or authorised distributor",
        why: "Real allocation comes from the smelter's monthly tonnage, not a trader's promise.",
        ask: "Which smelter, what brand, LME registered? Monthly allocation in MT?",
      },
      {
        role: "End buyer's procurement head",
        why: "Only procurement can confirm specification, premium and payment instrument.",
        ask: "Alloy grade, ingot form, annual volume, LC issuing bank?",
      },
      {
        role: "Inspection company (SGS / AHK)",
        why: "Weight and chemical composition at load port protects both sides.",
        ask: "Loading supervision plus composition analysis certificate?",
      },
      {
        role: "Freight forwarder / NVOCC",
        why: "Containerised or breakbulk quotes decide whether the CIF price works.",
        ask: "Rate per 20ft, lashing/dunnage, free days at destination?",
      },
      {
        role: "Trade finance bank",
        why: "LC wording is where most aluminium deals die.",
        ask: "Confirmable LC at sight? Which documents required?",
      },
    ],
    steps: [
      {
        label: "Fix the pricing formula",
        detail:
          "Aluminium is never a flat number for long. Agree LME cash settlement average over a quotation period plus a stated premium in USD/MT.",
        owner: "Both principals",
      },
      {
        label: "Specification sheet agreed",
        detail:
          "Alloy (e.g. A7 / P1020 / 6063 billet), ingot weight, packing, bundling and tolerance. Ambiguity here becomes a rejection at discharge.",
        owner: "Buyer's technical team",
        docs: ["Spec sheet", "Mill test certificate sample"],
      },
      {
        label: "NCNDA / IMFPA and soft offer",
        detail: "Lock your fee, then circulate the soft offer with validity and quotation period.",
        owner: "Broker (you)",
        docs: ["NCNDA", "IMFPA", "Soft offer"],
      },
      {
        label: "ICPO then contract",
        detail:
          "Buyer's ICPO with target volume and delivery schedule; contract adds shipment windows, penalties and demurrage responsibility.",
        owner: "Both principals",
        docs: ["ICPO", "Sales contract"],
      },
      {
        label: "Payment instrument issued",
        detail:
          "Irrevocable LC at sight (or DLC/SBLC as agreed) issued by an acceptable bank. Seller confirms the wording before loading — not after.",
        owner: "Buyer's bank",
        docs: ["Draft LC", "Operative LC (MT700)"],
      },
      {
        label: "Production and pre-shipment inspection",
        detail:
          "Inspector attends loading, verifies weight, marks and composition, seals containers.",
        owner: "Inspection company",
        docs: ["Weight certificate", "Analysis certificate", "Packing list"],
      },
      {
        label: "Shipment and documents",
        detail:
          "Bill of lading issued clean on board. Full document set presented to the bank within the LC presentation period.",
        owner: "Seller + forwarder",
        docs: ["B/L", "Invoice", "Certificate of origin", "Insurance policy"],
      },
      {
        label: "Discharge, final weight and settlement",
        detail:
          "Final invoice on outturn weight and final quotation period price. Commission invoiced against the executed contract.",
        owner: "Bank + you",
        docs: ["Outturn report", "Final invoice", "Commission invoice"],
      },
    ],
    documents: [
      "Spec sheet & mill test certificate",
      "ICPO, contract",
      "LC / SBLC",
      "Weight & analysis certificates",
      "Bill of lading, COO, insurance",
    ],
    redFlags: [
      "Premium quoted far below regional market — usually a non-existent allocation.",
      "Seller wants TT payment for a first-time container.",
      ...commonRedFlags.slice(0, 3),
    ],
  },
  {
    slug: "bauxite",
    name: "Bauxite Ore",
    symbol: "Bx",
    tagline: "Bulk ore sold on chemistry and moisture — a freight and demurrage game.",
    units: "MT / dry metric tonne (DMT)",
    typicalIncoterms: ["FOB", "CFR", "CIF"],
    routes: "Guinea, Indonesia, Australia, India → China, Gulf, EU refineries",
    contacts: [
      {
        role: "Mine owner / holder of mining lease",
        why: "Bulk ore requires proven stockpile and loading capability, not a paper seller.",
        ask: "Lease number, stockpile tonnage, loading rate per day, last shipment?",
      },
      {
        role: "Alumina refinery buyer",
        why: "They dictate Al2O3, SiO2 and moisture limits and the penalty scale.",
        ask: "Target chemistry, reject limits, penalty per unit below spec?",
      },
      {
        role: "Ship broker / chartering desk",
        why: "Freight on Supramax/Panamax often exceeds the cargo margin.",
        ask: "Indicative freight, laytime, demurrage rate, load/discharge rates?",
      },
      {
        role: "Independent surveyor",
        why: "Draft survey and sampling at load and discharge decide the invoice.",
        ask: "Draft survey plus sampling and moisture determination at both ends?",
      },
      {
        role: "Port agent / stevedore",
        why: "Loading delays create demurrage that eats your commission's credibility.",
        ask: "Berth availability, loading rate, barge or direct berth?",
      },
    ],
    steps: [
      {
        label: "Verify mine and stockpile",
        detail:
          "Ask for lease documents, a recent independent geological report and photos or drone footage of the stockpile with dates.",
        owner: "Broker (you)",
        docs: ["Mining lease", "Geological / stockpile report"],
      },
      {
        label: "Chemistry and penalty table",
        detail:
          "Agree Al2O3, SiO2, Fe2O3, TiO2, LOI and free moisture, with bonus/penalty per percentage point and rejection limits.",
        owner: "Both principals",
        docs: ["Spec & penalty annex"],
      },
      {
        label: "NCNDA / IMFPA, then FCO and ICPO",
        detail: "Fix your fee per MT before introducing the refinery to the mine.",
        owner: "Broker (you)",
        docs: ["NCNDA", "IMFPA", "FCO", "ICPO"],
      },
      {
        label: "Contract with laytime terms",
        detail:
          "Contract must state shipment window, load/discharge rates, laytime, demurrage/despatch, weighing basis (draft survey) and payment terms.",
        owner: "Both principals",
        docs: ["Sales contract", "Charter party reference"],
      },
      {
        label: "Vessel nomination and acceptance",
        detail:
          "Seller or buyer nominates the vessel per Incoterm; the other side accepts. Confirm the vessel suits the berth draft.",
        owner: "Chartering party",
        docs: ["Vessel nomination", "Q88"],
      },
      {
        label: "Loading, draft survey, sampling",
        detail:
          "Surveyor determines loaded weight by draft survey and takes composite samples; provisional invoice raised on load-port results.",
        owner: "Surveyor",
        docs: ["Draft survey report", "Certificate of analysis", "Mate's receipt"],
      },
      {
        label: "Documents to bank",
        detail:
          "Clean on board B/L, COO, analysis, weight certificate, insurance where CIF. Presented within LC terms.",
        owner: "Seller",
        docs: ["B/L", "COO", "Provisional invoice"],
      },
      {
        label: "Discharge, final analysis, settlement",
        detail:
          "Discharge-port analysis and umpire clause resolve differences. Final invoice applies penalties; demurrage settled separately.",
        owner: "Both principals",
        docs: ["Final analysis", "Final invoice", "Demurrage statement"],
      },
    ],
    documents: [
      "Mining lease & stockpile report",
      "Spec and penalty annex",
      "Contract with laytime/demurrage",
      "Draft survey & certificate of analysis",
      "B/L, COO, insurance",
    ],
    redFlags: [
      "No draft survey allowed at load port.",
      "Seller cannot name the load port berth or loading rate.",
      ...commonRedFlags.slice(0, 3),
    ],
  },
  {
    slug: "copper",
    name: "Copper",
    symbol: "Cu",
    tagline: "Cathodes, blister and concentrate — LME-linked with treatment charges on concentrate.",
    units: "MT (cathode), DMT (concentrate)",
    typicalIncoterms: ["FOB", "CIF", "CFR", "DAP"],
    routes: "Chile, Peru, DRC, Zambia → China, EU, Turkey, India",
    contacts: [
      {
        role: "Producer / smelter",
        why: "LME-registered brand cathode has a real audit trail; unbranded usually does not.",
        ask: "Brand, LME registration, monthly tonnage, warehouse warrant available?",
      },
      {
        role: "Buyer's trading desk",
        why: "They confirm grade (Grade A / 99.99%), premium and quotation period.",
        ask: "Premium over LME, QP month, payment instrument?",
      },
      {
        role: "Warehouse / warrant holder",
        why: "For warrant deals, title moves via the warehouse, not the seller's word.",
        ask: "Can you confirm warrant number and holder to the buyer's bank?",
      },
      {
        role: "Inspection company",
        why: "Cathode count, weight and sampling; for concentrate, Cu% and payable metals.",
        ask: "Attend loading, seal containers, issue weight and assay?",
      },
      {
        role: "Trade finance bank",
        why: "Copper is high value per container — the instrument protects everyone.",
        ask: "LC at sight against documents, or CAD through your desk?",
      },
    ],
    steps: [
      {
        label: "Identify the real source",
        detail:
          "Producer, LME warehouse warrant or authorised distributor. If it is none of these, treat the offer as noise.",
        owner: "Broker (you)",
        docs: ["Producer letter or warrant copy"],
      },
      {
        label: "Grade, premium and QP fixed",
        detail:
          "Grade A cathode: LME cash average over the quotation period plus premium. Concentrate: payable Cu%, treatment and refining charges, penalty elements (As, Bi, Pb).",
        owner: "Both principals",
        docs: ["Spec annex", "Pricing formula"],
      },
      {
        label: "NCNDA / IMFPA and offer",
        detail: "Fee agreement first, then the soft offer with validity and shipment window.",
        owner: "Broker (you)",
        docs: ["NCNDA", "IMFPA", "Soft offer"],
      },
      {
        label: "Contract and payment instrument",
        detail:
          "Contract sets tolerance, packing (bundled cathodes on pallets), title transfer and instrument. Buyer's bank issues the LC and seller confirms the wording.",
        owner: "Both principals + bank",
        docs: ["Contract", "Operative LC"],
      },
      {
        label: "Pre-shipment inspection",
        detail:
          "Cathode count and weight, container sealing with numbered seals recorded in the packing list; for concentrate, moisture and assay.",
        owner: "Inspection company",
        docs: ["Weight certificate", "Assay", "Seal list"],
      },
      {
        label: "Shipment and document presentation",
        detail:
          "Clean on board B/L consigned per LC. Full set to bank inside the presentation window; couriers tracked.",
        owner: "Seller",
        docs: ["B/L", "Invoice", "COO", "Insurance"],
      },
      {
        label: "Discharge and final pricing",
        detail:
          "Outturn weight and assay at destination; final invoice per QP and penalty elements.",
        owner: "Both principals",
        docs: ["Outturn report", "Final invoice"],
      },
      {
        label: "Commission settlement",
        detail:
          "Invoice per the IMFPA on the executed shipment; follow the paying bank reference, keep every signed document on file.",
        owner: "Broker (you)",
        docs: ["Commission invoice", "SWIFT copy"],
      },
    ],
    documents: [
      "Producer letter / warehouse warrant",
      "Spec annex & pricing formula",
      "Contract and LC",
      "Weight, assay and seal list",
      "B/L, COO, insurance",
    ],
    redFlags: [
      "Cathode offered well below LME with \"CIF ASWP\" wording.",
      "Warrant copy with the holder's name blacked out.",
      ...commonRedFlags.slice(0, 3),
    ],
  },
];

export const getPlaybook = (slug: string) => playbooks.find((p) => p.slug === slug);

export const commodityOptions = [
  ...playbooks.map((p) => ({ value: p.slug, label: p.name })),
  { value: "iron_ore", label: "Iron Ore" },
  { value: "chemicals", label: "Chemicals" },
  { value: "other", label: "Other" },
];

export const stages = [
  { value: "lead", label: "Lead" },
  { value: "qualified", label: "Qualified" },
  { value: "docs", label: "Docs (NCNDA/ICPO)" },
  { value: "contract", label: "Contract / SPA" },
  { value: "instrument", label: "Payment instrument" },
  { value: "inspection", label: "Inspection" },
  { value: "shipped", label: "Shipped" },
  { value: "settled", label: "Settled" },
  { value: "dead", label: "Dead" },
];

export const roleOptions = [
  { value: "buyer", label: "Buyer" },
  { value: "seller", label: "Seller / Mine" },
  { value: "mandate", label: "Mandate / Agent" },
  { value: "inspector", label: "Inspection / Lab" },
  { value: "forwarder", label: "Freight forwarder" },
  { value: "shipbroker", label: "Ship broker" },
  { value: "bank", label: "Bank / Finance" },
  { value: "refinery", label: "Refinery / Smelter" },
];

export const trustLevels = [
  { value: "unverified", label: "Unverified" },
  { value: "documents_seen", label: "Documents seen" },
  { value: "verified", label: "Verified" },
  { value: "blacklisted", label: "Blacklisted" },
];
