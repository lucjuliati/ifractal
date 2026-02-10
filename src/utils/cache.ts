type CacheEntry<V> = {
  value: V
  expiresAt: number
}

export class TTLCache<K, V> {
  private static instance: TTLCache<any, any>
  private store = new Map<K, CacheEntry<V>>()
  private cleanupIntervalId: ReturnType<typeof setInterval>

  constructor(private cleanupIntervalMs = 60_000) {
    this.cleanupIntervalId = setInterval(
      () => this.cleanup(),
      this.cleanupIntervalMs
    )
  }

  public static getInstance(cleanupIntervalMs = 60_000) {
    if (!TTLCache.instance) {
      TTLCache.instance = new TTLCache(cleanupIntervalMs)
    }

    return TTLCache.instance
  }

  set(key: K, value: V, ttlMs: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    })
  }

  get(key: K): V | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return undefined
    }

    return entry.value
  }

  has(key: K): boolean {
    return this.get(key) !== undefined
  }

  delete(key: K): boolean {
    return this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }

  size(): number {
    return this.store.size
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store) {
      if (entry.expiresAt <= now) {
        this.store.delete(key)
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupIntervalId)
  }
}
