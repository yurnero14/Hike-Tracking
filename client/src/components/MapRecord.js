import { useEffect,useState } from "react"
import { MapContainer, Polyline, TileLayer, useMapEvents,Marker, Popup, Circle } from "react-leaflet"
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
  const myIconRpCurr = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
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

  const myIconWeather = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [20, 35],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

function MapRecord(props){
    const [positions, setPositions] = useState([])
    const gpxFile = props.gpxFile
    const rpList = props.rpList.map((pos,idx) => {
      
      return (
      <Marker position={[pos['reference_point_lat'],pos['reference_point_lng']]} 
      icon={props.curr !== pos['reference_point_address'] ? 
        (!pos.reached? myIconRp: myIconTp): 
        myIconRpCurr} 
      key={idx}
      eventHandlers={{
        click: () =>  {
          if(!pos.reached)
          props.setCurr(pos['reference_point_address'])
        }}}>
          <Popup>
              Reference Point: <>{pos['reference_point_address']}{
              pos.datetime?<div>Reached at: {
              pos.datetime.format("HH:mm:ss DD/MM/YYYY")}</div>:''}</>
          </Popup>
      </Marker>)
    })
    
    let spMarker = null
    if(props.sp.lat && props.sp.lng){
          spMarker =(
          <Marker position={[props.sp.lat,props.sp.lng]} icon={myIconSp} >
            <Popup>
                Start point: <>{props.sp.addr}{
              props.sp.datetime?<div>Reached at: {
              props.sp.datetime.format("HH:mm:ss DD/MM/YYYY")}</div>:''}</>
            </Popup>
          </Marker>)
    }
    let epMarker = null
    if(props.ep.lat && props.ep.lng)
          epMarker =(
          <Marker position={[props.ep.lat,props.ep.lng]} icon={myIconEp} >
            <Popup>
                End point: <>{props.ep.addr}{
              props.ep.datetime?<div>Reached at: {
              props.ep.datetime.format("HH:mm:ss DD/MM/YYYY")}</div>:''}</>
            </Popup>
          </Marker>)
    const alertsMarker = props.showAlerts? props.alerts.map((alert) => {
      console.log(alert)
      return <>
      <Circle center={[alert.weather_lat,alert.weather_lon]} radius={alert.radius} />
      <Marker position={[alert.weather_lat,alert.weather_lon]} icon={myIconWeather} >
            <Popup>
                {alert.condition}
            </Popup>
          </Marker>
      </>
    }):''
    useEffect(() => {
      if(props.gpxFile !== ''){
      
          const gpx = new GpxParser()
          gpx.parse(props.gpxFile)
          let idx = 0
          let orderedRpList = []
          const pos = gpx.tracks[0].points.map(p => {
              if(idx < props.rpList.length && 
                p.lat === props.rpList[idx].reference_point_lat && 
                p.lon===props.rpList[idx].reference_point_lng){
                orderedRpList.push(props.rpList[idx])
                idx++
              }
              
              return [p.lat, p.lon]}
          )
          if (props.setRpList)
            props.setRpList(orderedRpList)
          setPositions(pos)
      }
      }
    ,[gpxFile])
  
    return (
      <MapContainer 
          center={[45.07104275068942, 7.677664908245942]} zoom={13} scrollWheelZoom={false} style={{height: '400px'}}>
          <Click sp={props.sp}/>
          <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <Polyline
              pathOptions={{ fillColor: 'red', color: 'blue' }}
              positions={
              positions
          }
          />
          {rpList}
          {spMarker}
          {epMarker}
          {alertsMarker}
      </MapContainer>
  )
  }
  
  
function Click(props){
    const [sp, setSp] = useState([])
    const map = useMapEvents({
        
    })
    useEffect(() => {
      if(props.sp.lat && props.sp.lng && sp[0] !== props.sp.lat && sp[1] !== props.sp.lng){
        setSp([props.sp.lat, props.sp.lng])
        map.flyTo([props.sp.lat, props.sp.lng], undefined, {animate: false})
      }
    },[props.sp])
    
    return null
}

export default MapRecord