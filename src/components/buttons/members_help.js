const { ButtonInteraction, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const ClanManagerSchema = require('../../schemas/clanManagerSchema');
const GuildSchema = require('../../schemas/GuildSchema');
const config = require('../../config');

module.exports = {
    customId: 'members_help',
    /**
     * 
     * @param {ExtendedClient} client 
     * @param {ButtonInteraction} interaction 
     */
    run: async (client, interaction) => {
        let prefix = config.handler.prefix;

        try {
            const guildData = await GuildSchema.findOne({ guild: interaction.guildId });

            if (guildData && guildData.prefix) {
                prefix = guildData.prefix;
            }
        } catch (error) {
            console.error('Error fetching prefix from database:', error);
        }

        // Check if the user has admin permissions or the Clan Manager role
        const member = interaction.member;
        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setAuthor({name: interaction.guild.name, iconURL: interaction.guild.iconURL()})
            .setTitle(`**Member Commands**`)
            .setFooter({
                text: `Requested By: ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setDescription(`
            <:aroww:1184514008536059965> | \`${prefix} leave\` - leave your clan.
            <:aroww:1184514008536059965> | \`${prefix} info <clanKey>\` - show your clan info.
            <:aroww:1184514008536059965> | \`${prefix} myclan\` - show a clan info.
            <:aroww:1184514008536059965> | \`${prefix} leaderboard\` - get a list of server clans.
            `)
            await interaction.reply({
                embeds: [embed],
                ephemeral: true,
                flags: [ 4096 ]
            });
    }
};
