export type ShelfPosition = 'Top' | 'Middle' | 'Bottom' | 'LEFT' | 'MIDDLE' | 'RIGHT' | 'Left' | 'Right';

export interface SearchColumnMapping {
  nameColumns: string[];   // Catalog/sheet columns connected to "Search by Book Name"
  aiColumns: string[];     // Catalog/sheet columns connected to "Search with AI"
  autoConnectMatchedHeaders?: boolean;
}

export interface College {
  id: string;          // e.g. "col-gec-goa"
  name: string;        // e.g. "Goa Engineering College"
  code: string;        // e.g. "GEC-LIB"
  location: string;    // e.g. "Farmagudi, Ponda, Goa"
  librarianName: string;
  email: string;
  qrCodeUrl?: string;
  searchMappings?: SearchColumnMapping;
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

export interface MapElement {
  id: string;
  type: 
    | 'room' | 'wall' | 'door' | 'window' | 'entrance' | 'exit' | 'corridor' | 'hall'
    | 'almari' | 'rack' | 'table' | 'chair' | 'sofa' | 'computer' | 'printer' | 'reception' | 'desk' | 'staff_room' | 'office' | 'discussion_room' | 'study_area'
    | 'emergency_exit' | 'fire_extinguisher' | 'cctv' | 'first_aid' | 'alarm'
    | 'path' | 'arrow' | 'direction_marker'
    | 'rectangle' | 'circle' | 'line' | 'text' | 'label' | 'icon' | 'facility';
  
  label: string;
  code?: string; // Short ID e.g. "SHELF-014", "A3", "ENTRANCE"
  shelfId?: string; // Unique Shelf ID e.g. "SHELF-001", "SHELF-014"
  shelfNumber?: number | string;
  rackNumber?: string;
  floor?: string;
  section?: string;
  category?: string;
  capacity?: number;
  description?: string;
  almariNum?: number;

  // Geometry (Canvas coordinates)
  x: number; // px or %
  y: number; // px or %
  width: number; // px or %
  height: number; // px or %
  rotation?: number; // 0-360 deg
  zIndex?: number;

  // Visual Styling & Colors
  fillColor?: string;
  borderColor?: string;
  borderWidth?: number;
  textColor?: string;
  fontSize?: number;
  opacity?: number; // 0.1 - 1.0
  cornerRadius?: number; // px
  hasShadow?: boolean;
  color?: 'wood' | 'emerald' | 'cyan' | 'indigo' | 'violet' | 'rose' | 'amber' | 'slate' | string;

  // Metadata & Grouping
  isLocked?: boolean;
  groupId?: string;
  icon?: string;
  department?: string;
  subjects?: string;
}


