import express from "express"
import { engine } from "express-handlebars"
import cookieParser from "cookie-parser"
import routes from "../routes.js"
import mongooseConfig from "mongoose"
import { config } from "dotenv"
config()

console.log(process.env.MONGO_URL)

export default function start(netlify = false) {
  const PORT = 4000
  const app = express()

  mongooseConfig.connect(process.env.MONGO_URL).then(() => {
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
  }).catch(console.error)

  return app
}