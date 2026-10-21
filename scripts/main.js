document.addEventListener("DOMContentLoaded", function() {

  const STORAGE_KEY = "catalogo_vinilos";

  const vinilosIniciales = [
    { id: 1, titulo: "Random Access Memories", artista: "Daft Punk", precio: 65000 },
    { id: 2, titulo: "Brothers in Arms", artista: "Dire Straits", precio: 52000 },
    { id: 3, titulo: "Luv(sic) Hexalogy", artista: "Nujabes", precio: 78000 }
  ];

  const datosGuardados = JSON.parse(localStorage.getItem(STORAGE_KEY));
  let vinilos = datosGuardados ?? [...vinilosIniciales];

  if (!datosGuardados) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vinilos));
  }

  let timerFeedback = null;

  const formVinilo = document.getElementById("form-vinilo");
  const inputTitulo = document.querySelector("#input-titulo");
  const inputArtista = document.querySelector("#input-artista");
  const inputPrecio = document.getElementById("input-precio");
  const inputBusqueda = document.querySelector("#input-busqueda");
  const contenedorItems = document.getElementById("contenedor-items");
  const feedback = document.querySelector("#feedback");
  const btnVaciar = document.getElementById("btn-vaciar");

  function guardarEnStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vinilos));
  }

  function mostrarFeedback(texto, esError = false) {
    if (timerFeedback) clearTimeout(timerFeedback);

    feedback.textContent = texto;
    feedback.className = esError ? "mensaje-error" : "mensaje-exito";

    timerFeedback = setTimeout(function() {
      feedback.className = "oculto";
    }, 2800);
  }

  function obtenerVinilosFiltrados() {
    const termino = inputBusqueda?.value?.toLowerCase().trim() ?? "";

    return termino === ""
      ? vinilos
      : vinilos.filter(function({ titulo, artista }) {
          return (
            titulo.toLowerCase().includes(termino) ||
            artista.toLowerCase().includes(termino)
          );
        });
  }

  function renderizarVinilos(lista) {
    contenedorItems.innerHTML = "";

    if (btnVaciar) {
      btnVaciar.style.display = vinilos.length === 0 ? "none" : "inline-block";
    }

    if (lista.length === 0) {
      const itemVacio = document.createElement("li");
      itemVacio.className = "tarjeta-vacia";

      itemVacio.textContent = vinilos.length === 0
        ? "El catálogo está completamente vacío. ¡Agrega un vinilo!"
        : `No hay vinilos que coincidan con "${inputBusqueda.value.trim()}".`;

      contenedorItems.appendChild(itemVacio);
      return;
    }

    lista.forEach(function(disco) {
      const { id, titulo, artista, precio } = disco;

      const li = document.createElement("li");
      li.className = "tarjeta-vinilo";

      li.innerHTML = `
        <div class="tarjeta-top">
          <h3>💿 ${titulo}</h3>
          <span class="etiqueta-artista">${artista}</span>
        </div>
        <div class="tarjeta-bottom">
          <span class="etiqueta-precio">$${precio.toLocaleString("es-AR")}</span>
          <button type="button" class="btn-eliminar" data-id="${id}">Eliminar</button>
        </div>
      `;

      contenedorItems.appendChild(li);
    });
  }

  formVinilo.addEventListener("submit", function(event) {
    event.preventDefault();

    const titulo = inputTitulo.value.trim();
    const artista = inputArtista.value.trim();
    const precio = Number(inputPrecio.value);

    const esValido = titulo !== "" && artista !== "" && precio > 0;

    if (!esValido) {
      mostrarFeedback("Por favor, completa todos los campos con valores válidos.", true);
      return;
    }

    const nuevoVinilo = {
      id: Date.now(),
      titulo,
      artista,
      precio
    };

    vinilos.push(nuevoVinilo);
    guardarEnStorage();

    formVinilo.reset();
    renderizarVinilos(obtenerVinilosFiltrados());
    mostrarFeedback(`¡"${nuevoVinilo.titulo}" agregado y guardado!`);
  });

  contenedorItems.addEventListener("click", function(event) {
    if (event.target?.classList.contains("btn-eliminar")) {
      const idSeleccionado = Number(event.target.getAttribute("data-id"));
      const indice = vinilos.findIndex(function({ id }) {
        return id === idSeleccionado;
      });

      if (indice !== -1) {
        const { titulo } = vinilos[indice];

        vinilos.splice(indice, 1);
        guardarEnStorage();

        const tarjetaLi = event.target.closest("li");
        tarjetaLi?.remove();

        const filtradosRestantes = obtenerVinilosFiltrados();
        if (filtradosRestantes.length === 0 || vinilos.length === 0) {
          renderizarVinilos(filtradosRestantes);
        }

        mostrarFeedback(`Se eliminó "${titulo}" del catálogo.`, true);
      }
    }
  });

  btnVaciar?.addEventListener("click", function() {
    if (vinilos.length === 0) return;

    vinilos = [];
    guardarEnStorage();
    renderizarVinilos(obtenerVinilosFiltrados());
    mostrarFeedback("Se vació todo el catálogo del almacenamiento.", true);
  });

  inputBusqueda.addEventListener("keyup", function() {
    renderizarVinilos(obtenerVinilosFiltrados());
  });

  inputBusqueda.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
      inputBusqueda.value = "";
      renderizarVinilos(obtenerVinilosFiltrados());
    }
  });

  renderizarVinilos(obtenerVinilosFiltrados());

});
