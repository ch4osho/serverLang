<?php

$db = new mysqli('localhost', 'root', 'root', 'test_data_base');

$sql = "select * from person";

$result = $db -> query($sql);

var_dump($db);
echo json_encode($result);
