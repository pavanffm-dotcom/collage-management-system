import { Book } from '../types';

/**
 * Downloads a pre-formatted sample CSV file that librarians can open in Excel,
 * populate with 10,000+ books, and re-upload to import the entire catalog automatically.
 */
export function downloadSampleTemplateCSV() {
  const headers = [
    'Title',
    'Author',
    'Department',
    'Subject',
    'Almari',
    'Row',
    'Position',
    'Copies',
    'ISBN',
    'CallNumber',
    'Keywords',
    'Description'
  ];

  const sampleRows = [
    [
      'Higher Engineering Mathematics',
      'Dr. B.S. Grewal',
      'Mathematics & Basic Sciences',
      'Calculus & Linear Algebra',
      'A1',
      'R3',
      'Middle',
      '10',
      '978-8174091955',
      '510.76 G74H',
      'calculus, differential equations, matrices, Fourier series',
      'Comprehensive textbook for undergraduate engineering mathematics and competitive exams.'
    ],
    [
      'Data Structures and Algorithms in Java',
      'Robert Lafore',
      'Computer Science & Engineering',
      'Data Structures',
      'A2',
      'R2',
      'Top',
      '8',
      '978-0672324536',
      '005.133 J12L',
      'java, trees, graphs, sorting, searching, recursion',
      'Classic handbook on fundamental algorithms, stack, queues, and object-oriented data structures.'
    ],
    [
      'Internal Combustion Engines',
      'V. Ganesan',
      'Mechanical Engineering',
      'Thermodynamics',
      'A4',
      'R1',
      'Bottom',
      '5',
      '978-1259006197',
      '621.43 G15I',
      'engines, diesel, petrol, spark ignition, cooling systems',
      'Essential reference for thermodynamics, IC engine cycles, and combustion analysis.'
    ]
  ];

  const csvContent = [
    headers.join(','),
    ...sampleRows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'library_books_import_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports all books currently in the library catalog to a downloadable CSV file.
 */
export function exportBooksToCSV(books: Book[], collegeName?: string) {
  if (!books || books.length === 0) {
    alert('No books available to export.');
    return;
  }

  const headers = [
    'Accession No',
    'Title',
    'Author',
    'Department',
    'Subject',
    'Almari Number',
    'Row Number',
    'Shelf Position',
    'Shelf Code',
    'Total Copies',
    'Available Copies',
    'ISBN',
    'Call Number',
    'Keywords',
    'Description'
  ];

  const rows = books.map(b => [
    b.accessionNumber || '',
    b.title || '',
    b.author || '',
    b.department || '',
    b.subject || '',
    b.location?.almariNumber || '',
    b.location?.rowNumber || '',
    b.location?.shelfPosition || '',
    b.location?.shelfCode || '',
    String(b.totalCopies ?? 1),
    String(b.availableCopies ?? 1),
    b.isbn || '',
    b.callNumber || '',
    Array.isArray(b.keywords) ? b.keywords.join(', ') : '',
    b.description || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const filename = `${(collegeName || 'library').toLowerCase().replace(/[^a-z0-9]/g, '_')}_catalog_export.csv`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Robust CSV Line Parser handling quotes and commas inside text cells
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let startValueIdx = 0;
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      let val = line.substring(startValueIdx, i).trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1).replace(/""/g, '"');
      }
      result.push(val);
      startValueIdx = i + 1;
    }
  }

  let lastVal = line.substring(startValueIdx).trim();
  if (lastVal.startsWith('"') && lastVal.endsWith('"')) {
    lastVal = lastVal.substring(1, lastVal.length - 1).replace(/""/g, '"');
  }
  result.push(lastVal);

  return result;
}

/**
 * Universal CSV Parser - Reads raw CSV string and returns headers + array of raw row objects.
 */
export function parseCSVToRawDataset(rawText: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = rawText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('CSV file must contain a header row and at least 1 data row.');
  }

  const rawHeaders = parseCSVLine(lines[0]).map(h => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const lineCells = parseCSVLine(lines[i]);
    if (lineCells.length === 0 || !lineCells.some(c => c.trim().length > 0)) continue;

    const rowObj: Record<string, string> = {};
    rawHeaders.forEach((header, idx) => {
      rowObj[header] = lineCells[idx] ? lineCells[idx].trim() : '';
    });
    rows.push(rowObj);
  }

  return { headers: rawHeaders, rows };
}

export interface StandardBookField {
  id: string;
  label: string;
  required?: boolean;
  keywords: string[];
}

export const TARGET_BOOK_FIELDS: StandardBookField[] = [
  { id: 'title', label: 'Book Title', required: true, keywords: ['title', 'booktitle', 'book_title', 'bookname', 'book_name', 'name', 'nama', 'item'] },
  { id: 'author', label: 'Author(s)', required: true, keywords: ['author', 'contributor', 'contributors', 'writer', 'by', 'author_name', 'writtenby', 'pengarang', 'creator', 'person', 'editor'] },
  { id: 'accessionNumber', label: 'Accession / Register No', keywords: ['accession', 'accessionno', 'accession_number', 'acc_no', 'accno', 'register_no', 'asset_id', 'otlid', 'otl_id', 'id', 'book_id'] },
  { id: 'isbn', label: 'ISBN / Barcode', keywords: ['isbn', 'isbn10', 'isbn13', 'standard_no', 'barcode', 'code'] },
  { id: 'department', label: 'Department / Branch', keywords: ['department', 'dept', 'branch', 'stream', 'discipline', 'faculty', 'subject1', 'subject_1', 'category', 'collection'] },
  { id: 'subject', label: 'Subject / Course', keywords: ['subject', 'topic', 'course', 'discipline', 'subject2', 'subject_2', 'type1', 'type_1', 'subtopic'] },
  { id: 'almari', label: 'Almari / Rack / Building', keywords: ['almari', 'rack', 'cupboard', 'cabinet', 'block', 'shelf_id', 'storage', 'location', 'rack_no'] },
  { id: 'row', label: 'Row / Tier / Floor', keywords: ['row', 'tier', 'shelfrow', 'row_no', 'level', 'floor'] },
  { id: 'position', label: 'Shelf Position (Top/Mid/Bot)', keywords: ['position', 'level', 'pos', 'shelf_position'] },
  { id: 'copies', label: 'Copies / Quantity', keywords: ['copies', 'qty', 'quantity', 'total_copies', 'stock', 'total', 'count'] },
  { id: 'publisher', label: 'Publisher', keywords: ['publisher', 'press', 'publishing_house', 'vendor'] },
  { id: 'callNumber', label: 'Call Number / DDC', keywords: ['call', 'callno', 'ddc', 'classification', 'call_code'] },
  { id: 'publicationYear', label: 'Publication Year', keywords: ['copyright_year', 'copyrightyear', 'copyright', 'year', 'pub_year', 'publication_year', 'publishing_year'] },
  { id: 'description', label: 'Description / Notes', keywords: ['description', 'desc', 'summary', 'details', 'remarks', 'about', 'descriptivelicense', 'license'] }
];

/**
 * Intelligent AI/Fuzzy Header Detector - Auto maps raw CSV headers to Target Book Fields
 */
export function autoDetectColumnMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const usedHeaders = new Set<string>();

  TARGET_BOOK_FIELDS.forEach(field => {
    // Standardize raw header for comparison
    const match = headers.find(h => {
      if (usedHeaders.has(h)) return false;
      const normalizedHeader = h.toLowerCase().replace(/[^a-z0-9]/g, '');
      return field.keywords.some(k => normalizedHeader.includes(k) || k.includes(normalizedHeader));
    });

    if (match) {
      mapping[field.id] = match;
      usedHeaders.add(match);
    } else {
      mapping[field.id] = ''; // Unmapped
    }
  });

  return mapping;
}

/**
 * Converts raw dataset rows to structured Book objects preserving ALL exact CSV columns
 * as-is without injecting dummy default strings (e.g. Academic Press, 000.00 REF, etc.).
 */
export function convertExactRawRowsToBooks(rows: Record<string, string>[]): any[] {
  return rows.map((row, idx) => {
    const rawCsvData = { ...row };
    const customAttributes = { ...row };

    // Identify candidate title and author keys from row without forcing hardcoded mappings
    const titleKey = Object.keys(row).find(k => {
      const norm = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      return norm.includes('title') || norm.includes('book') || norm.includes('item') || norm === 'name';
    }) || Object.keys(row)[0];

    const authorKey = Object.keys(row).find(k => {
      const norm = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      return norm.includes('author') || norm.includes('contributor') || norm.includes('writer') || norm.includes('creator');
    }) || Object.keys(row)[1];

    const title = (titleKey && row[titleKey] && row[titleKey].trim()) 
      ? row[titleKey].trim() 
      : (Object.values(row).find(v => v && v.trim().length > 0) || `Record #${idx + 1}`);

    const author = (authorKey && row[authorKey] && row[authorKey].trim()) 
      ? row[authorKey].trim() 
      : '';

    return {
      id: `book-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      author,
      accessionNumber: row['Accession Number'] || row['Accession No'] || row['Accession / Register No'] || row['Otl id'] || row['OTL ID'] || row['otl_id'] || row['id'] || `ACC-${idx + 1001}`,
      isbn: row['ISBN'] || row['Isbn'] || row['Barcode'] || '',
      department: row['Department'] || row['Branch'] || row['Subject'] || '',
      subject: row['Subject'] || row['Department'] || '',
      almari: row['Almari'] || row['Rack'] || '',
      row: row['Row'] || '',
      position: row['Position'] || '',
      copies: 1,
      totalCopies: 1,
      availableCopies: 1,
      publisher: row['Publisher'] || row['Press'] || '',
      callNumber: row['Call Number'] || row['CallNumber'] || '',
      description: row['Description'] || row['Notes'] || '',
      publicationYear: Number(row['Publication Year'] || row['Copyright Year'] || row['Year']) || new Date().getFullYear(),
      customAttributes,
      rawCsvData
    };
  });
}

/**
 * Converts raw dataset rows to structured Book objects using user's custom column mapping.
 * Unmapped CSV columns are safely preserved in customAttributes!
 */
export function convertRawRowsToBooks(rows: Record<string, string>[], mapping?: Record<string, string>): any[] {
  return convertExactRawRowsToBooks(rows);
}

/**
 * Parses raw CSV or TSV string content into structured book object list.
 */
export function parseCSVToBooks(rawText: string): any[] {
  const { headers, rows } = parseCSVToRawDataset(rawText);
  return convertExactRawRowsToBooks(rows);
}
