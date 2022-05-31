const express = require("express")
const http = require("http")
const getRPC = require("./cron/rpc")
const { mainnet, hangzhounet } = require("@versumstudios/rpc-node")

const app = express()
const router = express.Router()

router.use((req, res, next) => {
  res.header("Access-Control-Allow-Methods", "GET")
  next()
})

router.get("/mainnet", (req, res) => {
  res.status(200).send(mainnet)
})

router.get("/mainnet/status", (req, res) => {
  res.status(200).send(getRPC())
})

router.get("/hangzhounet", (req, res) => {
  res.status(200).send(hangzhounet)
})

router.get("/test", (req, res) => {
  const { node } = req.query
  if (node) {
    const result = getRPC()
    const found = result.nodes.find((e) => e.node === node)
    if (found) {
      return res.status(200).send(found)
    }
  }
  res.status(200).send({ level: -1 })
})

app.use("/api/v1", router)

app.get("/", (req, res) => {
  res.send("versum")
})

const server = http.createServer(app)
const PORT = process.env.PORT || 3000
server.listen(PORT, function () {
  console.log(`server started at ${PORT}`)
})
