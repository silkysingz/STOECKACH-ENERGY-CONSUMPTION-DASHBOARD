     Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxYjBlYmYyNC1kNWRhLTRiNTUtOGNlYi02NGY1YWVhNjI2MjIiLCJpZCI6MTEwNzEsImlhdCI6MTYxOTcwNjI0M30.tlpaagcH93SjaHIn7eEVpanGSiH2yDylbGJZr2gsXnY';

    //////////////////////////////////////////////////////////////////////////
    // Creating the Viewer
    //////////////////////////////////////////////////////////////////////////

     var viewer = new Cesium.Viewer('cesiumContainer', {   //define viewer , define options in cesium viewer
         scene3DOnly: true,
         selectionIndicator: false,
		 timeline: false,
		 animation: false,
		 shadow: false,
		 // // Set default basemap
		 imageryProvider : Cesium.ArcGisMapServerImageryProvider({
		 url : 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
		 }),
		 baseLayerPicker: true		 
     }); 
   
    //////////////////////////////////////////////////////////////////////////
    // Load 3D Tileset
    //////////////////////////////////////////////////////////////////////////

	var tileset = viewer.scene.primitives.add(
	new Cesium.Cesium3DTileset({
	 //url: Cesium.IonResource.fromAssetId(481524)
	url: './Source/Data/3DTiles/tileset.json'	
	})
	);
	viewer.zoomTo(tileset);

    //////////////////////////////////////////////////////////////////////////
    // Style 3D Tileset
    //////////////////////////////////////////////////////////////////////////

    var defaultstyle = new Cesium.Cesium3DTileStyle({
         color : "color('WHITE')",
		  show: true
     });
	 
	var energydemandstyle = new Cesium.Cesium3DTileStyle({
         color : {
            conditions : [
					//change!!
					['Number(${Specific_s})>= 0' && 'Number(${Specific_s})< 25', 'color("#61B949")'],
					['Number(${Specific_s})>= 26' && 'Number(${Specific_s})< 50', 'color("#A4C711")'],
					['Number(${Specific_s})>= 51' && 'Number(${Specific_s})< 75', 'color("#B2D531")'],
					['Number(${Specific_s})>= 76' && 'Number(${Specific_s})< 100', 'color("#D1E023")'],
					['Number(${Specific_s})>= 101' && 'Number(${Specific_s})< 125', 'color("#F6EC00")'],
					['Number(${Specific_s})>= 126' && 'Number(${Specific_s})< 150', 'color("#FECE02")'],
					['Number(${Specific_s})>= 151' && 'Number(${Specific_s})< 200', 'color("#F9A717")'],
					['Number(${Specific_s})>= 201' && 'Number(${Specific_s})< 250', 'color("#F56D1F")'],
					['true', 'color("#FF0000")']
					
             ]
         },
		 show: true
     });
	 
	var colorstyle1 = document.getElementById('3dbuildings');
	var colorstyle2 = document.getElementById('heatdemand');
	 
    function set3DColorStyle() {
		if (colorstyle1.checked) {tileset.style = defaultstyle;
			document.getElementById("legend").style.display = "none";
		      } 
		else if (colorstyle2.checked) {tileset.style = energydemandstyle;
			document.getElementById("legend").style.display = "block";
				}
        }
	 
	 colorstyle1.addEventListener('change', set3DColorStyle);
     colorstyle2.addEventListener('change', set3DColorStyle);	
	
	//////////////////////////////////////////////////////////////////////////
    // Selecting geometries in 3D Tileset
    //////////////////////////////////////////////////////////////////////////
	
	//Selecting a Building
	var Pickers_3DTile_Activated = true;
	// Information about the currently highlighted feature
	function active3DTilePicker() {
		var highlighted = {
			feature: undefined,
			originalColor: new Cesium.Color()
		};
		// Information about the currently selected feature
		var selected = {
			feature: undefined,
			originalColor: new Cesium.Color()
		};

		// An entity object which will hold info about the currently selected feature for infobox display
		var selectedEntity = new Cesium.Entity();

		// Get default left click handler for when a feature is not picked on left click
		var clickHandler = viewer.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
		
		// Color a feature GREY on hover.
		viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(movement) {
			if (Pickers_3DTile_Activated) {
				// If a feature was previously highlighted, undo the highlight
				if (Cesium.defined(highlighted.feature)) {
					highlighted.feature.color = highlighted.originalColor;
					highlighted.feature = undefined;
				}
				// Pick a new feature
				var picked3DtileFeature = viewer.scene.pick(movement.endPosition);
				if (!Cesium.defined(picked3DtileFeature)) {
					
					return;
				}					
				// Highlight the feature if it's not already selected.
				if (picked3DtileFeature !== selected.feature) {
					highlighted.feature = picked3DtileFeature;
					Cesium.Color.clone(picked3DtileFeature.color, highlighted.originalColor);
					picked3DtileFeature.color = Cesium.Color.GREY;
				}
			}
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

		// Color a feature AQUA on selection and show info in the InfoBox.
		viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
			if (Pickers_3DTile_Activated) {
				// If a feature was previously selected, undo the highlight
				if (Cesium.defined(selected.feature)) {
					selected.feature.color = selected.originalColor;
					selected.feature = undefined;
					var options = null;
				}
				// Pick a new feature
				var picked3DtileFeature = viewer.scene.pick(movement.position);
				if (!Cesium.defined(picked3DtileFeature)) {
					clickHandler(movement);
					return;
				}
				// Select the feature if it's not already selected
				if (selected.feature === picked3DtileFeature) {
					return;
				}
				selected.feature = picked3DtileFeature;
				// Save the selected feature's original color
				if (picked3DtileFeature === highlighted.feature) {
					Cesium.Color.clone(highlighted.originalColor, selected.originalColor);
					highlighted.feature = undefined;
				} else {
					Cesium.Color.clone(picked3DtileFeature.color, selected.originalColor);
				}
				// Highlight newly selected feature
				picked3DtileFeature.color = Cesium.Color.AQUA;
				// Set feature infobox description
				var featureName = "Building Attributes";
				selectedEntity.name = featureName;
				selectedEntity.description = 'Loading <div class="cesium-infoBox-loading"></div>';
				viewer.selectedEntity = selectedEntity;
				selectedEntity.description =
					'<table class="cesium-infoBox-defaultTable"><tbody>' +
					'<tr><th>gml ID</th><td>' + picked3DtileFeature.getProperty('gml_id') + '</td></tr>' +
					'<tr><th>gml parent ID</th><td>' + picked3DtileFeature.getProperty('gml_parent_id') + '</td></tr>' +  //additional attribute from tileset.json to be displayed when the building is selected
					'<tr><th>Sp. Heating Demand</th><td>' + picked3DtileFeature.getProperty('Specific_s') + ' ' + 'kWh/m²·a' + '</td></tr>' +
					'</tbody></table>';   
		}
		}, 
		
		Cesium.ScreenSpaceEventType.LEFT_CLICK);
	}
	active3DTilePicker();
		
	 // Chart.js code
	 
	 // Fetch GeoJSON data - please install CORS plugin otherwise this will not work --Cross origin resource shell- consume web service/api hosted on a different server
	   fetch('https://ugl.hft-stuttgart.de/leaflet-stoeckach-heatdemand/building_data.json')  //fetch attribute from a json file on another server
      .then(response => response.json())
      .then(data => {
        // Define array, extract and store the "PrimaryUsa" and "BuildingTy" values
     	// Array is a special variable which can store valies. It is a common practice to store array using "const"	keyword but donot understant it as a constant value. 
		// Here const means array buildingYoc cannot be re-declared elsewhere
		const buildingYoc = data.features.map(function(feature) {
		return feature.properties.PrimaryUsa;   //declare a variable 
		});

		const buildingType = data.features.map(function(feature) {
		return feature.properties.BuildingTy;
		});

		// Count the occurrences of each primary usage and store it in array yocCounts
		const yocCounts = {};
		buildingYoc.forEach(function(PrimaryUsa) {
		if (yocCounts[PrimaryUsa]) {
			yocCounts[PrimaryUsa]++;
			} else {
			yocCounts[PrimaryUsa] = 1;
			}
		});
		
		// Count the occurrences of each building type and store it in array bldgtypeCounts		
		const bldgtypeCounts = {};
		buildingType.forEach(function(BuildingTy) {
		if (bldgtypeCounts[BuildingTy]) {
			bldgtypeCounts[BuildingTy]++;
			} else {
			bldgtypeCounts[BuildingTy] = 1;
			}
		});

		// Prepare the chart for year of construction and building type	data
		const yocLabels = Object.keys(yocCounts);
		const yocData = Object.values(yocCounts);
		
		const bldgTypeLabels = Object.keys(bldgtypeCounts);
		const bldgTypeData = Object.values(bldgtypeCounts);

		// Create the building year of construction distribution chart using Chart.js
		var ctx1 = document.getElementById('myChart1').getContext('2d');
		var yocChart = new Chart(ctx1, {
			type: 'bar',
			data: {
			labels: yocLabels,
			datasets: [{
			label: 'No. of buildings',
			data: yocData,
			backgroundColor: 'rgba(255, 0, 0, 1)',
			borderColor: 'rgba(50, 205, 50, 1)',
			borderWidth: 1
			}]
			},
			options: {
				responsive: true,
				plugins: {
				legend: {
				position: 'bottom',
				},
				title: {
				display: true,
				text: 'Heating Demand According to the Primary Usage'
				}
				},
				scales: {
				y: {
				beginAtZero: true,
				stepSize: 15
				}
				}
			}
		});


		// Create the building type distribution chart using Chart.js
		var ctx2 = document.getElementById('myChart2').getContext('2d');
		var bldgTypeChart = new Chart(ctx2, {
			type: 'pie',
            data: {
            labels: bldgTypeLabels,
            datasets: [{
			label: 'No. of buildings',
            data: bldgTypeData,
            backgroundColor: [
                                'rgba(245, 0, 0)',
                                'rgba(0, 245, 122)',
                                'rgba(245, 184, 0)',
                                'rgba(245, 122, 0)',
                                'rgba(191, 255, 0)',
                            ],
                        }]
                },
            options: {
				responsive: true,
				plugins: {
				legend: {
				position: 'bottom',
				},
				title: {
					display: true,
					text: ' Distribution of Buildings By Type'
					}
					},
				}
                });
            })