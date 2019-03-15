var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Details = require('./app/models/details');
var MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const saltRounds = 10;
const someOtherPlaintextPassword = 'not_bacon';

// Configure app for bodyParser()
// lets us grab data from the body of POST
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(express.static("public"));

// Set up port for server to listen on
var port = process.env.PORT || 3001;

// Connect to DB
var url = 'mongodb://localhost:27017/';

MongoClient.connect(url, (err, db) => {
    if (err) throw err;
    const dbo = db.db("Network");

    //API Routes
    var router = express.Router();

    // Routes will all be prefixed with /API
    app.use('/api', router);

    //MIDDLE WARE-
    router.use(function (req, res, next) {
        console.log('FYI...There is some processing currently going down');
        next();
    });

    // test route
    router.get('/', function (req, res) {
        res.render("index.ejs");
    });

    router.get('/login', function (req, res) {
        res.render("login.ejs");
    });

    router.route('/details')
        .post(function (req, res) {
            let status = true;
            var person = new Details();
            person.userName = req.body.userName;
            person.userEmail = req.body.userEmail;
            person.userPassword = req.body.userPassword;
            var pass = person.userPassword;
            pass = bcrypt.hashSync(pass, saltRounds);
            person.userPassword = pass;

            dbo.collection("details").find({}).toArray(function (err, result) {
                if (err) throw err;
                for (var i = 0; i < result.length; i++) {
                    if (person.userName == result[i].userName) {
                        status = false;
                    }
                }
                if (status == true) {
                    dbo.collection("details").insertOne(person, function (err, rese) {
                        if (err) throw {
                            message: "Error comes " + err.message,
                        };
                        console.log("1 document inserted sucessfully");
                    });
                }
                res.render("login.ejs");
                return status;
            });
        })
        .get(function (req, res) {
            Details.find(function (err, details) {
                if (err) {
                    res.send(err);
                }
                res.json(details);
            });
        });

    router.route('/detailscheck')
        .post(function (req, res) {
            let status = true;
            var person = new Details();
            person.userName = req.body.userName;
            person.userPassword = req.body.userPassword;

            dbo.collection("details").find({}).toArray(function (err, result) {
                if (err) throw err;
                for (var i = 0; i < result.length; i++) {
                    var passCheck = bcrypt.compareSync(person.userPassword, result[i].userPassword);
                    if (person.userName == result[i].userName && passCheck == true) {
                        status = false;
                        console.log("User is authenticated");
                        res.redirect('http://localhost:3000');
                    }
                }
                if (status == true) {

                    console.log("User is not authenticated");
                    res.send('Wrong Password');
                }
                // res.send("Proccess successfully done...");
                return status;
            });
        });
});
// Fire up server
app.listen(port);

// print friendly message to console
console.log('Server listening on port ' + port);