require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
const Contacto = require("./models/Contacto");

const app = express();

// --- CONFIGURACIÓN DE MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ESTO ES LO MÁS IMPORTANTE: 
// Sirve todos los archivos (HTML, CSS, JS) desde la carpeta raíz del proyecto
app.use(express.static(path.join(__dirname))); 

// --- CONEXIÓN A MONGODB ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado correctamente"))
  .catch((error) => console.error("❌ Error MongoDB:", error.message));

// --- CONFIGURACIÓN DE CORREO ---
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false 
  }
});

// --- RUTAS ---

// 1. Ruta para cargar la página principal (Arregla el "Not Found")
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 2. Ruta para procesar el formulario (Arregla el "Timeout")
app.post("/contacto", async (req, res) => {
  try {
    const { nombre, correo, telefono, servicio, mensaje } = req.body;

    // Guardar en base de datos primero
    const nuevoContacto = new Contacto({ nombre, correo, telefono, servicio, mensaje });
    await nuevoContacto.save();

    // Enviar correo (sin 'await' para responder rápido al cliente)
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `Nuevo mensaje de ${nombre}`,
      text: `Nombre: ${nombre}\nCorreo: ${correo}\nTeléfono: ${telefono}\nServicio: ${servicio}\nMensaje: ${mensaje}`
    }).catch(err => console.log("Error envío correo:", err));

    // Responder de inmediato para que el navegador no dé error
    res.json({ ok: true, mensaje: "¡Mensaje recibido con éxito!" });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ ok: false, mensaje: "Error interno del servidor" });
  }
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor activo en puerto ${PORT}`);
});