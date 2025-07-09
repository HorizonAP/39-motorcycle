import bcrypt from 'bcryptjs';
import connectDB from './config/database';
import { User } from './models/User';
import { Part } from './models/Part';

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    await Part.deleteMany({});
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@workshop.com',
      passwordHash: adminPassword,
      role: 'admin'
    });
    await adminUser.save();
    
    // Create sample user
    const userPassword = await bcrypt.hash('user123', 10);
    const sampleUser = new User({
      name: 'Workshop User',
      email: 'user@workshop.com',
      passwordHash: userPassword,
      role: 'user'
    });
    await sampleUser.save();
    
    // Create sample parts
    const sampleParts = [
      {
        sku: 'BRK-001',
        name: 'Brake Pad Front',
        description: 'High-quality brake pad for front wheel',
        unitPrice: 45.99,
        qtyAvailable: 25,
        minStockLevel: 10,
        category: 'Brakes',
        brand: 'Brembo'
      },
      {
        sku: 'BRK-002',
        name: 'Brake Pad Rear',
        description: 'High-quality brake pad for rear wheel',
        unitPrice: 39.99,
        qtyAvailable: 20,
        minStockLevel: 8,
        category: 'Brakes',
        brand: 'Brembo'
      },
      {
        sku: 'CHN-001',
        name: 'Drive Chain 520',
        description: 'O-ring drive chain 520 pitch',
        unitPrice: 89.99,
        qtyAvailable: 15,
        minStockLevel: 5,
        category: 'Drive Train',
        brand: 'DID'
      },
      {
        sku: 'SPR-001',
        name: 'Front Sprocket 15T',
        description: 'Front sprocket 15 teeth',
        unitPrice: 29.99,
        qtyAvailable: 12,
        minStockLevel: 6,
        category: 'Drive Train',
        brand: 'JT'
      },
      {
        sku: 'SPR-002',
        name: 'Rear Sprocket 45T',
        description: 'Rear sprocket 45 teeth',
        unitPrice: 49.99,
        qtyAvailable: 8,
        minStockLevel: 4,
        category: 'Drive Train',
        brand: 'JT'
      },
      {
        sku: 'OIL-001',
        name: 'Engine Oil 10W-40',
        description: 'Synthetic engine oil 10W-40 1L',
        unitPrice: 24.99,
        qtyAvailable: 50,
        minStockLevel: 20,
        category: 'Fluids',
        brand: 'Castrol'
      },
      {
        sku: 'FLT-001',
        name: 'Oil Filter',
        description: 'High-flow oil filter',
        unitPrice: 12.99,
        qtyAvailable: 30,
        minStockLevel: 15,
        category: 'Filters',
        brand: 'HiFlo'
      },
      {
        sku: 'FLT-002',
        name: 'Air Filter',
        description: 'High-performance air filter',
        unitPrice: 19.99,
        qtyAvailable: 18,
        minStockLevel: 8,
        category: 'Filters',
        brand: 'K&N'
      },
      {
        sku: 'SPK-001',
        name: 'Spark Plug',
        description: 'Iridium spark plug',
        unitPrice: 8.99,
        qtyAvailable: 40,
        minStockLevel: 20,
        category: 'Engine',
        brand: 'NGK'
      },
      {
        sku: 'TIR-001',
        name: 'Front Tire 120/70-17',
        description: 'Sport touring front tire',
        unitPrice: 149.99,
        qtyAvailable: 6,
        minStockLevel: 3,
        category: 'Tires',
        brand: 'Michelin'
      }
    ];
    
    for (const partData of sampleParts) {
      const part = new Part(partData);
      await part.save();
    }
    
    console.log('✅ Seed data created successfully!');
    console.log('👤 Admin user: admin@workshop.com / admin123');
    console.log('👤 Sample user: user@workshop.com / user123');
    console.log(`📦 Created ${sampleParts.length} sample parts`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
