const { Pool } = require('pg');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Para encriptar contraseñas
const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 1. INICIALIZACIÓN DE TABLAS (Actualizada con tus requerimientos)
const inicializarDB = async () => {
    const querySQL = `
    CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100),
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        telefono VARCHAR(20),
        rol VARCHAR(20) CHECK (rol IN ('cliente', 'negocio'))
    );

    CREATE TABLE IF NOT EXISTS negocios (
        id SERIAL PRIMARY KEY,
        dueno_id INTEGER REFERENCES usuarios(id),
        nombre_negocio VARCHAR(100),
        categoria VARCHAR(50),
        telefono_negocio VARCHAR(20),
        logo_url TEXT,
        facebook VARCHAR(255),
        instagram VARCHAR(255),
        dias_habiles VARCHAR(50),
        hora_apertura TIME DEFAULT '09:00',
        hora_cierre TIME DEFAULT '18:00',
        intervalo_citas INTEGER DEFAULT 30
    );

    CREATE TABLE IF NOT EXISTS citas (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER REFERENCES usuarios(id),
        negocio_id INTEGER REFERENCES negocios(id),
        fecha DATE NOT NULL,
        hora TIME NOT NULL,
        estado VARCHAR(20) DEFAULT 'confirmada'
    );`;

    try {
        await pool.query(querySQL);
        console.log("✅ Tablas sincronizadas con Zenda");
    } catch (err) {
        console.error("❌ Error en DB:", err);
    }
};
inicializarDB();

// 2. RUTA DE REGISTRO (Soluciona el 404 de Netlify)
app.post('/register', async (req, res) => {
    const { nombre, email, password, rol, telefono } = req.body;
    try {
        const hashedPass = await bcrypt.hash(password, 10);
        const nuevoUsuario = await pool.query(
            'INSERT INTO usuarios (nombre, email, password, rol, telefono) VALUES ($1, $2, $3, $4, $5) RETURNING id, rol',
            [nombre, email, hashedPass, rol, telefono]
        );
        
        // Si es negocio, crear entrada automática en la tabla negocios
        if (rol === 'negocio') {
            await pool.query('INSERT INTO negocios (dueno_id, nombre_negocio) VALUES ($1, $2)', 
            [nuevoUsuario.rows[0].id, nombre]);
        }

        res.status(201).json(nuevoUsuario.rows[0]);
    } catch (err) {
        res.status(400).json({ error: "El correo ya existe o faltan datos" });
    }
});

// 3. RUTA DE LOGIN
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(404).json({ error: "No existe el usuario" });

        const match = await bcrypt.compare(password, result.rows[0].password);
        if (!match) return res.status(401).json({ error: "Contraseña incorrecta" });

        res.json({ userId: result.rows[0].id, rol: result.rows[0].rol });
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// 4. RUTAS DE GESTIÓN (Citas y Configuración)
app.get('/negocios', async (req, res) => {
    const result = await pool.query('SELECT * FROM negocios');
    res.json(result.rows);
});

app.get('/', (req, res) => res.send("Zenda API Live"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));