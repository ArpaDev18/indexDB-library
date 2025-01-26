import {
  AddToStorageParamsType, GetFromStorageParamsType,
  SetNewStorageParamsType, StorageParamsType,
} from '../types/indexDB.types';
import { MAX_BREADCRUMBS_RECORDS_COUNT, INDEXDB_CREATION_KEY } from '../constants';

import { TBreadcrumbs } from '../types/breadcrumbs';

export class IndexDBService {
  protected channel: string | null;
  protected databaseInstance: IDBDatabase | null = null;

  // should be set at first to create channel for working with indexDB
  setChannel = (channel) => {
    this.channel = channel;
  };

  // handle connection success, error, onupgradeneeded methods
  createDBOperationListeners = (
    dbOperation,
  ):Promise<Event> => {
    return new Promise((resolve, reject) => {
      if (!dbOperation) {
        reject(new Error('DB Connection error'));
      }

      // eslint-disable-next-line no-param-reassign
      dbOperation.onerror = async (event) => {
        console.warn(event);
        reject(event);
      };

      // eslint-disable-next-line no-param-reassign
      dbOperation.onsuccess = async (event) => {
        this.databaseInstance = (event.target as IDBOpenDBRequest).result;
        resolve(event);
      };
    });
  };

  // set connection with database
  connectDataBase = (
    newVersion?:number,
  ): Promise<Event> => {
    const connect: IDBOpenDBRequest = indexedDB?.open(this.channel, newVersion);

    return this.createDBOperationListeners(connect);
  };

  // Check if lines count in database more than max_count, sort by added date and delete redundant
  deleteOldRecords = (count:number, store:IDBObjectStore):Promise<void> => {
    if (count < MAX_BREADCRUMBS_RECORDS_COUNT) {
      return;
    }
    const index = store.index(INDEXDB_CREATION_KEY);
    const getAllRequest = index.getAll();
    const sortedRecords = getAllRequest.result.sort((a, b) => b.addedAt - a.addedAt);
    const recordsToKeep = sortedRecords.slice(0, MAX_BREADCRUMBS_RECORDS_COUNT);

    const cursorConnect = store.openCursor();

    cursorConnect.onsuccess = (event:Event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (!cursor) {
        return;
      }

      if (!recordsToKeep.find((record) => record.key === cursor.key)) {
        cursor.delete();
      }
      cursor.continue();
    };
  };

  // connect database , find necessary storage, check count of records and delete old records
  keepLatestRecords = async (storageName: string):Promise<void> => {
    await this.connectDataBase();
    const transaction = this.databaseInstance.transaction(storageName, 'readonly');
    const store = transaction.objectStore(storageName);
    const countStoreConnect = store.count();
    const countStoreConnectEvent = await this.createDBOperationListeners(countStoreConnect);
    const recordsCount = (countStoreConnectEvent.target as IDBOpenDBRequest).result;
    await this.deleteOldRecords(Number(recordsCount), store);
  };

  // setting new storage in the channel
  setNewStorage = async ({
    storageName,
    dataToInsert,
    key,
  }:SetNewStorageParamsType):Promise<void> => {
    if (this.databaseInstance) {
      this.databaseInstance.close();
    }
    const newVersion = this.databaseInstance.version + 1;
    const connect: IDBOpenDBRequest = indexedDB?.open(this.channel, newVersion);
    connect.onupgradeneeded = (event) => {
      this.databaseInstance = (event.target as IDBOpenDBRequest).result;
      const objectStore = this.databaseInstance.createObjectStore(
        storageName,
        { autoIncrement: false },
      );
      objectStore.createIndex(INDEXDB_CREATION_KEY, INDEXDB_CREATION_KEY, { unique: false });
    };
    await this.createDBOperationListeners(connect);
    const transaction = this.databaseInstance.transaction(storageName, 'readwrite');
    const store = transaction.objectStore(storageName);
    const addConnect = store.add({ data: dataToInsert, addedAt: new Date().getTime() }, key);
    await this.createDBOperationListeners(addConnect);
  };

  // adding data to existing storage
  addToStorage = async (
    {
      storageName,
      objectToAdd,
      key,
    }:AddToStorageParamsType,
  ): Promise<TBreadcrumbs[]> => {
    await this.connectDataBase();
    const transaction = this.databaseInstance.transaction(storageName, 'readwrite');
    const store = transaction.objectStore(storageName);
    const addConnection = store.add({ data: objectToAdd, addedAt: new Date().getTime() }, key);
    await this.createDBOperationListeners(addConnection);
    await this.keepLatestRecords(storageName);
    return objectToAdd;
  };

  // get data from existing storage
  getFromStorage = async ({
    storageName,
    key,
  }:GetFromStorageParamsType): Promise<TBreadcrumbs[]> => {
    await this.connectDataBase();
    const transaction = this.databaseInstance.transaction(storageName, 'readonly');
    const store = transaction.objectStore(storageName);
    const getRequestConnection = store.get(key);
    const getRequestConnectionEvent = await this.createDBOperationListeners(getRequestConnection);
    const { data } = (getRequestConnectionEvent.target as IDBRequest).result || {};
    return data;
  };

  // check if key exist in the storage
  checkKeyExisting = async (storageName, key):Promise<boolean> => {
    await this.connectDataBase();
    const transaction = this.databaseInstance.transaction(storageName, 'readonly');
    const objectStore = transaction.objectStore(storageName);
    const storageConnect = objectStore.get(key);
    const storageConnectEvent = await this.createDBOperationListeners(storageConnect);
    const { result } = (storageConnectEvent.target as IDBRequest);
    return !!result;
  };

  checkStorageExisting = (storageName) => {
    if (!this.databaseInstance) return;
    return this.databaseInstance.objectStoreNames.contains(storageName);
  };

  // update data in storage
  updateStorage = async ({ storageName, key, newData }:StorageParamsType):Promise<void> => {
    await this.connectDataBase();
    const transaction = this.databaseInstance.transaction(storageName, 'readwrite');
    const store = transaction.objectStore(storageName);
    const getRequestConnect = store.get(key);
    const getRequestConnectEvent = await this.createDBOperationListeners(getRequestConnect);
    const data = (getRequestConnectEvent.target as IDBRequest).result;
    if (!data) {
      return;
    }
    store.put(
      { data: newData, addedAt: new Date().getTime() },
      key,
    );
    await this.keepLatestRecords(storageName);
  };
}
