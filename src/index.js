'use strict';

const craigslist = require("node-craigslist");
const { downloadAndScrape } = require('./scrape-craigslist');
const inspect = require('util').inspect;
const debug = require('debug')('index');

const META_FILTER_MINUTES = 500;

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

function metaFilter(listings) {
  const updatedListings = [];
  // TODO: Filter studio and 1br
  listings.forEach(listing => {
    if (getUTCTimeDiffMins(new Date(listing.date)) <= META_FILTER_MINUTES) {
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

function extractResult(listings) {
  const result = [];
  listings.forEach(listing => result.push(listing.url));
  return result;
}

async function process() {
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
    return extractResult;
  } catch (err) {
    console.log(`ERROR ${inspect(err)}`);
  }
};

process();
