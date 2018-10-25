<?php
    header("Content-type:text/html;charset=utf-8");
    //var_dump($_FILES,$_POST);exit;
    //上传的文件名称这种格式可以吗
    //$fileName = "文件名称(fileName)|文件序号(index)|文件MD5(md5码)";
    //比如: 1.txt|2|cdee9e473d48764864028e38936bb62d
    //file: File, filename: "1.text", index: 2, id: 'cdee9e473d48764864028e38936bb62d' }


    if ($_FILES["file"]["error"] > 0) {
        $mes = "错误：" . $_FILES["file"]["error"] . "<br>";
        echo json_encode(array('message'=>$mes,'code'=>0));exit;
    } else {
        $filename = $_POST["filename"];
        $pattren =  '/[\x{4e00}-\x{9fa5}]/u';
        if (preg_match($pattren,$filename)) { //文件名存在中文字符不让提交;
            $mes = '存在中文字符，不合法的文件名';
            echo json_encode(array('message'=>$mes,'code'=>0));exit;
        }
        $FileDir = dirname(__FILE__)."/temp";
        if (!is_dir($FileDir)) mkdir($FileDir,0777);
        if (!empty($_POST)) {
            if (count($_POST) != 3) { echo json_encode(array('message'=>'post不合法','code'=>0));exit; }

            $arr = array(
                'fileName'  => $_POST['filename'],
                'index'     => $_POST['index'],
                'md5'       => $_POST['id'],
            );
            $stockFileInfo = 'fileInfo.txt';
            if (file_exists($FileDir.DIRECTORY_SEPARATOR.$stockFileInfo)) {

            } else {
                file_put_contents($FileDir.DIRECTORY_SEPARATOR.$stockFileInfo,json_encode($arr));
            }
        }


        $isSuccess = move_uploaded_file($_FILES['file']['tmp_name'], $FileDir.DIRECTORY_SEPARATOR.$filename);
        if (!$isSuccess) {
            $mes = '文件上传失败';
            echo json_encode(array('message'=>$mes,'code'=>0));exit;
        } else {
            $mes = '文件上传成功';
            echo json_encode(array('message'=>$mes,'code'=>1));exit;
        }
    }

