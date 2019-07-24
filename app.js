//Creating variables and url to extract json files from the USGS data information
//for earthquakes, and from gitHub for tectonic Plates boundary information.
var usgsUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=2014-01-02";

var gitTecPlate = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

//Definiting the marker (pointing the earthquake zones, they will be by color due to the earthquake intensity).
//where grade will be classify the magnitud in the Richter scale.
function miniMarker(grades) {
    return grades * 3;
};

//Activating a layer where the USGS earthquake data will be displayed.
var sysmicActivity = new L.LayerGroup();

//Getting the Json file data, from the U.S. Geological Survey.
d3.json(usgsUrl, function (data) {
    L.geoJSON(data.features, {
        pointToLayer: function (dataPoint, latlng) {
            return L.circleMarker(latlng, { radius: miniMarker(dataPoint.properties.mag) });
        },
        //Styling the color of the circles due to the intensity of the earthquake intensity.
        style: function (dataFeature) {
            return {
                fillColor: colorScale(dataFeature.properties.mag),
                fillOpacity: 0.5,
                weight: 0.5,
                color: 'black'
            }
        },

        //Adding the sign when "click on" the earthquake point: date, time and place of the earthquake.
        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                "<h3 style='text-align:center;'>" + new Date(feature.properties.time) +
                "</h3> <hr> <h4 style='text-align:center;'>" + feature.properties.title + "</h4>");
        }
    }).addTo(sysmicActivity);
    createMap(sysmicActivity);
});

//New layer to display the tectonic plates boundaries.
var tectonicPlates = new L.LayerGroup();

d3.json(gitTecPlate, function (data) {
    L.geoJSON(data.features, {
        style: function (dataFeature) {
            return {
                weight: 1,
                color: 'brown'
            }
        },
    }).addTo(tectonicPlates);
})

//function to define the color classification per magnitude based on the Richter Magnitude Scale.
function colorScale(grades) {
    return grades > 8 ? '#57040e' :
        grades > 7 ? '#780714' :
        grades > 6 ? '#800026' :
        grades > 5  ? '#E31A1C' :
        grades > 4  ? '#FC4E2A' :
        grades > 3   ? '#FD8D3C' :
        grades > 2   ? '#FEB24C' :
        grades > 1   ? '#FED976' :
                      '#FFEDA0';
}

//Exporting Map layers from the MapBox site:
function createMap() {

    var streetMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    });

    var highContrastMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.high-contrast',
        accessToken: API_KEY
    });

    var darkMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.dark',
        accessToken: API_KEY
    });

    var satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.satellite',
        accessToken: API_KEY
    });

    //Layers to hold the MapBox maps under the data to be display.
    var baseMaps = {
        "Street Map": streetMap,
        "High Contrast": highContrastMap,
        "Dark": darkMap,
        "Satellite": satellite
    };

    //Layers to display the required information.
    var overLayers = {
        "Sysmic Activity": sysmicActivity,
        "Tectonic Plates": tectonicPlates,
    };

  //  Base Map attach to the div in the HTML, with center of visualization, zoom to be displaying the map.
  //Also, the layers for the map area.
    var myMap = L.map("map", {
        center: [27, -40],
        zoom: 2.2,
        layers: [streetMap, sysmicActivity, tectonicPlates]
    });

//Box to control the layer changes by click on the Map
L.control.layers(baseMaps, overLayers).addTo(myMap);
    
//Legend describing the Richter scale and color intensity.
    var info = L.control({ position: 'bottomleft' });

//Information inside the legend located on the bottom left of the Map    
    info.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info info'),
            grades = [0, 1, 2, 3, 4, 5, 6, 7, 8],
            labels = [];

        div.innerHTML += "<h4 style='margin:5px'>Earthquake Magnitude Scale<br>Richter Scale</h4>"

        for (var i = 0; i < grades.length; i++) {
            div.innerHTML += '<i style="background:' + colorScale(grades[i] + 1) + 
                '"></i> ' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] +
                '<br>' : '+');
        }

        return div;
    };
    info.addTo(myMap);
};
