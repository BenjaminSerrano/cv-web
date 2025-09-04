interface BibTeXEntry {
  type: string;
  key: string;
  fields: Record<string, string>;
}

interface ParsedPaper {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  volume?: string;
  number?: string;
  pages?: string;
  doi?: string;
  url?: string;
  type: 'article' | 'conference';
  keywords: string[];
  publisher?: string;
  booktitle?: string;
  month?: string;
}

export function parseBibTeX(bibTexContent: string): BibTeXEntry[] {
  const entries: BibTeXEntry[] = [];
  
  // Remove comments and normalize
  const content = bibTexContent
    .replace(/%.*$/gm, '') // Remove comments
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
  
  // Split by @ symbols to get potential entries
  const parts = content.split(/@/).filter(part => part.trim());
  
  for (const part of parts) {
    const lines = part.trim().split('\n');
    if (lines.length === 0) continue;
    
    // First line should be type{key,
    const firstLine = lines[0].trim();
    const typeMatch = firstLine.match(/^(\w+)\s*\{\s*([^,\s}]+)\s*,?/);
    
    if (!typeMatch) continue;
    
    const [, type, key] = typeMatch;
    const fields: Record<string, string> = {};
    
    // Process remaining lines for fields
    let currentField = '';
    let currentValue = '';
    let braceDepth = 0;
    let inValue = false;
    
    // Start from line 1 (skip the type{key line)
    const fieldLines = lines.slice(1);
    
    for (let i = 0; i < fieldLines.length; i++) {
      let line = fieldLines[i].trim();
      
      // Skip empty lines and closing brace
      if (!line || line === '}') continue;
      
      // Check if this line starts a new field
      const fieldMatch = line.match(/^(\w+)\s*=\s*(.*)$/);
      
      if (fieldMatch && braceDepth === 0) {
        // Save previous field if it exists
        if (currentField && currentValue) {
          fields[currentField.toLowerCase()] = cleanFieldValue(currentValue);
        }
        
        // Start new field
        currentField = fieldMatch[1];
        currentValue = fieldMatch[2];
        inValue = true;
        
        // Count braces in the initial value
        braceDepth = 0;
        for (const char of currentValue) {
          if (char === '{') braceDepth++;
          else if (char === '}') braceDepth--;
        }
        
        // Remove trailing comma if balanced
        if (braceDepth === 0) {
          currentValue = currentValue.replace(/,\s*$/, '');
        }
      } else if (inValue) {
        // Continue current field value
        currentValue += ' ' + line;
        
        // Update brace count
        for (const char of line) {
          if (char === '{') braceDepth++;
          else if (char === '}') braceDepth--;
        }
        
        // Remove trailing comma if balanced
        if (braceDepth === 0) {
          currentValue = currentValue.replace(/,\s*$/, '');
        }
      }
    }
    
    // Save last field
    if (currentField && currentValue) {
      fields[currentField.toLowerCase()] = cleanFieldValue(currentValue);
    }
    
    if (Object.keys(fields).length > 0) {
      entries.push({
        type: type.toLowerCase(),
        key: key.trim(),
        fields
      });
    }
  }
  
  return entries;
}

function cleanFieldValue(value: string): string {
  let result = value;
  
  // First, handle nested braces and LaTeX commands more carefully
  // Remove outer braces
  result = result.replace(/^\s*\{+/, '').replace(/\}+\s*$/, '');
  
  // Handle various LaTeX formatting commands - more aggressive approach
  // Handle \textbf in various formats
  result = result.replace(/\\textbf\s*\{([^{}]*(?:\{[^}]*\}[^{}]*)*)\}/g, '$1');
  result = result.replace(/\{\\textbf\s*\{([^}]*)\}\}/g, '$1');
  result = result.replace(/\{\\textbf\s+([^}]*)\}/g, '$1');
  
  // Handle other formatting commands
  result = result.replace(/\\(?:textit|emph|textsc|texttt)\s*\{([^{}]*(?:\{[^}]*\}[^{}]*)*)\}/g, '$1');
  
  // Remove any remaining \textbf without proper braces
  result = result.replace(/\\textbf\{?/g, '');
  result = result.replace(/\\(?:textit|emph|textsc|texttt)\{?/g, '');
  
  // Clean up remaining braces - be more aggressive
  while (result.includes('{') || result.includes('}')) {
    const before = result;
    result = result.replace(/\{([^{}]*)\}/g, '$1'); // Remove single level braces
    result = result.replace(/[{}]/g, ''); // Remove unmatched braces
    if (before === result) break; // Prevent infinite loop
  }
  
  // Handle LaTeX accents and special characters
  result = result.replace(/\\['"`^~]/g, '');
  result = result.replace(/\\'([aeiouAEIOU])/g, '$1');
  result = result.replace(/\\~([nN])/g, '$1');
  result = result.replace(/\\"/g, '"');
  result = result.replace(/\\'/g, "'");
  result = result.replace(/\\\\/g, '\\');
  
  // Clean up quotes and normalize spaces
  result = result.replace(/^\s*["']+/, '').replace(/["']+\s*$/, '');
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
}

function parseAuthors(authorString: string): string[] {
  if (!authorString) return [];
  
  // Handle different author formats
  let cleanAuthors = cleanFieldValue(authorString);
  
  // Split by " and " or ", " 
  let authors = cleanAuthors.split(/ and |, /)
    .map(author => cleanAuthorName(author.trim()))
    .filter(author => author.length > 0);
  
  return authors;
}

function cleanAuthorName(name: string): string {
  return name
    .replace(/^\{+/, '') // Remove leading braces
    .replace(/\}+$/, '') // Remove trailing braces
    .replace(/\{\\textbf\{([^}]*)\}\}/g, '$1') // Remove \textbf{}
    .replace(/\{([^}]*)\}/g, '$1') // Remove braces
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\'([aeiouAEIOU])/g, '$1')
    .replace(/\\~([nN])/g, '$1')
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

function extractKeywords(title: string, journal?: string, booktitle?: string): string[] {
  const keywords: string[] = [];
  const text = `${title} ${journal || ''} ${booktitle || ''}`.toLowerCase();
  
  const keywordMap = {
    'machine learning': ['machine learning', 'ml ', 'learning', 'lstm', 'neural network'],
    'optimization': ['optimization', 'optimizing', 'optimize'],
    'algorithms': ['algorithm', 'algorithms'],
    'biomimetic': ['biomimetic', 'bio-inspired', 'nature-inspired'],
    'particle swarm': ['particle swarm', 'pso'],
    'feature selection': ['feature selection', 'feature'],
    'reinforcement learning': ['reinforcement learning', 'q-learning'],
    'cybersecurity': ['cybersecurity', 'security', 'cyber'],
    'deep learning': ['deep learning', 'neural network', 'cnn', 'lstm'],
    'metaheuristics': ['metaheuristic', 'metaheuristics'],
    'cuckoo search': ['cuckoo search', 'cuckoo'],
    'orca algorithm': ['orca', 'predator'],
    'swarm intelligence': ['swarm intelligence', 'swarm'],
    'combinatorial': ['combinatorial', 'combinatorial optimization'],
    'knapsack': ['knapsack'],
    'bin packing': ['bin packing'],
    'social networks': ['social network', 'influence spread'],
    'multi-objective': ['multi-objective', 'many-objective'],
    'agile': ['agile', 'team size'],
    'ultrasonic': ['ultrasonic', 'ultrasonics', 'guided wave'],
    'forecasting': ['forecasting', 'prediction', 'forecast'],
    'retail': ['retail', 'customer flow'],
    'classification': ['classification', 'classifier']
  };
  
  for (const [keyword, patterns] of Object.entries(keywordMap)) {
    if (patterns.some(pattern => text.includes(pattern))) {
      keywords.push(keyword);
    }
  }
  
  return keywords.length > 0 ? keywords : ['algorithms', 'optimization'];
}

export function bibEntryToPaper(entry: BibTeXEntry, id: string): ParsedPaper | null {
  const { fields } = entry;
  
  if (!fields.title) {
    console.log('Skipping entry without title:', entry.key);
    return null;
  }
  
  const authors = parseAuthors(fields.author || '');
  const title = cleanFieldValue(fields.title);
  
  // Parse year - handle "2025, to appear" format
  let year = new Date().getFullYear();
  if (fields.year) {
    const yearMatch = fields.year.match(/(\d{4})/);
    if (yearMatch) {
      year = parseInt(yearMatch[1]);
    }
  }
  
  // Determine venue
  const journal = fields.journal || fields.booktitle || 'Unknown Venue';
  
  // Determine type
  const type: 'article' | 'conference' = entry.type === 'article' ? 'article' : 'conference';
  
  // Extract keywords
  const keywords = extractKeywords(title, fields.journal, fields.booktitle);
  
  return {
    id,
    title,
    authors,
    journal,
    year,
    volume: fields.volume,
    number: fields.number,
    pages: fields.pages,
    doi: fields.doi,
    url: fields.url,
    type,
    keywords,
    publisher: fields.publisher,
    booktitle: fields.booktitle,
    month: fields.month
  };
}

export async function loadBibTeXFiles(): Promise<ParsedPaper[]> {
  const papers: ParsedPaper[] = [];
  
  try {
    // Load conference papers
    console.log('Loading conference papers...');
    const confResponse = await fetch('/refsConf.bib');
    if (!confResponse.ok) {
      console.error('Failed to load refsConf.bib:', confResponse.status);
    } else {
      const confContent = await confResponse.text();
      console.log('Conference BibTeX content length:', confContent.length);
      
      // Debug: show first 500 chars
      console.log('Conference content preview:', confContent.substring(0, 500));
      
      const confEntries = parseBibTeX(confContent);
      console.log('Parsed conference entries:', confEntries.length);
      
      confEntries.forEach((entry, index) => {
        console.log(`Processing conference entry ${index + 1}:`, entry.key, entry.fields.title);
        const paper = bibEntryToPaper(entry, `conf_${entry.key || index}`);
        if (paper) {
          console.log('✓ Added conference paper:', paper.title);
          papers.push(paper);
        } else {
          console.log('✗ Failed to process conference entry:', entry.key);
        }
      });
    }
    
    // Load journal articles
    console.log('Loading journal articles...');
    const jourResponse = await fetch('/refsJour.bib');
    if (!jourResponse.ok) {
      console.error('Failed to load refsJour.bib:', jourResponse.status);
    } else {
      const jourContent = await jourResponse.text();
      console.log('Journal BibTeX content length:', jourContent.length);
      
      const jourEntries = parseBibTeX(jourContent);
      console.log('Parsed journal entries:', jourEntries.length);
      
      jourEntries.forEach((entry, index) => {
        console.log(`Processing journal entry ${index + 1}:`, entry.key, entry.fields.title);
        const paper = bibEntryToPaper(entry, `jour_${entry.key || index}`);
        if (paper) {
          console.log('✓ Added journal paper:', paper.title);
          papers.push(paper);
        } else {
          console.log('✗ Failed to process journal entry:', entry.key);
        }
      });
    }
    
    console.log('Total papers loaded:', papers.length);
    
    // Sort by year (newest first)
    return papers.sort((a, b) => b.year - a.year);
    
  } catch (error) {
    console.error('Error loading BibTeX files:', error);
    return [];
  }
}