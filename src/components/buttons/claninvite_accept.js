const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const ClansSchema = require('../../schemas/ClansSchema');

module.exports = {
    customId: 'accept_button',

    run: async (client, interaction) => {
        try {
            // Get user ID from the interaction
            const userId = interaction.user.id;

            // Fetch clan details from the database based on clan key in the interaction message footer
            const clanKey = interaction.message.embeds[0].footer.text;
            const clan = await ClansSchema.findOne({ clanKey });

            // Check if the clan exists
            if (!clan) {
                interaction.reply({ content: '- <a:attention1:1184524624793448498> This clan does not exist.', flags: [4096] });

                // Disable the Accept button
                const expiredButton = new ButtonBuilder()
                    .setCustomId('expired')
                    .setLabel('Clan Invite Expired')
                    .setStyle(4)
                    .setDisabled(true);

                const rowExpired = new ActionRowBuilder().addComponents(expiredButton);

                // Edit the original message to update the buttons
                await interaction.message.edit({
                    embeds: [interaction.message.embeds[0]],
                    components: [rowExpired],
                });

                return;
            }

            // Extract user ID from the message content and add a backslash
            const userIdFromContent = `\\${interaction.message.content.match(/\d+/)}`;

            // Check if the user is mentioned in the message content and is the same as the interacting user
            if (userIdFromContent !== `\\${userId}`) {
                return interaction.reply({ content: '- <a:attention1:1184524624793448498> This invite is not for you.', flags: [4096], ephemeral: true });
            }

            // Check if the user is already a member of another clan on the server
            const existingClan = await ClansSchema.findOne({
                guildId: interaction.guild.id,
                'members.userId': userId,
            });

            if (existingClan) {
                // User is already a member of another clan
                interaction.reply({ content: '- <a:attention1:1184524624793448498> You are already a member of another clan on this server.', flags: [4096] });

                // Disable the Accept button
                const expiredButton = new ButtonBuilder()
                    .setCustomId('expired')
                    .setLabel('Clan Invite Expired')
                    .setStyle(4)
                    .setDisabled(true);

                const rowExpired = new ActionRowBuilder().addComponents(expiredButton);

                // Edit the original message to update the buttons
                await interaction.message.edit({
                    embeds: [interaction.message.embeds[0]],
                    components: [rowExpired],
                });

                return;
            }

            // Add user to the clan and give them the clan role
            clan.members.push({ userId });
            await clan.save();

            // Fetch the member again to ensure we have the latest data
            const member = await interaction.guild.members.fetch(userId);

            const clanRole = interaction.guild.roles.cache.get(clan.clanRoleId);
            member.roles.add(clanRole);

            // Set user nickname with the clan tag
            const userTag = clan.tag.replace('{user}', member.displayName);
            await member.setNickname(userTag);

            // Disable the Accept button
            const acceptButton = new ButtonBuilder()
                .setCustomId('accept_button')
                .setLabel('Clan Invite Accepted')
                .setStyle(4)
                .setDisabled(true);

            const row = new ActionRowBuilder().addComponents(acceptButton);

            // Edit the original message to update the buttons
            await interaction.message.edit({
                embeds: [interaction.message.embeds[0]],
                components: [row],
            });

            interaction.reply({ content: `- ✅ You have been added to ${clan.name}!`, flags: [4096], ephemeral: true });
        } catch (error) {
            console.error(error);
            interaction.reply('- <a:attention1:1184524624793448498> An error occurred while processing your request.');
        }
    },
};
