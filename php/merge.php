<?php 

$FileDir = dirname(__FILE__)."/temp";
$stockFileInfo = 'fileInfo.txt';

$filesnames = scandir($FileDir);

$mergeFilename = $_POST['filename'];  //上传的文件名称;

$arr = array();
foreach ($filesnames as $filesName) {
    if (!in_array($filesName,['.','..',$stockFileInfo],true)) {
       $indexArr = explode(',',$filesName);
        $arr[$indexArr[0]] = $filesName;
    }
}

ksort($arr);

$createFileStockLocation = './fileStock';

if (!is_dir($createFileStockLocation)) {
    mkdir($createFileStockLocation);
}

$fp = fopen($createFileStockLocation.DIRECTORY_SEPARATOR.$mergeFilename,"ab");

// 生成文件;
foreach ($arr as $index => $md5) {
    $tmpFileName = $FileDir.DIRECTORY_SEPARATOR.$md5 ;

    $handle = fopen($tmpFileName,"rb");

    fwrite($fp,fread($handle,filesize($tmpFileName)));

    fclose($handle);

    unset($handle);
    unlink($tmpFileName);

}
fclose($fp);

#上传成功后，删除文件;










