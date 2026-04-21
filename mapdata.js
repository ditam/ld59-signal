import constants from './constants.js';
import utils from './utils.js';

function generateMapObjects(mapObjects, imgAssets) {
  mapObjects.push({
    type: 'planet',
    id: 'Dagon',
    img: imgAssets.planetImg0,
    x: 540,
    y: 600,
    population: 200
  });
  mapObjects.push({
    type: 'planet',
    id: 'Dimidium',
    img: imgAssets.planetImg2,
    x: 820,
    y: 350,
    population: 3000
  });
  mapObjects.push({
    type: 'planet',
    id: 'Talmos',
    img: imgAssets.planetImg4,
    x: 200,
    y: 210,
    population: 7000
  });
  mapObjects.push({
    type: 'moon',
    subtype: 'basic',
    id: 'Echnia',
    name: 'The moon', // utils.getRandomName(),
    orbits: 'Dagon',
    x: 540,
    y: 200,
    population: 1400
  });
  // test ship to trigger comms list
  mapObjects.push({
    type: 'ship',
    id: 'test-ship',
    x: 880,
    y: 750,
    population: 30,
    name: utils.getRandomName()
  });
  console.assert(mapObjects.filter(o=>o.type === 'planet').length > 1, 'Invalid planet list - too short for source randomization.');
  const planetIDs = mapObjects.filter(o=>o.type === 'planet').map(o=>o.id);
  for (let i=0; i<10; i++) {
    const targetID = utils.getRandomItem(planetIDs);
    let sourceID;
    do {
      sourceID = utils.getRandomItem(planetIDs);
    } while (targetID === sourceID);
    mapObjects.push({
      type: 'ship',
      id: utils.getNewID(),
      name: utils.getRandomName(),
      // TODO: place around source instead of random
      x: utils.getRandomInt(constants.MAP_WIDTH),
      y: utils.getRandomInt(constants.MAP_HEIGHT),
      population: utils.getRandomInt(1000),
      targetID: targetID,
      sourceID: sourceID
    });
  }
  console.log('map:', mapObjects);
}

export default {
  loadMapData: generateMapObjects
};
