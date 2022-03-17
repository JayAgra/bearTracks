<?php 
        if ($_POST['entry_key'] === 'team766bears') {
        $name = $_POST['entry_398176575'];
        $teamnum = $_POST['entry_1638702746'];
        $teamnam = $_POST['entry_215295328'];
        $match = $_POST['entry_508602665'];
        $cargo = $_POST['entry_1565854744'];
        $weigh = $_POST['entry_177680938'];
        $upperhub = $_POST['entry_321248479'];
        $lowerhub = $_POST['entry_1745221229'];
        $lowbar = $_POST['entry_189327560'];
        $midbar = $_POST['entry_51519363'];
        $highbar = $_POST['entry_1343844870'];
        $traversalbar = $_POST['entry_332731239'];
        $taxigetscore = $_POST['entry_412041471'];
        $shootauto = $_POST['entry_984983966'];
        $getauto = $_POST['entry_1220637130'];
        $failauto = $_POST['entry_1277000981'];
        $attupper = $_POST['entry_1157236568'];
        $attlower = $_POST['entry_794477414'];
        $noatt = $_POST['entry_947038770'];
        $points = $_POST['entry_699092517'];
        $violate = $_POST['entry_1019141500'];
        $human = $_POST['entry_1080933142'];
        $performance = $_POST['entry_1152778382'];
        $matchpts = $_POST['entry_309796794'];
        $rankingpts = $_POST['entry_638763658'];
        $teleop = $_POST['entry_711121407'];
        $driving = $_POST['entry_177753238'];
        $overall = $_POST['entry_1013139442'];
        class formDB extends SQLite3
        {
            function __construct()
            {
                $this->open('data.db');
            }
        }
        $db = new formDB();
        $db->exec("INSERT INTO data(name,teamnum,teamnam,match,cargo,weigh,upperhub,lowerhub,lowbar,midbar,highbar,traversalbar,taxigetscore,shootauto,getauto,failauto,attupper,attlower,noatt,points,violate,human,performance,matchpts,rankingpts,teleop,driving,overall) VALUES ('$name','$teamnum','$teamnam','$match','$cargo','$weigh','$upperhub','$lowerhub','$lowbar','$midbar','$highbar','$traversalbar','$taxigetscore','$shootauto','$getauto','$failauto','$attupper','$attlower','$noatt','$points','$violate','$human','$performance','$matchpts','$rankingpts','$teleop','$driving','$overall')");
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
} else {
 die('There was a critical error: Bad form password');   
}
?>
