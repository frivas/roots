node -e "
const fs = require('fs');
const content = fs.readFileSync('frontend/src/services/SpanishTranslations.ts', 'utf8');
const lines = content.split('\n');
const keys = {};
const duplicates = [];

lines.forEach((line, index) => {
  const match = line.match(/^\s*\"([^\"]+)\":\s*\"[^\"]*\",?\s*$/);
  if (match) {
    const key = match[1];
    if (keys[key]) {
      duplicates.push({key, line1: keys[key], line2: index + 1});
    } else {
      keys[key] = index + 1;
    }
  }
});

if (duplicates.length === 0) {
  console.log('No duplicate keys found! ✅');
} else {
  console.log('Duplicate keys found:');
  duplicates.forEach(dup => {
    console.log(\`'\${dup.key}' appears on lines \${dup.line1} and \${dup.line2}\`);
  });
}
"
