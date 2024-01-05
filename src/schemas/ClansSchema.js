const { model, Schema } = require('mongoose');

const ClansSchema = model('ClansSchema', new Schema({
    guildId: {
        type: String,
        required: true,
    },
    clanLeaderId: {
        type: String,
        required: true,
    },
    clanRoleId: {
        type: String,
        required: true,
    },
    clanVoiceChannelId: {
        type: String,
        required: true,
    },
    clanChatChannelId: {
        type: String,
        required: true,
    },
    clanKey: {
        type: String,
        required: true,
        unique: true,
    },
    tag: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    coLeaders: {
        type: [String],
        default: [],
    },
    members: [
        {
            userId: {
                type: String,
                required: true,
            },
        },
    ],
    creationTime: {
        type: Date,
        default: Date.now,
    },
    clanColeadersNumber: {
        type: String,
        default: 3,
    },
    clanImageUrl: {
        type: String,
        required: false,
    },
    clanBannerUrl: {
        type: String,
        required: false,
    },
}));

module.exports = ClansSchema;
