const {key} = require('../config.json');
const fetch = require('node-fetch');
const Discord = require('discord.js');

module.exports = {
    name: 'rank',
    description: 'Displays ranked information for summoner /n Available regions are na, kr, oce, euw, eune, br',
    aliases: ['rank'],
    cooldown: 5,
    usage: '[region] [username]',
    execute(message, args, con) {
        var regions = [
            {region: 'na', api: 'na1', op: 'https://na.op.gg/summoner/userName='},
            {region: 'kr', api: 'kr', op: 'https://op.gg/summoner/userName='},
            {region: 'oce', api: 'oc1', op: 'https://oce.op.gg/summoner/userName='},
            {region: 'euw', api: 'euw1', op: 'https://euw.op.gg/summoner/userName='},
            {region: 'eune', api: 'eun1', op: 'https://eune.op.gg/summoner/userName='},
            {region: 'br', api: 'br1', op: 'https://br.op.gg/summoner/userName='},
        ];
        var summonerNam = '';
        var region = {};
        if(!args.length){
            return;
        }
        else if(!regions.some(x => x.region === args[0])){
            args.forEach(a => {
                summonerNam += a + '%20';
            });
            region = regions[0];
        }else{
            for(var i = 1; i < args.length; i++){
                summonerNam += args[i] + '%20';
            }
            region = regions.find(reg => reg.region === args[0]);
        }
        summonerNam = summonerNam.slice(0, -3);
        fetch(`https://${region.api}.api.riotgames.com/lol/summoner/v4/summoners/by-name/` + summonerNam.trim() + `?api_key=${key}`, {
            method: 'get',
        }).then(function(response){
            return response.json();
        }).then(function(data){
            var summonerId = data.id;
            return fetch(`https://${region.api}.api.riotgames.com/lol/league/v4/entries/by-summoner/` + summonerId + `?api_key=${key}`, {method: 'get'}).then(function(response){
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
                eb.setURL(region.op + summonerNam);
                r.forEach(m => {
                    eb.addField('\nQueue Type', m.queueType);
                    eb.addField('Rank', m.tier + ' ' + m.rank, true);
                    eb.addField('Points', m.leaguePoints, true);
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