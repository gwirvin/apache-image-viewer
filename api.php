<?php
$root = realpath(__DIR__ . '/../'); // one level up to /images

function safe_path($path) {
  global $root;
  if (trim($path) === '') return $root;
  $full = realpath($root . '/' . $path);
  if (!$full || strpos($full, $root) !== 0) die("Invalid path");
  return $full;
}

function generate_thumbnail($src, $thumb_path) {
  if (file_exists($thumb_path)) return;
  $ext = strtolower(pathinfo($src, PATHINFO_EXTENSION));
  if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) return;

  $img = match($ext) {
    'jpg', 'jpeg' => imagecreatefromjpeg($src),
    'png'        => imagecreatefrompng($src),
    'webp'       => imagecreatefromwebp($src),
    default      => null
  };

  if (!$img) return;

  $thumb_width = 300;
  $thumb_height = 300;
  $width = imagesx($img);
  $height = imagesy($img);
  $scale = min($thumb_width / $width, $thumb_height / $height);

  $new_w = (int)($width * $scale);
  $new_h = (int)($height * $scale);

  $thumb = imagecreatetruecolor($new_w, $new_h);
  imagecopyresampled($thumb, $img, 0, 0, 0, 0, $new_w, $new_h, $width, $height);

  @mkdir(dirname($thumb_path), 0755, true);
  imagejpeg($thumb, $thumb_path, 80);
  imagedestroy($img);
  imagedestroy($thumb);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $dir = isset($_GET['dir']) ? $_GET['dir'] : '';
  $path = safe_path($dir);
  $files = scandir($path);
  $out = [];

  foreach ($files as $file) {
    if ($file === '.' || $file === '..') continue;
    $full = "$path/$file";
    $relative = ltrim($dir . '/' . $file, '/');

    if (is_dir($full)) {
      $out[] = [ "name" => $file, "type" => "dir" ];
    } else if (preg_match('/\.(jpg|jpeg|png|webp|gif)$/i', $file)) {
      $thumb = $root . '/.thumbnails/' . $relative;
      generate_thumbnail($full, $thumb);
      $out[] = [
        "name" => $file,
        "type" => "file",
        "path" => "$relative",
        "thumb" => "/.thumbnails/$relative"
      ];
    }
  }

  header('Content-Type: application/json');
  echo json_encode($out);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $data = json_decode(file_get_contents('php://input'), true);
  $action = $data['action'];
  $path = safe_path($data['path']);

  if ($action === 'delete') {
    unlink($path);
    echo "deleted";
  } else if ($action === 'move') {
    $destDir = $root . '/Control_Images';
    if (!file_exists($destDir)) mkdir($destDir, 0755, true);
    rename($path, $destDir . '/' . basename($path));
    echo "moved";
  }
  exit;
}

