<?php 
        //if ($_POST['entry_key'] === 'fd') {
        $name = $_POST['entry_398176575'];
        $eventcode = $_POST['entry_event'];
        $teamnum = $_POST['entry_1638702746'];
        $teamnam = $_POST['entry_215295328'];
        $cargo = $_POST['entry_1565854744'];
        $weigh = $_POST['entry_177680938'];
        $upperhub = $_POST['entry_321248479'];
        $lowerhub = $_POST['entry_1745221229'];
        $lowbar = $_POST['entry_189327560'];
        $midbar = $_POST['entry_51519363'];
        $highbar = $_POST['entry_1343844870'];
        $travbar = $_POST['entry_332731239'];
        $drivetype = $_POST['entry_drivetype'];
        $shotacc = $_POST['entry_accshoot'];
        $overall = $_POST['entry_1013139442'];
        //process files
        $namefile1 = $_FILES['pitimg1']['name'];
        $namefile2 = $_FILES['pitimg2']['name'];
        $namefile3 = $_FILES['pitimg3']['name'];
        $namefile4 = $_FILES['pitimg4']['name'];
        $namefile5 = $_FILES['pitimg5']['name'];
        $date = new DateTime();
        $unixtime = $date->getTimestamp();
        $currentDirectory = getcwd();
        $uploadDirectory = "/pitimg/";
        $fileName1 = $unixtime . $namefile1;
        $fileName2 = $unixtime . $namefile2;
        $fileName3 = $unixtime . $namefile3;
        $fileName4 = $unixtime . $namefile4;
        $fileName5 = $unixtime . $namefile5;
        $fileTmpName1  = $_FILES['pitimg1']['tmp_name'];
        $fileTmpName2  = $_FILES['pitimg2']['tmp_name'];
        $fileTmpName3  = $_FILES['pitimg3']['tmp_name'];
        $fileTmpName4  = $_FILES['pitimg4']['tmp_name'];
        $fileTmpName5  = $_FILES['pitimg5']['tmp_name'];
        $uploadPath = $currentDirectory . $uploadDirectory . basename($fileName1);
        $uploadPath = $currentDirectory . $uploadDirectory . basename($fileName2);
        $uploadPath = $currentDirectory . $uploadDirectory . basename($fileName3);
        $uploadPath = $currentDirectory . $uploadDirectory . basename($fileName4);
        $uploadPath = $currentDirectory . $uploadDirectory . basename($fileName5);
        $didUpload1 = move_uploaded_file($fileTmpName1, $uploadPath1);
        $didUpload2 = move_uploaded_file($fileTmpName2, $uploadPath2);
        $didUpload3 = move_uploaded_file($fileTmpName3, $uploadPath3);
        $didUpload4 = move_uploaded_file($fileTmpName4, $uploadPath4);
        $didUpload5 = move_uploaded_file($fileTmpName5, $uploadPath5);
        //add to db
        class formDB extends SQLite3
        {
            function __construct()
            {
                $this->open('data.db');
            }
        }
        $db = new formDB();
        $db->exec("INSERT INTO pit(name,eventcode,teamnum,teamnam,cargo,weigh,upperhub,lowerhub,lowbar,midbar,highbar,travbar,drivetype,shotacc,overall,filename1,filename2,filename3,filename4,filename5) VALUES ('$name','$eventcode','$teamnum','$teamnam','$cargo','$weigh','$upperhub','$lowerhub','$lowbar','$midbar','$highbar','$travbar','$drivetype','$shotacc','$overall','$fileName1','$fileName2','$fileName3','$fileName4','$fileName5')");
        $db->close();
?>
<!DOCTYPE html>
<html style="height: 100%;">
<head>
<meta charset="UTF-8">
<link rel="stylesheet" href="main.css" type="text/css">
<meta http-equiv="refresh" content="2;index.html" />
</head>
<h1>Submitted!</h1>
<h3 style="color: lightslategray; text-align: center;">Redirecting...</h3>
</html>
<?php 
//} else {
// die('There was a critical error: Bad form password');   
//}
?>