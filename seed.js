const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Review = require('./models/Review');
const Cart = require('./models/Cart');
const Wishlist = require('./models/Wishlist');

const products = [
  {
    name: 'Nike Air Max 270',
    brand: 'Nike',
    category: 'Casual',
    description: 'The Nike Air Max 270 delivers a bold look and incredible comfort with the largest heel Air unit in Nike history.',
    price: 15000,
    discountPrice: 11999,
    stock: 50,
    sku: 'NK-AM270-001',
    images: ['/api/placeholder?text=Air+Max+270&w=600&h=600'],
    color: ['Black', 'White', 'Red'],
    sizes: ['7', '8', '9', '10', '11', '12', '13'],
    gender: 'men',
    featured: true,
    rating: 4.5,
    numReviews: 12,
    tags: ['airmax', 'nike', 'casual'],
  },
  {
    name: 'Adidas Ultraboost 22',
    brand: 'Adidas',
    category: 'Running',
    description: 'Responsive running shoes with adidas Primeknit upper and Boost midsole for energy return.',
    price: 18000,
    discountPrice: 14999,
    stock: 35,
    sku: 'AD-UB22-002',
    images: ['/api/placeholder?text=Ultraboost+22&w=600&h=600'],
    color: ['White', 'Black', 'Blue'],
    sizes: ['7', '8', '9', '10', '11', '12'],
    gender: 'men',
    featured: true,
    rating: 4.7,
    numReviews: 24,
    tags: ['ultraboost', 'adidas', 'running'],
  },
  {
    name: 'Puma RS-X³ Puzzle',
    brand: 'Puma',
    category: 'Casual',
    description: 'Bold chunky silhouette with mixed materials and vibrant color-blocking for street-ready style.',
    price: 8999,
    stock: 40,
    sku: 'PM-RSX3-003',
    images: ['/api/placeholder?text=RS-X3&w=600&h=600'],
    color: ['White', 'Red', 'Black'],
    sizes: ['7', '8', '9', '10', '11'],
    gender: 'men',
    featured: false,
    rating: 4.2,
    numReviews: 8,
    tags: ['puma', 'rsx', 'chunky'],
  },
  {
    name: 'New Balance 574',
    brand: 'New Balance',
    category: 'Casual',
    description: 'Iconic heritage style with ENCAP midsole technology for all-day comfort.',
    price: 7999,
    discountPrice: 6499,
    stock: 60,
    sku: 'NB-574-004',
    images: ['/api/placeholder?text=NB+574&w=600&h=600'],
    color: ['Grey', 'Navy', 'Green'],
    sizes: ['7', '8', '9', '10', '11', '12', '13'],
    gender: 'unisex',
    featured: true,
    rating: 4.4,
    numReviews: 18,
    tags: ['newbalance', '574', 'heritage'],
  },
  {
    name: 'Nike Air Force 1',
    brand: 'Nike',
    category: 'Casual',
    description: 'The basketball classic that became a streetwear icon. Features a leather upper and Nike Air cushioning.',
    price: 9999,
    stock: 75,
    sku: 'NK-AF1-005',
    images: ['/api/placeholder?text=Air+Force+1&w=600&h=600'],
    color: ['White', 'Black'],
    sizes: ['7', '8', '9', '10', '11', '12'],
    gender: 'unisex',
    featured: true,
    rating: 4.6,
    numReviews: 32,
    tags: ['af1', 'nike', 'classic'],
  },
  {
    name: 'Adidas Superstar',
    brand: 'Adidas',
    category: 'Casual',
    description: 'The iconic shell-toe sneaker with a leather upper and signature rubber shell toe.',
    price: 7999,
    stock: 45,
    sku: 'AD-SS-006',
    images: ['/api/placeholder?text=Superstar&w=600&h=600'],
    color: ['White', 'Black', 'Gold'],
    sizes: ['7', '8', '9', '10', '11', '12'],
    gender: 'unisex',
    featured: false,
    rating: 4.3,
    numReviews: 20,
    tags: ['superstar', 'adidas', 'shelltoe'],
  },
  {
    name: 'Reebok Classic Leather',
    brand: 'Reebok',
    category: 'Casual',
    description: 'Timeless leather sneaker with a lightweight EVA midsole for superior cushioning.',
    price: 6999,
    stock: 30,
    sku: 'RB-CL-007',
    images: ['/api/placeholder?text=Classic+Leather&w=600&h=600'],
    color: ['White', 'Black', 'Navy'],
    sizes: ['7', '8', '9', '10', '11'],
    gender: 'unisex',
    featured: false,
    rating: 4.1,
    numReviews: 6,
    tags: ['reebok', 'classic', 'leather'],
  },
  {
    name: 'Converse Chuck Taylor All Star',
    brand: 'Converse',
    category: 'Casual',
    description: 'The original basketball sneaker that became a cultural icon. Canvas upper with rubber toe cap.',
    price: 4999,
    stock: 100,
    sku: 'CN-CT-008',
    images: ['/api/placeholder?text=Chuck+Taylor&w=600&h=600'],
    color: ['Black', 'White', 'Red', 'Blue'],
    sizes: ['7', '8', '9', '10', '11', '12', '13'],
    gender: 'unisex',
    featured: false,
    rating: 4.0,
    numReviews: 15,
    tags: ['converse', 'chucktaylor', 'canvas'],
  },
  {
    name: 'Nike Air Zoom Pegasus 39',
    brand: 'Nike',
    category: 'Running',
    description: 'Responsive everyday running shoe with Zoom Air units and mesh upper for breathability.',
    price: 13000,
    stock: 25,
    sku: 'NK-P39-009',
    images: ['/api/placeholder?text=Pegasus+39&w=600&h=600'],
    color: ['Black', 'Blue', 'Pink'],
    sizes: ['8', '9', '10', '11', '12'],
    gender: 'women',
    featured: true,
    rating: 4.5,
    numReviews: 10,
    tags: ['pegasus', 'nike', 'running'],
  },
  {
    name: 'Adidas Stan Smith',
    brand: 'Adidas',
    category: 'Formal',
    description: 'Clean minimalist design with perforated 3-Stripes and a sleek leather upper.',
    price: 8999,
    stock: 55,
    sku: 'AD-SS-010',
    images: ['/api/placeholder?text=Stan+Smith&w=600&h=600'],
    color: ['White', 'Green', 'Navy'],
    sizes: ['7', '8', '9', '10', '11', '12'],
    gender: 'unisex',
    featured: false,
    rating: 4.2,
    numReviews: 14,
    tags: ['stansmith', 'adidas', 'minimal'],
  },
  {
    name: 'Puma Cali Dream',
    brand: 'Puma',
    category: 'Sports',
    description: 'West Coast inspired sneaker with layered leather upper and chunky rubber sole.',
    price: 7499,
    stock: 20,
    sku: 'PM-CALI-011',
    images: ['/api/placeholder?text=Cali+Dream&w=600&h=600'],
    color: ['White', 'Pink', 'Beige'],
    sizes: ['7', '8', '9', '10'],
    gender: 'women',
    featured: false,
    rating: 4.3,
    numReviews: 5,
    tags: ['puma', 'cali', 'lifestyle'],
  },
  {
    name: 'Vans Old Skool',
    brand: 'Vans',
    category: 'Skateboarding',
    description: 'The iconic skate shoe with suede and canvas upper and signature side stripe.',
    price: 5999,
    stock: 80,
    sku: 'VN-OS-012',
    images: ['/api/placeholder?text=Old+Skool&w=600&h=600'],
    color: ['Black', 'White', 'Red', 'Navy'],
    sizes: ['7', '8', '9', '10', '11', '12', '13'],
    gender: 'unisex',
    featured: false,
    rating: 4.4,
    numReviews: 22,
    tags: ['vans', 'oldskool', 'skate'],
  },
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
      Cart.deleteMany({}),
      Wishlist.deleteMany({}),
    ]);
    console.log('Existing data cleared...');

    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@kickshop.com',
      password: 'admin123',
      role: 'admin',
      phone: '1234567890',
      address: {
        street: '123 Admin St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'USA',
      },
    });
    console.log(`Admin user created: ${adminUser.email}`);

    const customerUser = await User.create({
      name: 'Customer',
      email: 'customer@test.com',
      password: 'customer123',
      role: 'customer',
      phone: '9876543210',
      address: {
        street: '456 Customer Ave',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90001',
        country: 'USA',
      },
    });
    console.log(`Customer user created: ${customerUser.email}`);

    const createdProducts = await Product.insertMany(products);
    console.log(`${createdProducts.length} products created`);

    const sampleReviews = [
      {
        user: customerUser._id,
        product: createdProducts[0]._id,
        name: customerUser.name,
        rating: 5,
        comment: 'Amazing shoes! Very comfortable and stylish.',
        status: 'approved',
      },
      {
        user: customerUser._id,
        product: createdProducts[1]._id,
        name: customerUser.name,
        rating: 4,
        comment: 'Great running shoes. Lightweight and responsive.',
        status: 'approved',
      },
    ];

    const createdReviews = await Review.insertMany(sampleReviews);
    console.log(`${createdReviews.length} reviews created`);

    for (const review of createdReviews) {
      const product = await Product.findById(review.product);
      const reviews = await Review.find({ product: review.product, status: 'approved' });
      if (reviews.length > 0) {
        const avgRating = reviews.reduce((acc, r) => r.rating + acc, 0) / reviews.length;
        product.rating = Number(avgRating.toFixed(1));
        product.numReviews = reviews.length;
        await product.save();
      }
    }
    console.log('Product ratings updated');

    console.log('');
    console.log('=== SEED DATA SUMMARY ===');
    console.log('Admin: admin@kickshop.com / admin123');
    console.log('Customer: customer@test.com / customer123');
    console.log(`${createdProducts.length} products seeded`);
    console.log(`${createdReviews.length} reviews seeded`);
    console.log('=========================');

    await mongoose.disconnect();
    console.log('MongoDB disconnected. Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
