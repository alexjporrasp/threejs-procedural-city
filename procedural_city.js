var scene, camera, renderer;
var ambientLight, light;

var keyboard = {};
var player = {speed:0.2};
var USE_WIREFRAME = false;

var loadingScreen = {
	scene: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera(90, 1280/720, 0.1, 100),
	box: new THREE.Mesh(
		new THREE.BoxGeometry(0.5,0.5,0.5),
		new THREE.MeshBasicMaterial({ color:0x4444ff })
	)
};

var loadingManager = null;
var RESOURCES_LOADED = false;

// Models index
var models = {
	building_a: {
		obj: "models/city/building_a.obj",
		mtl: "models/city/building_a.mtl",
		mesh: null,
		width: null,
		height: null,
		depth: null
	},
	building_b: {
		obj: "models/city/building_b.obj",
		mtl: "models/city/building_b.mtl",
		mesh: null,
		width: null,
		height: null,
		depth: null
	},
	building_c: {
		obj: "models/city/building_c.obj",
		mtl: "models/city/building_c.mtl",
		mesh: null,
		width: null,
		height: null,
		depth: null
	},
	building_d: {
		obj: "models/city/building_d.obj",
		mtl: "models/city/building_d.mtl",
		mesh: null,
		width: null,
		height: null,
		depth: null
	},
	block_base: {
		obj: "models/city/block_base.obj",
		mtl: "models/city/block_base.mtl",
		mesh: null,
		width: null,
		height: null,
		depth: null
	},
	cars_a: {
		obj: "models/city/cars_a.obj",
		mtl: "models/city/cars_a.mtl",
		mesh: null,
		width: null,
		height: null,
		depth: null
	},
	cars_b: {
		obj: "models/city/cars_b.obj",
		mtl: "models/city/cars_b.mtl",
		mesh: null,
		width: null,
		height: null,
		depth: null
	}
};

var BLOCKS_X = 5;
var BLOCKS_Z = 5;

// Meshes index
var meshes = {};

function init(){
	scene = new THREE.Scene();
	// camera = new THREE.PerspectiveCamera(90, 1280/720, 0.1, 1000);
	
	var width = 1280/8;
	var height = 720/8;
	camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
	
	loadingScreen.box.position.set(0,0,5);
	loadingScreen.camera.lookAt(loadingScreen.box.position);
	loadingScreen.scene.add(loadingScreen.box);
	
	loadingManager = new THREE.LoadingManager();
	loadingManager.onProgress = function(item, loaded, total){
		console.log(item, loaded, total);
	};
	loadingManager.onLoad = function(){
		console.log("loaded all resources");
		RESOURCES_LOADED = true;
		onResourcesLoaded();
	};
	
	
	// Load models
	for( var _key in models ){
		(function(key){
			
			var mtlLoader = new THREE.MTLLoader(loadingManager);
			mtlLoader.load(models[key].mtl, function(materials){
				materials.preload();
				
				var objLoader = new THREE.OBJLoader(loadingManager);
				
				objLoader.setMaterials(materials);
				objLoader.load(models[key].obj, function(mesh){
					
					mesh.traverse(function(node){
						if( node instanceof THREE.Mesh ){
							node.castShadow = true;
							node.receiveShadow = true;
						}
					});
					models[key].mesh = mesh;

					var box = new THREE.Box3().setFromObject(models[key].mesh);
					
					var size = new THREE.Vector3();
					box.getSize(size);
					models[key].width = size.x;
					models[key].height = size.y;
					models[key].depth = size.z;
					
				});
			});
			
		})(_key);
	}
	
	
	camera.position.set(30, 40, 30);
	camera.lookAt(new THREE.Vector3(0,0,0));

	// Lights

	ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
	scene.add(ambientLight);
	
	// light = new THREE.PointLight( 0xaaaaaa, 1, 0, 2 );
	// light.position.set( 0, 50, 0 );
	// light.castShadow = true;
	// light.shadow.camera.near = 0.1;
	// light.shadow.camera.far = camera.far;
	// scene.add(light);

	var light = new THREE.DirectionalLight( 0xffffff, 1);
	light.position.set( 0, 20, 20 ); 		//default; light shining from top
	// light.castShadow = true;            // default false
	// light.shadow.camera.near = 0.1;    // default
	// light.shadow.camera.far = camera.far;     // default
	scene.add( light );
	
	// Renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(1280, 720);

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	
	document.body.appendChild(renderer.domElement);
	
	animate();
}

function GetRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function CreateRandomCityBlock() {

	if( RESOURCES_LOADED == false ){
		requestAnimationFrame(animate);
		
		loadingScreen.box.position.x -= 0.05;
		if( loadingScreen.box.position.x < -10 ) loadingScreen.box.position.x = 10;
		loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x);
		
		renderer.render(loadingScreen.scene, loadingScreen.camera);
		return;
	}

	var buildings  = ["building_a", "building_b", "building_c", "building_d"];
	var cars_layout = ["cars_a", "cars_b"];
	var block_base = models.block_base.mesh.clone();
	var building_a = models[buildings[GetRandomInt(buildings.length)]].mesh.clone();
	var building_b = models[buildings[GetRandomInt(buildings.length)]].mesh.clone();
	var building_c = models[buildings[GetRandomInt(buildings.length)]].mesh.clone();
	var building_d = models[buildings[GetRandomInt(buildings.length)]].mesh.clone();
	var cars = models[cars_layout[GetRandomInt(cars_layout.length)]].mesh.clone();

	block_base.position.set(0,0,0);

	building_a.position.set(-11, 1, -12);
	building_a.rotation.set(0, GetRandomInt(4) * Math.PI / 2, 0);

	building_b.position.set(-11, 1, 12);
	building_b.rotation.set(0, GetRandomInt(4) * Math.PI / 2, 0);

	building_c.position.set(14, 1, -12);
	building_c.rotation.set(0, GetRandomInt(4) * Math.PI / 2, 0);

	building_d.position.set(14, 1, 12);
	building_d.rotation.set(0, GetRandomInt(4) * Math.PI / 2, 0);

	cars.position.set(0, 1, 0);

	var group = new THREE.Group();
	group.add(block_base);
	group.add(building_a);
	group.add(building_b);
	group.add(building_c);
	group.add(building_d);
	group.add(cars);

	return group;
}

// Runs when all resources are loaded
function onResourcesLoaded(){
	
	var offset_x = -(3/2)*models.block_base.width;
	var offset_z = -(3/2)*models.block_base.depth;

	for (var i = 0; i < BLOCKS_X; i++) {
		for (var j = 0; j < BLOCKS_Z; j++) {
			var mesh_id = "city_block_" + i + "_" + j;
			meshes[mesh_id] = CreateRandomCityBlock();
			meshes[mesh_id].position.set(offset_x + models.block_base.width*i, -1, offset_z + models.block_base.depth*j);
			scene.add(meshes[mesh_id]);
			// console.log(mesh_id);
		}
	}

	// var random_block = CreateRandomCityBlock();
	// random_block.position.set(0, 11, 0);
	// scene.add(random_block);
}

function animate(){

	// Play the loading screen until resources are loaded.
	if( RESOURCES_LOADED == false ){
		requestAnimationFrame(animate);
		
		loadingScreen.box.position.x -= 0.05;
		if( loadingScreen.box.position.x < -10 ) loadingScreen.box.position.x = 10;
		loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x);
		
		renderer.render(loadingScreen.scene, loadingScreen.camera);
		return;
	}

	requestAnimationFrame(animate);
	
	// mesh.rotation.x += 0.01;
	// mesh.rotation.y += 0.02;

	for (var _key in meshes) {

		// Check whether a city block has left the screen
		if (meshes[_key].position.x < -141.0) {
			meshes[_key].position.x += (BLOCKS_X) * models.block_base.width;
		} else if (meshes[_key].position.x > 150.0) {
			meshes[_key].position.x -= (BLOCKS_X) * models.block_base.width;
		}

		if (meshes[_key].position.z > 146.0) {
			meshes[_key].position.z -= (BLOCKS_Z) * models.block_base.depth;
		} else if (meshes[_key].position.z < -146.0) {
			meshes[_key].position.z += (BLOCKS_Z) * models.block_base.depth;
		}

		if (keyboard[87]) { // W key
			meshes[_key].position.x += 0.5 * player.speed;
		} else if (keyboard[83]) { // S key
			meshes[_key].position.x -= 0.5 * player.speed;
		} else if (keyboard[65]) { // A key
			meshes[_key].position.z -= 0.5 * player.speed;
		} else if (keyboard[68]) { // D key
			meshes[_key].position.z += 0.5 * player.speed;
		}
	}
	
	renderer.render(scene, camera);
}

function keyDown(event){
	keyboard[event.keyCode] = true;
}

function keyUp(event){
	keyboard[event.keyCode] = false;
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

window.onload = init;

