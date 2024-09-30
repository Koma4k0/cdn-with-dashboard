const express = require('express');
const bcrypt = require('bcryptjs');
const yaml = require('js-yaml');
const fs = require('fs');
const router = express.Router();

const config = yaml.load(fs.readFileSync('config.yml', 'utf8'));

const users = {
    [config.username]: bcrypt.hashSync(config.password, 10)
};

router.get('/login', (req, res) => {
    res.render('login', { errorMessage: req.query.error || '' });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (users[username] && bcrypt.compareSync(password, users[username])) {
        req.session.authenticated = true;
        res.redirect('/');
    } else {
        res.redirect('/login?error=Authentication failed. Please check your username and password.');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

module.exports = router;