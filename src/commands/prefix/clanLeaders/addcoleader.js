const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const ClanManagerSchema = require('../../../schemas/clanManagerSchema');
const ClansModel = require('../../../schemas/ClansSchema');
const config = require('../../../config');

module.exports = {
    structure: {
        name: 'addcol',
        description: 'Add a co-leader to your clan.',
        aliases: ['addcoleader'],
        permissions: ['SendMessages'],
        cooldown: 20000,
    },
    run: async (client, message, args) => {
        try {
            // Check if the user provided a valid user ID or mention
            const userId = args[0];

            if (!userId) {
                const embedError = new EmbedBuilder()
                    .setTitle('Error')
                    .setDescription('Please provide a valid user ID or mention.')
                    .setColor('#FF0000');

                return message.reply({ embeds: [embedError], flags: [4096] });
            }

            // Extract the user ID from mention or use the provided ID directly
            const extractedUserId = userId.startsWith('<@') && userId.endsWith('>') ?
                userId.slice(2, -1).replace('!', '') :
                userId;

            const guildId = message.guild.id;
            const clanLeaderId = message.author.id;
            const clan = await ClansModel.findOne({ 'members.userId': clanLeaderId, guildId }).exec();

            if (!clan || clanLeaderId !== clan.clanLeaderId) {
                const embedError = new EmbedBuilder()
                    .setTitle('Error')
                    .setDescription('You do not have the necessary roles to use this command.')
                    .setColor('#FF0000');

                return message.reply({ embeds: [embedError], flags: [4096] });
            }

            const guildSettings = await ClanManagerSchema.findOne({ guildId });
            const clanCoLeaderRoleId = guildSettings.clanCoLeaderRoleId;

            const targetMember = await message.guild.members.fetch(extractedUserId);
            if (!targetMember || targetMember.user.bot) {
                const embedError = new EmbedBuilder()
                    .setTitle('Error')
                    .setDescription('Please provide a valid user to add as a co-leader.')
                    .setColor('#FF0000');

                return message.reply({ embeds: [embedError], flags: [4096] });
            }

            const isClanMember = clan.members.some((member) => member.userId === extractedUserId);

            if (!isClanMember) {
                const embedError = new EmbedBuilder()
                    .setTitle('Error')
                    .setDescription('The specified user is not a member of the clan.')
                    .setColor('#FF0000');

                return message.reply({ embeds: [embedError], flags: [4096] });
            }

            if (clan.coLeaders.includes(extractedUserId)) {
                const embedError = new EmbedBuilder()
                    .setTitle('Error')
                    .setDescription('The specified user is already a co-leader in the clan.')
                    .setColor('#FF0000');

                return message.reply({ embeds: [embedError], flags: [4096] });
            }

            if (clan.coLeaders.length >= clan.clanColeadersNumber) {
                const embedError = new EmbedBuilder()
                    .setTitle('Error')
                    .setDescription(`The clan has reached the maximum number of co-leaders (${clan.clanColeadersNumber}).`)
                    .setColor('#FF0000');

                return message.reply({ embeds: [embedError], flags: [4096] });
            }

            // Add the user as a co-leader
            clan.coLeaders.push(extractedUserId);
            await clan.save();

            // Give the user the clan co-leader role
            if (clanCoLeaderRoleId) {
                const clanCoLeaderRole = message.guild.roles.cache.get(clanCoLeaderRoleId);
                if (clanCoLeaderRole) {
                    await targetMember.roles.add(clanCoLeaderRole).catch((error) => {
                        console.error(`- Error assigning clan co-leader role to ${extractedUserId}:`, error);
                    });
                }
            }

            // Send an embed to the clan logs channel
            const clanLogsChannel = message.guild.channels.cache.get(guildSettings.clanLogsChannelId);

            const embedSuccess = new EmbedBuilder()
                .setColor(config.color)
                .setTitle('Co-Leader Added')
                .setDescription(`Leader <@${clanLeaderId}> added <@${extractedUserId}> as a co-leader to the clan.`)
                .addFields({
                    name: 'Clan Name',
                    value: clan.name,
                    inline: true,
                })
                .addFields({ name: 'Clan Key', value: clan.clanKey, inline: true })
                .setTimestamp()
                .setFooter({
                    text: `Server: ${message.guild.name}`,
                    iconURL: message.guild.iconURL(),
                });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('dummy_button') // You can replace with an actual custom ID
                    .setLabel('Dummy Button')
                    .setStyle(2)
                    .setDisabled(true)
            );

            await clanLogsChannel.send({ embeds: [embedSuccess], components: [row] });

            const replyEmbed = new EmbedBuilder()
                .setDescription(`User <@${extractedUserId}> has been added as a co-leader to the clan.`)
                .setColor(config.color);

            message.reply({ embeds: [replyEmbed], flags: [4096] });
        } catch (error) {
            console.error('Error adding co-leader:', error);
        }
    },
};
