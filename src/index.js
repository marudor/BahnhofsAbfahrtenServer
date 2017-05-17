// @flow
import Koa from 'koa';
import KoaCompress from 'koa-compress';
import KoaBodyparser from 'koa-bodyparser';
import http from 'http';

const koa = (global.koa = new Koa());
const server = (global.server = http.createServer(global.koa.callback()));

koa.use(KoaCompress()).use(KoaBodyparser());

require('./Controller');

server.listen(process.env.WEB_PORT || 9042);

if (process.env.NODE_ENV !== 'production') {
  console.log('running in DEV mode!');
}
