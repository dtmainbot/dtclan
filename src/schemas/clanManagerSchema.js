const { model, Schema } = require('mongoose');

const ClanManagerSchema = model('ClanManagerSchema', new Schema({
    guildId: {
        type: String,
        required: true,
        unique: true,
    },
    clanManagerRoleId: {
        type: String,
        required: true,
    },
    clanLeaderRoleId: {
        type: String,
        required: true,
    },
    clanCoLeaderRoleId: {
        type: String,
        required: true,
    },
    clanVoicesCategoryId: {
        type: String,
        required: true,
    },
    clanChatVoicesCategoryId: {
        type: String,
        required: true,
    },
    clanLogsChannelId: {
        type: String,
        required: true,
    },
    // Add any other fields you may need for clan management settings
}));

module.exports = ClanManagerSchema;
