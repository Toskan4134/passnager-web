const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'main.html'));
});
app.get('/site', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'site.html'));
});
app.get('/profiles', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'profiles.html'));
});
app.get('*', (req, res) => {
    res.redirect('/');
});

app.listen(process.env.PORT || 3000, () => console.log('Server running...'));
