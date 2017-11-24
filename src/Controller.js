// @flow
import KoaRouter from 'koa-router';
import axios from 'axios';
import iconv from 'iconv-lite';

const router = new KoaRouter();

function encodeSearchTerm(term: string) {
  return term
    .replace(/ü/g, 'ue')
    .replace(/Ü/g, 'UE')
    .replace(/ä/g, 'ae')
    .replace(/Ä/g, 'AE')
    .replace(/ö/g, 'oe')
    .replace(/Ö/g, 'OE')
    .replace(/ß/g, 'ss')
    .replace(/\$SLASH\$/g, '/');
}

async function stationInfo(station: number) {
  const info = (await axios.get(
    `https://si.favendo.de/station-info/rest/api/station/${station}`
  )).data;
  return {
    id: info.id,
    title: info.title,
    evaId: info.eva_ids[0],
    recursive: info.eva_ids.length > 1
  };
}

// http://reiseauskunft.bahn.de/bin/ajax-getstop.exe/dn?S=Tauberbischofsheim
async function stationSearchHAFAS(searchTerm: string) {
  const buffer = (await axios.get(`http://reiseauskunft.bahn.de/bin/ajax-getstop.exe/dn?S=${encodeSearchTerm(searchTerm)}*`, {
    responseType: 'arraybuffer'
  })).data;
  const rawReply = iconv.decode(buffer, 'latin-1')
  const stringReply = rawReply.substring(8, rawReply.length - 22);
  const stations = JSON.parse(stringReply).suggestions;
  return stations.map(station => ({
    title: station.value,
    evaId: station.extId,
  }));
}

async function stationSearch(searchTerm: string) {
  const stations = (await axios.get(
    `https://si.favendo.de/station-info/rest/api/search?searchTerm=${encodeSearchTerm(searchTerm)}`
  )).data;
  return stations.map(station => ({
    title: station.title,
    id: station.id
  }));
}


// https://ws.favendo.de/wagon-order/rest/v1/si/1401
async function wagenReihung(trainNumbers: string[], station: number) {
  const info: Wagenreihung = (await axios.post(
    `https://ws.favendo.de/wagon-order/rest/v1/si/${station}`,
    trainNumbers.map(trainNumber => ({ trainNumber }))
  )).data;
  return info;
}

router
  .prefix('/api')
  // https://si.favendo.de/station-info/rest/api/search?searchTerm=Bochum
  .get('/search/:searchTerm', async ctx => {
    if (process.env.NODE_ENV === 'test') {
      ctx.body = require('./testData/search');
      return;
    }
    const { searchTerm } = ctx.params;
    ctx.body = await stationSearch(searchTerm);
  })
  .get('/searchHAFAS/:searchTerm', async ctx => {
    if (process.env.NODE_ENV === 'test') {
      ctx.body = require('./testData/search');
      return;
    }
    const { searchTerm } = ctx.params;
    ctx.body = await stationSearchHAFAS(searchTerm);
  })
  // https://si.favendo.de/station-info/rest/api/station/724
  .get('/station/:station', async ctx => {
    const { station } = ctx.params;
    ctx.body = await stationInfo(station);
  })
  .get('/abfahrten/:station', async ctx => {
    if (process.env.NODE_ENV === 'test') {
      ctx.body = require('./testData/abfahrten');
      return;
    }
    const { station } = ctx.params;
    const info = await stationInfo(station);
    // https://marudor.de/api/KD?mode=marudor&backend=iris&version=2
    const abfahrten = (await axios.get(
      `http://***REMOVED***f.finalrewind.org/${info.evaId}?mode=marudor&backend=iris&version=2`
    )).data;
    ctx.body = abfahrten;
  })
  .get('/wagen/:station/:train', async ctx => {
    const { station, train } = ctx.params;
    try {
      ctx.body = await wagenReihung([train], station);
    } catch (e) {
      ctx.body = e.response.data;
    }
  });

global.koa.use(router.routes());
