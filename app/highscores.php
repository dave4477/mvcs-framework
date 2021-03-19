<?

  session_start();

  require ("./lib/cleanPost.php");
  require ("./lib/highscores.php");

  $name = $cp->request('name');
  $score = $cp->request('score');

  $hs = (isset($_SESSION['highscore'])) ? unserialize($_SESSION['highscore']) : new Highscore(session_id());

  if (!empty($hs))
  {
    if (!empty($name) &&! empty($score))
    {
      print $hs->addHighscore($name, $score, session_id());
    }
    else
    {
      print $hs->getHighScores();
    }
  }


?>