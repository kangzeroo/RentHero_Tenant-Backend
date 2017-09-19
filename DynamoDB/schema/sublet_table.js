const AWS = require('aws-sdk')
const aws_config = require('../../credentials/aws_config.json')
AWS.config.update(aws_config)


const subletTableParams = {
    TableName : "RentBurrow_Sublets_Waterloo",
    KeySchema: [
        { AttributeName: "POSTED_DATE", KeyType: "HASH" },  //Partition key
        { AttributeName: "POST_ID", KeyType: "RANGE" },  //Sort key
    ],
    AttributeDefinitions: [
        { AttributeName: "ADDRESS", AttributeType: "S" },
        { AttributeName: "PLACE_ID", AttributeType: "S" },
        { AttributeName: "DESCRIPTION", AttributeType: "S" },
        { AttributeName: "PRICE", AttributeType: "N" },
        { AttributeName: "FB_USER_ID", AttributeType: "S" },
        { AttributeName: "FB_USER_NAME", AttributeType: "S" },
        { AttributeName: "FB_USER_PIC", AttributeType: "S" },
        { AttributeName: "FB_GROUP_ID", AttributeType: "S" },
        { AttributeName: "GPS_X", AttributeType: "N" },
        { AttributeName: "GPS_Y", AttributeType: "N" },
        { AttributeName: "ENSUITE_BATH", AttributeType: "B" },
        { AttributeName: "UTILS_INCL", AttributeType: "B" },
        { AttributeName: "FEMALE_ONLY", AttributeType: "B" },
        { AttributeName: "ROOMS_LEFT", AttributeType: "N" },
        { AttributeName: "PHONE", AttributeType: "S" },
        { AttributeName: "IMAGES", AttributeType: "S" },
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 5,
    },
    LocalSecondaryIndexes: [
      {
        IndexName: 'Address', /* required */
        KeySchema: [ /* required */
          {
            AttributeName: 'POSTED_DATE', /* required */
            KeyType: 'HASH' /* required */
          },
          {
            AttributeName: 'ADDRESS', /* required */
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
        IndexName: 'Address', /* required */
        KeySchema: [ /* required */
          {AttributeName: 'ADDRESS', KeyType: 'HASH'},
          {AttributeName: 'POST_ID', KeyType: 'RANGE'}
        ],
        Projection: { /* required */
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: { /* required */
          ReadCapacityUnits: 5, /* required */
          WriteCapacityUnits: 2 /* required */
        }
      },
      {
        IndexName: 'Facebook_ID', /* required */
        KeySchema: [ /* required */
          {AttributeName: 'FB_USER_ID', KeyType: 'HASH'},
          {AttributeName: 'POST_ID', KeyType: 'RANGE'}
        ],
        Projection: { /* required */
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: { /* required */
          ReadCapacityUnits: 5, /* required */
          WriteCapacityUnits: 2 /* required */
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

  // dynamodb.createTable(subletTableParams, function(err, data) {
  //     if (err)
  //         console.log(JSON.stringify(err, null, 2));
  //     else
  //         console.log(JSON.stringify(data, null, 2));
  // })
}
