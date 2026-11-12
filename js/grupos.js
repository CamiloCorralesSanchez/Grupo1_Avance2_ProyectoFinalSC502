
// ==========================================
// GESTIÓN DE GRUPOS Y ESTUDIANTES
// Proyecto SC-502
// ==========================================

// Grupo seleccionado para administrar estudiantes
let grupoSeleccionado = null;

// ==========================================
// INICIAR LA PÁGINA
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    mostrarGrupos();

    // Botones de grupos
    document.getElementById("btnNuevoGrupo")
        .addEventListener("click", mostrarFormularioGrupo);

    document.getElementById("btnCancelarGrupo")
        .addEventListener("click", cancelarFormularioGrupo);

    document.getElementById("formGrupo")
        .addEventListener("submit", guardarGrupo);

    // Actualizar total de porcentajes
    document.getElementById("porcentajeCotidiano")
        .addEventListener("input", calcularPorcentajes);

    document.getElementById("porcentajeTareas")
        .addEventListener("input", calcularPorcentajes);

    document.getElementById("porcentajeExamenes")
        .addEventListener("input", calcularPorcentajes);

    // Botones de estudiantes
    document.getElementById("formEstudiante")
        .addEventListener("submit", guardarEstudiante);

    document.getElementById("btnCancelarEstudiante")
        .addEventListener("click", limpiarFormularioEstudiante);

    document.getElementById("btnCerrarEstudiantes")
        .addEventListener("click", cerrarEstudiantes);

});

// ==========================================
// FUNCIONES DE APOYO
// ==========================================

// Mostrar mensajes al usuario
function mostrarMensaje(texto, tipo = "exito") {

    const mensaje = document.getElementById("mensajeGeneral");

    mensaje.textContent = texto;
    mensaje.className = "mensaje-" + tipo;
}

// Crear un botón para las tablas
function crearBoton(texto, clase, funcion) {

    const boton = document.createElement("button");

    boton.type = "button";
    boton.textContent = texto;
    boton.className = "boton " + clase;

    boton.addEventListener("click", funcion);

    return boton;
}

// ==========================================
// LISTAR GRUPOS
// ==========================================

function mostrarGrupos() {

    const grupos = obtenerGrupos();

    const tabla = document.getElementById("tablaGrupos");
    const mensajeVacio = document.getElementById("sinGrupos");

    tabla.innerHTML = "";

    mensajeVacio.hidden = grupos.length > 0;

    grupos.forEach(function (grupo, indice) {

        const fila = document.createElement("tr");

        const estudiantes = obtenerEstudiantesPorGrupo(grupo.id);

        const datos = [
            indice + 1,
            grupo.nombre,
            grupo.materia,
            grupo.periodo,
            estudiantes.length
        ];

        datos.forEach(function (dato) {

            const celda = document.createElement("td");
            celda.textContent = dato;
            fila.appendChild(celda);

        });

        const acciones = document.createElement("td");

        const btnEstudiantes = crearBoton(
            "Estudiantes",
            "boton-contorno",
            function () {
                abrirEstudiantes(grupo.id);
            }
        );

        const btnEditar = crearBoton(
            "Editar",
            "boton-contorno",
            function () {
                editarGrupo(grupo.id);
            }
        );

        const btnEliminar = crearBoton(
            "Eliminar",
            "boton-peligro",
            function () {
                confirmarEliminarGrupo(grupo.id);
            }
        );

        acciones.appendChild(btnEstudiantes);
        acciones.appendChild(btnEditar);
        acciones.appendChild(btnEliminar);

        fila.appendChild(acciones);
        tabla.appendChild(fila);

    });
}

// ==========================================
// CREAR Y EDITAR GRUPOS
// ==========================================

// Mostrar formulario para crear grupo
function mostrarFormularioGrupo() {

    document.getElementById("formGrupo").reset();

    document.getElementById("idGrupo").value = "";

    document.getElementById("tituloFormulario")
        .textContent = "Registrar nuevo grupo";

    document.getElementById("totalPorcentaje")
        .textContent = "0";

    document.getElementById("mensajePorcentaje")
        .textContent = "";

    document.getElementById("seccionFormulario").hidden = false;

    document.getElementById("seccionEstudiantes").hidden = true;

    document.getElementById("seccionFormulario")
        .scrollIntoView({ behavior: "smooth" });
}

// Calcular porcentajes de evaluación
function calcularPorcentajes() {

    const cotidiano = Number(
        document.getElementById("porcentajeCotidiano").value
    );

    const tareas = Number(
        document.getElementById("porcentajeTareas").value
    );

    const examenes = Number(
        document.getElementById("porcentajeExamenes").value
    );

    const total = cotidiano + tareas + examenes;

    const totalElemento = document.getElementById("totalPorcentaje");
    const mensaje = document.getElementById("mensajePorcentaje");

    totalElemento.textContent = total.toFixed(2);

    if (Math.abs(total - 100) < 0.001) {

        mensaje.textContent = "Los porcentajes son correctos.";
        mensaje.className = "mensaje-exito";

    } else {

        mensaje.textContent = "Los porcentajes deben sumar 100%.";
        mensaje.className = "mensaje-error";

    }

    return total;
}

// Guardar grupo nuevo o editado
function guardarGrupo(evento) {

    evento.preventDefault();

    const id = document.getElementById("idGrupo").value;

    const nombre = document.getElementById("nombreGrupo").value.trim();
    const materia = document.getElementById("materiaGrupo").value.trim();
    const periodo = document.getElementById("periodoGrupo").value.trim();
    const horario = document.getElementById("horarioGrupo").value.trim();

    const cotidiano = Number(
        document.getElementById("porcentajeCotidiano").value
    );

    const tareas = Number(
        document.getElementById("porcentajeTareas").value
    );

    const examenes = Number(
        document.getElementById("porcentajeExamenes").value
    );

    // Validar los campos
    if (!nombre || !materia || !periodo) {

        mostrarMensaje(
            "Complete los campos obligatorios.",
            "error"
        );

        return;
    }

    // Validar que los porcentajes sumen 100
    const total = cotidiano + tareas + examenes;

    if (Math.abs(total - 100) >= 0.001) {

        mostrarMensaje(
            "Los porcentajes deben sumar exactamente 100%.",
            "error"
        );

        return;
    }

    const datosGrupo = {
        nombre: nombre,
        materia: materia,
        periodo: periodo,
        horario: horario,
        cotidiano: cotidiano,
        tareas: tareas,
        examenes: examenes
    };

    let guardado = false;

    if (id === "") {

        // Crear nuevo grupo
        guardado = agregarGrupo(datosGrupo) !== null;

    } else {

        // Actualizar grupo existente
        guardado = actualizarGrupo(id, datosGrupo);

    }

    if (!guardado) {

        mostrarMensaje(
            "No fue posible guardar el grupo.",
            "error"
        );

        return;
    }

    document.getElementById("seccionFormulario").hidden = true;

    mostrarGrupos();

    mostrarMensaje("Grupo guardado correctamente.");
}

// Cargar datos para editar un grupo
function editarGrupo(id) {

    const grupo = obtenerGrupos().find(function (item) {
        return item.id === id;
    });

    if (!grupo) {
        mostrarMensaje("No se encontró el grupo.", "error");
        return;
    }

    document.getElementById("idGrupo").value = grupo.id;
    document.getElementById("nombreGrupo").value = grupo.nombre;
    document.getElementById("materiaGrupo").value = grupo.materia;
    document.getElementById("periodoGrupo").value = grupo.periodo;
    document.getElementById("horarioGrupo").value = grupo.horario || "";

    document.getElementById("porcentajeCotidiano")
        .value = grupo.cotidiano;

    document.getElementById("porcentajeTareas")
        .value = grupo.tareas;

    document.getElementById("porcentajeExamenes")
        .value = grupo.examenes;

    document.getElementById("tituloFormulario")
        .textContent = "Editar grupo";

    calcularPorcentajes();

    document.getElementById("seccionFormulario").hidden = false;
    document.getElementById("seccionEstudiantes").hidden = true;

    document.getElementById("seccionFormulario")
        .scrollIntoView({ behavior: "smooth" });
}

// Cancelar formulario
function cancelarFormularioGrupo() {

    document.getElementById("formGrupo").reset();
    document.getElementById("idGrupo").value = "";

    document.getElementById("seccionFormulario").hidden = true;
}

// Eliminar grupo
function confirmarEliminarGrupo(id) {

    const grupo = obtenerGrupos().find(function (item) {
        return item.id === id;
    });

    if (!grupo) {
        mostrarMensaje("No se encontró el grupo.", "error");
        return;
    }

    const confirmar = confirm(
        "¿Desea eliminar el grupo " + grupo.nombre +
        "? También se eliminarán sus estudiantes y registros asociados."
    );

    if (!confirmar) {
        return;
    }

    if (eliminarGrupo(id)) {

        document.getElementById("seccionFormulario").hidden = true;
        document.getElementById("seccionEstudiantes").hidden = true;

        grupoSeleccionado = null;

        mostrarGrupos();
        mostrarMensaje("Grupo eliminado correctamente.");

    } else {

        mostrarMensaje(
            "No fue posible eliminar el grupo.",
            "error"
        );

    }
}

// ==========================================
// ADMINISTRAR ESTUDIANTES
// ==========================================

// Abrir estudiantes de un grupo
function abrirEstudiantes(id) {

    const grupo = obtenerGrupos().find(function (item) {
        return item.id === id;
    });

    if (!grupo) {
        mostrarMensaje("No se encontró el grupo.", "error");
        return;
    }

    grupoSeleccionado = id;

    document.getElementById("nombreGrupoSeleccionado")
        .textContent = grupo.nombre + " - " + grupo.materia;

    document.getElementById("seccionFormulario").hidden = true;
    document.getElementById("seccionEstudiantes").hidden = false;

    limpiarFormularioEstudiante();
    mostrarEstudiantes();

    document.getElementById("seccionEstudiantes")
        .scrollIntoView({ behavior: "smooth" });
}

// Mostrar estudiantes del grupo
function mostrarEstudiantes() {

    if (!grupoSeleccionado) {
        return;
    }

    const estudiantes = obtenerEstudiantesPorGrupo(grupoSeleccionado);

    const tabla = document.getElementById("tablaEstudiantes");
    const mensajeVacio = document.getElementById("sinEstudiantes");

    tabla.innerHTML = "";

    mensajeVacio.hidden = estudiantes.length > 0;

    estudiantes.forEach(function (estudiante, indice) {

        const fila = document.createElement("tr");

        const nombreCompleto =
            estudiante.nombre + " " + estudiante.apellido;

        const encargado =
            estudiante.nombreEncargado + " " +
            estudiante.apellidoEncargado;

        const datos = [
            indice + 1,
            nombreCompleto,
            encargado,
            estudiante.correoEncargado
        ];

        datos.forEach(function (dato) {

            const celda = document.createElement("td");
            celda.textContent = dato;
            fila.appendChild(celda);

        });

        const acciones = document.createElement("td");

        const btnEditar = crearBoton(
            "Editar",
            "boton-contorno",
            function () {
                editarEstudiante(estudiante.id);
            }
        );

        const btnEliminar = crearBoton(
            "Eliminar",
            "boton-peligro",
            function () {
                confirmarEliminarEstudiante(estudiante.id);
            }
        );

        acciones.appendChild(btnEditar);
        acciones.appendChild(btnEliminar);

        fila.appendChild(acciones);
        tabla.appendChild(fila);

    });

    // Actualizar cantidad de estudiantes en la tabla de grupos
    mostrarGrupos();
}

// Guardar estudiante
function guardarEstudiante(evento) {

    evento.preventDefault();

    if (!grupoSeleccionado) {

        mostrarMensaje(
            "Primero debe seleccionar un grupo.",
            "error"
        );

        return;
    }

    const id = document.getElementById("idEstudiante").value;

    const nombre = document.getElementById("nombreEstudiante")
        .value.trim();

    const apellido = document.getElementById("apellidoEstudiante")
        .value.trim();

    const nombreEncargado = document.getElementById("nombreEncargado")
        .value.trim();

    const apellidoEncargado = document.getElementById("apellidoEncargado")
        .value.trim();

    const correoEncargado = document.getElementById("correoEncargado")
        .value.trim();

    if (!nombre || !apellido || !nombreEncargado ||
        !apellidoEncargado || !correoEncargado) {

        mostrarMensaje(
            "Complete todos los datos del estudiante.",
            "error"
        );

        return;
    }

    const datosEstudiante = {
        grupoId: grupoSeleccionado,
        nombre: nombre,
        apellido: apellido,
        nombreEncargado: nombreEncargado,
        apellidoEncargado: apellidoEncargado,
        correoEncargado: correoEncargado
    };

    let guardado = false;

    if (id === "") {

        guardado = agregarEstudiante(datosEstudiante) !== null;

    } else {

        guardado = actualizarEstudiante(id, datosEstudiante);

    }

    if (!guardado) {

        mostrarMensaje(
            "No fue posible guardar el estudiante.",
            "error"
        );

        return;
    }

    limpiarFormularioEstudiante();
    mostrarEstudiantes();

    mostrarMensaje("Estudiante guardado correctamente.");
}

// Editar estudiante
function editarEstudiante(id) {

    const estudiante = obtenerEstudiantesPorGrupo(
        grupoSeleccionado
    ).find(function (item) {
        return item.id === id;
    });

    if (!estudiante) {
        mostrarMensaje("No se encontró el estudiante.", "error");
        return;
    }

    document.getElementById("idEstudiante").value = estudiante.id;

    document.getElementById("nombreEstudiante")
        .value = estudiante.nombre;

    document.getElementById("apellidoEstudiante")
        .value = estudiante.apellido;

    document.getElementById("nombreEncargado")
        .value = estudiante.nombreEncargado;

    document.getElementById("apellidoEncargado")
        .value = estudiante.apellidoEncargado;

    document.getElementById("correoEncargado")
        .value = estudiante.correoEncargado;

    document.getElementById("btnGuardarEstudiante")
        .textContent = "Actualizar estudiante";
}

// Eliminar estudiante
function confirmarEliminarEstudiante(id) {

    const confirmar = confirm(
        "¿Está seguro de eliminar este estudiante?"
    );

    if (!confirmar) {
        return;
    }

    if (eliminarEstudiante(id)) {

        limpiarFormularioEstudiante();
        mostrarEstudiantes();

        mostrarMensaje("Estudiante eliminado correctamente.");

    } else {

        mostrarMensaje(
            "No fue posible eliminar el estudiante.",
            "error"
        );

    }
}

// Limpiar formulario de estudiante
function limpiarFormularioEstudiante() {

    document.getElementById("formEstudiante").reset();

    document.getElementById("idEstudiante").value = "";

    document.getElementById("btnGuardarEstudiante")
        .textContent = "Guardar estudiante";
}

// Cerrar administración de estudiantes
function cerrarEstudiantes() {

    grupoSeleccionado = null;

    document.getElementById("seccionEstudiantes").hidden = true;

    mostrarGrupos();
}
