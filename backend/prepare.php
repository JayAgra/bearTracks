<!DOCTYPE html>
<html>
<head>
</head>
<body>
<form action="<? $_SERVER['PHP_SELF'] ?>" method="post">
<input name="teamnum" placeholder="766" id="teamnum">
<input type="submit" value="Submit"><br>
</form>
</body>
</html>
<?php
if ($_POST['teamnum']) {
$season = '2022';
$teamnum = $_POST['teamnum'];
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
     "Authorization: Basic amF5YWdyYToyNDQxZTQ0Ny1kMjY0LTRhMzMtYWE0NS0wNDJiZGFiZmNhOWU=",
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
     "Authorization: Basic amF5YWdyYToyNDQxZTQ0Ny1kMjY0LTRhMzMtYWE0NS0wNDJiZGFiZmNhOWU=",
  ),
));

$responseava = curl_exec($curl);

curl_close($curl);
$avadec = json_decode($responseava, true);

echo ("<br>");
echo ('<table border="1">');
echo ('<th colspan="3">TEAM DATA FROM FRC API</th></tr>');
echo ('<td rowspan="12"><img src="data:image/png;base64,'.$avadec[teams][0]["encodedAvatar"].'"/></td><td>teamNumber</td><td>'.$respdec[teams][0]["teamNumber"]."</td></tr>");
echo ("<td>nameFull / sponsors</td><td>".$respdec[teams][0]["nameFull"]."</td></tr>");
echo ("<td>nameShort</td><td>".$respdec[teams][0]["nameShort"]."</td></tr>");
echo ("<td>city</td><td>".$respdec[teams][0]["city"]."</td></tr>");
echo ("<td>stateProv</td><td>".$respdec[teams][0]["stateProv"]."</td></tr>");
echo ("<td>country</td><td>".$respdec[teams][0]["country"]."</td></tr>");
echo ("<td>rookieYear</td><td>".$respdec[teams][0]["rookieYear"]."</td></tr>");
echo ("<td>robotName</td><td>".$respdec[teams][0]["robotName"]."</td></tr>");
echo ("<td>districtCode</td><td>".$respdec[teams][0]["districtCode"]."</td></tr>");
echo ("<td>schoolName</td><td>".$respdec[teams][0]["schoolName"]."</td></tr>");
echo ("<td>website</td><td>".$respdec[teams][0]["website"]."</td></tr>");
echo ("<td>homeCMP</td><td>".$respdec[teams][0]["homeCMP"]."</td></tr>");
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
$results = $db->query('SELECT * FROM data WHERE teamnum='.$teamnum);

while ($row = $results->fetchArray()) {
    if ($teamnum != $row[3]) {
        echo ("no results bro");
    } else {
    echo ('<table border="1">');
    echo ('<th colspan="2">MATCH SCOUTING DATA</th></tr>');
    echo ("<td>Submission ID</td><td>".$row[0]."</td></tr>");
    echo ("<td>The event code</td><td>".$row[1]."</td></tr>");
    echo ("<td>Scout's Name</td><td>".$row[2]."</td></tr>");
    echo ("<td>Team Number</td><td>".$row[3]."</td></tr>");
    echo ("<td>Team Name</td><td>".$row[4]."</td></tr>");
    echo ("<td>Match Number</td><td>".$row[5]."</td></tr>");
    echo ("<td>Match Level</td><td>".$row[6]."</td></tr>");
    echo ("<td>How many upper hub shots did the bot make?</td><td>".$row[7]."</td></tr>");
    echo ("<td>How many upper hub shots did the bot miss?</td><td>".$row[8]."</td></tr>");
    echo ("<td>How many lower hub shots did the bot make?</td><td>".$row[9]."</td></tr>");
    echo ("<td>How many lower hub shots did the bot miss?</td><td>".$row[10]."</td></tr>");
    echo ("<td>How many bars did the bot attempt?</td><td>".$row[11]."</td></tr>");
    echo ("<td>How many bars did the bot climb?</td><td>".$row[12]."</td></tr>");
    echo ("<td>During Auton, the robot failed to score points, but made an attempt</td><td>".$row[13]."</td></tr>");
    echo ("<td>During Auton, did the robot successfully shoot cargo into the hubs?</td><td>".$row[14]."</td></tr>");
    echo ("<td>During Auton, did the robot retrieve cargo from the field?</td><td>".$row[15]."</td></tr>");
    echo ("<td>Was the robot able to taxi automatically?</td><td>".$row[16]."</td></tr>");
    echo ("<td>During Auton, did the robot fail to score points?</td><td>".$row[17]."</td></tr>");
    echo ("<td>How many rule violations?</td><td>".$row[18]."</td></tr>");
    echo ("<td>Did it interact with the Human Player?</td><td>".$row[19]."</td></tr>");
    echo ("<td>How would you estimate the consistency of the team's performance in the auton? (DROPDOWN)</td><td>".$row[20]."</td></tr>");
    echo ("<td>If present, what types of defense was used, and was it effective?</td><td>".$row[21]."</td></tr>");
    echo ("<td>Any other thoughts about the teleop phase? Actions it took during so?</td><td>".$row[22]."</td></tr>");
    echo ("<td>Any thoughts about the driving?</td><td>".$row[23]."</td></tr>");
    echo ("<td>Overall assessment? (Would we want to be in an alliance with them?)</td><td>".$row[24]."</td></tr>");
    echo ('</table>');
    echo ("<br>");
    }
}

$resultspit = $db->query('SELECT * FROM pit WHERE teamnum='.$teamnum);
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
    echo ("<td>Overall</td><td>".$roresw[15]."</td></tr>"); 
    echo ('<td colspan="2"><img src="pitimg/'.$roresw[16].'" /></td></tr>'); 
    echo ("</table>");
}

$db->close();
}
if ($_POST['teamnum'] && $_POST['event'] && $_POST['match'] && $_POST['level']) {
$season = '2022';
$eventcode = $_POST['event'];
$level = $_POST['level'];
$matnum = $_POST['match'];
$curl2 = curl_init();
$maturl = "https://frc-api.firstinspires.org/v3.0/$season/scores/$eventcode/$level?matchNumber=$matnum";
curl_setopt_array($curl2, array(
  CURLOPT_URL => $maturl,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'GET',
  CURLOPT_HTTPHEADER => array(
     "Authorization: Basic amF5YWdyYToyNDQxZTQ0Ny1kMjY0LTRhMzMtYWE0NS0wNDJiZGFiZmNhOWU=",
  ),
));

$response = curl_exec($curl2);
curl_close($curl);
}
?>