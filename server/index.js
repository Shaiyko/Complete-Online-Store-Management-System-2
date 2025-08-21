const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const winston = require('winston');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'eb4eb9ef7c20070a7f3a3ba6126999f596892c48ef1303a66995c10d48b52940';

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use('/api/', limiter);

// Trust proxy for WebContainer environment
app.set('trust proxy', true);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: PORT
  });
});

// Mock Data with enhanced search capabilities
let users = [
  {
    id: '1',
    username: 'owner',
    email: 'owner@store.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'owner',
    name: 'John Owner',
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    username: 'admin',
    email: 'admin@store.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'admin',
    name: 'Jane Admin',
    createdAt: new Date('2024-01-01')
  },
  {
    id: '3',
    username: 'cashier',
    email: 'cashier@store.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'cashier',
    name: 'Mike Cashier',
    createdAt: new Date('2024-01-01')
  }
];

let products = [
  {
    id: '1',
    name: 'MacBook Pro 16"',
    barcode: '1234567890123',
    qrCode: 'PROD-001',
    price: 89900,
    stock: 5,
    category: 'electronics',
    supplier: 'Apple Store',
    description: 'Latest MacBook Pro with M3 chip',
    imageUrl: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['laptop', 'apple', 'computer', 'professional'],
    rating: 4.8,
    reviews: 156,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'iPhone 15 Pro',
    barcode: '2345678901234',
    qrCode: 'PROD-002',
    price: 39900,
    stock: 12,
    category: 'electronics',
    supplier: 'Apple Store',
    description: 'Latest iPhone with titanium design',
    imageUrl: 'https://images.pexels.com/photos/1275229/pexels-photo-1275229.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['phone', 'apple', 'smartphone', 'mobile'],
    rating: 4.9,
    reviews: 324,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '3',
    name: 'Wireless Headphones',
    barcode: '3456789012345',
    qrCode: 'PROD-003',
    price: 2990,
    stock: 0,
    category: 'electronics',
    supplier: 'Sony Electronics',
    description: 'Noise-cancelling wireless headphones',
    imageUrl: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['headphones', 'audio', 'wireless', 'noise-cancelling'],
    rating: 4.6,
    reviews: 89,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '4',
    name: 'Gaming Mouse',
    barcode: '4567890123456',
    qrCode: 'PROD-004',
    price: 1590,
    stock: 8,
    category: 'electronics',
    supplier: 'Logitech',
    description: 'High-precision gaming mouse',
    imageUrl: 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['mouse', 'gaming', 'computer', 'accessories'],
    rating: 4.4,
    reviews: 67,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '5',
    name: 'Coffee Beans',
    barcode: '5678901234567',
    qrCode: 'PROD-005',
    price: 450,
    stock: 25,
    category: 'food',
    supplier: 'Local Coffee Roaster',
    description: 'Premium arabica coffee beans',
    imageUrl: 'https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['coffee', 'beans', 'arabica', 'premium'],
    rating: 4.7,
    reviews: 234,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

let categories = [
  { id: '1', name: 'Electronics', description: 'Electronic devices and accessories' },
  { id: '2', name: 'Food', description: 'Food and beverages' },
  { id: '3', name: 'Clothing', description: 'Apparel and accessories' },
  { id: '4', name: 'Books', description: 'Books and educational materials' }
];

let suppliers = [
  { id: '1', name: 'Apple Store', contact: 'contact@apple.com', phone: '02-123-4567' },
  { id: '2', name: 'Sony Electronics', contact: 'info@sony.com', phone: '02-234-5678' },
  { id: '3', name: 'Logitech', contact: 'support@logitech.com', phone: '02-345-6789' },
  { id: '4', name: 'Local Coffee Roaster', contact: 'info@coffee.com', phone: '02-456-7890' }
];

let members = [
  {
    id: '1',
    phone: '0812345678',
    name: 'Alice Johnson',
    points: 150,
    totalSpent: 45000,
    createdAt: new Date('2024-01-15'),
    lastVisit: new Date('2024-01-20')
  },
  {
    id: '2',
    phone: '0823456789',
    name: 'Bob Smith',
    points: 89,
    totalSpent: 25600,
    createdAt: new Date('2024-01-10'),
    lastVisit: new Date('2024-01-18')
  }
];

let sales = [
  {
    id: '1',
    items: [
      { productId: '1', name: 'MacBook Pro 16"', quantity: 1, price: 89900 },
      { productId: '2', name: 'iPhone 15 Pro', quantity: 1, price: 39900 }
    ],
    subtotal: 129800,
    discount: 0,
    total: 129800,
    paymentMethod: 'cash',
    paymentStatus: 'completed',
    cashierId: '3',
    cashierName: 'Mike Cashier',
    memberId: '1',
    memberPhone: '0812345678',
    pointsUsed: 0,
    pointsEarned: 6490,
    cashReceived: 130000,
    change: 200,
    createdAt: new Date('2024-01-20')
  },
  {
    id: '2',
    items: [
      { productId: '4', name: 'Gaming Mouse', quantity: 2, price: 1590 },
      { productId: '5', name: 'Coffee Beans', quantity: 3, price: 450 }
    ],
    subtotal: 4530,
    discount: 200,
    total: 4330,
    paymentMethod: 'bank_transfer',
    cashierId: '3',
    cashierName: 'Mike Cashier',
    memberId: '2',
    memberPhone: '0823456789',
    pointsUsed: 10,
    pointsEarned: 216,
    createdAt: new Date('2024-01-19')
  }
];

let stockInDocuments = [];

let dailySalesLog = [];

let stockLedger = [
  {
    id: '1',
    productId: '1',
    type: 'sale',
    quantity: -1,
    balance: 5,
    reference: 'SALE-001',
    createdAt: new Date('2024-01-20')
  },
  {
    id: '2',
    productId: '2',
    type: 'sale',
    quantity: -1,
    balance: 12,
    reference: 'SALE-001',
    createdAt: new Date('2024-01-20')
  }
];

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based access control
const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info(`User ${username} logged in successfully`);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Dashboard Routes
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const todaySales = sales.filter(sale => 
    new Date(sale.createdAt) >= todayStart
  );
  
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  
  const bestSelling = products
    .map(product => ({
      ...product,
      totalSold: Math.floor(Math.random() * 50) + 1
    }))
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5);

  res.json({
    todayRevenue,
    todaySalesCount: todaySales.length,
    outOfStockCount: outOfStockProducts.length,
    totalProducts: products.length,
    bestSelling,
    outOfStockProducts
  });
});

// Enhanced Product Routes with Advanced Search
app.get('/api/products', authenticateToken, (req, res) => {
  const { 
    search, 
    category, 
    barcode, 
    minPrice, 
    maxPrice, 
    minRating, 
    inStock,
    sortBy = 'name',
    sortOrder = 'asc',
    page = 1,
    limit = 20
  } = req.query;
  
  let filteredProducts = [...products];

  // Text search
  if (search) {
    const searchTerm = search.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm) ||
      p.barcode.includes(searchTerm) ||
      p.qrCode.includes(searchTerm) ||
      p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Category filter
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }

  // Barcode filter
  if (barcode) {
    filteredProducts = filteredProducts.filter(p => p.barcode === barcode);
  }

  // Price range filter
  if (minPrice) {
    filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
  }

  // Rating filter
  if (minRating) {
    filteredProducts = filteredProducts.filter(p => p.rating >= parseFloat(minRating));
  }

  // Stock filter
  if (inStock === 'true') {
    filteredProducts = filteredProducts.filter(p => p.stock > 0);
  }

  // Sorting
  filteredProducts.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (sortOrder === 'desc') {
      return bVal > aVal ? 1 : -1;
    }
    return aVal > bVal ? 1 : -1;
  });

  // Pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  res.json({
    products: paginatedProducts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredProducts.length,
      pages: Math.ceil(filteredProducts.length / parseInt(limit))
    }
  });
});

// Enhanced Sales Route with Real-time Updates
app.post('/api/sales', authenticateToken, (req, res) => {
  const { items, subtotal, discount, total, paymentMethod, memberId, memberPhone, pointsUsed, cashReceived, change } = req.body;
  
  const newSale = {
    id: uuidv4(),
    items,
    subtotal,
    discount,
    total,
    paymentMethod,
    paymentStatus: 'completed',
    cashierId: req.user.id,
    cashierName: req.user.username,
    memberId,
    memberPhone,
    pointsUsed,
    pointsEarned: Math.floor(total / 20),
    cashReceived,
    change,
    createdAt: new Date()
  };

  // Update product stock and broadcast changes
  items.forEach(item => {
    const productIndex = products.findIndex(p => p.id === item.productId);
    if (productIndex !== -1) {
      const oldStock = products[productIndex].stock;
      products[productIndex].stock -= item.quantity;
      
      // Add to stock ledger
      stockLedger.push({
        id: uuidv4(),
        productId: item.productId,
        type: 'sale',
        quantity: -item.quantity,
        balance: products[productIndex].stock,
        reference: newSale.id,
        createdAt: new Date()
      });

      logger.info(`Stock updated for product ${item.productId}: ${products[productIndex].stock}`);
      
      // Check for low stock alert
      if (products[productIndex].stock <= 5 && oldStock > 5) {
        logger.warn(`Low stock alert for ${products[productIndex].name}: ${products[productIndex].stock} remaining`);
      }
    }
  });

  // Update member points
  if (memberId) {
    const memberIndex = members.findIndex(m => m.id === memberId);
    if (memberIndex !== -1) {
      members[memberIndex].points = members[memberIndex].points - pointsUsed + newSale.pointsEarned;
      members[memberIndex].totalSpent += total;
      members[memberIndex].lastVisit = new Date();
    }
  }

  sales.push(newSale);
  
  logger.info(`New sale created: ${newSale.id} by ${req.user.username}`);
  
  res.status(201).json(newSale);
});

app.get('/api/products/:id', authenticateToken, (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

app.post('/api/products', authenticateToken, authorize(['owner', 'admin']), (req, res) => {
  const { name, barcode, qrCode, price, stock, category, supplier, description, tags = [] } = req.body;
  
  const newProduct = {
    id: uuidv4(),
    name,
    barcode,
    qrCode,
    price: parseFloat(price),
    stock: parseInt(stock),
    category,
    supplier,
    description,
    tags,
    rating: 0,
    reviews: 0,
    imageUrl: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=400',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  products.push(newProduct);
  
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', authenticateToken, authorize(['owner', 'admin']), (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const updatedProduct = {
    ...products[productIndex],
    ...req.body,
    updatedAt: new Date()
  };

  products[productIndex] = updatedProduct;
  
  res.json(updatedProduct);
});

app.delete('/api/products/:id', authenticateToken, authorize(['owner', 'admin']), (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const deletedProduct = products[productIndex];
  products.splice(productIndex, 1);
  
  logger.info(`Product deleted: ${deletedProduct.name} by ${req.user.username}`);
  res.json({ message: 'Product deleted successfully' });
});

// Category Routes
app.get('/api/categories', authenticateToken, (req, res) => {
  res.json(categories);
});

app.post('/api/categories', authenticateToken, authorize(['owner', 'admin']), (req, res) => {
  const { name, description } = req.body;
  const newCategory = {
    id: uuidv4(),
    name,
    description
  };
  categories.push(newCategory);
  res.status(201).json(newCategory);
});

// Supplier Routes
app.get('/api/suppliers', authenticateToken, (req, res) => {
  res.json(suppliers);
});

app.post('/api/suppliers', authenticateToken, authorize(['owner', 'admin']), (req, res) => {
  const { name, contact, phone } = req.body;
  const newSupplier = {
    id: uuidv4(),
    name,
    contact,
    phone
  };
  suppliers.push(newSupplier);
  res.status(201).json(newSupplier);
});

// Member Routes
app.get('/api/members', authenticateToken, (req, res) => {
  res.json(members);
});

app.get('/api/members/:phone', authenticateToken, (req, res) => {
  const member = members.find(m => m.phone === req.params.phone);
  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }
  res.json(member);
});

app.post('/api/members', authenticateToken, (req, res) => {
  const { phone, name } = req.body;
  
  const existingMember = members.find(m => m.phone === phone);
  if (existingMember) {
    return res.status(400).json({ error: 'Member already exists' });
  }

  const newMember = {
    id: uuidv4(),
    phone,
    name,
    points: 0,
    totalSpent: 0,
    createdAt: new Date(),
    lastVisit: new Date()
  };

  members.push(newMember);
  res.status(201).json(newMember);
});

// Sales Routes
app.get('/api/sales', authenticateToken, (req, res) => {
  console.log('GET /api/sales - Request received');
  console.log('Current sales data:', sales.length, 'items');
  
  const { startDate, endDate } = req.query;
  
  let filteredSales = sales;
  
  if (startDate && endDate) {
    console.log('Filtering by date range:', startDate, 'to', endDate);
    const start = new Date(startDate);
    const end = new Date(endDate);
    filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= start && saleDate <= end;
    });
    console.log('Filtered sales:', filteredSales.length, 'items');
  }
  
  console.log('Returning sales data:', filteredSales);
  res.json(filteredSales);
});

// Stock In Documents Routes
app.get('/api/stock-in', authenticateToken, authorize(['owner', 'admin']), (req, res) => {
  res.json(stockInDocuments);
});

app.post('/api/stock-in', authenticateToken, authorize(['owner', 'admin']), (req, res) => {
  const stockInDoc = {
    id: uuidv4(),
    ...req.body,
    createdBy: req.user.id,
    createdAt: new Date()
  };
  
  stockInDocuments.push(stockInDoc);
  
  // If completed, update product stock
  if (stockInDoc.status === 'completed') {
    stockInDoc.items.forEach(item => {
      const productIndex = products.findIndex(p => p.id === item.productId);
      if (productIndex !== -1) {
        products[productIndex].stock += item.quantity;
        
        // Add to stock ledger
        stockLedger.push({
          id: uuidv4(),
          productId: item.productId,
          type: 'purchase',
          quantity: item.quantity,
          balance: products[productIndex].stock,
          reference: stockInDoc.documentNumber,
          createdAt: new Date()
        });
        
        // Broadcast inventory update
        logger.info(`Stock updated via stock-in for product ${item.productId}: ${products[productIndex].stock}`);
      }
    });
  }
  
  res.status(201).json(stockInDoc);
});

// Daily Sales Log Routes
app.get('/api/daily-sales-log', authenticateToken, authorize(['owner', 'admin']), (req, res) => {
  const { startDate, endDate } = req.query;
  
  let filteredLogs = dailySalesLog;
  
  if (startDate && endDate) {
    filteredLogs = dailySalesLog.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= new Date(startDate) && logDate <= new Date(endDate);
    });
  }
  
  res.json(filteredLogs);
});

// Reports Routes
app.get('/api/reports/sales', authenticateToken, authorize(['owner', 'admin']), (req, res) => {
  const { startDate, endDate } = req.query;
  
  let filteredSales = sales;
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= start && saleDate <= end;
    });
  }

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalSales = filteredSales.length;
  const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

  res.json({
    sales: filteredSales,
    summary: {
      totalRevenue,
      totalSales,
      averageOrderValue
    }
  });
});

app.get('/api/reports/advanced', authenticateToken, authorize(['owner', 'admin']), (req, res) => {
  const { startDate, endDate } = req.query;
  
  let filteredSales = sales;
  let filteredLogs = dailySalesLog;
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= start && saleDate <= end;
    });
    
    filteredLogs = dailySalesLog.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= start && logDate <= end;
    });
  }
  
  // Calculate employee stats
  const employeeStats = filteredLogs.map(log => ({
    id: log.employeeId,
    name: log.employeeName,
    role: users.find(u => u.id === log.employeeId)?.role || 'unknown',
    workingHours: log.workingHours,
    totalSales: log.totalSales,
    transactionCount: log.transactionCount,
    averageTransaction: log.totalSales / log.transactionCount
  }));
  
  // Calculate best selling items
  const itemSales = {};
  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      if (!itemSales[item.productId]) {
        itemSales[item.productId] = {
          productId: item.productId,
          productName: item.name,
          quantitySold: 0,
          revenue: 0,
          category: products.find(p => p.id === item.productId)?.category || 'unknown'
        };
      }
      itemSales[item.productId].quantitySold += item.quantity;
      itemSales[item.productId].revenue += item.price * item.quantity;
    });
  });
  
  const bestSellingItems = Object.values(itemSales)
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 10);
  
  // Calculate peak hours (mock data for now)
  const peakHours = Array.from({ length: 12 }, (_, i) => ({
    hour: `${9 + i}:00`,
    sales: Math.floor(Math.random() * 50000) + 20000,
    transactions: Math.floor(Math.random() * 15) + 5
  }));
  
  res.json({
    employeeStats,
    bestSellingItems,
    peakHours,
    salesData: filteredLogs.map(log => ({
      date: log.date,
      sales: log.totalSales,
      transactions: log.transactionCount,
      employee: log.employeeName
    }))
  });
});

app.get('/api/reports/inventory', authenticateToken, authorize(['owner', 'admin']), (req, res) => {
  const lowStockProducts = products.filter(p => p.stock < 10);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  
  res.json({
    totalProducts: products.length,
    lowStockProducts,
    outOfStockProducts,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Backend Server running on port ${PORT}`);
  console.log(`🚀 Backend Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use`);
    console.error(`❌ Port ${PORT} is already in use`);
  } else {
    logger.error('Server error:', error);
    console.error('❌ Server error:', error);
  }
});

server.on('close', () => {
  logger.info('Server closed');
  console.log('🔴 Server closed');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('❌ Unhandled Rejection:', reason);
});

// Export for testing
module.exports = { app, server };

process.on('exit', () => {
    logger.info('Process terminated');
});
