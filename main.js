/* Vienna Sightseeing Beispiel */

// Stephansdom Objekt
let stephansdom = {
    lat: 48.208493,
    lng: 16.373118,
    title: "Stephansdom"
};

// Karte initialisieren
let map = L.map("map").setView([
    stephansdom.lat, stephansdom.lng
], 15);

// Leaflet Hash
new L.Hash(map);

// Leaflet MiniMap
var miniMap = new L.Control.MiniMap(
    L.tileLayer.provider("BasemapAT.basemap"), {
        toggleDisplay: true,
        minimized: true
    }
).addTo(map);

// thematische Layer
let themaLayer = {
    stops: L.featureGroup().addTo(map),
    lines: L.featureGroup().addTo(map),
    zones: L.featureGroup().addTo(map),
    sites: L.featureGroup().addTo(map),
    hotels: L.featureGroup().addTo(map)
}

// Hintergrundlayer
let layerControl = L.control.layers({
    "BasemapAT Grau": L.tileLayer.provider("BasemapAT.grau").addTo(map),
    "BasemapAT Standard": L.tileLayer.provider("BasemapAT.basemap"),
    "BasemapAT High-DPI": L.tileLayer.provider("BasemapAT.highdpi"),
    "BasemapAT Gelände": L.tileLayer.provider("BasemapAT.terrain"),
    "BasemapAT Oberfläche": L.tileLayer.provider("BasemapAT.surface"),
    "BasemapAT Orthofoto": L.tileLayer.provider("BasemapAT.orthofoto"),
    "BasemapAT Beschriftung": L.tileLayer.provider("BasemapAT.overlay")
}, {
    "Vienna Sightseeing Haltestellen": themaLayer.stops,
    "Vienna Sightseeing Linien": themaLayer.lines,
    "Fußgängerzonen": themaLayer.zones,
    "Sehenswürdigkeiten": themaLayer.sites,
    "Hotels": themaLayer.hotels
}).addTo(map);

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

// Vienna Sightseeing Haltestelle
async function showStops(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    L.geoJSON(jsondata, {
        pointToLayer: function(feature, latlng) {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: `icons/bus_${feature.properties.LINE_ID}.png`,
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37],
                })
            });
        },
    
        onEachFeature: function (feature, layer) {
            let prop = feature.properties;
            layer.bindPopup(`
            <line><i class="fa-solid fa-bus"></i> ${prop.LINE_NAME}</line> </br></br>
            <stop>${prop.STAT_ID} ${prop.STAT_NAME}</stop>
            `);
            //console.log(prop.NAME);
        }
    }).addTo(themaLayer.stops);
    //console.log(response, jsondata)
}
showStops("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKHTSVSLOGD&srsName=EPSG:4326&outputFormat=json");

// Vienna Sightseeing Linien
async function showLines(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    let lineNames = {};
    let lineColors = { //http://clrs.cc/
        "1": "#FF4136", //Red Line
        "2": "#FFDC00", //Yellow Line
        "3": "#0074D9", //Blue Line
        "4": "#2ECC40", //Green Line
        "5": "#AAAAAA", //Grey Line
        "6": "#FF851b", //Orange Line 
    }

    L.geoJSON(jsondata, {
        style: function (feature) {
            return {
                color: lineColors[feature.properties.LINE_ID],
                weight: 3,
                dashArray: [10, 4],

            };
        },

        onEachFeature: function (feature, layer) {
            let prop = feature.properties;
            layer.bindPopup(`
            <line><i class="fa-solid fa-bus"></i> ${prop.LINE_NAME}</line> </br></br>
            <start><i class="fa-regular fa-circle-stop"></i> ${prop.FROM_NAME}</start></br>
            <i class="fa-sharp fa-solid fa-arrow-down"></i></br>
            <end><i class="fa-regular fa-circle-stop"></i> ${prop.TO_NAME}</end>
            `);
            lineNames[prop.LINE_ID] = prop.LINE_NAME;
            //console.log(lineNames)
        }
    }).addTo(themaLayer.lines);
    //console.log(response);
}
showLines("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKLINIEVSLOGD&srsName=EPSG:4326&outputFormat=json");

// Vienna Fußgängerzone
async function showZones(url) {
    let response = await fetch(url);
    let jsondata = await response.json();

    L.geoJSON(jsondata, {
        
        style: function (feature) {
            return {
                color: "#F012BE",
                opacity:0.4,
                fillOpacity:0.1,
            };
        },

        onEachFeature: function (feature, layer) {
            let prop = feature.properties;
            layer.bindPopup(`
            <ort>Fußgängerzone ${prop.ADRESSE}</ort></br></br>
            <zeitraum><i class="fa-regular fa-clock"></i> ${prop.ZEITRAUM || "dauerhaft"}</zeitraum></br></br>
            <information><i class="fa-solid fa-circle-info"></i> ${prop.AUSN_TEXT || "keine Ausnahme"}</information>

            `);
            //console.log(prop.NAME);
        }
    }).addTo(themaLayer.zones);
    //console.log(response);
}
showZones("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:FUSSGEHERZONEOGD&srsName=EPSG:4326&outputFormat=json");


// Vienna Sehenswürdigkeiten
async function showSites(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    L.geoJSON(jsondata, {
        pointToLayer: function(feature, latlng) {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: "icons/photo.png",
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37],
                })
            });
        },
        onEachFeature: function (feature, layer) {
            let prop = feature.properties;
            layer.bindPopup(`
            <img src="${prop.THUMBNAIL}" alt="*">
            <h4><a href="${prop.WEITERE_INF}" target=Wien">${prop.NAME}</h4>
            <adress>${prop.ADRESSE}</address>
            `);
            //console.log(feature.properties, prop.NAME);  
        }
    }).addTo(themaLayer.sites);

    //console.log(response, jsondata)

}
showSites("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:SEHENSWUERDIGOGD&srsName=EPSG:4326&outputFormat=json")

// Vienna Hotels und Unterkünfte
async function showHotels(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    L.geoJSON(jsondata, {
        pointToLayer: function(feature, latlng) {
           
            let prop = feature.properties;
            let hotelIcon = "";
            if (prop.KATEGORIE_TXT === "1*") {
                hotelIcon = "icons/hotel_1star.png";
            } else if (prop.KATEGORIE_TXT === "2*") {
                hotelIcon = "icons/hotel_2stars.png";
            } else if (prop.KATEGORIE_TXT === "3*") {
                hotelIcon = "icons/hotel_3stars.png";
            } else if (prop.KATEGORIE_TXT === "4*") {
                hotelIcon = "icons/hotel_4stars.png";
            } else if (prop.KATEGORIE_TXT === "5*") {
                hotelIcon = "icons/hotel_5stars.png";
            } else {
                hotelIcon = "icons/hotel_0star.png";
            }
            
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: "icons/hotel.png",
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37],
                })
            });
        },
        onEachFeature: function (feature, layer) {
            let prop = feature.properties;
            layer.bindPopup(`
            <h3>${prop.BETRIEB}</h3>
            <h4>${prop.BETRIEBSART_TXT} ${prop.KATEGORIE_TXT}</h4>
            <hr>
            Addr.: ${prop.ADRESSE}<br>
            Tel.: ${prop.KONTAKT_TEL} ">${prop.KONTAKT_TEL}</a><br>
            <a href="mailto:${prop.KONTAKT_EMAIL}">${prop.KONTAKT_EMAIL}</a><br>
            <a href="${prop.WEBLINK1}">Hompage</a><br>
        `);
            //console.log(feature.properties, prop.NAME);  
        }
    }).addTo(themaLayer.hotels);

    //console.log(response, jsondata)

}
showHotels("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:UNTERKUNFTOGD&srsName=EPSG:4326&outputFormat=json")




map.addControl(new L.Control.Fullscreen({
    title: {
        'false': 'View Fullscreen',
        'true': 'Exit Fullscreen'
    }
}));
