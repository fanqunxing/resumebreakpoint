<?php
    header("Content-type:text/html;charset=utf-8");
    if ($_FILES["file"]["error"] > 0) {
        echo "错误：" . $_FILES["file"]["error"] . "<br>";
    } else {
        $filename = $_POST["filename"];
        $pattren =  '/[\x{4e00}-\x{9fa5}]/u';
        if (preg_match($pattren,$filename)) { //文件名存在中文字符不让提交;
            exit('存在中文字符，不合法的文件名');
        }
        $FileDir = dirname(__FILE__)."/temp";
        if (!is_dir($FileDir)) mkdir($FileDir,0777);
        $isSuccess = move_uploaded_file($_FILES['file']['tmp_name'], $FileDir.DIRECTORY_SEPARATOR.$filename);
        if (!$isSuccess) {
            exit("文件上传失败");
        }

    }
