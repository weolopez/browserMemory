// Import the bundled ESM version of EntityDB
import { EntityDB } from './entity-db.bundled.esm.js';

// DOM elements
const insertTextArea = document.getElementById('insertText');
const queryTextArea = document.getElementById('queryText');
const insertButton = document.getElementById('insertButton');
const insertBinaryButton = document.getElementById('insertBinaryButton');
const queryButton = document.getElementById('queryButton');
const queryBinaryButton = document.getElementById('queryBinaryButton');
const queryBinarySIMDButton = document.getElementById('queryBinarySIMDButton');
const resultsDiv = document.getElementById('results');
const insertStatus = document.getElementById('insertStatus');
const queryStatus = document.getElementById('queryStatus');

// Create an instance of EntityDB
let db;

// Initialize the database
async function initDB() {
  try {
    // Initialize EntityDB with the all-MiniLM-L6-v2 model for embeddings
    db = new EntityDB({
      vectorPath: 'entitydb_demo',
      model: 'Xenova/all-MiniLM-L6-v2', // HuggingFace embeddings model
    });
    
    console.log('EntityDB initialized successfully');
    
    // Check if we have any existing records
    const allRecords = await db.getAll();
    console.log(`Database contains ${allRecords.length} records`);
    
    if (allRecords.length === 0) {
      // Add some sample data if the database is empty
      await addSampleData();
    }
  } catch (error) {
    console.error('Error initializing EntityDB:', error);
    showStatus(insertStatus, `Error: ${error.message}`, 'error');
  }
}

// Add sample data to demonstrate the database
async function addSampleData() {
  const sampleTexts = [
    "EntityDB is a powerful in-browser vector database for AI applications.",
    "Vector embeddings allow semantic search capabilities in JavaScript applications.",
    "IndexedDB provides persistent storage for browser-based applications.",
    "Transformers.js enables running machine learning models directly in the browser.",
    "Binary vectors can significantly improve search performance in large datasets.",
    "SIMD instructions process multiple data points in parallel for faster computation.",
    "Hamming distance measures the number of positions at which binary vectors differ.",
    "Cosine similarity measures the angle between two vectors in a multi-dimensional space.",
    "WebAssembly enables near-native performance for browser applications.",
    "Entity-DB can be used to build AI memory systems for chatbots and assistants."
  ];
  
  try {
    showStatus(insertStatus, "Adding sample data...");
    
    // Insert half as standard vectors and half as binary vectors
    for (let i = 0; i < sampleTexts.length; i++) {
      if (i < sampleTexts.length / 2) {
        await db.insert({ text: sampleTexts[i] });
      } else {
        await db.insertBinary({ text: sampleTexts[i] });
      }
    }
    
    showStatus(insertStatus, "Sample data added successfully");
  } catch (error) {
    console.error('Error adding sample data:', error);
    showStatus(insertStatus, `Error adding sample data: ${error.message}`, 'error');
  }
}

// Insert text into the database
async function insertText(binary = false) {
  const text = insertTextArea.value.trim();
  
  if (!text) {
    showStatus(insertStatus, "Please enter some text to insert", 'error');
    return;
  }
  
  try {
    showStatus(insertStatus, `Inserting ${binary ? 'binary' : 'standard'} vector...`);
    
    if (binary) {
      await db.insertBinary({ text });
    } else {
      await db.insert({ text });
    }
    
    showStatus(insertStatus, "Text inserted successfully");
    insertTextArea.value = '';
  } catch (error) {
    console.error('Error inserting text:', error);
    showStatus(insertStatus, `Error: ${error.message}`, 'error');
  }
}

// Query the database
async function queryDatabase(queryType = 'standard') {
  const text = queryTextArea.value.trim();
  
  if (!text) {
    showStatus(queryStatus, "Please enter a query", 'error');
    return;
  }
  
  try {
    showStatus(queryStatus, `Searching using ${queryType} method...`);
    
    let results;
    const startTime = performance.now();
    
    switch (queryType) {
      case 'binary':
        results = await db.queryBinary(text);
        break;
      case 'binarySIMD':
        results = await db.queryBinarySIMD(text);
        break;
      default:
        results = await db.query(text);
    }
    
    const endTime = performance.now();
    const queryTime = (endTime - startTime).toFixed(2);
    
    displayResults(results, queryTime, queryType);
    showStatus(queryStatus, `Search completed in ${queryTime}ms`);
  } catch (error) {
    console.error('Error querying database:', error);
    showStatus(queryStatus, `Error: ${error.message}`, 'error');
    resultsDiv.innerHTML = '<p>An error occurred during the search.</p>';
  }
}

// Display query results
function displayResults(results, queryTime, queryType) {
  if (!results || results.length === 0) {
    resultsDiv.innerHTML = '<p>No results found.</p>';
    return;
  }
  
  let html = `
    <p><strong>${results.length} results</strong> found in ${queryTime}ms using <strong>${queryType}</strong> search:</p>
  `;
  
  results.forEach((result, index) => {
    // For binary results, the 'score' represents hamming distance (lower is better)
    // For standard results, the 'score' represents cosine similarity (higher is better)
    const score = queryType.includes('binary') 
      ? `Hamming distance: ${result.score}` 
      : `Similarity: ${(result.score * 100).toFixed(2)}%`;
    
    html += `
      <div class="result-item">
        <p>${index + 1}. <strong>${result.text.substring(0, 100)}${result.text.length > 100 ? '...' : ''}</strong></p>
        <p class="similarity">${score}</p>
      </div>
    `;
  });
  
  resultsDiv.innerHTML = html;
}

// Helper to show status messages
function showStatus(element, message, type = 'info') {
  element.textContent = message;
  element.style.color = type === 'error' ? 'red' : 'green';
  
  // Clear status after 5 seconds for success messages
  if (type !== 'error') {
    setTimeout(() => {
      element.textContent = '';
    }, 5000);
  }
}

// Event listeners
insertButton.addEventListener('click', () => insertText(false));
insertBinaryButton.addEventListener('click', () => insertText(true));
queryButton.addEventListener('click', () => queryDatabase('standard'));
queryBinaryButton.addEventListener('click', () => queryDatabase('binary'));
queryBinarySIMDButton.addEventListener('click', () => queryDatabase('binarySIMD'));

// Initialize the database when the page loads
initDB();