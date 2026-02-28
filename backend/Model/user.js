const mongoose = require('mongoose');
const crypto = require('crypto');

const SALT_BYTE_SIZE = 16;
const HASH_LENGTH = 64;
const HASH_SEPARATOR = ':';

// Hash format: <32-char-hex-salt>:<128-char-hex-hash>
const isHashedPassword = (password) => {
  if (typeof password !== 'string') return false;
  const parts = password.split(HASH_SEPARATOR);
  // Salt is 32 hex chars (16 bytes), hash is 128 hex chars (64 bytes)
  return parts.length === 2 && parts[0].length === 32 && parts[1].length === 128;
};

const hashPassword = (password) => {
  const salt = crypto.randomBytes(SALT_BYTE_SIZE).toString('hex'); // 32 chars
  const hash = crypto.scryptSync(password, salt, HASH_LENGTH).toString('hex'); // 128 chars
  return `${salt}${HASH_SEPARATOR}${hash}`;
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    usn: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Mongoose 9 compatible pre-save hook using async (no next parameter needed)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  if (!isHashedPassword(this.password)) {
    this.password = hashPassword(this.password);
  }
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  if (!isHashedPassword(this.password)) {
    return this.password === candidatePassword;
  }
  const [salt, storedHash] = this.password.split(HASH_SEPARATOR);
  const candidateHash = crypto.scryptSync(candidatePassword, salt, HASH_LENGTH).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(candidateHash, 'hex'));
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    usn: this.usn,
    role: this.role,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
