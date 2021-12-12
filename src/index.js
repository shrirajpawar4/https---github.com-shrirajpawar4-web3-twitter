require('dotenv').config();

const bot = require('./bot');
const fs = require('fs');
const path = require('path');
const paramsPath = path.join(__dirname, 'params.json');

const writeParams = (data) => {
    console.log('We are writing params..', data);
    return fs.writeFileSync(paramsPath, JSON.stringify(data));
}

const readParams = () => {
    console.log('reading params..');
    const data = fs.readFileSync(paramsPath);
    return JSON.parse(data.toString());
}

const getTweets = (since_id) => {
    return new Promise((resolve, reject) => {
        let params = {
            q: '@web3bot1',
            count: 20,
        };

        if (since_id) {
            params.since_id = since_id;    
        }

        console.log('Getting tweets..', params);

        bot.get('search/tweets', params, (err, data) => {
            if (err) {
                return reject(err);
            }
            return resolve(data);
        }) 
    })
}

const postRT = (id) => {
    return new Promise((resolve, reject) => {
        let params = {
            id, 
        };
        bot.post('statuses/retweet/:id', params, (err, data) => {
            if (err) {
                return reject(err);
            }
            return resolve(data);
        })
    })
}

const main = async () => {
    try {
        const params = readParams();
        const data = await getTweets();
        const tweets = data.statuses;

        console.log('We got tweets', tweets.length);

        for await (let tweet of tweets) {
            try {
                await postRT(tweet.id_str);
                console.log("RT SUCCESS " + tweet.id_str);
            } catch (e) {
                console.log("RT FAILED " + tweet.id_str);
            }
            params.since_id = tweet.id_str;
        }
        writeParams(params);
    } catch (e) {
        console.error(e);
    }
}

console.log('Bot is up..');

setInterval(main, 10000);