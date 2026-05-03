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
app.use(express.static(__dirname)); 

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado correctamente"))
  .catch((error) => console.error("❌ Error MongoDB:", error.message));

// Configuración de Nodemailer
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

// Ruta del formulario
app.post("/contacto", async (req, res) => {
  try {
    const { nombre, correo, telefono, servicio, mensaje } = req.body;

    // Guardar en la base de datos
    const nuevoContacto = new Contacto({
      nombre,
      correo,
      telefono,
      servicio,
      mensaje
    });

    await nuevoContacto.save();

    // Enviar correo (sin 'await' para responder rápido al cliente)
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `Nuevo mensaje de ${nombre}`,
      text: `Nombre: ${nombre}\nCorreo: ${correo}\nTeléfono: ${telefono}\nServicio: ${servicio}\nMensaje: ${mensaje}`
    }).catch(err => console.log("Error envío correo:", err));

    res.json({ ok: true, mensaje: "¡Mensaje enviado!" });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ ok: false, mensaje: "Error en el servidor" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
});