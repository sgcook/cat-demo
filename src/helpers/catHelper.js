const request = require('supertest');

const catPost = (app, data) => {
  return new Promise((resolve, reject) => {
    request(app).post('/cats').send(data).end((error, response) => {
      if(error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

module.exports = catPost;