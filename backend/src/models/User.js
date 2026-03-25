const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const ROLES = /** @type {const} */ ({
  BUYER: 'buyer',
  VENDOR: 'vendor',
  ADMIN: 'admin',
})

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.BUYER, index: true },
  },
  { timestamps: true },
)

userSchema.methods.setPassword = async function setPassword(password) {
  this.passwordHash = await bcrypt.hash(password, 12)
}

userSchema.methods.verifyPassword = async function verifyPassword(password) {
  return bcrypt.compare(password, this.passwordHash)
}

const User = mongoose.model('User', userSchema)

module.exports = { User, ROLES }
