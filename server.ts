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
    const tempFile = DATA_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify({ colleges: collegesList, books: booksCatalog }, null, 2));
    fs.renameSync(tempFile, DATA_FILE);
  } catch (err) {
    console.error('Error saving library_data_store.json:', err);
  }
}

// Analytics & Search Logs (Scoped by college)
const searchLogs: { query: string; type: 'ai' | 'exact'; timestamp: string; resultsCount: number; collegeId: string }[] = [];

// Helper: Local fallback fuzzy semantic search if AI key is missing or offline
function performLocalSearch(query: string, books: Book[]): AISearchResult[] {
  const cleanQuery = query.toLowerCase().trim();
  const stopWords = new Set(['book', 'books', 'the', 'and', 'for', 'with', 'show', 'me', 'get', 'find', 'search', 'shelf', 'shelves', 'which', 'where', 'that', 'from', 'have', 'need', 'about', 'want', 'list', 'all', 'any', 'a', 'an', 'in', 'on', 'at', 'to', 'of', 'is', 'it']);
  let queryTokens = cleanQuery.split(/\s+/).filter(t => t.length > 1 && !stopWords.has(t));

  if (queryTokens.length === 0 && cleanQuery.length > 0) {
    queryTokens = [cleanQuery];
  }

  const scoredResults: { book: Book; score: number; concepts: string[]; reason: string }[] = [];

  for (const book of books) {
    let score = 0;
    const matchedConcepts: string[] = [];

    const titleLower = (book.title || '').toLowerCase();
    const authorLower = (book.author || '').toLowerCase();
    const subjectLower = (book.subject || '').toLowerCase();
    const deptLower = (book.department || '').toLowerCase();
    const descLower = ((book.description || '') + ' ' + (book.summary || '')).toLowerCase();
    const keywordsStr = (book.keywords || []).join(' ').toLowerCase();
    const rawValuesStr = Object.values(book.rawCsvData || {}).map(v => String(v).toLowerCase()).join(' ');

    // Exact title or full phrase match
    if (titleLower && titleLower === cleanQuery) {
      score += 1000;
      matchedConcepts.push('Exact Title Match');
    } else if (titleLower && titleLower.includes(cleanQuery)) {
      score += 600;
      matchedConcepts.push('Title Phrase Match');
    }

    if (authorLower && authorLower.includes(cleanQuery)) {
      score += 400;
      matchedConcepts.push('Author Match');
    }

    // Token matches
    let matchingTokensCount = 0;
    for (const token of queryTokens) {
      let tokenMatched = false;
      if (titleLower.includes(token)) {
        score += 50;
        tokenMatched = true;
        matchedConcepts.push(`Title: "${token}"`);
      }
      if (authorLower.includes(token)) {
        score += 35;
        tokenMatched = true;
        matchedConcepts.push(`Author: "${token}"`);
      }
      if (subjectLower.includes(token)) {
        score += 25;
        tokenMatched = true;
        matchedConcepts.push(`Subject: "${token}"`);
      }
      if (deptLower.includes(token)) {
        score += 20;
        tokenMatched = true;
        matchedConcepts.push(`Department: "${token}"`);
      }
      if (keywordsStr.includes(token)) {
        score += 20;
        tokenMatched = true;
        matchedConcepts.push(`Keyword: "${token}"`);
      }
      if (descLower.includes(token)) {
        score += 15;
        tokenMatched = true;
      }
      if (rawValuesStr.includes(token)) {
        score += 15;
        tokenMatched = true;
        matchedConcepts.push(`Sheet Data match`);
      }

      if (tokenMatched) matchingTokensCount++;
    }

    // Multi-token query bonus if all tokens match
    if (matchingTokensCount === queryTokens.length && queryTokens.length > 0) {
      score += 250;
    }

    // Penalize multi-token queries where only 1 token matched when query has 2+ tokens
    if (queryTokens.length >= 2 && matchingTokensCount < 2 && !titleLower.includes(cleanQuery)) {
      score = Math.floor(score * 0.4);
    }

    if (score >= 40) {
      const confidence = Math.min(99, Math.max(50, Math.round(score > 300 ? 98 : (score > 150 ? 88 : score))));
      const uniqueConcepts = Array.from(new Set(matchedConcepts));
      scoredResults.push({
        book,
        score: confidence,
        concepts: uniqueConcepts,
        reason: `Matched concepts: ${uniqueConcepts.slice(0, 3).join(', ')}`
      });
    }
  }

  scoredResults.sort((a, b) => b.score - a.score);

  const topScore = scoredResults.length > 0 ? scoredResults[0].score : 0;

  // Filter out low-confidence noise when strong matches are present
  const highQualityResults = scoredResults.filter(item => {
    if (topScore >= 90) {
      return item.score >= Math.max(78, topScore * 0.82);
    }
    if (topScore >= 75) {
      return item.score >= Math.max(68, topScore * 0.75);
    }
    return item.score >= 60;
  });

  return highQualityResults.map((item, index) => ({
    book: item.book,
    confidenceScore: item.score,
    matchReason: item.reason,
    matchedConcepts: item.concepts,
    relevanceRank: index + 1
  }));
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

  const maxLimit = limit ? Math.min(Number(limit) || 300, 1000) : 500;
  const pageNum = Math.max(Number(page) || 1, 1);
  const total = scoped.length;
  const paginated = scoped.slice((pageNum - 1) * maxLimit, pageNum * maxLimit);

  res.json({
    total,
    page: pageNum,
    pageSize: maxLimit,
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

      booksCatalog.unshift(newBook);
      const newIdx = 0; // Because unshifted to front
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
  const cleanQuery = (query || '').toLowerCase().trim();

  const targetCollege = collegesList.find(c => c.id === collegeId);
  const activeMappings = reqMappings || targetCollege?.searchMappings;
  const nameCols = (activeMappings?.nameColumns || []).map((c: string) => c.toLowerCase().trim()).filter(Boolean);

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
    const stopWords = new Set(['book', 'books', 'the', 'and', 'for', 'with', 'show', 'me', 'get', 'find', 'search', 'shelf', 'shelves', 'which', 'where', 'that', 'from', 'have', 'need', 'about', 'want', 'list', 'all', 'any', 'a', 'an', 'in', 'on', 'at', 'to', 'of', 'is', 'it']);
    let queryTokens = cleanQuery.split(/\s+/).filter(t => t.length > 1 && !stopWords.has(t));
    if (queryTokens.length === 0 && cleanQuery.length > 0) {
      queryTokens = [cleanQuery];
    }

    const scored: { book: Book; score: number }[] = [];

    for (const book of filtered) {
      let score = 0;
      const title = (book.title || '').toLowerCase();
      const author = (book.author || '').toLowerCase();
      const accession = (book.accessionNumber || '').toLowerCase();
      const isbn = (book.isbn || '').toLowerCase();
      const subject = (book.subject || '').toLowerCase();
      const dept = (book.department || '').toLowerCase();
      const publisher = (book.publisher || '').toLowerCase();
      const callNumber = (book.callNumber || '').toLowerCase();
      const description = (book.description || '').toLowerCase();
      const keywords = (book.keywords || []).map(k => k.toLowerCase()).join(' ');
      const rawValues = Object.values(book.rawCsvData || {}).map(v => String(v).toLowerCase()).join(' ');
      const customValues = Object.values(book.customAttributes || {}).map(v => String(v).toLowerCase()).join(' ');

      // Extract specific connected Book Name column text if mapped by librarian in Control Panel
      let mappedNameText = '';
      if (nameCols.length > 0) {
        for (const col of nameCols) {
          if (col === 'title') mappedNameText += ' ' + title;
          if (col === 'author') mappedNameText += ' ' + author;
          if (book.rawCsvData) {
            Object.entries(book.rawCsvData).forEach(([k, v]) => {
              if (k.toLowerCase() === col || k.toLowerCase().includes(col)) mappedNameText += ' ' + String(v).toLowerCase();
            });
          }
          if (book.customAttributes) {
            Object.entries(book.customAttributes).forEach(([k, v]) => {
              if (k.toLowerCase() === col || k.toLowerCase().includes(col)) mappedNameText += ' ' + String(v).toLowerCase();
            });
          }
        }
        mappedNameText = mappedNameText.trim();
      }

      // If mapped Name columns exist, score mapped column matches with top priority
      if (mappedNameText) {
        if (mappedNameText === cleanQuery) score += 2000;
        else if (mappedNameText.includes(cleanQuery)) score += 1000;

        for (const token of queryTokens) {
          if (mappedNameText.includes(token)) score += 150;
        }
      } else {
        // Standard unmapped search scoring fallback
        if (title === cleanQuery) score += 1000;
        else if (title.includes(cleanQuery)) score += 500;
        
        if (author === cleanQuery) score += 400;
        else if (author.includes(cleanQuery)) score += 200;

        if (accession.includes(cleanQuery) || isbn.includes(cleanQuery)) score += 400;
        if (subject.includes(cleanQuery) || dept.includes(cleanQuery) || publisher.includes(cleanQuery) || callNumber.includes(cleanQuery)) score += 150;
        if (rawValues.includes(cleanQuery) || customValues.includes(cleanQuery)) score += 150;
      }

      // Token matches across catalog
      let matchingTokensCount = 0;
      for (const token of queryTokens) {
        let matchedInBook = false;
        if (title.includes(token)) {
          score += 60;
          matchedInBook = true;
        }
        if (author.includes(token)) {
          score += 40;
          matchedInBook = true;
        }
        if (accession.includes(token) || isbn.includes(token) || subject.includes(token) || dept.includes(token)) {
          score += 30;
          matchedInBook = true;
        }
        if (keywords.includes(token) || rawValues.includes(token) || customValues.includes(token) || description.includes(token)) {
          score += 20;
          matchedInBook = true;
        }
        if (matchedInBook) matchingTokensCount++;
      }

      // If all query tokens matched in book, give big boost
      if (matchingTokensCount === queryTokens.length && queryTokens.length > 0) {
        score += 200;
      }

      if (score > 0) {
        scored.push({ book, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);

    const topScore = scored.length > 0 ? scored[0].score : 0;
    const filteredScored = scored.filter(s => {
      if (topScore >= 500) {
        return s.score >= Math.max(300, topScore * 0.65);
      }
      if (topScore >= 200) {
        return s.score >= Math.max(150, topScore * 0.6);
      }
      if (queryTokens.length >= 2) {
        return s.score >= 120;
      }
      return s.score >= 50;
    });

    results = filteredScored.map(s => s.book);
  }

  const maxLimit = Math.min(Number(limit) || 300, 1000);

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
  const { query, collegeId } = req.body;

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const userQuery = query.trim();

  // Filter books catalog for this specific college
  const targetCollegeId = collegeId || 'col-gec-goa';
  const targetCollege = collegesList.find(c => c.id === targetCollegeId);
  const activeMappings = req.body.searchMappings || targetCollege?.searchMappings;
  const aiCols = (activeMappings?.aiColumns || []).map((c: string) => c.toLowerCase().trim()).filter(Boolean);

  const collegeBooksCatalog = booksCatalog.filter(b => b.collegeId === targetCollegeId);

  // Pre-filter top candidates based on local relevance scoring
  const candidateResults = performLocalSearch(userQuery, collegeBooksCatalog);
  let topCandidates = candidateResults.slice(0, 100).map(r => r.book);

  // If Gemini API Key is available, use Gemini for deep semantic understanding & ranking
  if (process.env.GEMINI_API_KEY && topCandidates.length > 0) {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      // Prepare candidate catalog overview for Gemini prompt including connected AI columns
      const catalogSummary = topCandidates.map(b => {
        let connectedFields: Record<string, string> = {};
        if (aiCols.length > 0) {
          aiCols.forEach(col => {
            if (col === 'description' && b.description) connectedFields.description = b.description;
            if (col === 'summary' && b.summary) connectedFields.summary = b.summary;
            if (col === 'keywords' && b.keywords?.length) connectedFields.keywords = b.keywords.join(', ');
            if (col === 'subject' && b.subject) connectedFields.subject = b.subject;
            if (col === 'title' && b.title) connectedFields.title = b.title;
            if (b.rawCsvData) {
              Object.entries(b.rawCsvData).forEach(([k, v]) => {
                if (k.toLowerCase() === col || k.toLowerCase().includes(col)) {
                  connectedFields[k] = String(v);
                }
              });
            }
            if (b.customAttributes) {
              Object.entries(b.customAttributes).forEach(([k, v]) => {
                if (k.toLowerCase() === col || k.toLowerCase().includes(col)) {
                  connectedFields[k] = String(v);
                }
              });
            }
          });
        }

        return {
          id: b.id,
          title: b.title,
          subtitle: b.subtitle || '',
          author: b.author,
          department: b.department,
          subject: b.subject,
          description: b.description || '',
          keywords: b.keywords || [],
          connectedAiFields: Object.keys(connectedFields).length > 0 ? connectedFields : undefined,
          shelfCode: b.location?.shelfCode || `${b.location?.almariNumber || 'A1'}-${b.location?.rowNumber || 'R1'}`,
          accessionNumber: b.accessionNumber || ''
        };
      });

      const prompt = `You are the AI Librarian assistant for a college library. 
A student is asking for books using natural language: "${userQuery}".

Students often describe topics in plain English or may have spelling mistakes (e.g. "I need a Fish Curry book", "macheen lernin", "Goa recipes", "Java interview preparation").

Analyze the student query:
1. Extract the core intent, topic keywords, and semantic concepts (e.g., if asking for "Fish Curry book", concepts are ['Fish', 'Cooking', 'Recipe', 'Goa', 'Seafood', 'Traditional Food']).
2. Search through the library database provided below ONLY. Do NOT invent or hallucinate any books outside this catalog.
3. For matching books, calculate a confidence score (0 to 100), explain why it matches, and list matched concepts.
4. CRITICAL RELEVANCE RULE: ONLY return books in matchedBookIds if they are TRULY RELEVANT to the query (confidence score >= 75). If only 1 or 2 books in the catalog match (e.g., "Understanding Lost Kingdom"), return ONLY those 1 or 2 books. DO NOT return dozens of unrelated books that happen to share a single word like "Understanding" or "Lost".

Library Catalog:
${JSON.stringify(catalogSummary, null, 2)}

Return a JSON object with:
- extractedConcepts: array of semantic topic keywords inferred from query
- matchedBookIds: array of objects with { id: string, confidenceScore: number, matchReason: string, matchedConcepts: string[] } ranked best match first.

Return strictly JSON matching this structure.`;

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
                    matchReason: { type: Type.STRING },
                    matchedConcepts: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
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
      const extractedConcepts: string[] = parsed.extractedConcepts || [];
      const matchedList: any[] = parsed.matchedBookIds || [];

      const results: AISearchResult[] = [];
      const matchedIdsSet = new Set<string>();

      matchedList.forEach((item, index) => {
        if (item.confidenceScore && item.confidenceScore < 70) return;
        const book = collegeBooksCatalog.find(b => b.id === item.id);
        if (book) {
          matchedIdsSet.add(book.id);
          results.push({
            book,
            confidenceScore: item.confidenceScore || 85,
            matchReason: item.matchReason || 'Matches student search topic',
            matchedConcepts: item.matchedConcepts || extractedConcepts,
            relevanceRank: index + 1
          });
        }
      });

      // Related suggestions if few or no matches
      const suggestedRelatedBooks = collegeBooksCatalog.filter(b => !matchedIdsSet.has(b.id)).slice(0, 3);

      searchLogs.push({ query: userQuery, type: 'ai', timestamp: new Date().toISOString(), resultsCount: results.length, collegeId: targetCollegeId });

      const searchResponse: AISearchResponse = {
        query: userQuery,
        extractedConcepts,
        results,
        suggestedRelatedBooks: results.length === 0 ? suggestedRelatedBooks : undefined,
        searchTimeMs: Date.now() - startTime
      };

      return res.json(searchResponse);

    } catch (err) {
      console.error('Gemini AI Search API error, falling back to local semantic search:', err);
    }
  }

  // Fallback local semantic search
  const localResults = performLocalSearch(userQuery, collegeBooksCatalog);
  const matchedIdsSet = new Set(localResults.map(r => r.book.id));
  const suggestedRelatedBooks = collegeBooksCatalog.filter(b => !matchedIdsSet.has(b.id)).slice(0, 3);

  searchLogs.push({ query: userQuery, type: 'ai', timestamp: new Date().toISOString(), resultsCount: localResults.length, collegeId: targetCollegeId });

  const responsePayload: AISearchResponse = {
    query: userQuery,
    extractedConcepts: userQuery.split(/\s+/).filter(w => w.length > 2),
    results: localResults,
    suggestedRelatedBooks: localResults.length === 0 ? suggestedRelatedBooks : undefined,
    searchTimeMs: Date.now() - startTime
  };

  res.json(responsePayload);
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
