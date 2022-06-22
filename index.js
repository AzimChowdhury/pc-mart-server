const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();
const stripe = require('stripe')(process.env.Secret_key);



//middleware
app.use(cors())
app.use(express.json())

function run() {


    const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.qejbz.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


    //verify jwt token
    function verifyJWT(req, res, next) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.send({ message: 'UnAuthorized Access' })
        }
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            jwt.verify(token, process.env.JWT_token, (err, decoded) => {
                if (err) {
                    return res.send({ message: 'forbidden access' })
                }
                if (decoded) {
                    req.decoded = decoded;
                    next()
                }
            })
        }

    }






    try {
        client.connect();
        const monitorCollection = client.db("pc-builder").collection("monitorCollection");
        const processorCollection = client.db("pc-builder").collection("processorCollection");
        const motherboardCollection = client.db("pc-builder").collection("motherboardCollection");
        const ramCollection = client.db("pc-builder").collection("ramCollection");
        const ssdCollection = client.db("pc-builder").collection("ssdCollection");
        const powerSupplyCollection = client.db("pc-builder").collection("powerSupplyCollection");
        const casingCollection = client.db("pc-builder").collection("casingCollection");
        const keyboardCollection = client.db("pc-builder").collection("keyboardCollection");
        const mouseCollection = client.db("pc-builder").collection("mouseCollection");
        const userCollection = client.db("pc-builder").collection("userCollection");
        const reviewCollection = client.db("pc-builder").collection("reviewCollection");
        const orderCollection = client.db("pc-builder").collection("orderCollection");



        //get all monitors
        app.get('/monitors', async (req, res) => {
            const result = await monitorCollection.find().toArray();
            res.send(result)
        });

        //get all processors 
        app.get('/processors', async (req, res) => {
            const result = await processorCollection.find().toArray();
            res.send(result);
        })

        //get all motherboards
        app.get('/motherboards', async (req, res) => {
            const result = await motherboardCollection.find().toArray();
            res.send(result)
        });

        //get all ram
        app.get('/rams', async (req, res) => {
            const result = await ramCollection.find().toArray();
            res.send(result)
        })

        //get all ssd
        app.get('/ssds', async (req, res) => {
            const result = await ssdCollection.find().toArray();
            res.send(result)
        });

        //get all powerSupply
        app.get('/powerSuppliers', async (req, res) => {
            const result = await powerSupplyCollection.find().toArray();
            res.send(result)
        });

        //get all casing
        app.get('/casings', async (req, res) => {
            const result = await casingCollection.find().toArray();
            res.send(result)
        });


        //get all keyboard
        app.get('/keyboards', async (req, res) => {
            const result = await keyboardCollection.find().toArray();
            res.send(result)
        });

        //get all keyboard
        app.get('/mouses', async (req, res) => {
            const result = await mouseCollection.find().toArray();
            res.send(result)
        });

        //get all reviews
        app.get('/reviews', async (req, res) => {
            const result = await reviewCollection.find().toArray();
            // console.log(result)
            res.send(result)
        });

        //post an user
        app.put('/user', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = {
                $set: { email: user.email }
            }
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: user.email }, process.env.JWT_token, { expiresIn: '1y' })
            res.send({ result, token })
        })

        //post an order
        app.post('/order/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const name = req.body.name;
            const configuration = req.body.configuration;
            const total = req.body.total;
            const order = { email, name, configuration, total }
            const result = await orderCollection.insertOne(order)
            res.send(result)
        });

        //get my pc
        app.get('/myPc/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const cursor = { email: email };
            const result = await orderCollection.find(cursor).toArray();
            res.send(result);
        });

        //get my pc for payment
        app.get('/payment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.findOne(query)
            res.send(result)
        });

        // store transaction id and paid order
        app.put('/paid-order/:id', async (req, res) => {
            const id = req.params.id;
            const tranxId = req.body.tranxId;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    tranxId: tranxId
                }
            };
            const result = await orderCollection.updateOne(query, updateDoc, options);
            res.send(result)
        })


        //create payment intent
        app.post('/create-payment-intent', verifyJWT, async (req, res) => {

            const { total } = req.body;
            const amount = total * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            });

            res.send({ clientSecret: paymentIntent.client_secret })
        })





    }








    finally {

        // perform actions on the collection object
        //   client.close();
    };



    app.get('/', (req, res) => {
        res.send('server running')
    })

    app.listen(port, (req, res) => {
        console.log(`server running on the port ${port}`)
    })

}

run()