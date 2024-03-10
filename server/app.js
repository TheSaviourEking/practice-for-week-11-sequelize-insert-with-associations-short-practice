// Instantiate Express and the application - DO NOT MODIFY
const express = require('express');
const app = express();

// Import environment variables in order to connect to database - DO NOT MODIFY
require('dotenv').config();
require('express-async-errors');

// Import the models used in these routes - DO NOT MODIFY
const { Band, Musician, Instrument } = require('./db/models');

// Express using json - DO NOT MODIFY
app.use(express.json());


// STEP 1: Creating from an associated model (One-to-Many)
app.post('/bands/:bandId/musicians', async (req, res, next) => {
    // Your code here
    const { firstName, lastName } = req.body;
    const band = await Band.findByPk(req.params.bandId);
    //Method 1: without associated data
    // const band = await Band.findByPk(req.params.bandId);
    // const musician = await Musician.create({
    //     firstName, lastName, bandId: band.id
    // });

    // Method 2: with associated data
    // -> create<ModelName> method
    // const musician = await band.createMusician({
    //     firstName, lastName
    // })
    // ------------------ constraint error
    // const musician = await Musician.create({
    //     firstName, lastName
    // });
    // await musician.createBand({
    //     name: 'nomaeiiantajns'
    // });

    // -> create method with nested data
    const musician = await Musician.create({
        firstName, lastName, bandId: band.id
    }, { include: [Band] })

    const payload = {
        message: `Created new musician for band ${band.name}.`,
        musician
    };
    res.json(payload);
})

// STEP 2: Connecting two existing records (Many-to-Many)
// app.post('/musicians/:musicianId/instruments', async (req, res, next) => {
//     // Your code here
//     // -> add<ModelName> method
//     const musician = await Musician.findByPk(req.params.musicianId);
//     // await musician.addInstruments(req.body.instrumentsIds);
//     musician.addInstrument
//     const payload = {
//         req: req.body.instrumentsIds,
//         message: `Associated ${musician.firstName} with instruments ${musician.toJSON()}.`
//     }
//     res.json(payload);
// });
app.post('/musicians/:musicianId/instruments', async (req, res, next) => {
    // Your code here
    // -> add<ModelName> method
    try {
        const musician = await Musician.findByPk(req.params.musicianId);
        if (!musician) {
            return res.status(404).json({ message: 'Musician not found' });
        }
        const instruments = []
        for (const id of req.body.instrumentIds) {
            let instrument = await Instrument.findByPk(id);
            instruments.push(instrument)
        }

        musician.addInstruments(instruments);

        const payload = {
            message: `Associated ${musician.firstName} with instruments ${req.body.instrumentIds}.`
        };
        res.json(payload);
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// Get the details of one band and associated musicians - DO NOT MODIFY
app.get('/bands/:bandId', async (req, res, next) => {
    const payload = await Band.findByPk(req.params.bandId, {
        include: { model: Musician },
        order: [[Musician, 'firstName']]
    });
    res.json(payload);
});

// Get the details all bands and associated musicians - DO NOT MODIFY
app.get('/bands', async (req, res, next) => {
    const payload = await Band.findAll({
        include: { model: Musician },
        order: [['name'], [Musician, 'firstName']]
    });
    res.json(payload);
});

// Get the details of one musician and associated instruments - DO NOT MODIFY
app.get('/musicians/:musicianId', async (req, res, next) => {
    const payload = await Musician.findByPk(req.params.musicianId, {
        include: { model: Instrument },
        order: [[Instrument, 'type']]
    });
    res.json(payload);
});

// Get the details all musicians and associated instruments - DO NOT MODIFY
app.get('/musicians', async (req, res, next) => {
    const payload = await Musician.findAll({
        include: { model: Instrument },
        order: [['firstName'], ['lastName'], [Instrument, 'type']]
    });
    res.json(payload);
});

// Root route - DO NOT MODIFY
app.get('/', (req, res) => {
    res.json({
        message: "API server is running"
    });
});

// Set port and listen for incoming requests - DO NOT MODIFY
if (require.main === module) {
    const port = 8000;
    app.listen(port, () => console.log('Server for Associations is listening on port', port));
} else {
    module.exports = app;
}
