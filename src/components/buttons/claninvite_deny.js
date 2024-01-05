const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const ClansSchema = require('../../schemas/ClansSchema');

module.exports = {
    customId: 'deny_button',

    run: async (client, interaction) => {
        try {
            // Get user ID from the interaction
            const userId = interaction.user.id;

            // Fetch clan details from the database based on clan key in the interaction message footer
            const clanKey = interaction.message.embeds[0].footer.text;
            const clan = await ClansSchema.findOne({ clanKey });

            // Check if the clan exists
            if (!clan) {
                return interaction.reply({content: '- <a:attention1:1184524624793448498> This clan does not exist.', flags: [ 4096 ]});
            }

            // Extract user ID from the message content and add a backslash
            //const userIdFromContent = `\\${interaction.message.content.match(/\d+/)}`;
            const targetUser = interaction.message.mentions.members.first();

            // Check if the user is mentioned in the message content and is the same as the interacting user
            if (targetUser.id !== `${userId}`) {
                return interaction.reply({content: '- <a:attention1:1184524624793448498> This invite is not for you.', flags: [ 4096 ], ephemeral: true});
            }

            // Disable the Accept button
            const acceptButton = new ButtonBuilder()
                .setCustomId('deny_button')
                .setLabel('Clan Invite Denyed')
                .setStyle(4)
                .setDisabled(true);

            const row = new ActionRowBuilder().addComponents(acceptButton);

            // Edit the original message to update the buttons
            interaction.message.edit({
                embeds: [interaction.message.embeds[0]],
                components: [row],
            });

        } catch (error) {
            console.error(error);
            interaction.reply('- <a:attention1:1184524624793448498> An error occurred while processing your request.');
        }
    },
};
