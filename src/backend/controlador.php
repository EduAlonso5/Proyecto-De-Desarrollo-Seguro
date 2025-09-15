<?php

if(!empty($_POST["btningresar"])){
    if (empty ($_POST["usuario"]) or empty ($_POST["password"])) {
        echo "<script>
        alert('Los campos estan vacios');
        window.location = 'login.php';
        </script>";
    } else {
        $usuario = $_POST["usuario"];
        $password = $_POST["password"];

        $consulta = mysqli_query($conexion, "SELECT * FROM usuarios WHERE usuario = '$usuario' and password = '$password' ");
        $num_rows = mysqli_num_rows($consulta);
 
        if ($datos=$sql ->fetch_object()) {
            header("location: index.php");
        } else {
            echo "<script>
            alert('Los datos son incorrectos');
            window.location = 'login.php';
            </script>";
        }
    }
    
}



?>