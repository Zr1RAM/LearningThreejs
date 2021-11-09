import * as THREE from 'three';
export function fordEscapeMaterialSetup(model) {
    // const vehicleMaterial = new THREE.MeshBasicMaterial({
    //     color: 0x383838,
    //     wireframe: true,
    // });
    // model.traverse((child) => {
    //     //console.log(child.name);
    //     if(child.name.includes('Tyre')) {
    //         console.log(child.name);
    //     }
    //         if (child.isMesh) {
                
    //         }
    //     });
}
export function getEscapeTyres(model) {
    const Tyres = [];
    model.traverse((child) => {
        if(child.name.includes('RightTyre') || child.name.includes('LeftTyre')) {
            Tyres.push(child);
        }
    });
    return Tyres;
}