-- Tabla de Usuarios (Seguridad de 9 caracteres validada en frontend/backend)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol VARCHAR(20) CHECK (rol IN ('cliente', 'negocio'))
);

-- Tabla de Negocios (Soporte para logos .webp de 2MB)
CREATE TABLE negocios (
    id SERIAL PRIMARY KEY,
    dueno_id INTEGER REFERENCES usuarios(id),
    nombre_negocio VARCHAR(100),
    categoria VARCHAR(50),
    telefono_negocio VARCHAR(20),
    logo_url TEXT,
    facebook VARCHAR(255),
    instagram VARCHAR(255),
    dias_habiles VARCHAR(50), -- Ej: "1,2,3,4,5"
    hora_apertura TIME,
    hora_cierre TIME,
    intervalo_citas INTEGER DEFAULT 30
);

-- Tabla de Citas (Prevención de empalmes)
CREATE TABLE citas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES usuarios(id),
    negocio_id INTEGER REFERENCES negocios(id),
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    estado VARCHAR(20) DEFAULT 'confirmada'
);