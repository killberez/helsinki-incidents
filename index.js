const express = require("express");
const { Telegraf } = require("telegraf");
const axios = require("axios");
const _ = require("lodash");
const fs = require("fs");

let incidents = [];
if (!incidents.length) {
  fetchIncidents().then((result) => {
    incidents = result.features;
  });
}

const app = express();
const chats = [];
const bot = new Telegraf("1604583340:AAFlcX3igKzUROO8fOYbZOI8d7E7dbsKoYg");
bot.launch();
bot.hears("hi", (ctx) => {
  chats.push(ctx.update.message.chat.id);
  fs.writeFile("data.json", JSON.stringify(chats), (error) => {
    if (error) {
      return console.log(error);
    }
  });
});
setInterval(() => {
  fetchIncidents().then((res) => {
    const newIncidents = res.features.filter((feature) => {
      return !incidents.find(
        (incident) =>
          incident.properties.situationId === feature.properties.situationId
      );
    });
    fs.readFile("data.json", (error, data) => {
      if (error) {
        return console.log(error);
      }
      JSON.parse(data).forEach((chat) => {
        newIncidents.forEach((incident) => {
          bot.telegram.sendMessage(
            chat,
            `
                  ${incident.properties.announcements[0].title}
          
                  ${incident.properties.announcements[0].location.description}`
          );
        });
      });
    });

    incidents = res.features;
    // }
  });
}, 60000);

app.listen(8000, () => {
  console.log("server is running on port 8000");
});

function fetchIncidents() {
  return axios
    .get(
      "https://tie.digitraffic.fi/api/v2/data/traffic-datex2/traffic-incident.json",
      { headers: { "Accept-Encoding": "gzipheader" } }
    )
    .then((res) => res.data);
}
