// Signup User

app.post('/signup', (req, res) => {
    User.register(new User({ username: req.body.username }), req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.render('/');
        }
        passport.authenticate("local")(req, res, () => {
            res.redirect('/');
        });
    });
});


// Login Form

app.get('/admin', (req, res) => {
    res.render('admin');
});

app.post('/admin', (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, (err) => {
        if (err) {
            console.log(err);
            return res.render('/admin');
        }
        passport.authenticate('admin')(req, res, () => {
            res.render('home');
        });
    });
});

// Logout
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// Check isLoggedIn

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/admin');
}