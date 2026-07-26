const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const prisma = new PrismaClient();

// Sample dataset in case CSV is not provided
const sampleMedicines = [
  { name: 'Paracetamol 500mg', type: 'Tablet', activeIngredient: 'Paracetamol' },
  { name: 'Amoxicillin 250mg', type: 'Capsule', activeIngredient: 'Amoxicillin' },
  { name: 'Ibuprofen 400mg', type: 'Tablet', activeIngredient: 'Ibuprofen' },
  { name: 'Cetirizine 10mg', type: 'Tablet', activeIngredient: 'Cetirizine' },
  { name: 'Azithromycin 500mg', type: 'Tablet', activeIngredient: 'Azithromycin' },
  { name: 'Pantoprazole 40mg', type: 'Tablet', activeIngredient: 'Pantoprazole' },
  { name: 'Metformin 500mg', type: 'Tablet', activeIngredient: 'Metformin' },
  { name: 'Aspirin 75mg', type: 'Tablet', activeIngredient: 'Aspirin' },
  { name: 'Vitamin C 500mg', type: 'Tablet', activeIngredient: 'Ascorbic Acid' },
  { name: 'Cough Syrup (Dextromethorphan)', type: 'Syrup', activeIngredient: 'Dextromethorphan' },
];

async function seedDatabase() {
  console.log('Starting MedicineMaster seed process...');
  
  const csvFilePath = path.join(__dirname, '..', 'medicines.csv');
  let medicinesToInsert = [];

  if (fs.existsSync(csvFilePath)) {
    console.log(`Found medicines.csv at ${csvFilePath}. Parsing...`);
    // Basic CSV parser (expects header: name,type,activeIngredient,manufacturer)
    const fileStream = fs.createReadStream(csvFilePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let isFirstLine = true;
    let headers = [];
    
    for await (const line of rl) {
      if (isFirstLine) {
        headers = line.split(',').map(h => h.trim());
        isFirstLine = false;
        continue;
      }
      
      const values = line.split(',').map(v => v.trim());
      if (values.length > 0 && values[0]) {
        medicinesToInsert.push({
          name: values[0],
          type: values[1] || null,
          activeIngredient: values[2] || null,
          manufacturer: values[3] || null
        });
      }
    }
    console.log(`Parsed ${medicinesToInsert.length} medicines from CSV.`);
  } else {
    console.log('No medicines.csv found. Using sample dataset.');
    medicinesToInsert = sampleMedicines;
  }

  console.log('Inserting into database...');
  let successCount = 0;
  let skipCount = 0;

  for (const med of medicinesToInsert) {
    try {
      await prisma.medicineMaster.upsert({
        where: { name: med.name },
        update: {},
        create: med
      });
      successCount++;
    } catch (e) {
      skipCount++;
      // Ignore errors for duplicates
    }
  }

  console.log(`Done! Successfully inserted/verified ${successCount} medicines. Skipped ${skipCount} (likely duplicates).`);
}

seedDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
