const mongoose = require("mongoose");

const contactoSchema = new mongoose.Schema({
<<<<<<< HEAD
  nombre: {
    type: String,
    required: true
  },
  correo: {
    type: String,
    required: true
  },
  telefono: {
    type: String,
    required: true
  },
  servicio: {
    type: String,
    required: true
  },
  mensaje: {
    type: String,
    required: true
  },
=======
  nombre: String,
  correo: String,
  telefono: String,
  servicio: String,
  mensaje: String,
>>>>>>> e5c3f59cef0881b3f368073ab26768be29931b5e
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Contacto", contactoSchema);