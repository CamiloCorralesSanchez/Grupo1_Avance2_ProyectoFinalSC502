
<?php

require_once "datos.php";

// Verificar que la solicitud sea POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $id = isset($_POST["id"]) ? (int)$_POST["id"] : 0;

    // Buscar al estudiante
    foreach ($_SESSION["estudiantes"] as $indice => $estudiante) {

        if ($estudiante["id"] === $id) {

            // Eliminar el estudiante
            unset($_SESSION["estudiantes"][$indice]);

            // Reorganizar los índices del arreglo
            $_SESSION["estudiantes"] = array_values(
                $_SESSION["estudiantes"]
            );

            break;
        }
    }
}
header("Location: index.php?eliminado=1");
exit;

?>
