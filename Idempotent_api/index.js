import express from 'express';
import { createClient } from 'redis';

const app = express();
app.use(express.json());

const client = createClient();
client.on('error', (err) => console.log('Redis Client Error', err));
await client.connect();

const customRedisMiddleware = async (req, res, next) => {
    try {
        const key = req.header('IID');
        if(!key){
            return res.status(400).json("IID required");
        }

        let rkey = await client.get(key);
        if(rkey){
            return res.status(200).json(JSON.parse(rkey));
        }

        await client.set(key, 1, 'EX', 600);
        res.status(200).json("Request Completed");
    } catch (error) {
        res.status(400).json("Failed request");
    }
}

// app.use(customRedisMiddleware);

app.post("/newPayment", customRedisMiddleware);

app.listen(3000, () => {
    console.log("Listening to server ...");
});
