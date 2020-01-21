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

const addName = async (firstName, lastName, age) => {
    const res = await database
        .get('persons')
        .push({ firstName, lastName, age })
        .write();
    return res;
};

const getNames = async () => {
    return await database
        .get('persons')
        .map('firstName')
        .value();
};

const getName = async i => {
    if (database.has('persons').value().length !== -1) {
        return await database.get(`persons[${i}]`).value();
    } else {
        return 'Not enough names in database';
    }
};

app.post('/api/addName', async (req, res) => {
    const firstName = req.query.firstName;
    const lastName = req.query.lastName;
    const age = req.query.age;

    let message = {
        success: true,
        message: 'Person added'
    };
    const result = await addName(firstName, lastName, age);
    message.data = result;
    res.send(message);
});

app.get('/api/getNames', async (req, res) => {
    const data = await getNames();
    res.send(data);
});

app.get('/api/thirdName', async (req, res) => {
    const data = await getName(2);
    res.send(data);
});
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
    databaseInit();
});
