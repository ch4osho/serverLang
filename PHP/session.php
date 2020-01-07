<?php
    session_start();
    $_SESSION["username"]="skygao";
    $_SESSION["uid"]=1;
    $_SESSION["job"]="teacher";
    $_SESSION["age"]="21";
    $_SESSION["event"]="login";
    echo $_SESSION['username'].$_SESSION["uid"]. $_SESSION["job"];