import * as THREE from 'three'
import { Line2 } from 'lines/Line2.js';
import { LineGeometry } from 'lines/LineGeometry.js';
import { LineMaterial } from 'lines/LineMaterial.js';
//temp variable
const tempPos = new THREE.Vector3(0,0,0);
export function GetLaneFromParameters(data) {
    let LaneSpline = [];
    for (let i = 0 ; i < data.length ; i++) {
        // front_Line_poly
        LaneSpline.push(
            createLanePolyLine(data[i].right_marker.front_line_poly, 0xffffff)
        );
        //createLanePolyLine(data[i].left_marker.front_line_poly, 0x00ff00);
        // rear_line_poly
        LaneSpline.push(
            createLanePolyLine(data[i].right_marker.rear_line_poly, 0xffffff)
        );
        //createLanePolyLine(data[i].left_marker.rear_line_poly, 0x00ff00);
    }
    return LaneSpline;
}

const intervalValue = 10; //value at which intervals to take between range_start_m and range_end_m

function createLanePolyLine(data, splineColor) {
    let Intervals =  CalculateInterval(data.range_start_m,data.range_end_m);
    let laneSplinePoly;
    if (Intervals > 0) {
        let LaneCoordinates = [];
        let y = CalculateCubicSplineYCoordinate(data, tempPos.z + data.range_start_m);
        LaneCoordinates.push(
            makeCoordinateForLaneSpline(y, 0, tempPos.z + data.range_start_m)
        );
        for (let i = 1; i < Intervals - 2; i++) {
            const yCoordinate = CalculateCubicSplineYCoordinate(data, tempPos.z + data.range_start_m + (intervalValue * i));
            LaneCoordinates.push(
                makeCoordinateForLaneSpline(yCoordinate, 0, tempPos.z + data.range_start_m + (intervalValue * i))
            );
        }
        y = CalculateCubicSplineYCoordinate(data, tempPos.z + data.range_end_m);
        LaneCoordinates.push(
            makeCoordinateForLaneSpline(y, 0, tempPos.z + data.range_end_m)
        );


        // Create the spline to be added to the scene
        laneSplinePoly = makeSplineFromPoints(LaneCoordinates,splineColor);
    }
    return laneSplinePoly;

}

function CalculateInterval(a,b) {
    return Math.abs((Math.floor(a) - Math.floor(b)) / intervalValue) ;
}

function CalculateCubicSplineYCoordinate(data, x)
{
    const { c0, c1, c2, c3 } = data;
    const y = c0 + (c1 * x) + (c2 * Math.pow(x,2)) + (c3 * Math.pow(x,3));
    return y;
}

function makeCoordinateForLaneSpline(x,y,z) {
    return new THREE.Vector3( x,  y,  z);
} 

function makeSplineFromPoints(points,splineColor) {
    const frontLinePolyPoints = new THREE.CatmullRomCurve3(points, false);
    let lanePoints = frontLinePolyPoints.getPoints(50);
    lanePoints = lanePoints.reduce((acc,l)=>acc.concat(l.toArray()),[]);
    const laneGeometry = new LineGeometry();
    laneGeometry.setPositions(lanePoints);
    const laneMaterial = new LineMaterial({ 
        color: splineColor,
        linewidth: 0.0045
     });
     return new Line2(laneGeometry, laneMaterial);
}