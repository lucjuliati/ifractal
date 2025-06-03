import express from "express"
import app from "./controllers/app.js"

const routes = express.Router()

routes.get("/", app.index)
routes.post("/login", app.login)

export default routes
