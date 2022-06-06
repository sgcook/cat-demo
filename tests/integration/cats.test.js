const app = require('../../src/app');
const { expect } = require('chai');
const request = require('supertest');
const { Cat } = require('../../src/models');
const fakeCatData = require('../../src/helpers/dataFactory');
const catPost = require('../../src/helpers/catHelper');

describe('/cats', () => {
  before(async () => {
    await Cat.sequelize.sync();
  })

  afterEach(async () => {
    await Cat.destroy({ where: {} });
  })

  describe('with no records in the database', () => {
    describe('POST', () => {
      it('creates a new cat in the database', async () => {
        // const catData = {
        //   name: 'Boris',
        //   breed: 'domestic shorthair',
        //   markings: 'tuxedo'
        // }
        const catData = fakeCatData();
  
        // const {status, body} = await request(app).post('/cats').send(catData);
        const {status, body} = await catPost(app, catData);

        expect(status).to.equal(201);
        expect(body.name).to.equal(catData.name);
        expect(body.breed).to.equal(catData.breed);
        expect(body.markings).to.equal(catData.markings);

        const catDocument = await Cat.findByPk(body.id, { raw: true });

        expect(catDocument.name).to.equal(catData.name);
        expect(catDocument.breed).to.equal(catData.breed);
        expect(catDocument.markings).to.equal(catData.markings);
      });
    });
  });

  describe('with records in the database', () => {
    let cats;

    beforeEach(async () => {
      const catsArray = [];
      for (let i = 0; i < 2; i++) {
        catsArray.push(fakeCatData());
      }

      cats = await Promise.all(catsArray.map(async (elem) => Cat.create(elem)));
    });

    describe('GET', () => {
      it('returns all records in the database', async () => {
       const {body, status} = await request(app).get('/cats').send()

        expect(status).to.equal(200);
        expect(body.cats.length).to.equal(cats.length);

        body.cats.forEach(cat => {
          const expected = cats.find(c => c.id == cat.id).dataValues;
          expect(cat.name).to.deep.equal(expected.name);
          expect(cat.breed).to.deep.equal(expected.breed);
          expect(cat.markings).to.deep.equal(expected.markings);
        });
         
      });
    });

    describe('/cats/{catId}', () => {
      describe('GET', () => {
        it('returns the correct cat record', async () => {
          const catData = cats[0].dataValues;
          const {body, status} = await request(app).get(`/cats/${catData.id}`).send()
            expect(status).to.equal(200);
            expect(body.name).to.equal(catData.name);
            expect(body.breed).to.equal(catData.breed);
            expect(body.markings).to.equal(catData.markings);
        });
      });

      describe('PATCH', () => {
        it('updates a cat in the database', async () => {
          const catData = cats[0].dataValues;
          const {status} = await request(app).patch(`/cats/${catData.id}`).send({ name: 'new name'})
          
          expect(status).to.equal(200);

          const catDocument = await Cat.findByPk(catData.id, { raw: true });
          expect(catDocument.name).to.equal('new name');

        });
      });

      describe('DELETE', () => {
        it('deletes the cat from the datbase', async () => {
          const catData = cats[0].dataValues;
          const {status, body } = await request(app).delete(`/cats/${catData.id}`).send()
          expect(status).to.equal(200);
          const catDocument = await Cat.findByPk(catData.id, { raw: true });
          
          expect(catDocument).to.not.exist;
        });
      });
    });
  });
});
