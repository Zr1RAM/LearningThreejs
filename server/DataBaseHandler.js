
//et db;

// function initDatabase() {
//     const sqlite3 = require('sqlite3').verbose();
    
    
//     db = new sqlite3.Database('./server/Data/Officefiles/MapLanes.db', sqlite3.OPEN_READONLY, (err) => {
//         if (err) {
//             console.error(err.message);
//         } else {
//             console.log('Connected to the MapLanes database.');
//         }
//       });
    
// }

// function queryLanePoints(egoPosition) {
//     db.serialize(function() {
//         const getPointsQuery =   `select * from Points where ((${egoPosition.x})-573987.744448394) * (${egoPosition.x}-573987.744448394)) + ((${egoPosition.y}-4138277.8979529) * (${egoPosition.y}-4138277.8979529)) <= 400 order by lane_id, point_id`;
//         console.log(getPointsQuery);
//         db.all(getPointsQuery, function(err, row) {
//             if (err) {
//                 console.error('error looking up if user exists', err);
//                 return;
//             }
//             if (row['count(*)'] === 0) {
//                 console.log(row);
//             } 
//         });
//         });
// }

const DatabaseHandler = () => {
    const sqlite3 = require('sqlite3').verbose();
    let dbConnection = null;

    const connect = () => new Promise((resolve, reject) => {
        const db = new sqlite3.Database('./server/Data/Officefiles/DB/MapLanes.db', sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                reject(err.message);
            }
            //debug(`Connected to "${process.env.DB_NAME}" SQlite database.`);
            resolve(db);
        });
    });

    async function init() {
     dbConnection = await connect()//.then(conn =>  conn);
    }

    let queryResult = null;
    async function getEgoRelativeLanePoints(egoPosition) {
        try {
            
        queryResult = await queryLanePoints(egoPosition);
        } catch (e) {

        }
    }

    function queryLanePoints(egoPosition) {
        return new Promise((resolve, reject) => {
            dbConnection.serialize(function () {
                const getPointsQuery = `select * from Points where ((x-${egoPosition.x}) * (x-${egoPosition.x})) + ((y-${egoPosition.y}) * (y-${egoPosition.y})) <= 400 order by lane_id, point_id`;
                // console.log(getPointsQuery);
                //console.log(getPointsQuery);
                // const getPointsQuery =   `select * from Points limit 5`;
                dbConnection.all(getPointsQuery, (err, rows) => {
                    if (err) {
                        console.error('error looking up query', err);
                        reject(err.message);
                    }
                    // if (row['count(*)'] != 0) {
                    //console.log(row);
                    resolve(rows);
                    // } 
                });
            });
        });
    }
    // function queryLanePoints(egoPosition) {
    //     dbConnection.serialize(function() {
    //         const getPointsQuery =   `select * from Points where ((x-${egoPosition.x}) * (x-${egoPosition.x})) + ((y-${egoPosition.y}) * (y-${egoPosition.y})) <= 400 order by lane_id, point_id`;
    //         //console.log(getPointsQuery);
    //         // const getPointsQuery =   `select * from Points limit 5`;
    //         dbConnection.all(getPointsQuery, function(err, row) {
    //             if (err) {
    //                 console.error('error looking up query', err);
    //                 return;
    //             }
    //             // if (row['count(*)'] != 0) {
    //                 //console.log(row);
    //                 return row;
    //             // } 
    //         });
    //         });
    // }

    return {
        connection: dbConnection,
        init,
        queryLanePoints
    };
}
 

  module.exports = DatabaseHandler;