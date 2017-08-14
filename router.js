const bodyParser = require('body-parser')
// routes
const Test = require('./routes/test_routes')
const Search = require('./routes/search_routes')
const BuildingQuery = require('./Postgres/Queries/BuildingQuery')

// bodyParser attempts to parse any request into JSON format
const json_encoding = bodyParser.json({type:'*/*'})
// bodyParser attempts to parse any request into GraphQL format
// const graphql_encoding = bodyParser.text({ type: 'application/graphql' })

module.exports = function(app){

	// routes
	app.get('/test', json_encoding, Test.test)

	// search routes
	app.post('/searchInArea', json_encoding, Search.searchInArea)
	// app.post('/searchInArea', json_encoding, Search.searchInArea)
	// app.post('/searchInArea', json_encoding, Search.searchInArea)
	app.post('/get_buildings_info', json_encoding, BuildingQuery.get_buildings_info)


}
