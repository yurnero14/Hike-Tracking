/*
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet'
import { useEffect, useState } from 'react'
import { Icon } from 'leaflet'
import GpxParser from 'gpxparser';

const myIconSp = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


const myIconEp = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const myIconRp = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [20, 35],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const myIconTp = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [20, 35],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function MRecord(props){
    
    const [positions, setPositions] = useState([])
    const [currPoint, setCurrPoint] = useState([])
    const gpxFile = props.gpxFile
    const rpList = props.rpList.map((rp) => {
        let x=rp['reached']
        if (x!==false)
            x="Reached at:" + x.split('T')[1].split('Z');
        else x= ""
         return <Marker position={[rp['reference_point_lat'],rp['reference_point_lng']]} icon={myIconRp} key={rp['reference_point_id']}>
            <Popup>
                Reference Point: {rp['reference_point_address']} 
                <div>{x}</div>
            </Popup>
        </Marker>
    })
    let pointMarker = null
    if(currPoint.length !== 0){
        
        pointMarker =(<Marker position={currPoint} icon={myIconTp} >
        </Marker>)
    }
    let spMarker = null
    if(props.sp[0]!=='' && props.sp[1]!=='')
        spMarker =(<Marker position={props.sp} icon={myIconSp} >
        <Popup>
            Start point: {props.spAddress}
            <div>Time: {props.spTime}</div>
        </Popup>
        </Marker>)
    let epMarker = null
    if(props.ep[0]!=='' && props.ep[1]!=='')
        epMarker =(<Marker position={props.ep} icon={myIconEp} >
        <Popup>
            End point: {props.epAddress} 
            <div>Time: {props.epTime}</div>
        </Popup>
        </Marker>)
    useEffect(() => {
        if (props.gpxFile !== ''){ 
            const gpx = new GpxParser()
            gpx.parse(props.gpxFile)
            const pos = gpx.tracks[0].points.map(p => [p.lat, p.lon])
            setPositions(pos)
            if(props.setLength){
                const elevation = gpx.tracks[0].elevation.max
                const distance = gpx.tracks[0].distance.total
                props.setSp(pos[0])
                props.setEp(pos[pos.length-1])
                props.setLength(parseInt(distance))
                props.setAscent(parseInt(elevation))
                let rp = [];
                for (var i = 1; i < gpx.tracks[0].points.length - 1; i++) {
                    rp[i - 1] = gpx.tracks[0].points[i];
                }
                props.setTrackPoints(rp)

            }
        }
    },[gpxFile])
    return (
        <MapContainer center={props.sp? props.sp : [45.07104275068942, 7.677664908245942]} zoom={13} scrollWheelZoom={false} style={{height: '400px'}} >
            <Click sp={props.sp} setRPoint={props.setRPoint} trackPoints={props.trackPoints} currPoint={currPoint} 
            setCurrPoint={setCurrPoint}></Click>
            <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {spMarker}
            {epMarker}
            {rpList}
            {pointMarker}
            <Polyline
                pathOptions={{ fillColor: 'red', color: 'blue' }}
                positions={
                positions
            }
            />
        </MapContainer>
    )
}

function Click(props){
    const [sp, setSp] = useState([])
    const map = useMapEvents({
        'click': (e) => {
            const distances = []
            for(let i = 0; i < props.trackPoints.length; i++) {
                distances.push(map.distance(e.latlng, props.trackPoints[i]))
            }
            const min = Math.min(...distances)
            const idx = distances.indexOf(min)
            if(min < 50){
                props.setCurrPoint([props.trackPoints[idx].lat, props.trackPoints[idx].lon])
                props.setRPoint([props.trackPoints[idx].lat, props.trackPoints[idx].lon])
            }
            else
            {
                props.setRPoint(['',''])
            }
        }
            
        
      })
    if(props.sp[0] && props.sp[1] && sp[0] != props.sp[0] && sp[1] != props.sp[1]){
        setSp(props.sp)
        map.flyTo(props.sp, undefined, {animate: false})
    }
    return null
}
export default MRecord
*/