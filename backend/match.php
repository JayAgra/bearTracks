<!DOCTYPE html>
<html>
<head>
<style>
table{
    width:100%;
    table-layout: fixed;
}
</style>
</head>
<body>
<form action="<? $_SERVER['PHP_SELF'] ?>" method="post">
<label>Our Team Number</label>
<input name="teamnum" placeholder="766" id="teamnum" value="766"><br>
<label>Event Code</label>
<input name="event" placeholder="CASJ" id="event" value="CASJ"><br>
<label>Season</label>
<input name="season" placeholder="2022" id="season" value="2022"><br>
<label>Level</label>
<select name="tlvl">
    <option value="practice">Practice</option>
    <option value="qualification" selected>Qualification</option>
    <option value="playoff">Playoff</option>
</select>
<br>
<br><input type="submit" value="Submit"><br><br>
</form>
</body>
</html>
<?php
if ($_POST['teamnum']) {
$season = $_POST['season'];
$teamnum = $_POST['teamnum'];
$event = $_POST['event'];
$tlvl = $_POST['tlvl'];
$curl = curl_init();
$teamurl = "https://frc-api.firstinspires.org/v3.0/$season/schedule/$event?teamNumber=$teamnum&tournamentLevel=$tlvl";
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
$matches = json_decode($response, true);
echo ('<table border="1">');
echo ('<tr><th colspan="3">'.$matches["Schedule"][0]["description"].'</th></tr>');
echo ('<tr style="background-color:red; color: #fff"><th>'.$matches["Schedule"][0]["teams"][0]["teamNumber"].'</th><th>'.$matches["Schedule"][0]["teams"][1]["teamNumber"].'</th><th>'.$matches["Schedule"][0]["teams"][2]["teamNumber"].'</th></tr>');
echo ('<tr style="background-color:blue; color: #fff"><th>'.$matches["Schedule"][0]["teams"][3]["teamNumber"].'</th><th>'.$matches["Schedule"][0]["teams"][4]["teamNumber"].'</th><th>'.$matches["Schedule"][0]["teams"][5]["teamNumber"].'</th></tr>');
echo ('</table><br><hr><br>');
echo ('<table border="1">');
echo ('<tr><th colspan="3">'.$matches["Schedule"][1]["description"].'</th></tr>');
echo ('<tr style="background-color:red; color: #fff"><th>'.$matches["Schedule"][1]["teams"][0]["teamNumber"].'</th><th>'.$matches["Schedule"][1]["teams"][1]["teamNumber"].'</th><th>'.$matches["Schedule"][1]["teams"][2]["teamNumber"].'</th></tr>');
echo ('<tr style="background-color:blue; color: #fff"><th>'.$matches["Schedule"][1]["teams"][3]["teamNumber"].'</th><th>'.$matches["Schedule"][1]["teams"][4]["teamNumber"].'</th><th>'.$matches["Schedule"][1]["teams"][5]["teamNumber"].'</th></tr>');
echo ('</table><br><hr><br>');
echo ('<table border="1">');
echo ('<tr><th colspan="3">'.$matches["Schedule"][2]["description"].'</th></tr>');
echo ('<tr style="background-color:red; color: #fff"><th>'.$matches["Schedule"][2]["teams"][0]["teamNumber"].'</th><th>'.$matches["Schedule"][2]["teams"][1]["teamNumber"].'</th><th>'.$matches["Schedule"][2]["teams"][2]["teamNumber"].'</th></tr>');
echo ('<tr style="background-color:blue; color: #fff"><th>'.$matches["Schedule"][2]["teams"][3]["teamNumber"].'</th><th>'.$matches["Schedule"][2]["teams"][4]["teamNumber"].'</th><th>'.$matches["Schedule"][2]["teams"][5]["teamNumber"].'</th></tr>');
echo ('</table><br><hr><br>');
echo ('<table border="1">');
echo ('<tr><th colspan="3">'.$matches["Schedule"][3]["description"].'</th></tr>');
echo ('<tr style="background-color:red; color: #fff"><th>'.$matches["Schedule"][3]["teams"][0]["teamNumber"].'</th><th>'.$matches["Schedule"][3]["teams"][1]["teamNumber"].'</th><th>'.$matches["Schedule"][3]["teams"][2]["teamNumber"].'</th></tr>');
echo ('<tr style="background-color:blue; color: #fff"><th>'.$matches["Schedule"][3]["teams"][3]["teamNumber"].'</th><th>'.$matches["Schedule"][3]["teams"][4]["teamNumber"].'</th><th>'.$matches["Schedule"][3]["teams"][5]["teamNumber"].'</th></tr>');
echo ('</table><br><hr><br>');
echo ('<table border="1">');
echo ('<tr><th colspan="3">'.$matches["Schedule"][4]["description"].'</th></tr>');
echo ('<tr style="background-color:red; color: #fff"><th>'.$matches["Schedule"][4]["teams"][0]["teamNumber"].'</th><th>'.$matches["Schedule"][4]["teams"][1]["teamNumber"].'</th><th>'.$matches["Schedule"][4]["teams"][2]["teamNumber"].'</th></tr>');
echo ('<tr style="background-color:blue; color: #fff"><th>'.$matches["Schedule"][4]["teams"][3]["teamNumber"].'</th><th>'.$matches["Schedule"][4]["teams"][4]["teamNumber"].'</th><th>'.$matches["Schedule"][4]["teams"][5]["teamNumber"].'</th></tr>');
echo ('</table><br><hr><br>');
echo ('<table border="1">');
echo ('<tr><th colspan="3">'.$matches["Schedule"][5]["description"].'</th></tr>');
echo ('<tr style="background-color:red; color: #fff"><th>'.$matches["Schedule"][5]["teams"][0]["teamNumber"].'</th><th>'.$matches["Schedule"][5]["teams"][1]["teamNumber"].'</th><th>'.$matches["Schedule"][5]["teams"][2]["teamNumber"].'</th></tr>');
echo ('<tr style="background-color:blue; color: #fff"><th>'.$matches["Schedule"][5]["teams"][3]["teamNumber"].'</th><th>'.$matches["Schedule"][5]["teams"][4]["teamNumber"].'</th><th>'.$matches["Schedule"][5]["teams"][5]["teamNumber"].'</th></tr>');
echo ('</table><br><hr><br>');
echo ('<table border="1">');
echo ('<tr><th colspan="3">'.$matches["Schedule"][6]["description"].'</th></tr>');
echo ('<tr style="background-color:red; color: #fff"><th>'.$matches["Schedule"][6]["teams"][0]["teamNumber"].'</th><th>'.$matches["Schedule"][6]["teams"][1]["teamNumber"].'</th><th>'.$matches["Schedule"][6]["teams"][2]["teamNumber"].'</th></tr>');
echo ('<tr style="background-color:blue; color: #fff"><th>'.$matches["Schedule"][6]["teams"][3]["teamNumber"].'</th><th>'.$matches["Schedule"][6]["teams"][4]["teamNumber"].'</th><th>'.$matches["Schedule"][6]["teams"][5]["teamNumber"].'</th></tr>');
echo ('</table><br><hr><br>');
echo ('<table border="1">');
echo ('<tr><th colspan="3">'.$matches["Schedule"][7]["description"].'</th></tr>');
echo ('<tr style="background-color:red; color: #fff"><th>'.$matches["Schedule"][7]["teams"][0]["teamNumber"].'</th><th>'.$matches["Schedule"][7]["teams"][1]["teamNumber"].'</th><th>'.$matches["Schedule"][7]["teams"][2]["teamNumber"].'</th></tr>');
echo ('<tr style="background-color:blue; color: #fff"><th>'.$matches["Schedule"][7]["teams"][3]["teamNumber"].'</th><th>'.$matches["Schedule"][7]["teams"][4]["teamNumber"].'</th><th>'.$matches["Schedule"][7]["teams"][5]["teamNumber"].'</th></tr>');
echo ('</table><br><hr><br>');
echo ('<table border="1">');
echo ('<tr><th colspan="3">'.$matches["Schedule"][8]["description"].'</th></tr>');
echo ('<tr style="background-color:red; color: #fff"><th>'.$matches["Schedule"][8]["teams"][0]["teamNumber"].'</th><th>'.$matches["Schedule"][8]["teams"][1]["teamNumber"].'</th><th>'.$matches["Schedule"][8]["teams"][2]["teamNumber"].'</th></tr>');
echo ('<tr style="background-color:blue; color: #fff"><th>'.$matches["Schedule"][8]["teams"][3]["teamNumber"].'</th><th>'.$matches["Schedule"][8]["teams"][4]["teamNumber"].'</th><th>'.$matches["Schedule"][8]["teams"][5]["teamNumber"].'</th></tr>');
echo ('</table><br><hr><br>');
echo ('<table border="1">');
echo ('<tr><th colspan="3">'.$matches["Schedule"][9]["description"].'</th></tr>');
echo ('<tr style="background-color:red; color: #fff"><th>'.$matches["Schedule"][9]["teams"][0]["teamNumber"].'</th><th>'.$matches["Schedule"][9]["teams"][1]["teamNumber"].'</th><th>'.$matches["Schedule"][9]["teams"][2]["teamNumber"].'</th></tr>');
echo ('<tr style="background-color:blue; color: #fff"><th>'.$matches["Schedule"][9]["teams"][3]["teamNumber"].'</th><th>'.$matches["Schedule"][9]["teams"][4]["teamNumber"].'</th><th>'.$matches["Schedule"][9]["teams"][5]["teamNumber"].'</th></tr>');
echo ('</table><br><hr><br>');
echo ('<table border="1">');
echo ('<tr><th colspan="3">'.$matches["Schedule"][10]["description"].'</th></tr>');
echo ('<tr style="background-color:red; color: #fff"><th>'.$matches["Schedule"][10]["teams"][0]["teamNumber"].'</th><th>'.$matches["Schedule"][10]["teams"][1]["teamNumber"].'</th><th>'.$matches["Schedule"][10]["teams"][2]["teamNumber"].'</th></tr>');
echo ('<tr style="background-color:blue; color: #fff"><th>'.$matches["Schedule"][10]["teams"][3]["teamNumber"].'</th><th>'.$matches["Schedule"][10]["teams"][4]["teamNumber"].'</th><th>'.$matches["Schedule"][10]["teams"][5]["teamNumber"].'</th></tr>');
echo ('</table><br><hr><br>');
}
?>