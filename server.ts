import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { INITIAL_BOOKS } from './src/data/initialBooks.js';
import { Book, AISearchResponse, AISearchResult, College } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

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

// Analytics & Search Logs (Scoped by college)
const searchLogs: { query: string; type: 'ai' | 'exact'; timestamp: string; resultsCount: number; collegeId: string }[] = [];

// Helper: Local fallback fuzzy semantic search if AI key is missing or offline
function performLocalSearch(query: string, books: Book[]): AISearchResult[] {
  const cleanQuery = query.toLowerCase().trim();
  const queryTokens = cleanQuery.split(/\s+/).filter(t => t.length > 2);

  const scoredResults: { book: Book; score: number; concepts: string[]; reason: string }[] = [];

  for (const book of books) {
    let score = 0;
    const matchedConcepts: string[] = [];

    const titleLower = book.title.toLowerCase();
    const authorLower = book.author.toLowerCase();
    const subjectLower = book.subject.toLowerCase();
    const deptLower = book.department.toLowerCase();
    const descLower = (book.description + ' ' + book.summary).toLowerCase();
    const keywordsStr = book.keywords.join(' ').toLowerCase();

    // Exact title match
    if (titleLower === cleanQuery) {
      score += 100;
      matchedConcepts.push('Exact Title Match');
    } else if (titleLower.includes(cleanQuery)) {
      score += 85;
      matchedConcepts.push('Title Match');
    }

    // Keyword tokens
    for (const token of queryTokens) {
      if (titleLower.includes(token)) {
        score += 25;
        matchedConcepts.push(`Title: "${token}"`);
      }
      if (keywordsStr.includes(token)) {
        score += 20;
        matchedConcepts.push(`Keyword: "${token}"`);
      }
      if (subjectLower.includes(token)) {
        score += 20;
        matchedConcepts.push(`Subject: "${token}"`);
      }
      if (deptLower.includes(token)) {
        score += 15;
        matchedConcepts.push(`Department: "${token}"`);
      }
      if (descLower.includes(token)) {
        score += 10;
        matchedConcepts.push(`Description match`);
      }
      if (authorLower.includes(token)) {
        score += 25;
        matchedConcepts.push(`Author: "${token}"`);
      }
    }

    // Special concept mappings for common student query examples
    if (cleanQuery.includes('fish') || cleanQuery.includes('curry') || cleanQuery.includes('goa') || cleanQuery.includes('recipe')) {
      if (keywordsStr.includes('fish') || keywordsStr.includes('curry') || keywordsStr.includes('goa') || book.id === 'bk-101' || book.id === 'bk-109') {
        score += 40;
        matchedConcepts.push('Seafood & Goan Cuisine Topic');
      }
    }
    if (cleanQuery.includes('machine learning') || cleanQuery.includes('ml') || cleanQuery.includes('python')) {
      if (keywordsStr.includes('machine learning') || keywordsStr.includes('python') || book.id === 'bk-102') {
        score += 40;
        matchedConcepts.push('AI & Python Topic');
      }
    }
    if (cleanQuery.includes('constitution') || cleanQuery.includes('law') || cleanQuery.includes('polity')) {
      if (keywordsStr.includes('constitution') || book.id === 'bk-103') {
        score += 40;
        matchedConcepts.push('Indian Constitution & Legal System');
      }
    }
    if (cleanQuery.includes('java') || cleanQuery.includes('interview')) {
      if (keywordsStr.includes('java') || keywordsStr.includes('interview') || book.id === 'bk-104') {
        score += 40;
        matchedConcepts.push('Java Programming & Placement');
      }
    }

    if (score > 10) {
      const confidence = Math.min(99, Math.max(50, Math.round(score)));
      const uniqueConcepts = Array.from(new Set(matchedConcepts));
      scoredResults.push({
        book,
        score: confidence,
        concepts: uniqueConcepts,
        reason: `Matched concepts: ${uniqueConcepts.join(', ')}`
      });
    }
  }

  scoredResults.sort((a, b) => b.score - a.score);

  return scoredResults.map((item, index) => ({
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
  const { name, code, location, librarianName, email } = req.body;

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
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`https://ais-dev-jk3cdvi344xqdqm2vemicn-628346772041.asia-east1.run.app?collegeId=${id}`)}`
  };

  collegesList[colIndex] = updatedCollege;
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

  res.status(201).json({
    success: true,
    message: 'College and Librarian account created successfully!',
    user: { name: librarianName, email, collegeId },
    college: newCollege
  });
});

// GET /api/books - Get library catalog (scoped to collegeId if provided)
app.get('/api/books', (req, res) => {
  const { collegeId } = req.query;
  if (collegeId && typeof collegeId === 'string') {
    const scoped = booksCatalog.filter(b => b.collegeId === collegeId);
    return res.json({ books: scoped });
  }
  res.json({ books: booksCatalog });
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
  const processedBooks: Book[] = [];

  for (let i = 0; i < incomingBooks.length; i++) {
    const b = incomingBooks[i];
    const rawTitle = (b.title || b.BookTitle || b.Title || 'Untitled Book').trim();
    const rawAuthor = (b.author || b.Author || 'Unknown Author').trim();
    const rawIsbn = (b.isbn || b.ISBN || '').trim();
    const rawAccession = (b.accessionNumber || b.AccessionNo || '').trim();

    const titleLower = rawTitle.toLowerCase();
    const authorLower = rawAuthor.toLowerCase();

    // Check if duplicate book already exists in catalog for this college
    const existingIndex = booksCatalog.findIndex(existing => {
      if (existing.collegeId !== targetCollegeId) return false;

      // 1. Match by Accession Number if provided
      if (rawAccession && existing.accessionNumber && existing.accessionNumber.toLowerCase() === rawAccession.toLowerCase()) {
        return true;
      }

      // 2. Match by valid non-default ISBN if provided
      if (rawIsbn && !rawIsbn.startsWith('978-0-0000') && existing.isbn && existing.isbn.toLowerCase() === rawIsbn.toLowerCase()) {
        return true;
      }

      // 3. Match by exact Title + Author
      if (existing.title.toLowerCase() === titleLower && existing.author.toLowerCase() === authorLower) {
        return true;
      }

      return false;
    });

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

      // Update location/details if target had defaults
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
      processedBooks.push(target);
    } else {
      // NEW BOOK -> INSERT RECORD
      const newBook: Book = {
        id: `bk-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
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
        customAttributes: b.customAttributes || undefined,
        dateAdded: dateStr,
        lastUpdated: dateStr
      };

      booksCatalog.unshift(newBook);
      newCount++;
      processedBooks.push(newBook);
    }
  }

  res.status(201).json({
    success: true,
    newCount,
    updatedCount,
    totalProcessed: incomingBooks.length,
    message: `Processed ${incomingBooks.length} rows (${newCount} new books added, ${updatedCount} existing books merged & copy count updated)`,
    books: processedBooks
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
  res.json({ book: updatedBook, message: 'Book updated successfully' });
});

// DELETE /api/books/:id - Delete book
app.delete('/api/books/:id', (req, res) => {
  const initialLength = booksCatalog.length;
  booksCatalog = booksCatalog.filter(b => b.id !== req.params.id);
  if (booksCatalog.length === initialLength) {
    return res.status(404).json({ error: 'Book not found' });
  }
  res.json({ success: true, message: 'Book removed from library catalog' });
});

// POST /api/search/exact - Title/Author/ISBN/Subject search
app.post('/api/search/exact', (req, res) => {
  const { query, department, category, onlyAvailable, collegeId } = req.body;
  const cleanQuery = (query || '').toLowerCase().trim();

  let filtered = booksCatalog;

  if (collegeId) {
    filtered = filtered.filter(b => b.collegeId === collegeId);
  }
  if (department && department !== 'All') {
    filtered = filtered.filter(b => b.department === department);
  }
  if (category && category !== 'All') {
    filtered = filtered.filter(b => b.category === category);
  }
  if (onlyAvailable) {
    filtered = filtered.filter(b => b.availability === 'Available' && b.availableCopies > 0);
  }

  if (!cleanQuery) {
    return res.json({ books: filtered });
  }

  const results = filtered.filter(book => {
    return (
      book.title.toLowerCase().includes(cleanQuery) ||
      book.author.toLowerCase().includes(cleanQuery) ||
      book.isbn.toLowerCase().includes(cleanQuery) ||
      book.subject.toLowerCase().includes(cleanQuery) ||
      book.callNumber.toLowerCase().includes(cleanQuery) ||
      book.keywords.some(k => k.toLowerCase().includes(cleanQuery))
    );
  });

  searchLogs.push({
    query: cleanQuery,
    type: 'exact',
    timestamp: new Date().toISOString(),
    resultsCount: results.length,
    collegeId: collegeId || 'col-gec-goa'
  });

  res.json({ books: results });
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
  const collegeBooksCatalog = booksCatalog.filter(b => b.collegeId === targetCollegeId);

  // If Gemini API Key is available, use Gemini for deep semantic understanding & ranking
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      // Prepare lightweight catalog overview for Gemini prompt
      const catalogSummary = collegeBooksCatalog.map(b => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        author: b.author,
        department: b.department,
        subject: b.subject,
        description: b.description,
        summary: b.summary,
        keywords: b.keywords,
        tags: b.tags,
        shelfCode: b.location.shelfCode,
        availability: b.availability
      }));

      const prompt = `You are the AI Librarian assistant for a college library. 
A student is asking for books using natural language: "${userQuery}".

Students often describe topics in plain English or may have spelling mistakes (e.g. "I need a Fish Curry book", "macheen lernin", "Goa recipes", "Java interview preparation").

Analyze the student query:
1. Extract the core intent, topic keywords, and semantic concepts (e.g., if asking for "Fish Curry book", concepts are ['Fish', 'Cooking', 'Recipe', 'Goa', 'Seafood', 'Traditional Food']).
2. Search through the library database provided below ONLY. Do NOT invent or hallucinate any books outside this catalog.
3. For matching books, calculate a confidence score (0 to 100), explain why it matches, and list matched concepts.
4. Rank the matched books by relevance.

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
    const distPath = path.join(__dirname, 'dist');
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
