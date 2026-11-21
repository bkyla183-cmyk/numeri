import { CalculatorSpec } from './types';

export const engineeringConstructionSpecs: CalculatorSpec[] = [
  // CONSTRUCTION (20)
  {
    slug: 'concrete-calculator',
    title: 'Concrete Slab & Footing Volume Calculator',
    category: 'construction',
    formulaDisplay: 'Cubic Yards = (Length ft × Width ft × Depth ft) / 27',
    inputs: [
      { id: 'lengthFt', label: 'Length (Feet)', defaultValue: 20, type: 'number', min: 0.1, step: 0.5, unit: 'ft' },
      { id: 'widthFt', label: 'Width (Feet)', defaultValue: 10, type: 'number', min: 0.1, step: 0.5, unit: 'ft' },
      { id: 'depthIn', label: 'Thickness / Depth (Inches)', defaultValue: 4, type: 'number', min: 0.5, step: 0.5, unit: 'in' },
    ],
    calculate: (v) => {
      const l = Number(v.lengthFt) || 0;
      const w = Number(v.widthFt) || 0;
      const dFt = (Number(v.depthIn) || 4) / 12;
      const cuFt = l * w * dFt;
      const cuYards = cuFt / 27;
      const bags60 = cuYards * 45; // 45 bags of 60lb per cubic yard
      const bags80 = cuYards * 34; // 34 bags of 80lb per cubic yard
      return {
        primaryValue: parseFloat(cuYards.toFixed(2)),
        primaryUnit: 'Cubic Yards',
        primaryLabel: 'Concrete Volume Required',
        secondaryOutputs: [
          { label: 'Cubic Feet', value: `${cuFt.toFixed(1)} cu ft` },
          { label: '60 lb Premix Bags', value: `${Math.ceil(bags60)} bags` },
          { label: '80 lb Premix Bags', value: `${Math.ceil(bags80)} bags` },
        ],
        steps: [`Cu Ft = ${l} × ${w} × (${v.depthIn}/12) = ${cuFt.toFixed(1)} cu ft`, `Cu Yards = ${cuFt.toFixed(1)} / 27 = ${cuYards.toFixed(2)} yd³`],
        formulaUsed: 'Yards = (L × W × D_ft) / 27',
      };
    },
  },
  {
    slug: 'paint-calculator',
    title: 'Paint Coverage & Gallons Calculator',
    category: 'construction',
    formulaDisplay: 'Gallons = (Total Wall Area - Openings) / 350 sq ft per Gallon',
    inputs: [
      { id: 'lengthFt', label: 'Room Length (ft)', defaultValue: 14, type: 'number', step: 1, unit: 'ft' },
      { id: 'widthFt', label: 'Room Width (ft)', defaultValue: 12, type: 'number', step: 1, unit: 'ft' },
      { id: 'heightFt', label: 'Ceiling Height (ft)', defaultValue: 9, type: 'number', step: 0.5, unit: 'ft' },
      { id: 'coats', label: 'Number of Coats', defaultValue: 2, type: 'number', min: 1, max: 4, step: 1 },
      { id: 'doorsWindows', label: 'Total Doors & Windows Area (sq ft)', defaultValue: 42, type: 'number', step: 5, unit: 'sq ft' },
    ],
    calculate: (v) => {
      const l = Number(v.lengthFt) || 0;
      const w = Number(v.widthFt) || 0;
      const h = Number(v.heightFt) || 8;
      const coats = Number(v.coats) || 2;
      const openings = Number(v.doorsWindows) || 0;
      const perim = 2 * (l + w);
      const grossArea = perim * h;
      const netArea = Math.max(0, grossArea - openings);
      const totalCoverage = netArea * coats;
      const gallons = Math.ceil(totalCoverage / 350);
      return {
        primaryValue: gallons,
        primaryUnit: 'Gallons',
        primaryLabel: 'Paint Cans Needed (1 Gallon each)',
        secondaryOutputs: [
          { label: 'Net Wall Surface Area', value: `${netArea.toFixed(0)} sq ft` },
          { label: 'Total Paint Surface (${coats} coats)', value: `${totalCoverage.toFixed(0)} sq ft` },
        ],
        steps: [`Net wall area = 2(${l}+${w}) × ${h} - ${openings} = ${netArea} sq ft`, `Total with ${coats} coats = ${totalCoverage} sq ft / 350 = ${gallons} gal`],
        formulaUsed: 'Gallons = (Net Sq Ft × Coats) / 350',
      };
    },
  },
  {
    slug: 'tile-calculator',
    title: 'Floor & Wall Tile Calculator',
    category: 'construction',
    formulaDisplay: 'Tiles = (Room Area / Tile Area) × 1.10 (10% Waste Factor)',
    inputs: [
      { id: 'roomLength', label: 'Room Length (ft)', defaultValue: 12, type: 'number', step: 0.5, unit: 'ft' },
      { id: 'roomWidth', label: 'Room Width (ft)', defaultValue: 10, type: 'number', step: 0.5, unit: 'ft' },
      { id: 'tileLengthIn', label: 'Tile Length (Inches)', defaultValue: 12, type: 'number', step: 1, unit: 'in' },
      { id: 'tileWidthIn', label: 'Tile Width (Inches)', defaultValue: 12, type: 'number', step: 1, unit: 'in' },
      { id: 'wastePct', label: 'Cutting & Waste Factor (%)', defaultValue: 10, type: 'number', step: 1, unit: '%' },
    ],
    calculate: (v) => {
      const rl = Number(v.roomLength) || 0;
      const rw = Number(v.roomWidth) || 0;
      const tl = Number(v.tileLengthIn) || 12;
      const tw = Number(v.tileWidthIn) || 12;
      const waste = (Number(v.wastePct) || 10) / 100;
      const roomSqFt = rl * rw;
      const tileSqFt = (tl * tw) / 144;
      const rawTiles = roomSqFt / tileSqFt;
      const totalTiles = Math.ceil(rawTiles * (1 + waste));
      const totalSqFtOrder = roomSqFt * (1 + waste);
      return {
        primaryValue: totalTiles,
        primaryUnit: 'Tiles',
        primaryLabel: 'Total Individual Tiles Required',
        secondaryOutputs: [
          { label: 'Total Flooring Area', value: `${roomSqFt.toFixed(1)} sq ft` },
          { label: 'Square Footage to Order (with ${waste * 100}% waste)', value: `${totalSqFtOrder.toFixed(1)} sq ft` },
        ],
        steps: [`Room area = ${roomSqFt} sq ft`, `One tile = ${tileSqFt.toFixed(2)} sq ft`, `Total = (${roomSqFt}/${tileSqFt.toFixed(2)}) × ${1 + waste} = ${totalTiles}`],
        formulaUsed: 'Tiles = (Room Area / Tile Area) × (1 + Waste)',
      };
    },
  },
  {
    slug: 'drywall-calculator',
    title: 'Drywall Sheets (Sheetrock) Calculator',
    category: 'construction',
    formulaDisplay: 'Sheets = (Total Surface Area / 32 or 48 sq ft) × 1.10',
    inputs: [
      { id: 'sqft', label: 'Total Wall & Ceiling Area (sq ft)', defaultValue: 950, type: 'number', step: 50, unit: 'sq ft' },
      {
        id: 'sheetSize',
        label: 'Sheet Dimension',
        type: 'select',
        defaultValue: '32',
        options: [{ label: '4x8 Foot Sheet (32 sq ft)', value: '32' }, { label: '4x12 Foot Sheet (48 sq ft)', value: '48' }],
      },
    ],
    calculate: (v) => {
      const area = Number(v.sqft) || 0;
      const sheetSqFt = Number(v.sheetSize) || 32;
      const withWaste = area * 1.10;
      const sheets = Math.ceil(withWaste / sheetSqFt);
      const screws = sheets * 32; // approx 32 screws per 4x8 sheet
      return {
        primaryValue: sheets,
        primaryUnit: 'Sheets',
        primaryLabel: 'Drywall Panels Required',
        secondaryOutputs: [
          { label: 'Drywall Screws Needed', value: `~${screws} screws` },
          { label: 'Joint Compound Mud', value: `~${Math.ceil(sheets * 0.05 * 5)} gallon buckets` },
        ],
        steps: [`${area} sq ft + 10% waste = ${withWaste.toFixed(0)} sq ft / ${sheetSqFt} = ${sheets} panels`],
        formulaUsed: 'Panels = (Area × 1.10) / Sheet Size',
      };
    },
  },
  {
    slug: 'roofing-calculator',
    title: 'Roofing Squares & Shingles Calculator',
    category: 'construction',
    formulaDisplay: 'Roofing Squares = Roof Area / 100 sq ft',
    inputs: [
      { id: 'footprintSqFt', label: 'Home Footprint Area (sq ft)', defaultValue: 1800, type: 'number', step: 50, unit: 'sq ft' },
      {
        id: 'pitch',
        label: 'Roof Pitch Slope',
        type: 'select',
        defaultValue: '1.118',
        options: [
          { label: 'Low Pitch 4/12 (1.054x factor)', value: '1.054' },
          { label: 'Standard Pitch 6/12 (1.118x factor)', value: '1.118' },
          { label: 'Steep Pitch 8/12 (1.202x factor)', value: '1.202' },
          { label: 'Very Steep 12/12 (1.414x factor)', value: '1.414' },
        ],
      },
    ],
    calculate: (v) => {
      const fp = Number(v.footprintSqFt) || 0;
      const pitchFactor = Number(v.pitch) || 1.118;
      const roofArea = fp * pitchFactor * 1.12; // 12% overhang & waste
      const squares = roofArea / 100;
      const bundles = Math.ceil(squares * 3); // 3 bundles per square
      return {
        primaryValue: parseFloat(squares.toFixed(1)),
        primaryUnit: 'Roofing Squares',
        primaryLabel: 'Roofing Squares (100 sq ft each)',
        secondaryOutputs: [
          { label: 'Shingle Bundles (3 per square)', value: `${bundles} bundles` },
          { label: 'Actual Roof Surface Area', value: `${roofArea.toFixed(0)} sq ft` },
        ],
        steps: [`Adjusted for pitch ${pitchFactor} and 12% waste: ${roofArea.toFixed(0)} sq ft = ${squares.toFixed(1)} squares`],
        formulaUsed: 'Squares = Area / 100',
      };
    },
  },
  {
    slug: 'board-feet-calculator',
    title: 'Lumber Board Feet (BF) Calculator',
    category: 'construction',
    formulaDisplay: 'Board Feet = (Thickness in × Width in × Length in) / 144',
    inputs: [
      { id: 'thickIn', label: 'Thickness (Inches)', defaultValue: 2, type: 'number', min: 0.1, step: 0.25, unit: 'in' },
      { id: 'widthIn', label: 'Width (Inches)', defaultValue: 6, type: 'number', min: 0.1, step: 0.5, unit: 'in' },
      { id: 'lengthFt', label: 'Length (Feet)', defaultValue: 10, type: 'number', min: 0.1, step: 0.5, unit: 'ft' },
      { id: 'pieces', label: 'Quantity of Boards', defaultValue: 12, type: 'number', min: 1, step: 1 },
    ],
    calculate: (v) => {
      const t = Number(v.thickIn) || 1;
      const w = Number(v.widthIn) || 1;
      const lFt = Number(v.lengthFt) || 1;
      const pcs = Number(v.pieces) || 1;
      const bfPerPiece = (t * w * (lFt * 12)) / 144;
      const totalBf = bfPerPiece * pcs;
      return {
        primaryValue: parseFloat(totalBf.toFixed(2)),
        primaryUnit: 'BF',
        primaryLabel: 'Total Board Feet',
        secondaryOutputs: [
          { label: 'Board Feet per Piece', value: parseFloat(bfPerPiece.toFixed(2)) + ' BF' },
          { label: 'Linear Feet', value: `${lFt * pcs} linear ft` },
        ],
        steps: [`BF = (${t}" × ${w}" × ${lFt * 12}") / 144 = ${bfPerPiece.toFixed(2)} BF × ${pcs} = ${totalBf.toFixed(2)} BF`],
        formulaUsed: 'BF = (T × W × L) / 144',
      };
    },
  },
  {
    slug: 'brick-calculator',
    title: 'Brick Wall Masonry Calculator',
    category: 'construction',
    formulaDisplay: 'Bricks = Wall Sq Ft × 7 (Standard Modular Brick ~ 7 bricks/sq ft)',
    inputs: [
      { id: 'wallLength', label: 'Wall Length (ft)', defaultValue: 25, type: 'number', step: 1, unit: 'ft' },
      { id: 'wallHeight', label: 'Wall Height (ft)', defaultValue: 8, type: 'number', step: 0.5, unit: 'ft' },
      { id: 'mortarWaste', label: 'Waste Factor (%)', defaultValue: 5, type: 'number', step: 1, unit: '%' },
    ],
    calculate: (v) => {
      const l = Number(v.wallLength) || 0;
      const h = Number(v.wallHeight) || 0;
      const waste = (Number(v.mortarWaste) || 5) / 100;
      const wallArea = l * h;
      const bricksPerSqFt = 7; // standard US modular brick with 3/8" mortar
      const totalBricks = Math.ceil(wallArea * bricksPerSqFt * (1 + waste));
      const mortarBags = Math.ceil(totalBricks / 140);
      return {
        primaryValue: totalBricks,
        primaryUnit: 'Bricks',
        primaryLabel: 'Total Standard Bricks Needed',
        secondaryOutputs: [
          { label: 'Wall Area', value: `${wallArea} sq ft` },
          { label: 'Mortar Bags (80 lb type N)', value: `~${mortarBags} bags` },
        ],
        steps: [`Wall = ${l} × ${h} = ${wallArea} sq ft × 7 × ${1 + waste} = ${totalBricks} bricks`],
        formulaUsed: 'Bricks = Area × 7 × (1 + Waste)',
      };
    },
  },
  {
    slug: 'gravel-calculator',
    title: 'Gravel & Aggregate Tonnage Calculator',
    category: 'construction',
    formulaDisplay: 'Tons = (Length ft × Width ft × Depth ft / 27) × 1.4 Tons/Yard',
    inputs: [
      { id: 'lengthFt', label: 'Length (ft)', defaultValue: 30, type: 'number', step: 1, unit: 'ft' },
      { id: 'widthFt', label: 'Width (ft)', defaultValue: 10, type: 'number', step: 1, unit: 'ft' },
      { id: 'depthIn', label: 'Depth (Inches)', defaultValue: 3, type: 'number', step: 0.5, unit: 'in' },
    ],
    calculate: (v) => {
      const l = Number(v.lengthFt) || 0;
      const w = Number(v.widthFt) || 0;
      const dFt = (Number(v.depthIn) || 3) / 12;
      const cuYards = (l * w * dFt) / 27;
      const tons = cuYards * 1.4; // crushed stone ~1.4 tons per cubic yard
      return {
        primaryValue: parseFloat(tons.toFixed(2)),
        primaryUnit: 'Tons',
        primaryLabel: 'Gravel Required (Tons)',
        secondaryOutputs: [
          { label: 'Volume in Cubic Yards', value: `${cuYards.toFixed(2)} yd³` },
          { label: 'Volume in Cubic Feet', value: `${(cuYards * 27).toFixed(1)} cu ft` },
        ],
        steps: [`Cu Yards = ${cuYards.toFixed(2)} yd³ × 1.4 tons/yd³ = ${tons.toFixed(2)} tons`],
        formulaUsed: 'Tons = Cubic Yards × 1.4',
      };
    },
  },
  {
    slug: 'flooring-calculator',
    title: 'Hardwood & Laminate Flooring Calculator',
    category: 'construction',
    formulaDisplay: 'Boxes = (Room Sq Ft × 1.10) / Box Coverage Sq Ft',
    inputs: [
      { id: 'length', label: 'Room Length (ft)', defaultValue: 16, type: 'number', step: 0.5, unit: 'ft' },
      { id: 'width', label: 'Room Width (ft)', defaultValue: 14, type: 'number', step: 0.5, unit: 'ft' },
      { id: 'boxCoverage', label: 'Box Coverage (sq ft / box)', defaultValue: 23.5, type: 'number', min: 1, step: 0.5, unit: 'sq ft' },
    ],
    calculate: (v) => {
      const l = Number(v.length) || 0;
      const w = Number(v.width) || 0;
      const boxCov = Number(v.boxCoverage) || 20;
      const netSqFt = l * w;
      const totalOrder = netSqFt * 1.10; // 10% waste factor
      const boxes = Math.ceil(totalOrder / boxCov);
      return {
        primaryValue: boxes,
        primaryUnit: 'Boxes',
        primaryLabel: 'Flooring Cartons to Purchase',
        secondaryOutputs: [
          { label: 'Net Room Area', value: `${netSqFt.toFixed(1)} sq ft` },
          { label: 'Total Ordered Coverage', value: `${totalOrder.toFixed(1)} sq ft` },
        ],
        steps: [`Net = ${netSqFt} sq ft + 10% waste = ${totalOrder.toFixed(1)} sq ft / ${boxCov} = ${boxes} boxes`],
        formulaUsed: 'Boxes = (Area × 1.10) / Box SqFt',
      };
    },
  },
  {
    slug: 'decking-calculator',
    title: 'Wood & Composite Deck Board Calculator',
    category: 'construction',
    formulaDisplay: 'Deck Boards = Deck Area / Board Coverage',
    inputs: [
      { id: 'deckLength', label: 'Deck Length (ft)', defaultValue: 20, type: 'number', step: 1, unit: 'ft' },
      { id: 'deckWidth', label: 'Deck Width (ft)', defaultValue: 14, type: 'number', step: 1, unit: 'ft' },
      { id: 'boardWidthIn', label: 'Board Nominal Width (e.g. 5.5 in for 5/4x6)', defaultValue: 5.5, type: 'number', step: 0.5, unit: 'in' },
    ],
    calculate: (v) => {
      const l = Number(v.deckLength) || 0;
      const w = Number(v.deckWidth) || 0;
      const bwIn = Number(v.boardWidthIn) || 5.5;
      const gapIn = 0.25; // 1/4" spacing gap
      const effectiveWidthFt = (bwIn + gapIn) / 12;
      const totalRuns = Math.ceil(w / effectiveWidthFt);
      const totalLinearFt = totalRuns * l;
      return {
        primaryValue: totalRuns,
        primaryUnit: 'Boards',
        primaryLabel: `Total Runs of ${l}ft Deck Boards`,
        secondaryOutputs: [
          { label: 'Total Linear Feet', value: `${totalLinearFt} linear ft` },
          { label: 'Deck Area', value: `${l * w} sq ft` },
        ],
        steps: [`Rows = ${w} ft / ${effectiveWidthFt.toFixed(3)} ft = ${totalRuns} runs of ${l} ft boards`],
        formulaUsed: 'Runs = Deck Width / Board Spacing',
      };
    },
  },
  {
    slug: 'stair-calculator',
    title: 'Staircase Stringer, Riser & Tread Calculator',
    category: 'construction',
    formulaDisplay: 'Risers = Total Rise / 7.5 in, Tread = Total Run / Steps',
    inputs: [
      { id: 'totalRiseIn', label: 'Total Vertical Rise (Floor to Floor in inches)', defaultValue: 108, type: 'number', min: 10, step: 0.5, unit: 'in' },
    ],
    calculate: (v) => {
      const rise = Number(v.totalRiseIn) || 100;
      const idealRiser = 7.5; // standard building code ideal rise
      const numRisers = Math.round(rise / idealRiser);
      const exactRiser = rise / numRisers;
      const numTreads = numRisers - 1;
      const treadDepth = 10.5; // standard tread
      const totalRun = numTreads * treadDepth;
      return {
        primaryValue: numRisers,
        primaryUnit: 'Risers',
        primaryLabel: 'Number of Risers',
        secondaryOutputs: [
          { label: 'Individual Riser Height', value: `${exactRiser.toFixed(2)} inches` },
          { label: 'Number of Treads', value: numTreads },
          { label: 'Total Horizontal Stair Run', value: `${(totalRun / 12).toFixed(1)} feet (${totalRun} in)` },
        ],
        steps: [`${rise}" / 7.5" ≈ ${numRisers} steps. Exact riser height = ${exactRiser.toFixed(2)} inches.`],
        formulaUsed: 'IRC Building Code Staircase Rise & Run Rules',
      };
    },
  },
  {
    slug: 'stud-calculator',
    title: 'Wall Framing Stud Calculator',
    category: 'construction',
    formulaDisplay: 'Studs = (Wall Length ft × 12 / Spacing) + Plates & Corners',
    inputs: [
      { id: 'wallLength', label: 'Total Wall Length (ft)', defaultValue: 32, type: 'number', min: 1, step: 1, unit: 'ft' },
      {
        id: 'spacing',
        label: 'Stud On-Center Spacing',
        type: 'select',
        defaultValue: '16',
        options: [{ label: '16 Inches On-Center (Standard)', value: '16' }, { label: '24 Inches On-Center (Advanced)', value: '24' }],
      },
      { id: 'corners', label: 'Number of Corners & Intersections', defaultValue: 4, type: 'number', min: 0, step: 1 },
    ],
    calculate: (v) => {
      const l = Number(v.wallLength) || 10;
      const spacing = Number(v.spacing) || 16;
      const corners = Number(v.corners) || 2;
      const wallInches = l * 12;
      const basicStuds = Math.ceil(wallInches / spacing) + 1;
      const cornerBonus = corners * 2;
      const wasteBonus = Math.ceil(basicStuds * 0.10);
      const totalStuds = basicStuds + cornerBonus + wasteBonus;
      return {
        primaryValue: totalStuds,
        primaryUnit: '2x4 / 2x6 Studs',
        primaryLabel: 'Total Framing Studs Required',
        secondaryOutputs: [
          { label: 'Base Field Studs', value: basicStuds },
          { label: 'Corner / Partition Framing Studs', value: cornerBonus },
        ],
        steps: [`(${wallInches}" / ${spacing}") + 1 + ${cornerBonus} corners + 10% waste = ${totalStuds} studs`],
        formulaUsed: 'Studs = (L_in / OC) + Corners + 10%',
      };
    },
  },
  {
    slug: 'asphalt-calculator',
    title: 'Driveway Asphalt Tonnage Calculator',
    category: 'construction',
    formulaDisplay: 'Asphalt Tons = (Length × Width × Thickness_ft / 27) × 2.0 Tons/Yard',
    inputs: [
      { id: 'lengthFt', label: 'Driveway Length (ft)', defaultValue: 50, type: 'number', step: 5, unit: 'ft' },
      { id: 'widthFt', label: 'Driveway Width (ft)', defaultValue: 12, type: 'number', step: 1, unit: 'ft' },
      { id: 'depthIn', label: 'Compacted Asphalt Depth (in)', defaultValue: 3, type: 'number', step: 0.5, unit: 'in' },
    ],
    calculate: (v) => {
      const l = Number(v.lengthFt) || 0;
      const w = Number(v.widthFt) || 0;
      const dFt = (Number(v.depthIn) || 3) / 12;
      const cuYards = (l * w * dFt) / 27;
      const tons = cuYards * 2.025; // hot mix asphalt density ~2.025 tons/yd3
      return {
        primaryValue: parseFloat(tons.toFixed(2)),
        primaryUnit: 'Tons',
        primaryLabel: 'Hot Mix Asphalt (Tons)',
        secondaryOutputs: [
          { label: 'Paving Area', value: `${l * w} sq ft` },
          { label: 'Volume in Cubic Yards', value: `${cuYards.toFixed(2)} yd³` },
        ],
        steps: [`Volume = ${cuYards.toFixed(2)} yd³ × 2.025 tons/yd³ = ${tons.toFixed(2)} tons`],
        formulaUsed: 'Tons = Cubic Yards × 2.025',
      };
    },
  },
  {
    slug: 'wallpaper-calculator',
    title: 'Wallpaper Roll Calculator',
    category: 'construction',
    formulaDisplay: 'Rolls = Total Wall Sq Ft / Usable Roll Sq Ft (~28 sq ft per standard roll)',
    inputs: [
      { id: 'perimeterFt', label: 'Room Perimeter (ft)', defaultValue: 48, type: 'number', step: 2, unit: 'ft' },
      { id: 'heightFt', label: 'Wall Height (ft)', defaultValue: 9, type: 'number', step: 0.5, unit: 'ft' },
      { id: 'openingsSqFt', label: 'Doors & Windows Deductions (sq ft)', defaultValue: 40, type: 'number', step: 5, unit: 'sq ft' },
    ],
    calculate: (v) => {
      const p = Number(v.perimeterFt) || 0;
      const h = Number(v.heightFt) || 8;
      const op = Number(v.openingsSqFt) || 0;
      const netSqFt = Math.max(0, p * h - op);
      const rollYield = 28; // standard single roll usable area after pattern repeat
      const rolls = Math.ceil(netSqFt / rollYield);
      return {
        primaryValue: rolls,
        primaryUnit: 'Standard Rolls',
        primaryLabel: 'Wallpaper Rolls Needed',
        secondaryOutputs: [
          { label: 'Total Net Wall Area', value: `${netSqFt} sq ft` },
        ],
        steps: [`Net wall area = ${netSqFt} sq ft / 28 sq ft per roll = ${rolls} rolls`],
        formulaUsed: 'Rolls = Net Area / 28',
      };
    },
  },
  {
    slug: 'insulation-calculator',
    title: 'Batt & Blown-in Insulation Calculator',
    category: 'construction',
    formulaDisplay: 'Bags = Ceiling Area / Bag Coverage at Target R-Value',
    inputs: [
      { id: 'atticSqFt', label: 'Attic / Wall Area (sq ft)', defaultValue: 1200, type: 'number', step: 50, unit: 'sq ft' },
      {
        id: 'rValue',
        label: 'Target Thermal R-Value',
        type: 'select',
        defaultValue: '38',
        options: [{ label: 'R-30 (Attic Mild Climate)', value: '30' }, { label: 'R-38 (Attic Moderate Climate)', value: '38' }, { label: 'R-49 (Attic Cold Climate)', value: '49' }, { label: 'R-13 (2x4 Exterior Walls)', value: '13' }],
      },
    ],
    calculate: (v) => {
      const area = Number(v.atticSqFt) || 0;
      const r = Number(v.rValue) || 38;
      // Coverage per 30lb cellulose bag at R-38 is approx 40 sq ft
      const sqFtPerBag = (38 / r) * 40;
      const bags = Math.ceil(area / sqFtPerBag);
      return {
        primaryValue: bags,
        primaryUnit: 'Bags',
        primaryLabel: `Bags of Blown Cellulose for R-${r}`,
        secondaryOutputs: [
          { label: 'Coverage per Bag', value: `${sqFtPerBag.toFixed(1)} sq ft` },
          { label: 'Target Thermal Rating', value: `R-${r}` },
        ],
        steps: [`${area} sq ft / ${sqFtPerBag.toFixed(1)} sq ft per bag = ${bags} bags`],
        formulaUsed: 'Bags = Area / Coverage(R)',
      };
    },
  },
  {
    slug: 'rebar-calculator',
    title: 'Concrete Slab Rebar Grid Calculator',
    category: 'construction',
    formulaDisplay: 'Total Rebar = Grid Rows + Columns + Lap Splices',
    inputs: [
      { id: 'slabLength', label: 'Slab Length (ft)', defaultValue: 24, type: 'number', step: 1, unit: 'ft' },
      { id: 'slabWidth', label: 'Slab Width (ft)', defaultValue: 16, type: 'number', step: 1, unit: 'ft' },
      { id: 'gridSpacingIn', label: 'Grid Spacing (Inches on center)', defaultValue: 18, type: 'number', step: 6, unit: 'in' },
    ],
    calculate: (v) => {
      const l = Number(v.slabLength) || 10;
      const w = Number(v.slabWidth) || 10;
      const spacingFt = (Number(v.gridSpacingIn) || 18) / 12;
      const rows = Math.ceil(w / spacingFt) + 1;
      const cols = Math.ceil(l / spacingFt) + 1;
      const totalLinearFt = rows * l + cols * w;
      const bars20Ft = Math.ceil((totalLinearFt * 1.15) / 20); // 15% lap splice
      return {
        primaryValue: bars20Ft,
        primaryUnit: '20-Foot Rebar Sticks',
        primaryLabel: 'Total 20ft Rebar Bars Required',
        secondaryOutputs: [
          { label: 'Total Linear Feet (with lap splices)', value: `${Math.round(totalLinearFt * 1.15)} linear ft` },
          { label: 'Grid Intersections to Tie', value: rows * cols },
        ],
        steps: [`Grid lines: ${rows} lengthwise + ${cols} crosswise + 15% overlap splices.`],
        formulaUsed: 'Rebar Grid Matrix Calculation',
      };
    },
  },
  {
    slug: 'retaining-wall-calculator',
    title: 'Retaining Wall Block Calculator',
    category: 'construction',
    formulaDisplay: 'Blocks = (Wall Length / Block Length) × (Wall Height / Block Height)',
    inputs: [
      { id: 'lengthFt', label: 'Retaining Wall Length (ft)', defaultValue: 30, type: 'number', step: 1, unit: 'ft' },
      { id: 'heightFt', label: 'Retaining Wall Height (ft)', defaultValue: 3, type: 'number', step: 0.5, unit: 'ft' },
      { id: 'blockLengthIn', label: 'Block Face Length (in)', defaultValue: 16, type: 'number', step: 1, unit: 'in' },
      { id: 'blockHeightIn', label: 'Block Height (in)', defaultValue: 6, type: 'number', step: 0.5, unit: 'in' },
    ],
    calculate: (v) => {
      const l = Number(v.lengthFt) || 0;
      const h = Number(v.heightFt) || 0;
      const blFt = (Number(v.blockLengthIn) || 16) / 12;
      const bhFt = (Number(v.blockHeightIn) || 6) / 12;
      const courses = Math.ceil(h / bhFt);
      const blocksPerCourse = Math.ceil(l / blFt);
      const totalBlocks = Math.ceil(courses * blocksPerCourse * 1.05); // 5% cuts
      return {
        primaryValue: totalBlocks,
        primaryUnit: 'Retaining Blocks',
        primaryLabel: 'Retaining Wall Blocks Needed',
        secondaryOutputs: [
          { label: 'Vertical Courses', value: courses },
          { label: 'Blocks per Course', value: blocksPerCourse },
        ],
        steps: [`${courses} courses × ${blocksPerCourse} per course + 5% waste = ${totalBlocks} blocks`],
        formulaUsed: 'Blocks = (L / L_b) × (H / H_b)',
      };
    },
  },
  {
    slug: 'fence-calculator',
    title: 'Privacy Fence Posts, Rails & Pickets Calculator',
    category: 'construction',
    formulaDisplay: 'Posts = (Fence Length / Post Spacing) + 1, Pickets = Length × 12 / Picket Width',
    inputs: [
      { id: 'fenceLength', label: 'Total Fence Length (ft)', defaultValue: 120, type: 'number', step: 5, unit: 'ft' },
      { id: 'postSpacing', label: 'Post Spacing (ft, standard 8ft)', defaultValue: 8, type: 'number', min: 6, max: 10, step: 1, unit: 'ft' },
      { id: 'picketWidthIn', label: 'Picket Width (in, standard 5.5in for 1x6)', defaultValue: 5.5, type: 'number', step: 0.5, unit: 'in' },
    ],
    calculate: (v) => {
      const l = Number(v.fenceLength) || 0;
      const spacing = Number(v.postSpacing) || 8;
      const pwIn = Number(v.picketWidthIn) || 5.5;
      const posts = Math.ceil(l / spacing) + 1;
      const rails = Math.ceil(l / spacing) * 3; // 3 horizontal 2x4 rails per section
      const pickets = Math.ceil((l * 12) / pwIn * 1.05); // 5% waste
      return {
        primaryValue: pickets,
        primaryUnit: 'Pickets',
        primaryLabel: 'Fence Pickets Required',
        secondaryOutputs: [
          { label: '4x4 Fence Posts', value: `${posts} posts` },
          { label: '2x4 Horizontal Rails', value: `${rails} rails` },
          { label: 'Concrete Bags for Posts (2 per post)', value: `${posts * 2} bags` },
        ],
        steps: [`${l} ft fence: ${posts} posts at ${spacing}ft intervals, ${rails} rails, ${pickets} pickets`],
        formulaUsed: 'Fence Component Matrix',
      };
    },
  },
  {
    slug: 'excavation-calculator',
    title: 'Earthwork Excavation Volume Calculator',
    category: 'construction',
    formulaDisplay: 'Excavation Yards = (L × W × Depth) / 27 × Swell Factor',
    inputs: [
      { id: 'lengthFt', label: 'Excavation Pit Length (ft)', defaultValue: 40, type: 'number', step: 5, unit: 'ft' },
      { id: 'widthFt', label: 'Excavation Pit Width (ft)', defaultValue: 30, type: 'number', step: 5, unit: 'ft' },
      { id: 'depthFt', label: 'Excavation Depth (ft)', defaultValue: 8, type: 'number', step: 0.5, unit: 'ft' },
      { id: 'swellPct', label: 'Soil Swell Expansion Factor (%)', defaultValue: 25, type: 'number', step: 5, unit: '%' },
    ],
    calculate: (v) => {
      const l = Number(v.lengthFt) || 0;
      const w = Number(v.widthFt) || 0;
      const d = Number(v.depthFt) || 0;
      const swell = (Number(v.swellPct) || 20) / 100;
      const bankYards = (l * w * d) / 27;
      const looseYards = bankYards * (1 + swell);
      const dumpTruckLoads = Math.ceil(looseYards / 12); // ~12 cu yd dump truck
      return {
        primaryValue: parseFloat(looseYards.toFixed(1)),
        primaryUnit: 'Loose Cubic Yards',
        primaryLabel: 'Excavated Soil Haul-Off Volume',
        secondaryOutputs: [
          { label: 'Bank (Compacted) Yards', value: `${bankYards.toFixed(1)} yd³` },
          { label: '12-Yard Dump Truck Loads', value: `${dumpTruckLoads} truckloads` },
        ],
        steps: [`Bank = (${l}×${w}×${d})/27 = ${bankYards.toFixed(1)} yd³`, `With ${swell * 100}% swell = ${looseYards.toFixed(1)} loose yd³`],
        formulaUsed: 'Loose Volume = Bank Volume × (1 + Swell)',
      };
    },
  },
  {
    slug: 'siding-calculator',
    title: 'Vinyl & Fiber Cement Siding Calculator',
    category: 'construction',
    formulaDisplay: 'Squares = (Net Wall Area / 100) × 1.10',
    inputs: [
      { id: 'grossWallArea', label: 'Gross Exterior Wall Surface (sq ft)', defaultValue: 1600, type: 'number', step: 50, unit: 'sq ft' },
      { id: 'windowsDoors', label: 'Doors & Windows Openings (sq ft)', defaultValue: 220, type: 'number', step: 20, unit: 'sq ft' },
    ],
    calculate: (v) => {
      const gross = Number(v.grossWallArea) || 0;
      const openings = Number(v.windowsDoors) || 0;
      const net = Math.max(0, gross - openings);
      const withWaste = net * 1.10;
      const squares = withWaste / 100;
      return {
        primaryValue: parseFloat(squares.toFixed(1)),
        primaryUnit: 'Siding Squares',
        primaryLabel: 'Siding Squares to Order (100 sq ft each)',
        secondaryOutputs: [
          { label: 'Net Siding Area', value: `${net} sq ft` },
          { label: '10% Waste Buffer Area', value: `${withWaste.toFixed(0)} sq ft` },
        ],
        steps: [`Net = ${gross} - ${openings} = ${net} sq ft + 10% = ${withWaste.toFixed(0)} sq ft = ${squares.toFixed(1)} squares`],
        formulaUsed: 'Squares = (Net Area × 1.10) / 100',
      };
    },
  },

  // ENGINEERING (15)
  {
    slug: 'beam-deflection-calculator',
    title: 'Simply Supported Beam Deflection Calculator',
    category: 'engineering',
    formulaDisplay: 'δ_max = (5 × w × L⁴) / (384 × E × I)',
    inputs: [
      { id: 'loadW', label: 'Uniform Load (w in N/m)', defaultValue: 5000, type: 'number', step: 500, unit: 'N/m' },
      { id: 'spanL', label: 'Span Length (L in meters)', defaultValue: 4.0, type: 'number', min: 0.1, step: 0.5, unit: 'm' },
      { id: 'youngsE', label: 'Modulus of Elasticity (E in GPa, Steel ≈ 200)', defaultValue: 200, type: 'number', min: 1, step: 10, unit: 'GPa' },
      { id: 'momentI', label: 'Moment of Inertia (I in cm⁴)', defaultValue: 2500, type: 'number', min: 1, step: 100, unit: 'cm⁴' },
    ],
    calculate: (v) => {
      const w = Number(v.loadW) || 0;
      const l = Number(v.spanL) || 1;
      const e = (Number(v.youngsE) || 200) * 1e9; // Pa
      const i = (Number(v.momentI) || 1000) * 1e-8; // m4
      const deflMeters = (5 * w * Math.pow(l, 4)) / (384 * e * i);
      const deflMm = deflMeters * 1000;
      const limitL360 = (l / 360) * 1000;
      return {
        primaryValue: parseFloat(deflMm.toFixed(2)),
        primaryUnit: 'mm',
        primaryLabel: 'Maximum Center Deflection (δ_max)',
        secondaryOutputs: [
          { label: 'AISC L/360 Deflection Limit', value: `${limitL360.toFixed(2)} mm` },
          { label: 'Passes L/360 Criteria?', value: deflMm <= limitL360 ? 'PASS (Acceptable)' : 'FAIL (Excessive Deflection)' },
        ],
        steps: [`δ = 5(${w})(${l}⁴) / [384(${v.youngsE} GPa)(${v.momentI} cm⁴)] = ${deflMm.toFixed(2)} mm`],
        formulaUsed: 'Euler-Bernoulli Beam Deflection',
      };
    },
  },
  {
    slug: 'stress-strain-calculator',
    title: 'Stress and Strain (Hooke Law) Calculator',
    category: 'engineering',
    formulaDisplay: 'σ = F / A, ε = ΔL / L₀, E = σ / ε',
    inputs: [
      { id: 'force', label: 'Axial Tensile Force (F in N)', defaultValue: 25000, type: 'number', step: 1000, unit: 'N' },
      { id: 'areaMm2', label: 'Cross-Section Area (A in mm²)', defaultValue: 150, type: 'number', min: 0.1, step: 10, unit: 'mm²' },
      { id: 'youngsE', label: 'Young Modulus (E in GPa)', defaultValue: 200, type: 'number', min: 1, step: 10, unit: 'GPa' },
    ],
    calculate: (v) => {
      const f = Number(v.force) || 0;
      const a = Number(v.areaMm2) || 1;
      const eGpa = Number(v.youngsE) || 200;
      const stressMpa = f / a;
      const strain = stressMpa / (eGpa * 1000);
      return {
        primaryValue: parseFloat(stressMpa.toFixed(2)),
        primaryUnit: 'MPa (N/mm²)',
        primaryLabel: 'Axial Normal Stress (σ)',
        secondaryOutputs: [
          { label: 'Elastic Strain (ε)', value: strain.toExponential(4) },
          { label: 'Strain %', value: `${(strain * 100).toFixed(4)}%` },
        ],
        steps: [`σ = ${f} N / ${a} mm² = ${stressMpa.toFixed(2)} MPa`, `ε = ${stressMpa.toFixed(2)} / ${eGpa * 1000} = ${strain.toExponential(4)}`],
        formulaUsed: 'Hooke Law σ = E · ε',
      };
    },
  },
  {
    slug: 'thermal-expansion-calculator',
    title: 'Linear Thermal Expansion Calculator',
    category: 'engineering',
    formulaDisplay: 'ΔL = α × L₀ × ΔT',
    inputs: [
      { id: 'alpha', label: 'Thermal Expansion Coeff (α × 10⁻⁶ / °C, Steel ≈ 12, Copper ≈ 17)', defaultValue: 12.0, type: 'number', step: 0.5 },
      { id: 'lengthM', label: 'Original Length (L₀ in meters)', defaultValue: 50, type: 'number', min: 0.1, step: 1, unit: 'm' },
      { id: 'deltaT', label: 'Temperature Change (ΔT in °C)', defaultValue: 40, type: 'number', step: 5, unit: '°C' },
    ],
    calculate: (v) => {
      const alpha = (Number(v.alpha) || 12) * 1e-6;
      const l0 = Number(v.lengthM) || 1;
      const dt = Number(v.deltaT) || 0;
      const deltaL = alpha * l0 * dt;
      const deltaLMm = deltaL * 1000;
      return {
        primaryValue: parseFloat(deltaLMm.toFixed(2)),
        primaryUnit: 'mm',
        primaryLabel: 'Thermal Elongation (ΔL)',
        secondaryOutputs: [
          { label: 'Final Length', value: `${(l0 + deltaL).toFixed(5)} m` },
          { label: 'Expansion in Inches', value: `${(deltaLMm / 25.4).toFixed(3)} in` },
        ],
        steps: [`ΔL = (${v.alpha}×10⁻⁶) × ${l0} m × ${dt}°C = ${deltaLMm.toFixed(2)} mm`],
        formulaUsed: 'ΔL = α · L₀ · ΔT',
      };
    },
  },
  {
    slug: 'reynolds-number-calculator',
    title: 'Reynolds Number (Fluid Flow Regime) Calculator',
    category: 'engineering',
    formulaDisplay: 'Re = (ρ × v × D) / μ',
    inputs: [
      { id: 'velocity', label: 'Flow Velocity (v in m/s)', defaultValue: 2.0, type: 'number', step: 0.1, unit: 'm/s' },
      { id: 'diameter', label: 'Pipe Internal Diameter (D in meters)', defaultValue: 0.05, type: 'number', min: 0.001, step: 0.01, unit: 'm' },
      { id: 'fluid', label: 'Fluid Kinematic Viscosity (ν × 10⁻⁶ m²/s, Water at 20°C ≈ 1.0)', defaultValue: 1.0, type: 'number', min: 0.01, step: 0.1 },
    ],
    calculate: (v) => {
      const vel = Number(v.velocity) || 0;
      const d = Number(v.diameter) || 0.05;
      const nu = (Number(v.fluid) || 1.0) * 1e-6;
      const re = (vel * d) / nu;
      let regime = 'Laminar Flow (Re < 2300)';
      if (re > 4000) regime = 'Turbulent Flow (Re > 4000)';
      else if (re >= 2300) regime = 'Transitional Flow (2300 ≤ Re ≤ 4000)';
      return {
        primaryValue: Math.round(re),
        primaryLabel: `Reynolds Number (${regime})`,
        secondaryOutputs: [
          { label: 'Flow Regime Category', value: regime },
        ],
        steps: [`Re = (${vel} m/s × ${d} m) / (${v.fluid}×10⁻⁶ m²/s) = ${Math.round(re)}`],
        formulaUsed: 'Re = v · D / ν',
      };
    },
  },
  {
    slug: 'gear-ratio-calculator',
    title: 'Gear Train & Reduction Ratio Calculator',
    category: 'engineering',
    formulaDisplay: 'Ratio = Driven Teeth / Driving Teeth',
    inputs: [
      { id: 'driveTeeth', label: 'Driving Gear Teeth (Input Pinion)', defaultValue: 15, type: 'number', min: 1, step: 1 },
      { id: 'drivenTeeth', label: 'Driven Gear Teeth (Output Gear)', defaultValue: 45, type: 'number', min: 1, step: 1 },
      { id: 'inputRpm', label: 'Input Speed (RPM)', defaultValue: 1800, type: 'number', step: 100, unit: 'RPM' },
    ],
    calculate: (v) => {
      const drive = Number(v.driveTeeth) || 1;
      const driven = Number(v.drivenTeeth) || 1;
      const rpm = Number(v.inputRpm) || 0;
      const ratio = driven / drive;
      const outputRpm = rpm / ratio;
      return {
        primaryValue: parseFloat(ratio.toFixed(2)),
        primaryUnit: ': 1',
        primaryLabel: 'Gear Reduction Ratio',
        secondaryOutputs: [
          { label: 'Output Rotational Speed', value: `${outputRpm.toFixed(1)} RPM` },
          { label: 'Torque Multiplier', value: `${ratio.toFixed(2)}x` },
        ],
        steps: [`Ratio = ${driven} / ${drive} = ${ratio.toFixed(2)}:1`, `Output RPM = ${rpm} / ${ratio.toFixed(2)} = ${outputRpm.toFixed(1)} RPM`],
        formulaUsed: 'Gear Ratio = N_driven / N_driving',
      };
    },
  },
  {
    slug: 'hydraulic-cylinder-calculator',
    title: 'Hydraulic Cylinder Force Calculator',
    category: 'engineering',
    formulaDisplay: 'Force = Pressure × Piston Area',
    inputs: [
      { id: 'boreIn', label: 'Piston Bore Diameter (Inches)', defaultValue: 4.0, type: 'number', min: 0.5, step: 0.25, unit: 'in' },
      { id: 'psi', label: 'Hydraulic System Pressure (PSI)', defaultValue: 2500, type: 'number', min: 100, step: 100, unit: 'PSI' },
    ],
    calculate: (v) => {
      const bore = Number(v.boreIn) || 1;
      const psi = Number(v.psi) || 1000;
      const area = Math.PI * Math.pow(bore / 2, 2);
      const forceLbs = psi * area;
      const forceTons = forceLbs / 2000;
      return {
        primaryValue: parseFloat(forceTons.toFixed(2)),
        primaryUnit: 'US Tons',
        primaryLabel: 'Piston Extension Force',
        secondaryOutputs: [
          { label: 'Piston Area', value: `${area.toFixed(2)} sq in` },
          { label: 'Force in Pounds (lbf)', value: `${Math.round(forceLbs).toLocaleString()} lbf` },
        ],
        steps: [`Area = π × (${bore}/2)² = ${area.toFixed(2)} in²`, `Force = ${psi} PSI × ${area.toFixed(2)} in² = ${Math.round(forceLbs)} lbs = ${forceTons.toFixed(2)} tons`],
        formulaUsed: 'F = P · A',
      };
    },
  },
  {
    slug: 'bolt-torque-calculator',
    title: 'Fastener / Bolt Tightening Torque Calculator',
    category: 'engineering',
    formulaDisplay: 'Torque = K × D × F (K-factor friction coefficient)',
    inputs: [
      { id: 'diaMm', label: 'Bolt Nominal Diameter (mm, e.g. M10=10, M12=12)', defaultValue: 12, type: 'number', min: 2, step: 1, unit: 'mm' },
      { id: 'clampKn', label: 'Target Clamp Preload (F in kN)', defaultValue: 35, type: 'number', step: 1, unit: 'kN' },
      { id: 'kFactor', label: 'Torque Coefficient (K, 0.20 dry zinc, 0.15 lubricated)', defaultValue: 0.20, type: 'number', step: 0.01 },
    ],
    calculate: (v) => {
      const d = (Number(v.diaMm) || 10) / 1000; // meters
      const f = (Number(v.clampKn) || 10) * 1000; // Newtons
      const k = Number(v.kFactor) || 0.20;
      const torqueNm = k * d * f;
      const ftLbs = torqueNm * 0.737562;
      return {
        primaryValue: parseFloat(torqueNm.toFixed(1)),
        primaryUnit: 'N·m',
        primaryLabel: 'Recommended Tightening Torque',
        secondaryOutputs: [
          { label: 'Foot-Pounds (ft-lbs)', value: `${ftLbs.toFixed(1)} ft-lbs` },
        ],
        steps: [`T = ${k} × ${d} m × ${f} N = ${torqueNm.toFixed(1)} N·m`],
        formulaUsed: 'T = K · D · F (Machinery Handbook Fastener Standard)',
      };
    },
  },
  {
    slug: 'pipe-flow-calculator',
    title: 'Pipe Flow Rate & Discharge Calculator',
    category: 'engineering',
    formulaDisplay: 'Q = A × v = (π D² / 4) × v',
    inputs: [
      { id: 'innerDiaIn', label: 'Pipe Inside Diameter (Inches)', defaultValue: 2.0, type: 'number', min: 0.1, step: 0.25, unit: 'in' },
      { id: 'velocityFt', label: 'Flow Velocity (ft/s)', defaultValue: 5.0, type: 'number', step: 0.5, unit: 'ft/s' },
    ],
    calculate: (v) => {
      const dIn = Number(v.innerDiaIn) || 1;
      const vFt = Number(v.velocityFt) || 1;
      const dFt = dIn / 12;
      const area = (Math.PI * dFt * dFt) / 4;
      const cfs = area * vFt;
      const gpm = cfs * 448.831; // 1 cfs ≈ 448.831 GPM
      return {
        primaryValue: parseFloat(gpm.toFixed(1)),
        primaryUnit: 'GPM (Gallons / min)',
        primaryLabel: 'Volumetric Flow Rate (Q)',
        secondaryOutputs: [
          { label: 'Cubic Feet per Second (cfs)', value: cfs.toFixed(3) },
          { label: 'Liters per Minute (LPM)', value: (gpm * 3.78541).toFixed(1) },
        ],
        steps: [`Q = (${area.toFixed(4)} sq ft) × ${vFt} ft/s × 448.831 = ${gpm.toFixed(1)} GPM`],
        formulaUsed: 'Q = A · v',
      };
    },
  },
  {
    slug: 'heat-conduction-calculator',
    title: 'Fourier Heat Conduction Calculator',
    category: 'engineering',
    formulaDisplay: 'Q/t = (k × A × ΔT) / d',
    inputs: [
      { id: 'k', label: 'Thermal Conductivity (k in W/(m·K), Copper=400, Glass=0.8, Insulation=0.04)', defaultValue: 0.04, type: 'number', step: 0.01 },
      { id: 'area', label: 'Surface Area (A in m²)', defaultValue: 20, type: 'number', step: 1, unit: 'm²' },
      { id: 'deltaT', label: 'Temperature Difference (ΔT in °C)', defaultValue: 25, type: 'number', step: 1, unit: '°C' },
      { id: 'thickM', label: 'Wall Thickness (d in meters)', defaultValue: 0.15, type: 'number', min: 0.001, step: 0.01, unit: 'm' },
    ],
    calculate: (v) => {
      const k = Number(v.k) || 0.1;
      const a = Number(v.area) || 1;
      const dt = Number(v.deltaT) || 1;
      const d = Number(v.thickM) || 0.1;
      const q = (k * a * dt) / d;
      return {
        primaryValue: parseFloat(q.toFixed(1)),
        primaryUnit: 'Watts (W)',
        primaryLabel: 'Heat Transfer Rate (Q/t)',
        secondaryOutputs: [
          { label: 'BTU per Hour Equivalent', value: `${(q * 3.412142).toFixed(0)} BTU/hr` },
        ],
        steps: [`Q/t = (${k} × ${a} × ${dt}) / ${d} = ${q.toFixed(1)} W`],
        formulaUsed: 'Fourier Law of Thermal Conduction',
      };
    },
  },
  {
    slug: 'column-buckling-calculator',
    title: 'Euler Column Buckling Critical Load Calculator',
    category: 'engineering',
    formulaDisplay: 'P_cr = (π² × E × I) / (K × L)²',
    inputs: [
      { id: 'youngsE', label: 'Elastic Modulus (E in GPa)', defaultValue: 200, type: 'number', step: 10, unit: 'GPa' },
      { id: 'momentI', label: 'Area Moment of Inertia (I in cm⁴)', defaultValue: 120, type: 'number', step: 10, unit: 'cm⁴' },
      { id: 'lengthM', label: 'Column Length (L in meters)', defaultValue: 3.0, type: 'number', step: 0.5, unit: 'm' },
      { id: 'kFactor', label: 'Effective Length Factor (K, Pinned-Pinned=1.0, Fixed-Pinned=0.7, Fixed-Fixed=0.5)', defaultValue: 1.0, type: 'number', step: 0.1 },
    ],
    calculate: (v) => {
      const e = (Number(v.youngsE) || 200) * 1e9;
      const i = (Number(v.momentI) || 100) * 1e-8;
      const l = Number(v.lengthM) || 1;
      const k = Number(v.kFactor) || 1.0;
      const kl = k * l;
      const pCr = (Math.PI * Math.PI * e * i) / (kl * kl);
      const pCrKn = pCr / 1000;
      return {
        primaryValue: parseFloat(pCrKn.toFixed(1)),
        primaryUnit: 'kN',
        primaryLabel: 'Critical Buckling Load (P_cr)',
        secondaryOutputs: [
          { label: 'Force in Pounds-Force', value: `${(pCr * 0.224809).toFixed(0)} lbf` },
          { label: 'Effective Slenderness Factor (KL)', value: `${kl.toFixed(2)} m` },
        ],
        steps: [`P_cr = (π² × ${v.youngsE} GPa × ${v.momentI} cm⁴) / (${kl} m)² = ${pCrKn.toFixed(1)} kN`],
        formulaUsed: 'Euler Column Buckling Formula',
      };
    },
  },
  {
    slug: 'resistor-color-code-calculator',
    title: '4-Band Resistor Color Code Calculator',
    category: 'engineering',
    formulaDisplay: 'Value = (Band 1 × 10 + Band 2) × 10^Multiplier ± Tolerance',
    inputs: [
      {
        id: 'band1',
        label: '1st Band (Digit 1)',
        type: 'select',
        defaultValue: '4',
        options: [{ label: 'Brown (1)', value: '1' }, { label: 'Red (2)', value: '2' }, { label: 'Orange (3)', value: '3' }, { label: 'Yellow (4)', value: '4' }, { label: 'Green (5)', value: '5' }, { label: 'Blue (6)', value: '6' }],
      },
      {
        id: 'band2',
        label: '2nd Band (Digit 2)',
        type: 'select',
        defaultValue: '7',
        options: [{ label: 'Black (0)', value: '0' }, { label: 'Brown (1)', value: '1' }, { label: 'Red (2)', value: '2' }, { label: 'Violet (7)', value: '7' }, { label: 'Grey (8)', value: '8' }],
      },
      {
        id: 'multiplier',
        label: '3rd Band (Multiplier)',
        type: 'select',
        defaultValue: '2',
        options: [{ label: 'Black (×1)', value: '0' }, { label: 'Brown (×10)', value: '1' }, { label: 'Red (×100)', value: '2' }, { label: 'Orange (×1k)', value: '3' }, { label: 'Yellow (×10k)', value: '4' }, { label: 'Green (×100k)', value: '5' }],
      },
      {
        id: 'tolerance',
        label: '4th Band (Tolerance)',
        type: 'select',
        defaultValue: '5',
        options: [{ label: 'Gold (±5%)', value: '5' }, { label: 'Silver (±10%)', value: '10' }, { label: 'Brown (±1%)', value: '1' }],
      },
    ],
    calculate: (v) => {
      const b1 = Number(v.band1) || 4;
      const b2 = Number(v.band2) || 7;
      const mult = Number(v.multiplier) || 2;
      const tol = Number(v.tolerance) || 5;
      const baseVal = (b1 * 10 + b2) * Math.pow(10, mult);
      let formatted = `${baseVal} Ω`;
      if (baseVal >= 1e6) formatted = `${(baseVal / 1e6).toFixed(1)} MΩ`;
      else if (baseVal >= 1e3) formatted = `${(baseVal / 1e3).toFixed(1)} kΩ`;
      return {
        primaryValue: `${formatted} ±${tol}%`,
        primaryLabel: 'Decoded Resistance Value',
        secondaryOutputs: [
          { label: 'Minimum Resistance', value: `${(baseVal * (1 - tol / 100)).toFixed(0)} Ω` },
          { label: 'Maximum Resistance', value: `${(baseVal * (1 + tol / 100)).toFixed(0)} Ω` },
        ],
        steps: [`Digits: ${b1}${b2} × 10^${mult} = ${baseVal} Ω with ±${tol}% tolerance`],
        formulaUsed: 'EIA 4-Band Resistor Standard',
      };
    },
  },
  {
    slug: 'capacitor-calculator',
    title: 'Parallel & Series Capacitance Calculator',
    category: 'engineering',
    formulaDisplay: 'Series: 1/C_eq = Σ(1/C_i), Parallel: C_eq = Σ C_i',
    inputs: [
      { id: 'c1', label: 'Capacitor 1 (C₁ in μF)', defaultValue: 10, type: 'number', step: 'any', unit: 'μF' },
      { id: 'c2', label: 'Capacitor 2 (C₂ in μF)', defaultValue: 22, type: 'number', step: 'any', unit: 'μF' },
    ],
    calculate: (v) => {
      const c1 = Number(v.c1) || 1;
      const c2 = Number(v.c2) || 1;
      const parallel = c1 + c2;
      const series = (c1 * c2) / (c1 + c2);
      return {
        primaryValue: parseFloat(parallel.toFixed(2)),
        primaryUnit: 'μF (Parallel)',
        primaryLabel: 'Parallel Equivalent Capacitance',
        secondaryOutputs: [
          { label: 'Series Equivalent Capacitance', value: `${series.toFixed(2)} μF` },
        ],
        steps: [`Parallel = ${c1} + ${c2} = ${parallel} μF`, `Series = (${c1}×${c2})/(${c1}+${c2}) = ${series.toFixed(2)} μF`],
        formulaUsed: 'Capacitance Combination Rules',
      };
    },
  },
  {
    slug: 'inductance-calculator',
    title: 'Solenoid Inductance Calculator',
    category: 'engineering',
    formulaDisplay: 'L = (μ₀ × N² × A) / l',
    inputs: [
      { id: 'turns', label: 'Number of Turns (N)', defaultValue: 200, type: 'number', min: 1, step: 10 },
      { id: 'radiusMm', label: 'Coil Radius (r in mm)', defaultValue: 10, type: 'number', step: 1, unit: 'mm' },
      { id: 'lengthMm', label: 'Coil Length (l in mm)', defaultValue: 50, type: 'number', min: 1, step: 5, unit: 'mm' },
    ],
    calculate: (v) => {
      const n = Number(v.turns) || 100;
      const rM = (Number(v.radiusMm) || 10) / 1000;
      const lM = (Number(v.lengthMm) || 50) / 1000;
      const mu0 = 4 * Math.PI * 1e-7;
      const a = Math.PI * rM * rM;
      const lHenry = (mu0 * n * n * a) / lM;
      const lMicroH = lHenry * 1e6;
      return {
        primaryValue: parseFloat(lMicroH.toFixed(2)),
        primaryUnit: 'μH (Microhenries)',
        primaryLabel: 'Solenoid Inductance (L)',
        secondaryOutputs: [
          { label: 'Inductance in Millihenries', value: `${(lMicroH / 1000).toFixed(4)} mH` },
        ],
        steps: [`L = (4π×10⁻⁷ × ${n}² × ${a.toExponential(3)}) / ${lM} = ${lMicroH.toFixed(2)} μH`],
        formulaUsed: 'L = μ₀·N²·A / l',
      };
    },
  },
  {
    slug: 'spring-rate-calculator',
    title: 'Spring Constant & Deflection (Hooke Law) Calculator',
    category: 'engineering',
    formulaDisplay: 'F = k × x → k = F / x',
    inputs: [
      { id: 'forceN', label: 'Applied Force (F in N)', defaultValue: 120, type: 'number', step: 'any', unit: 'N' },
      { id: 'deflectionMm', label: 'Displacement / Compression (x in mm)', defaultValue: 15, type: 'number', min: 0.1, step: 'any', unit: 'mm' },
    ],
    calculate: (v) => {
      const f = Number(v.forceN) || 0;
      const xMm = Number(v.deflectionMm) || 1;
      const xM = xMm / 1000;
      const k = f / xM; // N/m
      const potentialEnergy = 0.5 * k * xM * xM;
      return {
        primaryValue: parseFloat((k / 1000).toFixed(2)),
        primaryUnit: 'N / mm',
        primaryLabel: 'Spring Rate (k)',
        secondaryOutputs: [
          { label: 'Spring Constant in N/m', value: `${Math.round(k)} N/m` },
          { label: 'Stored Elastic Potential Energy', value: `${potentialEnergy.toFixed(3)} Joules` },
        ],
        steps: [`k = ${f} N / ${xMm} mm = ${(k / 1000).toFixed(2)} N/mm`],
        formulaUsed: 'Hooke Law for Springs F = k · x',
      };
    },
  },
  {
    slug: 'decibel-distance-calculator',
    title: 'Sound Inverse Square Law & Decibel Calculator',
    category: 'engineering',
    formulaDisplay: 'L_2 = L_1 - 20 × log₁₀(d_2 / d_1)',
    inputs: [
      { id: 'dbAtD1', label: 'Sound Level at Distance 1 (L₁ in dB)', defaultValue: 90, type: 'number', step: 1, unit: 'dB' },
      { id: 'd1', label: 'Distance 1 (d₁ in meters)', defaultValue: 1.0, type: 'number', min: 0.1, step: 0.5, unit: 'm' },
      { id: 'd2', label: 'New Target Distance (d₂ in meters)', defaultValue: 8.0, type: 'number', min: 0.1, step: 0.5, unit: 'm' },
    ],
    calculate: (v) => {
      const l1 = Number(v.dbAtD1) || 90;
      const d1 = Number(v.d1) || 1;
      const d2 = Number(v.d2) || 1;
      const deltaDb = 20 * Math.log10(d2 / d1);
      const l2 = l1 - deltaDb;
      return {
        primaryValue: parseFloat(l2.toFixed(1)),
        primaryUnit: 'dB SPL',
        primaryLabel: `Sound Level at ${d2}m`,
        secondaryOutputs: [
          { label: 'Attenuation Loss', value: `-${deltaDb.toFixed(1)} dB` },
          { label: 'Distance Ratio', value: `${(d2 / d1).toFixed(1)}x further` },
        ],
        steps: [`L₂ = ${l1} dB - 20 × log10(${d2} / ${d1}) = ${l2.toFixed(1)} dB`],
        formulaUsed: 'Inverse Square Law of Acoustic Radiation',
      };
    },
  },
];
