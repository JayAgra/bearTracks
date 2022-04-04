<?php
if (isset($_POST['entry_match'])) {
  if ($_POST['entry_key'] === 'ADMINKEY') {
    $target = $_POST['entry_match'];
    class formDB extends SQLite3
     {
        function __construct()
           {
             $this->open('data.db');
           }
     }
    $db = new formDB();
    //execute
    
    //close DB
    $db->close();
  }
}
?>
