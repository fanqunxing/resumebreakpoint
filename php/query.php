<?php 

$hostdir= iconv("utf-8","gbk", getcwd().'\\temp\\') ;
$filesnames = scandir($hostdir); 
// 接收MD5码
$md5 = $_POST["md5"];
$stockFileInfo = 'fileInfo.txt';

if (file_exists($filesnames.$stockFileInfo)) {
    $fileInfos = json_decode(file_get_contents($filesnames.$stockFileInfo));
    foreach ($fileInfos as $fileInfo) {
        if ($md5 == $fileInfo['md5']) {
            echo json_encode(array('message'=>'相同文件已经上传过了','code'=>1));exit;
        }else {
            echo json_encode(array('message'=>'文件还没有上传','code'=>0));exit;
        }
    }
}


