'use strict';

class Post {
  constructor(price, title, body) {
    this.price = price;
    this.title = title;
    this.body = body;
  }

  isNoDogs() {
    return !!this.body.match(/no pets/i) || !!this.body.match(/dogs not allowed/i);
  }
}

module.exports = Post;
