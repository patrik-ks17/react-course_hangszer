const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');


function sanitizeString(str){
   str = str.replace(/[^a-z0-9áéíóöőúñüű \.,_-]/gim,"");
   return str.trim();
}

function uuidv4() {
   return 'xxxxxxxxxxxxx'.replace(/[x]/g, function(c) {
     var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
     return v.toString(16);
   });
}

var corsOptions = {
    origin: "http://localhost:3000",
    credentials: false
  };
app.use(cors(corsOptions));



//app.use(express.static("public"));

app.get('/', (req, res) => {
   res.sendFile(__dirname + '/public/index.html')
})


// Read
app.get('/instruments', (req, res) => {
	fs.readFile('./data/instruments.json', (err, file) => {
		res.send(JSON.parse(file));
	});
});


// Read by id
app.get('/instruments/:egyediAzonosito', (req, res) => {
   const id = req.params.egyediAzonosito;

   fs.readFile('./data/instruments.json', (err, file) => { 
        const instruments = JSON.parse(file);
        const instrumentById = instruments.find(instrument => instrument.id == id)     
        if (!instrumentById) {
            res.send(404);
            res.send({error: `id: ${id} not found`});
            return;
        }
        res.send(instrumentById);
   })
});


// Create
app.post('/instruments', bodyParser.json(), (req, res) => {
   const newInstrument = {
       id: uuidv4(),
       name: sanitizeString(req.body.name),
       price: Number(req.body.price),
       quantity: Number(req.body.quantity),
       imageURL: req.body.imageURL,
   };
 
   fs.readFile('./data/instruments.json', (err, file) => {
       const instruments = JSON.parse(file);
       instruments.push(newInstrument);
       fs.writeFile('./data/instruments.json', JSON.stringify(instruments), (err) => {
           res.send(newInstrument);
       })
   })
});


// Update
app.put('/instruments/:egyediAzonosito',bodyParser.json(), (req, res) => {
    const id = req.params.egyediAzonosito;
    fs.readFile('./data/instruments.json', (err, file) => { 
        const instruments = JSON.parse(file);
        const instrumentIndexById = instruments.findIndex(instrument => instrument.id === id)
        if (instrumentIndexById === -1) {
            res.send(404);
            res.send({error: `id: ${id} not found`});
            return;
        }
    
        const updatedInstrument = {
            id: id,
            name: sanitizeString(req.body.name),
            price: Number(req.body.price),
            quantity: Number(req.body.quantity),
            imageURL: req.body.imageURL,
        }; 
        
        instruments[instrumentIndexById] = updatedInstrument;
        fs.writeFile('./data/instruments.json', JSON.stringify(instruments), () => {
            res.send(updatedInstrument);
        })
        
    })
});


// Delete
app.delete('/instruments/:egyediAzonosito', (req, res) => {
   const id = req.params.egyediAzonosito;
   fs.readFile('./data/instruments.json', (err, file) => { 
       const instruments = JSON.parse(file);
       const instrumentIndexById = instruments.findIndex(instrument => instrument.id === id)
       if (instrumentIndexById === -1) {
           res.send(404);
           res.send({error: `id: ${id} not found`});
           return;
       }
       
       instruments.splice(instrumentIndexById, 1);
       fs.writeFile('./data/instruments.json', JSON.stringify(instruments), () => {
           res.send({id: id});
       })
       
   })
}); 


app.listen(9000);
