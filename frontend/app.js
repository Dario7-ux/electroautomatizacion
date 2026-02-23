const empresaNombre = document.getElementById('empresaNombre');
const empresaDescripcion = document.getElementById('empresaDescripcion');
const empresaTelefono = document.getElementById('empresaTelefono');
const empresaEmail = document.getElementById('empresaEmail');
const serviciosContainer = document.getElementById('serviciosContainer');
const servicioForm = document.getElementById('servicioForm');
const mensaje = document.getElementById('mensaje');
const vision = document.getElementById('vision');
const mision = document.getElementById('mision');

function normalizeText(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function filterServicios(servicios) {
  if (!serviciosContainer) return [];

  const category = serviciosContainer.dataset.category;
  if (!category) return servicios;

  return servicios.filter((servicio) => {
    return normalizeText(servicio.categoria).includes(normalizeText(category));
  });
}

function renderServicios(servicios) {
  if (!serviciosContainer) return;

  serviciosContainer.innerHTML = '';

  if (!servicios.length) {
    serviciosContainer.innerHTML = '<p>No hay servicios registrados.</p>';
    return;
  }

  servicios.forEach((servicio) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <h3>${servicio.nombre}</h3>
      <p>${servicio.descripcion}</p>
      <small>${servicio.categoria}</small>
    `;
    serviciosContainer.appendChild(card);
  });
}

async function cargarDatos() {
  const response = await fetch('/api/info');
  if (!response.ok) {
    throw new Error('Error al cargar datos');
  }

  const data = await response.json();

  empresaNombre.textContent = data.empresa.nombre;
  if (empresaDescripcion) {
    empresaDescripcion.textContent = data.empresa.descripcion;
  }
  if (empresaTelefono) {
    empresaTelefono.textContent = `Tel: ${data.empresa.telefono}`;
  }
  if (empresaEmail) {
    empresaEmail.textContent = `Email: ${data.empresa.email}`;
  }
  if (mision) {
    mision.textContent = data.nosotros.mision;
  }
  if (vision) {
    vision.textContent = data.nosotros.vision;
  }

  const serviciosFiltrados = filterServicios(data.servicios);
  renderServicios(serviciosFiltrados);
}

if (servicioForm) {
  servicioForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      nombre: document.getElementById('nombre').value,
      descripcion: document.getElementById('descripcion').value,
      categoria: document.getElementById('categoria').value
    };

    try {
      const response = await fetch('/api/servicios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('No se pudo guardar');
      }

      servicioForm.reset();
      if (mensaje) {
        mensaje.textContent = 'Servicio guardado correctamente.';
      }
      await cargarDatos();
    } catch (error) {
      if (mensaje) {
        mensaje.textContent = 'Error al guardar el servicio.';
      }
    }
  });
}

cargarDatos().catch(() => {
  if (mensaje) {
    mensaje.textContent = 'No se pudieron cargar los datos iniciales.';
  }
});