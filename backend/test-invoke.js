import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

console.log('--- TEST INVOCATION ---');
try {
  console.log('Trying pdfParse as function...');
  pdfParse();
} catch (e) {
  console.log('Failed:', e.message);
}

try {
  console.log('Trying pdfParse.default as function...');
  pdfParse.default();
} catch (e) {
  console.log('Failed:', e.message);
}

console.log('Full object keys:', Object.getOwnPropertyNames(pdfParse));
