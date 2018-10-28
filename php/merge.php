<?php 

//$hostdir= iconv("utf-8","gbk", getcwd().'\\temp\\') ;
//$filesnames = scandir($hostdir);
////exit;
//
//
//foreach ($filesnames as $name) {
//    if (in_array($name,array('.','..'))) continue;
//
//
//	$cipath = $hostdir.$name;
//	var_dump($cipath);
//	$str = file_get_contents($cipath);
//	file_put_contents(getcwd().'\\temp\\111.zip',$str,FILE_APPEND);
//}

$FileDir = dirname(__FILE__)."/temp";
$stockFileInfo = 'fileInfo.txt';
$fileInfo = file_get_contents($FileDir.DIRECTORY_SEPARATOR.$stockFileInfo);
$fileInfoArrs = json_decode($fileInfo,true);


foreach ($fileInfoArrs as $key => $fileInfoArr) {
    $arr[$fileInfoArr['index']] =  $key;
}

ksort($arr);

$createFileStockLocation = './fileStock';

if (!is_dir($createFileStockLocation)) {
    mkdir($createFileStockLocation);
}

// 生成文件;
foreach ($arr as $index => $value) {
    $tmpFileName = $FileDir.DIRECTORY_SEPARATOR.$fileInfoArrs[$value]['fileName'].$fileInfoArrs[$value]['index'].$fileInfoArrs[$value]['md5'] ;
    file_put_contents($createFileStockLocation.DIRECTORY_SEPARATOR.$fileInfoArrs[0]['fileName'],$tmpFileName,true);

}







