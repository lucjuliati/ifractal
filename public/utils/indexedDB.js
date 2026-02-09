class IndexedDBUtil {
  constructor(dbName, version = 1, stores = []) {
    this.dbName = dbName
    this.version = version
    this.stores = stores
    this.db = null
  }

  open() {
    if (this.db) return Promise.resolve(this.db)

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        for (const storeDef of this.stores) {
          if (!db.objectStoreNames.contains(storeDef.name)) {
            const store = db.createObjectStore(
              storeDef.name,
              { keyPath: storeDef.keyPath, autoIncrement: storeDef.autoIncrement }
            )

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

  _getStore(storeName, mode = 'readonly') {
    const tx = this.db.transaction(storeName, mode)
    return tx.objectStore(storeName)
  }

  async get(storeName, key) {
    await this.open()

    return new Promise((resolve, reject) => {
      const request = this._getStore(storeName).get(key)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAll(storeName) {
        console.log(storeName)

    await this.open()

    return new Promise((resolve, reject) => {
      const request = this._getStore(storeName).getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async add(storeName, value) {
    await this.open()

    return new Promise((resolve, reject) => {
      const request = this._getStore(storeName, 'readwrite').add(value)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async put(storeName, value) {
    await this.open()

    return new Promise((resolve, reject) => {
      const request = this._getStore(storeName, 'readwrite').put(value)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async delete(storeName, key) {
    await this.open()

    return new Promise((resolve, reject) => {
      const request = this._getStore(storeName, 'readwrite').delete(key)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clear(storeName) {
    await this.open()

    return new Promise((resolve, reject) => {
      const request = this._getStore(storeName, 'readwrite').clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getByIndex(storeName, indexName, query) {
    await this.open()

    return new Promise((resolve, reject) => {
      const store = this._getStore(storeName)
      const index = store.index(indexName)

      const request = index.getAll(query)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  static deleteDB() {
    indexedDB.deleteDatabase("records")
  }

  close() {
    this.db?.close()
    this.db = null
  }
}
