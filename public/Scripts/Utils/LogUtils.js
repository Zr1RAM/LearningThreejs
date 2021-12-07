export function visionLanesCoordinatesConvert(vector3Points) {
    const lanepoint = vector3Points.map(point => {
        return {
            y : point.x,
            x : point.z
        }
    });
    console.log(lanepoint);
    console.log('Three JS Coordinate');
    console.log(vector3Points);
}   

export function logMapLaneCentreLinePoints(vector3Points, leftPoints, rightPoints,data) {
    console.log('map lane center line points , left and right bounds respectively')
    console.log(data);
    const centreLanePoint = vector3Points.map(point => {
        return {
            x : point.x,
            y : point.z,
        }
    });
    const leftLanePoints = leftPoints.map(point => {
        return {
            x : point.x,
            "y-w/2" : point.z,
        }
    });
    const rightLanePoints = rightPoints.map(point => {
        return {
            x : point.x,
            "y+w/2" : point.z,
        }
    });
    console.log(centreLanePoint);
    console.log(leftLanePoints);
    console.log(rightLanePoints);
    //console.log('Three JS Coordinate');
    //console.log(vector3Points);
}
