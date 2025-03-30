const sqlite3 = require('sqlite3').verbose();
const dbPath = './database.sqlite'; // Path to the database file

// Connect to or create the database file
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // Create the websites table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS websites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL UNIQUE,
      title TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Table "websites" is ready.');
      }
    });
  }
});

/**
 * Saves a website's URL, title, and description to the database.
 * @param {string} url - The URL of the website.
 * @param {string} title - The title of the website.
 * @param {string} description - The user-provided description.
 * @returns {Promise<number>} A promise that resolves with the ID of the inserted row or rejects with an error.
 */
function saveWebsite(url, title, description) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO websites (url, title, description) VALUES (?, ?, ?)`;
    db.run(sql, [url, title, description], function(err) { // Use function() to access this.lastID
      if (err) {
        console.error('Error saving website:', err.message);
        reject(err);
      } else {
        console.log(`Website saved with ID: ${this.lastID}`);
        resolve(this.lastID);
      }
    });
  });
}

/**
 * Retrieves all saved websites from the database.
 * @returns {Promise<Array<object>>} A promise that resolves with an array of website objects or rejects with an error.
 */
function getAllWebsites() {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id, url, title, description, created_at FROM websites ORDER BY created_at DESC`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error('Error fetching websites:', err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}


// Close the database connection when the Node process exits
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Closed the database connection.');
    process.exit(0);
  });
});

module.exports = {
  saveWebsite,
  getAllWebsites,
  // Export db instance if needed elsewhere, though it's generally better to encapsulate
};
