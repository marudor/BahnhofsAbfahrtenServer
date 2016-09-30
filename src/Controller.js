// @flow
import KoaRouter from 'koa-router';
import axios from 'axios';
import Memcache from 'memcache-plus';

const memcache = new Memcache({
  hosts: [process.env.MEMCACHED_SERVER],
});

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

async function stationInfo(station: number) {
  const cached = await memcache.get(station);
  if (cached) {
    return cached;
  }
  const info = (await axios.get(`https://si.favendo.de/station-info/rest/api/station/${station}`)).data;
  return {
    id: info.id,
    title: info.title,
    evaId: info.eva_ids[0],
    recursive: info.eva_ids.length > 1,
  };
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
  ctx.body = await stationInfo(station);
})
.get('/abfahrten/:station', async ctx => {
  const { station } = ctx.params;
  const info = await stationInfo(station);
  // https://marudor.de/api/KD?mode=marudor&backend=iris&version=2
  const abfahrten = (await axios.get(`http://***REMOVED***f.finalrewind.org/${info.evaId}?mode=marudor&backend=iris&version=2&recursive=${info.recursive}`)).data;
  ctx.body = abfahrten;
})
;

global.koa.use(router.routes());
