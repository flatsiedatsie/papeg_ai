<?php

ini_set('session.use_cookies', '0');
ini_set('session.use_only_cookies', '0');
ini_set('session.use_trans_sid','1');
 
header('Content-type: application/json; charset=utf-8');

date_default_timezone_set("Europe/Amsterdam");


$counter_name = "counter.txt";

// Check if a text file exists.
// If not create one and initialize it to zero.
if (!file_exists($counter_name)) {
  $f = fopen($counter_name, "w");
  fwrite($f,"0");
  fclose($f);
}

// Read the current value of our counter file
$f = fopen($counter_name,"r");
$counterVal = fread($f, filesize($counter_name));
fclose($f);

$counterVal++;
$f = fopen($counter_name, "w");
fwrite($f, $counterVal);
fclose($f);


?>