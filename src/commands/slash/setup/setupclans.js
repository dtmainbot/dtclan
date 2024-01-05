const { SlashCommandBuilder, ChannelType } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const ClanManagerSchema = require('../../../schemas/clanManagerSchema');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('setup_clan_manager')
        .setDescription('Set up clan management settings.')
        .addRoleOption(option => option
            .setName('clan_manager_role')
            .setDescription('Select the clan manager role.')
            .setRequired(true)
        )
        .addRoleOption(option => option
            .setName('clan_leader_role')
            .setDescription('Select the clan leader role.')
            .setRequired(true)
        )
        .addRoleOption(option => option
            .setName('clan_co_leader_role')
            .setDescription('Select the clan co-leader role.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('clan_voices_category')
            .setDescription('Enter the ID of the category for clan voice channels.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('clan_chat_voices_category')
            .setDescription('Enter the ID of the category for clan chat voice channels.')
            .setRequired(true)
        )
        .addChannelOption(option => option
            .setName('clan_logs_channel')
            .setDescription('Select the channel for clan logs.')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        ),
    run: async (client, interaction) => {
        try {
            // Check if the user has ADMINISTRATOR permission
            if (!interaction.member.permissions.has(`Administrator`)) {
                return interaction.reply({content: 'You do not have the permission to use this command.', flags: [4096], ephemeral: true});
            }

            const guildId = interaction.guild.id;
            const clanManagerRoleId = interaction.options.get('clan_manager_role').role.id;
            const clanLeaderRoleId = interaction.options.get('clan_leader_role').role.id;
            const clanCoLeaderRoleId = interaction.options.get('clan_co_leader_role').role.id;
            const clanVoicesCategoryId = interaction.options.getString('clan_voices_category');
            const clanChatVoicesCategoryId = interaction.options.getString('clan_chat_voices_category');
            const clanLogsChannelId = interaction.options.get('clan_logs_channel').channel.id;

            // Check if the provided category IDs contain only numeric characters
            const isNumeric = /^\d+$/.test(clanVoicesCategoryId) && /^\d+$/.test(clanChatVoicesCategoryId);

            if (!isNumeric) {
                return interaction.reply('Invalid category IDs. Please provide valid numeric IDs for the categories.');
            }

            const setupData = {
                guildId,
                clanManagerRoleId,
                clanLeaderRoleId,
                clanCoLeaderRoleId,
                clanVoicesCategoryId,
                clanChatVoicesCategoryId,
                clanLogsChannelId,
            };

            // Save the setup data to MongoDB using ClanManagerSchema
            await ClanManagerSchema.findOneAndUpdate({ guildId }, setupData, { upsert: true });

            // Respond to the user indicating success
            interaction.reply('Clan manager settings have been updated successfully.');
        } catch (error) {
            console.error('Error setting up clan manager:', error);
            interaction.reply('An error occurred while setting up clan manager settings.');
        }
    }
};
