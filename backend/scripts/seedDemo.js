require('dotenv').config()

const { connectDb } = require('../src/config/db')
const { User, ROLES } = require('../src/models/User')
const { Vendor } = require('../src/models/Vendor')
const { Product } = require('../src/models/Product')

async function ensureUser({ name, email, password, role }) {
  const normalizedEmail = String(email).toLowerCase()
  const existing = await User.findOne({ email: normalizedEmail }).select('+passwordHash')
  if (existing) return existing

  const user = new User({ name, email: normalizedEmail, role, passwordHash: 'temp' })
  await user.setPassword(password)
  await user.save()
  return user
}

async function ensureVendor({ userId, storeName, bio, isApproved }) {
  const existing = await Vendor.findOne({ user: userId })
  if (existing) return existing
  return Vendor.create({
    user: userId,
    storeName,
    bio: bio || '',
    isApproved: Boolean(isApproved),
  })
}

async function ensureProduct({ vendorId, name, price, stock, category, description, images, isActive }) {
  const existing = await Product.findOne({ vendor: vendorId, name })
  if (existing) return existing
  return Product.create({
    vendor: vendorId,
    name,
    price,
    stock,
    category: category || 'General',
    description: description || '',
    images: Array.isArray(images) ? images : [],
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  })
}

async function run() {
  await connectDb()

  // Create demo admin if not present (uses backend/.env if provided)
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@appzeto.com'
  const adminPass = process.env.ADMIN_PASSWORD || 'admin12345'
  const adminName = process.env.ADMIN_NAME || 'Admin'
  await ensureUser({ name: adminName, email: adminEmail, password: adminPass, role: ROLES.ADMIN })

  // Demo buyer
  await ensureUser({
    name: 'Demo Buyer',
    email: 'buyer1@appzeto.com',
    password: 'Buyer@12345',
    role: ROLES.BUYER,
  })

  const vendors = [
    {
      name: 'Vendor One',
      email: 'vendor1@appzeto.com',
      password: 'Vendor@12345',
      storeName: 'Neon Threads',
      bio: 'Streetwear and essentials.',
      isApproved: false,
      products: [
        {
          name: 'Neon Hoodie',
          price: 39.99,
          stock: 25,
          category: 'Fashion',
          images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=60'],
          description: 'Soft fleece hoodie with a clean neon accent.',
        },
        {
          name: 'Minimal Tee',
          price: 14.5,
          stock: 80,
          category: 'Fashion',
          images: ['https://images.unsplash.com/photo-1520975958225-79b2f643c873?w=1200&auto=format&fit=crop&q=60'],
          description: 'Everyday tee with a premium feel.',
        },
        {
          name: 'Oversized Street Jacket',
          price: 59.0,
          stock: 18,
          category: 'Fashion',
          images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&auto=format&fit=crop&q=60'],
          description: 'Water‑resistant jacket with reflective details.',
        },
        {
          name: 'Gradient Joggers',
          price: 34.99,
          stock: 40,
          category: 'Fashion',
          images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&auto=format&fit=crop&q=60'],
          description: 'Slim fit joggers with subtle gradient pattern.',
        },
        {
          name: 'Classic Denim Jacket',
          price: 44.5,
          stock: 32,
          category: 'Fashion',
          images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&auto=format&fit=crop&q=60'],
          description: 'Medium‑wash denim jacket for everyday wear.',
        },
        {
          name: 'Cropped Hoodie',
          price: 29.99,
          stock: 27,
          category: 'Fashion',
          images: ['https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&auto=format&fit=crop&q=60'],
          description: 'Cropped hoodie that pairs well with high‑rise bottoms.',
        },
        {
          name: 'Logo Cap',
          price: 19.99,
          stock: 90,
          category: 'Accessories',
          images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=60'],
          description: 'Adjustable cap with embroidered Neon Threads logo.',
        },
        {
          name: 'Patterned Socks Pack',
          price: 12.0,
          stock: 120,
          category: 'Accessories',
          images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop&q=60'],
          description: 'Pack of 3 soft socks with minimal patterns.',
        },
        {
          name: 'Everyday Sweatpants',
          price: 29.0,
          stock: 50,
          category: 'Fashion',
          images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=60'],
          description: 'Relaxed fit sweatpants for lounge or street.',
        },
      ],
    },
    {
      name: 'Vendor Two',
      email: 'vendor2@appzeto.com',
      password: 'Vendor@12345',
      storeName: 'KitchenCraft',
      bio: 'Tools for modern cooking.',
      isApproved: false,
      products: [
        {
          name: 'Chef Knife (8")',
          price: 49.0,
          stock: 40,
          category: 'Home',
          images: ['https://images.unsplash.com/photo-1604908176997-125f25cc500f?w=1200&auto=format&fit=crop&q=60'],
          description: 'Balanced 8-inch chef knife for daily prep.',
        },
        {
          name: 'Wood Cutting Board',
          price: 22.0,
          stock: 30,
          category: 'Home',
          images: ['https://images.unsplash.com/photo-1601050690597-3b3b0f0c8f5a?w=1200&auto=format&fit=crop&q=60'],
          description: 'Solid wood board with juice groove.',
        },
        {
          name: 'Cast Iron Skillet',
          price: 39.99,
          stock: 35,
          category: 'Home',
          images: ['https://images.unsplash.com/photo-1615937657715-bcdbef1689b2?w=1200&auto=format&fit=crop&q=60'],
          description: 'Pre‑seasoned skillet that holds heat evenly.',
        },
        {
          name: 'Measuring Spoon Set',
          price: 9.49,
          stock: 100,
          category: 'Home',
          images: ['https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=1200&auto=format&fit=crop&q=60'],
          description: 'Stainless steel spoons with engraved units.',
        },
        {
          name: 'Silicone Spatula Pack',
          price: 15.99,
          stock: 70,
          category: 'Home',
          images: ['https://images.unsplash.com/photo-1518732714860-b62714ce0c59?w=1200&auto=format&fit=crop&q=60'],
          description: 'Heat‑resistant spatulas in multiple sizes.',
        },
        {
          name: 'Glass Storage Containers',
          price: 27.0,
          stock: 45,
          category: 'Home',
          images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1200&auto=format&fit=crop&q=60'],
          description: '4‑piece set with locking lids for meal prep.',
        },
        {
          name: 'Kitchen Shears',
          price: 13.5,
          stock: 80,
          category: 'Home',
          images: ['https://images.unsplash.com/photo-1550305080-4e029753abcf?w=1200&auto=format&fit=crop&q=60'],
          description: 'Multi‑purpose shears with ergonomic grip.',
        },
        {
          name: 'Non‑stick Baking Tray',
          price: 18.0,
          stock: 60,
          category: 'Home',
          images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=60'],
          description: 'Oven‑safe tray ideal for cookies and sheet‑pan meals.',
        },
        {
          name: 'Digital Kitchen Scale',
          price: 21.99,
          stock: 55,
          category: 'Home',
          images: ['https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200&auto=format&fit=crop&q=60'],
          description: 'Accurate scale for baking and portion control.',
        },
      ],
    },
    {
      name: 'Vendor Three',
      email: 'vendor3@appzeto.com',
      password: 'Vendor@12345',
      storeName: 'Gadget Grove',
      bio: 'Small gadgets, big convenience.',
      isApproved: false,
      products: [
        {
          name: 'Wireless Charger Pad',
          price: 18.99,
          stock: 60,
          category: 'Electronics',
          images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&auto=format&fit=crop&q=60'],
          description: 'Fast wireless charging for compatible phones.',
        },
        {
          name: 'Desk Cable Organizer',
          price: 9.99,
          stock: 120,
          category: 'Electronics',
          images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=60'],
          description: 'Keep your desk clean and cables in place.',
        },
        {
          name: 'Bluetooth Earbuds',
          price: 29.99,
          stock: 75,
          category: 'Electronics',
          images: ['https://images.unsplash.com/photo-1589380322902-d6126b48a5bd?w=1200&auto=format&fit=crop&q=60'],
          description: 'Compact earbuds with charging case.',
        },
        {
          name: 'LED Desk Lamp',
          price: 24.0,
          stock: 50,
          category: 'Electronics',
          images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=60'],
          description: 'Adjustable lamp with warm and cool modes.',
        },
        {
          name: 'Laptop Stand',
          price: 28.5,
          stock: 40,
          category: 'Electronics',
          images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&auto=format&fit=crop&q=60'],
          description: 'Aluminum stand that raises laptop to eye level.',
        },
        {
          name: 'USB‑C Hub',
          price: 32.0,
          stock: 65,
          category: 'Electronics',
          images: ['https://images.unsplash.com/photo-1555617981-dac3880eac6c?w=1200&auto=format&fit=crop&q=60'],
          description: 'Multi‑port hub for modern laptops.',
        },
        {
          name: 'Portable Power Bank',
          price: 34.99,
          stock: 90,
          category: 'Electronics',
          images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=60'],
          description: '10,000 mAh power bank with fast‑charge output.',
        },
        {
          name: 'Cable Management Clips',
          price: 8.99,
          stock: 150,
          category: 'Accessories',
          images: ['https://images.unsplash.com/photo-1582719478250-cc8900cde9f9?w=1200&auto=format&fit=crop&q=60'],
          description: 'Adhesive clips that route cables along your desk.',
        },
      ],
    },
  ]

  for (const v of vendors) {
    const user = await ensureUser({ name: v.name, email: v.email, password: v.password, role: ROLES.VENDOR })
    const vendor = await ensureVendor({
      userId: user._id,
      storeName: v.storeName,
      bio: v.bio,
      isApproved: v.isApproved,
    })
    for (const p of v.products) {
      await ensureProduct({ vendorId: vendor._id, ...p })
    }
  }

  // eslint-disable-next-line no-console
  console.log('Seeded demo users/vendors/products (vendors are pending approval).')
  process.exit(0)
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})

