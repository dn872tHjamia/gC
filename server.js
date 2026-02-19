const { Pool } = require('pg');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());


// CONEXIÓN USANDO TU URL INTERNA
const pool = new Pool({
    // Esto lee automáticamente la DATABASE_URL que pusiste en Render
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// ESTO CREARÁ LAS TABLAS AUTOMÁTICAMENTE EN RENDER
const inicializarDB = async () => {
    const querySQL = `
    CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100),
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(20) CHECK (rol IN ('cliente', 'negocio'))
    );

    CREATE TABLE IF NOT EXISTS negocios (
        id SERIAL PRIMARY KEY,
        dueno_id INTEGER REFERENCES usuarios(id),
        nombre_negocio VARCHAR(100),
        categoria VARCHAR(50),
        intervalo_citas INTEGER DEFAULT 30
    );

    CREATE TABLE IF NOT EXISTS citas (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER REFERENCES usuarios(id),
        negocio_id INTEGER REFERENCES negocios(id),
        fecha DATE NOT NULL,
        hora TIME NOT NULL,
        estado VARCHAR(20) DEFAULT 'pendiente'
    );`;

    try {
        await pool.query(querySQL);
        console.log("✅ Tablas creadas o verificadas con éxito en Render");
    } catch (err) {
        console.error("❌ Error al crear tablas:", err);
    }
};

inicializarDB();

// RUTA DE PRUEBA
app.get('/', (req, res) => res.send("Servidor de Citas Funcionando"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));