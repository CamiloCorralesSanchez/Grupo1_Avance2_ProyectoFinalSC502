// ==========================================
// ALMACENAMIENTO DE DATOS
// Proyecto SC-502
// ==========================================

// Claves para guardar la información en el navegador
const CLAVE_GRUPOS = "sc502_grupos";
const CLAVE_ESTUDIANTES = "sc502_estudiantes";
const CLAVE_CALIFICACIONES = "sc502_calificaciones";
const CLAVE_ASISTENCIAS = "sc502_asistencias";

// ==========================================
// FUNCIONES GENERALES
// ==========================================

// Obtener información guardada
function obtenerDatos(clave) {
    try {
        const datos = localStorage.getItem(clave);

        if (datos === null) {
            return [];
        }

        const resultado = JSON.parse(datos);

        return Array.isArray(resultado) ? resultado : [];

    } catch (error) {
        console.error("Error al leer los datos:", error);
        return [];
    }
}

// Guardar información
function guardarDatos(clave, datos) {
    try {
        localStorage.setItem(clave, JSON.stringify(datos));
        return true;

    } catch (error) {
        console.error("Error al guardar los datos:", error);
        return false;
    }
}

// Generar un identificador único
function generarId() {
    return Date.now().toString() + "-" +
           Math.random().toString(36).substring(2, 9);
}

// ==========================================
// FUNCIONES PARA GRUPOS
// ==========================================

// Obtener todos los grupos
function obtenerGrupos() {
    return obtenerDatos(CLAVE_GRUPOS);
}

// Guardar un grupo nuevo
function agregarGrupo(grupo) {
    const grupos = obtenerGrupos();

    grupo.id = generarId();

    grupos.push(grupo);

    if (guardarDatos(CLAVE_GRUPOS, grupos)) {
        return grupo;
    }

    return null;
}

// Actualizar un grupo existente
function actualizarGrupo(id, datosActualizados) {
    const grupos = obtenerGrupos();

    const posicion = grupos.findIndex(
        grupo => grupo.id === id
    );

    if (posicion === -1) {
        return false;
    }

    grupos[posicion] = {
        ...grupos[posicion],
        ...datosActualizados,
        id: id
    };

    return guardarDatos(CLAVE_GRUPOS, grupos);
}

// Eliminar un grupo
function eliminarGrupo(id) {
    const grupos = obtenerGrupos();

    const nuevosGrupos = grupos.filter(
        grupo => grupo.id !== id
    );

    if (nuevosGrupos.length === grupos.length) {
        return false;
    }

    // Primero guardamos el listado actualizado
    if (!guardarDatos(CLAVE_GRUPOS, nuevosGrupos)) {
        return false;
    }

    // Eliminamos las relaciones de ese grupo
    const estudiantes = obtenerEstudiantes().filter(
        estudiante => estudiante.grupoId !== id
    );

    guardarDatos(CLAVE_ESTUDIANTES, estudiantes);

    const calificaciones = obtenerCalificaciones().filter(
        calificacion => calificacion.grupoId !== id
    );

    guardarDatos(CLAVE_CALIFICACIONES, calificaciones);

    const asistencias = obtenerAsistencias().filter(
        asistencia => asistencia.grupoId !== id
    );

    guardarDatos(CLAVE_ASISTENCIAS, asistencias);

    return true;
}

// ==========================================
// FUNCIONES PARA ESTUDIANTES
// ==========================================

// Obtener todos los estudiantes
function obtenerEstudiantes() {
    return obtenerDatos(CLAVE_ESTUDIANTES);
}

// Obtener estudiantes de un grupo
function obtenerEstudiantesPorGrupo(grupoId) {
    return obtenerEstudiantes().filter(
        estudiante => estudiante.grupoId === grupoId
    );
}

// Agregar un estudiante
function agregarEstudiante(estudiante) {
    const estudiantes = obtenerEstudiantes();

    estudiante.id = generarId();

    estudiantes.push(estudiante);

    if (guardarDatos(CLAVE_ESTUDIANTES, estudiantes)) {
        return estudiante;
    }

    return null;
}

// Actualizar un estudiante
function actualizarEstudiante(id, datosActualizados) {
    const estudiantes = obtenerEstudiantes();

    const posicion = estudiantes.findIndex(
        estudiante => estudiante.id === id
    );

    if (posicion === -1) {
        return false;
    }

    estudiantes[posicion] = {
        ...estudiantes[posicion],
        ...datosActualizados,
        id: id
    };

    return guardarDatos(CLAVE_ESTUDIANTES, estudiantes);
}

// Eliminar un estudiante
function eliminarEstudiante(id) {
    const estudiantes = obtenerEstudiantes();

    const nuevosEstudiantes = estudiantes.filter(
        estudiante => estudiante.id !== id
    );

    if (nuevosEstudiantes.length === estudiantes.length) {
        return false;
    }

    if (!guardarDatos(CLAVE_ESTUDIANTES, nuevosEstudiantes)) {
        return false;
    }

    // Eliminar sus calificaciones y asistencias
    const calificaciones = obtenerCalificaciones().filter(
        calificacion => calificacion.estudianteId !== id
    );

    guardarDatos(CLAVE_CALIFICACIONES, calificaciones);

    const asistencias = obtenerAsistencias().filter(
        asistencia => asistencia.estudianteId !== id
    );

    guardarDatos(CLAVE_ASISTENCIAS, asistencias);

    return true;
}

// ==========================================
// FUNCIONES PARA CALIFICACIONES
// ==========================================

// Obtener todas las calificaciones
function obtenerCalificaciones() {
    return obtenerDatos(CLAVE_CALIFICACIONES);
}

// Obtener calificaciones de un grupo
function obtenerCalificacionesPorGrupo(grupoId) {
    return obtenerCalificaciones().filter(
        calificacion => calificacion.grupoId === grupoId
    );
}

// Guardar una calificación
function agregarCalificacion(calificacion) {
    const calificaciones = obtenerCalificaciones();

    calificacion.id = generarId();

    calificaciones.push(calificacion);

    return guardarDatos(
        CLAVE_CALIFICACIONES,
        calificaciones
    );
}

// ==========================================
// FUNCIONES PARA ASISTENCIA
// ==========================================

// Obtener todas las asistencias
function obtenerAsistencias() {
    return obtenerDatos(CLAVE_ASISTENCIAS);
}

// Obtener asistencias de un grupo
function obtenerAsistenciasPorGrupo(grupoId) {
    return obtenerAsistencias().filter(
        asistencia => asistencia.grupoId === grupoId
    );
}

// Guardar un registro de asistencia
function agregarAsistencia(asistencia) {
    const asistencias = obtenerAsistencias();

    asistencia.id = generarId();

    asistencias.push(asistencia);

    return guardarDatos(
        CLAVE_ASISTENCIAS,
        asistencias
    );
}