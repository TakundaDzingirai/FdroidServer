const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const PORT = 3007;

// Set up middleware
app.use(bodyParser.json());

// Set up SQLite database
const db = new sqlite3.Database('./db/ratings.db');

// Create or update the ratings table to include app_id, rating, user_id, comment, user_name, and created_at fields
db.run(`
CREATE TABLE IF NOT EXISTS ratings (
  app_id TEXT,
  rating INTEGER,
  user_id TEXT,
  comment TEXT,
  user_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`, (err) => {
  if (err) {
    console.error("Error creating ratings table:", err);
  } else {
    console.log("Ratings table created or already exists.");

    // Check and add any missing columns dynamically (for backward compatibility)
    db.all("PRAGMA table_info(ratings);", (err, columns) => {
      if (err) {
        console.error("Error fetching table info:", err);
      } else {
        // Check for comment column
        const hasCommentColumn = columns.some(column => column.name === 'comment');
        if (!hasCommentColumn) {
          db.run("ALTER TABLE ratings ADD COLUMN comment TEXT;", (err) => {
            if (err) {
              console.error("Error adding comment column:", err);
            } else {
              console.log("Comment column added successfully.");
            }
          });
        }

        // Check for user_name column
        const hasUserNameColumn = columns.some(column => column.name === 'user_name');
        if (!hasUserNameColumn) {
          db.run("ALTER TABLE ratings ADD COLUMN user_name TEXT;", (err) => {
            if (err) {
              console.error("Error adding user_name column:", err);
            } else {
              console.log("UserName column added successfully.");
            }
          });
        }
      }
    });
  }
});

// API to submit or update a rating, with optional comment and user_name
app.post('/rating/:appId', (req, res) => {
    const appId = req.params.appId;
    const { rating, userId, comment = null, userName = null } = req.body;  // Use default values for optional fields

    console.log(`Received rating submission for appId: ${appId}, rating: ${rating}, userId: ${userId}, userName: ${userName}, comment: ${comment}`);

    if (!appId || !rating || !userId) {
        console.log('App ID, rating, and user ID are required');
        return res.status(400).json({ error: 'App ID, rating, and user ID are required' });
    }

    // Check if the user has already rated this app
    db.get('SELECT * FROM ratings WHERE app_id = ? AND user_id = ?', [appId, userId], (err, row) => {
        if (err) {
            console.error('Error checking existing rating:', err);
            return res.status(500).json({ error: 'Error checking existing rating' });
        }

        if (row) {
            // User has already rated this app, so update the rating, comment, and user_name
            console.log(`Updating rating for user ${userId} on app ${appId}`);
            db.run('UPDATE ratings SET rating = ?, comment = ?, user_name = ?, created_at = CURRENT_TIMESTAMP WHERE app_id = ? AND user_id = ?', [rating, comment, userName, appId, userId], (err) => {
                if (err) {
                    console.error('Error updating rating:', err);
                    return res.status(500).json({ error: 'Error updating rating' });
                }
                res.status(200).json({ message: 'Rating updated' });
            });
        } else {
            // Insert a new rating with optional comment and user_name
            console.log(`Inserting new rating for user ${userId} on app ${appId}`);
            db.run('INSERT INTO ratings (app_id, rating, user_id, comment, user_name) VALUES (?, ?, ?, ?, ?)', [appId, rating, userId, comment, userName], (err) => {
                if (err) {
                    console.error('Error submitting rating:', err);
                    return res.status(500).json({ error: 'Error submitting rating' });
                }
                res.status(200).json({ message: 'Rating submitted' });
            });
        }
    });
});

// API to get average rating for an app
app.get('/rating/:appId', (req, res) => {
  const appId = req.params.appId;

  console.log(`Fetching average rating for appId: ${appId}`);

  db.get('SELECT AVG(rating) as avgRating FROM ratings WHERE app_id = ?', [appId], (err, row) => {
    if (err) {
      console.error('Error fetching rating:', err);
      return res.status(500).json({ error: 'Error fetching rating' });
    }

    const avgRating = row.avgRating || 0;
    console.log(`Average rating for app ${appId}: ${avgRating}`);
    res.status(200).json({ avgRating });
  });
});

// **NEW** API to get all ratings data
app.get('/ratings', (req, res) => {
  console.log('Fetching all ratings data');
  
  // Query the database to get all the ratings
  db.all('SELECT app_id, user_id, user_name, comment, rating, created_at FROM ratings', (err, rows) => {
    if (err) {
      console.error('Error fetching all ratings:', err);
      return res.status(500).json({ error: 'Error fetching all ratings' });
    }

    // Return the results as a JSON response
    res.status(200).json(rows);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

