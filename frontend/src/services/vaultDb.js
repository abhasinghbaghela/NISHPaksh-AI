// NISHPaksh AI - Forensic Evidence Vault Database (IndexedDB)
// Provides unlimited offline storage for full-resolution forensic photos,
// digital seals, and NDPS Section 52A case records.
// Unlike localStorage (which fails at 5MB), IndexedDB safely handles hundreds of megabytes.

const DB_NAME = 'nishpaksh_forensic_vault';
const DB_VERSION = 1;
const STORE_NAME = 'cases';

function openVaultDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this environment.'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('evidenceId', 'evidenceId', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('date', 'date', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open forensic vault database.'));
    };
  });
}

/**
 * Save or update a case in the persistent IndexedDB vault.
 * Safely persists full-resolution sample images and calibration cards.
 */
export async function saveCaseToVault(caseRecord) {
  if (!caseRecord || !caseRecord.id) return null;
  try {
    const db = await openVaultDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(caseRecord);

      request.onsuccess = () => resolve(caseRecord);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('IndexedDB write warning:', err);
    return null;
  }
}

/**
 * Retrieve all persistent cases from IndexedDB vault.
 */
export async function getAllVaultCases() {
  try {
    const db = await openVaultDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('IndexedDB read warning:', err);
    return [];
  }
}

/**
 * Retrieve a specific case by Case ID or Evidence ID.
 */
export async function getVaultCaseById(id) {
  if (!id) return null;
  try {
    const db = await openVaultDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
        } else {
          // Fallback scan by evidenceId
          const allReq = store.getAll();
          allReq.onsuccess = () => {
            const match = (allReq.result || []).find(
              c => c.id.toLowerCase() === id.toLowerCase() ||
                   (c.evidenceId && c.evidenceId.toLowerCase() === id.toLowerCase())
            );
            resolve(match || null);
          };
          allReq.onerror = () => resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    return null;
  }
}

/**
 * Delete a case from IndexedDB.
 */
export async function deleteVaultCase(id) {
  if (!id) return false;
  try {
    const db = await openVaultDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    return false;
  }
}
