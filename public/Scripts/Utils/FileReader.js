// import { readFile } from 'node:fs';

// export function readFileFromPath(path, callback) {
//     readFile(path, function(err,data) {
//         if(!err) {
//             console.log(data);
//             callback(data);
//         } else {
//             console.log(err);
//         }
//     });
// }

import * as THREE from 'three'
import { GLTFLoader } from 'Loaders/GLTFLoader.js'


let loader;
function JSONLoader(path, callback,loadNextCallback) {
    if(!loader) {
        loader = new THREE.FileLoader();
    }
    return new Promise((resolve,reject)=> loader.load(
        // resource URL
        path,
    
        // onLoad callback
        function ( data ) {
            if(callback) {
                callback(JSON.parse(data));
            }
            if(loadNextCallback) {
                loadNextCallback();
            }
            resolve(data);
        },
    
        // onProgress callback
        function ( xhr ) {
            console.log( path + ' ' + (xhr.loaded / xhr.total * 100) + '% loaded' );
        },
    
        // onError callback
        function ( err ) {
            console.error( 'An error happened' );
            reject('Error');
        }
    ));
}

export function sequentialJSONLoader(paths, callback, i = 0) {
    if(i < paths.length) {
        JSONLoader(paths[i],callback,sequentialJSONLoader.bind(null,paths,callback,i+1));
   }
}

export function largeJSONLoader(paths, callback) {
    let jsonLoaderPromises = [];
    for (let i = 0 ; i < paths.length ; i++) {
        jsonLoaderPromises.push(
            JSONLoader(paths[i])
        );
    }
    Promise.all(jsonLoaderPromises).then(data => {
        for(let i = 0 ; i < data.length ; i++) {
            console.log(JSON.parse(data[i]));
            callback(JSON.parse(data[i]));
        }
    }).catch(e => {
        console.log('promise reject');
        console.log(e);
    });
}

//Alternate sequentialJSONLoader
// let fileIndex = 0;
// export function sequentialJSONLoader(paths, callback) {
//     if(!loader) {
//         loader = new THREE.FileLoader();
//     }
//     console.log(paths[fileIndex]);
//     loader.load(
//         // resource URL
//         paths[fileIndex],
    
//         // onLoad callback
//         function ( data ) {
//             callback(JSON.parse(data));
//             fileIndex++;
//             if(fileIndex < paths.length) {
//                 sequentialJSONLoader(paths,callback);
//             } else {
//                 fileIndex = 0;
//             }
//         },
    
//         // onProgress callback
//         function ( xhr ) {
//             console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
//         },
    
//         // onError callback
//         function ( err ) {
//             console.error( 'An error happened' );
//         }
//     );
// }
//Alternate sequentialJSONLoader
let gltfLoader;
export function loadModelFromPath(path) {
    if(!gltfLoader) {
        gltfLoader = new GLTFLoader();
    }
    return new Promise((resolve,reject)=>gltfLoader.load(path , function (gltf) {
        // callback(gltf);
        resolve(gltf);
    }, function (xhr) {

        console.log( ( xhr.loaded / xhr.total * 100 ) + '% of mesh loaded' );

    }, function (error) {
        reject('Error');
        console.error( error );

    } ));
}
