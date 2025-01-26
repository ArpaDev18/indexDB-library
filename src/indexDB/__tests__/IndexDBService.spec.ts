import { IndexDBService } from '../IndexDBService';

const mockIndexedDB = {
  open: jest.fn(),
};

const mockIDBDatabase = {
  transaction: jest.fn().mockReturnThis(),
  objectStore: jest.fn().mockReturnThis(),
  createObjectStore: jest.fn(),
  count: jest.fn(),
  get: jest.fn(),
  add: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  close: jest.fn(),
};

(global as any).indexedDB = mockIndexedDB;

describe('IndexDBService', () => {
  let service: IndexDBService;

  beforeEach(() => {
    service = new IndexDBService();
    service.setChannel('test_channel');
    (mockIndexedDB.open as jest.Mock).mockClear();
    (mockIDBDatabase.transaction as jest.Mock).mockClear();
    (mockIDBDatabase.objectStore as jest.Mock).mockClear();
  });

  describe('createDBOperationListeners', () => {
    it('should resolve on success', async () => {
      const dbOperationMock: any = {
        onsuccess: jest.fn(),
        onerror: jest.fn(),
      };
      (mockIndexedDB.open as jest.Mock).mockReturnValue(dbOperationMock);

      const promise = service.createDBOperationListeners(dbOperationMock);
      dbOperationMock.onsuccess({ target: { result: 'dummy_result' } });

      await expect(promise).resolves.toEqual({ target: { result: 'dummy_result' } });
    });

    it('should reject on error', async () => {
      const dbOperationMock: any = {
        onsuccess: jest.fn(),
        onerror: jest.fn(),
      };
      (mockIndexedDB.open as jest.Mock).mockReturnValue(dbOperationMock);

      const promise = service.createDBOperationListeners(dbOperationMock);
      dbOperationMock.onerror('error');

      await expect(promise).rejects.toEqual('error');
    });
  });
});
