// @flow
import KoaRouter from 'koa-router';
import axios from 'axios';

const router = new KoaRouter();

router
.prefix('/api')
// https://si.favendo.de/station-info/rest/api/search?searchTerm=Bochum
.get('/search/:searchTerm', async ctx => {
  const { searchTerm } = ctx.params;
  const stations = (await axios.get(`https://si.favendo.de/station-info/rest/api/search?searchTerm=${searchTerm}`)).data;
  ctx.body = stations.map(station => ({
    title: station.title,
    id: station.id,
  }));
})
// https://si.favendo.de/station-info/rest/api/station/724
.get('/station/:station', async ctx => {
  const { station } = ctx.params;
  const info = (await axios.get(`https://si.favendo.de/station-info/rest/api/station/${station}`)).data;
  ctx.body = {
    id: info.id,
    title: info.title,
    ds100: info.shortNames[0],
  };
})
.get('/abfahrten/:station', async ctx => {
  const { station } = ctx.params;
  const info = (await axios.get(`https://si.favendo.de/station-info/rest/api/station/${station}`)).data;
  const DS100 = info.shortNames[0];
  // https://marudor.de/api/KD?mode=marudor&backend=iris&version=2
  const abfahrten = (await axios.get(`https://marudor.de/api/${DS100}?mode=marudor&backend=iris&version=2`)).data;
  ctx.body = abfahrten;
})
;

global.koa.use(router.routes());
