const { faker } = require('@faker-js/faker');

const fakeCatData = (name, breed, markings) => {
  return {
    name:name || faker.name.firstName(),
    breed:breed || faker.random.locale(),
    markings:markings || faker.random.locale()
  }
}

console.log(fakeCatData());

module.exports = fakeCatData;