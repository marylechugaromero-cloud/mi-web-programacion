require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const Contacto = require("./models/Contacto");

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(__dirname)); 

// Conexión MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.log(err));

// Configuración correo
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Ruta formulario
app.post("/contacto", async (req, res) => {
  try {
    const { nombre, correo, telefono, servicio, mensaje } = req.body;

    // Guardar en MongoDB
    const nuevo = new Contacto({
      nombre,
      correo,
      telefono,
      servicio,
      mensaje
    });

    await nuevo.save();

    // Enviar correo
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Nuevo mensaje de la página",
      text: `
Nombre: ${nombre}
Correo: ${correo}
Teléfono: ${telefono}
Servicio: ${servicio}
Mensaje: ${mensaje}
      `
    });

    res.json({ ok: true });

  } catch (error) {
    console.log(error);
    res.json({ ok: false });
  }
});

// Servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});