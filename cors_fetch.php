<?php
	
if (!empty($_SERVER['HTTP_ORIGIN'])) {
	
	if (
		str_contains($_SERVER['HTTP_ORIGIN'], 'papeg.ai') 
		|| str_contains($_SERVER['HTTP_ORIGIN'], 'papegai.eu')
		|| str_contains($_SERVER['HTTP_ORIGIN'], 'localhostje.dd')
	) {
		// allow through
	}
	else{
		echo '{"error":"Nope"}';
		exit();
	}
	
	header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
}

header("Access-Control-Allow-Methods: GET,OPTIONS");
header('Access-Control-Allow-Credentials: false');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    #header('Access-Control-Allow-Origin: *');
	#header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
    #header('Access-Control-Allow-Methods: POST, GET, DELETE, PUT, PATCH, OPTIONS');
	#header("Access-Control-Allow-Methods: GET,OPTIONS");
    # header('Access-Control-Allow-Headers: token, Content-Type');
	header('Access-Control-Allow-Headers: Origin,Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods, Authorization, X-Requested-With,Access-Control-Allow-Credentials');
    header('Access-Control-Max-Age: 1728000');
    header('Content-Length: 0');
    header('Content-Type: text/plain');
    die();
}


#header('Access-Control-Allow-Headers: token, Content-Type');
#header('Access-Control-Allow-Headers: Origin,Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods, Authorization, X-Requested-With,Access-Control-Allow-Credentials');


if(!isset($_SERVER['REQUEST_METHOD'])){
	echo '{"error":"no request method set"}';
	exit();	
}

if ($_SERVER['REQUEST_METHOD'] != "get" && $_SERVER['REQUEST_METHOD'] != "GET") {
	echo '{"error":"missing URL"}';
	exit();
}


function base64url_decode($base64url){
	$base64 = strtr($base64url, '-_', '+/');
	$plainText = base64_decode($base64);
	return ($plainText);
}
/*
function base64url_decode($base64url){
	$base64 = base64_decode($base64url);
	$plainText = strtr($base64, '-_', '+/');
	return ($plainText);
}
*/
#$download_size = (10 * 1024 * 1024);
if(isset($_GET['url'])){
	$url = $_GET['url'];
	#echo $url . PHP_EOL;
	#echo "<br>" . PHP_EOL;
	$decoded_url = $url;
	if (!str_starts_with($url, 'http')) {
		$decoded_url = base64url_decode($url);
	}
	
	#echo "decoded_url: " . $decoded_url;
	#$url = 'https://example.com/some-url?q=test';
	#echo "<br>" . PHP_EOL;

	// Sanitize the URL
	$sanitizedUrl = filter_var($decoded_url, FILTER_SANITIZE_URL);

	#echo "base64_decode: sanitizedUrl: " . $sanitizedUrl;
	#echo "<br>" . PHP_EOL;
	#exit();


	// Check if the URL is valid
	if (filter_var($sanitizedUrl, FILTER_VALIDATE_URL)) {
	    // Valid URL, perform further actions
	    #echo "Valid URL: " . $sanitizedUrl;
	
		if (!function_exists('curl_init')) {
		    die('cURL is not installed on your server.');
		}
	
		//initiate CURL request
		$curl = curl_init();
	    curl_setopt_array($curl, array(
			CURLOPT_URL            => $sanitizedUrl,
			CURLOPT_RETURNTRANSFER => TRUE,
			#CURLOPT_SSL_VERIFYPEER => FALSE, // remove this on production 
			#CURLOPT_HTTPHEADER     => $headers,
			CURLOPT_CUSTOMREQUEST  => 'GET',
			//CURLOPT_NOBODY         => TRUE,
			CURLOPT_FOLLOWLOCATION => TRUE,
			CURLOPT_BUFFERSIZE     => 128,
			CURLOPT_NOPROGRESS     => FALSE,
			CURLOPT_PROGRESSFUNCTION => function($DownloadSize, $Downloaded, $UploadSize, $Uploaded){
		    		return ($Downloaded > (10 * 1024 * 1024)) ? 1 : 0; // maximum file size is 10MB
				})
	    );

		$response = curl_exec($curl);
		$err      = curl_error($curl);

		curl_close($curl);
		
		$status_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		$mime_type = curl_getinfo($curl, CURLINFO_CONTENT_TYPE);
		
		#echo $mime_type;
		
		

		if ($err) {
			header('Content-Type: application/json');
			#echo "ERROR";
			echo json_encode($err);
			
		} else {
			
			
			
			#echo $response;
			
			if($status_code == 404){
				echo '{"error":"404 file not found: ' . $sanitizedUrl  . '"}';
			}
			else
			if($status_code == 200){
				
				if(isset($_GET['preview'])){
					if(str_starts_with($mime_type, 'image')){
						
						#header('Content-Type: ' . $mime_type);
						
						#echo $response;
					}
					
					header('Content-Type: ' . $mime_type);
					header('Content-Length: ' . strlen($response));
					header('X-Frame-Options: SAMEORIGIN');
					echo $response;
				}
				else{
					
					#$base64_data = ;
					
					$json_response = array(
					    "base64_data" => base64_encode($response),
					    "mime_type" => $mime_type,
					);
				
					$encoded = json_encode($json_response);
				
					#$encoded = base64_encode($response);
					header('Content-Length: ' . strlen($encoded));
					header('Content-Type: application/json');
					echo $encoded;
				}
				
			}
			else{
				 echo '{"error":"invalid status code: ' . $status_code  . '"}';
			}
			
			/*
		  json_decode($response);
		  if (json_last_error() === JSON_ERROR_NONE) {
		    header('Content-Type: application/json');
		  }
		  echo $response;
			*/
		}
	
	
	} else {
	    // Invalid URL
	    echo '{"error":"invalid URL"}';
	}


	//retrieve request headers
	#$headers = array();
	#foreach (getallheaders() as $header_name => $header_value) {
	#  if (strpos($header_name, 'Content-Type') === 0  ||  strpos($header_name, 'Authorization') === 0 || strpos($header_name, 'X-Requested-With') === 0) {
	#    $header_name = strtolower($header_name);
	#    $headers[] =  $header_name . ":" . $header_value;
	#  }
	#}


	#$url = $_REQUEST['cors'];

	
}

?>