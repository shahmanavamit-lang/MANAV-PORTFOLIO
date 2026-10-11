const express = require('express');
const app = express();
const path = require('path');

// Serve files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`System Online: http://localhost:${PORT}`);
});