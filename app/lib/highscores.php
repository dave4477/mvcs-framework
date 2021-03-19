<?

  require ("./lib/database.php");


  class Highscore extends DBmysql
  {
    var $uid;
    function Highscore($uid)
    {
      $this->uid	= $uid;
    }

    function addHighscore($name, $score, $sessionid = "")
    {
      if ($sessionid == $this->uid)
      {
        if (!empty($name) && !empty($score))
        {
          $main_query = "insert into `highscores` (id,game,name,score,date) values(null,'game2','$name','$score',NOW())";
          $main_result = $this->query($main_query);
          return 1;
        }
        else
        {
          return 0;
        }
      }
      else
      {
        return "Nice try";
      }
    }

    function getHighScores()
    {
      $xml = '{"names":[';

      $main_query = "select * from `highscores` where `game`='game2' order by `score` desc";
      $main_result = $this->query($main_query);
      $num_rows = $this->numrows($main_result);
      for ($i = 0; $i < $num_rows; $i++)
      {
        $name = $this->result($main_result, $i, 'name');
        $score = $this->result($main_result, $i, 'score');
        $date = $this->result($main_result, $i, 'date');
   
        $xml .= '{"name":"' .$name. '", "score":' .$score. '}';
        if ($i < $num_rows -1) {
            $xml .= ',';
        }
      }
      $xml .= ']}';

      return $xml;
    }
  }


?>