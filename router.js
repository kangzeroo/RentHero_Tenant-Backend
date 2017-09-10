const bodyParser = require('body-parser')
// routes
const Test = require('./routes/test_routes')
const BuildingQuery = require('./Postgres/Queries/BuildingQuery')

// bodyParser attempts to parse any request into JSON format
const json_encoding = bodyParser.json({type:'*/*'})
// bodyParser attempts to parse any request into GraphQL format
// const graphql_encoding = bodyParser.text({ type: 'application/graphql' })

module.exports = function(app){

	// routes
	app.get('/test', json_encoding, Test.test)

	// search routes
	app.post('/get_all_active_buildings', json_encoding, BuildingQuery.get_all_active_buildings)
	app.post('/get_specific_building', json_encoding, BuildingQuery.get_specific_building)
	app.post('/get_specific_building_by_alias', json_encoding, BuildingQuery.get_specific_building_by_alias)
	app.post('/get_images_for_specific_building', json_encoding, BuildingQuery.get_images_for_specific_building)
	app.post('/get_amenities_for_specific_building', json_encoding, BuildingQuery.get_amenities_for_specific_building)
	app.post('/get_available_suites', json_encoding, BuildingQuery.get_available_suites)
}
