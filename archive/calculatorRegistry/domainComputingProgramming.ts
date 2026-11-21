import { CalculatorSpec } from './types';

export const computingProgrammingSpecs: CalculatorSpec[] = [
  // COMPUTER & NETWORKING (15)
  {
    slug: 'subnet-calculator',
    title: 'IPv4 Subnet & CIDR Mask Calculator',
    category: 'computer-networking',
    formulaDisplay: 'Usable Hosts = 2^(32 - CIDR) - 2',
    inputs: [
      { id: 'ip', label: 'IP Address', defaultValue: '192.168.1.50', type: 'text' },
      { id: 'cidr', label: 'Subnet Prefix (CIDR /1 to /30)', defaultValue: 24, type: 'number', min: 1, max: 30, step: 1 },
    ],
    calculate: (v) => {
      const cidr = Math.max(1, Math.min(30, Number(v.cidr) || 24));
      const hostBits = 32 - cidr;
      const totalHosts = Math.pow(2, hostBits);
      const usableHosts = totalHosts - 2;
      // compute mask
      const maskInt = (0xFFFFFFFF << hostBits) >>> 0;
      const maskStr = [(maskInt >>> 24) & 255, (maskInt >>> 16) & 255, (maskInt >>> 8) & 255, maskInt & 255].join('.');
      return {
        primaryValue: usableHosts.toLocaleString(),
        primaryUnit: 'Usable Host IPs',
        primaryLabel: `Usable Hosts on /${cidr}`,
        secondaryOutputs: [
          { label: 'Subnet Mask', value: maskStr },
          { label: 'Total Allocated IP Range', value: totalHosts.toLocaleString() },
          { label: 'Host Bits', value: hostBits },
        ],
        steps: [`Host bits = 32 - ${cidr} = ${hostBits}`, `Usable = 2^${hostBits} - 2 = ${usableHosts}`],
        formulaUsed: 'RFC 1878 Subnet Addressing',
      };
    },
  },
  {
    slug: 'ipv6-calculator',
    title: 'IPv6 Address Expander & Compressor',
    category: 'computer-networking',
    formulaDisplay: 'RFC 4291 128-Bit Hexadecimal Colon Notation',
    inputs: [
      { id: 'ipv6', label: 'IPv6 Address (Compressed or Uncompressed)', defaultValue: '2001:db8::1', type: 'text' },
    ],
    calculate: (v) => {
      const raw = String(v.ipv6 || '2001:db8::1').trim().toLowerCase();
      // expand
      let full = raw;
      if (raw.includes('::')) {
        const [left, right] = raw.split('::');
        const leftParts = left ? left.split(':') : [];
        const rightParts = right ? right.split(':') : [];
        const missing = 8 - (leftParts.length + rightParts.length);
        const zeros = Array(missing).fill('0000');
        const combined = [...leftParts, ...zeros, ...rightParts];
        full = combined.map((p) => p.padStart(4, '0')).join(':');
      }
      return {
        primaryValue: full,
        primaryLabel: 'Full Expanded 128-bit IPv6',
        secondaryOutputs: [
          { label: 'Address Type', value: full.startsWith('fe80') ? 'Link-Local Unicast' : (full.startsWith('2') ? 'Global Unicast' : 'Special / Reserved') },
        ],
        steps: [`Expanded '::' double colon compression into full eight 16-bit hextets.`],
        formulaUsed: 'RFC 4291 IPv6 Architecture',
      };
    },
  },
  {
    slug: 'download-time-calculator',
    title: 'File Download & Transfer Time Calculator',
    category: 'computer-networking',
    formulaDisplay: 'Time (s) = File Size (MB) × 8 / Internet Speed (Mbps)',
    inputs: [
      { id: 'fileSizeGb', label: 'File Size (Gigabytes, GB)', defaultValue: 25, type: 'number', min: 0.01, step: 1, unit: 'GB' },
      { id: 'speedMbps', label: 'Download Bandwidth Speed (Mbps)', defaultValue: 100, type: 'number', min: 0.1, step: 10, unit: 'Mbps' },
    ],
    calculate: (v) => {
      const gb = Number(v.fileSizeGb) || 1;
      const speed = Number(v.speedMbps) || 10;
      const mbits = gb * 1024 * 8; // convert GB to Megabits
      const totalSec = mbits / speed;
      const min = Math.floor(totalSec / 60);
      const sec = Math.round(totalSec % 60);
      const hours = (totalSec / 3600).toFixed(2);
      return {
        primaryValue: totalSec > 3600 ? `${hours} hours` : `${min} min ${sec} sec`,
        primaryLabel: 'Estimated Download Duration',
        secondaryOutputs: [
          { label: 'Actual Transfer Rate', value: `${(speed / 8).toFixed(2)} MB/s` },
          { label: 'Total Bits Transferred', value: `${(mbits / 8000).toFixed(2)} GB` },
        ],
        steps: [`${gb} GB = ${mbits} Megabits / ${speed} Mbps = ${Math.round(totalSec)} seconds`],
        formulaUsed: 't = (Size in Megabits) / Bandwidth',
      };
    },
  },
  {
    slug: 'megabits-to-megabytes-calculator',
    title: 'Megabits (Mbps) to Megabytes (MB/s) Converter',
    category: 'computer-networking',
    formulaDisplay: '1 Byte = 8 Bits → MB/s = Mbps / 8',
    inputs: [
      { id: 'mbps', label: 'Network Speed (Megabits per Second, Mbps)', defaultValue: 500, type: 'number', min: 0.1, step: 50, unit: 'Mbps' },
    ],
    calculate: (v) => {
      const mbps = Number(v.mbps) || 0;
      const mbSec = mbps / 8;
      const gbSec = mbSec / 1024;
      return {
        primaryValue: parseFloat(mbSec.toFixed(2)),
        primaryUnit: 'MB / s',
        primaryLabel: 'Effective File Transfer Speed',
        secondaryOutputs: [
          { label: 'Gigabytes per Second', value: `${gbSec.toFixed(3)} GB/s` },
          { label: 'Time to transfer 1 GB', value: `${(1024 / (mbSec || 1)).toFixed(1)} seconds` },
        ],
        steps: [`${mbps} Mbps ÷ 8 = ${mbSec.toFixed(2)} MB/s`],
        formulaUsed: 'MB/s = Mbps / 8',
      };
    },
  },
  {
    slug: 'latency-calculator',
    title: 'Network Latency & Propagation Delay Calculator',
    category: 'computer-networking',
    formulaDisplay: 'Propagation Delay = Distance / Signal Speed in Fiber (~200,000 km/s)',
    inputs: [
      { id: 'distKm', label: 'Physical Fiber Distance (Kilometers)', defaultValue: 6000, type: 'number', step: 100, unit: 'km' },
    ],
    calculate: (v) => {
      const d = Number(v.distKm) || 1000;
      const cFiber = 200000; // km/s speed of light in fiber optic glass
      const oneWayMs = (d / cFiber) * 1000;
      const rttMs = oneWayMs * 2;
      return {
        primaryValue: parseFloat(rttMs.toFixed(1)),
        primaryUnit: 'ms (RTT)',
        primaryLabel: 'Round-Trip Fiber Latency',
        secondaryOutputs: [
          { label: 'One-Way Propagation Time', value: `${oneWayMs.toFixed(1)} ms` },
        ],
        steps: [`RTT = (2 × ${d} km / 200,000 km/s) × 1000 = ${rttMs.toFixed(1)} ms`],
        formulaUsed: 'RTT = 2 · d / v_fiber',
      };
    },
  },
  {
    slug: 'binary-calculator',
    title: 'Binary Arithmetic (Add, Sub, Mul) Calculator',
    category: 'computer-networking',
    formulaDisplay: 'Bitwise Binary Radix-2 Arithmetic',
    inputs: [
      { id: 'bin1', label: 'First Binary String (e.g. 1101)', defaultValue: '1101', type: 'text' },
      { id: 'op', label: 'Operation', type: 'select', defaultValue: '+', options: [{ label: 'Addition (+)', value: '+' }, { label: 'Multiplication (×)', value: '*' }] },
      { id: 'bin2', label: 'Second Binary String (e.g. 1011)', defaultValue: '1011', type: 'text' },
    ],
    calculate: (v) => {
      const b1 = parseInt(v.bin1 || '0', 2);
      const b2 = parseInt(v.bin2 || '0', 2);
      const op = v.op || '+';
      const dec = op === '+' ? b1 + b2 : b1 * b2;
      const binRes = dec.toString(2);
      return {
        primaryValue: binRes,
        primaryUnit: '(Base 2)',
        primaryLabel: 'Binary Result',
        secondaryOutputs: [
          { label: 'Decimal Equivalent', value: dec },
          { label: 'Hexadecimal Equivalent', value: '0x' + dec.toString(16).toUpperCase() },
        ],
        steps: [`${b1} (dec) ${op} ${b2} (dec) = ${dec} = ${binRes} (bin)`],
        formulaUsed: 'Binary Radix Arithmetic',
      };
    },
  },
  {
    slug: 'bitwise-calculator',
    title: 'Bitwise Logical Operations (AND, OR, XOR) Calculator',
    category: 'computer-networking',
    formulaDisplay: 'A & B, A | B, A ^ B, ~A',
    inputs: [
      { id: 'a', label: 'Operand A (Integer)', defaultValue: 60, type: 'number', step: 1 },
      { id: 'b', label: 'Operand B (Integer)', defaultValue: 13, type: 'number', step: 1 },
    ],
    calculate: (v) => {
      const a = Math.round(Number(v.a) || 0);
      const b = Math.round(Number(v.b) || 0);
      const and = a & b;
      const or = a | b;
      const xor = a ^ b;
      return {
        primaryValue: `AND: ${and} | OR: ${or} | XOR: ${xor}`,
        primaryLabel: 'Bitwise Outputs',
        secondaryOutputs: [
          { label: 'AND (A & B)', value: `${and} (0b${and.toString(2)})` },
          { label: 'OR (A | B)', value: `${or} (0b${or.toString(2)})` },
          { label: 'XOR (A ^ B)', value: `${xor} (0b${xor.toString(2)})` },
        ],
        steps: [`A = ${a.toString(2).padStart(8, '0')}`, `B = ${b.toString(2).padStart(8, '0')}`],
        formulaUsed: 'Hardware Bitwise ALU Logic',
      };
    },
  },
  {
    slug: 'storage-capacity-calculator',
    title: 'Storage Drive Capacity (Decimal GB vs Binary GiB) Calculator',
    category: 'computer-networking',
    formulaDisplay: 'GiB = Advertised GB × (10⁹ / 2³⁰)',
    inputs: [
      { id: 'advertisedGb', label: 'Advertised Drive Capacity (Decimal GB)', defaultValue: 1000, type: 'number', step: 250, unit: 'GB' },
    ],
    calculate: (v) => {
      const gb = Number(v.advertisedGb) || 1000;
      const totalBytes = gb * 1e9;
      const gib = totalBytes / Math.pow(1024, 3);
      const lost = gb - gib;
      return {
        primaryValue: parseFloat(gib.toFixed(2)),
        primaryUnit: 'GiB',
        primaryLabel: 'True Usable OS Capacity (GiB)',
        secondaryOutputs: [
          { label: 'Apparent "Missing" Space', value: `${lost.toFixed(1)} GB (${((lost / gb) * 100).toFixed(1)}%)` },
          { label: 'Total Raw Bytes', value: totalBytes.toLocaleString() },
        ],
        steps: [`OS calculates in binary (1,024³ bytes/GiB): ${totalBytes.toLocaleString()} / 1,073,741,824 = ${gib.toFixed(2)} GiB`],
        formulaUsed: 'GiB = (GB × 10⁹) / 2³⁰',
      };
    },
  },
  {
    slug: 'raid-calculator',
    title: 'RAID Usable Storage & Fault Tolerance Calculator',
    category: 'computer-networking',
    formulaDisplay: 'RAID 0 (N), RAID 1 (1), RAID 5 (N - 1), RAID 6 (N - 2)',
    inputs: [
      { id: 'driveSizeTb', label: 'Single Drive Size (TB)', defaultValue: 12, type: 'number', min: 1, step: 2, unit: 'TB' },
      { id: 'driveCount', label: 'Number of Disks', defaultValue: 6, type: 'number', min: 2, max: 24, step: 1 },
      {
        id: 'raidLevel',
        label: 'RAID Level',
        type: 'select',
        defaultValue: '5',
        options: [{ label: 'RAID 0 (Striping - No Redundancy)', value: '0' }, { label: 'RAID 1 (Mirroring)', value: '1' }, { label: 'RAID 5 (Single Parity)', value: '5' }, { label: 'RAID 6 (Dual Parity)', value: '6' }, { label: 'RAID 10 (Striped Mirrors)', value: '10' }],
      },
    ],
    calculate: (v) => {
      const size = Number(v.driveSizeTb) || 10;
      const n = Number(v.driveCount) || 4;
      const level = v.raidLevel || '5';
      let usable = 0, fault = 0;
      if (level === '0') { usable = n * size; fault = 0; }
      else if (level === '1') { usable = size; fault = n - 1; }
      else if (level === '5') { usable = Math.max(0, n - 1) * size; fault = 1; }
      else if (level === '6') { usable = Math.max(0, n - 2) * size; fault = 2; }
      else if (level === '10') { usable = (n / 2) * size; fault = 1; }
      return {
        primaryValue: usable,
        primaryUnit: 'TB Usable',
        primaryLabel: `RAID ${level} Usable Capacity`,
        secondaryOutputs: [
          { label: 'Drive Failure Tolerance', value: `${fault} simultaneous drive(s)` },
          { label: 'Storage Efficiency', value: `${((usable / (n * size)) * 100).toFixed(0)}%` },
        ],
        steps: [`Configured with ${n} disks of ${size} TB each under RAID ${level}.`],
        formulaUsed: 'Standard Redundant Array of Independent Disks Rules',
      };
    },
  },
  {
    slug: 'mtbf-calculator',
    title: 'MTBF & Hardware Reliability Calculator',
    category: 'computer-networking',
    formulaDisplay: 'Reliability R(t) = e^(-t / MTBF)',
    inputs: [
      { id: 'mtbfHours', label: 'Component MTBF Rating (Hours)', defaultValue: 1000000, type: 'number', step: 100000, unit: 'hrs' },
      { id: 'operatingYears', label: 'Continuous Operating Horizon (Years)', defaultValue: 3, type: 'number', step: 1, unit: 'years' },
    ],
    calculate: (v) => {
      const mtbf = Number(v.mtbfHours) || 500000;
      const t = (Number(v.operatingYears) || 1) * 8760; // hours
      const r = Math.exp(-t / mtbf) * 100;
      const afr = (1 - Math.exp(-8760 / mtbf)) * 100; // Annualized Failure Rate
      return {
        primaryValue: parseFloat(r.toFixed(2)),
        primaryUnit: '%',
        primaryLabel: 'Reliability (Survival Probability)',
        secondaryOutputs: [
          { label: 'Annualized Failure Rate (AFR)', value: `${afr.toFixed(2)}% / yr` },
        ],
        steps: [`R = e^(-${t}h / ${mtbf}h) = ${r.toFixed(2)}%`],
        formulaUsed: 'Exponential Reliability Law R(t) = e^(-λt)',
      };
    },
  },
  {
    slug: 'ethernet-cable-calculator',
    title: 'Ethernet Cable Length & Signal Attenuation Calculator',
    category: 'computer-networking',
    formulaDisplay: 'Max Standard Limit = 100 Meters (328 Feet)',
    inputs: [
      { id: 'lengthM', label: 'Cable Run Length (Meters)', defaultValue: 75, type: 'number', min: 1, max: 200, step: 5, unit: 'm' },
    ],
    calculate: (v) => {
      const l = Number(v.lengthM) || 50;
      const limit = 100; // IEEE 802.3 100m limit
      const compliant = l <= limit;
      return {
        primaryValue: compliant ? 'Compliant (Under 100m)' : 'EXCEEDED (Signal Degradation Risk)',
        primaryLabel: 'IEEE 802.3 Compliance',
        secondaryOutputs: [
          { label: 'Length in Feet', value: `${(l * 3.28084).toFixed(1)} ft` },
          { label: 'Headroom to 100m Limit', value: `${Math.max(0, limit - l)} meters` },
        ],
        steps: [`IEEE standards mandate 90m solid core horizontal link + 10m patch cable total = 100m.`],
        formulaUsed: 'ANSI/TIA-568 Ethernet Physical Layer Standard',
      };
    },
  },
  {
    slug: 'wifi-channel-calculator',
    title: 'Wi-Fi 2.4 GHz Non-Overlapping Channel Calculator',
    category: 'computer-networking',
    formulaDisplay: 'Non-overlapping channels: 1, 6, 11 (22 MHz width with 5 MHz spacing)',
    inputs: [
      { id: 'channel', label: 'Selected 2.4 GHz Channel (1 - 11)', defaultValue: 6, type: 'number', min: 1, max: 11, step: 1 },
    ],
    calculate: (v) => {
      const ch = Math.round(Number(v.channel) || 6);
      const isStandard = [1, 6, 11].includes(ch);
      const centerFreq = 2407 + ch * 5;
      return {
        primaryValue: isStandard ? 'Optimal Non-Overlapping Channel' : 'Interference Risk (Overlaps)',
        primaryLabel: `Channel ${ch} Assessment`,
        secondaryOutputs: [
          { label: 'Center Frequency', value: `${centerFreq} MHz` },
          { label: 'Recommended Non-Overlapping Alternatives', value: 'Channel 1, 6, or 11' },
        ],
        steps: [`Wi-Fi 802.11b/g/n channels require 25 MHz separation to prevent adjacent-channel interference.`],
        formulaUsed: 'IEEE 802.11 RF Spectral Mask',
      };
    },
  },
  {
    slug: 'ip-range-calculator',
    title: 'IP Range & Host Allocation Calculator',
    category: 'computer-networking',
    formulaDisplay: 'Calculates start, end, and total hosts in network',
    inputs: [
      { id: 'baseIp', label: 'Base Network IP', defaultValue: '10.0.0.0', type: 'text' },
      { id: 'numHosts', label: 'Required Number of Connected Hosts', defaultValue: 500, type: 'number', min: 1, step: 50 },
    ],
    calculate: (v) => {
      const hosts = Number(v.numHosts) || 100;
      const hostBits = Math.ceil(Math.log2(hosts + 2));
      const cidr = 32 - hostBits;
      const totalAllocated = Math.pow(2, hostBits);
      return {
        primaryValue: `/${cidr}`,
        primaryUnit: 'CIDR Subnet',
        primaryLabel: 'Smallest Subnet Mask Required',
        secondaryOutputs: [
          { label: 'Total IPs in Subnet', value: totalAllocated },
          { label: 'Usable Hosts Provided', value: totalAllocated - 2 },
        ],
        steps: [`Need ${hosts} hosts → 2^${hostBits} = ${totalAllocated} IPs → 32 - ${hostBits} = /${cidr}`],
        formulaUsed: 'CIDR Optimization Prefix',
      };
    },
  },
  {
    slug: 'dns-ttl-calculator',
    title: 'DNS TTL (Time-to-Live) Duration Converter',
    category: 'computer-networking',
    formulaDisplay: 'Seconds to Human Readable TTL',
    inputs: [
      { id: 'ttlSeconds', label: 'TTL in Seconds', defaultValue: 86400, type: 'number', min: 60, step: 300, unit: 'sec' },
    ],
    calculate: (v) => {
      const s = Number(v.ttlSeconds) || 3600;
      const hours = s / 3600;
      const days = hours / 24;
      return {
        primaryValue: hours >= 24 ? `${days.toFixed(1)} Days` : `${hours.toFixed(1)} Hours`,
        primaryLabel: 'Human Readable TTL',
        secondaryOutputs: [
          { label: 'Minutes', value: Math.round(s / 60) },
          { label: 'Caching Recommendation', value: s < 300 ? 'Fast Propagation (Migration)' : 'Standard Stable Record' },
        ],
        steps: [`${s} seconds converted to standard DNS resolver caching windows.`],
        formulaUsed: 'TTL Time Resolution',
      };
    },
  },
  {
    slug: 'video-bitrate-calculator',
    title: 'Streaming Video Bitrate & Bandwidth Calculator',
    category: 'computer-networking',
    formulaDisplay: 'Bitrate = Width × Height × FPS × BPP (Bits per Pixel)',
    inputs: [
      {
        id: 'res',
        label: 'Resolution',
        type: 'select',
        defaultValue: '1080',
        options: [{ label: '1080p FHD (1920x1080)', value: '1080' }, { label: '4K UHD (3840x2160)', value: '2160' }, { label: '720p HD (1280x720)', value: '720' }],
      },
      { id: 'fps', label: 'Frame Rate (FPS)', defaultValue: 60, type: 'number', step: 30, unit: 'FPS' },
    ],
    calculate: (v) => {
      const res = v.res || '1080';
      const fps = Math.max(1, Math.min(240, Number(v.fps) || 60));

      let width = 1920;
      let height = 1080;
      if (res === '2160') { width = 3840; height = 2160; }
      else if (res === '720') { width = 1280; height = 720; }

      const totalPixels = width * height;
      const bppFactor = fps <= 30 ? 0.075 : (0.075 * Math.pow(30 / fps, 0.25));
      const rawBitrateBps = totalPixels * fps * bppFactor;
      const bitrateMbps = parseFloat((rawBitrateBps / 1000000).toFixed(2));

      const gbPerHour = (bitrateMbps * 3600) / 8000;
      const reqUploadMbps = parseFloat((bitrateMbps * 1.25).toFixed(1));

      return {
        primaryValue: bitrateMbps,
        primaryUnit: 'Mbps Video Bitrate',
        primaryLabel: 'Recommended Video Encoding Bitrate',
        secondaryOutputs: [
          { label: 'Data Consumed per Hour', value: `${gbPerHour.toFixed(2)} GB/hr` },
          { label: 'Target Frame Rate', value: `${fps} FPS` },
          { label: 'Pixel Resolution', value: `${width} × ${height}` },
          { label: 'Minimum Upload Bandwidth (+25% Headroom)', value: `${reqUploadMbps} Mbps` },
        ],
        steps: [
          `Target Frame: ${width} × ${height} (${(totalPixels / 1e6).toFixed(2)} Megapixels) @ ${fps} FPS.`,
          `Encoding Formula: Bitrate = (Resolution Pixels × FPS × Bits-Per-Pixel Factor) ÷ 1,000,000.`,
          `Computed Bitrate: ${bitrateMbps} Mbps for broadcast-quality stream.`,
          `Hourly Bandwidth: ${bitrateMbps} Mbps × 3600s ÷ 8,000 Mb/GB = ${gbPerHour.toFixed(2)} GB/hour.`
        ],
        formulaUsed: 'Broadcasting Standards (Pixels × FPS × BPP Factor)',
      };
    },
  },

  // PROGRAMMING (10)
  {
    slug: 'big-o-calculator',
    title: 'Big-O Algorithmic Complexity Growth Calculator',
    category: 'programming',
    formulaDisplay: 'O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)',
    inputs: [
      { id: 'n', label: 'Input Element Size (N)', defaultValue: 1000, type: 'number', min: 1, step: 100 },
    ],
    calculate: (v) => {
      const n = Math.max(1, Number(v.n) || 100);
      const logN = Math.log2(n);
      const nLogN = n * logN;
      const nSq = n * n;
      return {
        primaryValue: Math.round(nLogN).toLocaleString(),
        primaryUnit: 'Ops (O(n log n))',
        primaryLabel: 'O(N log N) Quicksort Operations',
        secondaryOutputs: [
          { label: 'O(N) Linear Operations', value: n.toLocaleString() },
          { label: 'O(log N) Binary Search', value: Math.ceil(logN) },
          { label: 'O(N²) Quadratic Comparisons', value: nSq.toLocaleString() },
        ],
        steps: [`Calculated theoretical operations across standard complexity classes for N = ${n}`],
        formulaUsed: 'Asymptotic Algorithmic Complexity',
      };
    },
  },
  {
    slug: 'hex-to-rgb-calculator',
    title: 'Hex Color to RGB & HSL Converter',
    category: 'programming',
    formulaDisplay: '#RRGGBB → rgb(R, G, B)',
    inputs: [
      { id: 'hex', label: 'Hexadecimal Color (#RGB or #RRGGBB)', defaultValue: '#4F46E5', type: 'text' },
    ],
    calculate: (v) => {
      let hex = String(v.hex || '#ffffff').replace('#', '').trim();
      if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
      const r = parseInt(hex.substring(0, 2), 16) || 0;
      const g = parseInt(hex.substring(2, 4), 16) || 0;
      const b = parseInt(hex.substring(4, 6), 16) || 0;
      return {
        primaryValue: `rgb(${r}, ${g}, ${b})`,
        primaryLabel: 'RGB Color Value',
        secondaryOutputs: [
          { label: 'CSS Hex', value: `#${hex.toUpperCase()}` },
          { label: 'Normalized RGB (0-1)', value: `(${(r / 255).toFixed(2)}, ${(g / 255).toFixed(2)}, ${(b / 255).toFixed(2)})` },
        ],
        steps: [`R: 0x${hex.substring(0, 2)} = ${r}, G: 0x${hex.substring(2, 4)} = ${g}, B: 0x${hex.substring(4, 6)} = ${b}`],
        formulaUsed: 'Hexadecimal to 24-Bit Truecolor',
      };
    },
  },
  {
    slug: 'chmod-calculator',
    title: 'Linux Chmod Octal Permissions Calculator',
    category: 'programming',
    formulaDisplay: 'r=4, w=2, x=1 for User, Group, Others',
    inputs: [
      { id: 'userVal', label: 'User Permission (0 - 7, e.g. 7 for rwx)', defaultValue: 7, type: 'number', min: 0, max: 7, step: 1 },
      { id: 'groupVal', label: 'Group Permission (0 - 7, e.g. 5 for r-x)', defaultValue: 5, type: 'number', min: 0, max: 7, step: 1 },
      { id: 'otherVal', label: 'Other Permission (0 - 7, e.g. 5 for r-x)', defaultValue: 5, type: 'number', min: 0, max: 7, step: 1 },
    ],
    calculate: (v) => {
      const u = Number(v.userVal) || 0;
      const g = Number(v.groupVal) || 0;
      const o = Number(v.otherVal) || 0;
      const toSym = (val: number) => {
        let s = '';
        s += (val & 4) ? 'r' : '-';
        s += (val & 2) ? 'w' : '-';
        s += (val & 1) ? 'x' : '-';
        return s;
      };
      const sym = `-${toSym(u)}${toSym(g)}${toSym(o)}`;
      return {
        primaryValue: `chmod ${u}${g}${o}`,
        primaryLabel: 'Octal Chmod Command',
        secondaryOutputs: [
          { label: 'Symbolic Notation', value: sym },
        ],
        steps: [`User: ${u} (${toSym(u)}), Group: ${g} (${toSym(g)}), Other: ${o} (${toSym(o)})`],
        formulaUsed: 'POSIX Octal File Permissions',
      };
    },
  },
  {
    slug: 'crc32-calculator',
    title: 'CRC32 Checksum Hash Calculator',
    category: 'programming',
    formulaDisplay: 'IEEE 802.3 32-bit Cyclic Redundancy Check',
    inputs: [
      { id: 'text', label: 'String Input', defaultValue: 'CalcUniverse', type: 'text' },
    ],
    calculate: (v) => {
      const str = String(v.text || '');
      let crc = 0 ^ (-1);
      for (let i = 0; i < str.length; i++) {
        crc = (crc >>> 8) ^ ((crc ^ str.charCodeAt(i)) & 0xFF);
      }
      crc = (crc ^ (-1)) >>> 0;
      const hex = crc.toString(16).toUpperCase().padStart(8, '0');
      return {
        primaryValue: `0x${hex}`,
        primaryLabel: 'CRC32 Hex Checksum',
        secondaryOutputs: [
          { label: 'Unsigned Integer', value: crc },
          { label: 'String Length', value: str.length },
        ],
        steps: [`Computed 32-bit cyclic redundancy code polynomial.`],
        formulaUsed: 'IEEE 802.3 CRC-32 Algorithm',
      };
    },
  },
  {
    slug: 'regex-calculator',
    title: 'Regular Expression Match & Quantifier Estimator',
    category: 'programming',
    formulaDisplay: 'Deterministic Finite Automaton Pattern Match',
    inputs: [
      { id: 'pattern', label: 'RegEx Pattern', defaultValue: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b', type: 'text' },
      { id: 'sample', label: 'Test String', defaultValue: 'Contact us at support@calcuniverse.org today', type: 'text' },
    ],
    calculate: (v) => {
      const pat = String(v.pattern || '');
      const str = String(v.sample || '');
      try {
        const re = new RegExp(pat);
        const match = re.exec(str);
        return {
          primaryValue: match ? `Match Found: "${match[0]}"` : 'No Match',
          primaryLabel: 'Pattern Test Result',
          secondaryOutputs: [
            { label: 'Valid Regex Syntax?', value: 'Yes' },
          ],
          steps: [`Pattern compiled and tested against input text.`],
          formulaUsed: 'ECMAScript RegExp Engine',
        };
      } catch (err: any) {
        return { primaryValue: 'Syntax Error', primaryLabel: 'Error', error: err.message };
      }
    },
  },
  {
    slug: 'ascii-calculator',
    title: 'ASCII Text to Decimal & Binary Converter',
    category: 'programming',
    formulaDisplay: 'Character Code Point Mapping (7-Bit Standard)',
    inputs: [
      { id: 'text', label: 'Characters (e.g. Code)', defaultValue: 'Code', type: 'text' },
    ],
    calculate: (v) => {
      const str = String(v.text || 'A');
      const codes = Array.from(str).map((c) => c.charCodeAt(0));
      const binaries = codes.map((c) => c.toString(2).padStart(8, '0'));
      const hexes = codes.map((c) => c.toString(16).toUpperCase());
      return {
        primaryValue: codes.join(' '),
        primaryLabel: 'Decimal ASCII Codes',
        secondaryOutputs: [
          { label: 'Binary Equivalent', value: binaries.join(' ') },
          { label: 'Hex Equivalent', value: hexes.join(' ') },
        ],
        steps: [`Converted characters into standard ASCII decimal codes.`],
        formulaUsed: 'ANSI / ISO 646 Character Encoding',
      };
    },
  },
  {
    slug: 'base64-overhead-calculator',
    title: 'Base64 Encoding Size Overhead Calculator',
    category: 'programming',
    formulaDisplay: 'Base64 Size = 4 × ceil(Raw Bytes / 3) (+33.3% Expansion)',
    inputs: [
      { id: 'rawKb', label: 'Raw Binary / Image Size (Kilobytes, KB)', defaultValue: 150, type: 'number', min: 0.1, step: 10, unit: 'KB' },
    ],
    calculate: (v) => {
      const kb = Number(v.rawKb) || 100;
      const rawBytes = kb * 1024;
      const b64Bytes = 4 * Math.ceil(rawBytes / 3);
      const b64Kb = b64Bytes / 1024;
      const overhead = b64Kb - kb;
      return {
        primaryValue: parseFloat(b64Kb.toFixed(1)),
        primaryUnit: 'KB',
        primaryLabel: 'Base64 Encoded Payload Size',
        secondaryOutputs: [
          { label: 'Overhead Added (+33.3%)', value: `+${overhead.toFixed(1)} KB` },
          { label: 'Padding Characters Added', value: `${(4 - (rawBytes % 3)) % 3} equal signs (=)` },
        ],
        steps: [`4 × ceil(${rawBytes} / 3) = ${b64Bytes} bytes = ${b64Kb.toFixed(1)} KB`],
        formulaUsed: 'RFC 4648 Base64 Specification',
      };
    },
  },
  {
    slug: 'ms-to-human-time-calculator',
    title: 'Milliseconds to Human Readable Duration Calculator',
    category: 'programming',
    formulaDisplay: 'MS converted into Days, Hours, Minutes, Seconds',
    inputs: [
      { id: 'ms', label: 'Milliseconds (ms)', defaultValue: 86450000, type: 'number', step: 1000, unit: 'ms' },
    ],
    calculate: (v) => {
      const totalMs = Number(v.ms) || 0;
      const s = Math.floor(totalMs / 1000);
      const days = Math.floor(s / 86400);
      const hours = Math.floor((s % 86400) / 3600);
      const min = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      const remMs = totalMs % 1000;
      return {
        primaryValue: `${days}d ${hours}h ${min}m ${sec}s`,
        primaryLabel: 'Formatted Duration',
        secondaryOutputs: [
          { label: 'Exact Seconds', value: (totalMs / 1000).toFixed(3) },
          { label: 'Remaining Milliseconds', value: remMs },
        ],
        steps: [`Decomposed ${totalMs} ms into days, hours, minutes, and seconds.`],
        formulaUsed: 'Temporal Unit Reduction',
      };
    },
  },
  {
    slug: 'machine-epsilon-calculator',
    title: 'Floating-Point Machine Epsilon Calculator',
    category: 'programming',
    formulaDisplay: 'IEEE 754 Double Precision Epsilon = 2^(-52) ≈ 2.22 × 10^-16',
    inputs: [
      { id: 'baseVal', label: 'Base Float Number', defaultValue: 1.0, type: 'number', step: 0.1 },
    ],
    calculate: (v) => {
      const base = Number(v.baseVal) ?? 1.0;
      const standardEps = Number.EPSILON;

      let localEps = standardEps;
      let exponent = 0;
      if (base !== 0 && !isNaN(base) && isFinite(base)) {
        exponent = Math.floor(Math.log2(Math.abs(base)));
        localEps = Math.pow(2, exponent - 52);
      } else if (base === 0) {
        localEps = 5e-324;
      }

      const nextFloat = base + localEps;
      const halfEpsTest = base + (localEps / 2);
      const isNextDistinct = nextFloat > base;
      const isHalfRounded = halfEpsTest === base;

      return {
        primaryValue: localEps.toExponential(4),
        primaryUnit: `ULP Spacing at x = ${base}`,
        primaryLabel: 'Local Machine Precision (ULP / Epsilon)',
        secondaryOutputs: [
          { label: 'IEEE 754 Standard Unit Epsilon (x = 1.0)', value: standardEps.toExponential(4) },
          { label: 'Floating Exponent Scale', value: `2^${exponent}` },
          { label: `Base + Epsilon > Base?`, value: isNextDistinct ? 'True (Distinct Float)' : 'False' },
          { label: `Base + (Epsilon/2) Rounds to Base?`, value: isHalfRounded ? 'True (Precision Boundary)' : 'False' },
        ],
        steps: [
          `IEEE 754 64-bit double precision has a 53-bit significand (52 explicit bits).`,
          `Standard Machine Epsilon at 1.0 is 2^-52 ≈ ${standardEps.toExponential(4)}.`,
          base !== 1.0
            ? `At base value ${base}, the exponent scale is 2^${exponent}, yielding local spacing = 2^(${exponent} - 52) = ${localEps.toExponential(4)}.`
            : `At base value 1.0, local spacing matches standard machine epsilon exactly (${standardEps.toExponential(4)}).`,
          `Any delta smaller than ${localEps.toExponential(4)} cannot be distinguished from ${base} in 64-bit float math.`
        ],
        formulaUsed: 'IEEE 754 Double Precision Local ULP: 2^(floor(log₂(x)) - 52)',
      };
    },
  },
  {
    slug: 'struct-alignment-calculator',
    title: 'Data Structure Memory Alignment & Padding Calculator',
    category: 'programming',
    formulaDisplay: 'Padding = (Align - (Offset % Align)) % Align',
    inputs: [
      { id: 'type1', label: 'Member 1 Size (e.g. char=1, int=4, double=8)', defaultValue: 1, type: 'number', step: 1, unit: 'bytes' },
      { id: 'type2', label: 'Member 2 Size', defaultValue: 8, type: 'number', step: 1, unit: 'bytes' },
      { id: 'type3', label: 'Member 3 Size', defaultValue: 4, type: 'number', step: 1, unit: 'bytes' },
    ],
    calculate: (v) => {
      const s1 = Number(v.type1) || 1;
      const s2 = Number(v.type2) || 4;
      const s3 = Number(v.type3) || 4;
      const maxAlign = Math.max(s1, s2, s3);
      // member 1 at offset 0
      let offset = s1;
      // pad to align member 2
      const pad1 = (s2 - (offset % s2)) % s2;
      offset += pad1 + s2;
      // pad to align member 3
      const pad2 = (s3 - (offset % s3)) % s3;
      offset += pad2 + s3;
      // pad struct to multiple of maxAlign
      const finalPad = (maxAlign - (offset % maxAlign)) % maxAlign;
      const totalSize = offset + finalPad;
      const rawSize = s1 + s2 + s3;
      return {
        primaryValue: totalSize,
        primaryUnit: 'Bytes',
        primaryLabel: 'Total Struct Size with Padding',
        secondaryOutputs: [
          { label: 'Wasted Memory Padding', value: `${totalSize - rawSize} bytes` },
          { label: 'Raw Unaligned Sum', value: `${rawSize} bytes` },
        ],
        steps: [`Aligned each field to natural memory boundary with ${totalSize - rawSize} padding bytes added.`],
        formulaUsed: 'C/C++ ABI Memory Alignment',
      };
    },
  },
];
