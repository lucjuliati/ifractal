import serverless from "serverless-http"
import start from "../../src/utils/start.js"

const app = start(true)
const handler = serverless(app)
export { handler }