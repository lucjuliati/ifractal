interface IndexConfig {
  name: string
  keyPath: string | string[]
  options?: IDBIndexParameters
}

interface StoreDefinition {
  name: string
  keyPath?: string
  autoIncrement?: boolean
  indexes?: IndexConfig[]
}

type TransactionMode = 'readonly' | 'readwrite'

class IndexedDBUtil {
  private dbName: string
  private version: number
  private stores: StoreDefinition[]
  private db: IDBDatabase | null

  constructor(dbName: string, version: number = 1, stores: StoreDefinition[] = []) {
    this.dbName = dbName
    this.version = version
    this.stores = stores
    this.db = null
  }

  open(): Promise<IDBDatabase> {
    if (this.db) return Promise.resolve(this.db)

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        for (const storeDef of this.stores) {
          if (!db.objectStoreNames.contains(storeDef.name)) {
            const store = db.createObjectStore(storeDef.name, {
              keyPath: storeDef.keyPath,
              autoIncrement: storeDef.autoIncrement
            })

            storeDef.indexes?.forEach(index => {
              store.createIndex(index.name, index.keyPath, index.options)
            })
          }
        }
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }
    })
  }

  private _getStore(storeName: string, mode: TransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) throw new Error('Database not opened')
    const tx = this.db.transaction(storeName, mode)
    return tx.objectStore(storeName)
  }

  async get<T = unknown>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    await this.open()
    return new Promise((resolve, reject) => {
      const request = this._getStore(storeName).get(key)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAll<T = unknown>(storeName: string): Promise<T[]> {
    await this.open()
    return new Promise((resolve, reject) => {
      const request = this._getStore(storeName).getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async add<T = unknown>(storeName: string, value: T): Promise<IDBValidKey> {
    await this.open()
    return new Promise((resolve, reject) => {
      const request = this._getStore(storeName, 'readwrite').add(value)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async put<T = unknown>(storeName: string, value: T): Promise<IDBValidKey> {
    await this.open()
    return new Promise((resolve, reject) => {
      const request = this._getStore(storeName, 'readwrite').put(value)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async delete(storeName: string, key: IDBValidKey): Promise<void> {
    await this.open()
    return new Promise((resolve, reject) => {
      const request = this._getStore(storeName, 'readwrite').delete(key)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clear(storeName: string): Promise<void> {
    await this.open()
    return new Promise((resolve, reject) => {
      const request = this._getStore(storeName, 'readwrite').clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getByIndex<T = unknown>(storeName: string, indexName: string, query?: IDBValidKey | IDBKeyRange): Promise<T[]> {
    await this.open()
    return new Promise((resolve, reject) => {
      const store = this._getStore(storeName)
      const index = store.index(indexName)
      const request = index.getAll(query)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  static deleteDB(dbName: string): void {
    indexedDB.deleteDatabase(dbName)
  }

  close(): void {
    this.db?.close()
    this.db = null
  }
}

export default IndexedDBUtil
