const { Message, MessageEmbed, EmbedBuilder } = require('discord.js');
const ClansSchema = require('../../../schemas/ClansSchema');
const config = require('../../../config');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: {
        name: 'removeuser',
        description: 'Remove a user from the clan.',
        aliases: ['userremove'],
        cooldown: 20000,
    },
    /**
     * @param {ExtendedClient} client
     * @param {Message} message
     * @param {[String]} args
     */
    run: async (client, message, args) => {
        try {
            // Fetch the guild settings from the database
            const guildId = message.guild.id;
            const guildSettings = await ClansSchema.findOne({ guildId });

            if (!guildSettings) {
                return message.reply({ content: '- Clan management settings not configured for this server.', flags: [4096] });
            }

            // Check if the user executing the command is a clan leader or co-leader
            const isClanLeader = message.author.id === guildSettings.clanLeaderId;
            const isCoLeader = guildSettings.coLeaders.includes(message.author.id);

            if (!(isClanLeader || isCoLeader)) {
                return message.reply({ content: '- You do not have the required permissions to use this command.', flags: [4096] });
            }

            // Extract the target user ID from the command arguments
            const targetUserId = args[0]?.replace(/[<@!>]/g, '');

            if (!targetUserId) {
                return message.reply({ content: '- <a:attention1:1184524624793448498> Please provide a valid user ID or mention.', flags: [4096] });
            }

            // Fetch the clan information for the user executing the command
            const existingClan = await ClansSchema.findOne({
                guildId,
                $or: [
                    { clanLeaderId: message.author.id },
                    { coLeaders: message.author.id },
                ],
            });

            if (!existingClan) {
                return message.reply({ content: '- <a:attention1:1184524624793448498> You do not have a clan in this server.', flags: [4096] });
            }

            // Check if the targeted user is a member of the correct clan
            const isTargetUserInClan = existingClan.members.some(member => member.userId === targetUserId);
            if (!isTargetUserInClan) {
                return message.reply({ content: `- <a:attention1:1184524624793448498> The user with ID ${targetUserId} is not a member of your clan.`, flags: [4096] });
            }

            // Fetch the guild member corresponding to the target user
            const targetUser = await message.guild.members.fetch(targetUserId).catch(() => null);

            if (!targetUser) {
                return message.reply({ content: '- <a:attention1:1184524624793448498> The specified user is not a member of this server.', flags: [4096] });
            }

            // Check if the targeted user has the clan tag in their name
            const userTag = existingClan.tag.replace('{user}', '');
            if (targetUser.displayName.startsWith(userTag)) {
                // Reset the nickname to the default one
                await targetUser.setNickname(null);
            }

            // Remove the targeted user from the clan's members array
            existingClan.members = existingClan.members.filter((member) => member.userId !== targetUserId);

            // Save the updated clan information to the database
            await existingClan.save();

            // Check if the targeted user has the clan role
            const clanRole = message.guild.roles.cache.get(existingClan.clanRoleId);

            if (clanRole && targetUser.roles.cache.has(clanRole.id)) {
                // Remove the clan role from the targeted user
                await targetUser.roles.remove(clanRole).catch(() => null);
            }

            // Send a direct message to the targeted user
            const kickDate = new Date().toLocaleString();
            const kickMessage = new EmbedBuilder()
                .setColor(config.color)
                .setTitle(`You have been kicked from the clan in ${message.guild.name}`)
                .setDescription(`You have been kicked from the clan \`${existingClan.name}\` in this server by <@${message.author.id}>`)
                .addFields(
                    { name: 'Kick Date', value: kickDate }
                )
                .setFooter({
                    text: `${existingClan.clanKey}`,
                });

            await targetUser.send({ embeds: [kickMessage], flags: [4096] });

            message.reply({ content: `- The user with ID ${targetUserId} has been removed from your clan.`, flags: [4096] });
        } catch (error) {
            console.error('- Error removing user:', error);
            message.reply({ content: '- <a:attention1:1184524624793448498> An error occurred while removing the user from the clan.', flags: [4096] });
        }
    },
};




