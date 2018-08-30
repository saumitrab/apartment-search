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
      maxAsk: "2800",
      minAsk: "1700",
      postal: "94043",
      searchDistance: "10",
      postedToday: true,
      bundleDuplicates: true,
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
  const filters = { posttime: 0, studio: 0 };
  const updatedListings = [];
  // TODO: Filter studio and 1br
  listings.forEach(listing => {
    //console.log(`TZ diff ${getTimeDiffMins(new Date(`${listing.date} PDT`))} for ${new Date(`${listing.date} PDT`)} check ${new Date(listing.date)}`);
    const postTimeFilterPasses = getTimeDiffMins(new Date(`${listing.date} PDT`)) <= META_FILTER_MINUTES;
    const studioFilterPasses = !listing.title.match(/studio/i);
    //const upstairsFilterPasses = !listing.title.match(/upstair/i);
    if (postTimeFilterPasses && studioFilterPasses) {
      updatedListings.push(listing);
    }
    filters.posttime += +!postTimeFilterPasses;
    filters.studio += +!studioFilterPasses;
    //filters.upstairs += +!upstairsFilterPasses;
  });
  return {
    updatedListings, filters
  };
}

function contentFilter(listings) {
  const filters = {};
  const updatedListings = [];
  listings.forEach(listing => {
    if (!listing.post.isNoDogs()) {
      filters.nodogs = filters.nodogs ? filters.nodogs + 1 : 1;
      updatedListings.push(listing);
    }
  })
  return { updatedListings, filters };
}

function formatResult(listings, stats) {
  let result = "";
  listings.forEach(listing => {
    result = result + `${listing.price} - ${listing.location} - ${listing.title} \n${listing.url} \n\n`;
  });

  result += `Lookup details: ${JSON.stringify(stats, null, 2)}`;
  return result;
}

async function findApts() {
  try {
    const stats = { filters: {} };
    const log = console.log.bind(null, `${new Date().toLocaleString()}:`);
    // TODO make a better sequence of events
    const listings = await getListings();
    stats.total = listings.length;

    log(`processing ${listings.length} listings`);
    const { updatedListings: metaFiltered, filters: appliedMetaFilters } = metaFilter(listings);
    Object.assign(stats.filters, appliedMetaFilters);

    log(`processing ${metaFiltered.length} metaFiltered listings`);
    const updatedListings = await downloadPosts(metaFiltered);
    const { updatedListings: filteredListings, filters: appliedContentFilters } = contentFilter(updatedListings);
    Object.assign(stats.filters, appliedContentFilters);

    log(`processing ${filteredListings.length} contentFiltered listings`);
    stats.hits = filteredListings.length;

    const resultText = formatResult(filteredListings, stats);
    return { resultText, stats };
  } catch (err) {
    console.log(`ERROR ${inspect(err)}`);
  }
};

module.exports = findApts;
