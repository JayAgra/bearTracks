<?php 
        //if ($_POST['entry_key'] === 'FORMKEY') {
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
        $conf = $_POST['overconf'];
        $buildqual = $_POST['bqual'];
        $dteam = $_POST['dteam'];
        $attended = $_POST['attended'];
        //process files
        $date = new DateTime();
        $unixtime = $date->getTimestamp();
        $currentDirectory = getcwd();
        $uploadDirectory = "/pitimg/";
        $pit1type = $_FILES['pitimg1']['type'];
        $pit2type = $_FILES['pitimg2']['type'];
        $pit3type = $_FILES['pitimg3']['type'];
        $pit4type = $_FILES['pitimg4']['type'];
        $pit5type = $_FILES['pitimg5']['type'];
        
        $ori1nm = $_FILES['pitimg1']['name'];
        $ori2nm = $_FILES['pitimg2']['name'];
        $ori3nm = $_FILES['pitimg3']['name'];
        $ori4nm = $_FILES['pitimg4']['name'];
        $ori5nm = $_FILES['pitimg5']['name'];
        if (strpos($pit1type, 'image') !== false) {
            $fileName1 = $unixtime . "1" . $ori1nm;
            $fileTmpName1  = $_FILES['pitimg1']['tmp_name'];
            $uploadPath1 = $currentDirectory . $uploadDirectory . basename($fileName1);
            $didUpload1 = move_uploaded_file($fileTmpName1, $uploadPath1);
        }
        if (strpos($pit2type, 'image') !== false) {
            $fileName2 = $unixtime . "2" . $ori2nm;
            $fileTmpName2  = $_FILES['pitimg2']['tmp_name'];
            $uploadPath2 = $currentDirectory . $uploadDirectory . basename($fileName2);
            $didUpload2 = move_uploaded_file($fileTmpName2, $uploadPath2);
        }
        if (strpos($pit3type, 'image') !== false) {
            $fileName3 = $unixtime . "3" . $ori3nm;
            $fileTmpName3  = $_FILES['pitimg3']['tmp_name'];
            $uploadPath3 = $currentDirectory . $uploadDirectory . basename($fileName3);
            $didUpload3 = move_uploaded_file($fileTmpName3, $uploadPath3);
        }
        if (strpos($pit4type, 'image') !== false) {
            $fileName4 = $unixtime . "4" . $ori4nm;
            $fileTmpName4  = $_FILES['pitimg4']['tmp_name'];
            $uploadPath4 = $currentDirectory . $uploadDirectory . basename($fileName4);
            $didUpload4 = move_uploaded_file($fileTmpName4, $uploadPath4);
        }
        if (strpos($pit5type, 'image') !== false) {
            $fileName5 = $unixtime . "5" . $ori5nm;
            $fileTmpName5  = $_FILES['pitimg5']['tmp_name'];
            $uploadPath5 = $currentDirectory . $uploadDirectory . basename($fileName5);
            $didUpload5 = move_uploaded_file($fileTmpName5, $uploadPath5);
        }
        class formDB extends SQLite3
        {
            function __construct()
            {
                $this->open('data.db');
            }
        }
        $db = new formDB();
        $db->exec("INSERT INTO pit(name,eventcode,teamnum,teamnam,cargo,weigh,upperhub,lowerhub,lowbar,midbar,highbar,travbar,drivetype,shotacc,dteam,confid,buildqual,overall,filename1,filename2,filename3,filename4,filename5) VALUES ('$name','$eventcode','$teamnum','$teamnam','$cargo','$weigh','$upperhub','$lowerhub','$lowbar','$midbar','$highbar','$travbar','$drivetype','$shotacc','$dteam','$conf','$buildqual','$overall','$fileName1','$fileName2','$fileName3','$fileName4','$fileName5')");
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