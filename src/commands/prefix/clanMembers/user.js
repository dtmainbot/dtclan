const { EmbedBuilder } = require('discord.js');
const moment = require('moment');
const ClansModel = require('../../../schemas/ClansSchema');
const ClanManagerSchema = require('../../../schemas/clanManagerSchema');
const config = require('../../../config');

module.exports = {
    structure: {
        name: 'user',
        description: 'Get the status of a user in the clan manager.',
        aliases: ['userstats'],
        permissions: 'SendMessages',
        cooldown: 5000,
    },
    /**
     * @param {ExtendedClient} client
     * @param {Message} message
     * @param {[String]} args
     */
    run: async (client, message, args) => {
        const guildId = message.guild.id;
        let targetUser = message.author;

        // If a user is mentioned or an ID is provided, use that user; otherwise, use the message author
        if (args.length > 0) {
            targetUser = message.mentions.users.first() || client.users.cache.get(args[0]) || targetUser;
        }

        const clanData = await ClansModel.findOne({
            guildId,
            'members.userId': targetUser.id,
        });

        if (!clanData) {
            return message.reply(`- <a:attention1:1184524624793448498> ${targetUser.tag} is not a member of any clan in this server.`);
        }

        const clanManagerData = await ClanManagerSchema.findOne({ guildId });

        // Get the clan role name
        const clanRole = message.guild.roles.cache.get(clanData.clanRoleId);
        const clanRoleid = clanRole ? clanRole.id : 'Unknown Clan Role';

        // Build the embed based on the target user's role in the clan
        const embed = new EmbedBuilder()
            .setDescription(`- ID\n - ${targetUser.id}`)
            .setAuthor({ name: targetUser.username, iconURL: targetUser.displayAvatarURL() })
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: 'Clan', value: `<@&${clanRoleid}>`, inline: true }
            )
            .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() });

        const memberData = clanData.members.find((m) => m.userId === targetUser.id);

        if (clanData.clanLeaderId === targetUser.id) {
            const clanLeaderRole = message.guild.roles.cache.get(clanManagerData?.clanLeaderRoleId);
            if (clanLeaderRole) {
                embed.addFields(
                    { name: 'Status', value: `${clanLeaderRole}`, inline: true }
                ).setColor(clanLeaderRole.color || '#ff0000'); // Set color based on Clan Leader role color, or default to red
            } else {
                // Handle the case when the role is not found
                embed.addFields(
                    { name: 'Status', value: '\`Clan Leader\`', inline: true }
                ).setColor('#ff0000'); // Set a default color
            }
        } else if (clanData.coLeaders.includes(targetUser.id)) {
            const coLeaderRole = message.guild.roles.cache.get(clanManagerData?.clanCoLeaderRoleId);
            if (coLeaderRole) {
                embed.addFields(
                    { name: 'Status', value: `${coLeaderRole}`, inline: true }
                ).setColor(coLeaderRole.color || '#00ff00'); // Set color based on Clan Co-Leader role color, or default to green
            } else {
                // Handle the case when the role is not found
                embed.addFields(
                    { name: 'Status', value: '\`Clan Co-Leader\`', inline: true }
                ).setColor('#00ff00'); // Set a default color
            }
        } else {
            embed.addFields(
                { name: 'Status', value: '\`Clan Member\`', inline: true }
            ).setColor('#0000ff'); // Set color for Clan Member
        }
        if (targetUser.joinedAt) {
            embed.addFields({ name: 'Server Join Time', value: `${targetUser.joinedAt}`, inline: true });
        }

        // Add account creation time field if available
        if (targetUser.createdAt) {
            embed.addFields({ name: 'Account Creation Time', value: `<t:${targetUser.createdAt}:R>`, inline: true });
        }


        message.channel.send({ embeds: [embed] });
    },
};
