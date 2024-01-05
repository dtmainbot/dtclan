const { Message, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const ClansSchema = require('../../../schemas/ClansSchema');
const ClanManagerSchema = require('../../../schemas/clanManagerSchema');
const config = require('../../../config');

module.exports = {
    structure: {
        name: 'leaveclan',
        description: 'Leave your current clan',
        aliases: ['leave'],
        permissions: 'SendMessages',
        cooldown: 5000,
    },
    /**
     * @param {ExtendedClient} client
     * @param {Message} message
     * @param {[String]} args
     */
    run: async (client, message, args) => {
        try {
            const userId = message.author.id;
            const guildId = message.guild.id;

            // Check if the user is in a clan
            const userClan = await ClansSchema.findOne({
                guildId,
                members: { $elemMatch: { userId } },
            });

            if (!userClan) {
                return message.reply({content: '- <a:attention1:1184524624793448498> You are not a member of any clan.', flags: [4096], ephemeral: true});
            }

            // Check if the user is the clan leader
            if (userClan.clanLeaderId === userId) {
                return message.reply({content: '- <a:attention1:1184524624793448498> You are a clan leader. Please speak with a clan manager to delete your clan.', flags: [4096], ephemeral: true});
            }

            // Get user member object
            const member = message.guild.members.cache.get(userId);

            // Remove user from the clan members
            await ClansSchema.updateOne(
                { guildId, 'members.userId': userId },
                { $pull: { members: { userId } } }
            );

            // Remove clan role from the user
            const clanRole = message.guild.roles.cache.get(userClan.clanRoleId);
            if (clanRole) {
                await member.roles.remove(clanRole);
            }

            // Check if the user has the clan tag in their name
            const userTag = userClan.tag.replace('{user}', '');
            if (member.displayName.startsWith(userTag)) {
                // Reset the nickname to the default one
                await member.setNickname(null);
            }

            // Check if the user is the clan leader after leaving
            const updatedUserClan = await ClansSchema.findOne({
                guildId,
                clanLeaderId: userId,
            });

            if (!updatedUserClan) {
                // If the user is no longer a clan leader, remove the clan from the ClanManagerSchema
                await ClanManagerSchema.updateOne(
                    { guildId },
                    { $pull: { clans: { clanKey: userClan.clanKey } } }
                );
            }

            // Send a completion embed
            const embed = new EmbedBuilder()
                .setTitle(`✅You have successfully left your clan...`)
                .setColor(config.color);

            message.reply({ embeds: [embed], flags: [4096], ephemeral: true });

        } catch (error) {
            console.error('Error in leaveclan command:', error);
            message.reply('- <a:attention1:1184524624793448498> An error occurred while processing the command.');
        }
    },
};
