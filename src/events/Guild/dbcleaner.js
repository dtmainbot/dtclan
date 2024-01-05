const { log } = require('../../functions');
const ExtendedClient = require('../../class/ExtendedClient');
const ClansSchema = require(`../../schemas/ClansSchema`);

module.exports = {
    event: 'guildMemberRemove',

    /**
     * @param {ExtendedClient} client 
     * @param {import('discord.js').GuildMember} member 
     */
    run: async (client, member) => {
        try {
            const guildId = member.guild.id;

            // Fetch the clan details for the guild
            const clans = await ClansSchema.find({ guildId });

            for (const clan of clans) {
                const isMemberInClan = clan.members.some((clanMember) => clanMember.userId === member.id);

                if (isMemberInClan) {
                    clan.members = clan.members.filter((clanMember) => clanMember.userId !== member.id);

                    if (clan.coLeaders.includes(member.id)) {
                        clan.coLeaders = clan.coLeaders.filter((coLeader) => coLeader !== member.id);
                    }


                    await clan.save();
                }
            }
        } catch (error) {
            console.error('Error during guild member remove event:', error);
        }
    },
};
