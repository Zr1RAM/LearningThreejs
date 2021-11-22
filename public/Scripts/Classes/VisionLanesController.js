import LanesController from 'Classes/LanesController.js'

export default class VisionLanesController extends LanesController {
    constructor(lanesGroupName) {
        super(lanesGroupName);
        this.intervalValue = 10;
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