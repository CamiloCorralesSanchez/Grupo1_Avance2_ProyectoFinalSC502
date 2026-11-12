
<?php

require_once "../estudiantes/datos.php";

// Obtener el ID enviado desde el listado
$id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;

// Buscar al estudiante seleccionado
$estudiante = null;

foreach ($_SESSION["estudiantes"] as $registro) {
    if ($registro["id"] === $id) {
        $estudiante = $registro;
        break;
    }
}

// Si no existe, regresar al listado
if ($estudiante === null) {
    header("Location: ../estudiantes/index.php");
    exit;
}

// Obtener datos del estudiante
$nombreCompleto = $estudiante["nombre"] . " " .
                  $estudiante["apellidos"];

$fechaNacimiento = $estudiante["fecha_nacimiento"] ?? "No registrada";
$telefono = $estudiante["telefono"] ?? "No registrado";
$correo = $estudiante["correo"] ?? "No registrado";
// Inicializar notas personalizadas
if (!isset($_SESSION["notas_personalizadas"])) {
    $_SESSION["notas_personalizadas"] = [];
}

if (!isset($_SESSION["notas_personalizadas"][$id])) {
    $_SESSION["notas_personalizadas"][$id] = [];
}

// Procesar nueva nota personalizada
if (
    $_SERVER["REQUEST_METHOD"] === "POST" &&
    isset($_POST["nota_personalizada"])
) {
    $contenido = trim($_POST["nota_personalizada"]);

    if ($contenido !== "") {
        $_SESSION["notas_personalizadas"][$id][] = [
            "contenido" => $contenido,
            "fecha" => date("Y-m-d H:i")
        ];

        header("Location: index.php?id=" . $id . "&nota=1");
        exit;
    }
}

$notasPersonalizadas = $_SESSION["notas_personalizadas"][$id];

// Inicializar el historial de alertas
if (!isset($_SESSION["alertas"])) {
    $_SESSION["alertas"] = [];
}

// Obtener las alertas del estudiante
if (!isset($_SESSION["alertas"][$id])) {
    $_SESSION["alertas"][$id] = [];
}

$alertas = $_SESSION["alertas"][$id];

// Procesar el envío de una alerta
if ($_SERVER["REQUEST_METHOD"] === "POST"
    && isset($_POST["mensaje_alerta"])) {

    $mensaje = trim($_POST["mensaje_alerta"]);

    if ($mensaje !== "") {

        $_SESSION["alertas"][$id][] = [
            "mensaje" => $mensaje,
            "fecha" => date("Y-m-d H:i"),
            "estado" => "Enviada"
        ];

        header("Location: index.php?id=" . $id . "&alerta=1");
        exit;
    }
}

// Datos académicos de ejemplo
$asistencias = [
    ["fecha" => "2026-11-02", "estado" => "Presente"],
    ["fecha" => "2026-11-03", "estado" => "Ausente"],
    ["fecha" => "2026-11-04", "estado" => "Presente"],
    ["fecha" => "2026-11-05", "estado" => "Tardía"],
    ["fecha" => "2026-11-06", "estado" => "Presente"]
];

$notas = [
    ["materia" => "Matemáticas", "evaluacion" => "Examen 1", "nota" => 85],
    ["materia" => "Español", "evaluacion" => "Tarea 1", "nota" => 92],
    ["materia" => "Ciencias", "evaluacion" => "Proyecto", "nota" => 88]
];

?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Ficha del estudiante</title>

    <link rel="stylesheet" href="../css/estudiantes.css">
</head>

<body>

<main class="contenedor-estudiantes">

    <!-- Encabezado -->
    <section class="encabezado-modulo">

        <div>
            <p class="etiqueta">ADMINISTRACIÓN ACADÉMICA</p>

            <h1>Ficha del estudiante</h1>

            <p>Consulta la información personal y académica del estudiante.</p>
        </div>

        <a href="../estudiantes/index.php" class="boton boton-limpiar">
            Volver a estudiantes
        </a>

    </section>

    <!-- Información personal -->
    <section class="panel-estudiantes ficha-personal">

        <div class="titulo-panel">
            <h2><?php echo limpiar($nombreCompleto); ?></h2>
            <p>Información general del estudiante</p>
        </div>

        <div class="informacion-grid">

            <div class="dato-ficha">
                <span>Identificación</span>
                <strong><?php echo limpiar($estudiante["identificacion"]); ?></strong>
            </div>

            <div class="dato-ficha">
                <span>Grupo</span>
                <strong><?php echo limpiar($estudiante["grupo"]); ?></strong>
            </div>

            <div class="dato-ficha">
                <span>Fecha de nacimiento</span>
                <strong><?php echo limpiar($fechaNacimiento); ?></strong>
            </div>

            <div class="dato-ficha">
                <span>Estado</span>
                <strong><?php echo limpiar($estudiante["estado"]); ?></strong>
            </div>

            <div class="dato-ficha">
                <span>Encargado</span>
                <strong><?php echo limpiar($estudiante["encargado"]); ?></strong>
            </div>

            <div class="dato-ficha">
                <span>Teléfono del encargado</span>
                <strong><?php echo limpiar($telefono); ?></strong>
            </div>

            <div class="dato-ficha">
                <span>Correo del encargado</span>
                <strong><?php echo limpiar($correo); ?></strong>
            </div>

        </div>

    </section>

    <!-- Asistencia y notas -->
    <div class="secciones-ficha">

        <section class="panel-estudiantes">

            <h2>Control de asistencia</h2>
            <p class="descripcion-ficha">Historial de asistencia del estudiante.</p>

            <div class="tabla-contenedor">

                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Estado</th>
                        </tr>
                    </thead>

                    <tbody>

                        <?php foreach ($asistencias as $asistencia): ?>

                            <tr>
                                <td><?php echo limpiar($asistencia["fecha"]); ?></td>
                                <td><?php echo limpiar($asistencia["estado"]); ?></td>
                            </tr>

                        <?php endforeach; ?>

                    </tbody>
                </table>

            </div>

        </section>

        <section class="panel-estudiantes">

            <h2>Notas académicas</h2>
            <p class="descripcion-ficha">Resultados de las evaluaciones.</p>

            <div class="tabla-contenedor">

                <table>
                    <thead>
                        <tr>
                            <th>Materia</th>
                            <th>Evaluación</th>
                            <th>Nota</th>
                        </tr>
                    </thead>

                    <tbody>

                        <?php foreach ($notas as $nota): ?>

                            <tr>
                                <td><?php echo limpiar($nota["materia"]); ?></td>
                                <td><?php echo limpiar($nota["evaluacion"]); ?></td>
                                <td><?php echo limpiar($nota["nota"]); ?></td>
                            </tr>

                        <?php endforeach; ?>

                    </tbody>
                </table>

            </div>

        </section>

    </div>

<!-- Historial de alertas -->

<section class="panel-estudiantes panel-alertas">

    <div class="titulo-panel">
        <h2>Historial de alertas</h2>
        <p>Consulta y registra las alertas del encargado.</p>
    </div>

    <form method="POST" class="formulario-alerta">

        <div class="campo-formulario">
            <label for="mensaje_alerta">Mensaje de la alerta</label>

            <textarea
                id="mensaje_alerta"
                name="mensaje_alerta"
                rows="4"
                placeholder="Escribe el motivo de la alerta..."
                required></textarea>
        </div>

        <div class="botones-formulario">
            <button type="submit" class="boton boton-principal">
                Registrar alerta
            </button>
        </div>

    </form>

    <h3>Alertas registradas</h3>

    <?php if (empty($alertas)): ?>

        <p class="descripcion-ficha">
            Este estudiante todavía no tiene alertas registradas.
        </p>

    <?php else: ?>

        <div class="tabla-contenedor">

            <table>
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Mensaje</th>
                        <th>Estado</th>
                    </tr>
                </thead>

                <tbody>

                    <?php foreach (array_reverse($alertas) as $alerta): ?>

                        <tr>
                            <td><?php echo limpiar($alerta["fecha"]); ?></td>

                            <td><?php echo limpiar($alerta["mensaje"]); ?></td>

                            <td>
                                <span class="estado-alerta">
                                    <?php echo limpiar($alerta["estado"]); ?>
                                </span>
                            </td>
                        </tr>

                    <?php endforeach; ?>

                </tbody>
            </table>

        </div>

    <?php endif; 

?>

</section>

<!-- Notas personalizadas -->

<section class="panel-estudiantes panel-alertas">

    <h2>Notas personalizadas</h2>

    <p class="descripcion-ficha">
        Registra observaciones particulares sobre el estudiante.
    </p>

    <form method="POST" class="formulario-alerta">

        <div class="campo-formulario">
            <label for="nota_personalizada">
                Nueva observación
            </label>

            <textarea
                id="nota_personalizada"
                name="nota_personalizada"
                rows="4"
                placeholder="Escribe una observación..."
                required></textarea>
        </div>

        <div class="botones-formulario">
            <button type="submit" class="boton boton-principal">
                Guardar observación
            </button>
        </div>

    </form>

    <h3>Observaciones registradas</h3>

    <?php if (empty($notasPersonalizadas)): ?>

        <p class="descripcion-ficha">
            No hay observaciones registradas.
        </p>

    <?php else: ?>

        <div class="tabla-contenedor">
            <table>
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Observación</th>
                    </tr>
                </thead>

                <tbody>
                    <?php foreach (array_reverse($notasPersonalizadas) as $nota): ?>
                        <tr>
                            <td><?php echo limpiar($nota["fecha"]); ?></td>
                            <td><?php echo limpiar($nota["contenido"]); ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>

    <?php endif; ?>

</section>

</main>

</body>
</html>
