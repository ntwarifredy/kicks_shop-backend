const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Product = require('./models/Product');

const fixImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    const products = await Product.find({});
    let fixed = 0;

    for (const product of products) {
      if (!product.images || product.images.length === 0) continue;

      const original = [...product.images];
      product.images = product.images.map((img) => {
        if (img && (img.includes(':\\') || img.startsWith('/D:') || img.startsWith('/C:'))) {
          const filename = path.basename(img);
          return `/uploads/${filename}`;
        }
        return img;
      });

      const changed = JSON.stringify(original) !== JSON.stringify(product.images);
      if (changed) {
        await product.save();
        console.log(`Fixed: ${product.name} — ${original.join(', ')} → ${product.images.join(', ')}`);
        fixed++;
      }
    }

    console.log(`\nFixed ${fixed} products`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixImages();
