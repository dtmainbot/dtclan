const { ButtonInteraction, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');
const ClanManagerSchema = require('../../schemas/clanManagerSchema');
const config = require('../../config');
const GuildSchema = require('../../schemas/GuildSchema');

module.exports = {
    customId: 'clanmanager_help',
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

        // Ensure that roles are properly cached
        await interaction.guild.members.fetch();

        try {
            const clanManagerData = await ClanManagerSchema.findOne({ guildId: interaction.guildId });

            if (clanManagerData) {
                const member = interaction.guild.members.cache.get(interaction.user.id);
                const embed = new EmbedBuilder()
                    .setColor(config.color)
                    .setAuthor({name: interaction.guild.name, iconURL: interaction.guild.iconURL()})
                    .setTitle('**Member Commands**')
                    .setFooter({
                        text: `Requested By: ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setDescription(`
                    <:aroww:1184514008536059965> | \`${prefix} create <leader> <name> <clanVc> <clanChat> <clanTag>\` - create a clan in this server.
                    <:aroww:1184514008536059965> | \`${prefix} delete <clanKey>\` - delete a clan in this server.
                    <:aroww:1184514008536059965> | \`${prefix} check\` - check clans system settings.
                    `)

                if (member.permissions.has('ManageRoles') || member.roles.cache.has(clanManagerData.clanManagerRoleId)) {
                    await interaction.reply({
                        embeds: [embed],
                        ephemeral: true,
                        flags: [ 4096 ]
                    });
                } else {
                    await interaction.reply({
                        content: '- <a:attention1:1184524624793448498> You do not have the necessary permissions or role to use this button.',
                        ephemeral: true,
                        flags: [ 4096 ]
                    });
                }
            } else {
                console.error('ClanManager data not found for guild:', interaction.guildId);
            }
        } catch (error) {
            console.error('Error fetching ClanManager data from database:', error);
        }
    },
};
