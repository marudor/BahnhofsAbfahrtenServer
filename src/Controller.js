// @flow
import KoaRouter from 'koa-router';
import axios from 'axios';

const router = new KoaRouter();

function encodeSearchTerm(term: string) {
  return term
  .replace(/ü/g, 'ue')
  .replace(/Ü/g, 'UE')
  .replace(/ä/g, 'ae')
  .replace(/Ä/g, 'AE')
  .replace(/ö/g, 'oe')
  .replace(/Ö/g, 'OE')
  .replace(/ß/g, 'ss');
}

router
.prefix('/api')
// https://si.favendo.de/station-info/rest/api/search?searchTerm=Bochum
.get('/search/:searchTerm', async ctx => {
  const { searchTerm } = ctx.params;
  const stations = (await axios.get(`https://si.favendo.de/station-info/rest/api/search?searchTerm=${encodeSearchTerm(searchTerm)}`)).data;
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
    evaId: info.eva_ids[0],
    recursive: info.eva_ids.length > 1,
  };
})
.get('/abfahrten/:station', async ctx => {
  const { station } = ctx.params;
  const info = (await axios.get(`https://si.favendo.de/station-info/rest/api/station/${station}`)).data;
  const evaId = info.eva_ids[0];
  const recursive = info.eva_ids.length > 1 ? 1 : 0;
  // https://marudor.de/api/KD?mode=marudor&backend=iris&version=2
  const abfahrten = (await axios.get(`https://marudor.de/api/${evaId}?mode=marudor&backend=iris&version=2&recursive=${recursive}`)).data;
  ctx.body = abfahrten;
})
;

global.koa.use(router.routes());
