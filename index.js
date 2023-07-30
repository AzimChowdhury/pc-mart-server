const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express();



//middleware
app.use(cors())
app.use(express.json())

function run() {


    const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.qejbz.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });







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

        // get a single product 
        app.get('/details/:id', async (req, res) => {
            const id = req.params.id;
            try {
                const objectId = new ObjectId(id);

                // Get a list of all collection names in the database
                client.db("pc-builder").listCollections().toArray((err, collections) => {
                    if (err) {
                        console.error('Error getting collections:', err);
                        return res.status(500).send('Internal Server Error');
                    }

                    let results;

                    const searchInCollection = (collectionName) => {
                        client.db("pc-builder").collection(collectionName).findOne({ _id: objectId }, (err, result) => {
                            if (err) {
                                console.error(`Error finding document in ${collectionName}:`, err);
                                return;
                            }

                            if (result) {
                                // Found the document in this collection
                                results = result
                            }
                        });
                    };

                    // Loop through each collection and search for the _id
                    collections.forEach((collection) => {
                        searchInCollection(collection.name);
                    });

                    // Wait for all searches to complete and send the results
                    setTimeout(() => {
                        return res.status(200).json(results);
                    }, 5000); // Adjust the timeout if needed
                });
            } catch (error) {
                console.error('Invalid _id format:', error);
                return res.status(400).send('Invalid _id format');
            }

        })


        // featured products
        app.get('/random', async (req, res) => {
            const result = []
            const cpu = await processorCollection.findOne()
            const motherboard = await motherboardCollection.findOne()
            const ram = await ramCollection.findOne()
            const ssd = await ssdCollection.findOne()
            const monitor = await monitorCollection.findOne()
            const keyboard = await keyboardCollection.findOne()
            const mouse = await mouseCollection.findOne()
            const casing = await casingCollection.findOne()
            const powerSupply = await powerSupplyCollection.findOne()
            result.push(cpu, motherboard, ram, ssd, monitor, keyboard, mouse, casing, powerSupply)
            res.send(result)

        })

        // featured category 
        app.get('/randomcategories', async (req, res) => {
            const result = []
            const cpu = await processorCollection.findOne()
            cpu.redirectUrl = '/products/cpu'
            const motherboard = await motherboardCollection.findOne()
            motherboard.redirectUrl = '/products/motherboard'
            const ram = await ramCollection.findOne()
            ram.redirectUrl = '/products/ram'
            const ssd = await ssdCollection.findOne()
            ssd.redirectUrl = '/products/ssd'
            const monitor = await monitorCollection.findOne()
            monitor.redirectUrl = '/products/monitor'
            const keyboard = await keyboardCollection.findOne()
            keyboard.redirectUrl = '/products/keyboard'
            const mouse = await mouseCollection.findOne()
            mouse.redirectUrl = '/products/mouse'
            const casing = await casingCollection.findOne()
            casing.redirectUrl = '/products/casing'
            const powerSuppliers = await powerSupplyCollection.findOne()
            powerSuppliers.redirectUrl = '/products/powersupply'

            result.push(cpu, motherboard, ram, ssd, monitor, keyboard, mouse, casing, powerSuppliers)
            res.send(result)

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