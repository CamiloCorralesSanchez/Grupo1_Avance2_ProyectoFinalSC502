
<?php

require_once "datos.php";

// Obtener los filtros enviados desde el formulario
$busqueda = trim($_GET["busqueda"] ?? "");
$grupoSeleccionado = $_GET["grupo"] ?? "";

// Filtrar estudiantes
$estudiantesFiltrados = array_filter(
    $estudiantes,
    function ($estudiante) use ($busqueda, $grupoSeleccionado) {

        $nombreCompleto = $estudiante["nombre"] . " " .
                          $estudiante["apellidos"];

        $coincideBusqueda =
            $busqueda === "" ||
            stripos($nombreCompleto, $busqueda) !== false ||
            stripos($estudiante["identificacion"], $busqueda) !== false;

        $coincideGrupo =
            $grupoSeleccionado === "" ||
            $estudiante["grupo"] === $grupoSeleccionado;

        return $coincideBusqueda && $coincideGrupo;
    }
);

// Obtener los filtros enviados desde el formulario
$busqueda = trim($_GET["busqueda"] ?? "");
$grupoSeleccionado = $_GET["grupo"] ?? "";

// Filtrar estudiantes
$estudiantesFiltrados = array_filter(
    $estudiantes,
    function ($estudiante) use ($busqueda, $grupoSeleccionado) {

        $nombreCompleto = $estudiante["nombre"] . " " .
                          $estudiante["apellidos"];

        $coincideBusqueda =
            $busqueda === "" ||
            stripos($nombreCompleto, $busqueda) !== false ||
            stripos($estudiante["identificacion"], $busqueda) !== false;

        $coincideGrupo =
            $grupoSeleccionado === "" ||
            $estudiante["grupo"] === $grupoSeleccionado;

        return $coincideBusqueda && $coincideGrupo;
    }
);

?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de estudiantes</title>
    <link rel="stylesheet" href="../css/estudiantes.css">
</head>

<body>

<main class="contenedor-estudiantes">

    <section class="encabezado-modulo">
        <div>
            <p class="etiqueta">ADMINISTRACIÓN ACADÉMICA</p>
            <h1>Gestión de estudiantes</h1>
            <p>Administra la información de los estudiantes y sus encargados.</p>
        </div>

        <a href="agregar.php" class="boton boton-principal">
            + Agregar estudiante
        </a>
    </section>

    <section class="resumen-estudiantes">
        <div class="tarjeta-resumen">
            <span>Total de estudiantes</span>
            <strong><?php echo count($estudiantes); ?></strong>
        </div>

        <div class="tarjeta-resumen">
            <span>Estudiantes encontrados</span>
            <strong><?php echo count($estudiantesFiltrados); ?></strong>
        </div>

        <div class="tarjeta-resumen">
            <span>Grupos disponibles</span>
            <strong>3</strong>
        </div>
    </section>

    <section class="panel-estudiantes">

        <div class="titulo-panel">
            <h2>Listado de estudiantes</h2>
            <p>Consulta y administra los registros.</p>
        </div>

        <form method="GET" action="index.php" class="formulario-filtros">

            <div class="campo-busqueda">
                <label for="busqueda">Buscar estudiante</label>
                <input
                    type="text"
                    id="busqueda"
                    name="busqueda"
                    placeholder="Nombre o identificación"
                    value="<?php echo limpiar($busqueda); ?>"
                >
            </div>

            <div class="campo-grupo">
                <label for="grupo">Seleccionar grupo</label>
                <select name="grupo" id="grupo">
                    <option value="">Todos los grupos</option>
                    <option value="7-A" <?php echo $grupoSeleccionado === "7-A" ? "selected" : ""; ?>>7-A</option>
                    <option value="7-B" <?php echo $grupoSeleccionado === "7-B" ? "selected" : ""; ?>>7-B</option>
                    <option value="8-A" <?php echo $grupoSeleccionado === "8-A" ? "selected" : ""; ?>>8-A</option>
                </select>
            </div>

            <button type="submit" class="boton boton-buscar">
                Buscar
            </button>

            <a href="index.php" class="boton boton-limpiar">
                Limpiar
            </a>

        </form>

        <div class="tabla-contenedor">
            <table>
                <thead>
                    <tr>
                        <th>Estudiante</th>
                        <th>Identificación</th>
                        <th>Grupo</th>
                        <th>Encargado</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    <?php if (count($estudiantesFiltrados) > 0): ?>

                        <?php foreach ($estudiantesFiltrados as $estudiante): ?>

                            <tr>
                                <td>
                                    <strong>
                                        <?php echo limpiar($estudiante["nombre"] . " " . $estudiante["apellidos"]); ?>
                                    </strong>
                                </td>

                                <td><?php echo limpiar($estudiante["identificacion"]); ?></td>

                                <td><?php echo limpiar($estudiante["grupo"]); ?></td>

                                <td><?php echo limpiar($estudiante["encargado"]); ?></td>

                                <td>
                                    <span class="estado-activo">
                                        <?php echo limpiar($estudiante["estado"]); ?>
                                    </span>
                                </td>

                                    
                                    <td class="acciones">

                                <a href="../ficha_estudiante/index.php?id=<?php echo $estudiante["id"]; ?>">
        Ver ficha
                                </a>

                                    <a href="editar.php?id=<?php echo $estudiante["id"]; ?>">
        Editar
                                    </a>

                                        <form action="eliminar.php" method="POST"
                                style="display:inline;"
                                onsubmit="return confirm('¿Estás seguro de eliminar este estudiante?');">

                                <input type="hidden" name="id"
                                value="<?php echo $estudiante["id"]; ?>">

                                <button type="submit" class="boton-eliminar">
            Eliminar
                            </button>

                                </form>

                </td>


                            </tr>

                        <?php endforeach; ?>

                    <?php else: ?>

                        <tr>
                            <td colspan="6" class="sin-resultados">
                                No se encontraron estudiantes.
                            </td>
                        </tr>

                    <?php endif; ?>
                </tbody>
            </table>
        </div>

    </section>

</main>

</body>
</html>
