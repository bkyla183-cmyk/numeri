import { CalculatorSpec } from './types';
import { parseNum, calcError } from './validation';

const fmt = (n: number, d = 2): number => {
  if (!Number.isFinite(n)) return 0;
  const r = Number(n.toFixed(d));
  return Object.is(r, -0) ? 0 : r;
};

export const batch4HomeTechSpecs: CalculatorSpec[] = [
  // 864. Drywall & Sheetrock Material Estimator
  {
    slug: 'drywall-sheetrock-estimator-calculator',
    title: 'Drywall Sheetrock, Joint Compound & Screws Estimator',
    category: 'home-tech',
    formulaDisplay: 'Sheets = ceil((WallArea + CeilingArea − Openings) × (1 + Waste%) ÷ SheetSqFt)',
    inputs: [
      { id: 'roomPerimeterFt', label: 'Total Wall Length / Perimeter', type: 'number', unit: 'ft', defaultValue: 64, min: 4, max: 10000, step: 2 },
      { id: 'wallHeightFt', label: 'Ceiling Height', type: 'number', unit: 'ft', defaultValue: 9, min: 6, max: 30, step: 0.5 },
      { id: 'ceilingAreaSqFt', label: 'Ceiling Drywall Area (0 if excluded)', type: 'number', unit: 'ft²', defaultValue: 240, min: 0, max: 1e6, step: 10 },
      { id: 'openingsSqFt', label: 'Windows & Doors Deduction', type: 'number', unit: 'ft²', defaultValue: 45, min: 0, max: 50000, step: 5 },
      { id: 'sheetSqFt', label: 'Drywall Sheet Size (4×8=32, 4×12=48)', type: 'select', defaultValue: '32', options: [{ label: '4×8 ft (32 ft²)', value: '32' }, { label: '4×10 ft (40 ft²)', value: '40' }, { label: '4×12 ft (48 ft²)', value: '48' }] },
      { id: 'wastePct', label: 'Cut Waste Factor', type: 'number', unit: '%', defaultValue: 10, min: 0, max: 40, step: 2 },
    ],
    calculate: (v) => {
      const [perim, h, ceil, open, sheet, waste] = [v.roomPerimeterFt, v.wallHeightFt, v.ceilingAreaSqFt, v.openingsSqFt, v.sheetSqFt, v.wastePct].map(parseNum);
      if ([perim, h, ceil, open, sheet, waste].some(Number.isNaN) || perim <= 0 || h <= 0 || ceil < 0 || open < 0 || sheet <= 0 || waste < 0) {
        return calcError('Enter valid positive room dimensions and sheet size.');
      }
      const netArea = Math.max(0, perim * h + ceil - open);
      const grossArea = netArea * (1 + waste / 100);
      const sheets = Math.ceil(grossArea / sheet);
      const mudGallons = fmt(netArea * 0.053, 1); // ~0.053 gal/sqft 3-coat finish
      const screws = Math.ceil(sheets * 36);
      return {
        primaryValue: sheets,
        primaryUnit: 'Drywall Sheets',
        primaryLabel: `Sheets (${sheet} ft² each)`,
        secondaryOutputs: [
          { label: 'Net Coverage Area', value: `${fmt(netArea, 1)} ft²` },
          { label: 'Joint Compound Needed', value: `${mudGallons} gal` },
          { label: 'Drywall Screws (~36/sheet)', value: `${screws} screws` },
        ],
        steps: [`Net area ${fmt(netArea, 1)} ft² × (1 + ${waste}%) ÷ ${sheet} = ${sheets} sheets.`],
      };
    },
  },

  // 865. Lumber Board Feet & Framing Cost Calculator
  {
    slug: 'lumber-board-feet-framing-calculator',
    title: 'Lumber Board Feet (BF) & Cost Estimator',
    category: 'home-tech',
    formulaDisplay: 'Board Feet = (Thickness_in × Width_in × Length_ft × Qty) ÷ 12',
    inputs: [
      { id: 'thicknessIn', label: 'Nominal Thickness', type: 'number', unit: 'in', defaultValue: 2, min: 0.25, max: 48, step: 0.25 },
      { id: 'widthIn', label: 'Nominal Width', type: 'number', unit: 'in', defaultValue: 6, min: 0.5, max: 48, step: 0.5 },
      { id: 'lengthFt', label: 'Board Length', type: 'number', unit: 'ft', defaultValue: 12, min: 0.5, max: 100, step: 1 },
      { id: 'quantity', label: 'Number of Boards', type: 'number', defaultValue: 40, min: 1, max: 1e6, step: 1 },
      { id: 'pricePerBf', label: 'Price per Board Foot', type: 'number', prefix: '$', defaultValue: 3.25, min: 0, max: 1000, step: 0.25 },
    ],
    calculate: (v) => {
      const [t, w, l, q, p] = [v.thicknessIn, v.widthIn, v.lengthFt, v.quantity, v.pricePerBf].map(parseNum);
      if ([t, w, l, q, p].some(Number.isNaN) || t <= 0 || w <= 0 || l <= 0 || q <= 0 || p < 0) return calcError('Dimensions and quantity must be positive.');
      const bfPerBoard = (t * w * l) / 12;
      const totalBf = bfPerBoard * q;
      const totalCost = totalBf * p;
      return {
        primaryValue: fmt(totalBf, 2),
        primaryUnit: 'Board Feet (BF)',
        primaryLabel: 'Total Lumber Volume',
        secondaryOutputs: [
          { label: 'Board Feet per Piece', value: `${fmt(bfPerBoard, 2)} BF` },
          { label: 'Linear Feet', value: `${fmt(l * q, 0)} LF` },
          { label: 'Estimated Total Cost', value: `$${fmt(totalCost, 2)}` },
        ],
        steps: [`${q} × (${t}" × ${w}" × ${l}') ÷ 12 = ${fmt(totalBf, 2)} BF ($${fmt(totalCost, 2)}).`],
      };
    },
  },

  // 866. Decking Boards & Joist Framing Estimator
  {
    slug: 'deck-joist-boards-estimator-calculator',
    title: 'Decking Boards, Joists & Fastener Estimator',
    category: 'home-tech',
    formulaDisplay: 'Deck Boards = ceil(Span ÷ (BoardWidth + Gap)) × Rows | Joists = floor(Length ÷ Spacing) + 1',
    inputs: [
      { id: 'deckLengthFt', label: 'Deck Length (Along House)', type: 'number', unit: 'ft', defaultValue: 20, min: 2, max: 500, step: 1 },
      { id: 'deckDepthFt', label: 'Deck Depth (Outward)', type: 'number', unit: 'ft', defaultValue: 12, min: 2, max: 200, step: 1 },
      { id: 'boardWidthIn', label: 'Actual Deck Board Width', type: 'number', unit: 'in', defaultValue: 5.5, min: 2, max: 12, step: 0.25 },
      { id: 'joistSpacingIn', label: 'Joist Spacing (12 / 16 / 24 in OC)', type: 'select', defaultValue: '16', options: [{ label: '16" On Center', value: '16' }, { label: '12" On Center', value: '12' }, { label: '24" On Center', value: '24' }] },
      { id: 'wastePct', label: 'Cut Waste Factor', type: 'number', unit: '%', defaultValue: 10, min: 0, max: 35, step: 2 },
    ],
    calculate: (v) => {
      const [len, depth, bw, jSp, waste] = [v.deckLengthFt, v.deckDepthFt, v.boardWidthIn, v.joistSpacingIn, v.wastePct].map(parseNum);
      if ([len, depth, bw, jSp, waste].some(Number.isNaN) || len <= 0 || depth <= 0 || bw <= 0 || jSp <= 0 || waste < 0) return calcError('All deck dimensions must be positive.');
      const area = len * depth;
      const effPitchFt = (bw + 0.125) / 12;
      const linearFtNeeded = (area / effPitchFt) * (1 + waste / 100);
      const boards12ft = Math.ceil(linearFtNeeded / 12);
      const joists = Math.ceil((len * 12) / jSp) + 1;
      const screws = Math.ceil(area * 3.5);
      return {
        primaryValue: fmt(linearFtNeeded, 0),
        primaryUnit: 'Linear Feet',
        primaryLabel: 'Total Decking Board Linear Feet',
        secondaryOutputs: [
          { label: '12-ft Deck Boards Equivalent', value: `${boards12ft} boards` },
          { label: 'Joists Required', value: `${joists} joists @ ${jSp}" OC` },
          { label: 'Hidden Clips / Deck Screws', value: `~${screws} fasteners` },
        ],
        steps: [`${area} ft² deck ÷ ${fmt(effPitchFt, 4)} ft spacing × (1+${waste}%) = ${fmt(linearFtNeeded, 0)} LF.`],
      };
    },
  },

  // 867. Fence Posts, Pickets & Concrete Bag Estimator
  {
    slug: 'fence-posts-pickets-concrete-calculator',
    title: 'Wood Fence Posts, Rails, Pickets & Concrete Bag Calculator',
    category: 'home-tech',
    formulaDisplay: 'Posts = ceil(Perimeter ÷ PostSpacing) + 1   |   Pickets = ceil(TotalInches ÷ PicketWidth)',
    inputs: [
      { id: 'fenceLengthFt', label: 'Total Fence Run', type: 'number', unit: 'ft', defaultValue: 160, min: 8, max: 50000, step: 8 },
      { id: 'postSpacingFt', label: 'Post Spacing (OC)', type: 'number', unit: 'ft', defaultValue: 8, min: 4, max: 12, step: 1 },
      { id: 'picketWidthIn', label: 'Picket Width', type: 'number', unit: 'in', defaultValue: 5.5, min: 2, max: 12, step: 0.25 },
      { id: 'railsPerBay', label: 'Horizontal Rails per Bay', type: 'number', defaultValue: 3, min: 2, max: 5, step: 1 },
      { id: 'concreteBagsPerPost', label: '50-lb Concrete Bags per Post', type: 'number', defaultValue: 2, min: 0, max: 10, step: 0.5 },
    ],
    calculate: (v) => {
      const [len, sp, pw, rails, bags] = [v.fenceLengthFt, v.postSpacingFt, v.picketWidthIn, v.railsPerBay, v.concreteBagsPerPost].map(parseNum);
      if ([len, sp, pw, rails, bags].some(Number.isNaN) || len <= 0 || sp <= 0 || pw <= 0 || rails <= 0 || bags < 0) return calcError('Fence length, spacing, and picket width must be positive.');
      const bays = Math.ceil(len / sp);
      const posts = bays + 1;
      const pickets = Math.ceil(((len * 12) / pw) * 1.05); // +5% spare
      const totalRails = bays * rails;
      const concreteBags = Math.ceil(posts * bags);
      return {
        primaryValue: posts,
        primaryUnit: '4×4 Posts',
        primaryLabel: 'Total Fence Posts Required',
        secondaryOutputs: [
          { label: 'Pickets (+5% spare)', value: `${pickets} pickets` },
          { label: 'Horizontal 2×4 Rails', value: `${totalRails} rails (${bays} bays)` },
          { label: '50-lb Concrete Mix Bags', value: `${concreteBags} bags` },
        ],
        steps: [`${bays} bays + 1 terminal post = ${posts} posts; ${pickets} pickets; ${concreteBags} bags concrete.`],
      };
    },
  },

  // 868. Wallpaper Rolls & Pattern Repeat Calculator
  {
    slug: 'wallpaper-rolls-pattern-repeat-calculator',
    title: 'Wallpaper Rolls & Pattern Match Repeat Calculator',
    category: 'home-tech',
    formulaDisplay: 'UsableDrops = floor(RollLength ÷ (WallHeight + Repeat + Trim)) | Drops = ceil(Width ÷ RollWidth)',
    inputs: [
      { id: 'wallWidthFt', label: 'Total Wall Width', type: 'number', unit: 'ft', defaultValue: 42, min: 1, max: 1000, step: 1 },
      { id: 'wallHeightFt', label: 'Wall Height', type: 'number', unit: 'ft', defaultValue: 9, min: 2, max: 30, step: 0.5 },
      { id: 'rollWidthIn', label: 'Roll Width', type: 'number', unit: 'in', defaultValue: 20.5, min: 10, max: 60, step: 0.5 },
      { id: 'rollLengthFt', label: 'Roll Length (Single/Double)', type: 'number', unit: 'ft', defaultValue: 33, min: 10, max: 200, step: 1 },
      { id: 'repeatIn', label: 'Vertical Pattern Repeat', type: 'number', unit: 'in', defaultValue: 18, min: 0, max: 60, step: 1 },
    ],
    calculate: (v) => {
      const [ww, wh, rw, rl, rep] = [v.wallWidthFt, v.wallHeightFt, v.rollWidthIn, v.rollLengthFt, v.repeatIn].map(parseNum);
      if ([ww, wh, rw, rl, rep].some(Number.isNaN) || ww <= 0 || wh <= 0 || rw <= 0 || rl <= 0 || rep < 0) return calcError('Wall and roll dimensions must be positive.');
      const totalDrops = Math.ceil((ww * 12) / rw);
      const cutLengthFt = wh + rep / 12 + 0.33; // +4in trim
      const dropsPerRoll = Math.floor(rl / cutLengthFt);
      if (dropsPerRoll < 1) return calcError('Roll length is shorter than one wall drop + repeat.');
      const rollsNeeded = Math.ceil(totalDrops / dropsPerRoll);
      return {
        primaryValue: rollsNeeded,
        primaryUnit: 'Rolls',
        primaryLabel: 'Wallpaper Rolls Required',
        secondaryOutputs: [
          { label: 'Vertical Strips (Drops)', value: `${totalDrops} strips` },
          { label: 'Cut Length per Drop', value: `${fmt(cutLengthFt, 2)} ft` },
          { label: 'Usable Drops per Roll', value: `${dropsPerRoll}` },
        ],
        steps: [`${totalDrops} drops ÷ ${dropsPerRoll} drops/roll = ${rollsNeeded} rolls.`],
      };
    },
  },

  // 869. Carpet & Hardwood Flooring Cost Estimator
  {
    slug: 'carpet-hardwood-flooring-estimator-calculator',
    title: 'Carpet (yd²) & Hardwood Flooring Boxes & Cost Estimator',
    category: 'home-tech',
    formulaDisplay: 'OrderArea = Length × Width × (1 + Waste%) | Carpet_yd² = OrderArea ÷ 9',
    inputs: [
      { id: 'lengthFt', label: 'Room Length', type: 'number', unit: 'ft', defaultValue: 18, min: 1, max: 1000, step: 1 },
      { id: 'widthFt', label: 'Room Width', type: 'number', unit: 'ft', defaultValue: 14, min: 1, max: 1000, step: 1 },
      { id: 'wastePct', label: 'Seam / Offcut Waste Allowance', type: 'number', unit: '%', defaultValue: 10, min: 0, max: 40, step: 2 },
      { id: 'boxSqFt', label: 'Hardwood Box Coverage (ft²)', type: 'number', unit: 'ft²', defaultValue: 20, min: 5, max: 100, step: 1 },
      { id: 'costPerSqFt', label: 'Installed Cost per ft²', type: 'number', prefix: '$', defaultValue: 6.50, min: 0, max: 500, step: 0.25 },
    ],
    calculate: (v) => {
      const [l, w, waste, box, cost] = [v.lengthFt, v.widthFt, v.wastePct, v.boxSqFt, v.costPerSqFt].map(parseNum);
      if ([l, w, waste, box, cost].some(Number.isNaN) || l <= 0 || w <= 0 || waste < 0 || box <= 0 || cost < 0) return calcError('Room dimensions and box coverage must be positive.');
      const netSqFt = l * w;
      const orderSqFt = netSqFt * (1 + waste / 100);
      const carpetYd2 = orderSqFt / 9;
      const boxes = Math.ceil(orderSqFt / box);
      return {
        primaryValue: fmt(orderSqFt, 1),
        primaryUnit: 'ft² (With Waste)',
        primaryLabel: 'Total Material Area to Order',
        secondaryOutputs: [
          { label: 'Carpet Square Yards', value: `${fmt(carpetYd2, 2)} yd²` },
          { label: 'Hardwood Boxes Required', value: `${boxes} boxes` },
          { label: 'Estimated Material/Install Cost', value: `$${fmt(orderSqFt * cost, 2)}` },
        ],
        steps: [`${netSqFt} ft² net × (1+${waste}%) = ${fmt(orderSqFt, 1)} ft² = ${fmt(carpetYd2, 2)} yd² (${boxes} boxes).`],
      };
    },
  },

  // 870. Brick, CMU Block & Mortar Masonry Calculator
  {
    slug: 'brick-block-mortar-masonry-calculator',
    title: 'Brick, Concrete Block (CMU) & Mortar Bag Estimator',
    category: 'home-tech',
    formulaDisplay: 'Standard Modular Brick = 6.75 bricks/ft² (⅜" joint) | Standard 8×8×16 CMU = 1.125 blocks/ft²',
    inputs: [
      { id: 'wallLengthFt', label: 'Wall Length', type: 'number', unit: 'ft', defaultValue: 30, min: 1, max: 5000, step: 1 },
      { id: 'wallHeightFt', label: 'Wall Height', type: 'number', unit: 'ft', defaultValue: 8, min: 1, max: 200, step: 0.5 },
      { id: 'masonryType', label: 'Masonry Unit', type: 'select', defaultValue: 'brick', options: [{ label: 'Standard Modular Brick (6.75 / ft²)', value: 'brick' }, { label: 'Queen Brick (5.76 / ft²)', value: 'queen' }, { label: 'CMU Concrete Block 8×8×16 (1.125 / ft²)', value: 'cmu' }] },
      { id: 'wastePct', label: 'Breakage Waste Factor', type: 'number', unit: '%', defaultValue: 5, min: 0, max: 25, step: 1 },
    ],
    calculate: (v) => {
      const [l, h, w] = [v.wallLengthFt, v.wallHeightFt, v.wastePct].map(parseNum);
      const rates: Record<string, { perSqFt: number; bagsPer100: number; label: string }> = {
        brick: { perSqFt: 6.75, bagsPer100: 3.3, label: 'Modular Bricks' },
        queen: { perSqFt: 5.76, bagsPer100: 3.5, label: 'Queen Bricks' },
        cmu: { perSqFt: 1.125, bagsPer100: 8.5, label: '8×8×16 CMU Blocks' },
      };
      const cfg = rates[v.masonryType];
      if (Number.isNaN(l) || Number.isNaN(h) || Number.isNaN(w) || l <= 0 || h <= 0 || w < 0 || !cfg) return calcError('Enter positive wall dimensions and valid masonry unit.');
      const area = l * h;
      const units = Math.ceil(area * cfg.perSqFt * (1 + w / 100));
      const mortarBags = Math.ceil((units / 100) * cfg.bagsPer100);
      return {
        primaryValue: units,
        primaryUnit: cfg.label,
        primaryLabel: 'Total Masonry Units',
        secondaryOutputs: [
          { label: 'Net Wall Area', value: `${fmt(area, 1)} ft²` },
          { label: 'Type N/S Mortar (80-lb bags)', value: `${mortarBags} bags` },
        ],
        steps: [`${fmt(area, 1)} ft² × ${cfg.perSqFt}/ft² × (1+${w}%) = ${units} units + ${mortarBags} bags mortar.`],
      };
    },
  },

  // 871. Asphalt Paving Tonnage & Driveway Cost Calculator
  {
    slug: 'asphalt-paving-tonnage-driveway-calculator',
    title: 'Hot-Mix Asphalt Tonnage & Driveway Cost Calculator',
    category: 'home-tech',
    formulaDisplay: 'Tons = [Area_ft² × (Thickness_in ÷ 12) × 145 lb/ft³ (compacted)] ÷ 2,000',
    inputs: [
      { id: 'lengthFt', label: 'Driveway Length', type: 'number', unit: 'ft', defaultValue: 60, min: 5, max: 50000, step: 5 },
      { id: 'widthFt', label: 'Driveway Width', type: 'number', unit: 'ft', defaultValue: 18, min: 4, max: 500, step: 1 },
      { id: 'thicknessIn', label: 'Compacted Thickness', type: 'number', unit: 'in', defaultValue: 3.0, min: 1, max: 18, step: 0.5 },
      { id: 'pricePerTon', label: 'Installed Price per Short Ton', type: 'number', prefix: '$', defaultValue: 135, min: 0, max: 2000, step: 5 },
    ],
    calculate: (v) => {
      const [l, w, t, p] = [v.lengthFt, v.widthFt, v.thicknessIn, v.pricePerTon].map(parseNum);
      if ([l, w, t, p].some(Number.isNaN) || l <= 0 || w <= 0 || t <= 0 || p < 0) return calcError('Dimensions and thickness must be positive.');
      const area = l * w;
      const cuFt = area * (t / 12);
      const tons = (cuFt * 145) / 2000;
      const cost = tons * p;
      return {
        primaryValue: fmt(tons, 2),
        primaryUnit: 'Short Tons',
        primaryLabel: 'Hot-Mix Asphalt Tonnage (145 lb/ft³)',
        secondaryOutputs: [
          { label: 'Compacted Volume', value: `${fmt(cuFt / 27, 2)} yd³` },
          { label: 'Paved Surface Area', value: `${fmt(area, 0)} ft²` },
          { label: 'Estimated Installed Cost', value: `$${fmt(cost, 2)}` },
        ],
        steps: [`${area} ft² × (${t}/12) ft × 145 lb/ft³ ÷ 2,000 = ${fmt(tons, 2)} tons.`],
      };
    },
  },

  // 872. Topsoil, Lawn Seed & Fertilizer Coverage Calculator
  {
    slug: 'topsoil-lawn-seed-fertilizer-calculator',
    title: 'Lawn Seeding, Starter Fertilizer & Topsoil Dressing Calculator',
    category: 'home-tech',
    formulaDisplay: 'Seed (lb) = (Area_ft² ÷ 1,000) × Rate_lb   |   Fertilizer N = (Area ÷ 1,000) × N_lb ÷ (N% / 100)',
    inputs: [
      { id: 'lawnSqFt', label: 'Lawn Area', type: 'number', unit: 'ft²', defaultValue: 5000, min: 50, max: 1e7, step: 250 },
      { id: 'projectType', label: 'Seeding Mode', type: 'select', defaultValue: 'new', options: [{ label: 'New Lawn Seeding (~8 lb / 1,000 ft²)', value: 'new' }, { label: 'Overseeding (~4 lb / 1,000 ft²)', value: 'overseed' }] },
      { id: 'fertilizerNPct', label: 'Fertilizer Nitrogen % (First Bag Number)', type: 'number', unit: '%', defaultValue: 24, min: 1, max: 50, step: 1 },
      { id: 'topdressIn', label: 'Topsoil Dressing Depth', type: 'number', unit: 'in', defaultValue: 0.5, min: 0, max: 12, step: 0.25 },
    ],
    calculate: (v) => {
      const [area, nPct, td] = [v.lawnSqFt, v.fertilizerNPct, v.topdressIn].map(parseNum);
      if ([area, nPct, td].some(Number.isNaN) || area <= 0 || nPct <= 0 || nPct > 100 || td < 0 || !['new', 'overseed'].includes(v.projectType)) {
        return calcError('Lawn area and fertilizer N% must be positive.');
      }
      const kSqFt = area / 1000;
      const seedRate = v.projectType === 'new' ? 8 : 4;
      const seedLb = kSqFt * seedRate;
      const fertBagLb = (kSqFt * 1.0) / (nPct / 100); // 1 lb actual N per 1,000 ft²
      const topsoilYd3 = (area * (td / 12)) / 27;
      return {
        primaryValue: fmt(seedLb, 1),
        primaryUnit: 'lb Grass Seed',
        primaryLabel: 'Grass Seed Weight Needed',
        secondaryOutputs: [
          { label: `Fertilizer Product (1 lb N/1k ft² @ ${nPct}% N)`, value: `${fmt(fertBagLb, 1)} lb` },
          { label: 'Topsoil Dressing Volume', value: `${fmt(topsoilYd3, 2)} yd³` },
        ],
        steps: [`${kSqFt} × ${seedRate} lb = ${fmt(seedLb, 1)} lb seed; ${fmt(fertBagLb, 1)} lb fertilizer.`],
      };
    },
  },

  // 873. Rainwater Harvesting Roof Catchment Calculator
  {
    slug: 'rainwater-harvesting-roof-catchment-calculator',
    title: 'Rainwater Harvesting Roof Catchment & Cistern Yield Calculator',
    category: 'home-tech',
    formulaDisplay: 'Harvest_Gal = RoofFootprint_ft² × Rain_in × 0.62338 gal/(ft²·in) × RunoffCoeff',
    inputs: [
      { id: 'roofAreaSqFt', label: 'Horizontal Roof Catchment Area', type: 'number', unit: 'ft²', defaultValue: 2000, min: 50, max: 1e6, step: 100 },
      { id: 'annualRainIn', label: 'Annual Rainfall Depth', type: 'number', unit: 'in/yr', defaultValue: 38, min: 0.1, max: 400, step: 1 },
      { id: 'runoffCoeff', label: 'Roof Runoff Coefficient (Metal 0.90 / Shingle 0.80)', type: 'number', defaultValue: 0.85, min: 0.1, max: 1.0, step: 0.05 },
    ],
    calculate: (v) => {
      const [area, rain, c] = [v.roofAreaSqFt, v.annualRainIn, v.runoffCoeff].map(parseNum);
      if ([area, rain, c].some(Number.isNaN) || area <= 0 || rain <= 0 || c <= 0 || c > 1) return calcError('Enter positive roof area, rainfall, and runoff coefficient <= 1.');
      const gal = area * rain * 0.62338 * c;
      const liters = gal * 3.785411784;
      const monthlyAvgGal = gal / 12;
      return {
        primaryValue: fmt(gal, 0),
        primaryUnit: 'US Gallons / yr',
        primaryLabel: 'Harvestable Annual Rainwater',
        secondaryOutputs: [
          { label: 'Metric Liters / Year', value: `${fmt(liters, 0)} L (${fmt(liters / 1000, 1)} m³)` },
          { label: 'Average Monthly Yield', value: `${fmt(monthlyAvgGal, 0)} gal/mo` },
        ],
        steps: [`${area} ft² × ${rain}" × 0.62338 × ${c} = ${fmt(gal, 0)} gal/yr.`],
      };
    },
  },

  // 874. Swimming Pool Volume & Chlorine Dosing Calculator
  {
    slug: 'pool-volume-chlorine-chemical-calculator',
    title: 'Swimming Pool Volume, Turnover Flow & Chlorine Calculator',
    category: 'home-tech',
    formulaDisplay: 'Pool_Gal = Length × Width × AvgDepth × 7.48052 gal/ft³',
    inputs: [
      { id: 'lengthFt', label: 'Pool Length', type: 'number', unit: 'ft', defaultValue: 32, min: 4, max: 500, step: 1 },
      { id: 'widthFt', label: 'Pool Width', type: 'number', unit: 'ft', defaultValue: 16, min: 4, max: 500, step: 1 },
      { id: 'shallowFt', label: 'Shallow End Depth', type: 'number', unit: 'ft', defaultValue: 3.5, min: 1, max: 20, step: 0.5 },
      { id: 'deepFt', label: 'Deep End Depth', type: 'number', unit: 'ft', defaultValue: 6.5, min: 1, max: 30, step: 0.5 },
      { id: 'targetPpmBoost', label: 'Target Free Chlorine Boost (ppm)', type: 'number', unit: 'ppm', defaultValue: 3, min: 0, max: 30, step: 0.5 },
    ],
    calculate: (v) => {
      const [l, w, s, d, ppm] = [v.lengthFt, v.widthFt, v.shallowFt, v.deepFt, v.targetPpmBoost].map(parseNum);
      if ([l, w, s, d, ppm].some(Number.isNaN) || l <= 0 || w <= 0 || s <= 0 || d <= 0 || ppm < 0) return calcError('Pool dimensions must be positive.');
      const avgD = (s + d) / 2;
      const gal = l * w * avgD * 7.480519;
      const liters = gal * 3.78541;
      const gpm8hr = gal / 480;
      // 10% liquid sodium hypochlorite: ~1.3 fl oz per 1,000 gal raises FC by 1 ppm
      const bleachOz = (gal / 1000) * ppm * 1.3;
      return {
        primaryValue: fmt(gal, 0),
        primaryUnit: 'US Gallons',
        primaryLabel: 'Total Swimming Pool Volume',
        secondaryOutputs: [
          { label: 'Metric Volume', value: `${fmt(liters, 0)} L (${fmt(liters / 1000, 1)} m³)` },
          { label: '8-Hour Pump Turnover Flow', value: `${fmt(gpm8hr, 1)} GPM` },
          { label: `10% Liquid Chlorine (+${ppm} ppm)`, value: `${fmt(bleachOz, 1)} fl oz (${fmt(bleachOz / 128, 2)} gal)` },
        ],
        steps: [`${l}×${w}×${avgD} avg ft × 7.48052 = ${fmt(gal, 0)} gal.`],
      };
    },
  },

  // 875. Air Conditioner SEER / SEER2 Upgrade Savings Calculator
  {
    slug: 'air-conditioner-seers-annual-savings-calculator',
    title: 'Air Conditioner SEER2 Efficiency Upgrade & Payback Calculator',
    category: 'home-tech',
    formulaDisplay: 'Annual_kWh = (BTU/hr × CoolingHours) ÷ (SEER2 × 1,000)',
    inputs: [
      { id: 'coolingTons', label: 'AC System Tonnage (1 Ton = 12,000 BTU/hr)', type: 'number', unit: 'Tons', defaultValue: 3.5, min: 0.5, max: 100, step: 0.5 },
      { id: 'oldSeer', label: 'Existing Unit SEER / SEER2', type: 'number', defaultValue: 10, min: 5, max: 35, step: 0.5 },
      { id: 'newSeer', label: 'New Unit SEER2 Rating', type: 'number', defaultValue: 18, min: 8, max: 40, step: 0.5 },
      { id: 'coolingHoursYr', label: 'Full-Load Cooling Hours / Year', type: 'number', unit: 'hrs/yr', defaultValue: 1400, min: 100, max: 8760, step: 100 },
      { id: 'elecRate', label: 'Electricity Rate', type: 'number', prefix: '$', unit: '/kWh', defaultValue: 0.17, min: 0.01, max: 5, step: 0.01 },
      { id: 'upgradePremium', label: 'Incremental Upgrade Price', type: 'number', prefix: '$', defaultValue: 2200, min: 0, max: 100000, step: 100 },
    ],
    calculate: (v) => {
      const [tons, sOld, sNew, hrs, rate, prem] = [v.coolingTons, v.oldSeer, v.newSeer, v.coolingHoursYr, v.elecRate, v.upgradePremium].map(parseNum);
      if ([tons, sOld, sNew, hrs, rate, prem].some(Number.isNaN) || tons <= 0 || sOld <= 0 || sNew <= 0 || hrs <= 0 || rate <= 0 || prem < 0) {
        return calcError('Tonnage, SEER ratings, hours, and rate must be positive.');
      }
      const btu = tons * 12000;
      const oldKwh = (btu * hrs) / (sOld * 1000);
      const newKwh = (btu * hrs) / (sNew * 1000);
      const savedKwh = oldKwh - newKwh;
      const annualSavings = savedKwh * rate;
      const payback = annualSavings > 0 ? prem / annualSavings : 0;
      return {
        primaryValue: fmt(annualSavings, 2),
        primaryUnit: '$/year',
        primaryLabel: 'Annual Cooling Electricity Savings',
        secondaryOutputs: [
          { label: 'Old vs New Cooling Energy', value: `${fmt(oldKwh, 0)} → ${fmt(newKwh, 0)} kWh/yr` },
          { label: 'Annual kWh Reduction', value: `${fmt(savedKwh, 0)} kWh (${fmt((1 - sOld / sNew) * 100, 1)}%)` },
          { label: 'Simple Upgrade Payback', value: annualSavings > 0 ? `${fmt(payback, 1)} years` : 'No savings' },
        ],
        steps: [`${fmt(oldKwh, 0)} − ${fmt(newKwh, 0)} = ${fmt(savedKwh, 0)} kWh saved × $${rate} = $${fmt(annualSavings, 2)}/yr.`],
      };
    },
  },

  // 876. Heat Pump Water Heater ROI & UEF Calculator
  {
    slug: 'heat-pump-water-heater-roi-calculator',
    title: 'Heat Pump Water Heater (HPWH) vs Electric Tank ROI Calculator',
    category: 'home-tech',
    formulaDisplay: 'Annual_kWh = (DailyGal × 365 × 8.34 × ΔT × 0.00029307) ÷ UEF',
    inputs: [
      { id: 'dailyHotGal', label: 'Daily Hot Water Usage', type: 'number', unit: 'gal/day', defaultValue: 65, min: 5, max: 5000, step: 5 },
      { id: 'tempRiseF', label: 'Water Temp Rise (Inlet → Setpoint)', type: 'number', unit: '°F', defaultValue: 65, min: 10, max: 120, step: 5 },
      { id: 'oldUef', label: 'Standard Electric Tank UEF', type: 'number', defaultValue: 0.92, min: 0.4, max: 1.5, step: 0.02 },
      { id: 'hpUef', label: 'Heat Pump Water Heater UEF', type: 'number', defaultValue: 3.75, min: 1.5, max: 6.0, step: 0.1 },
      { id: 'elecRate', label: 'Electricity Rate', type: 'number', prefix: '$', unit: '/kWh', defaultValue: 0.17, min: 0.01, max: 5, step: 0.01 },
      { id: 'netInstallCost', label: 'Net Upgrade Cost After Tax Credit', type: 'number', prefix: '$', defaultValue: 1650, min: 0, max: 50000, step: 50 },
    ],
    calculate: (v) => {
      const [gal, dt, uOld, uNew, rate, net] = [v.dailyHotGal, v.tempRiseF, v.oldUef, v.hpUef, v.elecRate, v.netInstallCost].map(parseNum);
      if ([gal, dt, uOld, uNew, rate, net].some(Number.isNaN) || gal <= 0 || dt <= 0 || uOld <= 0 || uNew <= 0 || rate <= 0 || net < 0) {
        return calcError('All water heater usage and efficiency parameters must be positive.');
      }
      const thermalKwhYr = (gal * 365 * 8.34 * dt) / 3412.1416;
      const oldKwh = thermalKwhYr / uOld;
      const newKwh = thermalKwhYr / uNew;
      const annualSavings = (oldKwh - newKwh) * rate;
      const payback = annualSavings > 0 ? net / annualSavings : 0;
      return {
        primaryValue: fmt(annualSavings, 2),
        primaryUnit: '$/year',
        primaryLabel: 'Annual Water Heating Savings',
        secondaryOutputs: [
          { label: 'Old Tank vs HPWH Consumption', value: `${fmt(oldKwh, 0)} vs ${fmt(newKwh, 0)} kWh/yr` },
          { label: 'Payback Period', value: annualSavings > 0 ? `${fmt(payback, 1)} years` : 'N/A' },
          { label: '10-Year Cumulative Net', value: `$${fmt(annualSavings * 10 - net, 0)}` },
        ],
        steps: [`Thermal demand ${fmt(thermalKwhYr, 0)} kWh/yr; saving ${fmt(oldKwh - newKwh, 0)} kWh/yr = $${fmt(annualSavings, 2)}/yr.`],
      };
    },
  },

  // 877. Standby Phantom Load & Idle Wattage Cost Calculator
  {
    slug: 'standby-wattage-cost-efficiency-calculator',
    title: 'Standby Phantom Power Cost & Idle Wattage Calculator',
    category: 'home-tech',
    formulaDisplay: 'Annual_kWh = (Watts × IdleHoursPerDay × 365) ÷ 1,000',
    inputs: [
      { id: 'idleWatts', label: 'Measured Standby / Idle Draw', type: 'number', unit: 'W', defaultValue: 45, min: 0.1, max: 50000, step: 5 },
      { id: 'idleHoursDay', label: 'Idle Hours per Day', type: 'number', unit: 'hrs', defaultValue: 20, min: 0, max: 24, step: 1 },
      { id: 'elecRate', label: 'Utility Electricity Rate', type: 'number', prefix: '$', unit: '/kWh', defaultValue: 0.17, min: 0.01, max: 5, step: 0.01 },
    ],
    calculate: (v) => {
      const [w, h, r] = [v.idleWatts, v.idleHoursDay, v.elecRate].map(parseNum);
      if ([w, h, r].some(Number.isNaN) || w <= 0 || h < 0 || h > 24 || r <= 0) return calcError('Watts and rate must be positive; hours 0–24.');
      const kwhYr = (w * h * 365) / 1000;
      const costYr = kwhYr * r;
      return {
        primaryValue: fmt(costYr, 2),
        primaryUnit: '$/year',
        primaryLabel: 'Annual Standby Electricity Cost',
        secondaryOutputs: [
          { label: 'Annual Wasted Energy', value: `${fmt(kwhYr, 1)} kWh/yr` },
          { label: 'Monthly Bill Share', value: `$${fmt(costYr / 12, 2)}/mo` },
          { label: 'Est. CO₂ Emissions (~0.386 kg/kWh)', value: `${fmt(kwhYr * 0.386, 1)} kg CO₂/yr` },
        ],
        steps: [`${w} W × ${h} hrs × 365 ÷ 1,000 = ${fmt(kwhYr, 1)} kWh/yr × $${r} = $${fmt(costYr, 2)}/yr.`],
      };
    },
  },

  // 878. Solar Battery Storage Backup Sizing Calculator
  {
    slug: 'solar-battery-backup-sizing-calculator',
    title: 'Solar Home Battery Backup Bank Sizing Calculator (LiFePO4 / Lithium)',
    category: 'home-tech',
    formulaDisplay: 'Nameplate_kWh = (DailyLoad_kWh × AutonomyDays) ÷ (DoD × InverterEfficiency)',
    inputs: [
      { id: 'dailyCriticalKwh', label: 'Daily Critical Backup Load', type: 'number', unit: 'kWh/day', defaultValue: 18, min: 0.5, max: 1000, step: 1 },
      { id: 'autonomyDays', label: 'Days of Outage Autonomy', type: 'number', unit: 'days', defaultValue: 1.5, min: 0.25, max: 14, step: 0.25 },
      { id: 'dodPct', label: 'Max Depth of Discharge (LiFePO4 ~90%)', type: 'number', unit: '%', defaultValue: 90, min: 20, max: 100, step: 5 },
      { id: 'invEffPct', label: 'Inverter Round-Trip Efficiency', type: 'number', unit: '%', defaultValue: 92, min: 50, max: 100, step: 1 },
    ],
    calculate: (v) => {
      const [kwh, days, dod, eff] = [v.dailyCriticalKwh, v.autonomyDays, v.dodPct, v.invEffPct].map(parseNum);
      if ([kwh, days, dod, eff].some(Number.isNaN) || kwh <= 0 || days <= 0 || dod <= 0 || dod > 100 || eff <= 0 || eff > 100) {
        return calcError('Critical kWh and autonomy must be positive; percentages 1–100%.');
      }
      const usableNeeded = kwh * days;
      const nameplateKwh = usableNeeded / ((dod / 100) * (eff / 100));
      const ah48v = (nameplateKwh * 1000) / 48;
      return {
        primaryValue: fmt(nameplateKwh, 2),
        primaryUnit: 'kWh (Nameplate)',
        primaryLabel: 'Recommended Battery Storage Bank',
        secondaryOutputs: [
          { label: 'Usable Energy Needed', value: `${fmt(usableNeeded, 2)} kWh` },
          { label: '48V Rack Equivalent Capacity', value: `${fmt(ah48v, 0)} Ah @ 48V` },
          { label: '13.5 kWh Home Units Needed', value: `${Math.ceil(nameplateKwh / 13.5)} units` },
        ],
        steps: [`${fmt(usableNeeded, 2)} kWh ÷ (${dod}% × ${eff}%) = ${fmt(nameplateKwh, 2)} kWh.`],
      };
    },
  },

  // 879. LED Lighting Lumens, Fixture Count & Retrofit Savings
  {
    slug: 'led-lighting-lumens-room-upgrade-calculator',
    title: 'LED Room Lumens, Bulb Count & Halogens Retrofit Savings Calculator',
    category: 'home-tech',
    formulaDisplay: 'Lumens = RoomSqFt × TargetFootCandles   |   AnnualSaved$ = (ΔWatts × Fixtures × Hrs × 365 ÷ 1000) × Rate',
    inputs: [
      { id: 'roomSqFt', label: 'Room Floor Area', type: 'number', unit: 'ft²', defaultValue: 320, min: 10, max: 100000, step: 20 },
      { id: 'targetFc', label: 'Target Illuminance (Living 20fc / Kitchen 40fc / Office 50fc)', type: 'number', unit: 'fc', defaultValue: 35, min: 5, max: 200, step: 5 },
      { id: 'bulbLumens', label: 'Lumens per LED Bulb', type: 'number', unit: 'lm', defaultValue: 800, min: 100, max: 50000, step: 100 },
      { id: 'oldWatts', label: 'Old Incandescent/Halogen Watts per Bulb', type: 'number', unit: 'W', defaultValue: 60, min: 5, max: 1000, step: 5 },
      { id: 'ledWatts', label: 'LED Replacement Watts per Bulb', type: 'number', unit: 'W', defaultValue: 9, min: 1, max: 500, step: 1 },
      { id: 'hoursDay', label: 'Daily Operating Hours', type: 'number', unit: 'hrs/day', defaultValue: 5, min: 0.5, max: 24, step: 0.5 },
      { id: 'elecRate', label: 'Electricity Rate', type: 'number', prefix: '$', unit: '/kWh', defaultValue: 0.17, min: 0.01, max: 5, step: 0.01 },
    ],
    calculate: (v) => {
      const [sqft, fc, lm, ow, lw, hrs, rate] = [v.roomSqFt, v.targetFc, v.bulbLumens, v.oldWatts, v.ledWatts, v.hoursDay, v.elecRate].map(parseNum);
      if ([sqft, fc, lm, ow, lw, hrs, rate].some(Number.isNaN) || sqft <= 0 || fc <= 0 || lm <= 0 || ow <= 0 || lw <= 0 || hrs <= 0 || rate <= 0) {
        return calcError('All lighting dimensions, wattage, and rates must be positive.');
      }
      const totalLumens = sqft * fc;
      const bulbs = Math.ceil(totalLumens / lm);
      const savedWatts = Math.max(0, ow - lw) * bulbs;
      const annualSavedKwh = (savedWatts * hrs * 365) / 1000;
      const annualSavedDollars = annualSavedKwh * rate;
      return {
        primaryValue: bulbs,
        primaryUnit: 'LED Bulbs',
        primaryLabel: `Fixtures Needed (${fmt(totalLumens, 0)} lm total)`,
        secondaryOutputs: [
          { label: 'Total Required Lumens', value: `${fmt(totalLumens, 0)} lm` },
          { label: 'Annual Energy Saved', value: `${fmt(annualSavedKwh, 1)} kWh/yr` },
          { label: 'Annual Electricity Savings', value: `$${fmt(annualSavedDollars, 2)}/yr` },
        ],
        steps: [`${sqft} ft² × ${fc} fc = ${totalLumens} lm → ${bulbs} LED bulbs saving ${fmt(annualSavedKwh, 1)} kWh/yr.`],
      };
    },
  },

  // 880. Home Theater Screen Size & THX / SMPTE Viewing Distance
  {
    slug: 'home-theater-screen-viewing-distance-calculator',
    title: 'Home Theater 4K Screen Size & THX / SMPTE Viewing Distance Calculator',
    category: 'home-tech',
    formulaDisplay: 'Width = Diag × 16 / √337   |   40° THX FOV Dist = (Width / 2) / tan(20°)',
    inputs: [
      { id: 'diagIn', label: '16:9 Screen Diagonal Size', type: 'number', unit: 'in', defaultValue: 75, min: 20, max: 300, step: 5 },
    ],
    calculate: (v) => {
      const diag = parseNum(v.diagIn);
      if (Number.isNaN(diag) || diag < 20 || diag > 300) return calcError('Diagonal screen size must be 20–300 inches.');
      const widthIn = (diag * 16) / Math.sqrt(337);
      const heightIn = (diag * 9) / Math.sqrt(337);
      const smpte30Ft = widthIn / 2 / Math.tan((15 * Math.PI) / 180) / 12;
      const thx40Ft = widthIn / 2 / Math.tan((20 * Math.PI) / 180) / 12;
      return {
        primaryValue: fmt(thx40Ft, 2),
        primaryUnit: 'ft (THX Cinema 40°)',
        primaryLabel: 'Recommended 40° FOV Seating Distance',
        secondaryOutputs: [
          { label: 'SMPTE 30° Mixed-Use Distance', value: `${fmt(smpte30Ft, 2)} ft` },
          { label: 'Screen Dimensions (16:9)', value: `${fmt(widthIn, 1)}" W × ${fmt(heightIn, 1)}" H` },
        ],
        steps: [`${diag}" 16:9 screen = ${fmt(widthIn, 1)}" wide → THX 40° = ${fmt(thx40Ft, 2)} ft; SMPTE 30° = ${fmt(smpte30Ft, 2)} ft.`],
      };
    },
  },

  // 881. Camera FOV, Depth of Field & Hyperfocal Distance Calculator
  {
    slug: 'camera-fov-depth-of-field-hyperfocal-calculator',
    title: 'Camera Depth of Field, Field of View & Hyperfocal Distance Calculator',
    category: 'home-tech',
    formulaDisplay: 'H = f² / (N · c) + f   |   Near = s(H − f) / (H + s − 2f)',
    inputs: [
      { id: 'focalMm', label: 'Lens Focal Length (f)', type: 'number', unit: 'mm', defaultValue: 50, min: 4, max: 2000, step: 5 },
      { id: 'fStop', label: 'Aperture f-Number (N)', type: 'number', prefix: 'f/', defaultValue: 2.8, min: 0.7, max: 64, step: 0.2 },
      { id: 'subjectMeters', label: 'Subject Focus Distance (s)', type: 'number', unit: 'm', defaultValue: 5, min: 0.1, max: 10000, step: 0.5 },
      { id: 'sensorType', label: 'Sensor Format (Circle of Confusion)', type: 'select', defaultValue: 'ff', options: [{ label: 'Full Frame 36×24mm (CoC 0.030mm)', value: 'ff' }, { label: 'APS-C 1.5x (CoC 0.020mm)', value: 'apsc' }, { label: 'Micro Four Thirds 2x (CoC 0.015mm)', value: 'mft' }] },
    ],
    calculate: (v) => {
      const [f, n, s] = [v.focalMm, v.fStop, v.subjectMeters].map(parseNum);
      const sensors: Record<string, { coc: number; w: number }> = { ff: { coc: 0.030, w: 36 }, apsc: { coc: 0.020, w: 23.6 }, mft: { coc: 0.015, w: 17.3 } };
      const cfg = sensors[v.sensorType];
      if ([f, n, s].some(Number.isNaN) || f <= 0 || n <= 0 || s <= 0 || !cfg) return calcError('Focal length, aperture, and subject distance must be positive.');
      const sMm = s * 1000;
      const hMm = (f * f) / (n * cfg.coc) + f;
      const nearM = (sMm * (hMm - f)) / (hMm + sMm - 2 * f) / 1000;
      const farM = sMm >= hMm - f ? Infinity : (sMm * (hMm - f)) / (hMm - sMm) / 1000;
      const totalDofM = Number.isFinite(farM) ? farM - nearM : Infinity;
      const hfovDeg = (2 * Math.atan(cfg.w / (2 * f)) * 180) / Math.PI;
      return {
        primaryValue: Number.isFinite(totalDofM) ? fmt(totalDofM, 2) : 'Hyperfocal (Unbounded)',
        primaryUnit: 'meters (Total DoF)',
        primaryLabel: 'Depth of Field Zone',
        secondaryOutputs: [
          { label: 'Hyperfocal Distance', value: `${fmt(hMm / 1000, 2)} m` },
          { label: 'Near Focus Limit', value: `${fmt(nearM, 2)} m` },
          { label: 'Far Focus Limit', value: Number.isFinite(farM) ? `${fmt(farM, 2)} m` : '∞ (Hyperfocal Limit)' },
          { label: 'Horizontal Field of View', value: `${fmt(hfovDeg, 1)}°` },
        ],
        steps: [`H = ${fmt(hMm / 1000, 2)} m; Near = ${fmt(nearM, 2)} m; Far = ${Number.isFinite(farM) ? fmt(farM, 2) + ' m' : '∞ (Hyperfocal)'}.`],
      };
    },
  },

  // 882. 3D Printing Filament Cost, Length & Print Job Estimator
  {
    slug: '3d-printing-filament-cost-weight-calculator',
    title: '3D Printing Filament Cost, Spool Weight & Print Job Pricing Calculator',
    category: 'home-tech',
    formulaDisplay: 'MaterialCost = (PartGrams ÷ SpoolGrams) × SpoolCost   |   Length_m = Weight_g ÷ (ρ × πr²)',
    inputs: [
      { id: 'partGrams', label: 'Sliced Filament Weight', type: 'number', unit: 'g', defaultValue: 145, min: 0.1, max: 100000, step: 5 },
      { id: 'spoolPrice', label: 'Spool Cost (1 kg / 1,000 g)', type: 'number', prefix: '$', defaultValue: 22, min: 1, max: 1000, step: 1 },
      { id: 'printHours', label: 'Estimated Print Time', type: 'number', unit: 'hrs', defaultValue: 6.5, min: 0.1, max: 500, step: 0.5 },
      { id: 'printerWatts', label: 'Average Printer Power', type: 'number', unit: 'W', defaultValue: 130, min: 10, max: 3000, step: 10 },
      { id: 'elecRate', label: 'Electricity Rate', type: 'number', prefix: '$', unit: '/kWh', defaultValue: 0.17, min: 0, max: 5, step: 0.01 },
      { id: 'materialType', label: 'Filament Polymer (1.75mm)', type: 'select', defaultValue: 'pla', options: [{ label: 'PLA (1.24 g/cm³)', value: 'pla' }, { label: 'PETG (1.27 g/cm³)', value: 'petg' }, { label: 'ABS (1.04 g/cm³)', value: 'abs' }] },
    ],
    calculate: (v) => {
      const [g, sp, hrs, w, rate] = [v.partGrams, v.spoolPrice, v.printHours, v.printerWatts, v.elecRate].map(parseNum);
      const densities: Record<string, number> = { pla: 1.24, petg: 1.27, abs: 1.04 };
      const rho = densities[v.materialType];
      if ([g, sp, hrs, w, rate].some(Number.isNaN) || g <= 0 || sp <= 0 || hrs <= 0 || w <= 0 || rate < 0 || !rho) return calcError('Enter positive print weight, spool cost, hours, and wattage.');
      const matCost = (g / 1000) * sp;
      const elecCost = ((w * hrs) / 1000) * rate;
      const totalDirectCost = matCost + elecCost;
      const areaMm2 = Math.PI * 0.875 * 0.875; // 1.75mm diam -> r = 0.875mm
      const lengthMeters = (g / rho) / (areaMm2 * 0.001) / 1000;
      return {
        primaryValue: fmt(totalDirectCost, 2),
        primaryUnit: 'USD',
        primaryLabel: 'Total Direct Print Cost (Filament + Power)',
        secondaryOutputs: [
          { label: 'Filament Cost', value: `$${fmt(matCost, 2)}` },
          { label: 'Electricity Cost', value: `$${fmt(elecCost, 2)}` },
          { label: 'Filament Length Used (1.75mm)', value: `${fmt(lengthMeters, 1)} m` },
        ],
        steps: [`Filament $${fmt(matCost, 2)} + Electricity $${fmt(elecCost, 2)} = $${fmt(totalDirectCost, 2)} (${fmt(lengthMeters, 1)} m).`],
      };
    },
  },

  // 883. CNC Machining Feeds, Speeds (RPM) & Chip Load Calculator
  {
    slug: 'cnc-feeds-speeds-chipload-calculator',
    title: 'CNC Milling Feeds, Spindle Speed (RPM) & Feed Rate (IPM/mm·min) Calculator',
    category: 'home-tech',
    formulaDisplay: 'RPM = (SFM × 3.8197) ÷ ToolDia_in   |   Feed (IPM) = RPM × Flutes × ChipLoad',
    inputs: [
      { id: 'sfm', label: 'Surface Speed (SFM — Alum ~400, Steel ~100, Wood ~600)', type: 'number', unit: 'SFM', defaultValue: 350, min: 10, max: 5000, step: 25 },
      { id: 'toolDiaIn', label: 'End Mill Cutter Diameter', type: 'number', unit: 'in', defaultValue: 0.25, min: 0.01, max: 12, step: 0.0625 },
      { id: 'flutes', label: 'Number of Flutes (z)', type: 'number', defaultValue: 3, min: 1, max: 12, step: 1 },
      { id: 'chipLoadIn', label: 'Target Chip Load per Tooth', type: 'number', unit: 'in/tooth', defaultValue: 0.0025, min: 0.0001, max: 0.1, step: 0.0005 },
    ],
    calculate: (v) => {
      const [sfm, dia, z, fz] = [v.sfm, v.toolDiaIn, v.flutes, v.chipLoadIn].map(parseNum);
      if ([sfm, dia, z, fz].some(Number.isNaN) || sfm <= 0 || dia <= 0 || z < 1 || fz <= 0) return calcError('All CNC cutting parameters must be positive.');
      const rpm = (sfm * 12) / (Math.PI * dia);
      const feedIpm = rpm * z * fz;
      const feedMmMin = feedIpm * 25.4;
      return {
        primaryValue: fmt(rpm, 0),
        primaryUnit: 'RPM',
        primaryLabel: 'Spindle Speed',
        secondaryOutputs: [
          { label: 'Feed Rate (IPM)', value: `${fmt(feedIpm, 1)} in/min` },
          { label: 'Feed Rate (Metric)', value: `${fmt(feedMmMin, 0)} mm/min` },
        ],
        steps: [`RPM = (${sfm} × 12) ÷ (π × ${dia}) = ${fmt(rpm, 0)} RPM; Feed = ${fmt(feedIpm, 1)} IPM.`],
      };
    },
  },

  // 884. UPS Battery Backup Runtime & VA Sizing Calculator
  {
    slug: 'ups-battery-runtime-va-watts-calculator',
    title: 'UPS Uninterruptible Power Supply Runtime & VA Sizing Calculator',
    category: 'home-tech',
    formulaDisplay: 'Runtime_Min ≈ [(Battery_V × Ah × N_bat × Eff) ÷ Load_W] × 60 × PeukertFactor',
    inputs: [
      { id: 'loadWatts', label: 'Connected IT / Server Load', type: 'number', unit: 'W', defaultValue: 300, min: 5, max: 100000, step: 25 },
      { id: 'upsVa', label: 'UPS Nameplate Rating', type: 'number', unit: 'VA', defaultValue: 1500, min: 100, max: 500000, step: 100 },
      { id: 'batVoltage', label: 'Internal Battery Bus Voltage', type: 'number', unit: 'V', defaultValue: 24, min: 6, max: 480, step: 12 },
      { id: 'batAh', label: 'Battery String Capacity', type: 'number', unit: 'Ah', defaultValue: 9, min: 1, max: 1000, step: 1 },
      { id: 'effPct', label: 'Inverter Efficiency', type: 'number', unit: '%', defaultValue: 88, min: 50, max: 99, step: 1 },
    ],
    calculate: (v) => {
      const [w, va, bv, ah, eff] = [v.loadWatts, v.upsVa, v.batVoltage, v.batAh, v.effPct].map(parseNum);
      if ([w, va, bv, ah, eff].some(Number.isNaN) || w <= 0 || va <= 0 || bv <= 0 || ah <= 0 || eff <= 0 || eff > 100) return calcError('Enter positive UPS electrical parameters.');
      const wattHours = bv * ah;
      const runtimeMin = ((wattHours * (eff / 100)) / w) * 60 * 0.85; // 0.85 Peukert high-rate SLA factor
      const loadFactorPct = (w / (va * 0.8)) * 100; // typical 0.8 PF UPS max Watts
      return {
        primaryValue: fmt(runtimeMin, 1),
        primaryUnit: 'Minutes',
        primaryLabel: 'Estimated UPS Battery Runtime',
        secondaryOutputs: [
          { label: 'Total Stored Battery Energy', value: `${fmt(wattHours, 0)} Wh` },
          { label: 'UPS Real-Power Load (vs 0.8 PF)', value: `${fmt(loadFactorPct, 1)}%` },
        ],
        steps: [`${wattHours} Wh × ${eff}% × 0.85 Peukert ÷ ${w} W × 60 = ${fmt(runtimeMin, 1)} min.`],
      };
    },
  },

  // 885. Server Rack Power, PDU Circuit Load & Cooling BTU Calculator
  {
    slug: 'rack-power-pdu-circuit-load-calculator',
    title: 'Data Center Server Rack Power, NEC 80% PDU Load & Cooling BTU Calculator',
    category: 'home-tech',
    formulaDisplay: 'MaxContAmps = BreakerAmps × 0.80   |   Rack_BTU/hr = Total_Watts × 3.41214',
    inputs: [
      { id: 'serverWatts', label: 'Total Rack IT Power Draw', type: 'number', unit: 'W', defaultValue: 2800, min: 10, max: 100000, step: 100 },
      { id: 'voltage', label: 'PDU Supply Voltage', type: 'select', defaultValue: '208', options: [{ label: '120V Single-Phase (NA)', value: '120' }, { label: '208V Single-Phase (Rack PDU)', value: '208' }, { label: '230V Single-Phase (EU/UK)', value: '230' }] },
      { id: 'breakerAmps', label: 'Branch Circuit Breaker Rating', type: 'number', unit: 'A', defaultValue: 30, min: 10, max: 400, step: 5 },
      { id: 'powerFactor', label: 'Server PSU Power Factor', type: 'number', defaultValue: 0.96, min: 0.5, max: 1.0, step: 0.01 },
    ],
    calculate: (v) => {
      const [w, volt, brk, pf] = [v.serverWatts, v.voltage, v.breakerAmps, v.powerFactor].map(parseNum);
      if ([w, volt, brk, pf].some(Number.isNaN) || w <= 0 || volt <= 0 || brk <= 0 || pf <= 0 || pf > 1) return calcError('Enter positive rack wattage, voltage, breaker amps, and PF.');
      const ampsDraw = w / (volt * pf);
      const contLimitAmps = brk * 0.8;
      const pctOfCont = (ampsDraw / contLimitAmps) * 100;
      const btuHr = w * 3.4121416;
      const coolingTons = btuHr / 12000;
      return {
        primaryValue: fmt(ampsDraw, 2),
        primaryUnit: 'Amps',
        primaryLabel: 'Continuous Rack Current Draw',
        secondaryOutputs: [
          { label: 'NEC 80% Continuous Circuit Limit', value: `${fmt(contLimitAmps, 1)} A (${fmt(pctOfCont, 1)}% used)` },
          { label: 'Heat Rejection Cooling Needed', value: `${fmt(btuHr, 0)} BTU/hr (${fmt(coolingTons, 2)} Tons)` },
        ],
        steps: [`${w} W ÷ (${volt} V × ${pf}) = ${fmt(ampsDraw, 2)} A (${fmt(pctOfCont, 1)}% of ${contLimitAmps} A limit).`],
      };
    },
  },

  // 886. RAID Storage Array Usable Capacity & Fault Tolerance Calculator
  {
    slug: 'raid-storage-capacity-fault-tolerance-calculator',
    title: 'RAID Array Usable Capacity, Parity & Fault Tolerance Calculator',
    category: 'home-tech',
    formulaDisplay: 'RAID 0: N×C | RAID 1: C | RAID 5: (N−1)×C | RAID 6: (N−2)×C | RAID 10: (N/2)×C',
    inputs: [
      { id: 'raidLevel', label: 'RAID Level', type: 'select', defaultValue: 'raid5', options: [{ label: 'RAID 0 (Striping — 0 Fault Tolerance)', value: 'raid0' }, { label: 'RAID 1 (Mirroring — N−1 Fault)', value: 'raid1' }, { label: 'RAID 5 (Single Parity — Min 3 drives)', value: 'raid5' }, { label: 'RAID 6 (Dual Parity — Min 4 drives)', value: 'raid6' }, { label: 'RAID 10 (Mirrored Stripes — Even Min 4)', value: 'raid10' }] },
      { id: 'driveCount', label: 'Number of Drives (N)', type: 'number', defaultValue: 6, min: 2, max: 128, step: 1 },
      { id: 'driveTb', label: 'Capacity per Drive (Decimal TB)', type: 'number', unit: 'TB', defaultValue: 8, min: 0.1, max: 200, step: 1 },
    ],
    calculate: (v) => {
      const n = Math.floor(parseNum(v.driveCount));
      const c = parseNum(v.driveTb);
      if (Number.isNaN(n) || Number.isNaN(c) || n < 2 || c <= 0 || !['raid0', 'raid1', 'raid5', 'raid6', 'raid10'].includes(v.raidLevel)) {
        return calcError('Drive count must be >= 2 and drive size positive.');
      }
      let usableTb = 0;
      let faultTol = '';
      if (v.raidLevel === 'raid0') { usableTb = n * c; faultTol = '0 drives (any failure loses pool)'; }
      else if (v.raidLevel === 'raid1') { usableTb = c; faultTol = `${n - 1} drives`; }
      else if (v.raidLevel === 'raid5') {
        if (n < 3) return calcError('RAID 5 requires at least 3 drives.');
        usableTb = (n - 1) * c; faultTol = '1 drive';
      } else if (v.raidLevel === 'raid6') {
        if (n < 4) return calcError('RAID 6 requires at least 4 drives.');
        usableTb = (n - 2) * c; faultTol = '2 drives';
      } else {
        if (n < 4 || n % 2 !== 0) return calcError('RAID 10 requires an even number of at least 4 drives.');
        usableTb = (n / 2) * c; faultTol = '1 drive per mirrored pair';
      }
      const usableTib = usableTb * 0.9094947;
      const effPct = (usableTb / (n * c)) * 100;
      return {
        primaryValue: fmt(usableTb, 2),
        primaryUnit: 'TB (Usable)',
        primaryLabel: 'Usable Array Storage Capacity',
        secondaryOutputs: [
          { label: 'Binary OS Capacity (TiB)', value: `${fmt(usableTib, 2)} TiB` },
          { label: 'Storage Efficiency', value: `${fmt(effPct, 1)}% (Raw ${fmt(n * c, 1)} TB)` },
          { label: 'Fault Tolerance', value: faultTol },
        ],
        steps: [`${v.raidLevel.toUpperCase()} with ${n}×${c} TB = ${fmt(usableTb, 2)} TB usable (${fmt(usableTib, 2)} TiB).`],
      };
    },
  },

  // 887. IPv6 Subnet & Prefix Size Calculator
  {
    slug: 'cidr-ipv6-subnet-vlsm-calculator',
    title: 'IPv6 CIDR Prefix, /64 LAN Count & Subnet Addressing Calculator',
    category: 'home-tech',
    formulaDisplay: 'Subnets (/64 LANs) = 2^(64 − Prefix)   |   Total Addresses = 2^(128 − Prefix)',
    inputs: [
      { id: 'prefixLen', label: 'IPv6 CIDR Prefix (/16 to /128)', type: 'number', prefix: '/', defaultValue: 48, min: 16, max: 128, step: 1 },
    ],
    calculate: (v) => {
      const p = Math.floor(parseNum(v.prefixLen));
      if (Number.isNaN(p) || p < 16 || p > 128) return calcError('IPv6 prefix length must be between /16 and /128.');
      const hostBits = 128 - p;
      const lan64Count = p <= 64 ? 2 ** (64 - p) : 0;
      const totalAddrsStr = hostBits <= 53 ? (2 ** hostBits).toLocaleString() : `2^${hostBits} (~${(2 ** hostBits).toExponential(3)})`;
      return {
        primaryValue: p <= 64 ? lan64Count.toLocaleString() : '0 (/64s)',
        primaryUnit: '/64 Standard LAN Subnets',
        primaryLabel: `Available /64 Subnets in /${p}`,
        secondaryOutputs: [
          { label: 'Host Bit Width', value: `${hostBits} bits` },
          { label: 'Total IPv6 Addresses', value: totalAddrsStr },
          { label: 'RFC 6177 Allocation Role', value: p <= 32 ? 'ISP / RIR Block' : p <= 48 ? 'Enterprise Site' : p <= 56 ? 'Residential / Small Site' : p === 64 ? 'Single Standard LAN' : 'Point-to-Point / Loopback' },
        ],
        steps: [`/${p} leaves ${hostBits} host bits → ${p <= 64 ? lan64Count.toLocaleString() + ' /64 subnets' : 'sub-/64 link block'}.`],
      };
    },
  },

  // 888. Cloud Object Storage (S3) & Egress Bandwidth Cost Calculator
  {
    slug: 'cloud-egress-storage-s3-cost-calculator',
    title: 'Cloud Storage & Internet Data Egress Cost Calculator',
    category: 'home-tech',
    formulaDisplay: 'Monthly$ = (GB_Stored × StorageRate) + (max(0, EgressGB − FreeGB) × EgressRate) + RequestFees',
    inputs: [
      { id: 'storageGb', label: 'Average Stored Data', type: 'number', unit: 'GB', defaultValue: 5000, min: 0, max: 1e9, step: 250 },
      { id: 'storageRate', label: 'Storage Rate per GB-Month', type: 'number', prefix: '$', defaultValue: 0.023, min: 0, max: 10, step: 0.001 },
      { id: 'egressGb', label: 'Monthly Outbound Internet Egress', type: 'number', unit: 'GB', defaultValue: 1500, min: 0, max: 1e9, step: 100 },
      { id: 'egressRate', label: 'Egress Rate per GB', type: 'number', prefix: '$', defaultValue: 0.09, min: 0, max: 10, step: 0.01 },
      { id: 'freeEgressGb', label: 'Free Egress Tier', type: 'number', unit: 'GB', defaultValue: 100, min: 0, max: 1e6, step: 50 },
    ],
    calculate: (v) => {
      const [sgb, sr, egb, er, free] = [v.storageGb, v.storageRate, v.egressGb, v.egressRate, v.freeEgressGb].map(parseNum);
      if ([sgb, sr, egb, er, free].some(Number.isNaN) || sgb < 0 || sr < 0 || egb < 0 || er < 0 || free < 0) return calcError('All storage and pricing inputs must be non-negative.');
      const storageCost = sgb * sr;
      const billableEgress = Math.max(0, egb - free);
      const egressCost = billableEgress * er;
      const totalMonth = storageCost + egressCost;
      return {
        primaryValue: fmt(totalMonth, 2),
        primaryUnit: '$/month',
        primaryLabel: 'Total Monthly Cloud Storage & Egress',
        secondaryOutputs: [
          { label: 'Storage Cost', value: `$${fmt(storageCost, 2)}/mo` },
          { label: 'Egress Cost', value: `$${fmt(egressCost, 2)}/mo (${fmt(billableEgress, 0)} billable GB)` },
          { label: 'Annualized Cloud Bill', value: `$${fmt(totalMonth * 12, 2)}/yr` },
        ],
        steps: [`Storage $${fmt(storageCost, 2)} + Egress $${fmt(egressCost, 2)} = $${fmt(totalMonth, 2)}/mo.`],
      };
    },
  },

  // 889. TCP Bandwidth-Delay Product (BDP) & Window Max Throughput
  {
    slug: 'bandwidth-throughput-bdp-tcp-calculator',
    title: 'TCP Bandwidth-Delay Product (BDP) & Max Single-Stream Throughput Calculator',
    category: 'home-tech',
    formulaDisplay: 'BDP (Bytes) = (Bandwidth_bps × RTT_sec) ÷ 8   |   Max_Mbps = (Window_Bits ÷ RTT_sec) ÷ 10⁶',
    inputs: [
      { id: 'bandwidthMbps', label: 'Link Bandwidth', type: 'number', unit: 'Mbps', defaultValue: 1000, min: 0.1, max: 1e7, step: 50 },
      { id: 'rttMs', label: 'Round-Trip Latency (RTT)', type: 'number', unit: 'ms', defaultValue: 45, min: 0.1, max: 10000, step: 5 },
      { id: 'tcpWinKb', label: 'Configured TCP Window Size', type: 'number', unit: 'KiB', defaultValue: 64, min: 1, max: 1000000, step: 16 },
    ],
    calculate: (v) => {
      const [bw, rtt, winKb] = [v.bandwidthMbps, v.rttMs, v.tcpWinKb].map(parseNum);
      if ([bw, rtt, winKb].some(Number.isNaN) || bw <= 0 || rtt <= 0 || winKb <= 0) return calcError('Bandwidth, RTT, and TCP window must be positive.');
      const rttSec = rtt / 1000;
      const bdpBytes = (bw * 1e6 * rttSec) / 8;
      const bdpKib = bdpBytes / 1024;
      const maxWinMbps = Math.min(bw, ((winKb * 1024 * 8) / rttSec) / 1e6);
      return {
        primaryValue: fmt(maxWinMbps, 2),
        primaryUnit: 'Mbps',
        primaryLabel: `Max Single-Stream Throughput (@ ${winKb} KiB Window)`,
        secondaryOutputs: [
          { label: 'Optimal BDP Buffer Size', value: `${fmt(bdpKib, 1)} KiB (${fmt(bdpBytes / 1048576, 2)} MiB)` },
          { label: 'Link Utilization Possible', value: `${fmt((maxWinMbps / bw) * 100, 1)}%` },
        ],
        steps: [`BDP = ${fmt(bdpKib, 1)} KiB; with ${winKb} KiB window over ${rtt} ms RTT → capped at ${fmt(maxWinMbps, 2)} Mbps.`],
      };
    },
  },

  // 890. Password Entropy & Brute-Force Crack Time Calculator
  {
    slug: 'password-entropy-crack-time-calculator',
    title: 'Password Entropy (Bits) & Brute-Force Resistance Calculator',
    category: 'home-tech',
    formulaDisplay: 'Entropy (bits) = Length × log₂(CharsetSize)   |   AvgCrackTime = 2^(Bits−1) ÷ Guesses/sec',
    inputs: [
      { id: 'length', label: 'Password Character Length', type: 'number', unit: 'chars', defaultValue: 14, min: 1, max: 256, step: 1 },
      { id: 'charsetSize', label: 'Character Pool', type: 'select', defaultValue: '94', options: [{ label: '94 Printable ASCII (Lower+Upper+Digits+Symbols)', value: '94' }, { label: '62 Alphanumeric (Lower+Upper+Digits)', value: '62' }, { label: '36 Case-Insensitive Alphanumeric', value: '36' }, { label: '26 Lowercase Letters Only', value: '26' }, { label: '10 Digits Only (PIN)', value: '10' }] },
      { id: 'guessesPerSec', label: 'Attacker Guess Rate (guesses/sec)', type: 'number', defaultValue: 1e10, min: 1, max: 1e18, step: 1e9 },
    ],
    calculate: (v) => {
      const [len, pool, rate] = [v.length, v.charsetSize, v.guessesPerSec].map(parseNum);
      if ([len, pool, rate].some(Number.isNaN) || len < 1 || pool < 2 || rate <= 0) return calcError('Enter positive length, valid charset, and guess rate.');
      const bits = len * Math.log2(pool);
      const avgSec = 2 ** Math.min(bits - 1, 200) / rate;
      const years = avgSec / (365.2425 * 86400);
      const timeStr = bits > 150 ? '> Age of Universe (>10¹² yrs)' : years >= 1e9 ? `${(years / 1e9).toExponential(2)} Billion yrs` : years >= 1 ? `${fmt(years, 1)} years` : avgSec >= 3600 ? `${fmt(avgSec / 3600, 1)} hours` : `${fmt(avgSec, 2)} seconds`;
      const tier = bits >= 100 ? 'Very Strong (NIST+)' : bits >= 72 ? 'Strong' : bits >= 50 ? 'Moderate' : 'Weak';
      return {
        primaryValue: fmt(bits, 1),
        primaryUnit: 'bits',
        primaryLabel: `Password Entropy (${tier})`,
        secondaryOutputs: [
          { label: 'Est. Mean Crack Time', value: timeStr },
          { label: 'Keyspace Combinations', value: `${pool}^${len}` },
        ],
        steps: [`${len} × log₂(${pool}) = ${fmt(bits, 1)} bits (${tier}).`],
      };
    },
  },

  // 891. Compression Ratio, Space Savings & Transfer Time Calculator
  {
    slug: 'shannon-entropy-compression-ratio-calculator',
    title: 'Data Compression Ratio, Space Savings & Bitrate Reduction Calculator',
    category: 'home-tech',
    formulaDisplay: 'Ratio = Uncompressed ÷ Compressed   |   Space Savings % = (1 − Compressed ÷ Uncompressed) × 100',
    inputs: [
      { id: 'uncompressedMb', label: 'Original Uncompressed Size', type: 'number', unit: 'MB', defaultValue: 2500, min: 0.01, max: 1e9, step: 50 },
      { id: 'compressedMb', label: 'Compressed Archive Size', type: 'number', unit: 'MB', defaultValue: 625, min: 0.01, max: 1e9, step: 25 },
      { id: 'linkMbps', label: 'Upload Speed (Comparison)', type: 'number', unit: 'Mbps', defaultValue: 100, min: 0.1, max: 1e6, step: 10 },
    ],
    calculate: (v) => {
      const [u, c, mbps] = [v.uncompressedMb, v.compressedMb, v.linkMbps].map(parseNum);
      if ([u, c, mbps].some(Number.isNaN) || u <= 0 || c <= 0 || mbps <= 0) return calcError('File sizes and link speed must be positive.');
      const ratio = u / c;
      const savingsPct = (1 - c / u) * 100;
      const savedMb = u - c;
      const timeSavedSec = (savedMb * 8) / mbps;
      return {
        primaryValue: fmt(savingsPct, 2),
        primaryUnit: '% Space Saved',
        primaryLabel: `Compression Savings (${fmt(ratio, 2)}:1 Ratio)`,
        secondaryOutputs: [
          { label: 'Compression Ratio', value: `${fmt(ratio, 2)} : 1` },
          { label: 'Storage Reclaimed', value: `${fmt(savedMb, 1)} MB` },
          { label: `Transfer Time Saved @ ${mbps} Mbps`, value: `${fmt(timeSavedSec, 1)} sec` },
        ],
        steps: [`${u} MB → ${c} MB = ${fmt(ratio, 2)}:1 ratio (${fmt(savingsPct, 2)}% reduction).`],
      };
    },
  },

  // 892. Audio & Video Bitrate to File Size Calculator
  {
    slug: 'audio-video-bitrate-file-size-calculator',
    title: 'Video & Audio Bitrate to File Size & Storage Calculator',
    category: 'home-tech',
    formulaDisplay: 'FileSize_GB = [(Video_kbps + Audio_kbps) × Duration_sec] ÷ (8 × 1,000,000)',
    inputs: [
      { id: 'videoKbps', label: 'Video Bitrate', type: 'number', unit: 'kbps', defaultValue: 12000, min: 0, max: 1e7, step: 500 },
      { id: 'audioKbps', label: 'Audio Bitrate', type: 'number', unit: 'kbps', defaultValue: 320, min: 0, max: 100000, step: 32 },
      { id: 'durationMin', label: 'Media Duration', type: 'number', unit: 'minutes', defaultValue: 90, min: 0.1, max: 1e6, step: 5 },
    ],
    calculate: (v) => {
      const [vk, ak, mins] = [v.videoKbps, v.audioKbps, v.durationMin].map(parseNum);
      if ([vk, ak, mins].some(Number.isNaN) || vk < 0 || ak < 0 || (vk + ak) <= 0 || mins <= 0) return calcError('Combined bitrate and duration must be positive.');
      const totalKbps = vk + ak;
      const totalMb = (totalKbps * mins * 60) / 8000;
      const totalGb = totalMb / 1000;
      const totalGib = totalMb / 1024;
      return {
        primaryValue: fmt(totalGb, 2),
        primaryUnit: 'GB (Decimal)',
        primaryLabel: 'Estimated Media File Size',
        secondaryOutputs: [
          { label: 'Megabytes (MB)', value: `${fmt(totalMb, 1)} MB` },
          { label: 'Binary Size (GiB)', value: `${fmt(totalGib, 2)} GiB` },
          { label: 'Combined Stream Rate', value: `${fmt(totalKbps / 1000, 2)} Mbps` },
        ],
        steps: [`${totalKbps} kbps × ${mins * 60} sec ÷ 8,000 = ${fmt(totalMb, 1)} MB (${fmt(totalGb, 2)} GB).`],
      };
    },
  },

  // 893. Speaker Wire Gauge, Resistance & Damping Loss Calculator
  {
    slug: 'speaker-wire-gauge-damping-calculator',
    title: 'Speaker Wire Gauge (AWG) Resistance & Signal Loss Calculator',
    category: 'home-tech',
    formulaDisplay: 'R_loop = 2 × OneWay_ft × (Ω/1000ft)   |   Loss_dB = 20·log₁₀(Z_load ÷ (Z_load + R_loop))',
    inputs: [
      { id: 'speakerOhms', label: 'Speaker Nominal Impedance', type: 'number', unit: 'Ω', defaultValue: 8, min: 1, max: 32, step: 2 },
      { id: 'oneWayFt', label: 'One-Way Cable Run Length', type: 'number', unit: 'ft', defaultValue: 50, min: 1, max: 2000, step: 5 },
      { id: 'awg', label: 'Copper Wire Gauge (AWG)', type: 'select', defaultValue: '14', options: [{ label: '18 AWG (6.39 Ω/1kft)', value: '18' }, { label: '16 AWG (4.02 Ω/1kft)', value: '16' }, { label: '14 AWG (2.53 Ω/1kft)', value: '14' }, { label: '12 AWG (1.59 Ω/1kft)', value: '12' }, { label: '10 AWG (1.00 Ω/1kft)', value: '10' }] },
    ],
    calculate: (v) => {
      const [z, ft] = [v.speakerOhms, v.oneWayFt].map(parseNum);
      const rPer1k: Record<string, number> = { '18': 6.385, '16': 4.016, '14': 2.525, '12': 1.588, '10': 0.999 };
      const rRate = rPer1k[v.awg];
      if (Number.isNaN(z) || Number.isNaN(ft) || z <= 0 || ft <= 0 || !rRate) return calcError('Enter positive impedance, cable length, and valid AWG.');
      const rLoop = (2 * ft * rRate) / 1000;
      const lossPct = (rLoop / (z + rLoop)) * 100;
      const lossDb = -20 * Math.log10(z / (z + rLoop));
      const maxDamping = z / rLoop;
      return {
        primaryValue: fmt(lossDb, 3),
        primaryUnit: 'dB Power/Signal Loss',
        primaryLabel: `Wire Attenuation (${v.awg} AWG)`,
        secondaryOutputs: [
          { label: 'Two-Way Loop Resistance', value: `${fmt(rLoop, 3)} Ω (${fmt(lossPct, 2)}% of Z)` },
          { label: 'Wire-Limited Max Damping Factor', value: `${fmt(maxDamping, 1)}` },
        ],
        steps: [`R_loop = ${fmt(rLoop, 3)} Ω vs ${z} Ω load → ${fmt(lossDb, 3)} dB loss (recommended ≤ 0.5 dB / ≤ 5% Z).`],
      };
    },
  },

  // 894. Electrical Conduit Fill % & Wire Capacity (NEC Chapter 9 Table 1)
  {
    slug: 'conduit-fill-nec-wire-capacity-calculator',
    title: 'Electrical Conduit Fill Percentage Calculator (NEC Chapter 9 40% Rule)',
    category: 'home-tech',
    formulaDisplay: 'Fill % = (WireCount × ConductorArea_in²) ÷ ConduitArea_in² × 100 (NEC Max: 1=53%, 2=31%, ≥3=40%)',
    inputs: [
      { id: 'conduitTrade', label: 'EMT Conduit Trade Size', type: 'select', defaultValue: '0.75', options: [{ label: '1/2" EMT (0.304 in²)', value: '0.5' }, { label: '3/4" EMT (0.533 in²)', value: '0.75' }, { label: '1" EMT (0.864 in²)', value: '1.0' }, { label: '1-1/4" EMT (1.496 in²)', value: '1.25' }, { label: '1-1/2" EMT (2.036 in²)', value: '1.5' }, { label: '2" EMT (3.356 in²)', value: '2.0' }] },
      { id: 'wireAwg', label: 'THHN / THWN-2 Conductor Size', type: 'select', defaultValue: '12', options: [{ label: '14 AWG (0.0097 in²)', value: '14' }, { label: '12 AWG (0.0133 in²)', value: '12' }, { label: '10 AWG (0.0211 in²)', value: '10' }, { label: '8 AWG (0.0366 in²)', value: '8' }, { label: '6 AWG (0.0507 in²)', value: '6' }, { label: '4 AWG (0.0824 in²)', value: '4' }] },
      { id: 'wireCount', label: 'Number of Identical Wires in Conduit', type: 'number', defaultValue: 6, min: 1, max: 200, step: 1 },
    ],
    calculate: (v) => {
      const emtArea: Record<string, number> = { '0.5': 0.304, '0.75': 0.533, '1.0': 0.864, '1.25': 1.496, '1.5': 2.036, '2.0': 3.356 };
      const thhnArea: Record<string, number> = { '14': 0.0097, '12': 0.0133, '10': 0.0211, '8': 0.0366, '6': 0.0507, '4': 0.0824 };
      const cArea = emtArea[v.conduitTrade];
      const wArea = thhnArea[v.wireAwg];
      const count = Math.floor(parseNum(v.wireCount));
      if (!cArea || !wArea || Number.isNaN(count) || count < 1) return calcError('Select valid conduit/wire sizes and positive count.');
      const fillPct = ((count * wArea) / cArea) * 100;
      const necLimit = count === 1 ? 53 : count === 2 ? 31 : 40;
      const max40Wires = Math.floor((cArea * 0.40) / wArea);
      return {
        primaryValue: fmt(fillPct, 1),
        primaryUnit: '% Fill',
        primaryLabel: fillPct <= necLimit ? `PASS (NEC Limit ≤ ${necLimit}%)` : `EXCEEDS NEC Limit (>${necLimit}%)`,
        secondaryOutputs: [
          { label: 'Conductor vs Conduit Area', value: `${fmt(count * wArea, 4)} / ${cArea} in²` },
          { label: 'Max Wires @ 40% Fill', value: `${max40Wires} × #${v.wireAwg} THHN` },
        ],
        steps: [`${count} × ${wArea} in² ÷ ${cArea} in² = ${fmt(fillPct, 1)}% (NEC max ${necLimit}%).`],
      };
    },
  },

  // 895. Backup Generator Running & Surge Wattage Sizing Calculator
  {
    slug: 'generator-wattage-surge-sizing-calculator',
    title: 'Backup Generator Running & Starting Surge Wattage Sizing Calculator',
    category: 'home-tech',
    formulaDisplay: 'Gen_Running = TotalRunWatts × (1 + Headroom%)   |   Gen_Peak ≥ TotalRun − LargestRun + LargestStart',
    inputs: [
      { id: 'fridgeRunW', label: 'Refrigerator + Freezer Running Watts', type: 'number', unit: 'W', defaultValue: 400, min: 0, max: 20000, step: 50 },
      { id: 'sumpPumpRunW', label: 'Well / Sump Pump Running Watts (3x Surge)', type: 'number', unit: 'W', defaultValue: 1000, min: 0, max: 50000, step: 100 },
      { id: 'hvacBlowerRunW', label: 'Furnace Blower / Mini-Split Watts (2x Surge)', type: 'number', unit: 'W', defaultValue: 1200, min: 0, max: 50000, step: 100 },
      { id: 'lightsWifiW', label: 'Lights, Wi-Fi, Electronics & Outlets', type: 'number', unit: 'W', defaultValue: 900, min: 0, max: 50000, step: 100 },
      { id: 'safetyMarginPct', label: 'Safety Margin Headroom', type: 'number', unit: '%', defaultValue: 20, min: 0, max: 60, step: 5 },
    ],
    calculate: (v) => {
      const [fr, pump, hvac, misc, marg] = [v.fridgeRunW, v.sumpPumpRunW, v.hvacBlowerRunW, v.lightsWifiW, v.safetyMarginPct].map(parseNum);
      if ([fr, pump, hvac, misc, marg].some(Number.isNaN) || fr < 0 || pump < 0 || hvac < 0 || misc < 0 || marg < 0) return calcError('All wattage inputs and safety margin must be non-negative.');
      const totalRun = fr + pump + hvac + misc;
      if (totalRun <= 0) return calcError('Enter at least one active appliance load > 0 W.');
      const surges = [fr * 2.5 - fr, pump * 3 - pump, hvac * 2 - hvac];
      const maxIncrementalSurge = Math.max(...surges);
      const minStartingW = totalRun + maxIncrementalSurge;
      const recRunningW = totalRun * (1 + marg / 100);
      return {
        primaryValue: fmt(recRunningW, 0),
        primaryUnit: 'Running Watts',
        primaryLabel: 'Recommended Continuous Generator Capacity',
        secondaryOutputs: [
          { label: 'Minimum Peak / Starting Watts', value: `${fmt(minStartingW, 0)} W` },
          { label: 'Total Connected Running Load', value: `${fmt(totalRun, 0)} W` },
        ],
        steps: [`Base run = ${totalRun} W (+${marg}% = ${fmt(recRunningW, 0)} W); highest motor surge adds +${fmt(maxIncrementalSurge, 0)} W → ${fmt(minStartingW, 0)} W peak.`],
      };
    },
  },

  // 896. Plumbing Pipe Volume & Hot Water Wait Delay Calculator
  {
    slug: 'pipe-volume-gallons-water-heater-flush-calculator',
    title: 'Plumbing Pipe Water Volume & Hot-Water Wait Time Calculator',
    category: 'home-tech',
    formulaDisplay: 'Vol_Gal = π × (ID_in / 2)² × Length_ft × 12 ÷ 231   |   Wait_sec = (Vol_Gal ÷ Flow_GPM) × 60',
    inputs: [
      { id: 'pipeIdIn', label: 'Pipe Inner Diameter (e.g., 1/2" Type L ≈ 0.545", 3/4" ≈ 0.785")', type: 'number', unit: 'in', defaultValue: 0.785, min: 0.1, max: 48, step: 0.05 },
      { id: 'pipeLengthFt', label: 'Pipe Run Length (Heater to Tap)', type: 'number', unit: 'ft', defaultValue: 65, min: 1, max: 50000, step: 5 },
      { id: 'flowGpm', label: 'Fixture Flow Rate (Shower ~2.0 GPM)', type: 'number', unit: 'GPM', defaultValue: 2.0, min: 0.1, max: 500, step: 0.5 },
    ],
    calculate: (v) => {
      const [id, len, gpm] = [v.pipeIdIn, v.pipeLengthFt, v.flowGpm].map(parseNum);
      if ([id, len, gpm].some(Number.isNaN) || id <= 0 || len <= 0 || gpm <= 0) return calcError('Diameter, pipe length, and flow rate must be positive.');
      const r = id / 2;
      const cuIn = Math.PI * r * r * len * 12;
      const gal = cuIn / 231;
      const liters = gal * 3.78541;
      const waitSec = (gal / gpm) * 60;
      return {
        primaryValue: fmt(gal, 3),
        primaryUnit: 'US Gallons',
        primaryLabel: 'Standing Water Volume in Pipe',
        secondaryOutputs: [
          { label: 'Liters Volume', value: `${fmt(liters, 2)} L` },
          { label: `Cold Flush Delay @ ${gpm} GPM`, value: `${fmt(waitSec, 1)} sec` },
        ],
        steps: [`${len} ft of ${id}" ID pipe holds ${fmt(gal, 3)} gal (${fmt(waitSec, 1)} sec flush delay at ${gpm} GPM).`],
      };
    },
  },

  // 897. Firewood Cord Volume & Wood Stove Heating BTU Calculator
  {
    slug: 'wood-stove-cord-firewood-btu-calculator',
    title: 'Firewood Cord Volume & Wood Stove Delivered BTU Calculator',
    category: 'home-tech',
    formulaDisplay: 'Cords = (L × H × StackWidth_ft) ÷ 128 ft³   |   NetHeat = Cords × SpeciesBTU × StoveEff%',
    inputs: [
      { id: 'stackLenFt', label: 'Stack Length', type: 'number', unit: 'ft', defaultValue: 16, min: 1, max: 1000, step: 1 },
      { id: 'stackHeightFt', label: 'Stack Height', type: 'number', unit: 'ft', defaultValue: 4, min: 1, max: 50, step: 0.5 },
      { id: 'logLengthIn', label: 'Split Log Cut Length', type: 'number', unit: 'in', defaultValue: 16, min: 6, max: 48, step: 2 },
      { id: 'speciesBtuM', label: 'Wood Species Heat Content (Million BTU / Full Cord)', type: 'select', defaultValue: '24', options: [{ label: 'Red Oak / Sugar Maple (24M BTU/cord)', value: '24' }, { label: 'White Oak / Hickory (27M BTU/cord)', value: '27' }, { label: 'Birch / Ash / Cherry (20M BTU/cord)', value: '20' }, { label: 'Pine / Spruce Softwood (15M BTU/cord)', value: '15' }] },
      { id: 'stoveEffPct', label: 'EPA Wood Stove Efficiency', type: 'number', unit: '%', defaultValue: 75, min: 20, max: 95, step: 5 },
    ],
    calculate: (v) => {
      const [l, h, logIn, mbtu, eff] = [v.stackLenFt, v.stackHeightFt, v.logLengthIn, v.speciesBtuM, v.stoveEffPct].map(parseNum);
      if ([l, h, logIn, mbtu, eff].some(Number.isNaN) || l <= 0 || h <= 0 || logIn <= 0 || mbtu <= 0 || eff <= 0 || eff > 100) return calcError('Stack dimensions and efficiency must be valid positive values.');
      const cuFt = l * h * (logIn / 12);
      const fullCords = cuFt / 128;
      const deliveredMbtu = fullCords * mbtu * (eff / 100);
      const heatingOilGalEq = deliveredMbtu / 0.1385; // ~138,500 BTU/gal #2 fuel oil
      return {
        primaryValue: fmt(fullCords, 3),
        primaryUnit: 'Full Cords (128 ft³)',
        primaryLabel: 'Firewood Stack Volume',
        secondaryOutputs: [
          { label: 'Net Delivered Heat', value: `${fmt(deliveredMbtu, 2)} Million BTU` },
          { label: 'Equivalent #2 Fuel Oil', value: `${fmt(heatingOilGalEq, 1)} gal` },
        ],
        steps: [`${fmt(cuFt, 1)} ft³ ÷ 128 = ${fmt(fullCords, 3)} cords × ${mbtu}M × ${eff}% = ${fmt(deliveredMbtu, 2)}M BTU.`],
      };
    },
  },

  // 898. Window U-Factor Heat Loss & Upgrade Energy Savings Calculator
  {
    slug: 'window-u-factor-heat-loss-calculator',
    title: 'Window U-Factor Heat Loss & Double/Triple Pane Upgrade Calculator',
    category: 'home-tech',
    formulaDisplay: 'HeatLoss_BTU/yr = Area_ft² × ΔU × HDD × 24   (U = 1 / R-Value)',
    inputs: [
      { id: 'windowSqFt', label: 'Total Window Glazing Area', type: 'number', unit: 'ft²', defaultValue: 260, min: 5, max: 100000, step: 20 },
      { id: 'oldU', label: 'Existing Window U-Factor (Single ~1.10 / Old Double ~0.55)', type: 'number', defaultValue: 0.90, min: 0.1, max: 2.0, step: 0.05 },
      { id: 'newU', label: 'New ENERGY STAR U-Factor (Double Low-E ~0.27 / Triple ~0.18)', type: 'number', defaultValue: 0.27, min: 0.08, max: 1.5, step: 0.02 },
      { id: 'hdd65', label: 'Annual Heating Degree Days (Base 65°F)', type: 'number', unit: 'HDD', defaultValue: 4800, min: 100, max: 20000, step: 200 },
      { id: 'costPerTherm', label: 'Heating Energy Cost ($/Therm = 100k BTU net)', type: 'number', prefix: '$', defaultValue: 1.85, min: 0.1, max: 50, step: 0.1 },
    ],
    calculate: (v) => {
      const [area, u1, u2, hdd, rate] = [v.windowSqFt, v.oldU, v.newU, v.hdd65, v.costPerTherm].map(parseNum);
      if ([area, u1, u2, hdd, rate].some(Number.isNaN) || area <= 0 || u1 <= 0 || u2 <= 0 || hdd <= 0 || rate <= 0) return calcError('All window and climate values must be positive.');
      const deltaU = Math.max(0, u1 - u2);
      const btuSaved = area * deltaU * hdd * 24;
      const thermsSaved = btuSaved / 100000;
      const annualSavings = thermsSaved * rate;
      return {
        primaryValue: fmt(annualSavings, 2),
        primaryUnit: '$/year Heating Saved',
        primaryLabel: `Annual Heating Savings (ΔU = ${fmt(deltaU, 2)})`,
        secondaryOutputs: [
          { label: 'Annual Heating BTU Saved', value: `${fmt(btuSaved / 1e6, 2)} Million BTU (${fmt(thermsSaved, 1)} therms)` },
          { label: 'R-Value Improvement', value: `R-${fmt(1 / u1, 2)} → R-${fmt(1 / u2, 2)}` },
        ],
        steps: [`${area} ft² × (${u1} − ${u2}) × ${hdd} HDD × 24 = ${fmt(thermsSaved, 1)} therms = $${fmt(annualSavings, 2)}/yr.`],
      };
    },
  },

  // 899. Roof Snow Load & Structural Weight Calculator
  {
    slug: 'roof-snow-dead-load-structural-calculator',
    title: 'Roof Snow Load & Ice Accumulation Structural Weight Calculator',
    category: 'home-tech',
    formulaDisplay: 'Load_psf = SnowDepth_in × (Density_pcf ÷ 12)   |   TotalTons = (Area_ft² × Load_psf) ÷ 2,000',
    inputs: [
      { id: 'roofFootprintSqFt', label: 'Horizontal Roof Footprint Area', type: 'number', unit: 'ft²', defaultValue: 2200, min: 20, max: 500000, step: 100 },
      { id: 'snowDepthIn', label: 'Accumulated Snow / Ice Depth', type: 'number', unit: 'in', defaultValue: 18, min: 0, max: 300, step: 2 },
      { id: 'snowType', label: 'Snow / Ice Density Category', type: 'select', defaultValue: 'packed', options: [{ label: 'Dry Fluffy Powder (~7 lb/ft³)', value: 'dry' }, { label: 'Settled / Packed Snow (~16 lb/ft³)', value: 'packed' }, { label: 'Wet Heavy Spring Snow (~28 lb/ft³)', value: 'wet' }, { label: 'Solid Ice Layer (~57 lb/ft³)', value: 'ice' }] },
    ],
    calculate: (v) => {
      const [area, depth] = [v.roofFootprintSqFt, v.snowDepthIn].map(parseNum);
      const densities: Record<string, number> = { dry: 7, packed: 16, wet: 28, ice: 57 };
      const pcf = densities[v.snowType];
      if (Number.isNaN(area) || Number.isNaN(depth) || area <= 0 || depth < 0 || !pcf) return calcError('Roof area must be positive and snow depth >= 0.');
      const psf = depth * (pcf / 12);
      const totalLb = area * psf;
      const totalTons = totalLb / 2000;
      const kpa = psf * 0.04788026;
      return {
        primaryValue: fmt(psf, 2),
        primaryUnit: 'lb/ft² (psf)',
        primaryLabel: 'Uniform Roof Snow Load Pressure',
        secondaryOutputs: [
          { label: 'Metric Snow Load', value: `${fmt(kpa, 2)} kPa (${fmt(kpa * 101.97, 0)} kg/m²)` },
          { label: 'Total Roof Weight Burden', value: `${fmt(totalTons, 2)} US Tons (${fmt(totalLb, 0)} lb)` },
        ],
        steps: [`${depth}" × (${pcf} lb/ft³ ÷ 12) = ${fmt(psf, 2)} psf → ${fmt(totalTons, 2)} Tons across ${area} ft².`],
      };
    },
  },

  // 900. Aquarium Water Volume, Glass Weight & Heater Wattage Calculator
  {
    slug: 'aquarium-volume-heater-wattage-calculator',
    title: 'Aquarium Volume, Filled Weight & Heater Wattage Calculator',
    category: 'home-tech',
    formulaDisplay: 'Gallons = (L × W × H_in) ÷ 231   |   RecHeater_W ≈ Liters × (ΔT_°C × 0.14)',
    inputs: [
      { id: 'lenIn', label: 'Tank Length', type: 'number', unit: 'in', defaultValue: 48, min: 4, max: 500, step: 2 },
      { id: 'widIn', label: 'Tank Width (Depth)', type: 'number', unit: 'in', defaultValue: 18, min: 4, max: 200, step: 1 },
      { id: 'htIn', label: 'Tank Height', type: 'number', unit: 'in', defaultValue: 21, min: 4, max: 200, step: 1 },
      { id: 'deltaC', label: 'Temp Lift Above Room (°C, e.g. 26°C − 20°C = 6°C)', type: 'number', unit: '°C', defaultValue: 6, min: 0, max: 25, step: 1 },
    ],
    calculate: (v) => {
      const [l, w, h, dt] = [v.lenIn, v.widIn, v.htIn, v.deltaC].map(parseNum);
      if ([l, w, h, dt].some(Number.isNaN) || l <= 0 || w <= 0 || h <= 0 || dt < 0) return calcError('Tank dimensions must be positive.');
      const gal = (l * w * h) / 231;
      const liters = gal * 3.78541;
      const waterLb = gal * 8.345;
      const heaterW = Math.max(25, Math.ceil((liters * Math.max(5, dt) * 0.14) / 25) * 25);
      return {
        primaryValue: fmt(gal, 1),
        primaryUnit: 'US Gallons',
        primaryLabel: 'Gross Aquarium Capacity',
        secondaryOutputs: [
          { label: 'Metric Volume', value: `${fmt(liters, 0)} Liters` },
          { label: 'Water Weight Alone (excl. glass/rock)', value: `${fmt(waterLb, 0)} lb (${fmt(waterLb * 0.4536, 0)} kg)` },
          { label: 'Recommended Heater Power', value: `${heaterW} Watts` },
        ],
        steps: [`(${l}×${w}×${h}) ÷ 231 = ${fmt(gal, 1)} gal (${fmt(liters, 0)} L); ~${heaterW} W heater recommended.`],
      };
    },
  },

  // 901. Coffee & Espresso Brew Ratio, Yield & Extraction Calculator
  {
    slug: 'coffee-espresso-brew-ratio-extraction-calculator',
    title: 'Coffee & Espresso Brew Ratio, Water Weight & Extraction Yield Calculator',
    category: 'home-tech',
    formulaDisplay: 'Ratio = 1 : (Water_g ÷ Dose_g)   |   Extraction Yield % = (Beverage_g × TDS%) ÷ Dose_g',
    inputs: [
      { id: 'doseG', label: 'Dry Ground Coffee Dose', type: 'number', unit: 'g', defaultValue: 20, min: 1, max: 1000, step: 0.5 },
      { id: 'ratioWater', label: 'Target Brew Ratio (Water parts per 1 Coffee, Pour-Over ~16, Espresso ~2)', type: 'number', defaultValue: 16, min: 1, max: 35, step: 0.5 },
      { id: 'tdsPct', label: 'Refractometer / Est. TDS % (Filter ~1.35%, Espresso ~9%)', type: 'number', unit: '%', defaultValue: 1.35, min: 0.1, max: 20, step: 0.05 },
    ],
    calculate: (v) => {
      const [dose, ratio, tds] = [v.doseG, v.ratioWater, v.tdsPct].map(parseNum);
      if ([dose, ratio, tds].some(Number.isNaN) || dose <= 0 || ratio <= 0 || tds <= 0) return calcError('Coffee dose, ratio, and TDS% must be positive.');
      const waterG = dose * ratio;
      // Grounds retain ~2x dry weight in water for filter, ~1x for pressurized espresso
      const retentionFactor = ratio <= 4 ? 1.0 : 2.0;
      const beverageG = ratio <= 4 ? waterG : Math.max(waterG - dose * retentionFactor, waterG * 0.85);
      const eyPct = (beverageG * (tds / 100)) / dose * 100;
      const zone = eyPct >= 18 && eyPct <= 22 ? 'SCA Gold Cup Sweet Spot (18–22%)' : eyPct < 18 ? 'Under-Extracted (<18%)' : 'Over-Extracted (>22%)';
      return {
        primaryValue: fmt(waterG, 1),
        primaryUnit: 'grams Water',
        primaryLabel: `Target Brew Water (1:${ratio})`,
        secondaryOutputs: [
          { label: 'Expected Liquid Yield', value: `${fmt(beverageG, 1)} g` },
          { label: 'Extraction Yield (EY%)', value: `${fmt(eyPct, 2)}% — ${zone}` },
        ],
        steps: [`${dose} g × ${ratio} = ${fmt(waterG, 1)} g water; ${fmt(beverageG, 1)} g beverage @ ${tds}% TDS = ${fmt(eyPct, 2)}% EY.`],
      };
    },
  },
];
