
let db;

function initDatabase() {
    const sqlite3 = require('sqlite3').verbose();
    
    db = new sqlite3.Database('./server/Data/Officefiles/MapLanes.db', sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Connected to the MapLanes database.');
        }
      });
    
}

function queryLanePoints(egoPosition) {
    db.serialize(function() {
        const getPointsQuery =   `select * from Points where ((${egoPosition.x})-573987.744448394) * (${egoPosition.x}-573987.744448394)) + ((${egoPosition.y}-4138277.8979529) * (${egoPosition.y}-4138277.8979529)) <= 400 order by lane_id, point_id`;
        console.log(getPointsQuery);
        db.all(getPointsQuery, function(err, row) {
            if (err) {
                console.error('error looking up if user exists', err);
                return;
            }
            if (row['count(*)'] === 0) {
                console.log(row);
            } 
        });
        });
}
 

  module.exports = {
      initDatabase,
      queryLanePoints
  }