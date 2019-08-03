module.exports = {
    name: 'pin',
    description: 'Pins the last message',
    cooldown: 5,
    execute(message, args, con) {
        if(!message.channel.permissionsFor(message.member).has('MANAGE_MESSAGES', false, false)) return;
        message.channel.fetchMessages({limit: 2}).then(result => {
            var itr = result.entries();       
            var newMsg = itr.next();
            newMsg = itr.next();
            try{
                newMsg.value[1].pin();
            }catch(exception){
                return console.log(exception);
            }
        });
    },
};