import express from "express"
import { engine } from "express-handlebars"
import cookieParser from "cookie-parser"
import routes from "../routes.js"
import mongooseConfig from "mongoose"
import { config } from "dotenv"
config()

export default async function start(netlify = false) {
  const PORT = 4000
  const app = express()

  try {
    await mongooseConfig.connect(process.env.MONGO_URL)
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err)
  }

  app.use(cookieParser())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(express.static("public"))

  app.engine("hbs", engine({
    extname: ".hbs",
    defaultLayout: false,
  }))

  app.set("view engine", "hbs")
  app.set("views", "public/views")
  app.use(routes)

  if (!netlify) {
    app.listen(PORT, () => console.log(`Running on :4000`))
  }

  return app
}