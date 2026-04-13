require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// Bikin skema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  photos: [{ type: String }] 
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// FUNGSI KHUSUS UNTUK VERCEL SERVERLESS
let isConnected = false; // Variabel penanda koneksi

const connectDB = async () => {
  if (isConnected) {
    console.log('MongoDB sudah terkoneksi, pakai koneksi lama.');
    return;
  }
  
  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState;
    console.log('MongoDB Atlas Berhasil Terkoneksi!');
  } catch (error) {
    console.error('Atlas Error:', error);
  }
};

// ENDPOINT GET
app.get('/api/products', async (req, res) => {
  try {
    await connectDB(); // Wajib panggil ini sebelum query DB
    
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    // Kalau error, kita kembalikan array kosong biar frontend lu nggak blank putih!
    console.error(error);
    res.status(500).json([]); 
  }
});

// ENDPOINT POST
app.post('/api/products', async (req, res) => {
  try {
    await connectDB(); // Wajib panggil ini juga

    const { name, photos } = req.body;
    const newProduct = new Product({ name, photos });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Local server on port ${PORT}`));
}
