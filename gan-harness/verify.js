const fs = require('fs');

// 1. Verify index.html contains all IDs
const html = fs.readFileSync('index.html', 'utf8');

const requiredIds = [
  'tab-dashboard',
  'dash-greeting-badge',
  'dash-streak-count',
  'dash-level-text',
  'dash-xp-fraction',
  'dash-xp-bar-inner',
  'btn-dash-hero-continue',
  'dash-hero-continue-text',
  'daily-affirmation-card',
  'affirmation-deck-count',
  'affirmation-card-body',
  'dash-radar-composite',
  'dash-radar-tr-score',
  'dash-radar-tr-bar',
  'dash-radar-cc-score',
  'dash-radar-cc-bar',
  'dash-radar-lr-score',
  'dash-radar-lr-bar',
  'dash-radar-gra-score',
  'dash-radar-gra-bar',
  'dash-overall-percent',
  'dash-p1-bar',
  'dash-p1-label',
  'dash-p2-bar',
  'dash-p2-label',
  'dash-p3-bar',
  'dash-p3-label',
  'dash-p4-bar',
  'dash-p4-label',
  'dash-p5-bar',
  'dash-p5-label',
  'dash-boss-badge',
  'dash-speaking-accent-tag',
  'dash-spk-part1-status',
  'dash-spk-part2-status',
  'dash-spk-part3-status',
  'dash-vocab-total-badge',
  'dash-vocab-due-count',
  'btn-dash-review-cta',
  'dash-cefr-c2-count',
  'dash-cefr-c1-count',
  'dash-cefr-b2-count',
  'dash-cefr-b1-count',
  'dash-cefr-a2-count',
  'dash-cefr-a1-count',
  'dash-badges-unlocked-count',
  'dash-badges-preview-list'
];

let missing = [];
for (let id of requiredIds) {
  if (!html.includes(`id="${id}"`)) {
    missing.push(id);
  }
}

if (missing.length > 0) {
  console.error('FAIL: Missing DOM IDs:', missing);
  process.exit(1);
} else {
  console.log(`PASS: All ${requiredIds.length} required DOM IDs are verified present in index.html.`);
}

// 2. Syntax check on js files
const jsFiles = ['js/1-helpers.js', 'js/2-core.js', 'js/3-roadmap.js', 'js/4-speaking.js', 'js/5-vocab.js', 'js/6-affirmation.js', 'js/7-synthesis.js', 'js/8-sync.js'];
for (let file of jsFiles) {
  try {
    const code = fs.readFileSync(file, 'utf8');
    new Function(code);
    console.log(`PASS: Syntax clean in ${file}`);
  } catch (err) {
    console.error(`FAIL: Syntax error in ${file}:`, err.message);
    process.exit(1);
  }
}

console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
