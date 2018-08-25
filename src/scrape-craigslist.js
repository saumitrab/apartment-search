const cheerio = require('cheerio');
const Post = require('./post');
const fetch = require('node-fetch');
const debug = require('debug')('apartment-search:scrape');
const inspect = require('util');

function scrape(html) {
  const $ = cheerio.load(html);
  return new Post($('span.price').text(), $('span#titletextonly').text(), $('#postingbody').text());
}

async function downloadAndScrape(url) {
  try {
    const data = await fetch(url);
    const html = await data.text();
    return scrape(html);
  } catch (err) {
    console.log(`ERROR ${err.message}`);
  }
}

module.exports = { scrape, downloadAndScrape };
