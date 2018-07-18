const cheerio = require('cheerio');
const Posting = require('./posting');
const fetch = require('node-fetch');
const debug = require('debug')('apartment-search:scrape');

function scrape(html) {
  const $ = cheerio.load(html);
  return new Posting($('span.price').text(), $('span#titletextonly').text(), $('#postingbody').text());
}

async function downloadAndScrape(url) {
  try {
    const data = await fetch(url);
    const html = await data.text();
    return scrape(html);
  } catch (err) {
    console.log('Error fetching post!');
    throw err;
  }
}

module.exports = { scrape, downloadAndScrape };
