
// GET /searchInArea
// a generic search query that takes query params and returns db matches
exports.searchInArea = function(req, res, next){
  const p = new Promise((res, rej) => {
    // example params = {
    //   min_price: 500,
    //   max_price: 800,
    //   attr: true
    // }
    const params = req.body.params
    const query_string = `SQL statement that combines building info with suite info
                          so that we can show prices upon browsing through buildings
                          on the map`
    // each result should have summary info for suites and building
    // the summary info is based off what customers would want to see when casually browsing
    // before theyve selected a building for more details
    // example results = [
    //   {
    //     building_info: {},
    //     suites_summary: {},
    //   }
    // ]
    const results = []
    res.json({
      message: "Searched in area",
      results: results
    })
  })
  return p
}
