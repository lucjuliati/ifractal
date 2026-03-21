import React from "react"
import IndexedDBUtil from "@/lib/db/indexed-db"

const database = new IndexedDBUtil("dates", 1, [{
  name: "records",
  keyPath: "id",
  autoIncrement: true,
  indexes: [
    { name: "byDate", keyPath: "date" },
    { name: "byUser", keyPath: "user" },
    { name: "byUserAndDate", keyPath: ["user", "date"] }
  ]
}])

export const DatabaseContext = React.createContext<{ database: IndexedDBUtil }>({
  database
})

export const DatabaseContextProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <DatabaseContext.Provider value={{ database }}>
      {children}
    </DatabaseContext.Provider>
  )
}