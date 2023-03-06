const sqlite3 = require('sqlite3');
const { EmbedBuilder } = require('discord.js');
const { baseURL } = require('config.json');

function toIcons(str) {
  var step1 = str.replaceAll("0", "⬜");
  var step2 = step1.replaceAll("1", "🟪");
  return step2.replaceAll("2", "🟨");
}
function fullGridString(str, sep) {
  var strings = str.match(/.{1,9}/g)
  var iconstrings = [];
  iconstrings.push(toIcons(strings[0]))
  iconstrings.push(toIcons(strings[1]))
  iconstrings.push(toIcons(strings[2]))
  return iconstrings.join(sep);
}

function valueToEmote(value) {
  if (value == null || value == "false") {
    return "❌";
  } else {
    return "✅";
  }
}

function teamData(season, team, event, interaction) {
  if (event == "NONE") {
    return interaction.reply({
      content: "We are not competing, so you must specify the event code!",
      ephemeral: true
    })
  }
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

    let db = new sqlite3.Database('data.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        return interaction.reply({
          content: "Error getting data!",
          ephemeral: true
        })
      }
    });    
    db.get(`SELECT * FROM main WHERE team=${team} AND event="${event}" AND season="${season}" ORDER BY id DESC LIMIT 1`, (err, result) => {
        if (err) {
          console.log(err);
          return interaction.reply({
            content: "Error getting data!",
            ephemeral: true
          })
        } else {
          if (result) {
          const teamEmbed = new EmbedBuilder()
          .setColor('#181f2f')
          .setTitle(`Data from team ${team}'s last match:`)
          .setThumbnail('https://www.firstinspires.org/sites/default/files/uploads/resource_library/brand/thumbnails/FRC-Vertical.png')
          .setDescription(`Match ${result.match} (${result.level}) ${event}, 2023\n\nGrid: \n${fullGridString((result.game12).toString(), '\n')}`)
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
          .setFooter({ text: `Scout: ${result.discordName}#${result.discordTag}`, iconURL: `https://cdn.discordapp.com/avatars/${result.discordID}/${result.discordAvatarId}.png?size=1024` });
          return interaction.reply({embeds: [teamEmbed]});
          } else {
            return interaction.reply({
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
  
function pitData(season, team, event, interaction) {
  if (event == "NONE") {
    return interaction.reply({
      content: "We are not competing, so you must specify the event code!",
      ephemeral: true
    })
  }
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
        return interaction.reply({
          content: `Error getting data! ${err}`,
          ephemeral: true
        })
      }
    });
    db.get(`SELECT * FROM pit WHERE team=${team} AND event="${event}" AND season="${season}" ORDER BY id DESC LIMIT 1`, (err, pitresult) => {
        if (err) {
          console.log(err);
          return interaction.reply({
            content: `Error getting data! ${err}`,
            ephemeral: true
          })
        } else {
          if (pitresult) {
          const pitEmbed = new EmbedBuilder()
          .setColor('#181f2f')
          .setTitle(`Pit data for team ${team}:`)
          .setThumbnail('https://www.firstinspires.org/sites/default/files/uploads/resource_library/brand/thumbnails/FRC-Vertical.png')
          .setDescription(`${event}, 2023`)
          .addFields({
            name: 'Drive Type',
            value: `${pitresult.drivetype}`,
            inline: true
          },{
            name: 'Drive team work',
            value: `${pitresult.driveTeam} day(s)`,
            inline: true
          },{
            name: 'Overall',
            value: `Response: ${pitresult.overall}`,
            inline: true
          },{
            name: 'Images',
            value: `[Image 1](${baseURL}images/${pitresult.image1}\n[Image 2](${baseURL}images/${pitresult.image2})\n[Image 3](${baseURL}images/${pitresult.image3}\n[Image 4](${baseURL}images/${pitresult.image4}\n[Image 5](${baseURL}images/${pitresult.image5}`,
            inline: true
          })
          .setTimestamp()
          .setFooter({ text: `Scout: ${pitresult.discordName}#${pitresult.discordTag}`, iconURL: `https://cdn.discordapp.com/avatars/${pitresult.discordID}/${pitresult.discordAvatarId}.png?size=1024` });
          return interaction.reply({embeds: [pitEmbed]});
          } else {
            console.log(err, pitresult);
            return interaction.reply({
              content: `Error getting data! ${err} ${pitresult}`,
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

function createHTMLExport(dbQueryResult) {
  return `AUTO: <br>Taxi: ${valueToEmote(dbQueryResult.game1)}<br>Score B/M/T: ${valueToEmote(dbQueryResult.game2)}${valueToEmote(dbQueryResult.game3)}${valueToEmote(dbQueryResult.game4)}<br>Charging: ${dbQueryResult.game5} pts<br><br>TELEOP: <br>Score B/M/T: ${valueToEmote(dbQueryResult.game6)}${valueToEmote(dbQueryResult.game7)}${valueToEmote(dbQueryResult.game8)}<br>Charging: ${dbQueryResult.game10} pts<br><br>Other: <br>Alliance COOPERTITION: ${valueToEmote(dbQueryResult.game9)}<br>Cycle Time: ${dbQueryResult.game11} seconds<br>Defense: ${dbQueryResult.defend}<br>Driving: ${dbQueryResult.driving}<br>Overall: ${dbQueryResult.overall}<br>Grid:<br>${fullGridString((dbQueryResult.game12).toString(), "<br>")}`
}

module.exports = { teamData, pitData, createHTMLExport };