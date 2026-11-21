import fs from 'fs';
import path from 'path';

// Helper to parse standard CSV with multi-line quoted strings
function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField);
      if (currentRow.some(f => f.trim() !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some(f => f.trim() !== '')) {
      rows.push(currentRow);
    }
  }

  if (rows.length === 0) return [];
  const headers = rows[0].map(h => h.trim());
  const results: Record<string, string>[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const obj: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]] = row[c] ?? '';
    }
    results.push(obj);
  }

  return results;
}

const assetsDir = path.resolve(process.cwd(), 'public/assets/aistudio');

const calcCatCSV = fs.readFileSync(path.join(assetsDir, 'calc_categories__1__3261e2d1.csv'), 'utf8');
const calcCategories = parseCSV(calcCatCSV);

const calcCSV = fs.readFileSync(path.join(assetsDir, 'calculators__1__463cc0d4.csv'), 'utf8');
const calculators = parseCSV(calcCSV);

const blogCatCSV = fs.readFileSync(path.join(assetsDir, 'blog_categories__1__90b10b57.csv'), 'utf8');
const blogCategories = parseCSV(blogCatCSV);

const postsCSV = fs.readFileSync(path.join(assetsDir, 'posts__3__b6848e70.csv'), 'utf8');
const posts = parseCSV(postsCSV);

console.log(`Parsed:
- ${calcCategories.length} calculator categories
- ${calculators.length} calculators
- ${blogCategories.length} blog categories
- ${posts.length} blog posts`);

// Ensure src/data exists
const outDir = path.resolve(process.cwd(), 'src/data');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'calcCategoriesData.json'), JSON.stringify(calcCategories, null, 2));
fs.writeFileSync(path.join(outDir, 'calculatorsData.json'), JSON.stringify(calculators, null, 2));
fs.writeFileSync(path.join(outDir, 'blogCategoriesData.json'), JSON.stringify(blogCategories, null, 2));
fs.writeFileSync(path.join(outDir, 'postsData.json'), JSON.stringify(posts, null, 2));

console.log('Successfully written JSON datasets to src/data!');
