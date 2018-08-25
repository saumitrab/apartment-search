'use strict';

class Post {
  constructor(price, title, body) {
    this.price = price;
    this.title = title;
    this.body = body;
  }

  isNoDogs() {
    return !!this.body.match(/no pets/i) || !!this.body.match(/no dog/i);
  }
}

module.exports = Post;
