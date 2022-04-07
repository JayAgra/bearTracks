<?php 
        //if ($_POST['entry_key'] === 'FORMKEY') {
        $name = $_POST['entry_398176575'];
        $eventcode = $_POST['entry_event'];
        $teamnum = $_POST['entry_1638702746'];
        $teamnam = $_POST['entry_215295328'];
        $match = $_POST['entry_508602665'];
        $upperhub = $_POST['entry_321248479'];
        $lowerhub = $_POST['entry_1745221229'];
        $lowbar = $_POST['entry_189327560'];
        $midbar = $_POST['entry_51519363'];
        $highbar = $_POST['entry_1343844870'];
        $traversalbar = $_POST['entry_332731239'];
        $autoattempt = $_POST['entry_412041471'];
        $shootauto = $_POST['entry_984983966'];
        $getauto = $_POST['entry_1220637130'];
        $taxiauto = $_POST['entry_1277030981'];
        $failauto = $_POST['entry_1277000981'];
        $violate = $_POST['entry_1019141500'];
        $human = $_POST['entry_1080933142'];
        $performance = $_POST['entry_1152778382'];
        $teleop = $_POST['entry_711121407'];
        $driving = $_POST['entry_177753238'];
        $overall = $_POST['entry_1013139442'];
        $madeupper = $_POST['madeupper'];
        $missedupper = $_POST['missedupper'];
        $madelower = $_POST['madelower'];
        $missedlower = $_POST['missedlower'];
        $barsatt = $_POST['barsatt'];
        $barsdone = $_POST['barsdone'];
        $defend = $_POST['entry_012504115'];
        $matchlvl = $_POST['entry_matchlvl'];
        class formDB extends SQLite3
        {
            function __construct()
            {
                $this->open('data.db');
            }
        }
        $db = new formDB();
        $db->exec("INSERT INTO data(eventcode, name,teamnum,teamnam,match,madeupper,missedupper,madelower,missedlower,barsatt,barsdone,autoattempt,shootauto,getauto,taxiauto,failauto,violate,human,performance,defend,teleop,driving,overall,matchlvl) VALUES ('$eventcode','$name','$teamnum','$teamnam','$match','$madeupper','$missedupper','$madelower','$missedlower','$barsatt','$barsdone','$autoattempt','$shootauto','$getauto','$taxiauto','$failauto','$violate','$human','$performance','$defend','$teleop','$driving','$overall','$matchlvl')");
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