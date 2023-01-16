const sqlite3 = require('sqlite3');

function teamData(team, event) {
    //data:
    
    //BASIC DATA
    //event is event code
    //name is scout name
    //team is scouted team
    //match is match number
    //level is the level of the match

    //AUTON
    //game1 is BOOL taxi (3pts)
    //game2 is BOOL bottom row score (3pts)
    //game3 is BOOL middle row score (4pts)
    //game4 is BOOL top row score (6pts)
    //game5 is INT 0/8/12 no dock or engage/dock no engage/dock and engage


    //TELEOP
    //game 6 is BOOL bottom row score
    //game 7 is BOOL middle row score
    //game 8 is BOOL top row score
    //game 9 is BOOL coop bonus (alliance)
    //game 10 is INT 0/2/6/10

    //AFTER MATCH
    //game11 is INT est cycle time
    //teleop is STRING thoughts about teleop phase
    //defend is STRING about robot defence
    //driving is STRING about the robot's driver
    //overall is STRING as overall thoughts about the team
    
    //UNUSED VALUES
    //game12 - game25 is INT (0)
    //formType is STRING the form that was submitted and is not entered into db

    db.get('SELECT * FROM data WHERE team=${team} AND event="${event} ORDER BY id ASC LIMIT 1', (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log(result);
        }
    })
}
  
function pitData(team, event) {
    //data:

    //BASIC DATA
    //event is event code
    //name is scout name
    //team is scouted team
    
    //PIT SCOUTING DATA
    //drivetype is STRING what drive type
    //driveTeam is INT how many **days** of drive team work on this robot
    //attended is INT how many other events has team attended
    //overall is STRING overall thoughts

    //UNUSED VALUES
    //game1 - game20 is INT (0)
    //formType is STRING the form that was submitted and is not entered into db
}
  
module.exports = { teamData, pitData };