require('dotenv').config()

const { connectDb } = require('../src/config/db')
const { User, ROLES } = require('../src/models/User')

async function run() {
  await connectDb()

  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME || 'Admin'

  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env')
  }

  const existingAdmin = await User.findOne({ role: ROLES.ADMIN })
  if (existingAdmin) {
    // eslint-disable-next-line no-console
    console.log('Admin already exists:', existingAdmin.email)
    process.exit(0)
  }

  const exists = await User.findOne({ email: String(email).toLowerCase() })
  if (exists) throw new Error('That email already exists')

  const user = new User({ name, email, role: ROLES.ADMIN, passwordHash: 'temp' })
  await user.setPassword(password)
  await user.save()

  // eslint-disable-next-line no-console
  console.log('Created admin:', user.email)
  process.exit(0)
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})
