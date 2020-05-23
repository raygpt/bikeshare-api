const supertest = require('supertest');
const app = require('../app');

describe('Test get station by ID', () => {
  it('should return the correct station details given a station ID', async () => {
    const auth = await supertest(app).get('/auth/token');

    const response = await supertest(app)
      .get('/station/2')
      .set('authorization', `Bearer ${auth.body.token}`);
    expect(response.status).toBe(200);
    expect(response.body.station[0].name).toEqual('Buckingham Fountain');
    expect(response.body.station[0].station_type).toEqual('classic');
    expect(response.body.station[0].capacity).toEqual(39);
    expect(response.body.station[0].external_id).toEqual(
      'a3a36d9e-a135-11e9-9cda-0a87ae2ba916'
    );
  });
});
