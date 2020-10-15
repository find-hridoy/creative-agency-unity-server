// Require All Items
const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ObjectId } = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

// Use All Items
const app = express();
app.use(express.static("serviceIcon"));
app.use(fileUpload());
app.use(bodyParser.json());
app.use(cors());

// MongoDB Server Related Everything
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vc8eu.mongodb.net/${process.env.DB_DBN}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const servicesCollection = client.db(process.env.DB_DBN).collection("services");
    const ordersCollection = client.db(process.env.DB_DBN).collection("orders");
    const reviewsCollection = client.db(process.env.DB_DBN).collection("reviews");
    const adminsCollection = client.db(process.env.DB_DBN).collection("admins");
    // Post or Insert Service Data
    app.post('/addService', (req, res) => {
        const title = req.body.title;
        const description = req.body.description;
        const file = req.files.file;
        const newIcon = file.data;
        const encIcon = newIcon.toString("base64");
        var icons = {
            contentType: file.mimetype,
            size: file.size,
            icon: Buffer(encIcon, "base64")
        };
        servicesCollection.insertOne({ title, description, icons })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })
    // Get or Read Service Data
    app.get('/getService', (req, res) => {
        servicesCollection.find({})
            .toArray((err, document) => {
                if (err) {
                    return res.status(500).send({ message: "Internal Server Error" })
                }
                res.send(document);
            })
    })
    // Post or Insert Order Data
    app.post('/addOrder', (req, res) => {
        const newOrder = req.body;
        ordersCollection.insertOne(newOrder)
            .then(result => {
                res.send(result.insertedCount > 0)
            }).catch(er => {
                if (er) {
                    res.status(500).send({ message: "Internal Server Error" });
                }

            })
    })
    // Read or Get Order Data with Email
    app.get('/getOrder', (req, res) => {
        ordersCollection.find({ email: req.query.email })
            .toArray((err, document) => {
                res.send(document);
            })
    })
    // Get or Read Total Order Data by Admin
    app.post('/getTotalOrder', (req, res) => {
        const date = req.body;
        const email = req.body.email;
        adminsCollection.find({ email: email })
            .toArray((err, admins) => {
                const filter = { date: date.date }
                if (admins.length === 0) {
                    filter.email = email;
                }
                ordersCollection.find(filter)
                    .toArray((err, documents) => {
                        res.send(documents);
                    })
            })
    })
    // Post or Insert Review Data
    app.post('/addReview', (req, res) => {
        const newReview = req.body;
        reviewsCollection.insertOne(newReview)
            .then(result => {
                res.send(result.insertedCount > 0)
            }).catch(er => {
                if (er) {
                    res.status(500).send({ message: "Internal Server Error" });
                }
            })
    })
    // // Get or Read Review Data
    app.get('/getReview', (req, res) => {
        reviewsCollection.find({})
            .toArray((err, document) => {
                if (err) {
                    return res.status(500).send({ message: "Internal Server Error" })
                }
                res.send(document);
            })
    })
    // Post or Insert New Admin Email
    app.post('/makeAdmin', (req, res) => {
        const newAdmin = req.body;
        adminsCollection.insertOne(newAdmin)
            .then(result => {
                res.send(result.insertedCount > 0)
            }).catch(er => {
                if (er) {
                    res.status(500).send({ message: "Internal Server Error" });
                }

            })
    })
    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminsCollection.find({ email: email })
            .toArray((err, admins) => {
                res.send(admins.length > 0);
            })
    })
});

// Testing Server Side
app.get('/', (req, res) => {
    res.send('Server Site Working Properly');
})
app.listen(process.env.PORT || 5000);