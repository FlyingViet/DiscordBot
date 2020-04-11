const {key} = require('../config.json');
const fetch = require('node-fetch');
const Discord = require('discord.js');

module.exports = {
    name: 'ranklan',
    description: 'Displays ranked information for summoner',
    aliases: ['lan'],
    cooldown: 5,
    execute(message, args, con) {
        var summonerNam = '';
        if(!args.length){
            return;
        }
        args.forEach(a => {
            summonerNam += a + '%20';
        });
        summonerNam = summonerNam.slice(0, -3);
        fetch('https://la1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + summonerNam.trim() + `?api_key=${key}`, {
            method: 'get',
        }).then(function(response){
            return response.json();
        }).then(function(data){
            var summonerId = data.id;
            return fetch('https://la1.api.riotgames.com/lol/league/v4/entries/by-summoner/' + summonerId + `?api_key=${key}`, {method: 'get'}).then(function(response){
                return response.json();
            }).then(function(r){
                const eb = new Discord.RichEmbed();
                var name = summonerNam.replace('%20', ' ');
                if(r.length <= 0){
                    eb.setDescription(name + ' is a pleb that hasn\'t ranked yet!');                  
                }
                eb.setThumbnail(`http://ddragon.leagueoflegends.com/cdn/10.3.1/img/profileicon/${data.profileIconId}.png`);
                eb.setTitle(name);
                eb.setColor(0x0099ff);
                eb.setURL('https://lan.op.gg/summoner/userName=' + summonerNam);
                r.forEach(m => {
                    eb.addField('\nQueue Type', m.queueType);
                    eb.addField('Rank', m.tier + ' ' + m.rank, true);
                    eb.addField('Points', m.leaguePoints + '/100', true);
                    eb.addField('Wins/Losses', m.wins + '/' + m.losses, true);
                    
                });
                message.channel.send({embed: eb});
                return r;
            });
        }).catch(function(error){
            console.log('Request Failed', error);
            message.channel.send('That user does not exist');
        });
    },
};