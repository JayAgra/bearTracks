<?php 
        //if ($_POST['entry_key'] === 'key') {
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
        $namefile = $_FILES['pitimg']['name'];
        $date = new DateTime();
        $unixtime = $date->getTimestamp();
        $currentDirectory = getcwd();
        $uploadDirectory = "/pitimg/";
        $fileName = $unixtime . $namefile;
        $fileTmpName  = $_FILES['pitimg']['tmp_name'];
        $uploadPath = $currentDirectory . $uploadDirectory . basename($fileName);
        $didUpload = move_uploaded_file($fileTmpName, $uploadPath);
        //add to db
        class formDB extends SQLite3
        {
            function __construct()
            {
                $this->open('data.db');
            }
        }
        $db = new formDB();
        $db->exec("INSERT INTO pit(name,eventcode,teamnum,teamnam,cargo,weigh,upperhub,lowerhub,lowbar,midbar,highbar,travbar,drivetype,shotacc,overall,filename) VALUES ('$name','$eventcode','$teamnum','$teamnam','$cargo','$weigh','$upperhub','$lowerhub','$lowbar','$midbar','$highbar','$travbar','$drivetype','$shotacc','$overall','$fileName')");
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