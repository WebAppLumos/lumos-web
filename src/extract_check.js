import XLSX from 'xlsx';

try {
  const workbook = XLSX.readFile('src/certifications_score.xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  // Skip the first title row
  const data = XLSX.utils.sheet_to_json(worksheet, { range: 1 });
  
  if (data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
    console.log('Sample Row 1:', data[0]);
    console.log('Sample Row 2:', data[1]);
  } else {
    console.log('No data found after skipping 1 row.');
  }
} catch (error) {
  console.error('Error reading file:', error);
}
