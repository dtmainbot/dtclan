const { EmbedBuilder } = require('discord.js');
const ClanManagerSchema = require('../../../schemas/clanManagerSchema');
const ClansSchema = require('../../../schemas/ClansSchema');
const config = require('../../../config');

module.exports = {
    structure: {
        name: 'clandm',
        description: 'Dm all your clan members',
        aliases: ['dmclan'],
        permissions: 'SendMessages',
        cooldown: 20000,
    },
    /**
     * @param {ExtendedClient} client
     * @param {Message} message
     * @param {[String]} args
     */
    run: async (client, message, args) => {
        try {
            // Check if the user has the clanLeaderRole
            const guildId = message.guild.id;
            const clanManagerData = await ClanManagerSchema.findOne({ guildId });

            if (!clanManagerData) {
                return message.reply('- <a:attention1:1184524624793448498> Clan management settings not found for this server.');
            }

            const clanLeaderRoleId = clanManagerData.clanLeaderRoleId;
            if (!message.member.roles.cache.has(clanLeaderRoleId)) {
                return message.reply('- <a:attention1:1184524624793448498> You do not have the required role to use this command.');
            }

            // Get the clan details for the user
            const userId = message.author.id;
            const userClan = await ClansSchema.findOne({
                guildId,
                clanLeaderId: userId,
            });

            if (!userClan) {
                return message.reply('- <a:attention1:1184524624793448498> You are not a clan leader in this server.');
            }

            // Check if a message is provided
            if (!args.length) {
                return message.reply('- <a:attention1:1184524624793448498> Please provide a message to send to clan members.');
            }

            const customMessage = args.join(' ');

            // Send DMs in batches
            const clanMembers = userClan.members.map((member) => member.userId);
            const batchSize = 5;

            for (let i = 0; i < clanMembers.length; i += batchSize) {
                const batch = clanMembers.slice(i, i + batchSize);
                const dmPromises = batch.map(async (memberId) => {
                    const member = await client.users.fetch(memberId);

                    const dmEmbed = new EmbedBuilder()
                        .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL()})
                        .setTitle(`📨 Message from ${message.author.tag}`)
                        .setDescription(`\`\`\`${customMessage}\`\`\``)
                        .setThumbnail(message.guild.iconURL())
                        .setColor(config.color);
                    const dmEmbeddone = new EmbedBuilder()
                        .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL()})
                        .setTitle(`📨 Clan Dm`)
                        .setDescription(`Hey <@${message.author.id}>, the Can dm Has succesfully sent with the folowing message:\n \`\`\`${customMessage}\`\`\``)
                        .setColor(config.color);


                    return member.send({ embeds: [dmEmbed] });
                });

                await Promise.all(dmPromises);

                // Add a delay between batches to avoid rate limits
                await new Promise((resolve) => setTimeout(resolve, 10000));
            }

            message.reply('- <a:attention1:1184524624793448498> Messages sent to all clan members.');
        } catch (error) {
            console.error('Error in clandm command:', error);
            message.reply('- <a:attention1:1184524624793448498> An error occurred while processing the command.');
        }
    },
};
