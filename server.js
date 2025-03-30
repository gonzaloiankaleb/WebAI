const express = require('express');
const path = require('path');
const { parse } = require('node-html-parser'); // For parsing HTML title
const { saveWebsite, getAllWebsites } = require('./database'); // Import DB functions

const app = express();
const port = 3001; // Changed port from 3000 to 3001

// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to parse URL-encoded bodies (needed for form submissions if not using JS fetch)
// app.use(express.urlencoded({ extended: true }));

// Serve the index.html file at the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to save a website
app.post('/api/save-url', async (req, res) => {
  const { url, description } = req.body;

  if (!url || !description) {
    return res.status(400).json({ success: false, message: 'URL and description are required.' });
  }

  let title = 'No Title Found'; // Default title
  try {
    // Fetch the HTML content of the URL
    const response = await fetch(url);
    if (!response.ok) {
      // Handle non-successful responses (like 404 Not Found)
      console.warn(`Failed to fetch URL ${url}: Status ${response.status}`);
      // Proceed to save with default title, or return error? Let's proceed for now.
    } else {
      const html = await response.text();
      // Parse the HTML to find the title tag
      const root = parse(html);
      const titleElement = root.querySelector('title');
      if (titleElement) {
        title = titleElement.text.trim();
      }
    }

    // Save to database
    await saveWebsite(url, title, description);
    res.status(201).json({ success: true, message: 'Website saved successfully!' });

  } catch (error) {
    console.error(`Error processing URL ${url}:`, error);
    // Check if the error is due to UNIQUE constraint violation (URL already exists)
    if (error.code === 'SQLITE_CONSTRAINT') {
       return res.status(409).json({ success: false, message: 'This URL has already been saved.' });
    }
    // Handle fetch errors (e.g., invalid URL, network issues) or DB errors
    res.status(500).json({ success: false, message: 'Failed to save website. Check server logs for details.' });
  }
});

// API endpoint to get all saved websites
app.get('/api/get-urls', async (req, res) => {
    try {
        const websites = await getAllWebsites();
        res.status(200).json({ success: true, websites });
    } catch (error) {
        console.error('Error fetching websites:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve websites.' });
    }
});


// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  // Initialize DB connection (already happens when database.js is required)
});
