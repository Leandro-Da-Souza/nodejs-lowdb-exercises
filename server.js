const express = require('express');
const lowdb = require('lowdb');
const app = express();
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('names.json');
const database = lowdb(adapter);
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 8080;

const databaseInit = () => {
    const initDatabase = database.has('persons').value();
    if (!initDatabase) {
        database.defaults({ persons: [] }).write();
    }
};

// MIDDLEWARE
app.use(express.static('public'));

app.use(bodyParser.json());

app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

// FUNCTIONS
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

const getAges = async () => {
    const res = await database
        .get('persons')
        .map('age')
        .value();
    return res;
};

const convertAge = data => {
    let num = data.map(int => {
        return parseInt(int);
    });
    let sum = num.reduce((a, b) => {
        return a + b;
    });

    return sum;
};

const changeName = async (i, newName) => {
    let name = await database.get(`persons[${i}]`).value().firstName;
    console.log(name);
    let newData = await database
        .get('persons')
        .find({ firstName: name })
        .assign({ firstName: newName })
        .write();

    return newData;
};

// ROUTES
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

app.get('/api/sumAge', async (req, res) => {
    const data = await getAges();
    let sum = convertAge(data);
    res.send(sum.toString());
});

app.put('/api/changeName', async (req, res) => {
    let index = req.query.index;
    let newName = req.query.newName;

    let data = await changeName(index, newName);

    res.send(data);
});

// LISTEN TO SERVER
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
    databaseInit();
});
