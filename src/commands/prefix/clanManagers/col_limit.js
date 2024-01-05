const { EmbedBuilder } = require('discord.js');
const ClanManagerSchema = require('../../../schemas/clanManagerSchema');
const ClansSchema = require('../../../schemas/ClansSchema');
const config = require('../../../config');

module.exports = {
    structure: {
        name: 'collimit',
        description: 'Change the clan co leaders Limit in a specific clan.',
        aliases: ['colnumber'],
        cooldown: 20000
    },
    /**
     * @param {ExtendedClient} client
     * @param {Message} message
     * @param {[String]} args
     */
    run: async (client, message, args) => {
        try {
            // Check if the message author is a member of the guild
            if (!message.guild || !message.member) {
                return message.reply({ content: `- <a:attention1:1184524624793448498> You are not in a guild.`, flags: [4096], ephemeral: true });
            }

            // Check if the user has admin permissions or the clan manager role
            if (!message.member.permissions.has('ADMINISTRATOR') && !message.member.roles.cache.has(ClanManagerSchema.clanManagerRoleId)) {
                return message.reply({ content: `- <a:attention1:1184524624793448498> You do not have the necessary roles or permissions to use this command`, flags: [4096], ephemeral: true });
            }

            // Check if the correct number of arguments is provided
            if (args.length !== 2) {
                const embedError = new EmbedBuilder()
                    .setDescription('**Invalid usage. |\`collimit <ClanKey> <ClanCoLeaders Limit>\` (the co leaders limit should be between 1 and 10)**')
                    .setColor(config.color);

                return message.reply({ embeds: [embedError], flags: [4096] });
            }

            const clanKey = args[0];
            const newCoLeadersLimit = parseInt(args[1]);

            // Check if the new limit is a valid number between 1 and 10
            if (isNaN(newCoLeadersLimit) || newCoLeadersLimit < 1 || newCoLeadersLimit > 10) {
                const embedError = new EmbedBuilder()
                    .setDescription('**Invalid co-leaders limit. Please provide a numeric value between 1 and 10.**')
                    .setColor(config.color);

                return message.reply({ embeds: [embedError], flags: [4096] });
            }

            // Find the clan in the database
            const guildId = message.guild.id;
            const clan = await ClansSchema.findOne({ guildId, clanKey }).exec();

            if (!clan) {
                const embedError = new EmbedBuilder()
                    .setDescription('**Clan not found. Please provide a valid clan key.**')
                    .setColor(config.color);

                return message.reply({ embeds: [embedError], flags: [4096] });
            }

            // Update the co-leaders limit in the clan schema
            clan.clanColeadersNumber = newCoLeadersLimit;
            await clan.save();

            const embedSuccess = new EmbedBuilder()
                .setColor(config.color)
                .setDescription(`**The co-leaders limit for clan \`${clan.name}(${clan.clanKey})\` has been updated to ${newCoLeadersLimit}.**`)
                .setTimestamp()
                .setFooter({
                    text: `Server: ${message.guild.name}`,
                    iconURL: message.guild.iconURL(),
                });

            message.reply({ embeds: [embedSuccess], flags: [4096] });
        } catch (error) {
            console.error('Error updating co-leaders limit:', error);
        }
    },
};
