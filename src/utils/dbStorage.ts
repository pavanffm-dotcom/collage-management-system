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
  // Always maintain an instant localStorage backup as secondary safety net
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (isExplicitClear) {
        localStorage.removeItem(`smart_cms_books_backup_${collegeId}`);
        localStorage.setItem(`smart_cms_explicit_clear_${collegeId}`, 'true');
      } else if (books && books.length >= 0) {
        localStorage.setItem(`smart_cms_books_backup_${collegeId}`, JSON.stringify(books));
        localStorage.removeItem(`smart_cms_explicit_clear_${collegeId}`);
      }
    }
  } catch (e) {
    console.error('LocalStorage backup error:', e);
  }

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
  let isExplicitClearInLs = false;
  let lsBooks: any[] = [];

  if (typeof window !== 'undefined' && window.localStorage) {
    isExplicitClearInLs = localStorage.getItem(`smart_cms_explicit_clear_${collegeId}`) === 'true';
    const rawLs = localStorage.getItem(`smart_cms_books_backup_${collegeId}`);
    if (rawLs) {
      try {
        const parsed = JSON.parse(rawLs);
        if (Array.isArray(parsed)) {
          lsBooks = parsed;
        }
      } catch (e) {}
    }
  }

  try {
    const db = await openLocalDB();
    const tx = db.transaction([BOOKS_STORE, META_STORE], 'readonly');
    const bookStore = tx.objectStore(BOOKS_STORE);
    const metaStore = tx.objectStore(META_STORE);

    const metaReq = metaStore.get(`meta_${collegeId}`);
    const booksReq = bookStore.getAll();

    return new Promise((resolve) => {
      tx.oncomplete = () => {
        let meta = metaReq.result || null;
        if (!meta && isExplicitClearInLs) {
          meta = { key: `meta_${collegeId}`, collegeId, isExplicitClear: true, lastUpdated: Date.now() };
        }
        const allBooks = booksReq.result || [];
        let filteredBooks = allBooks.filter(b => !b.collegeId || b.collegeId === collegeId);
        
        // Use localStorage backup if IndexedDB returned no books but localStorage backup has books
        if (filteredBooks.length === 0 && lsBooks.length > 0 && (!meta || !meta.isExplicitClear)) {
          filteredBooks = lsBooks;
        }

        resolve({ books: filteredBooks, meta });
      };
      tx.onerror = () => {
        const meta = isExplicitClearInLs ? { isExplicitClear: true } : null;
        resolve({ books: lsBooks, meta });
      };
    });
  } catch (err) {
    console.error('Failed to read books from IndexedDB:', err);
    const meta = isExplicitClearInLs ? { isExplicitClear: true } : null;
    return { books: lsBooks, meta };
  }
}

export async function clearLocalDBForCollege(collegeId: string): Promise<void> {
  return saveBooksToLocalDB(collegeId, [], true);
}
