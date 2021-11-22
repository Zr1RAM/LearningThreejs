import * as THREE from 'three'
import { Line2 } from 'lines/Line2.js';
import { LineGeometry } from 'lines/LineGeometry.js';
import { LineMaterial } from 'lines/LineMaterial.js';
import MainScene from 'Classes/Scene.js'
import { Vector3 } from 'three';

export default class MapLanesController {
    constructor(lanesGroupName) {
        this.sceneRef = new MainScene();
        this.egoVehicleRef = this.sceneRef.getSceneObjectByName('egoVehicle');
        this.intervalValue = 5;
        this.maxLaneCount = 0;
        this.initializeLaneSplines(lanesGroupName);
    }

    update() {
        if(this.laneSplineGroup.data) {
                this.updateLaneSplines(this.laneSplineGroup.data);
        }
    }

    initializeLaneSplines(lanesGroupName) {
        //this.mapLanSplines = [];
        this.laneSplineGroup = new THREE.Group();
        //this.laneSplineGroup.add(...this.mapLanSplines);
        this.laneSplineGroup.position.set(this.egoVehicleRef.position.x, this.egoVehicleRef.position.y, this.egoVehicleRef.position.z);
        this.laneSplineGroup.name = lanesGroupName;
        this.laneSplineGroup.update = this.update.bind(this);
        this.laneSplineGroup.bufferKey = 'mapLanes';
        this.laneSplineGroup.data = {};
        this.sceneRef.addToScene(this.laneSplineGroup);
    }

    createNewMapLaneSpline() {
        const vector1 = new Vector3(0,0,0);
        const points = [ vector1, vector1, vector1, vector1, vector1 ];
        if(!this.mapLanSplines) {
            this.mapLanSplines = [];
        }
        this.mapLanSplines.push(
            this.makeSplineFromPoints(points, 0x00ff00)
        );
        if(this.laneSplineGroup.children.length == 0) {
            this.laneSplineGroup.add(...this.mapLanSplines);
            console.log('child added');
        }
        console.log(this.laneSplineGroup.children.length);
    }
    makeSplineFromPoints(points,splineColor) {
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
        this.sceneRef.addToScene(laneSpline);
        return laneSpline;
    }

    updateLaneSplines(data) {
        //console.log(data);
        const lane_ids = Object.keys(data);
        //console.log(lane_ids.length);
        // const point_id = Object.keys(data);
        // console.log(point_id.length);
        if(lane_ids.length > this.maxLaneCount) {
            for(let i = 0 ; i <  (lane_ids.length - this.maxLaneCount) ; i++) {
                this.createNewMapLaneSpline();
            }
            this.maxLaneCount = lane_ids.length;
            console.log('max count increased to ' + this.maxLaneCount);
        }
        for(let i = 0 ; i < this.maxLaneCount ; i++) {
            if(i < lane_ids.length) {
                if(data[lane_ids[i]].length > 1) {
                    this.mapLanSplines[i].visible = true;
                    //console.log(data[lane_ids[i]].length);
                    //console.log(data[lane_ids[i]]);
                    const points = [];
                    for(let j = 0 ; j < data[lane_ids[i]].length ; j++) {
                        //console.log(data[lane_ids[i]][j].x);
                        points.push(new Vector3(data[lane_ids[i]][j].x, 0, data[lane_ids[i]][j].y));
                    }
                    this.updateLaneSplineGeometry(this.mapLanSplines[i], points);
                }
            } else {
                this.mapLanSplines[i].visible = false;
            }
        }
        //console.log(this.laneSplineGroup);
        this.laneSplineGroup.position.set(this.egoVehicleRef.position.x, this.egoVehicleRef.position.y, this.egoVehicleRef.position.z);
        this.laneSplineGroup.rotation.y = this.egoVehicleRef.rotation.y;
        //this.laneSplineGroup.rotation.y = 0;
        console.log('map lane render complete in current frame');
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

    // createPointsFromInterval(vectorA,VectorB) {
    //     const distance = vectorA.distanceTo(VectorB);
    //     const intervals = distance/this.intervalValue;
    //     let points = [];
    //     if(intervals > 0) {
    //         points.push(vectorA);
    //         for(let i = 0 ; i < intervals -2 ; i++) {
    //             points.push(
    //                 new Vector3(vectorA.x + (this.intervalValue * i),0, vectorA.z + (this.intervalValue * i))
    //             );
    //         }
    //         points.push(VectorB);
    //     }
    //     return points;
    // }
}