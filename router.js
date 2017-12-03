const bodyParser = require('body-parser')
// routes
const Test = require('./routes/test_routes')
const BuildingQuery = require('./Postgres/Queries/BuildingQuery')
const SuiteQuery = require('./Postgres/Queries/SuiteQuery')
const RoomQuery = require('./Postgres/Queries/RoomQuery')
const TenantQuery = require('./Postgres/Queries/TenantQuery')
const FilterQueries = require('./Postgres/Queries/FilterQueries')
const SubletQuery = require('./SubletScrapper/SubletQuery')
const Authentication = require('./SubletScrapper/FacebookToken')
const RequestQuery = require('./Postgres/Queries/RequestQuery')
const LandlordQuery = require('./Postgres/Queries/LandlordQuery')

const JWT_Check = require('./auth/JWT_Check').JWT_Check

// bodyParser attempts to parse any request into JSON format
const json_encoding = bodyParser.json({
	type:'*/*',
	limit: '2mb'
})
// bodyParser attempts to parse any request into GraphQL format
// const graphql_encoding = bodyParser.text({ type: 'application/graphql' })

module.exports = function(app){

	// routes
	app.get('/test', json_encoding, Test.test)

	// tenant profile routes
	app.post('/post_tenant_info', [json_encoding, JWT_Check], TenantQuery.post_tenant_info)
	app.post('/get_tenant_info', [json_encoding, JWT_Check], TenantQuery.get_tenant_info)

	// search routes
	app.post('/get_all_active_buildings', json_encoding, BuildingQuery.get_all_active_buildings)
	app.post('/get_all_active_buildings_geo', [json_encoding, JWT_Check], BuildingQuery.get_all_active_buildings_geo)
	app.post('/get_specific_building', [json_encoding, JWT_Check], BuildingQuery.get_specific_building)
	app.post('/get_specific_building_by_alias', [json_encoding, JWT_Check], BuildingQuery.get_specific_building_by_alias)
	app.post('/get_building_by_place_id', [json_encoding, JWT_Check], BuildingQuery.get_building_by_place_id)
	app.post('/get_building_by_address', [json_encoding, JWT_Check], BuildingQuery.get_building_by_address)
	app.post('/get_specific_landlord', [json_encoding, JWT_Check], BuildingQuery.get_specific_landlord)
	app.post('/get_all_summary_images', [json_encoding, JWT_Check], BuildingQuery.get_all_summary_images)
	app.post('/get_images_for_specific_building', [json_encoding, JWT_Check], BuildingQuery.get_images_for_specific_building)
	app.post('/get_all_images_size_for_specific_building', [json_encoding, JWT_Check], BuildingQuery.get_all_images_size_for_specific_building)
	app.post('/get_num_virtual_tours', [json_encoding, JWT_Check], BuildingQuery.get_num_virtual_tours)
	app.post('/get_amenities_for_specific_building', [json_encoding, JWT_Check], BuildingQuery.get_amenities_for_specific_building)

	// room queries
	app.post('/get_room_page', [json_encoding, JWT_Check], RoomQuery.get_room_page)
	app.post('/get_room_amenities', [json_encoding, JWT_Check], RoomQuery.get_room_amenities)

	// suite queries
	app.post('/get_suite_page', [json_encoding, JWT_Check], SuiteQuery.get_suite_page)
	app.post('/get_available_suites', [json_encoding, JWT_Check], SuiteQuery.get_available_suites)
	app.post('/get_amenities_for_suite', [json_encoding, JWT_Check], SuiteQuery.get_amenities_for_suite)
	app.post('/get_all_rooms_for_suite', [json_encoding, JWT_Check], SuiteQuery.get_all_rooms_for_suite)
	app.post('/get_suite_imgs', [json_encoding, JWT_Check], SuiteQuery.get_suite_imgs)

	// filter buidlings queries
	app.post('/filter_buildings', [json_encoding, JWT_Check], FilterQueries.filter_buildings)
	app.post('/sort_buildings', [json_encoding, JWT_Check], FilterQueries.sort_buildings)

	// sublet routes
	app.post('/check_latest_sublet', [json_encoding, JWT_Check], SubletQuery.check_latest_sublet)
	app.post('/get_sublets', [json_encoding, JWT_Check], SubletQuery.get_sublets)
	app.post('/new_sublets', [json_encoding, JWT_Check], SubletQuery.new_sublets)
	app.post('/get_matching_sublets', [json_encoding, JWT_Check], SubletQuery.get_matching_sublets)
	app.post('/get_matching_sublets_by_address', [json_encoding, JWT_Check], SubletQuery.get_matching_sublets_by_address)
	app.post('/longlivetoken', [json_encoding, JWT_Check], Authentication.longlivetoken)

	// Tenant routes
	app.post('/insert_user', [json_encoding, JWT_Check], TenantQuery.insert_user)

	// Requests routes
	app.post('/submit_request', [json_encoding, JWT_Check], RequestQuery.submit_request)

	// Landlord routes
	app.post('/get_landlord_info', [json_encoding, JWT_Check], LandlordQuery.get_landlord_info)
}
