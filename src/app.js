require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const {NODE_ENV} = require('./config');
const ArticleService = require('./article-service');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.get('/articles', (req, res, next) => {
    const knexInstance = req.app.get('db');
    ArticleService.getAllArticles(knexInstance)
        .then(articles => {
            console.log("list of articles", articles);
            res.json(articles.map(article => 
            //console.log(article)
            ({
                id: article.id,
                title: article.title,
                style: article.style,
                content: article.content,
                date_published: new Date(article.date_published)
            })))
        })
        .catch(next);
});

app.get('/', (req, res) => {
    res.send('Hello, world!');
});

app.use(function errorHandler(error, req, res, next) {
    let response;
    if(NODE_ENV === 'production') {
        response = {error: {message: 'server error'}};
    } else {
        console.log(error);
        response = {message: error.message, error};
    }
    res.status(500).json(response);
});

module.exports = app;