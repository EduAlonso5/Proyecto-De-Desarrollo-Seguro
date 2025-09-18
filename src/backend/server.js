const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = "clave-secreta-123"; // 🔑 cambia esta clave en producción

// Usuarios de prueba (en un caso real esto estaría en la BD)
const users = [
  { id: 1, email: "admin@test.com", password: bcrypt.hashSync("123456", 8), role: "admin" },
  { id: 2, email: "user@test.com", password: bcrypt.hashSync("123456", 8), role: "user" }
];

// LOGIN
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ message: "Usuario no encontrado" });

  const validPass = bcrypt.compareSync(password, user.password);
  if (!validPass) return res.status(401).json({ message: "Contraseña incorrecta" });

  const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: "1h" });

  res.json({ token });
});

// Ruta protegida
app.get('/protected', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ message: "Token requerido" });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token inválido" });

    res.json({ message: "Acceso concedido", user: decoded });
  });
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
