const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, token } = require('./config.json');

const commands = [
new SlashCommandBuilder()
  .setName('matches')
  .setDescription('Get upcoming matches')
	.addIntegerOption(option =>
		option.setName('season')
			.setDescription('Current Year')
			.setRequired(true))
  .addStringOption(option =>
      option.setName('eventcode')
  		.setDescription('Event Code')
			.setRequired(true))
  .addIntegerOption(option =>
      option.setName('teamnum')
  		.setDescription('Your Team Number')
			.setRequired(true))
  .addStringOption(option =>
      option.setName('tlevel')
  		.setDescription('Level')
			.setRequired(true)
			.addChoice('qualification', 'qualification')
			.addChoice('practice', 'practice')
			.addChoice('playoff', 'playoff')),
new SlashCommandBuilder()
			.setName('data')
			.setDescription('Get Team Data')
			  .addIntegerOption(option =>
				  option.setName('season')
					  .setDescription('Current Year')
					  .setRequired(true))
			.addStringOption(option =>
				option.setName('eventcode')
					.setDescription('Event Code')
					  .setRequired(true))
			.addIntegerOption(option =>
				option.setName('teamnum')
					.setDescription('Target Team Number')
					  .setRequired(true)),
new SlashCommandBuilder()
			.setName('pit')
			.setDescription('Get Team Pit Data')
			.addIntegerOption(option =>
				option.setName('season')
				.setDescription('Current Year')
				.setRequired(true))
		  	.addStringOption(option =>
				option.setName('eventcode')
				.setDescription('Event Code')
				.setRequired(true))
			.addIntegerOption(option =>
				option.setName('teamnum')
				.setDescription('Target Team Number')
				.setRequired(true)),
new SlashCommandBuilder()
			.setName('addscout')
			.setDescription('[LEAD SCOUT] Add user to scout team')
			.addUserOption(option =>
				option.setName('user')
				.setDescription('Target user')
				.setRequired(true))
			.addStringOption (option =>
			   option.setName('group')
			   .setDescription('Group to add scout to')
			   .setRequired(true)
				.addChoice('TeamA', 'Scout A')
				.addChoice('TeamB', 'Scout B')),
new SlashCommandBuilder()
			.setName('scoutteams')
			.setDescription('lists scout teams')
]
.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationCommands(clientId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);