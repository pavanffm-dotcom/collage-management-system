import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';
import { INITIAL_BOOKS } from './src/data/initialBooks.js';
import { Book, AISearchResponse, AISearchResult, College } from './src/types.js';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

const DATA_DIR = path.join(process.cwd(), '.data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DATA_FILE = path.join(DATA_DIR, 'library_data_store.json');
const OLD_DATA_FILE = path.join(process.cwd(), 'library_data_store.json');

if (!fs.existsSync(DATA_FILE) && fs.existsSync(OLD_DATA_FILE)) {
  try {
    fs.copyFileSync(OLD_DATA_FILE, DATA_FILE);
    fs.unlinkSync(OLD_DATA_FILE);
  } catch (e) {
    console.error('Data file migration error:', e);
  }
}

// Initial Seed Colleges for Multi-Tenancy
let collegesList: College[] = [
  {
    id: 'col-gec-goa',
    name: 'Goa Engineering College (GEC)',
    code: 'GEC-LIB',
    location: 'Farmagudi, Ponda, Goa',
    librarianName: 'Dr. Ramesh Naik',
    email: 'librarian@gec.ac.in',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://ais-dev-jk3cdvi344xqdqm2vemicn-628346772041.asia-east1.run.app?collegeId=col-gec-goa'
  },
  {
    id: 'col-stxaviers',
    name: "St. Xavier's College",
    code: 'SXC-MAPUSA',
    location: 'Mapusa, North Goa',
    librarianName: 'Prof. Maria D\'Souza',
    email: 'library@xaviers.edu',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://ais-dev-jk3cdvi344xqdqm2vemicn-628346772041.asia-east1.run.app?collegeId=col-stxaviers'
  },
  {
    id: 'col-iitb',
    name: 'IIT Bombay - Central Library',
    code: 'IITB-CENTRAL',
    location: 'Powai, Mumbai, Maharashtra',
    librarianName: 'Dr. Suresh Sharma',
    email: 'head.library@iitb.ac.in',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://ais-dev-jk3cdvi344xqdqm2vemicn-628346772041.asia-east1.run.app?collegeId=col-iitb'
  }
];

// Librarians database (In-memory auth store)
let librariansAuth = [
  {
    email: 'librarian@gec.ac.in',
    password: 'password123',
    collegeId: 'col-gec-goa',
    name: 'Dr. Ramesh Naik'
  },
  {
    email: 'library@xaviers.edu',
    password: 'password123',
    collegeId: 'col-stxaviers',
    name: 'Prof. Maria D\'Souza'
  }
];

// In-memory catalog state initialized with rich seed books
let booksCatalog: Book[] = INITIAL_BOOKS.map(b => ({
  ...b,
  collegeId: b.collegeId || 'col-gec-goa'
}));

// In-Memory Search Cache & Fast Index Structures
const searchResultsCache = new Map<string, { total: number; books: any[]; rawResults?: AISearchResult[]; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function clearSearchCache() {
  searchResultsCache.clear();
}

let indexedCollegeId = '';
let exactTitleIndex = new Map<string, Book[]>();
let exactAccessionIndex = new Map<string, Book[]>();
let exactIsbnIndex = new Map<string, Book[]>();

function invalidateIndexes() {
  indexedCollegeId = '';
  exactTitleIndex.clear();
  exactAccessionIndex.clear();
  exactIsbnIndex.clear();
  clearSearchCache();
}

// Load persisted library data from disk if exists
if (fs.existsSync(DATA_FILE)) {
  try {
    const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(rawData);
    if (parsed.colleges && Array.isArray(parsed.colleges)) {
      collegesList = parsed.colleges;
    }
    if (parsed.books && Array.isArray(parsed.books)) {
      booksCatalog = parsed.books;
    }
  } catch (err) {
    console.error('Error loading library_data_store.json:', err);
  }
}

function saveData() {
  try {
    invalidateIndexes();
    const tempFile = DATA_FILE + '.tmp';
    // Compact JSON serialization without multi-line spacing for 10x speed and minimal disk size
    fs.writeFileSync(tempFile, JSON.stringify({ colleges: collegesList, books: booksCatalog }));
    fs.renameSync(tempFile, DATA_FILE);
  } catch (err) {
    console.error('Error saving library_data_store.json:', err);
  }
}

// Analytics & Search Logs (Scoped by college)
const searchLogs: { query: string; type: 'ai' | 'exact'; timestamp: string; resultsCount: number; collegeId: string }[] = [];

// 🔍 High-Performance Search Engine with Fast Levenshtein, Indexing, and Caching
function fastLevenshteinDistance(a: string, b: string, maxDistance?: number): number {
  if (a === b) return 0;
  const lenA = a.length;
  const lenB = b.length;
  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;

  const absDiff = Math.abs(lenA - lenB);
  if (maxDistance !== undefined && absDiff > maxDistance) {
    return maxDistance + 1;
  }

  let row0 = new Int32Array(lenB + 1);
  let row1 = new Int32Array(lenB + 1);

  for (let i = 0; i <= lenB; i++) row0[i] = i;

  for (let i = 0; i < lenA; i++) {
    row1[0] = i + 1;
    let minInRow = row1[0];

    for (let j = 0; j < lenB; j++) {
      const cost = a.charCodeAt(i) === b.charCodeAt(j) ? 0 : 1;
      const val = Math.min(row1[j] + 1, row0[j + 1] + 1, row0[j] + cost);
      row1[j + 1] = val;
      if (val < minInRow) minInRow = val;
    }

    if (maxDistance !== undefined && minInRow > maxDistance) {
      return maxDistance + 1;
    }

    const temp = row0;
    row0 = row1;
    row1 = temp;
  }

  return row0[lenB];
}

function fuzzyRatio(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const lenA = a.length;
  const lenB = b.length;
  const maxLen = Math.max(lenA, lenB);
  if (maxLen === 0) return 1;

  // Length difference guard: if length difference > 25%, ratio can't meet 0.75 threshold
  if (Math.abs(lenA - lenB) / maxLen > 0.25) return 0;

  const maxAllowedDist = Math.floor(maxLen * 0.25);
  const dist = fastLevenshteinDistance(a.toLowerCase(), b.toLowerCase(), maxAllowedDist);
  if (dist > maxAllowedDist) return 0;

  return 1 - dist / maxLen;
}

function tokenizeText(text: string): string[] {
  if (!text) return [];
  const cleaned = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  return cleaned.split(/\s+/).filter(t => t.length > 0);
}

interface BookSearchFields {
  titleLower: string;
  authorLower: string;
  accessionLower: string;
  accessionClean: string;
  isbnLower: string;
  isbnClean: string;
  callNumberLower: string;
  subjectLower: string;
  deptLower: string;
  descLower: string;
  keywordsLower: string;
  rawCsvTitle: string;
  rawDataLower: string;
  customAttrsLower: string;
  titleTokens: string[];
}

function getBookSearchFields(book: Book): BookSearchFields {
  if ((book as any)._searchFields) {
    return (book as any)._searchFields;
  }

  const titleLower = (book.title || '').trim().toLowerCase();
  const authorLower = (book.author || '').trim().toLowerCase();
  const accessionLower = (book.accessionNumber || '').trim().toLowerCase();
  const accessionClean = accessionLower.replace(/[^a-z0-9]/g, '');
  const isbnLower = (book.isbn || '').trim().toLowerCase();
  const isbnClean = isbnLower.replace(/[^0-9]/g, '');
  const callNumberLower = (book.callNumber || '').trim().toLowerCase();
  const subjectLower = (book.subject || '').trim().toLowerCase();
  const deptLower = (book.department || '').trim().toLowerCase();
  const descLower = ((book.description || '') + ' ' + (book.summary || '')).trim().toLowerCase();
  const keywordsLower = (book.keywords || []).map(k => k.trim().toLowerCase()).join(' ');

  const rawCsvTitle = book.rawCsvData ? String(book.rawCsvData.title || book.rawCsvData.Title || book.rawCsvData.BookTitle || book.rawCsvData['Book Name'] || '').trim().toLowerCase() : '';
  
  let rawDataLower = '';
  if (book.rawCsvData) {
    for (const k in book.rawCsvData) {
      rawDataLower += ' ' + String(book.rawCsvData[k]).trim().toLowerCase();
    }
  }

  let customAttrsLower = '';
  if (book.customAttributes) {
    for (const k in book.customAttributes) {
      customAttrsLower += ' ' + String(book.customAttributes[k]).trim().toLowerCase();
    }
  }

  const titleTokens = tokenizeText(titleLower);

  const fields: BookSearchFields = {
    titleLower,
    authorLower,
    accessionLower,
    accessionClean,
    isbnLower,
    isbnClean,
    callNumberLower,
    subjectLower,
    deptLower,
    descLower,
    keywordsLower,
    rawCsvTitle,
    rawDataLower,
    customAttrsLower,
    titleTokens
  };

  (book as any)._searchFields = fields;
  return fields;
}

// Extracts values from a book specifically corresponding to Control Panel mapped columns
function extractMappedColumnValues(book: Book, mappedCols: string[]): string {
  if (!mappedCols || mappedCols.length === 0) return '';
  let text = '';
  const colsLower = mappedCols.map(c => c.toLowerCase().trim()).filter(Boolean);

  for (const col of colsLower) {
    if (col === 'title' && book.title) text += ' ' + book.title;
    if (col === 'author' && book.author) text += ' ' + book.author;
    if (col === 'subject' && book.subject) text += ' ' + book.subject;
    if (col === 'department' && book.department) text += ' ' + book.department;
    if (col === 'description' && book.description) text += ' ' + book.description;
    if (col === 'summary' && book.summary) text += ' ' + book.summary;
    if (col === 'keywords' && book.keywords) text += ' ' + book.keywords.join(' ');
    if (col === 'isbn' && book.isbn) text += ' ' + book.isbn;
    if (col === 'accessionnumber' && book.accessionNumber) text += ' ' + book.accessionNumber;
    if (col === 'publisher' && book.publisher) text += ' ' + book.publisher;

    if (book.rawCsvData) {
      Object.entries(book.rawCsvData).forEach(([k, v]) => {
        if (k.toLowerCase() === col || k.toLowerCase().includes(col) || col.includes(k.toLowerCase())) {
          text += ' ' + String(v);
        }
      });
    }
    if (book.customAttributes) {
      Object.entries(book.customAttributes).forEach(([k, v]) => {
        if (k.toLowerCase() === col || k.toLowerCase().includes(col) || col.includes(k.toLowerCase())) {
          text += ' ' + String(v);
        }
      });
    }
  }
  return text.trim().toLowerCase();
}

// Core Local Intelligent Search Engine
function performLocalSearch(query: string, books: Book[], searchMappings?: any, mode: 'exact' | 'ai' = 'exact'): AISearchResult[] {
  if (!query || !query.trim() || !books || books.length === 0) return [];

  const rawQuery = query.trim().toLowerCase();
  const normalizedQuery = rawQuery.replace(/\s+/g, ' ');
  const normClean = normalizedQuery.replace(/[^a-z0-9]/g, '');

  const stopWords = new Set(['book', 'books', 'the', 'and', 'for', 'with', 'show', 'me', 'get', 'find', 'search', 'shelf', 'shelves', 'which', 'where', 'that', 'from', 'have', 'need', 'about', 'want', 'list', 'all', 'any', 'a', 'an', 'in', 'on', 'at', 'to', 'of', 'is', 'it', 'please', 'can', 'you', 'give']);
  
  let queryTokens = tokenizeText(normalizedQuery).filter(t => !stopWords.has(t));
  if (queryTokens.length === 0) {
    queryTokens = tokenizeText(normalizedQuery);
  }

  // Connect to exact Control Panel fields based on search mode
  const mappedCols = mode === 'exact' 
    ? (searchMappings?.nameColumns?.length ? searchMappings.nameColumns : ['Title', 'Author', 'AccessionNumber'])
    : (searchMappings?.aiColumns?.length ? searchMappings.aiColumns : ['Description', 'Keywords', 'Summary', 'Subject', 'Title']);
  
  const scoredItems: {
    book: Book;
    rawScore: number;
    matchReason: string;
    matchedConcepts: string[];
  }[] = [];

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const sf = getBookSearchFields(book);
    let score = 0;
    const matchReasons: string[] = [];
    const matchedConcepts: string[] = [];

    const mappedText = extractMappedColumnValues(book, mappedCols).trim().toLowerCase();

    // 1. EXACT & HIGH PRIORITY MATCHES (Tier 1: 30,000 - 100,000 points)
    
    // 1a. Exact Title Match
    if (sf.titleLower === normalizedQuery || (sf.rawCsvTitle && sf.rawCsvTitle === normalizedQuery)) {
      score += 100000;
      matchReasons.push('Exact Title Match');
      matchedConcepts.push('Exact Title');
    } 
    // 1b. Title Starts With Query
    else if (sf.titleLower.startsWith(normalizedQuery) || (sf.rawCsvTitle && sf.rawCsvTitle.startsWith(normalizedQuery))) {
      score += 60000;
      matchReasons.push('Title Prefix Match');
      matchedConcepts.push('Title Prefix');
    }
    // 1c. Title Contains Full Query Phrase
    else if (sf.titleLower.includes(normalizedQuery) || (sf.rawCsvTitle && sf.rawCsvTitle.includes(normalizedQuery))) {
      score += 40000;
      matchReasons.push('Title Phrase Match');
      matchedConcepts.push('Title Substring');
    }

    // 1d. Exact Accession / ISBN / Call Number Match
    if (sf.accessionLower && (sf.accessionLower === normalizedQuery || (normClean.length > 0 && sf.accessionClean === normClean))) {
      score += 90000;
      matchReasons.push(`Accession Number ${book.accessionNumber} Match`);
    } else if (sf.accessionLower && sf.accessionLower.includes(normalizedQuery)) {
      score += 35000;
      matchReasons.push('Accession Substring Match');
    }

    const normDigits = normalizedQuery.replace(/[^0-9]/g, '');
    if (sf.isbnLower && (sf.isbnLower === normalizedQuery || (normDigits.length > 0 && sf.isbnClean === normDigits))) {
      score += 90000;
      matchReasons.push(`ISBN ${book.isbn} Match`);
    }

    if (sf.callNumberLower && sf.callNumberLower === normalizedQuery) {
      score += 85000;
      matchReasons.push('Call Number Match');
    }

    // 1e. Control Panel Mapped Field Match
    if (mappedText) {
      if (mappedText === normalizedQuery) {
        score += 80000;
        matchReasons.push('Exact match on connected column');
      } else if (mappedText.includes(normalizedQuery)) {
        score += 30000;
        matchReasons.push('Connected column phrase match');
      }
    }

    // 1f. Exact Author Match
    if (sf.authorLower === normalizedQuery) {
      score += 50000;
      matchReasons.push('Exact Author Match');
    } else if (sf.authorLower.includes(normalizedQuery)) {
      score += 20000;
      matchReasons.push('Author Phrase Match');
    }

    // 2. TOKEN & WORD PERMUTATION MATCHING (Tier 2: 1,000 - 25,000 points)
    let titleTokensMatched = 0;

    for (const qToken of queryTokens) {
      if (sf.titleLower.includes(qToken)) {
        titleTokensMatched++;
      } else {
        for (const tToken of sf.titleTokens) {
          if (fuzzyRatio(qToken, tToken) >= 0.80) {
            titleTokensMatched++;
            break;
          }
        }
      }
    }

    if (queryTokens.length > 0 && titleTokensMatched === queryTokens.length) {
      score += 25000;
      matchReasons.push('All query words matched in Title');
      matchedConcepts.push('All Words Title Match');
    } else if (titleTokensMatched > 0) {
      score += titleTokensMatched * 2000;
    }

    // Title Fuzzy Ratio (for spelling mistakes) - Only run if title wasn't an exact/prefix/phrase match already
    if (score < 40000 && sf.titleLower && normalizedQuery.length >= 4) {
      const titleFuzzy = fuzzyRatio(normalizedQuery, sf.titleLower);
      if (titleFuzzy >= 0.75) {
        score += Math.floor(titleFuzzy * 15000);
        matchReasons.push(`Spelling similarity (${Math.round(titleFuzzy * 100)}%)`);
      }
    }

    // Author, Subject, Department token matches
    for (const qToken of queryTokens) {
      if (qToken.length < 2) continue; // Ignore single letter noise for generic fields
      
      if (sf.authorLower.includes(qToken)) {
        score += 1500;
      }
      if (sf.subjectLower.includes(qToken)) {
        score += 1000;
        matchedConcepts.push(`Subject: ${book.subject}`);
      }
      if (sf.deptLower.includes(qToken)) {
        score += 800;
        matchedConcepts.push(`Dept: ${book.department}`);
      }
      if (sf.keywordsLower.includes(qToken)) {
        score += 600;
        matchedConcepts.push(`Keyword: ${qToken}`);
      }
      if (sf.descLower.includes(qToken)) {
        score += 300;
      }

      // Raw CSV & custom attributes match - ONLY for meaningful tokens (length >= 3)
      if (qToken.length >= 3) {
        if (sf.rawDataLower.includes(qToken) || sf.customAttrsLower.includes(qToken)) {
          score += 150;
        }
      }
    }

    if (score > 0) {
      const primaryReason = matchReasons.length > 0 ? matchReasons[0] : 'Matches query topic and keywords';
      const uniqueConcepts = Array.from(new Set(matchedConcepts));

      scoredItems.push({
        book,
        rawScore: score,
        matchReason: primaryReason,
        matchedConcepts: uniqueConcepts.length > 0 ? uniqueConcepts : queryTokens
      });
    }
  }

  // Sort by rawScore DESCENDING
  scoredItems.sort((a, b) => b.rawScore - a.rawScore);

  // NOISE FILTERING: If we have strong matches (score >= 5000), filter out weak random matches below threshold
  if (scoredItems.length > 0) {
    const topScore = scoredItems[0].rawScore;
    if (topScore >= 5000) {
      const cutoffThreshold = Math.max(1000, topScore * 0.15);
      const filteredItems = scoredItems.filter(item => item.rawScore >= cutoffThreshold);
      if (filteredItems.length > 0) {
        return filteredItems.map((item, index) => {
          let confidenceScore = 98;
          if (item.rawScore >= 80000) confidenceScore = 99;
          else if (item.rawScore >= 30000) confidenceScore = 95;
          else if (item.rawScore >= 10000) confidenceScore = 90;
          else if (item.rawScore >= 5000) confidenceScore = 84;
          else confidenceScore = Math.min(80, Math.max(50, Math.round(item.rawScore / 50)));

          return {
            book: item.book,
            confidenceScore,
            matchReason: item.matchReason,
            matchedConcepts: item.matchedConcepts,
            relevanceRank: index + 1
          };
        });
      }
    }
  }

  return scoredItems.map((item, index) => {
    let confidenceScore = 90;
    if (item.rawScore >= 80000) confidenceScore = 99;
    else if (item.rawScore >= 30000) confidenceScore = 95;
    else if (item.rawScore >= 10000) confidenceScore = 90;
    else if (item.rawScore >= 5000) confidenceScore = 84;
    else confidenceScore = Math.min(80, Math.max(50, Math.round(item.rawScore / 50)));

    return {
      book: item.book,
      confidenceScore,
      matchReason: item.matchReason,
      matchedConcepts: item.matchedConcepts,
      relevanceRank: index + 1
    };
  });
}

// REST API Endpoints

// GET /api/colleges - Get list of registered colleges
app.get('/api/colleges', (req, res) => {
  res.json({ colleges: collegesList });
});

// GET /api/colleges/:id - Get specific college details
app.get('/api/colleges/:id', (req, res) => {
  const col = collegesList.find(c => c.id === req.params.id);
  if (!col) {
    return res.status(404).json({ error: 'College not found' });
  }
  res.json({ college: col });
});

// POST /api/auth/login - Librarian Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = librariansAuth.find(l => l.email.toLowerCase() === (email || '').toLowerCase().trim());
  
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid librarian email or password' });
  }

  const college = collegesList.find(c => c.id === user.collegeId);
  res.json({
    success: true,
    user: {
      name: user.name,
      email: user.email,
      collegeId: user.collegeId
    },
    college
  });
});

// POST /api/auth/google - Sign in with Google (Librarian)
app.post('/api/auth/google', (req, res) => {
  const { email, name, collegeName } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Google email is required' });
  }

  let user = librariansAuth.find(l => l.email.toLowerCase() === email.toLowerCase().trim());
  let college: College | undefined;

  if (!user) {
    // Register new user & college automatically via Google
    const cName = collegeName || `${name || 'Librarian'}'s College Library`;
    const collegeId = 'col-' + cName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15) + '-' + Math.floor(100 + Math.random() * 900);
    const code = cName.split(' ').map((w: string) => w[0]).join('').toUpperCase() + '-LIB';

    college = {
      id: collegeId,
      name: cName,
      code,
      location: 'Campus Library',
      librarianName: name || 'Librarian',
      email,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`https://ais-dev-jk3cdvi344xqdqm2vemicn-628346772041.asia-east1.run.app?collegeId=${collegeId}`)}`
    };

    collegesList.push(college);
    user = {
      email,
      password: 'google-oauth-authenticated',
      collegeId,
      name: name || email.split('@')[0]
    };
    librariansAuth.push(user);
  } else {
    college = collegesList.find(c => c.id === user.collegeId);
  }

  res.json({
    success: true,
    user: {
      name: user.name,
      email: user.email,
      collegeId: user.collegeId
    },
    college
  });
});

// PUT /api/colleges/:id - Update College Settings
app.put('/api/colleges/:id', (req, res) => {
  const { id } = req.params;
  const { name, code, location, librarianName, email, searchMappings } = req.body;

  const colIndex = collegesList.findIndex(c => c.id === id);
  if (colIndex === -1) {
    return res.status(404).json({ error: 'College not found' });
  }

  const updatedCollege: College = {
    ...collegesList[colIndex],
    name: name || collegesList[colIndex].name,
    code: code || collegesList[colIndex].code,
    location: location || collegesList[colIndex].location,
    librarianName: librarianName || collegesList[colIndex].librarianName,
    email: email || collegesList[colIndex].email,
    searchMappings: searchMappings !== undefined ? searchMappings : collegesList[colIndex].searchMappings,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`https://ais-dev-jk3cdvi344xqdqm2vemicn-628346772041.asia-east1.run.app?collegeId=${id}`)}`
  };

  collegesList[colIndex] = updatedCollege;
  saveData();
  res.json({ success: true, college: updatedCollege });
});

app.post('/api/auth/register', (req, res) => {
  const { librarianName, email, password, collegeName, collegeCode, location } = req.body;

  if (!librarianName || !email || !password || !collegeName) {
    return res.status(400).json({ error: 'Librarian name, email, password, and College name are required.' });
  }

  const existing = librariansAuth.find(l => l.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ error: 'A librarian account with this email already exists.' });
  }

  const collegeId = 'col-' + collegeName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15) + '-' + Math.floor(100 + Math.random() * 900);
  const code = collegeCode || collegeName.split(' ').map((w: string) => w[0]).join('').toUpperCase() + '-LIB';

  const newCollege: College = {
    id: collegeId,
    name: collegeName,
    code,
    location: location || 'Campus Library',
    librarianName,
    email,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://ais-dev-jk3cdvi344xqdqm2vemicn-628346772041.asia-east1.run.app?collegeId=${collegeId}`
  };

  collegesList.push(newCollege);
  librariansAuth.push({
    email,
    password,
    collegeId,
    name: librarianName
  });

  // Seed default books for new college library
  const seedBooks: Book[] = INITIAL_BOOKS.slice(0, 5).map((b, i) => ({
    ...b,
    id: `bk-${collegeId}-${i + 1}`,
    collegeId,
    accessionNumber: `${code}-2026-00${i + 1}`
  }));
  booksCatalog.push(...seedBooks);
  saveData();

  res.status(201).json({
    success: true,
    message: 'College and Librarian account created successfully!',
    user: { name: librarianName, email, collegeId },
    college: newCollege
  });
});

// GET /api/books - Get library catalog (scoped to collegeId if provided)
app.get('/api/books', (req, res) => {
  const { collegeId, limit, page } = req.query;
  let scoped = booksCatalog;
  if (collegeId && typeof collegeId === 'string') {
    scoped = booksCatalog.filter(b => b.collegeId === collegeId);
  }

  const total = scoped.length;

  // If no specific pagination is requested, return full catalog without artificial limits
  if (!limit && !page) {
    return res.json({
      total,
      page: 1,
      pageSize: total,
      books: scoped
    });
  }

  const maxLimit = limit === 'all' ? total : Math.max(Number(limit) || 1000, 1);
  const pageNum = Math.max(Number(page) || 1, 1);
  const paginated = scoped.slice((pageNum - 1) * maxLimit, pageNum * maxLimit);

  res.json({
    total,
    page: pageNum,
    pageSize: paginated.length,
    books: paginated
  });
});

// GET /api/books/:id - Get specific book details
app.get('/api/books/:id', (req, res) => {
  const book = booksCatalog.find(b => b.id === req.params.id);
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  res.json({ book });
});

// POST /api/books - Add new book for specific college
app.post('/api/books', (req, res) => {
  const newBookData = req.body;
  if (!newBookData.title || !newBookData.author || !newBookData.department) {
    return res.status(400).json({ error: 'Title, Author, and Department are required.' });
  }

  const collegeId = newBookData.collegeId || 'col-gec-goa';
  const id = 'bk-' + Date.now();
  const dateStr = new Date().toISOString().split('T')[0];

  const almari = newBookData.location?.almariNumber || 'A1';
  const row = newBookData.location?.rowNumber || 'R1';
  const pos = newBookData.location?.shelfPosition || 'Middle';
  const posCode = pos === 'Top' ? 'T' : pos === 'Bottom' ? 'B' : 'M';
  const shelfCode = `${almari.startsWith('A') ? almari : 'A' + almari}-${row.startsWith('R') ? row : 'R' + row}-${posCode}`;

  const newBook: Book = {
    ...newBookData,
    id,
    collegeId,
    accessionNumber: newBookData.accessionNumber || `LIB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    isbn: newBookData.isbn || '978-0-0000-0000-0',
    edition: newBookData.edition || '1st Edition',
    publicationYear: Number(newBookData.publicationYear) || new Date().getFullYear(),
    language: newBookData.language || 'English',
    category: newBookData.category || 'General Reference',
    description: newBookData.description || `${newBookData.title} by ${newBookData.author}`,
    summary: newBookData.summary || `${newBookData.title} available in ${newBookData.department} department.`,
    keywords: Array.isArray(newBookData.keywords) ? newBookData.keywords : (newBookData.keywords || '').split(',').map((k: string) => k.trim()),
    tags: Array.isArray(newBookData.tags) ? newBookData.tags : [newBookData.department],
    callNumber: newBookData.callNumber || '000.00 REF',
    availability: newBookData.availability || 'Available',
    totalCopies: Number(newBookData.totalCopies) || 1,
    availableCopies: Number(newBookData.availableCopies) || 1,
    location: {
      almariNumber: almari,
      rowNumber: row,
      shelfPosition: pos,
      shelfCode: shelfCode,
      sectionName: newBookData.location?.sectionName || `${newBookData.department} Section`
    },
    dateAdded: dateStr,
    lastUpdated: dateStr
  };

  booksCatalog.unshift(newBook);
  saveData();
  res.status(201).json({ book: newBook, message: 'Book added successfully' });
});

// POST /api/books/bulk - Bulk add/import list of books with smart duplicate merging & column fallback
app.post('/api/books/bulk', (req, res) => {
  const { books: incomingBooks, collegeId } = req.body;
  if (!Array.isArray(incomingBooks) || incomingBooks.length === 0) {
    return res.status(400).json({ error: 'Array of books is required' });
  }

  const targetCollegeId = collegeId || 'col-gec-goa';
  const dateStr = new Date().toISOString().split('T')[0];

  let newCount = 0;
  let updatedCount = 0;

  // Build fast O(1) lookup maps for existing books in this college
  const accessionMap = new Map<string, number>();
  const isbnMap = new Map<string, number>();
  const titleAuthorMap = new Map<string, number>();

  booksCatalog.forEach((book, idx) => {
    if (book.collegeId === targetCollegeId) {
      if (book.accessionNumber) accessionMap.set(book.accessionNumber.toLowerCase(), idx);
      if (book.isbn && !book.isbn.startsWith('978-0-0000')) isbnMap.set(book.isbn.toLowerCase(), idx);
      if (book.title && book.author) {
        titleAuthorMap.set(`${book.title.trim().toLowerCase()}|${book.author.trim().toLowerCase()}`, idx);
      }
    }
  });

  const timeStamp = Date.now();

  for (let i = 0; i < incomingBooks.length; i++) {
    const b = incomingBooks[i];
    const rawTitle = (b.title || b.BookTitle || b.Title || 'Untitled Book').trim();
    const rawAuthor = (b.author || b.Author || 'Unknown Author').trim();
    const rawIsbn = (b.isbn || b.ISBN || '').trim();
    const rawAccession = (b.accessionNumber || b.AccessionNo || '').trim();

    const titleLower = rawTitle.toLowerCase();
    const authorLower = rawAuthor.toLowerCase();
    const titleAuthorKey = `${titleLower}|${authorLower}`;

    // Fast O(1) duplicate lookup
    let existingIndex = -1;
    if (rawAccession && accessionMap.has(rawAccession.toLowerCase())) {
      existingIndex = accessionMap.get(rawAccession.toLowerCase())!;
    } else if (rawIsbn && !rawIsbn.startsWith('978-0-0000') && isbnMap.has(rawIsbn.toLowerCase())) {
      existingIndex = isbnMap.get(rawIsbn.toLowerCase())!;
    } else if (titleAuthorMap.has(titleAuthorKey)) {
      existingIndex = titleAuthorMap.get(titleAuthorKey)!;
    }

    const almari = b.almari || b.almariNumber || b.location?.almariNumber || 'A1';
    const row = b.row || b.rowNumber || b.location?.rowNumber || 'R1';
    const pos = b.position || b.shelfPosition || b.location?.shelfPosition || 'Middle';
    const posCode = pos === 'Top' ? 'T' : pos === 'Bottom' ? 'B' : 'M';
    const shelfCode = `${almari.startsWith('A') ? almari : 'A' + almari}-${row.startsWith('R') ? row : 'R' + row}-${posCode}`;
    const copies = Number(b.copies || b.totalCopies || b.availableCopies) || 1;

    if (existingIndex !== -1) {
      // DUPLICATE DETECTED -> SMART MERGE
      const target = booksCatalog[existingIndex];
      target.totalCopies = (target.totalCopies || 1) + copies;
      target.availableCopies = (target.availableCopies || 1) + copies;

      if (!target.location?.almariNumber || target.location.almariNumber === 'A1') {
        target.location = {
          almariNumber: almari,
          rowNumber: row,
          shelfPosition: pos as any,
          shelfCode,
          sectionName: `${b.department || target.department || 'General'} Section`
        };
      }

      if (b.department && target.department === 'Computer Science & Engineering' && b.department !== target.department) {
        target.department = b.department;
      }

      target.lastUpdated = dateStr;
      updatedCount++;
    } else {
      // NEW BOOK -> INSERT RECORD
      const newBook: Book = {
        id: `bk-${timeStamp}-${i}-${Math.floor(Math.random() * 1000)}`,
        collegeId: targetCollegeId,
        title: rawTitle,
        subtitle: b.subtitle || '',
        author: rawAuthor,
        publisher: b.publisher || 'Academic Press',
        department: b.department || b.Department || 'Computer Science & Engineering',
        subject: b.subject || b.Subject || b.department || 'General',
        description: b.description || `${rawTitle} by ${rawAuthor}`,
        summary: b.summary || `${rawTitle} available in library catalog.`,
        keywords: Array.isArray(b.keywords) 
          ? b.keywords 
          : typeof b.keywords === 'string' 
            ? b.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
            : [rawTitle, b.department || 'General'],
        tags: [b.department || 'General'],
        isbn: rawIsbn || `978-0-${Math.floor(100000000 + Math.random() * 900000000)}`,
        callNumber: b.callNumber || b.CallNumber || '000.00 REF',
        accessionNumber: rawAccession || `LIB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        edition: b.edition || '1st Edition',
        publicationYear: Number(b.publicationYear) || new Date().getFullYear(),
        language: b.language || 'English',
        category: b.category || 'General Reference',
        availability: 'Available',
        totalCopies: copies,
        availableCopies: copies,
        location: {
          almariNumber: almari,
          rowNumber: row,
          shelfPosition: pos as any,
          shelfCode,
          sectionName: `${b.department || 'General'} Section`
        },
        customAttributes: b.customAttributes || b.rawCsvData || b,
        rawCsvData: b.rawCsvData || b.customAttributes || b,
        dateAdded: dateStr,
        lastUpdated: dateStr
      };

      const newIdx = booksCatalog.length;
      booksCatalog.push(newBook);
      if (newBook.accessionNumber) accessionMap.set(newBook.accessionNumber.toLowerCase(), newIdx);
      if (newBook.isbn && !newBook.isbn.startsWith('978-0-0000')) isbnMap.set(newBook.isbn.toLowerCase(), newIdx);
      titleAuthorMap.set(titleAuthorKey, newIdx);

      newCount++;
    }
  }

  saveData();

  res.status(201).json({
    success: true,
    newCount,
    updatedCount,
    totalProcessed: incomingBooks.length,
    message: `Processed ${incomingBooks.length} rows (${newCount} new books added, ${updatedCount} existing books merged & copy count updated)`
  });
});

// PUT /api/books/:id - Update existing book
app.put('/api/books/:id', (req, res) => {
  const index = booksCatalog.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  const updatedData = req.body;
  const existing = booksCatalog[index];

  const almari = updatedData.location?.almariNumber || existing.location.almariNumber;
  const row = updatedData.location?.rowNumber || existing.location.rowNumber;
  const pos = updatedData.location?.shelfPosition || existing.location.shelfPosition;
  const posCode = pos === 'Top' ? 'T' : pos === 'Bottom' ? 'B' : 'M';
  const shelfCode = `${almari.startsWith('A') ? almari : 'A' + almari}-${row.startsWith('R') ? row : 'R' + row}-${posCode}`;

  const updatedBook: Book = {
    ...existing,
    ...updatedData,
    location: {
      ...existing.location,
      ...(updatedData.location || {}),
      almariNumber: almari,
      rowNumber: row,
      shelfPosition: pos,
      shelfCode: shelfCode
    },
    lastUpdated: new Date().toISOString().split('T')[0]
  };

  booksCatalog[index] = updatedBook;
  saveData();
  res.json({ book: updatedBook, message: 'Book updated successfully' });
});

// DELETE /api/books/:id - Delete book
app.delete('/api/books/:id', (req, res) => {
  const initialLength = booksCatalog.length;
  booksCatalog = booksCatalog.filter(b => b.id !== req.params.id);
  saveData();
  if (booksCatalog.length === initialLength) {
    return res.status(404).json({ error: 'Book not found' });
  }
  res.json({ success: true, message: 'Book removed from library catalog' });
});

// DELETE /api/books/college/:collegeId/clear - Clear all books for a college (Delete Full Sheet)
app.delete('/api/books/college/:collegeId/clear', (req, res) => {
  const targetCollegeId = req.params.collegeId;
  const beforeCount = booksCatalog.length;
  booksCatalog = booksCatalog.filter(b => b.collegeId !== targetCollegeId);
  console.log(`Clearing catalog for college ${targetCollegeId}. Removed ${beforeCount - booksCatalog.length} books.`);
  saveData();
  res.json({ success: true, message: 'All books cleared for college catalog' });
});

// POST /api/search/exact - Title/Author/ISBN/Subject/CSV Sheet search
app.post('/api/search/exact', (req, res) => {
  const { query, department, category, onlyAvailable, collegeId, limit, searchMappings: reqMappings } = req.body;
  const cleanQuery = (query || '').trim();

  const cacheKey = `exact|${collegeId || ''}|${department || ''}|${category || ''}|${onlyAvailable ? 1 : 0}|${cleanQuery.toLowerCase()}`;
  const cached = searchResultsCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
    const maxLimit = limit === 'all' ? cached.books.length : (limit ? Math.max(Number(limit) || 1000, 1) : cached.books.length);
    return res.json({
      total: cached.books.length,
      books: cached.books.slice(0, maxLimit)
    });
  }

  const targetCollege = collegesList.find(c => c.id === collegeId);
  const activeMappings = reqMappings || targetCollege?.searchMappings;

  let filtered = booksCatalog;

  if (collegeId) {
    filtered = filtered.filter(b => b.collegeId === collegeId);
  }
  if (department && department !== 'All') {
    filtered = filtered.filter(b => (b.department || '').toLowerCase() === department.toLowerCase());
  }
  if (category && category !== 'All') {
    filtered = filtered.filter(b => (b.category || '').toLowerCase() === category.toLowerCase());
  }
  if (onlyAvailable) {
    filtered = filtered.filter(b => b.availability === 'Available' && (b.availableCopies || 0) > 0);
  }

  let results = filtered;

  if (cleanQuery) {
    const searchResults = performLocalSearch(cleanQuery, filtered, activeMappings, 'exact');
    results = searchResults.map(r => r.book);
  }

  searchResultsCache.set(cacheKey, {
    total: results.length,
    books: results,
    timestamp: Date.now()
  });

  const maxLimit = limit === 'all' ? results.length : (limit ? Math.max(Number(limit) || 1000, 1) : results.length);

  searchLogs.push({
    query: cleanQuery || 'All Catalog',
    type: 'exact',
    timestamp: new Date().toISOString(),
    resultsCount: results.length,
    collegeId: collegeId || 'col-gec-goa'
  });

  res.json({
    total: results.length,
    books: results.slice(0, maxLimit)
  });
});

// POST /api/search/ai - Natural Language AI Semantic Search Endpoint
app.post('/api/search/ai', async (req, res) => {
  const startTime = Date.now();
  const { query, collegeId, searchMappings: reqMappings } = req.body;

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const userQuery = query.trim();
  const targetCollegeId = collegeId || 'col-gec-goa';

  const aiCacheKey = `ai|${targetCollegeId}|${userQuery.toLowerCase()}`;
  const aiCached = searchResultsCache.get(aiCacheKey);
  if (aiCached && (Date.now() - aiCached.timestamp) < CACHE_TTL_MS && aiCached.rawResults) {
    return res.json({
      query: userQuery,
      extractedConcepts: userQuery.split(/\s+/).filter(w => w.length > 2),
      results: aiCached.rawResults,
      searchTimeMs: Date.now() - startTime
    });
  }

  const targetCollege = collegesList.find(c => c.id === targetCollegeId);
  const activeMappings = reqMappings || targetCollege?.searchMappings;

  const collegeBooksCatalog = booksCatalog.filter(b => b.collegeId === targetCollegeId);

  // Compute local intelligent search results (Instant, zero API quota, handles typos, reversed words & Control Panel column mappings)
  const localResults = performLocalSearch(userQuery, collegeBooksCatalog, activeMappings, 'ai');

  // If top candidate matches directly with high confidence (e.g. Exact Title or ISBN match), return immediately without waiting for AI network roundtrip
  if (localResults.length > 0 && localResults[0].confidenceScore >= 95) {
    searchResultsCache.set(aiCacheKey, {
      total: localResults.length,
      books: localResults.map(r => r.book),
      rawResults: localResults,
      timestamp: Date.now()
    });

    return res.json({
      query: userQuery,
      extractedConcepts: userQuery.split(/\s+/).filter(w => w.length > 2),
      results: localResults,
      searchTimeMs: Date.now() - startTime
    });
  }

  // If Gemini API Key is available, optionally refine search results if API call succeeds
  if (process.env.GEMINI_API_KEY && localResults.length > 0) {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const topCandidates = localResults.slice(0, 30).map(r => r.book);
      const catalogSummary = topCandidates.map(b => ({
        id: b.id,
        title: b.title,
        author: b.author,
        department: b.department,
        subject: b.subject,
        description: b.description || '',
        keywords: b.keywords || [],
        accessionNumber: b.accessionNumber || ''
      }));

      const prompt = `You are the AI Librarian assistant for a college library. 
A student searched for: "${userQuery}".
Students may describe topics in plain English, have spelling mistakes, or inverted terms.
Match this query against the catalog below ONLY:
${JSON.stringify(catalogSummary, null, 2)}

Return a JSON object with:
- extractedConcepts: array of semantic topic keywords inferred from query
- matchedBookIds: array of { id: string, confidenceScore: number, matchReason: string } ranked best match first.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              extractedConcepts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Extracted semantic concepts and synonyms'
              },
              matchedBookIds: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    confidenceScore: { type: Type.NUMBER },
                    matchReason: { type: Type.STRING }
                  },
                  required: ['id', 'confidenceScore', 'matchReason']
                }
              }
            },
            required: ['extractedConcepts', 'matchedBookIds']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      const geminiMatchedList: any[] = parsed.matchedBookIds || [];
      const extractedConcepts: string[] = parsed.extractedConcepts || userQuery.split(/\s+/).filter(w => w.length > 2);

      if (geminiMatchedList.length > 0) {
        const results: AISearchResult[] = [];
        const matchedIdsSet = new Set<string>();

        geminiMatchedList.forEach((item, index) => {
          const book = collegeBooksCatalog.find(b => b.id === item.id);
          if (book && !matchedIdsSet.has(book.id)) {
            matchedIdsSet.add(book.id);
            results.push({
              book,
              confidenceScore: item.confidenceScore || 88,
              matchReason: item.matchReason || 'Matches student search query',
              matchedConcepts: extractedConcepts,
              relevanceRank: index + 1
            });
          }
        });

        // Supplement with any high-scoring local matches
        localResults.forEach(lr => {
          if (!matchedIdsSet.has(lr.book.id) && lr.confidenceScore >= 75) {
            matchedIdsSet.add(lr.book.id);
            results.push(lr);
          }
        });

        if (results.length > 0) {
          const suggestedRelatedBooks = collegeBooksCatalog.filter(b => !matchedIdsSet.has(b.id)).slice(0, 3);
          searchLogs.push({ query: userQuery, type: 'ai', timestamp: new Date().toISOString(), resultsCount: results.length, collegeId: targetCollegeId });

          searchResultsCache.set(aiCacheKey, {
            total: results.length,
            books: results.map(r => r.book),
            rawResults: results,
            timestamp: Date.now()
          });

          return res.json({
            query: userQuery,
            extractedConcepts,
            results,
            suggestedRelatedBooks: results.length === 0 ? suggestedRelatedBooks : undefined,
            searchTimeMs: Date.now() - startTime
          });
        }
      }
    } catch (err) {
      console.warn('Gemini AI Search API error or quota limit reached, falling back seamlessly to local fuzzy search:', err);
    }
  }

  searchResultsCache.set(aiCacheKey, {
    total: localResults.length,
    books: localResults.map(r => r.book),
    rawResults: localResults,
    timestamp: Date.now()
  });

  res.json({
    query: userQuery,
    extractedConcepts: userQuery.split(/\s+/).filter(w => w.length > 2),
    results: localResults,
    searchTimeMs: Date.now() - startTime
  });
});

// POST /api/ai/keywords - Auto-generate metadata using Gemini for new books added by librarian
app.post('/api/ai/keywords', async (req, res) => {
  const { title, description, department, subject } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const prompt = `You are an expert library classification assistant.
Given book title: "${title}", Department: "${department || 'General'}", Subject: "${subject || 'General'}", Description: "${description || ''}".

Generate structured metadata for cataloging:
- keywords: array of 8-12 search keywords (including synonyms, related terms, topics)
- tags: array of 3-5 high level tags
- summary: 2-sentence catalog summary
- callNumber: standard Dewey Decimal call number estimate
- suggestedAlmari: e.g. "A1" to "A12"
- suggestedRow: e.g. "R1" to "R4"
- suggestedPosition: "Top" | "Middle" | "Bottom"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              summary: { type: Type.STRING },
              callNumber: { type: Type.STRING },
              suggestedAlmari: { type: Type.STRING },
              suggestedRow: { type: Type.STRING },
              suggestedPosition: { type: Type.STRING }
            },
            required: ['keywords', 'summary', 'callNumber']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (e) {
      console.error('Error generating AI keywords:', e);
    }
  }

  // Fallback keyword generation
  const words = (title + ' ' + (description || '')).toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  const uniqueKeywords = Array.from(new Set(words));

  res.json({
    keywords: uniqueKeywords.length ? uniqueKeywords : ['general', 'reference', 'library'],
    tags: [department || 'General', 'Academic'],
    summary: `${title} - College library reference work.`,
    callNumber: '000.00 REF',
    suggestedAlmari: 'A1',
    suggestedRow: 'R1',
    suggestedPosition: 'Middle'
  });
});

// GET /api/analytics - Library stats & search log history (scoped by college)
app.get('/api/analytics', (req, res) => {
  const { collegeId } = req.query;
  const targetCollegeId = (collegeId as string) || 'col-gec-goa';

  const scopedBooks = booksCatalog.filter(b => b.collegeId === targetCollegeId);
  const totalBooks = scopedBooks.length;
  const totalCopies = scopedBooks.reduce((sum, b) => sum + b.totalCopies, 0);
  const availableCopies = scopedBooks.reduce((sum, b) => sum + b.availableCopies, 0);

  const departmentsMap: Record<string, number> = {};
  scopedBooks.forEach(b => {
    departmentsMap[b.department] = (departmentsMap[b.department] || 0) + 1;
  });

  const categoryBreakdown = Object.entries(departmentsMap).map(([name, count]) => ({ name, count }));
  const scopedLogs = searchLogs.filter(l => l.collegeId === targetCollegeId);

  res.json({
    stats: {
      totalBooks,
      totalCopies,
      availableCopies,
      departmentCount: Object.keys(departmentsMap).length,
      topSearches: [
        { query: 'Fish Curry Goa', count: 48 },
        { query: 'Machine Learning', count: 42 },
        { query: 'Indian Constitution', count: 35 },
        { query: 'Java Interview', count: 29 },
        { query: 'Organic Chemistry', count: 21 },
        { query: 'History of Maharashtra', count: 18 }
      ],
      categoryBreakdown
    },
    recentLogs: scopedLogs.slice(-20).reverse()
  });
});

// Vite Middleware & Production Serve Setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Smart Library Finder server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
