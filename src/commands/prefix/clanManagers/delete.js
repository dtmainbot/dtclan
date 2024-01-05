const { Permissions, EmbedBuilder } = require('discord.js');
const ClansSchema = require('../../../schemas/ClansSchema');
const ClanManagerSchema = require('../../../schemas/clanManagerSchema');

module.exports = {
    structure: {
        name: 'delete',
        description: 'Delete a clan by its key.',
        aliases: [`dl`],
        //permissions: 'Administrator',
        cooldown: 20000
    },
    /**
     * @param {ExtendedClient} client
     * @param {Message} message
     * @param {[String]} args
     */
    run: async (client, message, args) => {
        try {
            // Check if the command is executed in the correct guild
            const guildSettings = await ClanManagerSchema.findOne({ guildId: message.guild.id });
            if (!guildSettings) {
                return message.reply('- <a:attention1:1184524624793448498> Clan management settings not configured for this server.');
            }

            // Check if the user has administrator permissions or the clan manager role
            const hasAdministratorPermission = message.member.permissions.has('Administrator');
            const hasClanManagerRole = message.member.roles.cache.some(role => role.id === guildSettings.clanManagerRoleId);

            if (!hasAdministratorPermission && !hasClanManagerRole) {
                return message.reply({ content: '- <a:attention1:1184524624793448498> You do not have the required permissions to use this command.', flags: [4096] });
            }

            // Check if the command has the correct number of arguments
            if (args.length !== 1) {
                return message.reply({ content: '- <a:attention1:1184524624793448498> Please provide the clan key to delete.', flags: [4096] });
            }

            const clanKeyToDelete = args[0];

            // Find the clan in the database
            const clanToDelete = await ClansSchema.findOne({
                guildId: message.guild.id,
                clanKey: clanKeyToDelete,
            });

            if (!clanToDelete) {
                return message.reply({ content: '- <a:attention1:1184524624793448498> Clan not found with the specified key.', flags: [4096] });
            }

            // Check if the bot can delete the clan role
            const botRolePosition = message.guild.me?.roles?.highest.position;
            const clanRole = message.guild.roles.cache.get(clanToDelete.clanRoleId);

            if (!clanRole || (clanRole.position !== undefined && clanRole.position >= botRolePosition)) {
                return message.reply({ content: '- The bot cannot delete the clan role (the clan role is higher than the bot role).', flags: [4096] });
            }

            // Delete the clan role
            await clanRole.delete().catch(error => {
                console.error(`- Error deleting clan role for key ${clanKeyToDelete}:`, error);
                return message.reply({ content: '- <a:attention1:1184524624793448498> An error occurred while deleting the clan role.', flags: [4096] });
            });

            // Delete the clan from the database
            await ClansSchema.findOneAndDelete({
                guildId: message.guild.id,
                clanKey: clanKeyToDelete,
            });

            // Additional cleanup steps (e.g., reset nicknames, etc.) can be added here

            message.reply({ content: `- Clan with key "${clanKeyToDelete}" has been deleted successfully, including the clan role.`, flags: [4096] });
        } catch (error) {
            console.error('- Error deleting clan:', error);
            message.reply({ content: '- <a:attention1:1184524624793448498> An error occurred while deleting the clan.', flags: [4096] });
        }
    },
};
