const pg = require('pg');
const client = new pg.Client('postgres://localhost/the_vacation_planner_db');
const express = require('express');
const app = express();
const path = require('path');

const homePage = path.join(__dirname, 'index.html');
app.get('/', (req, res)=> res.sendFile(homePage));

const reactApp = path.join(__dirname, 'dist/main.js');
app.get('/dist/main.js', (req, res)=> res.sendFile(reactApp));

const reactSourceMap = path.join(__dirname, 'dist/main.js.map');
app.get('/dist/main.js.map', (req, res)=> res.sendFile(reactSourceMap));

const styleSheet = path.join(__dirname, 'styles.css');
app.get('/styles.css', (req, res)=> res.sendFile(styleSheet));

app.get('/api/users', async(req, res, next)=> {
  try{
    const SQL = `
      SELECT *
      FROM users
    `;
    const response = await client.query(SQL);
    res.send(response.rows);
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/places', async(req, res, next)=> {
  try{
    const SQL = `
      SELECT *
      FROM places
    `;
    const response = await client.query(SQL);
    res.send(response.rows);
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/vacations', async(req, res, next)=> {
  try{
    const SQL = `
      SELECT *
      FROM vacations
    `;
    const response = await client.query(SQL);
    res.send(response.rows);
  }
  catch(ex){
    next(ex);
  }
});

const init = async()=> {
  await client.connect();
  console.log('connected to database');
  const SQL = `
    DROP TABLE IF EXISTS vacations;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS places;
    CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE
    );
    CREATE TABLE places(
      id SERIAL PRIMARY KEY,
      name VARCHAR(100)
    );
    CREATE TABLE vacations(
      id SERIAL PRIMARY KEY,
      place_id INTEGER REFERENCES places(id) NOT NULL,
      user_id INTEGER REFERENCES users(id) NOT NULL,
      created_at TIMESTAMP DEFAULT now()
    );
    INSERT INTO users(name) VALUES ('moe');
    INSERT INTO users(name) VALUES ('larry');
    INSERT INTO users(name) VALUES ('lucy');
    INSERT INTO users(name) VALUES ('ethyl');
    INSERT INTO users(name) VALUES ('curly');
    INSERT INTO users(name) VALUES ('prof');
    INSERT INTO places(name) VALUES ('ICELAND');
    INSERT INTO places(name) VALUES ('COSTA RICA');
    INSERT INTO places(name) VALUES ('DALLAS');
    INSERT INTO places(name) VALUES ('MOUNT VERNON');
    INSERT INTO vacations(user_id, place_id) VALUES (
      (SELECT id FROM users WHERE name='lucy'),
      (SELECT id FROM places WHERE name='ICELAND')
    );
  `;
  await client.query(SQL);
  console.log('create your tables and seed data');

  const port = process.env.PORT || 3000;
  app.listen(port, ()=> {
    console.log(`listening on port ${port}`);
  });
}

init();
