/* eslint-disable prettier/prettier */
const { Pool } = require("pg");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
app.use(session({
  secret: '987f4bd6d4315c20b2ec70a46ae846d19d0ce563450c02c5b1bc71d5d580060c',
  resave: true,
  saveUninitialized: true
}));

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "portalGym",
  password: "Aytos-Temporal22AFM?",
  port: 5432,
});


app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
pool.connect((err) => {
  if (err) {
    console.error("Error al conectar con la base de datos", err);
  } else {
    // eslint-disable-next-line no-console
    console.log("Conexión exitosa a la base de datos");
  }
});

app.use(bodyParser.json());

//Insertar cliente 
app.post('/cliente', async (req, res) => {
  const {
    nombre_cliente,
    apellidos_cliente,
    email_cliente,
    fnac_cliente,
    id_ejercicio,
    contraseña_cliente,
  } = req.body;

  // Verificar si ya existe un cliente con el mismo correo electrónico
  const emailExists = await pool.query(
    'SELECT COUNT(*) FROM cliente WHERE email_cliente = $1',
    [email_cliente]
  );

  if (emailExists.rows[0].count > 0) {
    // Si el correo electrónico ya existe, mostrar un mensaje de error
    return res.status(400).send(JSON.stringify({ message: 'El correo electrónico ya está en uso' }));
  }

  // Insertar el nuevo cliente
  const hashedPassword = await bcrypt.hash(contraseña_cliente, 10);

  pool.query(
    'INSERT INTO cliente (nombre_cliente,apellidos_cliente, email_cliente,fnac_cliente,id_ejercicio,contraseña_cliente) VALUES ($1, $2, $3, $4, $5, $6)',
    [
      nombre_cliente,
      apellidos_cliente,
      email_cliente,
      fnac_cliente,
      id_ejercicio,
      hashedPassword,
    ],
    (err, result) => {
      if (err) {
        console.error('Error al crear usuario', err);
        res.status(500).send(JSON.stringify({ message: 'Error al crear usuario' }));
      } else {
        res.status(201).send(JSON.stringify({ message: 'Usuario creado exitosamente' }));
      }
    }
  );
});





//Insertar admin 
app.post('/admin', async (req, res) => {
  const {
    nombre_responsable,
    apellidos_responsable,
    email_responsable,
    telefono_responsable,
    contraseña_responsable,
  } = req.body;

  // Verificar si ya existe un cliente con el mismo correo electrónico
  const emailExists = await pool.query(
    'SELECT COUNT(*) FROM responsable WHERE email_responsable = $1',
    [email_responsable]
  );

  if (emailExists.rows[0].count > 0) {
    // Si el correo electrónico ya existe, mostrar un mensaje de error
    return res.status(400).send(JSON.stringify({ message: 'El correo electrónico ya está en uso' }));
  }

  // Insertar el nuevo cliente
  const hashedPassword = await bcrypt.hash(contraseña_responsable, 10);

  pool.query(
    'INSERT INTO responsable (nombre_responsable,apellidos_responsable, email_responsable,telefono_responsable,contraseña_responsable) VALUES ($1, $2, $3, $4, $5)',
    [
      nombre_responsable,
      apellidos_responsable,
      email_responsable,
      telefono_responsable,
      hashedPassword,
    ],
    (err, result) => {
      if (err) {
        console.error('Error al crear usuario', err);
        res.status(500).send(JSON.stringify({ message: 'Error al crear usuario' }));
      } else {
        res.status(201).send(JSON.stringify({ message: 'Usuario creado exitosamente' }));
      }
    }
  );
});





//Iniciar sesion cliente 
app.post('/iniciar-sesion',async (req, res) => {
  const {
    email_cliente,
    contraseña_cliente,
  } = req.body;

  // Verificar si ya existe un cliente con el mismo correo electrónico
  const emailExists = await pool.query(
    'SELECT * FROM cliente WHERE email_cliente = $1',
    [email_cliente]
  );

  if (emailExists.rows.length > 0) {
    // Si el correo electrónico ya existe, verificar la contraseña
    const user = emailExists.rows[0];
    const passwordMatches = await bcrypt.compare(contraseña_cliente, user.contraseña_cliente);

    if (passwordMatches) {
      // Si la contraseña coincide, iniciar sesión exitosamente
      // eslint-disable-next-line no-console
      console.log(user.nombre_cliente)
      const {id_cliente,nombre_cliente}=user;
      return res.status(200).send(JSON.stringify({ success:true, message: 'Inicio de sesión exitoso', id_cliente,nombre_cliente }));
    } else {
      // Si la contraseña no coincide, mostrar un mensaje de error
      return res.status(400).send(JSON.stringify({ success:false, message: 'Contraseña incorrecta' }));
    }
  }
});





//Iniciar sesion admin 
app.post('/iniciar-sesion-admin',async (req, res) => {
  const {
    email_responsable,
    contraseña_responsable,
  } = req.body;

  // Verificar si ya existe un cliente con el mismo correo electrónico
  const emailExists = await pool.query(
    'SELECT * FROM responsable WHERE email_responsable = $1',
    [email_responsable]
  );

  if (emailExists.rows.length > 0) {
    // Si el correo electrónico ya existe, verificar la contraseña
    const user = emailExists.rows[0];
    const passwordMatches = await bcrypt.compare(contraseña_responsable, user.contraseña_responsable);

    if (passwordMatches) {
      // Si la contraseña coincide, iniciar sesión exitosamente
      // eslint-disable-next-line no-console
      console.log(user.nombre_responsable)
      const {id_responsable,nombre_responsable,email_responsable}=user;
      return res.status(200).send(JSON.stringify({ success:true, message: 'Inicio de sesión exitoso', id_responsable,nombre_responsable,email_responsable }));
    } else {
      // Si la contraseña no coincide, mostrar un mensaje de error
      return res.status(400).send(JSON.stringify({ success:false, message: 'Contraseña incorrecta' }));
    }
  }
});


// Endpoint para obtener la lista de gimnasios
app.get('/gimnasios', async (req, res) => {
  try {
    const query = 'SELECT * FROM gimnasio'; 
    const result = await pool.query(query);
    const gimnasio = result.rows.map(row => row.nombre_gym); // Obtiene solo los nombres de los gimnasios

    res.send(gimnasio); 
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Devuelve un código de estado 500 si hay algún error
  }
});

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log("Servidor iniciado en http://localhost:3000");
});
