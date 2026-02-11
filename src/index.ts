import { TTLCache } from "./utils/cache"
import start from "./start"

start()

process.on("SIGTERM", () => {
    const cache = TTLCache.getInstance()
    cache.destroy()
    process.exit(0)
})
