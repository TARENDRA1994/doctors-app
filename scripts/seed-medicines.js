const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const csv = require('csv-parser');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting MedicineMaster seed process...');

  const csvFilePath = 'medicine_data.csv';

  if (!fs.existsSync(csvFilePath)) {
    console.log(`ERROR: Could not find ${csvFilePath} in the project root.`);
    console.log('Please download the Kaggle dataset, extract the CSV file, name it medicine_data.csv, and place it in the same folder as package.json.');
    return;
  }

  console.log(`Found ${csvFilePath}. Starting bulk insert...`);
  
  let chunk = [];
  const chunkSize = 5000;
  let totalInserted = 0;
  let rowCount = 0;

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (row) => {
        // Kaggle columns: product_name, sub_category, salt_composition, product_manufactured
        const name = row.product_name?.trim();
        if (!name) return; // Skip empty rows

        rowCount++;

        chunk.push({
          name: name,
          type: row.sub_category?.trim() || null,
          activeIngredient: row.salt_composition?.trim() || null,
          manufacturer: row.product_manufactured?.trim() || null,
        });

        if (chunk.length >= chunkSize) {
          const currentChunk = [...chunk];
          chunk = []; // Reset for the next batch
          
          try {
            await prisma.medicineMaster.createMany({
              data: currentChunk,
              skipDuplicates: true, // Requires unique constraint, but since we don't have one on just name, it relies on exact duplicate rows if using skipDuplicates on unique indexes. 
              // Wait, name has an index but NOT a @unique constraint in our schema. 
              // Let's just push them all! It's okay if there are duplicates since the Autocomplete API just does a fuzzy search anyway, but ideally we'd avoid them.
            });
            totalInserted += currentChunk.length;
            console.log(`Inserted ${totalInserted} rows so far...`);
          } catch (e) {
            console.error('Error inserting chunk:', e.message);
          }
        }
      })
      .on('end', async () => {
        // Insert any remaining rows
        if (chunk.length > 0) {
          try {
            await prisma.medicineMaster.createMany({
              data: chunk,
              skipDuplicates: true,
            });
            totalInserted += chunk.length;
          } catch (e) {
            console.error('Error inserting final chunk:', e.message);
          }
        }
        
        console.log(`\n✅ Done! Successfully processed ${rowCount} valid rows.`);
        console.log(`Inserted ${totalInserted} medicines into the live database.`);
        await prisma.$disconnect();
        resolve();
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        reject(error);
      });
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
