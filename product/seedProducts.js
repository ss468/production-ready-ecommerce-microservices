const mongoose = require('mongoose')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config()

// Define Product Schema inline
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    default: 50
  }
}, { timestamps: true })

const Product = mongoose.model('Product', productSchema)

const sampleProducts = [
  {
    name: 'iPhone 15 Pro',
    price: 999.99,
    description: 'Latest flagship iPhone with A17 Pro chip, advanced camera system, and stunning Super Retina XDR display. Perfect for photography and daily multitasking.',
    stock: 45
  },
  {
    name: 'MacBook Pro 14"',
    price: 1999.99,
    description: 'Powerful M3 Max processor with 36GB unified memory. Ideal for developers, designers, and content creators. Features exceptional battery life.',
    stock: 28
  },
  {
    name: 'AirPods Pro (2nd Gen)',
    price: 249.99,
    description: 'Premium wireless earbuds with active noise cancellation, adaptive audio, and personalized spatial audio. Seamless pairing with all Apple devices.',
    stock: 120
  },
  {
    name: 'iPad Air 11"',
    price: 699.99,
    description: 'Ultra-thin and powerful M1 tablet with stunning display. Great for creative work, reading, and entertainment with pencil support.',
    stock: 65
  },
  {
    name: 'Apple Watch Series 9',
    price: 399.99,
    description: 'Advanced health, fitness, and wellness tracker. Always-On Retina display, ECG app, blood oxygen sensor, and crash detection.',
    stock: 85
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    price: 1299.99,
    description: 'Cutting-edge Android flagship with AI-powered features, exceptional camera array, and ultra-smooth 120Hz display.',
    stock: 38
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    price: 349.99,
    description: 'Industry-leading noise cancellation, premium sound quality, and 30-hour battery life. Perfect for travel and daily use.',
    stock: 55
  },
  {
    name: 'DJI Air 3S Drone',
    price: 999.00,
    description: '4K camera drone with impressive flight time, intelligent tracking, and obstacle sensing. Ideal for aerial photography and videography.',
    stock: 22
  },
  {
    name: 'Keychron Mechanical Keyboard',
    price: 149.99,
    description: 'Wireless mechanical keyboard with hot-swappable switches. Ultra-slim design with multi-device connectivity and great battery life.',
    stock: 90
  },
  {
    name: 'Logitech MX Master 3S Mouse',
    price: 99.99,
    description: 'Premium wireless mouse with precision scrolling, customizable buttons, and multi-device switching for seamless productivity.',
    stock: 110
  }
]

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://mongodb:27017/product-db'
    console.log('📡 Connecting to MongoDB:', mongoUri)
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    
    console.log('✅ Connected to MongoDB')
    
    // Clear existing products
    await Product.deleteMany({})
    console.log('🗑️  Cleared existing products')
    
    // Insert sample products
    const insertedProducts = await Product.insertMany(sampleProducts)
    console.log(`✅ Successfully inserted ${insertedProducts.length} products:`)
    
    insertedProducts.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - $${product.price} (Stock: ${product.stock})`)
    })
    
    // Verify
    const count = await Product.countDocuments()
    console.log(`\n📊 Total products in database: ${count}`)
    
    await mongoose.connection.close()
    console.log('✅ Database seeding completed successfully!')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run seeding
seedDatabase()
