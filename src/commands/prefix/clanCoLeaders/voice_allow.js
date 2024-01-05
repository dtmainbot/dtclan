const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const ClanManagerSchema = require('../../../schemas/clanManagerSchema');
const ClansSchema = require('../../../schemas/ClansSchema');
const config = require('../../../config');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: {
        name: 'voiceallow',
        description: 'Permit a Role/User in you clan channels.',
        aliases: ['allowvoice'],
        cooldown: 8000,
    },
    /**
     * @param {ExtendedClient} client
     * @param {Message} message
     * @param {[String]} args
     */
    run: async (client, message, args) => {
        // Check if the user executing the command is a clan leader or co-leader
        const guildId = message.guild.id;
        const clanManagerSettings = await ClanManagerSchema.findOne({ guildId });

        if (!clanManagerSettings) {
            return message.reply({content: '- <a:attention1:1184524624793448498> Clan management settings not found for this server.', flags: [ 4096 ]});
        }

        const { clanLeaderRoleId, clanCoLeaderRoleId } = clanManagerSettings;
        const member = message.guild.members.cache.get(message.author.id);

        if (!member.roles.cache.has(clanLeaderRoleId) && !member.roles.cache.has(clanCoLeaderRoleId)) {
            return message.reply({content: '- <a:attention1:1184524624793448498> You do not have the necessary role to execute this command.', flags: [ 4096 ]});
        }

        // Check if there are subcommands
        const subcommand = args[0];
        if (!subcommand) {
            return message.reply({content: '- <a:attention1:1184524624793448498> Please provide a subcommand: `user` or `role`.', flags: [ 4096 ]});
        }

        if (subcommand === 'user') {
            const userMention = args[1];
            const userId = getUserIdFromMention(userMention);
            const targetUser = message.guild.members.cache.get(userId);

            if (!targetUser) {
                return message.reply({content: '- <a:attention1:1184524624793448498> Invalid user ID or user not found.', flags: [ 4096 ]});
            }

            // Implement logic to update permissions for voice and chat channels for the clan
            const clanInfo = await getClanInfo(guildId, message);
            if (!clanInfo) {
                return message.reply({content: '- <a:attention1:1184524624793448498> Clan information not found for this server.', flags: [ 4096 ]});
            }

            await updateChannelPermissions(clanInfo, targetUser, message);

            message.reply({content: `- Permissions granted to user <@${targetUser.id}> in your clan voice.`, flags: [ 4096 ]});
        } else if (subcommand === 'role') {
            // Implement logic for allowing a role
            const roleMention = args[1];
            const roleId = getRoleIdFromMention(roleMention);
            const targetRole = message.guild.roles.cache.get(roleId);

            if (!targetRole) {
                return message.reply({content: '- <a:attention1:1184524624793448498> Invalid role ID or role not found.', flags: [ 4096 ]});
            }

            // Implement logic to update permissions for voice and chat channels for the clan
            const clanInfo = await getClanInfo(guildId, message);
            if (!clanInfo) {
                return message.reply({content: '- <a:attention1:1184524624793448498> Clan information not found for this server.', flags: [ 4096 ]});
            }

            await updateChannelPermissions(clanInfo, targetRole, message);

            message.reply({content: `- Permissions granted to role <@&${targetRole.id}> in your clan Voice.`, flags: [ 4096 ]});
        } else {
            return message.reply('- Invalid subcommand. Please use `user` or `role`.');
        }
    },
};

// Helper functions to extract IDs from mentions
function getUserIdFromMention(mention) {
    const matches = mention.match(/^<@!?(\d+)>$/);
    return matches ? matches[1] : null;
}

function getRoleIdFromMention(mention) {
    const matches = mention.match(/^<@&(\d+)>$/);
    return matches ? matches[1] : null;
}

// Helper function to retrieve clan information from the database
async function getClanInfo(guildId, message) {
    const clanInfo = await ClansSchema.findOne({ guildId });
    if (!clanInfo) {
        message.reply('- Clan information not found for this server.');
        return null;
    }
    return clanInfo;
}

// Helper function to update channel permissions for a user or role
async function updateChannelPermissions(clanInfo, target, message) {
    const clanVoiceChannelId = clanInfo.clanVoiceChannelId;

    // Update permissions for the chat channel
    const clanVoiceChannel = message.guild.channels.cache.get(clanVoiceChannelId);
    await clanVoiceChannel.permissionOverwrites.create(target, {
        SendMessages: true,
        ReadMessageHistory: true,
        ViewChannel: true,
        Connect: true,
    });
}
