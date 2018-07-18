const craigslist = require("node-craigslist");

let client = new craigslist.Client({
  baseHost: "craigslist.org",
  city: "sfbay"
});

client
  .list({
    category: "apa",
    maxAsk: "3000",
    postal: "94043",
    searchDistance: "5"
  })
  .then(listings => {
    // play with listings here...
    listings.forEach(listing => console.log(listing));
  })
  .catch(err => {
    console.error(err);
  });
