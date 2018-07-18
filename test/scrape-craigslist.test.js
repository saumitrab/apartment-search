const { scrape, downloadAndScrape } = require('../src/scrape-craigslist');
const fs = require('fs');
const path = require('path');
const assert = require('assertive');
const util = require('util');

const html = fs.readFileSync(path.join(__dirname, './fixtures/sample-post.html'));

describe('Scrape Craigslist', () => {
  it('Parses html correctly', () => {
    assert.equal('$2595', scrape(html).price);
  });

  it('Downloads and parses html correctly', async () => {
    const result = await downloadAndScrape('https://sfbay.craigslist.org/pen/apa/d/up-to-1100-off-convenient/6645986942.html');
    assert.equal('$2595', result.price);
  });
});
