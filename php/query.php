<?php 

$hostdir= iconv("utf-8","gbk", getcwd().'\\temp\\') ;
$filesnames = scandir($hostdir); 
// 接收MD5码
$md5 = $_POST["md5"];

foreach ($filesnames as $name) {
	// 文件存储格式： test.zip-03-dfkjdfjdsfkjdskjfd
	// 即 文件名称-文件序号-文件md5
	$string_arr = explode("-", $name);
	$nameMd5 = $string_arr[2];
	if ($nameMd5 == $md5) {
		// 存在文件
        var_dump($nameMd5);
		echo "1";
		return;
	}
}
// 不存在
echo "0";
?>