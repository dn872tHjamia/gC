CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) CHECK (rol IN ('cliente', 'negocio')) NOT NULL
);

CREATE TABLE negocios (
    id SERIAL PRIMARY KEY,
    dueno_id INTEGER REFERENCES usuarios(id),
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(50),
    imagen_url TEXT,
    correo_contacto VARCHAR(150),
    telefono VARCHAR(20),
    intervalo_citas INTEGER DEFAULT 30
);

CREATE TABLE citas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES usuarios(id),
    negocio_id INTEGER REFERENCES negocios(id),
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente'
);