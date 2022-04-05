// Getting modules.
require("dotenv").config();
const express = require("express");
const hbs = require("hbs");
const SpotifyWebApi = require("spotify-web-api-node");
const helpers = require("handlebars-helpers")({
  handlebars: hbs,
});
hbs.registerHelper("json", function (context) {
  return JSON.stringify(context);
});

// Creating the express app.
const app = express();

// Setting view engine.
app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

// Setting the Spotify API.
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// Retrieve an access token.
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );

// Default page title
app.locals.pageTitle = "Express Spotify - Alberto Cárdenas";

// Registering partials.
hbs.registerPartials(__dirname + "/views/partials");

// Our routes go here:
app.get("/", (req, res) => {
  res.render("artist-search", {
    selected: "Search",
    pageTitle: "Search",
    pageStyles: [{ style: "/styles/home.css" }],
  });
});

app.get("/artist-search", (req, res) => {
  const name = req.query.name;

  if (!name) res.redirect("/");

  spotifyApi
    .searchArtists(name)
    .then((data) => {
      res.render("artist-search-results", {
        pageTitle: `${name} - Spotify`,
        pageStyles: [{ style: "/styles/artist-search.css" }],
        artists: data.body.artists.items,
      });
    })
    .catch((err) => console.log("Error while searching for artists: ", err));
});

app.get("/albums/:artistId", (req, res, next) => {
  // Getting the artistId and artistName from the url.
  const str = req.params.artistId.split("_");
  const artistId = str[0];
  const artistName = str[1];

  spotifyApi
    .getArtistAlbums(artistId)
    .then((data) => {
      //console.log(data.body.items);
      res.render("albums", {
        pageTitle: `${artistName}- Spotify`,
        pageStyles: [{ style: "/styles/artist-search.css" }],
        albums: data.body.items,
        name: artistName,
      });
    })
    .catch((err) => console.log("Error while looking for that album: ", err));
});

app.get("/tracks/:albumId", (req, res, next) => {
  // Getting the albumId and albumName from the url.
  const str = req.params.albumId.split("_");
  const albumId = str[0];
  const albumName = str[1];
  console.log(albumId);

  spotifyApi
    .getAlbumTracks(albumId)
    .then((data) => {
      console.log(data.body.items);
      res.render("tracks", {
        pageTitle: `${albumName}- Spotify`,
        pageStyles: [{ style: "/styles/tracks.css" }],
        tracks: data.body.items,
        name: albumName,
      });
    })
    .catch((err) => console.log("Error while looking for that album: ", err));
});

app.listen(3000, () =>
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊")
);
