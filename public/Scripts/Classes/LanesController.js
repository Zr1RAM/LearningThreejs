import * as THREE from 'three'
import { Line2 } from 'lines/Line2.js';
import { LineGeometry } from 'lines/LineGeometry.js';
import { LineMaterial } from 'lines/LineMaterial.js';
import MainScene from 'Classes/Scene.js'
import { Vector3 } from 'three';

export default class LanesController {
    constructor(data) {
        this.sceneRef = new MainScene();
        this.egoVehicleRef = this.sceneRef.getSceneObjectByName('egoVehicle');
        //this.tempPos = new THREE.Vector3(0,0,0);
        this.jsonIndex = 1;
        this.intervalValue = 10;
        this.data = data.messages;
        this.initializeLaneSplines();
        this.updateLaneSplines(this.data[0]._lanes);
    }

    update() {
        if(this.jsonIndex < this.data.length) {
            this.updateLaneSplines(this.data[this.jsonIndex]._lanes);
            //console.log(this.jsonIndex);
            this.jsonIndex += 1;

        } else {
            console.log('restarted');
            this.jsonIndex = 0;
        }
    }

    initializeLaneSplines() {
       this.laneFrontSplines = [];
       this.laneRearSplines = [];
       //this.laneCoordinates = [];
       const vector1 = new Vector3(0,0,0);
       const points = [ vector1, vector1, vector1, vector1, vector1 ];
       for (let i = 0 ; i < 5 ; i++) {
            this.laneFrontSplines.push(
                this.makeSplineFromPoints(points, 0xffffff)
            );
            this.laneRearSplines.push(
                this.makeSplineFromPoints(points, 0xffffff)
            );
       }
       this.laneSplineGroup = new THREE.Group();
       this.laneSplineGroup.add(...this.laneFrontSplines);
       this.laneSplineGroup.add(...this.laneRearSplines);
       this.laneSplineGroup.position.set(this.egoVehicleRef.position.x,this.egoVehicleRef.position.y,this.egoVehicleRef.position.z);
       this.laneSplineGroup.update = this.update.bind(this);
       this.sceneRef.addToScene(this.laneSplineGroup);
       
    }

    makeSplineFromPoints(points,splineColor) {
        // if(!this.laneMaterial) {
        //     this.laneMaterial = new LineMaterial({ 
        //         color: splineColor,
        //         linewidth: 0.0045
        //      });
        // }
        const laneMaterial = new LineMaterial({
            color: splineColor,
            linewidth: 0.0045
        });
        const laneSplinePolyPoints = new THREE.CatmullRomCurve3(points, false);
        let lanePoints = laneSplinePolyPoints.getPoints(50);
        lanePoints = lanePoints.reduce((acc,l)=>acc.concat(l.toArray()),[]);
        const laneGeometry = new LineGeometry();
        laneGeometry.setPositions(lanePoints);
        const laneSpline = new Line2( laneGeometry, laneMaterial );
        laneSpline.geometry.attributes.position.needsUpdate = true;
        return laneSpline;
    }

    updateLaneSplines(data)
    {
        for (let i = 0 ; i < data.length ; i++) {
            this.updateLaneSplineGeometry(this.laneFrontSplines[i], 
                this.updateLaneSplinePoints(data[i]._right_marker._front_line_poly)
                );
            this.updateLaneSplineGeometry(this.laneRearSplines[i], 
                this.updateLaneSplinePoints(data[i]._right_marker._rear_line_poly)
                );
        }
        this.laneSplineGroup.position.set(this.egoVehicleRef.position.x, 0.08, this.egoVehicleRef.position.z);
        this.laneSplineGroup.rotation.y = this.egoVehicleRef.rotation.y;
    }
        
    updateLaneSplineGeometry(laneSpline,vector3Points) {
        //console.log(vector3Points.length);
        if(vector3Points.length > 1) {
            const laneSplinePolyPoints = new THREE.CatmullRomCurve3(vector3Points, false);
            let lanePoints = laneSplinePolyPoints.getPoints(50);
            lanePoints = lanePoints.reduce((acc,l)=>acc.concat(l.toArray()),[]);
            laneSpline.geometry.setPositions(lanePoints);
            // vector3Points = vector3Points.reduce((acc,l)=>acc.concat(l.toArray()),[]);
            // laneSpline.geometry.setPositions(vector3Points);
        }
    }

    updateLaneSplinePoints(data) {
        const intervals = this.calculateInterval(data._range_start_m, data._range_end_m);
        let laneCoordinates = [];
        if (intervals > 0) {
            let y = this.calculateCubicSplineYCoordinate(data, data._range_start_m);
            laneCoordinates.push(
                this.makeCoordinateForLaneSpline(y, 0, data._range_start_m)
            );
            for (let i = 0; i < intervals - 2; i++) {
                const yCoordinate = this.calculateCubicSplineYCoordinate(data, data._range_start_m + (this.intervalValue * i));
                laneCoordinates.push(
                    this.makeCoordinateForLaneSpline(yCoordinate, 0, data._range_start_m + (this.intervalValue * i))
                );
            }
            y = this.calculateCubicSplineYCoordinate(data, data._range_end_m);
            laneCoordinates.push(
                this.makeCoordinateForLaneSpline(y, 0, data._range_end_m)
            );
            
        }
        return laneCoordinates;
    }

    calculateInterval(a,b) {
        return Math.abs((Math.floor(a) - Math.floor(b)) / this.intervalValue) ;
    }

    calculateCubicSplineYCoordinate(data, x) {
        const { _c0, _c1, _c2, _c3 } = data;
        const y = _c0 + (_c1 * x) + (_c2 * Math.pow(x, 2)) + (_c3 * Math.pow(x, 3));
        return y;
    }

    makeCoordinateForLaneSpline(x,y,z) {
        return new THREE.Vector3( x,  y,  z);
    } 

}
// //temp variable
// const tempPos = new THREE.Vector3(0,0,0);
// export function GetLaneFromParameters(data) {
//     data = data.messages[0]._lanes;
//     let LaneSpline = [];
//     for (let i = 0 ; i < data.length ; i++) {
//         // front_Line_poly
//         LaneSpline.push(
//             createLanePolyLine(data[i]._right_marker._front_line_poly, 0xffffff)
//         );
//         //createLanePolyLine(data[i]._left_marker._front_line_poly, 0x00ff00);
//         // rear_line_poly
//         LaneSpline.push(
//             createLanePolyLine(data[i]._right_marker._rear_line_poly, 0xffffff)
//         );
//         //createLanePolyLine(data[i]._left_marker._front_line_poly, 0x00ff00);
//     }
//     return LaneSpline;
// }

// const intervalValue = 10; //value at which intervals to take between range_start_m and range_end_m

// function createLanePolyLine(data, splineColor) {
//     let Intervals =  CalculateInterval(data._range_start_m,data._range_end_m);
//     let laneSplinePoly;
//     if (Intervals > 0) {
//         let LaneCoordinates = [];
//         let y = CalculateCubicSplineYCoordinate(data, tempPos.z + data._range_start_m);
//         LaneCoordinates.push(
//             makeCoordinateForLaneSpline(y, 0, tempPos.z + data._range_start_m)
//         );
//         for (let i = 1; i < Intervals - 2; i++) {
//             const yCoordinate = CalculateCubicSplineYCoordinate(data, tempPos.z + data._range_start_m + (intervalValue * i));
//             LaneCoordinates.push(
//                 makeCoordinateForLaneSpline(yCoordinate, 0, tempPos.z + data._range_start_m + (intervalValue * i))
//             );
//         }
//         y = CalculateCubicSplineYCoordinate(data, tempPos.z + data._range_end_m);
//         LaneCoordinates.push(
//             makeCoordinateForLaneSpline(y, 0, tempPos.z + data._range_end_m)
//         );


//         // Create the spline to be added to the scene
//         laneSplinePoly = makeSplineFromPoints(LaneCoordinates,splineColor);
//     }
//     return laneSplinePoly;

// }

// function CalculateInterval(a,b) {
//     return Math.abs((Math.floor(a) - Math.floor(b)) / intervalValue) ;
// }

// function CalculateCubicSplineYCoordinate(data, x)
// {
//     const { _c0, _c1, _c2, _c3 } = data;
//     const y = _c0 + (_c1 * x) + (_c2 * Math.pow(x,2)) + (_c3 * Math.pow(x,3));
//     return y;
// }

// function makeCoordinateForLaneSpline(x,y,z) {
//     return new THREE.Vector3( x,  y,  z);
// } 

// function makeSplineFromPoints(points,splineColor) {
//     const frontLinePolyPoints = new THREE.CatmullRomCurve3(points, false);
//     let lanePoints = frontLinePolyPoints.getPoints(50);
//     lanePoints = lanePoints.reduce((acc,l)=>acc.concat(l.toArray()),[]);
//     const laneGeometry = new LineGeometry();
//     laneGeometry.setPositions(lanePoints);
//     const laneMaterial = new LineMaterial({ 
//         color: splineColor,
//         linewidth: 0.0045
//      });
//      return new Line2(laneGeometry, laneMaterial);
// }

// function updateSplinesFromPoints() {

// }