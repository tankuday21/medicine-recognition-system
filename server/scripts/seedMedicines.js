const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
require('dotenv').config();

const sampleMedicines = [
  {
    name: 'Paracetamol',
    genericName: 'Acetaminophen',
    dosage: '500mg',
    manufacturer: 'Cipla Ltd',
    uses: ['Pain relief', 'Fever reduction', 'Headache'],
    sideEffects: ['Nausea', 'Stomach upset', 'Allergic reactions'],
    interactions: ['Warfarin', 'Alcohol'],
    barcode: '8901030895012',
    category: 'over-the-counter',
    price: {
      amount: 25,
      currency: 'INR',
      source: 'Sample Data'
    }
  },
  {
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    dosage: '400mg',
    manufacturer: 'Abbott Healthcare',
    uses: ['Pain relief', 'Anti-inflammatory', 'Fever reduction'],
    sideEffects: ['Stomach irritation', 'Dizziness', 'Headache'],
    interactions: ['Aspirin', 'Blood thinners', 'ACE inhibitors'],
    barcode: '8901030895029',
    category: 'over-the-counter',
    price: {
      amount: 35,
      currency: 'INR',
      source: 'Sample Data'
    }
  },
  {
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    dosage: '250mg',
    manufacturer: 'Ranbaxy Laboratories',
    uses: ['Bacterial infections', 'Respiratory infections', 'Urinary tract infections'],
    sideEffects: ['Diarrhea', 'Nausea', 'Skin rash'],
    interactions: ['Methotrexate', 'Oral contraceptives'],
    barcode: '8901030895036',
    category: 'prescription',
    price: {
      amount: 120,
      currency: 'INR',
      source: 'Sample Data'
    }
  },
  {
    name: 'Aspirin',
    genericName: 'Acetylsalicylic Acid',
    dosage: '75mg',
    manufacturer: 'Various',
    uses: ['Pain relief', 'Blood thinner', 'Heart attack prevention'],
    sideEffects: ['Stomach bleeding', 'Nausea', 'Heartburn'],
    interactions: ['Warfarin', 'Ibuprofen', 'Alcohol'],
    barcode: '4567890123456',
    category: 'over-the-counter',
    price: {
      amount: 15,
      currency: 'INR',
      source: 'Sample Data'
    }
  },
  {
    name: 'Metformin',
    genericName: 'Metformin Hydrochloride',
    dosage: '500mg',
    manufacturer: 'Various',
    uses: ['Type 2 diabetes', 'Blood sugar control', 'PCOS'],
    sideEffects: ['Nausea', 'Diarrhea', 'Metallic taste'],
    interactions: ['Alcohol', 'Contrast dyes', 'Diuretics'],
    barcode: '5678901234567',
    category: 'prescription',
    price: {
      amount: 45,
      currency: 'INR',
      source: 'Sample Data'
    }
  }
];

const seedMedicines = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mediot');
    console.log('✅ Connected to MongoDB');

    // Clear existing medicines
    await Medicine.deleteMany({});
    console.log('🗑️ Cleared existing medicines');

    // Insert sample medicines
    const insertedMedicines = await Medicine.insertMany(sampleMedicines);
    console.log(`✅ Inserted ${insertedMedicines.length} sample medicines`);

    // Display inserted medicines
    insertedMedicines.forEach(medicine => {
      console.log(`- ${medicine.name} (${medicine.genericName}) - ${medicine.dosage}`);
    });

    console.log('🎉 Medicine database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding medicines:', error);
    process.exit(1);
  }
};

// Run the seed function
seedMedicines();