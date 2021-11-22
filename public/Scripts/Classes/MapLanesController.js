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
        if(!this.laneSplineGroup.children) {
            this.laneSplineGroup.add(...this.mapLanSplines);
        }
        console.log(this.laneSplineGroup.children);
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
        return laneSpline;
    }

    updateLaneSplines(data) {
        console.log(data)
        for(let i = 0 ; i < data.length ; i++) {
            if(data.length > this.mapLanSplines.length ) {
                for(let j = 0 ; j < (data.length - this.mapLanSplines.length) ; j++) {
                    this.createNewMapLaneSpline();
                }
            }


        }
        console.log(this.laneSplineGroup);
        this.laneSplineGroup.position.set(this.egoVehicleRef.position.x, this.egoVehicleRef.position.y, this.egoVehicleRef.position.z);
        this.laneSplineGroup.rotation.y = this.egoVehicleRef.rotation.y;
    }

    createPointsFromInterval(vectorA,VectorB) {
        const distance = vectorA.distanceTo(VectorB);
        const intervals = distance/this.intervalValue;
        let points = [];
        if(intervals > 0) {
            points.push(vectorA);
            for(let i = 0 ; i < intervals -2 ; i++) {
                points.push(
                    new Vector3(vectorA.x + (this.intervalValue * i),0, vectorA.z + (this.intervalValue * i))
                );
            }
            points.push(VectorB);
        }
        return points;
    }
}