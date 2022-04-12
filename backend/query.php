<!DOCTYPE html>
<html>
<head>
<style>
table{
    width:100%;
}
</style>
</head>
<body>
<form action="<? $_SERVER['PHP_SELF'] ?>" method="post">
<label>Team Number</label>
<input name="teamnum" placeholder="766" id="teamnum"><br>
<label>Event Code</label>
<input name="event" placeholder="CASJ" id="event" value="CASJ"><br>
<label>Season</label>
<input name="season" placeholder="2022" id="season" value="2022"><br>
<br><input type="submit" value="Submit"><br>
</form>
</body>
</html>
<?php
if ($_POST['teamnum']) {
$season = $_POST['season'];
$teamnum = $_POST['teamnum'];
$event = $_POST['event'];
$curl = curl_init();
$teamurl = "https://frc-api.firstinspires.org/v3.0/$season/teams?teamNumber=$teamnum";
$avaurl = "https://frc-api.firstinspires.org/v3.0/$season/avatars?teamNumber=$teamnum&page=1";
curl_setopt_array($curl, array(
  CURLOPT_URL => $teamurl,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'GET',
  CURLOPT_HTTPHEADER => array(
     "",
  ),
));

$response = curl_exec($curl);
curl_close($curl);
$respdec = json_decode($response, true);
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => $avaurl,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'GET',
  CURLOPT_HTTPHEADER => array(
     "",
  ),
));

$responseava = curl_exec($curl);

curl_close($curl);
$avadec = json_decode($responseava, true);

echo ("<br>");
echo ('<table border="1">');
echo ('<th colspan="3">TEAM DATA FROM FRC API</th></tr>');
echo ('<td rowspan="12"><img src="data:image/png;base64,'.$avadec['teams'][0]["encodedAvatar"].'"/></td><td>teamNumber</td><td>'.$respdec['teams'][0]["teamNumber"]."</td></tr>");
echo ("<td>nameFull / sponsors</td><td>".$respdec['teams'][0]["nameFull"]."</td></tr>");
echo ("<td>nameShort</td><td>".$respdec['teams'][0]["nameShort"]."</td></tr>");
echo ("<td>city</td><td>".$respdec['teams'][0]["city"]."</td></tr>");
echo ("<td>stateProv</td><td>".$respdec['teams'][0]["stateProv"]."</td></tr>");
echo ("<td>country</td><td>".$respdec['teams'][0]["country"]."</td></tr>");
echo ("<td>rookieYear</td><td>".$respdec['teams'][0]["rookieYear"]."</td></tr>");
echo ("<td>robotName</td><td>".$respdec['teams'][0]["robotName"]."</td></tr>");
echo ("<td>districtCode</td><td>".$respdec['teams'][0]["districtCode"]."</td></tr>");
echo ("<td>schoolName</td><td>".$respdec['teams'][0]["schoolName"]."</td></tr>");
echo ("<td>website</td><td>".$respdec['teams'][0]["website"]."</td></tr>");
echo ("<td>homeCMP</td><td>".$respdec['teams'][0]["homeCMP"]."</td></tr>");
echo ("</table>");
echo ("<br>");
echo ("<br>");
echo ("<hr>");
echo ("<br>");
class formDB extends SQLite3
{
    function __construct()
    {
        $this->open('data.db');
    }
}
$db = new formDB();
$avgupma = $db->query('SELECT AVG(madeupper) FROM data WHERE teamnum='.$teamnum.' AND eventcode="'.$event.'"');
while ($rowww = $avgupma->fetchArray()) {
    $uppermaavg = $rowww[0];
}
$avgupmi = $db->query('SELECT AVG(missedupper) FROM data WHERE teamnum='.$teamnum.' AND eventcode="'.$event.'"');
while ($rowwww = $avgupmi->fetchArray()) {
    $uppermiavg = $rowwww[0];
}
$attemptedupper = $uppermaavg + $uppermiavg;
$upperaccuracy = ($uppermaavg / $attemptedupper)*100;

//lower

$avgloma = $db->query('SELECT AVG(madelower) FROM data WHERE teamnum='.$teamnum.' AND eventcode="'.$event.'"');
while ($rowwwww = $avgloma->fetchArray()) {
    $lowermaavg = $rowwwww[0];
}
$avglomi = $db->query('SELECT AVG(missedlower) FROM data WHERE teamnum='.$teamnum.' AND eventcode="'.$event.'"');
while ($rowwwwww = $avglomi->fetchArray()) {
    $lowermiavg = $rowwwwww[0];
}
$attemptedlower = $lowermaavg + $lowermiavg;
$loweraccuracy = ($lowermaavg / $attemptedlower)*100;

$noclimbs = $db->query('SELECT barsdone, COUNT(barsdone) AS `value_occurrence` FROM data WHERE teamnum='.$teamnum.' AND eventcode="'.$event.'" GROUP BY barsdone ORDER BY  `value_occurrence` DESC LIMIT 1;');
while ($rowwwwwwww = $noclimbs->fetchArray()) {
 $mostclimbedbars = $rowwwwwwww[0];
}

if ($upperaccuracy > 90) {
    $upperacccolor = '#32cd32';
} else if ($upperaccuracy > 70) {
    $upperacccolor = 'yellow';
} else if ($upperaccuracy > 50) {
    $upperacccolor = 'red';
} else if ($upperaccuracy = "NAN") {
    $upperacccolor = 'gray';
}
if ($loweraccuracy > 90) {
    $loweracccolor = '#32cd32';
} else if ($loweraccuracy > 70) {
    $loweracccolor = 'yellow';
} else if ($loweraccuracy > 50) {
    $loweracccolor = 'red';
} else if ($loweraccuracy = "NAN") {
    $loweracccolor = 'gray';
}

echo ('<table border="1">');
echo ('<tr><td>Average Upper Hub Shots</td><td>'.$uppermaavg.'</td></tr>');
echo ('<tr><td>Upper Hub Accuracy</td><td style="background-color:'.$upperacccolor.'">'.$upperaccuracy.'%</td></tr>');
echo ('<tr><td>Average Lower Hub Shots</td><td>'.$lowermaavg.'</td></tr>');
echo ('<tr><td>Lower Hub Accuracy</td><td style="background-color:'.$loweracccolor.'">'.$loweraccuracy.'%</td></tr>');
echo ('<tr><td>Bar Climbed Most Often</td><td>'.$mostclimbedbars.'</td></tr>');
echo ('</table><br>');

$results = $db->query('SELECT * FROM data WHERE teamnum='.$teamnum.' AND eventcode="'.$event.'"');
    echo ('<table border="1">');
    echo ("<td>Submission ID</td><td>The event code</td><td>Scout's Name</td><td>Team Number</td><td>Team Name</td><td>Match Number</td><td>Match Level</td><td>How many upper hub shots did the bot make?</td><td>How many upper hub shots did the bot miss?</td><td>How many lower hub shots did the bot make?</td><td>How many lower hub shots did the bot miss?</td><td>How many bars did the bot attempt?</td><td>How many bars did the bot climb?</td><td>During Auton, the robot failed to score points, but made an attempt</td><td>During Auton, did the robot successfully shoot cargo into the hubs?</td><td>During Auton, did the robot retrieve cargo from the field?</td><td>Was the robot able to taxi automatically?</td><td>During Auton, did the robot fail to score points?</td><td>How many rule violations?</td><td>Did it interact with the Human Player?</td><td>How would you estimate the consistency of the team's performance in the auton? (DROPDOWN)</td><td>If present, what types of defense was used, and was it effective?</td><td>Any other thoughts about the teleop phase? Actions it took during so?</td><td>Any thoughts about the driving?</td><td>Overall assessment? (Would we want to be in an alliance with them?)</td></tr>");
while ($row = $results->fetchArray()) {
    if ($teamnum != $row[3]) {
        echo ("no results bro");
    } else {
    echo ("<td>".$row[0]."</td><td>".$row[1]."</td><td>".$row[2]."</td><td>".$row[3]."</td><td>".$row[4]."</td><td>".$row[5]."</td><td>".$row[6]."</td><td>".$row[7]."</td><td>".$row[8]."</td><td>".$row[9]."</td><td>".$row[10]."</td><td>".$row[11]."</td><td>".$row[12]."</td><td>".$row[13]."</td><td>".$row[14]."</td><td>".$row[15]."</td><td>".$row[16]."</td><td>".$row[17]."</td><td>".$row[18]."</td><td>".$row[19]."</td><td>".$row[20]."</td><td>".$row[21]."</td><td>".$row[22]."</td><td>".$row[23]."</td><td>".$row[24]."</td></tr>");
    }
}
    echo ('</table>');
    echo ("<br>");

$resultspit = $db->query('SELECT * FROM pit WHERE teamnum='.$teamnum.' AND eventcode="'.$event.'"');
while ($roresw = $resultspit->fetchArray()) {
    echo ('<table border="1">');
    echo ('<th colspan="2">PIT SCOUTING DATA</th></tr>');
    echo ("<td>Submission ID</td><td>".$roresw[0]."</td></tr>");
    echo ("<td>Name</td><td>".$roresw[1]."</td></tr>"); 
    echo ("<td>Event Code</td><td>".$roresw[2]."</td></tr>"); 
    echo ("<td>Team Number</td><td>".$roresw[3]."</td></tr>"); 
    echo ("<td>Team Name</td><td>".$roresw[4]."</td></tr>"); 
    echo ("<td>Carried Cargo</td><td>".$roresw[5]."</td></tr>"); 
    echo ("<td>Bot Weight</td><td>".$roresw[6]."</td></tr>"); 
    echo ("<td>Can shoot in upper hub</td><td>".$roresw[7]."</td></tr>"); 
    echo ("<td>Can shoot in lower hub</td><td>".$roresw[8]."</td></tr>"); 
    echo ("<td>Can climb to Low Bar</td><td>".$roresw[9]."</td></tr>"); 
    echo ("<td>Can climb to Mid Bar</td><td>".$roresw[10]."</td></tr>"); 
    echo ("<td>Can climb to High Bar</td><td>".$roresw[11]."</td></tr>"); 
    echo ("<td>Can climb to Traversal Bar</td><td>".$roresw[12]."</td></tr>"); 
    echo ("<td>Drive Type</td><td>".$roresw[13]."</td></tr>"); 
    echo ("<td>Predicted Shot Accuracy(%)</td><td>".$roresw[14]."</td></tr>"); 
    echo ("<td>Drive Team Wks of Work</td><td>".$roresw[15]."</td></tr>"); 
    echo ('<td>Confidence (out of 7)</td><td>'.$roresw[16].' of 7</td></tr>'); 
    echo ("<td>Build Quality (out of 7)</td><td>".$roresw[17]." of 7</td></tr>"); 
    echo ("<td>Overall Thoughts</td><td>".$roresw[18]."</td></tr>"); 
    echo ('<td colspan="2"><img src="pitimg/'.$roresw[19].'" width="80%" /></td></tr>'); 
    echo ('<td colspan="2"><img src="pitimg/'.$roresw[20].'" width="80%" /></td></tr>'); 
    echo ('<td colspan="2"><img src="pitimg/'.$roresw[21].'" width="80%" /></td></tr>'); 
    echo ('<td colspan="2"><img src="pitimg/'.$roresw[22].'" width="80%" /></td></tr>'); 
    echo ('<td colspan="2"><img src="pitimg/'.$roresw[23].'" width="80%" /></td></tr>'); 
    echo ("</table>");
}
$db->close();
}
?>