#!/usr/bin/env node

/**
 * Localization Checker for Roots Project
 * 
 * This script scans the frontend codebase for potentially untranslated strings
 * and provides suggestions for proper localization.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const FRONTEND_DIR = path.join(__dirname, '../frontend/src');
const PATTERNS_TO_CHECK = [
  '**/*.tsx',
  '**/*.ts',
  '!**/*.d.ts',
  '!**/node_modules/**',
  '!**/dist/**'
];

// Common patterns that indicate untranslated strings
const UNTRANSLATED_PATTERNS = [
  // JSX text content
  />[\s]*[A-Z][^<>]*[a-zA-Z][\s]*</g,
  // String literals in JSX attributes (excluding common props)
  /(?:placeholder|title|alt|label)=["'][^"']*[A-Za-z]{3,}[^"']*["']/g,
  // Button text
  /<Button[^>]*>[\s]*[^<]*[A-Za-z]{3,}[^<]*[\s]*<\/Button>/g,
  // Heading tags
  /<h[1-6][^>]*>[\s]*[^<]*[A-Za-z]{3,}[^<]*[\s]*<\/h[1-6]>/g
];

// Exceptions - patterns to ignore
const IGNORE_PATTERNS = [
  /TranslatedText/,
  /translateText/,
  /import/,
  /export/,
  /console\./,
  /className/,
  /onClick/,
  /onChange/,
  /onSubmit/,
  /useEffect/,
  /useState/,
  /const\s+\w+/,
  /function\s+\w+/,
  /interface\s+\w+/,
  /type\s+\w+/,
  // Common English words that appear in code
  /\b(div|span|button|input|form|table|tr|td|th|ul|li|ol|nav|header|footer|main|section|article|aside)\b/i,
  // File paths and URLs
  /[\w-]+\.(tsx?|jsx?|css|scss|json|md|html)/,
  /https?:\/\//,
  // API and technical terms
  /\b(api|sdk|url|http|json|xml|css|html|js|ts|jsx|tsx)\b/i
];

function shouldIgnoreLine(line) {
  return IGNORE_PATTERNS.some(pattern => pattern.test(line));
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();
    
    // Skip empty lines, comments, and ignored patterns
    if (!trimmedLine || 
        trimmedLine.startsWith('//') || 
        trimmedLine.startsWith('/*') || 
        trimmedLine.startsWith('*') ||
        shouldIgnoreLine(trimmedLine)) {
      return;
    }

    // Check for potential untranslated strings
    UNTRANSLATED_PATTERNS.forEach(pattern => {
      const matches = trimmedLine.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Additional filtering to reduce false positives
          if (match.length > 10 && 
              /[A-Za-z]/.test(match) && 
              !shouldIgnoreLine(match)) {
            issues.push({
              line: lineNumber,
              content: trimmedLine,
              match: match.trim(),
              suggestion: getSuggestion(match.trim())
            });
          }
        });
      }
    });
  });

  return issues;
}

function getSuggestion(text) {
  // Extract the actual text content
  let cleanText = text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/["']/g, '') // Remove quotes
    .trim();

  if (cleanText.length < 3) return null;

  return `<TranslatedText>${cleanText}</TranslatedText>`;
}

function main() {
  console.log('🌍 Checking localization compliance...\n');
  
  const files = glob.sync(PATTERNS_TO_CHECK, { cwd: FRONTEND_DIR });
  let totalIssues = 0;
  let filesWithIssues = 0;

  files.forEach(file => {
    const fullPath = path.join(FRONTEND_DIR, file);
    const issues = checkFile(fullPath);
    
    if (issues.length > 0) {
      filesWithIssues++;
      totalIssues += issues.length;
      
      console.log(`❌ ${file}`);
      issues.forEach(issue => {
        console.log(`   Line ${issue.line}: ${issue.match}`);
        if (issue.suggestion) {
          console.log(`   💡 Suggestion: ${issue.suggestion}`);
        }
        console.log('');
      });
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`   Files checked: ${files.length}`);
  console.log(`   Files with issues: ${filesWithIssues}`);
  console.log(`   Total potential issues: ${totalIssues}`);
  
  if (totalIssues === 0) {
    console.log(`   ✅ Great! No obvious untranslated strings found.`);
  } else {
    console.log(`   ⚠️  Please review the issues above and wrap strings with TranslatedText`);
    console.log(`   📚 See .cursorrules for detailed localization guidelines`);
  }

  // Exit with error code if issues found (for CI/CD)
  process.exit(totalIssues > 0 ? 1 : 0);
}

if (require.main === module) {
  main();
}

module.exports = { checkFile, shouldIgnoreLine }; 