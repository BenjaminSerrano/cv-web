// Simple test of the BibTeX parser
const fs = require('fs');

// Simulate the parseBibTeX function (simplified version)
function parseBibTeX(bibTexContent) {
  const entries = [];
  
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
    const fields = {};
    
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
          fields[currentField.toLowerCase()] = currentValue.replace(/,\s*$/, '').trim();
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
      fields[currentField.toLowerCase()] = currentValue.replace(/,\s*$/, '').trim();
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

try {
  // Test with conference file
  const confContent = fs.readFileSync('./public/refsConf.bib', 'utf-8');
  console.log('Conference file length:', confContent.length);
  
  const entries = parseBibTeX(confContent);
  console.log('Parsed entries:', entries.length);
  
  // Show first few entries
  entries.slice(0, 3).forEach((entry, i) => {
    console.log(`\nEntry ${i + 1}:`);
    console.log('Type:', entry.type);
    console.log('Key:', entry.key);
    console.log('Title:', entry.fields.title);
    console.log('Year:', entry.fields.year);
    console.log('Authors:', entry.fields.author);
  });
  
} catch (error) {
  console.error('Error:', error);
}