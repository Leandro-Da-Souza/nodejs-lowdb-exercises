const express = require('express');
const lowdb = require('lowdb');
const app = express();
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('names.json');
const database = lowdb(adapter);
const PORT = process.env.PORT || 8080;

const databaseInit = () => {
    const initDatabase = database.has('persons').value();
    if (!initDatabase) {
        database.defaults({ persons: [] }).write();
    }
};
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
    databaseInit();
});
