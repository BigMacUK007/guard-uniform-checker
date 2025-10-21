import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Test the storage upload endpoint
async function testUpload() {
  try {
    console.log('Testing storage upload endpoint...');
    
    // Read the test image
    const imagePath = '/home/ubuntu/upload/Mj0UQtHWRYnQzlQLcoooGwmQUndAp3bazB2hK8vTs_w.jpeg';
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Data = imageBuffer.toString('base64');
    
    console.log(`Image size: ${imageBuffer.length} bytes`);
    console.log(`Base64 size: ${base64Data.length} characters`);
    
    // Test the upload endpoint
    const response = await fetch('http://localhost:3000/api/storage/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: `test-uploads/${Date.now()}-test.jpeg`,
        data: base64Data,
        contentType: 'image/jpeg',
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Upload successful!');
    console.log('Result:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Upload test failed:', error.message);
    throw error;
  }
}

// Run the test
testUpload()
  .then(() => {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Tests failed:', error);
    process.exit(1);
  });

