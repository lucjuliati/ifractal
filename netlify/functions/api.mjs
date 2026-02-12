import serverless from "serverless-http"
import start from "../../src/start"

const app = start(true)
const handler = serverless(app)
export { handler }