const sqlite3 = require('sqlite3');
const { MessageEmbed } = require('discord.js');

function teamData(team, event, interaction) {
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
    function valueToEmote(value) {
      if (value == null || value == "false") {
        return "❌";
      } else {
        return "✅";
      }
    }
    let db = new sqlite3.Database('data.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        interaction.reply({
          content: "Error getting data!",
          ephemeral: true
        })
      }
    });
    db.get(`SELECT * FROM main WHERE team=${team} AND event="${event}" ORDER BY id DESC LIMIT 1`, (err, result) => {
        if (err) {
          interaction.reply({
            content: "Error getting data!",
            ephemeral: true
          })
          console.log(err);
        } else {
          if (result) {
          const teamEmbed = new MessageEmbed()
          .setColor('#ff00ff')
          .setTitle(`Data from team ${team}'s last match:`)
          .setThumbnail('https://www.firstinspires.org/sites/default/files/uploads/resource_library/brand/thumbnails/FRC-Vertical.png')
          .setDescription(`Match ${result.match} (${result.level}) ${event}, 2023`)
          .addFields({
            name: 'AUTO',
            value: `Taxi: ${valueToEmote(result.game1)} \nScore B/M/T: ${valueToEmote(result.game2)}${valueToEmote(result.game3)}${valueToEmote(result.game4)}`,
            inline: true
          },{
            name: 'AUTO Charging Points',
            value: `${result.game5} points`,
            inline: true
          },{
            name: 'TELEOP Score',
            value: `B/M/T ${valueToEmote(result.game6)}${valueToEmote(result.game7)}${valueToEmote(result.game8)}`,
            inline: true
          },{
            name: 'Alliance COOPERTITION',
            value: `${valueToEmote(result.game9)}`,
            inline: true
          },{
            name: 'TELEOP Charging Points',
            value: `${result.game10} points`,
            inline: true
          },{
            name: 'Cycle Time',
            value: `${result.game11} seconds`,
            inline: true
          },{
            name: 'Defense',
            value: `Response: ${result.defend}`,
            inline: true
          },{
            name: 'Driving',
            value: `Response: ${result.driving}`,
            inline: true
          },{
            name: 'Overall',
            value: `Response: ${result.overall}`,
            inline: true
          })
          .setTimestamp()
          .setFooter({ text: `Scout IP/ID: ${result.scoutIP}`, iconURL: 'https://cdn.discordapp.com/avatars/963588564166258719/bc096216d144f112594845fbe8a35e1c.png?size=1024' });
          return interaction.reply({embeds: [teamEmbed]});
          } else {
            interaction.reply({
              content: "Error getting data!",
              ephemeral: true
            })
          }
        }
    })
    db.close((err) => {
      if (err) {
      }
  });
}
  
function pitData(team, event, interaction) {
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
    
    let db = new sqlite3.Database('data.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        interaction.reply({
          content: "Error getting data!",
          ephemeral: true
        })
      }
    });
    db.get(`SELECT * FROM pit WHERE team=${team} AND event="${event}" ORDER BY id DESC LIMIT 1`, (err, result) => {
        if (err) {
          interaction.reply({
            content: "Error getting data!",
            ephemeral: true
          })
          console.log(err);
        } else {
          if (result) {
          const teamEmbed = new MessageEmbed()
          .setColor('#ff00ff')
          .setTitle(`Pit for team ${team}:`)
          .setThumbnail('https://www.firstinspires.org/sites/default/files/uploads/resource_library/brand/thumbnails/FRC-Vertical.png')
          .setDescription(`${event}, 2023`)
          .addFields({
            name: 'Drive Type',
            value: `${result.drivetype}`,
            inline: true
          },{
            name: 'Drive team work',
            value: `${result.driveTeam} days`,
            inline: true
          },{
            name: 'Other events attended',
            value: `${result.attended} events`,
            inline: true
          },{
            name: 'Overall',
            value: `Response: ${result.overall}`,
            inline: true
          })
          .setTimestamp()
          .setFooter({ text: `Scout IP/ID: ${result.scoutIP}`, iconURL: 'https://cdn.discordapp.com/avatars/963588564166258719/bc096216d144f112594845fbe8a35e1c.png?size=1024' });
          return interaction.reply({embeds: [teamEmbed]});
          } else {
            interaction.reply({
              content: "Error getting data!",
              ephemeral: true
            })
          }
        }
    })
    db.close((err) => {
      if (err) {
      }
  });
}
  
module.exports = { teamData, pitData };