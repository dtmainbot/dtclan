const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const ClanManagerSchema = require('../../../schemas/clanManagerSchema');
const ClansSchema = require('../../../schemas/ClansSchema');
const config = require('../../../config');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: {
        name: 'adduser',
        description: 'Add a user to a clan.',
        aliases: ['useradd'],
        cooldown: 10000,
    },
    /**
     * @param {ExtendedClient} client
     * @param {Message} message
     * @param {[String]} args
     */
    run: async (client, message, args) => {
        // Check if the user has the clan leader or clan co-leader role
        const guildId = message.guild.id;
        const clanManagerSettings = await ClanManagerSchema.findOne({ guildId });

        const member = message.guild.members.cache.get(message.author.id);
        if (!member.roles.cache.has(clanManagerSettings.clanLeaderRoleId) && !member.roles.cache.has(clanManagerSettings.clanCoLeaderRoleId)) {
            return message.reply('- <a:attention1:1184524624793448498> You are not a clan leader or co-leader in any clan on this server.');
        }

        // Fetch clan details from the database based on user's roles
        const clan = await ClansSchema.findOne({
            guildId,
            $or: [
                { clanLeaderId: message.author.id },
                { coLeaders: message.author.id },
            ],
        });

        // If the user is not a leader or co-leader in any clan, send a reply
        if (!clan) {
            return message.reply('- <a:attention1:1184524624793448498> You are not a clan leader or co-leader in any clan on this server.');
        }

        // Check if a target user is mentioned and is a valid user
        const targetUser = args[0];
        if (!targetUser) {
            return message.reply('- <a:attention1:1184524624793448498> Please mention a valid user to add to the clan.');
        }

        // Create and send the embed with buttons, including clan key
        const embed = new EmbedBuilder()
            .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL() })
            .setThumbnail(message.guild.iconURL())
            .setColor(config.color)
            .setDescription(`> You are invited to the clan of <@${message.author.id}>, do you want to join it?`)
            .setFooter({ text: `${clan.clanKey}`, iconURL: message.author.avatarURL() });

        const acceptButton = new ButtonBuilder()
            .setCustomId('accept_button')
            .setLabel('Yes')
            .setStyle(3)
            .setDisabled(false);

        const denyButton = new ButtonBuilder()
            .setCustomId('deny_button')
            .setLabel('No')
            .setStyle(4)
            .setDisabled(false);

        const row = new ActionRowBuilder().addComponents(acceptButton, denyButton);

        // Use the clan key in the message reply
        message.reply({ content: `${targetUser}`, embeds: [embed], components: [row] });
    },
};
