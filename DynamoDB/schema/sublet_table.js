const AWS = require('aws-sdk')
const aws_config = require('../../credentials/aws_config')
AWS.config.update(aws_config)


const subletsHistoricalTableParams = {
    TableName : "Rentburrow_Sublets_Historical",
    KeySchema: [
        { AttributeName: "POSTED_DATE", KeyType: "HASH" },  //Partition key
        { AttributeName: "POST_ID", KeyType: "RANGE" },  //Sort key
    ],
    AttributeDefinitions: [
        { AttributeName: "POSTED_DATE", AttributeType: "N" },
        { AttributeName: "POST_ID", AttributeType: "S" },
        // { AttributeName: "ADDRESS", AttributeType: "S" },
        { AttributeName: "PLACE_ID", AttributeType: "S" },
        // { AttributeName: "DESCRIPTION", AttributeType: "S" },
        // { AttributeName: "PRICE", AttributeType: "N" },
        { AttributeName: "FB_USER_ID", AttributeType: "S" },
        // { AttributeName: "FB_USER_NAME", AttributeType: "S" },
        // { AttributeName: "FB_USER_PIC", AttributeType: "S" },
        // { AttributeName: "FB_GROUP_ID", AttributeType: "S" },
        // { AttributeName: "GPS_X", AttributeType: "N" },
        // { AttributeName: "GPS_Y", AttributeType: "N" },
        // { AttributeName: "ENSUITE_BATH", AttributeType: "B" },
        // { AttributeName: "UTILS_INCL", AttributeType: "B" },
        // { AttributeName: "FEMALE_ONLY", AttributeType: "B" },
        // { AttributeName: "ROOMS_LEFT", AttributeType: "N" },
        // { AttributeName: "PHONE", AttributeType: "S" },
        // { AttributeName: "IMAGES", AttributeType: "S" },
        // { AttributeName: "SCRAPPED_AT", AttributeType: "N" },
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 2,
        WriteCapacityUnits: 5,
    },
    LocalSecondaryIndexes: [
      {
        IndexName: 'Address_Local', /* required */
        KeySchema: [ /* required */
          {
            AttributeName: 'POSTED_DATE', /* required */
            KeyType: 'HASH' /* required */
          },
          {
            AttributeName: 'PLACE_ID', /* required */
            KeyType: 'RANGE' /* required */
          }
          /* more items */
        ],
        Projection: { /* required */
          ProjectionType: 'ALL'
        }
      },
      /* more items */
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'Posted_Date', /* required */
        KeySchema: [ /* required */
          {AttributeName: 'POSTED_DATE', KeyType: 'HASH'},
          {AttributeName: 'PLACE_ID', KeyType: 'RANGE'}
        ],
        Projection: { /* required */
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: { /* required */
          ReadCapacityUnits: 2, /* required */
          WriteCapacityUnits: 5 /* required */
        }
      },
      {
        IndexName: 'Facebook_ID', /* required */
        KeySchema: [ /* required */
          {AttributeName: 'FB_USER_ID', KeyType: 'HASH'},
          {AttributeName: 'POSTED_DATE', KeyType: 'RANGE'}
        ],
        Projection: { /* required */
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: { /* required */
          ReadCapacityUnits: 2, /* required */
          WriteCapacityUnits: 5 /* required */
        }
      }
    ]
}

const subletsOperationalTableParams = {
    TableName : "Rentburrow_Sublets_Operational",
    KeySchema: [
        { AttributeName: "PLACE_ID", KeyType: "HASH" },  //Partition key
        { AttributeName: "FB_USER_ID", KeyType: "RANGE" },  //Sort key
    ],
    AttributeDefinitions: [
        { AttributeName: "POSTED_DATE", AttributeType: "N" },
        // { AttributeName: "POST_ID", AttributeType: "S" },
        // { AttributeName: "ADDRESS", AttributeType: "S" },
        { AttributeName: "PLACE_ID", AttributeType: "S" },
        // { AttributeName: "DESCRIPTION", AttributeType: "S" },
        // { AttributeName: "PRICE", AttributeType: "N" },
        { AttributeName: "FB_USER_ID", AttributeType: "S" },
        // { AttributeName: "FB_USER_NAME", AttributeType: "S" },
        // { AttributeName: "FB_USER_PIC", AttributeType: "S" },
        // { AttributeName: "FB_GROUP_ID", AttributeType: "S" },
        // { AttributeName: "GPS_X", AttributeType: "N" },
        // { AttributeName: "GPS_Y", AttributeType: "N" },
        // { AttributeName: "ENSUITE_BATH", AttributeType: "B" },
        // { AttributeName: "UTILS_INCL", AttributeType: "B" },
        // { AttributeName: "FEMALE_ONLY", AttributeType: "B" },
        // { AttributeName: "ROOMS_LEFT", AttributeType: "N" },
        // { AttributeName: "PHONE", AttributeType: "S" },
        // { AttributeName: "IMAGES", AttributeType: "S" },
        // { AttributeName: "SCRAPPED_AT", AttributeType: "N" },
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
    },
    LocalSecondaryIndexes: [
      {
        IndexName: 'PlaceID_Date_LOCAL', /* required */
        KeySchema: [ /* required */
          {
            AttributeName: 'PLACE_ID', /* required */
            KeyType: 'HASH' /* required */
          },
          {
            AttributeName: 'POSTED_DATE', /* required */
            KeyType: 'RANGE' /* required */
          }
          /* more items */
        ],
        Projection: { /* required */
          ProjectionType: 'ALL'
        }
      },
      /* more items */
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'PlaceID_Date_GLOBAL', /* required */
        KeySchema: [ /* required */
          {AttributeName: 'PLACE_ID', KeyType: 'HASH'},
          {AttributeName: 'POSTED_DATE', KeyType: 'RANGE'}
        ],
        Projection: { /* required */
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: { /* required */
          ReadCapacityUnits: 5, /* required */
          WriteCapacityUnits: 5 /* required */
        }
      }
    ]
}

exports.createTables = function(){

  console.log("==> About to create DynamoDB tables!")

  const dynamodb = new AWS.DynamoDB({
    dynamodb: '2012-08-10',
    region: "us-east-1"
  })

  dynamodb.createTable(subletsHistoricalTableParams, function(err, data) {
      if (err)
          console.log(JSON.stringify(err, null, 2));
      else
          console.log(JSON.stringify(data, null, 2));
  })
}
