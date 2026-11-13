
// ==========================================
// REPORTES ACADEMICOS
// Proyecto SC-502
// ==========================================

let grupoReporteActual = null;
let filasCalificacionesReporte = [];
let filasAsistenciaReporte = [];

// ==========================================
// INICIALIZAR MODULO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const selector = document.getElementById("selectGrupo");

    if (!selector) {
        console.error("No se encontro el selector de grupos.");
        return;
    }

    cargarGruposReporte();

    document.getElementById("btnGenerarReportes")
        .addEventListener("click", generarReportes);

    document.getElementById("btnActualizarCalificaciones")
        .addEventListener("click", generarReporteCalificaciones);

    document.getElementById("btnActualizarAsistencia")
        .addEventListener("click", generarReporteAsistencia);

    document.getElementById("btnExportarCalificaciones")
        .addEventListener("click", exportarCalificacionesCSV);

    document.getElementById("btnExportarAsistencia")
        .addEventListener("click", exportarAsistenciaCSV);

});

// ==========================================
// CARGAR GRUPOS EN EL SELECTOR
// ==========================================

function cargarGruposReporte() {

    const selector = document.getElementById("selectGrupo");

    selector.innerHTML = `
        <option value="">Seleccione un grupo</option>
    `;

    const grupos = obtenerGrupos();

    grupos.forEach(grupo => {

        const opcion = document.createElement("option");

        opcion.value = grupo.id;

        opcion.textContent =
            `${grupo.nombre} - ${grupo.materia}`;

        selector.appendChild(opcion);

    });

    if (grupos.length === 0) {

        mostrarMensajeReporte(
            "No hay grupos registrados. Primero cree un grupo en la seccion Grupos.",
            "aviso"
        );

    } else {

        mostrarMensajeReporte(
            "Seleccione un grupo y pulse Generar reportes."
        );

    }

}

// ==========================================
// GENERAR REPORTES
// ==========================================

function generarReportes() {

    const grupoId = document.getElementById("selectGrupo").value;

    const grupo = obtenerGrupos().find(
        item => String(item.id) === String(grupoId)
    );

    if (!grupo) {

        ocultarSeccionesReporte();

        mostrarMensajeReporte(
            "Seleccione un grupo valido.",
            "aviso"
        );

        return;

    }

    grupoReporteActual = grupo;

    document.getElementById("seccionResumen").hidden = false;
    document.getElementById("seccionCalificaciones").hidden = false;
    document.getElementById("seccionAsistencia").hidden = false;

    document.getElementById("nombreGrupoReporte").textContent =
        grupo.nombre || "Sin nombre";

    document.getElementById("materiaReporte").textContent =
        grupo.materia || "Sin materia";

    document.getElementById("periodoReporte").textContent =
        grupo.periodo || "Sin periodo";

    generarReporteCalificaciones();

    generarReporteAsistencia();

    mostrarMensajeReporte(
        `Reportes generados para el grupo ${grupo.nombre}.`
    );

}

// ==========================================
// REPORTE DE CALIFICACIONES
// ==========================================

function generarReporteCalificaciones() {

    if (!grupoReporteActual) return;

    const grupo = grupoReporteActual;

    const estudiantes = obtenerEstudiantesPorGrupo(grupo.id);

    const calificaciones =
        obtenerCalificacionesPorGrupo(grupo.id);

    const tbody = document.getElementById("tablaCalificaciones");

    const cotidiano = Number(grupo.cotidiano) || 0;
    const tareas = Number(grupo.tareas) || 0;
    const examenes = Number(grupo.examenes) || 0;

    const pesosValidos =
        Math.abs(cotidiano + tareas + examenes - 100) < 0.001;

    const notaMinima = 70;

    document.getElementById("pesoCotidiano").textContent = cotidiano;

    document.getElementById("pesoTareas").textContent = tareas;

    document.getElementById("pesoExamenes").textContent = examenes;

    document.getElementById("totalEstudiantesReporte").textContent =
        estudiantes.length;

    tbody.innerHTML = "";

    filasCalificacionesReporte = [];

    const promediosFinales = [];

    estudiantes.forEach((estudiante, indice) => {

        const notas = calificaciones.filter(
            nota =>
                String(nota.estudianteId) === String(estudiante.id)
        );

        // Calcular promedio de cada categoria.

        const promedio = categoria => {

            const lista = notas
                .filter(nota =>
                    nota.categoria === categoria &&
                    Number.isFinite(Number(nota.nota))
                )
                .map(nota => Number(nota.nota));

            if (lista.length === 0) return null;

            return lista.reduce(
                (suma, valor) => suma + valor, 0
            ) / lista.length;

        };

        const c = promedio("cotidiano");
        const t = promedio("tareas");
        const e = promedio("examenes");

        const completo =
            c !== null &&
            t !== null &&
            e !== null &&
            pesosValidos;

        // Calcular nota final ponderada.

        const final = completo
            ? c * cotidiano / 100 +
              t * tareas / 100 +
              e * examenes / 100
            : null;

        const estado = final === null
            ? "Evaluacion incompleta"
            : final >= notaMinima
                ? "Aprobado"
                : "Reprobado";

        if (final !== null) {
            promediosFinales.push(final);
        }

        const nombre =
            `${estudiante.nombre || ""} ${estudiante.apellido || ""}`.trim();

        const valores = [
            indice + 1,
            nombre,
            formatoReporte(c),
            formatoReporte(t),
            formatoReporte(e),
            final === null ? "Pendiente" : final.toFixed(2),
            estado
        ];

        const fila = document.createElement("tr");

        valores.forEach((valor, columna) => {

            const celda = document.createElement("td");

            celda.textContent = valor;

            if (columna === 6 && final !== null) {

                celda.className =
                    final >= notaMinima
                        ? "mensaje-exito"
                        : "mensaje-error";

            }

            fila.appendChild(celda);

        });

        tbody.appendChild(fila);

        filasCalificacionesReporte.push({

            numero: indice + 1,
            estudiante: nombre,
            cotidiano: formatoReporte(c),
            tareas: formatoReporte(t),
            examenes: formatoReporte(e),
            promedioFinal:
                final === null ? "Pendiente" : final.toFixed(2),
            estado

        });

    });

    document.getElementById("sinCalificaciones").hidden =
        estudiantes.length > 0 && calificaciones.length > 0;

    if (estudiantes.length === 0 || calificaciones.length === 0) {

        document.getElementById("sinCalificaciones").hidden = false;

    }

    // Promedio general del grupo.

    const promedioGeneral = promediosFinales.length
        ? promediosFinales.reduce(
            (suma, valor) => suma + valor, 0
        ) / promediosFinales.length
        : null;

    document.getElementById("promedioGeneralReporte").textContent =
        promedioGeneral === null
            ? "Pendiente"
            : promedioGeneral.toFixed(2);

    if (!pesosValidos) {

        mostrarMensajeReporte(
            "Los porcentajes del grupo no suman 100%. Corrijalos en Grupos.",
            "aviso"
        );

    }

}

// ==========================================
// EXPORTAR CALIFICACIONES A CSV
// ==========================================

function exportarCalificacionesCSV() {

    if (!filasCalificacionesReporte.length) {

        mostrarMensajeReporte(
            "No hay calificaciones para exportar.",
            "aviso"
        );

        return;

    }

    descargarCSV(
        "reporte_calificaciones.csv",

        [
            "Numero",
            "Estudiante",
            "Cotidiano",
            "Tareas",
            "Examenes",
            "Promedio final",
            "Estado"
        ],

        filasCalificacionesReporte.map(f => [
            f.numero,
            f.estudiante,
            f.cotidiano,
            f.tareas,
            f.examenes,
            f.promedioFinal,
            f.estado
        ])

    );

}

// ==========================================
// REPORTE DE ASISTENCIA
// ==========================================

function generarReporteAsistencia() {

    if (!grupoReporteActual) return;

    const estudiantes =
        obtenerEstudiantesPorGrupo(grupoReporteActual.id);

    const asistencias =
        obtenerAsistenciasPorGrupo(grupoReporteActual.id);

    const tbody = document.getElementById("tablaAsistencia");

    tbody.innerHTML = "";

    filasAsistenciaReporte = [];

    let totalRegistros = 0;
    let totalPresentes = 0;
    let totalJustificadas = 0;

    estudiantes.forEach((estudiante, indice) => {

        const registros = asistencias.filter(
            item =>
                String(item.estudianteId) === String(estudiante.id)
        );

        // Normalizar los estados registrados.

        const normalizar = estado => {

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
                "llegada tardía": "T",
                "a": "A",
                "ausente": "A",
                "ausencia": "A",
                "j": "J",
                "justificada": "J",
                "justificado": "J"
            };

            return equivalencias[valor] || "";

        };

        const estados = registros.map(
            item => normalizar(item.estado || item.tipo)
        );

        const presentes = estados.filter(
            estado => estado === "P"
        ).length;

        const tardias = estados.filter(
            estado => estado === "T"
        ).length;

        const ausencias = estados.filter(
            estado => estado === "A"
        ).length;

        const justificadas = estados.filter(
            estado => estado === "J"
        ).length;

        // Cada tres tardias equivalen a una ausencia.

        const ausenciasPorTardias = Math.floor(tardias / 3);

        const ausenciasEquivalentes =
            ausencias + ausenciasPorTardias;

        // Todos los registros validos forman parte del denominador.

        const contabilizados = estados.filter(
            estado => ["P", "T", "A", "J"].includes(estado)
        ).length;

        // Las justificadas no penalizan el porcentaje.

        const porcentaje = contabilizados
            ? ((presentes + justificadas) / contabilizados) * 100
            : null;

        totalRegistros += contabilizados;
        totalPresentes += presentes;
        totalJustificadas += justificadas;

        const nombre =
            `${estudiante.nombre || ""} ${estudiante.apellido || ""}`.trim();

        const valores = [
            indice + 1,
            nombre,
            presentes,
            ausencias,
            tardias,
            justificadas,
            ausenciasEquivalentes,
            porcentaje === null
                ? "Sin datos"
                : `${porcentaje.toFixed(2)}%`
        ];

        const fila = document.createElement("tr");

        valores.forEach(valor => {

            const celda = document.createElement("td");

            celda.textContent = valor;

            fila.appendChild(celda);

        });

        tbody.appendChild(fila);

        filasAsistenciaReporte.push({

            numero: indice + 1,
            estudiante: nombre,
            presentes,
            ausencias,
            tardias,
            justificadas,
            ausenciasEquivalentes,
            porcentaje: porcentaje === null
                ? "Sin datos"
                : `${porcentaje.toFixed(2)}%`

        });

    });

    // Calcular porcentaje general del grupo.

    const porcentajeGeneral = totalRegistros
        ? ((totalPresentes + totalJustificadas) /
            totalRegistros) * 100
        : null;

    document.getElementById("porcentajeAsistenciaReporte").textContent =
        porcentajeGeneral === null
            ? "Sin datos"
            : `${porcentajeGeneral.toFixed(2)}%`;

    document.getElementById("sinAsistencia").hidden =
        asistencias.length > 0;

}

// ==========================================
// EXPORTAR ASISTENCIA A CSV
// ==========================================

function exportarAsistenciaCSV() {

    if (!filasAsistenciaReporte.length) {

        mostrarMensajeReporte(
            "No hay estudiantes para exportar.",
            "aviso"
        );

        return;

    }

    descargarCSV(
        "reporte_asistencia.csv",

        [
            "Numero",
            "Estudiante",
            "Presentes",
            "Ausencias",
            "Tardias",
            "Justificadas",
            "Ausencias equivalentes",
            "Porcentaje de asistencia"
        ],

        filasAsistenciaReporte.map(f => [
            f.numero,
            f.estudiante,
            f.presentes,
            f.ausencias,
            f.tardias,
            f.justificadas,
            f.ausenciasEquivalentes,
            f.porcentaje
        ])

    );

}

// ==========================================
// GENERAR ARCHIVO CSV
// ==========================================

function descargarCSV(nombreArchivo, encabezados, filas) {

    const escapar = valor =>
        `"${String(valor ?? "").replace(/"/g, '""')}"`;

    const contenido = [
        encabezados,
        ...filas
    ].map(fila =>
        fila.map(escapar).join(",")
    ).join("\r\n");

    const blob = new Blob(
        ["\uFEFF" + contenido],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const enlace = document.createElement("a");

    enlace.href = url;

    enlace.download = nombreArchivo;

    document.body.appendChild(enlace);

    enlace.click();

    enlace.remove();

    URL.revokeObjectURL(url);

}

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

function formatoReporte(valor) {

    return valor === null
        ? "Pendiente"
        : valor.toFixed(2);

}

function ocultarSeccionesReporte() {

    [
        "seccionResumen",
        "seccionCalificaciones",
        "seccionAsistencia"
    ].forEach(id => {

        document.getElementById(id).hidden = true;

    });

}

function mostrarMensajeReporte(texto, tipo = "exito") {

    const elemento =
        document.getElementById("mensajeReportes");

    elemento.textContent = texto;

    elemento.className =
        tipo === "aviso"
            ? "mensaje-aviso"
            : tipo === "error"
                ? "mensaje-error"
                : "mensaje-exito";

}
