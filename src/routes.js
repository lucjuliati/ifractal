import express from "express"
import app from "./controllers/app.js"
import report from "./controllers/report.js"

const routes = express.Router()

routes.get("/", app.index)
routes.get("/data", app.data)
routes.get("/report", report.byDate)
routes.post("/login", app.login)

export default routes
