
<?php
require_once "datos.php";

// Obtener el ID del estudiante
$id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;

// Buscar al estudiante
$indice = null;

foreach ($_SESSION["estudiantes"] as $posicion => $estudiante) {
    if ($estudiante["id"] === $id) {
        $indice = $posicion;
        break;
    }
}

// Si no existe, regresar al listado
if ($indice === null) {
    header("Location: index.php");
    exit;
}

// Obtener los datos actuales
$estudianteActual = $_SESSION["estudiantes"][$indice];

$errores = [];

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $nombre = trim($_POST["nombre"] ?? "");
    $apellidos = trim($_POST["apellidos"] ?? "");
    $identificacion = trim($_POST["identificacion"] ?? "");
    $fechaNacimiento = $_POST["fecha_nacimiento"] ?? "";
    $grupo = $_POST["grupo"] ?? "";
    $encargado = trim($_POST["encargado"] ?? "");
    $telefono = trim($_POST["telefono"] ?? "");
    $correo = trim($_POST["correo"] ?? "");

    // Validar campos obligatorios
    if (
        $nombre === "" ||
        $apellidos === "" ||
        $identificacion === "" ||
        $fechaNacimiento === "" ||
        $grupo === "" ||
        $encargado === ""
    ) {
        $errores[] = "Completa todos los campos obligatorios.";
    }

    // Comprobar que la identificación no esté duplicada
    foreach ($_SESSION["estudiantes"] as $otroEstudiante) {
        if (
            $otroEstudiante["identificacion"] === $identificacion &&
            $otroEstudiante["id"] !== $id
        ) {
            $errores[] = "Esta identificación pertenece a otro estudiante.";
            break;
        }
    }

    // Validar correo electrónico
    if (
        $correo !== "" &&
        !filter_var($correo, FILTER_VALIDATE_EMAIL)
    ) {
        $errores[] = "El correo electrónico no es válido.";
    }

    // Actualizar información
    if (empty($errores)) {

        $_SESSION["estudiantes"][$indice] = [
            "id" => $id,
            "nombre" => $nombre,
            "apellidos" => $apellidos,
            "identificacion" => $identificacion,
            "fecha_nacimiento" => $fechaNacimiento,
            "grupo" => $grupo,
            "encargado" => $encargado,
            "telefono" => $telefono,
            "correo" => $correo,
            "estado" => $estudianteActual["estado"]
        ];

        header("Location: index.php?actualizado=1");
        exit;
    }

    // Mantener los datos escritos si hay errores
    $estudianteActual = [
        "id" => $id,
        "nombre" => $nombre,
        "apellidos" => $apellidos,
        "identificacion" => $identificacion,
        "fecha_nacimiento" => $fechaNacimiento,
        "grupo" => $grupo,
        "encargado" => $encargado,
        "telefono" => $telefono,
        "correo" => $correo,
        "estado" => $estudianteActual["estado"]
    ];
}

?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar estudiante</title>
    <link rel="stylesheet" href="../css/estudiantes.css">
</head>

<body>

<main class="contenedor-estudiantes">

    <section class="encabezado-modulo">
        <div>
            <p class="etiqueta">ADMINISTRACIÓN ACADÉMICA</p>
            <h1>Editar estudiante</h1>
            <p>Actualiza la información del estudiante y su encargado.</p>
        </div>
    </section>

    <?php if (!empty($errores)): ?>
        <div class="mensaje-error">
            <?php foreach ($errores as $error): ?>
                <p><?php echo limpiar($error); ?></p>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>

    <form method="POST"
          action="editar.php?id=<?php echo $id; ?>"
          class="formulario-estudiante">

        <h2>Información del estudiante</h2>

        <div class="campos-grid">

            <div class="campo-formulario">
                <label for="nombre">Nombre *</label>
                <input type="text" id="nombre" name="nombre"
                    value="<?php echo limpiar($estudianteActual["nombre"]); ?>"
                    required>
            </div>

            <div class="campo-formulario">
                <label for="apellidos">Apellidos *</label>
                <input type="text" id="apellidos" name="apellidos"
                    value="<?php echo limpiar($estudianteActual["apellidos"]); ?>"
                    required>
            </div>

            <div class="campo-formulario">
                <label for="identificacion">Identificación *</label>
                <input type="text" id="identificacion" name="identificacion"
                    value="<?php echo limpiar($estudianteActual["identificacion"]); ?>"
                    required>
            </div>

            <div class="campo-formulario">
                <label for="fecha_nacimiento">Fecha de nacimiento *</label>
                <input type="date" id="fecha_nacimiento" name="fecha_nacimiento"
                    value="<?php echo limpiar($estudianteActual["fecha_nacimiento"]); ?>"
                    required>
            </div>

            <div class="campo-formulario">
                <label for="grupo">Grupo *</label>
                <select id="grupo" name="grupo" required>
                    <option value="">Seleccionar grupo</option>

                    <?php foreach (["7-A", "7-B", "8-A"] as $opcion): ?>
                        <option value="<?php echo $opcion; ?>"
                            <?php echo $estudianteActual["grupo"] === $opcion ? "selected" : ""; ?>>
                            <?php echo $opcion; ?>
                        </option>
                    <?php endforeach; ?>

                </select>
            </div>

        </div>

        <h2>Información del encargado</h2>

        <div class="campos-grid">

            <div class="campo-formulario">
                <label for="encargado">Nombre del encargado *</label>
                <input type="text" id="encargado" name="encargado"
                    value="<?php echo limpiar($estudianteActual["encargado"]); ?>"
                    required>
            </div>

            <div class="campo-formulario">
                <label for="telefono">Teléfono</label>
                <input type="tel" id="telefono" name="telefono"
                    value="<?php echo limpiar($estudianteActual["telefono"]); ?>">
            </div>

            <div class="campo-formulario">
                <label for="correo">Correo electrónico</label>
                <input type="email" id="correo" name="correo"
                    value="<?php echo limpiar($estudianteActual["correo"]); ?>">
            </div>

        </div>

        <p class="nota-formulario">
            Los campos marcados con * son obligatorios.
        </p>

        <div class="botones-formulario">
            <a href="index.php" class="boton boton-limpiar">
                Cancelar
            </a>

            <button type="submit" class="boton boton-principal">
                Guardar cambios
            </button>
        </div>

    </form>

</main>

</body>
</html>
