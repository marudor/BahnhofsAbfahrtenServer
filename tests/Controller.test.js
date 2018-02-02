// @flow
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import Koa from 'koa';
import Nock from 'nock';
import setRoutes from '../src/Controller';
import supertest from 'supertest-as-promised';

axios.defaults.adapter = httpAdapter;

describe('Controller', () => {
  let server;
  let request;
  let nock;

  beforeAll(() => {
    const koa = new Koa();

    nock = Nock('https://si.favendo.de');

    setRoutes(koa);
    server = koa.listen();
    request = supertest(server);
  });

  it('gets Stations', () => {
    const testData = [
      {
        title: 'test',
        id: 'test',
      },
    ];

    nock
      .get('/station-info/rest/api/search')
      .query({
        searchTerm: 'Test',
      })
      .reply(200, testData);

    return request
      .get('/api/search/Test')
      .expect(200)
      .expect(testData);
  });

  afterAll(() => {
    server.close();
  });
});
