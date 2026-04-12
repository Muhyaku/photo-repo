require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json({ limit: '50mb' }));

// Set CORS agar frontend lu nanti diizinkan mengambil data dari backend ini
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Atlas Connected'))
  .catch(err => console.error('Atlas Error:', err));

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  photos: [{ type: String }] 
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, photos } = req.body;
    const newProduct = new Product({ name, photos });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Wajib untuk Vercel Serverless Function
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Local server on port ${PORT}`));
}