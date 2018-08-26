'use strict';

const craigslist = require("node-craigslist");
const { downloadAndScrape } = require('./scrape-craigslist');
const inspect = require('util').inspect;
const debug = require('debug')('index');

const META_FILTER_MINUTES = 15;

async function getListings() {
  let client = new craigslist.Client({
    baseHost: "craigslist.org",
    city: "sfbay"
  });

  return await client
    .list({
      category: "apa",
      maxAsk: "3000",
      postal: "94043",
      searchDistance: "9"
    });
}

async function downloadPost(listing) {
  const updatedListing = listing;
  updatedListing.post = await downloadAndScrape(listing.url);
  return updatedListing;
}

function downloadPosts(listings) {
  const updatedListings = [];
  listings.forEach(listing => updatedListings.push(downloadPost(listing)));
  return Promise.all(updatedListings);
}

function getUTCTimeDiffMins(date) {
  const current = new Date();
  const currentUTC = current.getTime() + current.getTimezoneOffset() * 60 * 1000;

  return (currentUTC - date) / (60 * 1000);
}

function getTimeDiffMins(date) {
  const current = new Date();

  return (current - date) / (60 * 1000);
}

function metaFilter(listings) {
  const updatedListings = [];
  // TODO: Filter studio and 1br
  listings.forEach(listing => {
    //console.log(`TZ diff ${getTimeDiffMins(new Date(`${listing.date} PDT`))} for ${new Date(`${listing.date} PDT`)} check ${new Date(listing.date)}`);
    if (getTimeDiffMins(new Date(`${listing.date} PDT`)) <= META_FILTER_MINUTES) {
      updatedListings.push(listing);
    }
  });
  return updatedListings;
}

function contentFilter(listings) {
  const filteredListings = [];
  listings.forEach(listing => {
    if (!listing.post.isNoDogs()) {
      filteredListings.push(listing);
    }
  })
  return filteredListings;
}

function formatResult(listings) {
  let result = "";
  listings.forEach(listing => {
    result = result + `${listing.title} ${listing.price} \n${listing.url} \n\n`;
  });
  return result;
}

async function findApts() {
  try {
    const log = console.log.bind(null, `${new Date().toLocaleString()}:`);
    // TODO make a better sequence of events
    const listings = await getListings();
    log(`processing ${listings.length} listings`);
    const metaFiltered = metaFilter(listings);
    log(`processing ${metaFiltered.length} metaFiltered listings`);
    const updatedListings = await downloadPosts(metaFiltered);
    const filteredListings = contentFilter(updatedListings);
    log(`processing ${filteredListings.length} contentFiltered listings`);
    //filteredListings.forEach(listing => console.log(listing.url));
    return formatResult(filteredListings);
  } catch (err) {
    console.log(`ERROR ${inspect(err)}`);
  }
};

module.exports = findApts;
