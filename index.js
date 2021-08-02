const express = require('express');
const port = 5000;
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const morgan = require('morgan');
const _ = require('lodash');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.send('Hello World!')
})
// mongo

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b99uy.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const appointmentsCollection = client.db("doctors_portal").collection("appointments");
    const doctorCollection = client.db("doctors_portal").collection("doctors");

    // get
    app.get('/appointments',(req, res)=>{
        appointmentsCollection.find({})
        .toArray((err, documents) =>{
            res.send(documents);
        })
    })
    // get doctorCollection
    app.get('/doctors', (req, res) => {
        doctorCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    //post 
    app.post('/addAppointment', (req, res) => {
        const appointment = req.body;
        console.log(appointment);
        appointmentsCollection.insertOne(appointment)
            .then(result => {
                res.send(result.insertedCount > 0);
            })

    })

    app.post('/appointmentsByDate', (req, res) => {
        const date = req.body;
        const email = req.body.email;
        doctorCollection.find({ email: email })
            .toArray((err, doctor) => {
                const filter = { bookDate: date.date }
                if(doctor.length === 0 ){
                    filter.email = email;
                }
                appointmentsCollection.find(filter)
                    .toArray((err, documents) => {
                        res.send(documents)
                    })
            })

    })

    app.post('/addADoctor', (req, res)=>{
        const newEvents = req.body;
        console.log("new event add", newEvents)

        doctorCollection.insertOne(newEvents)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.post('/isDoctorMatch', (req, res) => {
        const email = req.body.email;
        doctorCollection.find({ email: email })
            .toArray((err, doctors) => {
                res.send(doctors.length > 0);
            })
    })

});

app.listen(process.env.PORT || port);