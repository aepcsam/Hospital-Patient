const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 4000;



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(
    session({
        secret: '@$%Sam',
        resave: false,
        saveUninitialized: false
    })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb+srv://aepcsam:Mj3!AA@cluster0.pxcab.mongodb.net/hospital-project?retryWrites=true&w=majority');

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('users', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
const patientSchema = new mongoose.Schema({
    patient_id:Number,
    patient_name: String,
    patient_age: Number,
    patient_address:String,
    patient_mobileNo:String,
    patient_disease:String
})
const Patient = mongoose.model("patients", patientSchema);

// Routes 

app.get('/', (req, res) => {
    res.render('index');
});


app.post('/', (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, (err) => {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect('/home');

            });

        }
    });

});


// Home routes


app.get('/home', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('home');
    } else {
        res.redirect('/');
    }
});

// Create Routes

app.get('/create', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('create');
    } else {
        res.redirect('/');
    }
});

app.post('/home', (req, res) => {
    const patient = new Patient(req.body);

    patient.save().then(() => {
        res.render("home");
    });
});


// Update Routes
app.get('/search/:id',(req,res)=>{
    if(req.isAuthenticated()){
        Patient.findOne({_id:req.params.id}).then((data)=>{
            if(data){
            // console.log(data);
            res.render('search',{
                patient_name:data.patient_name,
                patient_age:data.patient_age,
                patient_address:data.patient_address,
                patient_mobileNo:data.patient_mobileNo,
                patient_disease:data.patient_disease
            });
            
            }
            else{
                console.log(err);
            }
            
        }).catch((error)=>{
            console.log(`Error`);
        });
    }
    else{
            console.log("ERROR");
        }
});

app.post('/home', (req, res) => {
    Patient.findOneAndReplace({patient_id:req.params.id},req.body,{new:true}).then(()=>{
        
        res.render("update");
    }).catch((error)=>{
        console.log({msg:error.message});
    })
    
    
});






// Search View Routes

app.get('/view', (req, res) => {
    if (req.isAuthenticated()) {
        Patient.find({}).then((result)=>{
            res.render('view',{
                patients:result
            });
        }).catch((err)=>{
            console.log(err);
        })
    
    } else {
        res.redirect('/');
    }
});



// Data Delete

app.get('/delete/:id',(req,res)=>{
    Patient.findByIdAndDelete({_id:req.params.id}).then(()=>{
        
        res.redirect('/view');
    }).catch((err)=>{console.log(err)});
})








app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// Port Listen

app.listen(process.env.PORT || 4000, () => {
    console.log('server is up and Run...')
});