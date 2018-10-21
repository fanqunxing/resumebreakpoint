<?php
    header("Content-type:text/html;charset=utf-8");
    if ($_FILES["file"]["error"] > 0) {
        echo "错误：" . $_FILES["file"]["error"] . "<br>";
    } else {
//        var_dump($_FILES);exit;
        $filename = $_POST["filename"];
        $FileDir = dirname(__FILE__)."/temp";
        if (!is_dir($FileDir)) mkdir($FileDir,0777);
        $isSuccess = move_uploaded_file($_FILES['file']['tmp_name'], $FileDir.DIRECTORY_SEPARATOR.$filename);
        if (!$isSuccess) {
            echo "file upload  failed";
        }
    }
