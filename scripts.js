let deudas = JSON.parse(localStorage.getItem("deudas") || "[]");

let personaActiva = null;
let deudaSeleccionada = null;

// ELEMENTOS
const tbody = document.getElementById("tablaDeudas");
const busqueda = document.getElementById("busqueda");
const historialDiv = document.getElementById("historial");

const modal = document.getElementById("modalPago");
const inputPago = document.getElementById("inputPago");
const confirmarPago = document.getElementById("confirmarPago");
const cancelarPago = document.getElementById("cancelarPago");

const btnAgregar = document.getElementById("btnAgregar");

// EVENTOS INICIALES
btnAgregar.addEventListener("click", agregarDeuda);
busqueda.addEventListener("input", render);

// GUARDAR
function guardar() {
  localStorage.setItem("deudas", JSON.stringify(deudas));
}

// AGREGAR DEUDA
function agregarDeuda() {
  const nombre = document.getElementById("nombre").value.trim();
  const detalles = document.getElementById("detalles").value.trim();
  const fecha = document.getElementById("fecha").value;
  const monto = parseFloat(document.getElementById("monto").value);

  if (!nombre || !fecha || isNaN(monto)) {
    alert("Datos inválidos");
    return;
  }

  deudas.push({
    nombre,
    detalles,
    fecha,
    monto,
    pagado: 0,
    historial: []
  });

  guardar();
  render();

  // limpiar form
  document.getElementById("nombre").value = "";
  document.getElementById("detalles").value = "";
  document.getElementById("fecha").value = "";
  document.getElementById("monto").value = "";
  document.getElementById("nombre").focus();
}

// RENDER
function render() {
  const filtro = busqueda.value.toLowerCase();
  tbody.innerHTML = "";

  deudas.forEach((p, i) => {
    if (!p.nombre.toLowerCase().includes(filtro)) return;

    const restante = p.monto - p.pagado;

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <span class="verHistorial" data-i="${i}" style="cursor:pointer;">
          ${p.nombre}
        </span>
      </td>
      <td>$${p.monto.toFixed(2)}</td>
      <td>$${p.pagado.toFixed(2)}</td>
      <td class="${restante > 100000 ? 'rojo' : ''}">
        $${restante.toFixed(2)}
      </td>
      <td>
        <button class="pagar" data-i="${i}">Pagar</button>
        <button class="borrar" data-i="${i}">X</button>
      </td>
    `;

    tbody.appendChild(row);
  });

  eventosTabla();

  // actualizar historial si hay uno activo
  if (personaActiva !== null) {
    verHistorial(personaActiva);
  }
}

// EVENTOS DE TABLA
function eventosTabla() {
  document.querySelectorAll(".pagar").forEach(btn => {
    btn.addEventListener("click", e => {
      deudaSeleccionada = parseInt(e.target.dataset.i);
      inputPago.value = "";
      modal.classList.remove("hidden");
    });
  });

  document.querySelectorAll(".borrar").forEach(btn => {
    btn.addEventListener("click", e => {
      const i = parseInt(e.target.dataset.i);
      eliminar(i);
    });
  });

  document.querySelectorAll(".verHistorial").forEach(el => {
    el.addEventListener("click", e => {
      const i = parseInt(e.target.dataset.i);
      personaActiva = i;
      verHistorial(i);
    });
  });
}

// CONFIRMAR PAGO
confirmarPago.addEventListener("click", () => {
  const valor = parseFloat(inputPago.value);

  if (isNaN(valor) || valor <= 0) return;

  const persona = deudas[deudaSeleccionada];

  persona.pagado += valor;
  if (persona.pagado > persona.monto) {
    persona.pagado = persona.monto;
  }

  const ahora = new Date().toLocaleString();

  persona.historial.push(`Pago: $${valor.toFixed(2)} - ${ahora}`);

  guardar();
  render();

  // mostrar historial actualizado
  personaActiva = deudaSeleccionada;
  verHistorial(deudaSeleccionada);

  modal.classList.add("hidden");
});

// CANCELAR MODAL
cancelarPago.addEventListener("click", () => {
  modal.classList.add("hidden");
});

// ELIMINAR
function eliminar(i) {
  if (!confirm("¿Eliminar deuda?")) return;

  deudas.splice(i, 1);

  if (personaActiva === i) {
    personaActiva = null;
    historialDiv.innerHTML = "Seleccioná una persona";
  }

  guardar();
  render();
}

// VER HISTORIAL
function verHistorial(i) {
  const persona = deudas[i];

  if (!persona || !persona.historial.length) {
    historialDiv.innerHTML = `<b>${persona?.nombre || ""}</b><br>Sin historial`;
    return;
  }

  historialDiv.innerHTML = `
    <b>Historial de ${persona.nombre}</b><br><br>
    ${persona.historial.slice().reverse().join("<br>")}
  `;
}

render();
