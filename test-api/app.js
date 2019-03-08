const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const axios = require('axios');
const qs = require('qs');
const app = express();

const PORT = 3000;

const redirect_uri = 'http://localhost:3000/top-100';
const my_client_id = 'da24f3a0f42d46f38b5224c752e638bc';
const my_client_secret = '169fc2052c2b45f589a7f4597ae94290';

app.get('/login', (req, res) => {
    const scopes = 'user-read-private user-read-email';
    res.redirect('https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + my_client_id +
        (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
        '&redirect_uri=' + encodeURIComponent(redirect_uri));
})

app.get('/top-100', (req, res) => {
    const code = req.query.code
    const url = 'https://accounts.spotify.com/api/token';
    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${my_client_id}:${my_client_secret}`).toString('base64')}`
        },
    };
    const requestBody = {
        grant_type: "authorization_code",
        code: code,
        redirect_uri,
    };
    
    axios.post(url, qs.stringify(requestBody), config)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
});

app.get('/songs', (req, res) => {
    res.json({query: req.query, body: req.body})
})

app.listen(PORT, () => {
    console.log(PORT, ': listening');
})
