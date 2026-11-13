
// ==========================================
// MODULO DE ASISTENCIA
// Proyecto SC-502
// ==========================================

let grupoAsistenciaActual = null;
let estudiantesAsistenciaActual = [];

// ==========================================
// INICIALIZAR MODULO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const fecha = document.getElementById("fecha");
    const selector = document.getElementById("grupo");

    fecha.value = obtenerFechaActual();

    cargarGruposAsistencia();

    document.getElementById("btnCargarGrupo")
        .addEventListener("click", cargarListaAsistencia);

    document.getElementById("btnGuardarAsistencia")
        .addEventListener("click", guardarListaAsistencia);

    selector.addEventListener("change", cargarListaAsistencia);

    fecha.addEventListener("change", cargarListaAsistencia);

});

// ==========================================
// FECHA ACTUAL
// ==========================================

function obtenerFechaActual() {

    const fecha = new Date();

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;

}

// ==========================================
// CARGAR GRUPOS
// ==========================================


function cargarGruposAsistencia() {

    const selector = document.getElementById("grupo");

    selector.innerHTML = `
        <option value="">Seleccione un grupo</option>
    `;

    // Recuperar los grupos registrados.
    const grupos = obtenerGrupos();

    if (grupos.length === 0) {

        mostrarMensajeAsistencia(
            "No hay grupos registrados. Primero cree un grupo en Grupos.",
            "aviso"
        );

        document.getElementById("btnGuardarAsistencia").disabled = true;

        return;
    }

    // Agregar los grupos al selector.
    grupos.forEach(grupo => {

        const opcion = document.createElement("option");

        opcion.value = grupo.id;

        opcion.textContent =
            `${grupo.nombre} - ${grupo.materia || "Sin materia"}`;

        selector.appendChild(opcion);

    });

    // Seleccionar el primer grupo automáticamente.
    selector.value = grupos[0].id;

    // Cargar estudiantes, asistencias e historial.
    cargarListaAsistencia();

}


// ==========================================
// CARGAR LISTA DE ESTUDIANTES
// ==========================================

function cargarListaAsistencia() {

    const grupoId = document.getElementById("grupo").value;
    const fecha = document.getElementById("fecha").value;

    const tbody = document.getElementById(
        "tablaEstudiantesAsistencia"
    );

    tbody.innerHTML = "";

    grupoAsistenciaActual = null;
    estudiantesAsistenciaActual = [];

    document.getElementById("btnGuardarAsistencia").disabled = true;

    if (!grupoId || !fecha) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4">
                    Seleccione un grupo y una fecha.
                </td>
            </tr>
        `;

        actualizarHistorialVacio();

        return;

    }

    const grupo = obtenerGrupos().find(
        item => String(item.id) === String(grupoId)
    );

    if (!grupo) {

        mostrarMensajeAsistencia(
            "No se encontró el grupo seleccionado.",
            "error"
        );

        return;

    }

    grupoAsistenciaActual = grupo;

    estudiantesAsistenciaActual =
        obtenerEstudiantesPorGrupo(grupo.id);

    document.getElementById("tituloGrupo").textContent =
        grupo.nombre || "Grupo";

    document.getElementById("detalleGrupo").textContent =
        `${grupo.materia || "Sin materia"} · ${formatearFecha(fecha)} · ${estudiantesAsistenciaActual.length} estudiantes`;

    if (estudiantesAsistenciaActual.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4">
                    Este grupo todavía no tiene estudiantes registrados.
                </td>
            </tr>
        `;

        mostrarMensajeAsistencia(
            "El grupo no tiene estudiantes registrados.",
            "aviso"
        );

        actualizarHistorial();

        return;

    }

    const registros = obtenerAsistenciasPorGrupo(grupo.id);

    estudiantesAsistenciaActual.forEach((estudiante, indice) => {

        const registro = registros.find(item =>
            item.estudianteId === estudiante.id &&
            item.fecha === fecha
        );

        const estado = registro
            ? normalizarEstado(registro.estado || registro.tipo)
            : "P";

        const observacion = registro
            ? registro.observacion || ""
            : "";

        const fila = document.createElement("tr");

        const numero = document.createElement("td");
        numero.textContent = indice + 1;

        const nombre = document.createElement("td");
        nombre.textContent =
            `${estudiante.nombre || ""} ${estudiante.apellido || ""}`.trim();

        const celdaEstado = document.createElement("td");

        const contenedor = document.createElement("div");
        contenedor.className = "grupo-asistencia";

        const estados = [
            { valor: "P", texto: "P" },
            { valor: "T", texto: "T" },
            { valor: "A", texto: "A" },
            { valor: "J", texto: "J" }
        ];

        estados.forEach(opcion => {

            const idRadio =
                `estado_${indice}_${opcion.valor}`;

            const radio = document.createElement("input");

            radio.type = "radio";
            radio.name = `estado_${indice}`;
            radio.id = idRadio;
            radio.value = opcion.valor;
            radio.checked = estado === opcion.valor;

            const etiqueta = document.createElement("label");

            etiqueta.htmlFor = idRadio;
            etiqueta.textContent = opcion.texto;

            contenedor.appendChild(radio);
            contenedor.appendChild(etiqueta);

        });

        celdaEstado.appendChild(contenedor);

        const celdaObservacion = document.createElement("td");

        const campoObservacion = document.createElement("input");

        campoObservacion.type = "text";
        campoObservacion.className = "observacion-asistencia";
        campoObservacion.placeholder = "Observación...";
        campoObservacion.value = observacion;
        campoObservacion.dataset.estudianteId = estudiante.id;

        campoObservacion.style.minHeight = "unset";
        campoObservacion.style.padding = ".3rem .55rem";
        campoObservacion.style.fontSize = ".85rem";

        celdaObservacion.appendChild(campoObservacion);

        fila.appendChild(numero);
        fila.appendChild(nombre);
        fila.appendChild(celdaEstado);
        fila.appendChild(celdaObservacion);

        tbody.appendChild(fila);

    });

    document.getElementById("btnGuardarAsistencia").disabled = false;

    mostrarMensajeAsistencia(
        "Lista cargada. Seleccione el estado de cada estudiante y guarde.",
        "exito"
    );

    actualizarHistorial();

}

// ==========================================
// GUARDAR LISTA
// ==========================================

function guardarListaAsistencia() {

    if (!grupoAsistenciaActual) {

        mostrarMensajeAsistencia(
            "Primero debe seleccionar un grupo.",
            "aviso"
        );

        return;

    }

    const fecha = document.getElementById("fecha").value;

    if (!fecha) {

        mostrarMensajeAsistencia(
            "Seleccione una fecha válida.",
            "aviso"
        );

        return;

    }

    const asistencias = obtenerAsistencias();

    for (let indice = 0;
         indice < estudiantesAsistenciaActual.length;
         indice++) {

        const estudiante = estudiantesAsistenciaActual[indice];

        const seleccionado = document.querySelector(
            `input[name="estado_${indice}"]:checked`
        );

        if (!seleccionado) {

            mostrarMensajeAsistencia(
                `Seleccione un estado para ${estudiante.nombre}.`,
                "aviso"
            );

            return;

        }

        const estado = seleccionado.value;

        const campoObservacion = document.querySelector(
            `.observacion-asistencia[data-estudiante-id="${estudiante.id}"]`
        );

        const observacion = campoObservacion
            ? campoObservacion.value.trim()
            : "";

        const posicion = asistencias.findIndex(item =>
            item.grupoId === grupoAsistenciaActual.id &&
            item.estudianteId === estudiante.id &&
            item.fecha === fecha
        );

        const registro = {
            grupoId: grupoAsistenciaActual.id,
            estudianteId: estudiante.id,
            fecha: fecha,
            estado: estado,
            observacion: observacion
        };

        if (posicion >= 0) {

            asistencias[posicion] = {
                ...asistencias[posicion],
                ...registro
            };

        } else {

            registro.id = generarId();

            asistencias.push(registro);

        }

    }

    if (!guardarDatos(CLAVE_ASISTENCIAS, asistencias)) {

        mostrarMensajeAsistencia(
            "No fue posible guardar la asistencia.",
            "error"
        );

        return;

    }

    mostrarMensajeAsistencia(
        "La lista de asistencia se guardó correctamente.",
        "exito"
    );

    actualizarHistorial();

}

// ==========================================
// HISTORIAL
// ==========================================

function actualizarHistorial() {

    if (!grupoAsistenciaActual) {

        actualizarHistorialVacio();

        return;

    }

    const estudiantes = estudiantesAsistenciaActual;

    const registros = obtenerAsistenciasPorGrupo(
        grupoAsistenciaActual.id
    );

    const fechas = [
        ...new Set(registros.map(item => item.fecha).filter(Boolean))
    ].sort();

    const tbody = document.getElementById(
        "tablaHistorialAsistencia"
    );

    tbody.innerHTML = "";

    let totalPresentes = 0;
    let totalTardias = 0;
    let totalAusencias = 0;
    let totalJustificadas = 0;

    let totalSesionesEstudiante = 0;
    let totalAsistenciasContabilizadas = 0;

    estudiantes.forEach((estudiante, indice) => {

        const propios = registros.filter(
            item => item.estudianteId === estudiante.id
        );

        const presentes = propios.filter(
            item => normalizarEstado(item.estado || item.tipo) === "P"
        ).length;

        const tardias = propios.filter(
            item => normalizarEstado(item.estado || item.tipo) === "T"
        ).length;

        const ausencias = propios.filter(
            item => normalizarEstado(item.estado || item.tipo) === "A"
        ).length;

        const justificadas = propios.filter(
            item => normalizarEstado(item.estado || item.tipo) === "J"
        ).length;

        const contabilizadas =
            presentes + tardias + ausencias + justificadas;

        const porcentaje = contabilizadas
            ? ((presentes + justificadas) / contabilizadas) * 100
            : null;

        totalPresentes += presentes;
        totalTardias += tardias;
        totalAusencias += ausencias;
        totalJustificadas += justificadas;

        totalSesionesEstudiante += contabilizadas;
        totalAsistenciasContabilizadas += contabilizadas;

        const fila = document.createElement("tr");

        const valores = [
            indice + 1,
            `${estudiante.nombre || ""} ${estudiante.apellido || ""}`.trim(),
            presentes,
            tardias,
            ausencias,
            justificadas,
            porcentaje === null
                ? "Sin datos"
                : `${porcentaje.toFixed(2)}%`
        ];

        valores.forEach(valor => {

            const celda = document.createElement("td");

            celda.textContent = valor;

            fila.appendChild(celda);

        });

        tbody.appendChild(fila);

    });

    if (estudiantes.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    No hay estudiantes en este grupo.
                </td>
            </tr>
        `;

    }

    const promedio = totalAsistenciasContabilizadas
        ? ((totalPresentes + totalJustificadas) /
            totalAsistenciasContabilizadas) * 100
        : null;

    document.getElementById("totalSesiones").textContent =
        fechas.length;

    document.getElementById("promedioAsistencia").textContent =
        promedio === null
            ? "Sin datos"
            : `${promedio.toFixed(2)}%`;

    document.getElementById("totalTardias").textContent =
        totalTardias;

    document.getElementById("totalAusencias").textContent =
        totalAusencias;

}

// ==========================================
// HISTORIAL VACIO
// ==========================================

function actualizarHistorialVacio() {

    document.getElementById("tablaHistorialAsistencia").innerHTML = `
        <tr>
            <td colspan="7">
                Seleccione un grupo para consultar su historial.
            </td>
        </tr>
    `;

    document.getElementById("totalSesiones").textContent = "0";
    document.getElementById("promedioAsistencia").textContent = "Sin datos";
    document.getElementById("totalTardias").textContent = "0";
    document.getElementById("totalAusencias").textContent = "0";

}

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

function normalizarEstado(estado) {

    const valor = String(estado || "")
        .trim()
        .toLowerCase();

    const equivalencias = {
        "p": "P",
        "presente": "P",
        "t": "T",
        "tardia": "T",
        "tardía": "T",
        "tarde": "T",
        "a": "A",
        "ausente": "A",
        "ausencia": "A",
        "j": "J",
        "justificada": "J",
        "justificado": "J"
    };

    return equivalencias[valor] || "";
}

function formatearFecha(fecha) {

    const partes = fecha.split("-");

    if (partes.length !== 3) return fecha;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}

function mostrarMensajeAsistencia(texto, tipo = "exito") {

    const elemento = document.getElementById("mensajeAsistencia");

    elemento.textContent = texto;

    elemento.className =
        tipo === "aviso"
            ? "mensaje-aviso"
            : tipo === "error"
                ? "mensaje-error"
                : "mensaje-exito";

}
