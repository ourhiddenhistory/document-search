<?php

if(isset($_REQUEST['submit'])):

$servername = "localhost";
$username = "useful_ciabase";
$password = trim(file_get_contents('../../ciabase_mysql'));
$database = "useful_ciabase";

// Create connection
$conn = new mysqli($servername, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully";


$sql = "SELECT *
FROM ciabase
WHERE
MATCH(entry, source) AGAINST ('{$_REQUEST['search']}' IN BOOLEAN MODE) OR
entrydates LIKE '{$_REQUEST['search']}' OR
subjectdesc LIKE '{$_REQUEST['search']}' OR
subject LIKE '{$_REQUEST['search']}'";

$result = $conn->query($sql) or die($conn->error);
while($row = $result->fetch_assoc())
{
  $rows[] = $row;
}
$json = json_encode($rows);

endif;

?>
<style>
input{
  width: 100%;
  font-size: 24px;
  border-radius: 3px;
  text-align: center;
  margin-bottom: 8px;
  padding: 4px;
  box-sizing: border-box;
}

form {
  text-align: center;
}

button {
  background: #3498db;
  background-image: -webkit-linear-gradient(top, #3498db, #2980b9);
  background-image: -moz-linear-gradient(top, #3498db, #2980b9);
  background-image: -ms-linear-gradient(top, #3498db, #2980b9);
  background-image: -o-linear-gradient(top, #3498db, #2980b9);
  background-image: linear-gradient(to bottom, #3498db, #2980b9);
  -webkit-border-radius: 28;
  -moz-border-radius: 28;
  border-radius: 28px;
  font-family: Arial;
  color: #ffffff;
  font-size: 20px;
  padding: 10px 20px 10px 20px;
  text-decoration: none;
}

button:hover {
  background: #3cb0fd;
  background-image: -webkit-linear-gradient(top, #3cb0fd, #3498db);
  background-image: -moz-linear-gradient(top, #3cb0fd, #3498db);
  background-image: -ms-linear-gradient(top, #3cb0fd, #3498db);
  background-image: -o-linear-gradient(top, #3cb0fd, #3498db);
  background-image: linear-gradient(to bottom, #3cb0fd, #3498db);
  text-decoration: none;
}

</style>

<h1>CIABASE Test</h1>
<form method="POST" action="ciabase.php">
  <input name="search" type="text" class="search-input" value="<?= isset($_REQUEST['search']) ? $_REQUEST['search'] : '' ?>" />
  <button name="submit" type="submit" class="search-js">Search</button>
</form>
<hr />
<ul class="results"></ul>

<script src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js'></script>
<script>

let docsObj = <?= $json ?> || [];

var displayResult = function(results) {
  $(".results").empty()
  console.log(results)
  for(i in results){
    let entryHtml = `
      <li>
        <p>
          ${results[i].entry.replace(/\*\*(.*)\*\*/, "<strong>$1</strong>")}<br />
          SOURCE: ${results[i].source} ${results[i].sourcepage}
          <em><small>subject</small> ${results[i].subject}${(results[i].subjectdesc ? "  (" + results[i].subjectdesc + ")" : "")}${(results[i].dates ? "  <small>year</small> " + results[i].dates : "")}</em><br />
        </p>
        <hr />
      </li>
    `;
    $(".results").append(entryHtml);
  }
};

displayResult(docsObj)

let idx;
let docs;


// prevent submission on enter
$(document).ready(function() {
  $(window).keydown(function(event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
  });
});

</script>
