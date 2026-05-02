require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");

const Contacto = require("./models/Contacto");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// 🔥 CONEXIÓN CORRECTA A MONGO
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log("✅ MongoDB conectado correctamente"))
.catch((error) => console.error("❌ Error MongoDB:", error));

// 📧 CONFIG CORREO
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Ruta principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Ruta formulario
app.post("/contacto", async (req, res) => {
  try {
    const { nombre, correo, telefono, servicio, mensaje } = req.body;

    if (!nombre || !correo || !telefono || !servicio || !mensaje) {
      return res.status(400).json({
        ok: false,
        mensaje: "Todos los campos son obligatorios"
      });
    }

    const nuevoContacto = new Contacto({
      nombre,
      correo,
      telefono,
      servicio,
      mensaje
    });

    await nuevoContacto.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Nuevo mensaje desde la página web",
      html: `
        <h2>Nuevo mensaje</h2>
        <p><b>Nombre:</b> ${nombre}</p>
        <p><b>Correo:</b> ${correo}</p>
        <p><b>Teléfono:</b> ${telefono}</p>
        <p><b>Servicio:</b> ${servicio}</p>
        <p><b>Mensaje:</b> ${mensaje}</p>
      `
    });

    res.json({
      ok: true,
      mensaje: "Mensaje enviado y guardado correctamente"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      mensaje: "Error al enviar mensaje"
    });
  }
});

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});