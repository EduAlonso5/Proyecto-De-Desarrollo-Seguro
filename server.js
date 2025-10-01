const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

// ✅ CARGAR VARIABLES DE ENTORNO AL INICIO
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ USAR VARIABLES DEL .env
const JWT_SECRET = process.env.JWT_SECRET;

// 1. Configuración de CORS PRIMERO
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 2. BodyParser después
app.use(bodyParser.json());

// 3. Manejar preflight requests
app.options('*', cors());

// 4. CONEXIÓN A MySQL usando variables del .env
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err.message);
    console.log('🔍 Verifica que:');
    console.log('   1. MySQL esté ejecutándose');
    console.log('   2. Las credenciales sean correctas');
    console.log('   3. La base de datos exista');
    return;
  }
  console.log('✅ Conectado a la base de datos MySQL');
});

// Crear la tabla de usuarios si no existe
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(15) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

db.query(createTableQuery, (err) => {
  if (err) {
    console.error('❌ Error creando la tabla:', err);
  } else {
    console.log('✅ Tabla de usuarios verificada/creada');
  }
});

// 5. Middleware de logging DESPUÉS de la conexión a BD
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Agrega esto antes de tus otras rutas
app.get('/', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando',
    endpoints: {
      test: 'GET /api/test',
      register: 'POST /api/register',
      login: 'POST /api/login'
    }
  });
});

// 6. RUTAS aquí
// Ruta de prueba
app.get('/api/test', (req, res) => {
  db.query('SELECT 1 + 1 AS solution', (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ message: 'Conexión exitosa', result: results[0].solution });
  });
});

// Ruta de registro - ACTUALIZAR para incluir token
app.post('/api/register', async (req, res) => {
  const { username, password, email } = req.body;
  
  // Validaciones
  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  
  try {
    // Verificar si el usuario ya existe
    const checkUserQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
    db.query(checkUserQuery, [username, email], async (err, results) => {
      if (err) {
        console.error('❌ Error en consulta:', err);
        return res.status(500).json({ error: 'Error en el servidor' });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ error: 'El usuario o email ya existe' });
      }
      
      // Hash de la contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Insertar nuevo usuario
      const insertQuery = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
      db.query(insertQuery, [username, hashedPassword, email], (err, results) => {
        if (err) {
          console.error('❌ Error insertando usuario:', err);
          return res.status(500).json({ error: 'Error al crear el usuario' });
        }
        
        // ✅ GENERAR TOKEN también en registro
        const token = jwt.sign({ userId: results.insertId }, JWT_SECRET, { expiresIn: '1h' });
        
        res.status(201).json({ 
          message: '✅ Usuario registrado exitosamente',
          token, // ✅ Agregar token aquí
          user: {
            id: results.insertId,
            username,
            email
          }
        });
      });
    });
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Ruta de login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
  }
  
  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error('❌ Error en consulta:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    
    res.json({ 
      message: '✅ Login exitoso',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});