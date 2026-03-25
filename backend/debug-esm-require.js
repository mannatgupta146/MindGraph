import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

console.log('--- DEBUG ESM CREATE-REQUIRE ---');
console.log('Type of pdfParse:', typeof pdfParse);
console.log('Is Function?:', typeof pdfParse === 'function');
console.log('Value:', pdfParse);
if (pdfParse.default) console.log('Type of .default:', typeof pdfParse.default);
