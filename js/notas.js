// Registro y mantenimiento de calificaciones.
let grupoActual = null;
let estudianteActual = null;

 document.addEventListener("DOMContentLoaded", () => {
    cargarGrupos();
    document.getElementById("selectGrupo").addEventListener("change", cambiarGrupo);
    document.getElementById("selectEstudiante").addEventListener("change", cambiarEstudiante);
    document.getElementById("formCalificacion").addEventListener("submit", guardarNota);
    document.getElementById("btnCancelar").addEventListener("click", ocultarFormulario);
    document.getElementById("btnNueva").addEventListener("click", nuevaNota);
});

function cargarGrupos() {
    const select = document.getElementById("selectGrupo");
    obtenerGrupos().forEach(grupo => {
        const opcion = document.createElement("option");
        opcion.value = grupo.id;
        opcion.textContent = `${grupo.nombre} — ${grupo.materia}`;
        select.appendChild(opcion);
    });
    if (select.options.length === 1) mensaje("Primero debe registrar un grupo en la sección Grupos.", "aviso");
}

function cambiarGrupo() {
    grupoActual = document.getElementById("selectGrupo").value || null;
    estudianteActual = null;
    const select = document.getElementById("selectEstudiante");
    select.innerHTML = '<option value="">Seleccione un estudiante</option>';
    select.disabled = !grupoActual;
    document.getElementById("seccionListado").hidden = true;
    ocultarFormulario();
    if (!grupoActual) return;
    obtenerEstudiantesPorGrupo(grupoActual).forEach(estudiante => {
        const opcion = document.createElement("option");
        opcion.value = estudiante.id;
        opcion.textContent = `${estudiante.nombre} ${estudiante.apellido}`;
        select.appendChild(opcion);
    });
    if (select.options.length === 1) mensaje("Este grupo todavía no tiene estudiantes registrados.", "aviso");
    else mensaje("Seleccione un estudiante para consultar sus notas.");
}

function cambiarEstudiante() {
    estudianteActual = document.getElementById("selectEstudiante").value || null;
    ocultarFormulario();
    if (!estudianteActual) {
        document.getElementById("seccionListado").hidden = true;
        return;
    }
    document.getElementById("seccionListado").hidden = false;
    const estudiante = obtenerEstudiantesPorGrupo(grupoActual).find(e => e.id === estudianteActual);
    document.getElementById("datosSeleccion").textContent = `Estudiante: ${estudiante.nombre} ${estudiante.apellido}`;
    listarNotas();
}

function listarNotas() {
    const tbody = document.getElementById("tablaNotas");
    tbody.innerHTML = "";
    const notas = obtenerCalificacionesPorEstudiante(grupoActual, estudianteActual)
        .sort((a,b) => (b.fecha || "").localeCompare(a.fecha || ""));
    document.getElementById("sinNotas").hidden = notas.length > 0;
    notas.forEach(nota => {
        const fila = document.createElement("tr");
        [nota.actividad, etiquetaCategoria(nota.categoria), Number(nota.nota).toFixed(2), nota.fecha || "—"].forEach(valor => {
            const celda = document.createElement("td"); celda.textContent = valor; fila.appendChild(celda);
        });
        const acciones = document.createElement("td");
        const editar = document.createElement("button"); editar.type = "button"; editar.className = "boton boton-contorno"; editar.textContent = "Editar";
        editar.addEventListener("click", () => editarNota(nota));
        const borrar = document.createElement("button"); borrar.type = "button"; borrar.className = "boton boton-peligro"; borrar.textContent = "Eliminar";
        borrar.addEventListener("click", () => {
            if (confirm(`¿Desea eliminar la calificación de "${nota.actividad}"?`)) {
                if (eliminarCalificacion(nota.id)) { listarNotas(); mensaje("Calificación eliminada."); }
                else mensaje("No fue posible eliminar la calificación.", "error");
            }
        });
        acciones.append(editar, document.createTextNode(" "), borrar); fila.appendChild(acciones); tbody.appendChild(fila);
    });
}

function nuevaNota() {
    document.getElementById("formCalificacion").reset();
    document.getElementById("idCalificacion").value = "";
    document.getElementById("fecha").value = new Date().toISOString().slice(0,10);
    document.getElementById("tituloFormulario").textContent = "Registrar calificación";
    document.getElementById("btnGuardar").textContent = "Guardar calificación";
    document.getElementById("seccionFormulario").hidden = false;
    document.getElementById("seccionFormulario").scrollIntoView({behavior:"smooth"});
}

function editarNota(nota) {
    document.getElementById("idCalificacion").value = nota.id;
    document.getElementById("actividad").value = nota.actividad;
    document.getElementById("categoria").value = nota.categoria;
    document.getElementById("nota").value = nota.nota;
    document.getElementById("fecha").value = nota.fecha;
    document.getElementById("tituloFormulario").textContent = "Editar calificación";
    document.getElementById("btnGuardar").textContent = "Actualizar calificación";
    document.getElementById("seccionFormulario").hidden = false;
    document.getElementById("seccionFormulario").scrollIntoView({behavior:"smooth"});
}

function guardarNota(evento) {
    evento.preventDefault();
    if (!grupoActual || !estudianteActual) { mensaje("Seleccione un grupo y un estudiante.", "error"); return; }
    const nota = Number(document.getElementById("nota").value);
    if (!Number.isFinite(nota) || nota < 0 || nota > 100) { mensaje("La nota debe estar entre 0 y 100.", "error"); return; }
    const datos = {
        grupoId: grupoActual,
        estudianteId: estudianteActual,
        actividad: document.getElementById("actividad").value.trim(),
        categoria: document.getElementById("categoria").value,
        nota: nota,
        fecha: document.getElementById("fecha").value
    };
    const id = document.getElementById("idCalificacion").value;
    const ok = id ? actualizarCalificacion(id, datos) : agregarCalificacion(datos);
    if (!ok) { mensaje("No fue posible guardar la calificación. Revise el almacenamiento del navegador.", "error"); return; }
    ocultarFormulario(); listarNotas(); mensaje(id ? "Calificación actualizada correctamente." : "Calificación registrada correctamente.");
}

function ocultarFormulario() { document.getElementById("seccionFormulario").hidden = true; }
function etiquetaCategoria(c) { return ({cotidiano:"Cotidiano", tareas:"Tareas", examenes:"Exámenes"})[c] || c; }
function mensaje(texto, tipo="exito") { const el=document.getElementById("mensajeGeneral"); el.textContent=texto; el.className=tipo === "error" ? "mensaje-error" : tipo === "aviso" ? "mensaje-aviso" : "mensaje-exito"; }
