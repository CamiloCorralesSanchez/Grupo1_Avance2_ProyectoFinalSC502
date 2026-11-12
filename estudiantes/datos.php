
<?php

session_start();

// Crear los datos iniciales solamente la primera vez
if (!isset($_SESSION["estudiantes"])) {

    $_SESSION["estudiantes"] = [
        [
            "id" => 1,
            "nombre" => "María",
            "apellidos" => "Rodríguez Vargas",
            "identificacion" => "101230456",
            "fecha_nacimiento" => "2012-05-15",
            "grupo" => "7-A",
            "encargado" => "Carlos Rodríguez",
            "telefono" => "88881111",
            "correo" => "carlos@email.com",
            "estado" => "Activo"
        ],
        [
            "id" => 2,
            "nombre" => "Juan",
            "apellidos" => "Mora Sánchez",
            "identificacion" => "102340567",
            "fecha_nacimiento" => "2012-08-20",
            "grupo" => "7-B",
            "encargado" => "Ana Sánchez",
            "telefono" => "88882222",
            "correo" => "ana@email.com",
            "estado" => "Activo"
        ],
        [
            "id" => 3,
            "nombre" => "Laura",
            "apellidos" => "Jiménez Pérez",
            "identificacion" => "103450678",
            "fecha_nacimiento" => "2012-03-10",
            "grupo" => "7-A",
            "encargado" => "Pedro Jiménez",
            "telefono" => "88883333",
            "correo" => "pedro@email.com",
            "estado" => "Activo"
        ],
        [
            "id" => 4,
            "nombre" => "Andrés",
            "apellidos" => "Castro López",
            "identificacion" => "104560789",
            "fecha_nacimiento" => "2011-11-25",
            "grupo" => "8-A",
            "encargado" => "María López",
            "telefono" => "88884444",
            "correo" => "maria@email.com",
            "estado" => "Activo"
        ]
    ];
}

$estudiantes = $_SESSION["estudiantes"];

function limpiar($valor) {
    return htmlspecialchars((string)$valor, ENT_QUOTES, "UTF-8");
}
