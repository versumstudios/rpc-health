const express = require("express")
const http = require("http")
const getRPC = require("./cron/rpc")

const app = express()
const router = express.Router()

router.use((req, res, next) => {
  res.header("Access-Control-Allow-Methods", "GET")
  next()
})

router.get("/get-rpc-nodes", (req, res) => {
  res.status(200).send(getRPC())
})

app.use("/api/v1", router)

const server = http.createServer(app)
server.listen(3000, function () {
  console.log("server started at 3000")
})
