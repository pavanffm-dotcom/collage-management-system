export type ShelfPosition = 'Top' | 'Middle' | 'Bottom' | 'LEFT' | 'MIDDLE' | 'RIGHT' | 'Left' | 'Right';

export interface College {
  id: string;          // e.g. "col-gec-goa"
  name: string;        // e.g. "Goa Engineering College"
  code: string;        // e.g. "GEC-LIB"
  location: string;    // e.g. "Farmagudi, Ponda, Goa"
  librarianName: string;
  email: string;
  qrCodeUrl?: string;
}

export interface ShelfLocation {
  almariNumber: string; // e.g. "A7" or "7"
  rowNumber: string;    // e.g. "R3" or "3"
  shelfPosition: ShelfPosition; // "Top" | "Middle" | "Bottom"
  shelfCode: string;    // e.g. "A7-R3-M"
  sectionName?: string; // e.g. "Regional Cooking & Heritage"
}

export interface Book {
  id: string;
  collegeId?: string;    // Belongs to specific college (defaults to 'col-gec-goa')
  accessionNumber: string;
  isbn: string;
  title: string;
  subtitle?: string;
  author: string;
  publisher: string;
  edition: string;
  publicationYear: number;
  department: string;
  subject: string;
  language: string;
  category: string;
  description: string;
  summary: string;
  keywords: string[];
  tags: string[];
  callNumber: string;
  availability: 'Available' | 'Borrowed' | 'Reserved' | 'Reference Only';
  totalCopies: number;
  availableCopies: number;
  location: ShelfLocation;
  coverImage?: string;
  customAttributes?: Record<string, string>; // Dynamic unmapped CSV columns (e.g. Price, Donor, Barcode)
  rawCsvData?: Record<string, string>; // Complete original row data from spreadsheet upload
  dateAdded: string;
  lastUpdated: string;
}

export interface AISearchResult {
  book: Book;
  confidenceScore: number; // 0 to 100
  matchReason: string;
  matchedConcepts: string[];
  relevanceRank: number;
}

export interface AISearchResponse {
  query: string;
  extractedConcepts: string[];
  results: AISearchResult[];
  suggestedRelatedBooks?: Book[];
  searchTimeMs: number;
}

export interface LibraryStats {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  departmentCount: number;
  topSearches: { query: string; count: number }[];
  categoryBreakdown: { name: string; count: number }[];
}

export interface IssuedBook {
  id: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount?: number;
  status: 'Issued' | 'Returned';
  borrowType?: 'home' | 'reading_room' | 'project_work';
  issuedAt?: string;
  returnDueDate?: string;
  extraDetails?: {
    homeDurationDays?: number;
    hostelOrAddress?: string;
    contactPhone?: string;
    seatNumber?: string;
    readingDuration?: string;
    projectName?: string;
    guideName?: string;
    projectDurationDays?: number;
  };
}

