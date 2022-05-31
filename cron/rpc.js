const { AbortController } = require("node-abort-controller")
const fetch = require("node-fetch")
const { mainnet } = require("@versumstudios/rpc-node")

// checks every 1 minute
const CHECK_TIMEOUT = 1000 * 60 * 1

// fetch time out at 10seconds
const FETCH_TIMEOUT = 1000 * 10

let tzktLevel = 0
const nodes = []
let timestamp = Date.now()

const fetchWithTimeout = (url, options = {}) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort()
  }, options?.timeout || FETCH_TIMEOUT)

  return fetch(url, {
    ...options,
    signal: controller.signal,
  })
    .then((res) => {
      clearTimeout(timeout)
      return res
    })
    .catch((e) => {
      clearTimeout(timeout)
    })
}

const checkNode = async (node) => {
  let level = -1

  try {
    const response = await fetchWithTimeout(
      `${node}/chains/main/blocks/head/header`
    )
    if (response?.status === 200) {
      const data = await response.json()

      level = data.level - tzktLevel
    }
  } catch (e) {
    // timeout or error
  }

  const found = nodes.find((e) => e.node === node)
  if (found) {
    found.level = level
  } else {
    nodes.push({ level, node })
  }
}

const check = async () => {
  const response = await fetchWithTimeout("https://api.mainnet.tzkt.io/v1/head")

  if (response?.status === 200) {
    const data = await response.json()

    if (data.level) {
      timestamp = Date.now()
      tzktLevel = data.level

      for (let i = 0; i < mainnet.length; i += 1) {
        await checkNode(mainnet[i])
      }
    }
  }

  // when all nodes are fetched, do it again
  setTimeout(check, CHECK_TIMEOUT)
}

check()

const GetRPC = () => {
  return { timestamp, nodes }
}

module.exports = GetRPC
