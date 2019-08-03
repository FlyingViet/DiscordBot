module.exports = {
    name: 'invite',
    description: 'Provides bot invite link',
    cooldown: 5,
    execute(message, args, con) {
        message.channel.send('My invite link is: https://discordapp.com/oauth2/authorize?client_id=599401316107943946&permissions=2146958839&scope=bot');
    },
};