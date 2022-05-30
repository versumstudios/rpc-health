const fetch = require("node-fetch")

// checks every 1 minute
const CHECK_TIMEOUT = 1000 * 60 * 1

// fetch time out at 10seconds
const FETCH_TIMEOUT = 1000 * 10

const ALL_NODES = [
  { network: "mainnet", node: "mainnet.api.tez.ie" },
  { network: "mainnet", node: "mainnet.smartpy.io" },
  { network: "mainnet", node: "rpc.tzbeta.net" },
  { network: "mainnet", node: "teznode.letzbake.com" },
  { network: "mainnet", node: "mainnet-tezos.giganode.io" },
  { network: "mainnet", node: "mainnet.tezos.marigold.dev" },
  { network: "mainnet", node: "rpc-mainnet.ateza.io" },
  { network: "mainnet", node: "eu01-node.teztools.net" },
  { network: "mainnet", node: "rpc.tzkt.io/mainnet" },
]

let tzkt_level = 0
let valid = []
let broken = []

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = FETCH_TIMEOUT } = options

  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  })
  clearTimeout(id)
  return response
}

const checkNode = async (current) => {
  let failed = true
  let level = -1
  try {
    const response = await fetchWithTimeout(
      `https://${current.node}/chains/main/blocks/head/header`
    ).then((e) => e.json())
    level = response.level - tzkt_level
    if (level === -1) {
      console.log("LEVEL IS -1", response.level, tzkt_level)
    }
    // node has an healthy block difference of less than 60seconds
    if (level < 2) {
      failed = false
    }
  } catch (error) {
    // failed to fetch node or fetch timeout
  }

  // remove from valid or broken if found
  valid = valid.filter((e) => e.node !== current.node)
  broken = broken.filter((e) => e.node !== current.node)

  if (!failed) {
    valid.push({ ...current, level })
  } else {
    broken.push(current)
  }
}

const check = async () => {
  const tzkt = await fetchWithTimeout(
    "https://api.mainnet.tzkt.io/v1/head"
  ).then((e) => e.json())
  if (tzkt) {
    tzkt_level = tzkt.level

    for (let i = 0; i < ALL_NODES.length; i++) {
      await checkNode(ALL_NODES[i])
    }
  }

  // when all nodes are fetched, do it again
  setTimeout(check, CHECK_TIMEOUT)
}

check()

const getNodes = () => {
  return { valid, broken }
}

module.exports = getNodes
