<?php

$log_file = dirname(__FILE__) . '/csp-violations.log';
$log_file_size_limit = 100000; // bytes - once exceeded no further entries are added

$current_domain = preg_replace('/www\./i', '', $_SERVER['SERVER_NAME']);

http_response_code(204); // HTTP 204 No Content

$json_data = file_get_contents('php://input');

// We pretty print the JSON before adding it to the log file
if ($json_data = json_decode($json_data)) {
  $json_data = json_encode($json_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

  if (!file_exists($log_file)) {
    exit(0);
  } else if (filesize($log_file) > $log_file_size_limit) {
    exit(0);
  }

  file_put_contents($log_file, $json_data, FILE_APPEND | LOCK_EX);
}