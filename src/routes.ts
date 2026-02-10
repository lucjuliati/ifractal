import express from "express"
import app from "./controllers/app"
import report from "./controllers/report"
import auth from "./controllers/auth"

const routes = express.Router()

routes.get("/", app.index)
routes.get("/data", app.data)
routes.get("/report", report.byDate)
routes.post("/login", auth.login)

export default routes
