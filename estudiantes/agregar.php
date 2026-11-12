
<?php
require_once "datos.php";

$errores = [];

$nombre = "";
$apellidos = "";
$identificacion = "";
$fechaNacimiento = "";
$grupo = "";
$encargado = "";
$telefono = "";
$correo = "";

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
    if ($nombre === "" || $apellidos === "" ||
        $identificacion === "" || $fechaNacimiento === "" ||
        $grupo === "" || $encargado === "") {

        $errores[] = "Completa todos los campos obligatorios.";
    }

    // Validar identificación duplicada
    foreach ($estudiantes as $estudiante) {
        if ($estudiante["identificacion"] === $identificacion) {
            $errores[] = "Ya existe un estudiante con esa identificación.";
            break;
        }
    }

    // Validar correo cuando se proporciona
    if ($correo !== "" && !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        $errores[] = "El correo electrónico no tiene un formato válido.";
    }

    // Registrar estudiante
    if (empty($errores)) {

        $nuevoEstudiante = [
            "id" => count($estudiantes) > 0
                ? max(array_column($estudiantes, "id")) + 1
                : 1,
            "nombre" => $nombre,
            "apellidos" => $apellidos,
            "identificacion" => $identificacion,
            "fecha_nacimiento" => $fechaNacimiento,
            "grupo" => $grupo,
            "encargado" => $encargado,
            "telefono" => $telefono,
            "correo" => $correo,
            "estado" => "Activo"
        ];

        $_SESSION["estudiantes"][] = $nuevoEstudiante;

        header("Location: index.php?registrado=1");
        exit;
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agregar estudiante</title>
    <link rel="stylesheet" href="../css/estudiantes.css">
</head>

<body>

<main class="contenedor-estudiantes">

    <section class="encabezado-modulo">
        <div>
            <p class="etiqueta">ADMINISTRACIÓN ACADÉMICA</p>
            <h1>Agregar estudiante</h1>
            <p>Completa la información del estudiante y su encargado.</p>
        </div>
    </section>

    <?php if (!empty($errores)): ?>
        <div class="mensaje-error">
            <?php foreach ($errores as $error): ?>
                <p><?php echo limpiar($error); ?></p>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>

    <form method="POST" action="agregar.php" class="formulario-estudiante">

        <h2>Información del estudiante</h2>

        <div class="campos-grid">

            <div class="campo-formulario">
                <label for="nombre">Nombre *</label>
                <input type="text" id="nombre" name="nombre"
                    value="<?php echo limpiar($nombre); ?>" required>
            </div>

            <div class="campo-formulario">
                <label for="apellidos">Apellidos *</label>
                <input type="text" id="apellidos" name="apellidos"
                    value="<?php echo limpiar($apellidos); ?>" required>
            </div>

            <div class="campo-formulario">
                <label for="identificacion">Identificación *</label>
                <input type="text" id="identificacion" name="identificacion"
                    value="<?php echo limpiar($identificacion); ?>" required>
            </div>

            <div class="campo-formulario">
                <label for="fecha_nacimiento">Fecha de nacimiento *</label>
                <input type="date" id="fecha_nacimiento" name="fecha_nacimiento"
                    value="<?php echo limpiar($fechaNacimiento); ?>" required>
            </div>

            <div class="campo-formulario">
                <label for="grupo">Grupo *</label>
                <select id="grupo" name="grupo" required>
                    <option value="">Seleccionar grupo</option>
                    <?php foreach (["7-A", "7-B", "8-A"] as $opcion): ?>
                        <option value="<?php echo $opcion; ?>"
                            <?php echo $grupo === $opcion ? "selected" : ""; ?>>
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
                    value="<?php echo limpiar($encargado); ?>" required>
            </div>

            <div class="campo-formulario">
                <label for="telefono">Teléfono</label>
                <input type="tel" id="telefono" name="telefono"
                    value="<?php echo limpiar($telefono); ?>">
            </div>

            <div class="campo-formulario">
                <label for="correo">Correo electrónico</label>
                <input type="email" id="correo" name="correo"
                    value="<?php echo limpiar($correo); ?>">
            </div>

        </div>

        <p class="nota-formulario">Los campos marcados con * son obligatorios.</p>

        <div class="botones-formulario">
            <a href="index.php" class="boton boton-limpiar">Cancelar</a>
            <button type="submit" class="boton boton-principal">
                Registrar estudiante
            </button>
        </div>

    </form>

</main>

</body>
</html>
