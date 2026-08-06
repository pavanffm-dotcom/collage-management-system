// IndexedDB Utility for Persisting Large Book Catalogs (up to 50,000+ books) locally
// Prevents data loss when server container restarts or code is re-deployed

const DB_NAME = 'SmartCMS_Library_IndexedDB';
const DB_VERSION = 1;
const BOOKS_STORE = 'books';
const META_STORE = 'meta';

export function openLocalDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db: IDBDatabase = event.target.result;
      if (!db.objectStoreNames.contains(BOOKS_STORE)) {
        db.createObjectStore(BOOKS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };

    request.onerror = (event: any) => {
      console.error('IndexedDB open error:', event.target.error);
      reject(event.target.error);
    };
  });
}

export async function saveBooksToLocalDB(collegeId: string, books: any[], isExplicitClear: boolean = false): Promise<void> {
  try {
    const db = await openLocalDB();
    const tx = db.transaction([BOOKS_STORE, META_STORE], 'readwrite');
    const bookStore = tx.objectStore(BOOKS_STORE);
    const metaStore = tx.objectStore(META_STORE);

    // Clear existing books for this collegeId or all
    const allBooksRequest = bookStore.openCursor();
    allBooksRequest.onsuccess = (event: any) => {
      const cursor = event.target.result;
      if (cursor) {
        if (!cursor.value.collegeId || cursor.value.collegeId === collegeId) {
          cursor.delete();
        }
        cursor.continue();
      }
    };

    // Add new books
    books.forEach(book => {
      bookStore.put({ ...book, collegeId });
    });

    // Save metadata
    metaStore.put({
      key: `meta_${collegeId}`,
      collegeId,
      lastUpdated: Date.now(),
      totalBooks: books.length,
      isExplicitClear
    });

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = (e: any) => reject(e.target.error);
    });
  } catch (err) {
    console.error('Failed to save books to IndexedDB:', err);
  }
}

export async function getBooksFromLocalDB(collegeId: string): Promise<{ books: any[]; meta: any | null }> {
  try {
    const db = await openLocalDB();
    const tx = db.transaction([BOOKS_STORE, META_STORE], 'readonly');
    const bookStore = tx.objectStore(BOOKS_STORE);
    const metaStore = tx.objectStore(META_STORE);

    const metaReq = metaStore.get(`meta_${collegeId}`);
    const booksReq = bookStore.getAll();

    return new Promise((resolve) => {
      tx.oncomplete = () => {
        const meta = metaReq.result || null;
        const allBooks = booksReq.result || [];
        const filteredBooks = allBooks.filter(b => !b.collegeId || b.collegeId === collegeId);
        resolve({ books: filteredBooks, meta });
      };
      tx.onerror = () => {
        resolve({ books: [], meta: null });
      };
    });
  } catch (err) {
    console.error('Failed to read books from IndexedDB:', err);
    return { books: [], meta: null };
  }
}

export async function clearLocalDBForCollege(collegeId: string): Promise<void> {
  return saveBooksToLocalDB(collegeId, [], true);
}
