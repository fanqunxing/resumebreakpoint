<?php 

$hostdir= iconv("utf-8","gbk", getcwd().'\\temp\\') ;
$filesnames = scandir($hostdir);

foreach ($filesnames as $name) {
    if (in_array($name,array('.','..'))) continue;
	$cipath = $hostdir.$name;
	var_dump($cipath);
	$str = file_get_contents($cipath);
	file_put_contents(getcwd().'\\temp\\111.zip',$str,FILE_APPEND);
}
