require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");

const Contacto = require("./models/Contacto");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000
})
.then(() => console.log("✅ MongoDB conectado correctamente"))
.catch((error) => console.error("❌ Error MongoDB:", error.message));

// 📧 CONFIG CORREO CON SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/contacto", async (req, res) => {
  try {
    const { nombre, correo, telefono, servicio, mensaje } = req.body;

    if (!nombre || !correo || !servicio || !mensaje) {
      return res.status(400).json({
        ok: false,
        mensaje: "Nombre, correo, servicio y mensaje son obligatorios"
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
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: "Nuevo mensaje desde la página web",
      html: `
        <h2>Nuevo mensaje</h2>
        <p><b>Nombre:</b> ${nombre}</p>
        <p><b>Correo:</b> ${correo}</p>
        <p><b>Teléfono:</b> ${telefono || "No proporcionado"}</p>
        <p><b>Servicio:</b> ${servicio}</p>
        <p><b>Mensaje:</b> ${mensaje}</p>
      `
    });

    res.json({
      ok: true,
      mensaje: "Mensaje enviado y guardado correctamente"
    });

  } catch (error) {
    console.error("❌ ERROR EN /contacto:", error.message);
    res.status(500).json({
      ok: false,
      mensaje: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});