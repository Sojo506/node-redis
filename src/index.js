const express = require("express");
const axios = require("axios");
const responseTime = require("response-time");
const redis = require("redis");

const client = redis.createClient({
  host: "localhost",
  port: 6379,
});

client.connect();

const app = express();

app.use(responseTime());

app.get("/characters", async (req, res) => {
  try {
    // Response from CACHE
    const getCharacters = await client.get("characters");
    if (getCharacters) return res.json(JSON.parse(getCharacters));

    // Response from API
    const response = await axios.get(
      "https://rickandmortyapi.com/api/character"
    );

    const setCharacters = await client.set(
      "characters",
      JSON.stringify(response.data)
    );

    res.json(response.data);
  } catch (error) {
    res.status(error.response.status).json({ msg: error.message });
  }
});

app.get("/character/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const getCharacter = await client.get(id);
    if (getCharacter) return res.json(JSON.parse(getCharacter));

    const response = await axios.get(
      `https://rickandmortyapi.com/api/character/${id}`
    );

    const setCharacter = await client.set(id, JSON.stringify(response.data));
    res.json(response.data);
  } catch (error) {
    res.status(error.response.status).json({ msg: error.message });
  }
});

app.listen(3000);
console.log("🚀 ~ file: index.js:5 ~ app | Server on port 3000");
