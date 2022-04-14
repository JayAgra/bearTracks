<?php
if(isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on')   
$url = "https://";   
else  
$url = "http://";   
$url.= $_SERVER['HTTP_HOST'];   
$url.= $_SERVER['REQUEST_URI'];    

$url_components = parse_url($url);
parse_str($url_components['query'], $params);

if ($params['teamnum']) {
$season = $params['season'];
$teamnum = $params['teamnum'];
$event = $params['event'];
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
    $upperrate = " has an accurate upper shooter (".$upperaccuracy."%), ";
} else if ($upperaccuracy > 70) {
    $upperacccolor = 'yellow';
    $upperrate = " has a somewhat accurate upper shooter (".$upperaccuracy."%), ";
} else if ($upperaccuracy > 50) {
    $upperacccolor = 'red';
    $upperrate = " has an inaccurate upper shooter (".$upperaccuracy."%), ";
} else if ($upperaccuracy >30 ) {
    $upperacccolor = 'red';
    $upperrate = " has a very inaccurate upper shooter (".$upperaccuracy."%), ";
} else if ($upperaccuracy = "NAN") {
    $upperacccolor = 'gray';
    $upperrate = " does not shoot in the upper hub, ";
}
if ($loweraccuracy > 90) {
    $loweracccolor = '#32cd32';
    $lowerrate = "and has an accurate lower shooter (".$loweraccuracy."%), ";
} else if ($loweraccuracy > 70) {
    $loweracccolor = 'yellow';
    $lowerrate = "and has a somewhat accurate lower shooter (".$loweraccuracy."%), ";
} else if ($loweraccuracy > 50) {
    $loweracccolor = 'red';
    $lowerrate = "and has an inaccurate lower shooter (".$loweraccuracy."%), ";
} else if ($loweraccuracy >30 ) {
    $loweracccolor = 'red';
    $lowerrate = " has a very inaccurate lower shooter (".$loweraccuracy."%), ";
} else if ($loweraccuracy = "NAN") {
    $loweracccolor = 'gray';
    $lowerrate = " does not shoot in the lower hub, ";
}

echo ('
{
  "teamnum": "'.$teamnum.'",
  "event": "'.$event.'",
  "upperavg": "'.$uppermaavg.'",
  "upperacc": "'.$upperaccuracy.'",
  "loweravg": "'.$lowermaavg.'",
  "loweracc": "'.$loweraccuracy.'",
  "climbs": "'.$mostclimbedbars.'"
}');

$db->close();
}
?>
