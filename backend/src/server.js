require('dotenv').config()

const { connectDb } = require('./config/db')
const { createApp } = require('./app')

async function main() {
  await connectDb()
  const app = createApp()

  const port = Number(process.env.PORT || 5000)
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})