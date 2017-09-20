
const AWS = require('aws-sdk')
const aws_config = require('../../credentials/aws_config')
const dynaDoc = require("dynamodb-doc");
AWS.config.update(aws_config)

const dynamodb = new AWS.DynamoDB({
  dynamodb: '2012-08-10',
  region: "us-east-1"
})
const docClient = new dynaDoc.DynamoDB(dynamodb)

// ====================================

exports.generateSublets = function(sublet){
  return [
    {
      "TableName": "Rentburrow_Sublets_Historical",
      "Item": {
          "POSTED_DATE": sublet.posted_date,
          "POST_ID": sublet.post_id,
          "ADDRESS": sublet.address,
          "PLACE_ID": sublet.place_id,
          "DESCRIPTION": sublet.description,
          "PRICE": sublet.price,
          "FB_USER_ID": sublet.fb_user_id,
          "FB_USER_NAME": sublet.fb_user_name,
          "FB_USER_PIC": sublet.fb_user_pic,
          "FB_GROUP_ID": sublet.fb_group_id,
          "GPS_X": sublet.gps_x,
          "GPS_Y": sublet.gps_y,
          "ENSUITE_BATH": sublet.ensuite_bath || false,
          "UTILS_INCL": sublet.utils_included || false,
          "FEMALE_ONLY": sublet.female_only || false,
          "ROOMS_LEFT": sublet.rooms_left || 0,
          "PHONE": sublet.phone || 'none',
          "IMAGES": JSON.stringify(sublet.images),
          "SCRAPPED_AT": new Date().getTime() / 1000,
      }
    },
    {
      "TableName": "Rentburrow_Sublets_Operational",
      "Item": {
          "POSTED_DATE": sublet.posted_date,
          "POST_ID": sublet.post_id,
          "ADDRESS": sublet.address,
          "PLACE_ID": sublet.place_id,
          "DESCRIPTION": sublet.description,
          "PRICE": sublet.price,
          "FB_USER_ID": sublet.fb_user_id,
          "FB_USER_NAME": sublet.fb_user_name,
          "FB_USER_PIC": sublet.fb_user_pic,
          "FB_GROUP_ID": sublet.fb_group_id,
          "GPS_X": sublet.gps_x,
          "GPS_Y": sublet.gps_y,
          "ENSUITE_BATH": sublet.ensuite_bath || false,
          "UTILS_INCL": sublet.utils_included || false,
          "FEMALE_ONLY": sublet.female_only || false,
          "ROOMS_LEFT": sublet.rooms_left || 0,
          "PHONE": sublet.phone || 'none',
          "IMAGES": JSON.stringify(sublet.images),
          "SCRAPPED_AT": new Date().getTime() / 1000,
      }
    }
  ]
}
