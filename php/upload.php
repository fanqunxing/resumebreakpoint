<?php 
if ($_FILES["file"]["error"] > 0)
{
    echo "错误：" . $_FILES["file"]["error"] . "<br>";
}
else
{
	$filename = $_POST["md5"];
	move_uploaded_file(
		$_FILES['file']['tmp_name'],
	 	getcwd()."/temp/".$filename
	);
}
 ?>