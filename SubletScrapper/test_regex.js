const keywords = require('./api/subletExtractor/keywords')

const sublet = {
  description: `
    Subletting on luxe un
    new renovations and luxury units
    call or message me
  `
}

function parseOnCommonStreetNames(sublet){
  const p = new Promise((res, rej) => {
    keywords.common_street_shortnames.forEach((streetname, index) => {
      const regexMatch = new RegExp(`\\d+\\s(${streetname.alias})`, 'ig')
    	const parsed_addresses = sublet.description.match(regexMatch)
      if (parsed_addresses) {
        const fullStreet = parsed_addresses[0].match(/\d+/ig)[0] + ' ' + streetname.address
        console.log(fullStreet)
        sublet.address = fullStreet
        res(sublet)
      }
      if (index === keywords.common_street_shortnames.length -1) {
        parseOnCommonBuildingAliases(sublet).then((parsedSublet) => {
          res(parsedSublet)
        }).catch((err) => {
          rej(err)
        })
      }
    })
  })
  return p
}

function parseOnCommonBuildingAliases(sublet){
  const p = new Promise((res, rej) => {
    keywords.common_building_aliases.forEach((buildingAlias, index) => {
      const regexMatch = new RegExp(`(${buildingAlias.alias})`, 'ig')
    	const parsed_addresses = sublet.description.match(regexMatch)
      if (parsed_addresses) {
        sublet.address = buildingAlias.address
        res(sublet)
      }
      if (index === keywords.common_street_shortnames.length -1) {
        rej('Could not find by building alias or street shortname')
      }
    })
  })
  return p
}

parseOnCommonStreetNames(sublet)
