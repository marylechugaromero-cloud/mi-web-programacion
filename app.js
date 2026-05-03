require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
const Contacto = require("./models/Contacto");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ESTO ES CLAVE: Sirve los archivos de la carpeta actual
app.use(express.static(path.join(__dirname))); 

// 1. Conexión MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado correctamente"))
  .catch((error) => console.error("❌ Error MongoDB:", error.message));

// 2. Configuración de Correo
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

// 3. RUTA PRINCIPAL (Para arreglar el "Cannot GET /")
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 4. Ruta Formulario (Sin await en sendMail para evitar Timeout)
app.post("/contacto", async (req, res) => {
  try {
    const { nombre, correo, telefono, servicio, mensaje } = req.body;
    const nuevo = new Contacto({ nombre, correo, telefono, servicio, mensaje });
    await nuevo.save();

    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `Nuevo mensaje de ${nombre}`,
      text: `Nombre: ${nombre}\nCorreo: ${correo}\nTeléfono: ${telefono}\nServicio: ${servicio}\nMensaje: ${mensaje}`
    }).catch(err => console.log("Error correo:", err.message));

    res.json({ ok: true });
  } catch (error) {
    console.error("Error servidor:", error.message);
    res.status(500).json({ ok: false, mensaje: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
});