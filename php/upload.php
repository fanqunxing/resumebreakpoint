<?php
    header("Content-type:text/html;charset=utf-8");

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
            $stockAllFileInfoArr = array();
            if (file_exists($FileDir.DIRECTORY_SEPARATOR.$stockFileInfo)) {
                $stockAllFileInfoArr = file_get_contents($FileDir.DIRECTORY_SEPARATOR.$stockFileInfo);
                $stockAllFileInfoArr = json_decode($stockAllFileInfoArr,true);

                foreach ($stockAllFileInfoArr as $simpleFile) {
                    if ($simpleFile['md5'] == $arr['md5']) {
                        if (file_exists('../temp'.DIRECTORY_SEPARATOR.$arr['fileName'])) {
                            unlink('../temp'.DIRECTORY_SEPARATOR.$arr['fileName']);
                        }
                        echo json_encode(array('message'=>'文件已存在不可以重复上传','code'=>0));exit;
                    }
                }
                if (!is_array($stockAllFileInfoArr) || empty($stockAllFileInfoArr)) {
                    $stockAllFileInfoArr[] = $arr;
                    file_put_contents($FileDir.DIRECTORY_SEPARATOR.$stockFileInfo,json_encode($stockAllFileInfoArr));
                } else {
                    $stockAllFileInfoArr[] = $arr;
                    file_put_contents($FileDir.DIRECTORY_SEPARATOR.$stockFileInfo,json_encode($stockAllFileInfoArr));
                }
            } else {
                $stockAllFileInfoArr[] = $arr;
                file_put_contents($FileDir.DIRECTORY_SEPARATOR.$stockFileInfo,json_encode($stockAllFileInfoArr));
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

