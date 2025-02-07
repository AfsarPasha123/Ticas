import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import { expect } from 'chai';
import app from '../src/app';
import db from '../src/config/database';
import { Pool } from 'mysql2/promise';

chai.use(chaiHttp);

describe('Spaces API', () => {
  let dbQueryStub: sinon.SinonStub;

  beforeEach(() => {
    // Create a stub for the database query
    dbQueryStub = sinon.stub(db, 'query');
  });

  afterEach(() => {
    // Restore the stub after each test
    dbQueryStub.restore();
  });

  describe('POST /spaces', () => {
    it('should create a new space successfully', async () => {
      const newSpace = {
        space_name: 'Living Room',
        description: 'A cozy space with a sofa and coffee table'
      };

      // Mock the database response
      dbQueryStub.resolves([{ 
        insertId: 1,
        affectedRows: 1
      }]);

      const res = await chai
        .request(app)
        .post('/spaces')
        .send(newSpace);

      expect(res).to.have.status(201);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('message', 'Space created successfully.');
      expect(res.body).to.have.property('space_id', 1);
      expect(res.body).to.have.property('space_name', newSpace.space_name);
    });

    it('should return 400 when space_name is missing', async () => {
      const invalidSpace = {
        description: 'A cozy space with a sofa and coffee table'
      };

      const res = await chai
        .request(app)
        .post('/spaces')
        .send(invalidSpace);

      expect(res).to.have.status(400);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('error', 'Invalid data provided.');
    });

    it('should handle database errors gracefully', async () => {
      const newSpace = {
        space_name: 'Living Room',
        description: 'A cozy space'
      };

      // Mock a database error
      dbQueryStub.rejects(new Error('Database connection failed'));

      const res = await chai
        .request(app)
        .post('/spaces')
        .send(newSpace);

      expect(res).to.have.status(500);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('error', 'Internal server error');
    });
  });
});
