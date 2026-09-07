const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const requiredIds = [
  'tab-vocab-logger',
  'btn-vocab-header-review',
  'vocab-header-due-count',
  'btn-open-bulk-vocab',
  'input-vocab-word',
  'btn-add-vocab',
  'vocab-batch-worker-bar',
  'kpi-vocab-total',
  'kpi-vocab-due',
  'kpi-vocab-high',
  'kpi-vocab-mastered',
  'pill-vocab-all',
  'pill-vocab-due',
  'pill-vocab-locked',
  'pill-vocab-high',
  'input-vocab-search',
  'btn-clear-vocab-search',
  'btn-vocab-view-grid',
  'btn-vocab-view-list',
  'btn-toggle-filter-panel',
  'select-vocab-sort',
  'vocab-filter-detail-panel',
  'vocab-visible-count',
  'vocab-bank-list',
  'vocab-bank-empty',
  'modal-vocab-card'
];

let missing = [];
for (const id of requiredIds) {
  if (!html.includes(`id="${id}"`) && !html.includes(`id='${id}'`)) {
    missing.push(id);
  }
}

if (missing.length > 0) {
  console.error('Missing IDs in index.html:', missing);
  process.exit(1);
} else {
  console.log('PASS: All ' + requiredIds.length + ' required DOM IDs exist in index.html.');
}

const js = fs.readFileSync('js/5-vocab.js', 'utf8');
const requiredFunctions = [
  'loadVocabBank',
  'saveVocabBank',
  'renderVocabBank',
  'setVocabQuickPill',
  'setVocabViewMode',
  'resetVocabFilters',
  'setVocabFilterIelts',
  'setVocabFilterCefr',
  'setVocabFilterLearning',
  'setVocabFilterRegister',
  'openVocabCard',
  'speakWord',
  'addVocabWord',
  'openBulkVocabModal'
];

let missingFuncs = [];
for (const fn of requiredFunctions) {
  if (!js.includes(`function ${fn}`)) {
    missingFuncs.push(fn);
  }
}

if (missingFuncs.length > 0) {
  console.error('Missing functions in js/5-vocab.js:', missingFuncs);
  process.exit(1);
} else {
  console.log('PASS: All ' + requiredFunctions.length + ' required functions exist in js/5-vocab.js.');
}
