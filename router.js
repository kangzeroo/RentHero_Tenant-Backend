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
const FavoritesQuery = require('./Postgres/Queries/FavoritesQueries')

const JWT_Check = require('./auth/JWT_Check').JWT_Check
const originCheck = require('./auth/originCheck').originCheck

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
	app.post('/post_tenant_info', [json_encoding, originCheck], TenantQuery.post_tenant_info)
	app.post('/get_tenant_info', [json_encoding, originCheck], TenantQuery.get_tenant_info)

	// search routes
	app.post('/get_all_active_buildings', [json_encoding, originCheck], BuildingQuery.get_all_active_buildings)
	app.post('/get_all_active_buildings_mobile_filtered', [json_encoding, originCheck], BuildingQuery.get_all_active_buildings_mobile_filtered)
	app.post('/get_all_active_buildings_geo', [json_encoding, originCheck], BuildingQuery.get_all_active_buildings_geo)
	app.post('/get_specific_building', [json_encoding, originCheck], BuildingQuery.get_specific_building)
	app.post('/get_specific_building_by_alias', [json_encoding, originCheck], BuildingQuery.get_specific_building_by_alias)
	app.post('/get_building_by_place_id', [json_encoding, originCheck], BuildingQuery.get_building_by_place_id)
	app.post('/get_building_by_address', [json_encoding, originCheck], BuildingQuery.get_building_by_address)
	app.post('/get_specific_landlord', [json_encoding, originCheck], BuildingQuery.get_specific_landlord)
	app.post('/get_all_summary_images', [json_encoding, originCheck], BuildingQuery.get_all_summary_images)
	app.post('/get_images_for_specific_building', [json_encoding, originCheck], BuildingQuery.get_images_for_specific_building)
	app.post('/get_all_images_size_for_specific_building', [json_encoding, originCheck], BuildingQuery.get_all_images_size_for_specific_building)
	app.post('/get_num_virtual_tours', [json_encoding, originCheck], BuildingQuery.get_num_virtual_tours)
	app.post('/get_amenities_for_specific_building', [json_encoding, originCheck], BuildingQuery.get_amenities_for_specific_building)
	app.post('/get_recommended_buildings', [json_encoding, originCheck], BuildingQuery.get_recommended_buildings)
	app.post('/get_building_by_id', [json_encoding, originCheck], BuildingQuery.get_building_by_id)

	// room queries
	app.post('/get_room_page', [json_encoding, originCheck], RoomQuery.get_room_page)
	app.post('/get_room_amenities', [json_encoding, originCheck], RoomQuery.get_room_amenities)

	// suite queries
	app.post('/get_suite_page', [json_encoding, originCheck], SuiteQuery.get_suite_page)
	app.post('/get_available_suites', [json_encoding, originCheck], SuiteQuery.get_available_suites)
	app.post('/get_amenities_for_suite', [json_encoding, originCheck], SuiteQuery.get_amenities_for_suite)
	app.post('/get_all_rooms_for_suite', [json_encoding, originCheck], SuiteQuery.get_all_rooms_for_suite)
	app.post('/get_suite_imgs', [json_encoding, originCheck], SuiteQuery.get_suite_imgs)

	// filter buidlings queries
	app.post('/filter_buildings', [json_encoding, originCheck], FilterQueries.filter_buildings)
	app.post('/sort_buildings', [json_encoding, originCheck], FilterQueries.sort_buildings)

	// sublet routes
	app.post('/check_latest_sublet', [json_encoding, originCheck], SubletQuery.check_latest_sublet)
	app.post('/get_sublets', [json_encoding, originCheck], SubletQuery.get_sublets)
	app.post('/new_sublets', [json_encoding, originCheck], SubletQuery.new_sublets)
	app.post('/get_matching_sublets', [json_encoding, originCheck], SubletQuery.get_matching_sublets)
	app.post('/get_matching_sublets_by_address', [json_encoding, originCheck], SubletQuery.get_matching_sublets_by_address)
	app.post('/longlivetoken', [json_encoding, originCheck], Authentication.longlivetoken)

	// Tenant routes
	app.post('/insert_user', [json_encoding, JWT_Check, originCheck], TenantQuery.insert_user)

	// Requests routes
	app.post('/submit_request', [json_encoding, JWT_Check, originCheck], RequestQuery.submit_request)

	// Landlord routes
	app.post('/get_landlord_info', [json_encoding, originCheck], LandlordQuery.get_landlord_info)

	// Favorites routes
	app.post('/insert_building_favorite', [json_encoding, originCheck], FavoritesQuery.insert_building_favorite)
	app.post('/insert_suite_favorite', [json_encoding, originCheck], FavoritesQuery.insert_suite_favorite)
	app.post('/delete_building_favorite', [json_encoding, originCheck], FavoritesQuery.delete_building_favorite)
	app.post('/delete_suite_favorite', [json_encoding, originCheck], FavoritesQuery.delete_suite_favorite)
	app.post('/get_all_favorites_for_tenant', [json_encoding, originCheck], FavoritesQuery.get_all_favorites_for_tenant)
	app.post('/get_all_tenant_favorites', [json_encoding, originCheck], FavoritesQuery.get_all_tenant_favorites)
	app.post('/get_tenant_favorite_for_building', [json_encoding, originCheck], FavoritesQuery.get_tenant_favorite_for_building)
	app.post('/get_favorites_for_tenants_of_group', [json_encoding, originCheck], FavoritesQuery.get_favorites_for_tenants_of_group)
}
