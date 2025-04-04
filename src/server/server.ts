import express from 'express';
import path from 'path';
import { Main } from './index';
import characterApi from './api/characterApi';

const app = express();
const PORT = process.env.PORT || 3000;

const mainInstance = new Main();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../client')));

app.use('/api', characterApi);

app.get('/traders', (req, res) => {
    const availableTraders = mainInstance.getAvailableCharacters();
    res.json({ traders: availableTraders });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view the character selection UI`);
});
