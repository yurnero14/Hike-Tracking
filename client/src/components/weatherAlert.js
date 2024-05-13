import { MapContainer, TileLayer, Marker,  useMapEvents, Circle, Popup } from 'react-leaflet'
import { Row, Col, Card, Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { Icon } from 'leaflet';
import API from '../API';

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
const weatherOption = ["Storm", "Snow", "Hail", "Strong wind"]

function WeatherAlert(props){
    const [radius, setRadius] = useState(0)
    const [position, setPosition] = useState({
        lat: "", lng:""
    })
    const [weather, setWeather] = useState("Storm")
    const [alerts, setAlerts] = useState([])
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const token = localStorage.getItem("token")
    const alertsMarker = alerts.map((a,idx) => 
        <>
        <Marker position={[a.position[0],a.position[1]]} icon={myIconEp} key={'m' + idx}>
        <Popup>
                Condition: {a.condition}
        </Popup>
        </Marker>
        <Circle radius={a.radius} center={[a.position[0],a.position[1]]} key={'c' + idx}/>
        </>
        
    )
    useEffect(() => {
        async function getAlerts()  {
            try {
                const response = (await API.getAlerts(token))
                if(response.error){
                    setErrorMessage(response.msg)
                }
                else {
                    setAlerts(response.msg)
                }
            } catch(e){
                console.log(e)
                setErrorMessage("Something went wrong, try later")
            }
        }
        getAlerts()
    },[])
    const handleSubmit = async (event) => {
        event.preventDefault();
        if(position==="" || radius===0){
            setErrorMessage("Please provide a position and a not zero range")
            return
        }
        const body={
            condition: weather,
            position: [position.lat, position.lng],
            radius: radius * 5000
        }
        try {
            const res = await API.postAlert(body, token)
            if(res.error)
                setErrorMessage(res.msg)
            else {
                setPosition("")
                setRadius(0)
                setAlerts([...alerts, body])
                setSuccessMessage("Weather alert updated")
            }
        } catch(e){
            setErrorMessage("Something went wrong, try later")
        }
    }

    const handleDelete = async (e) => {
        e.preventDefault()
        try {
            const response = (await API.deleteAlerts(token))
            if(response.error){
                setErrorMessage(response.msg)
            }
            else {
                setSuccessMessage("All the alerts were deleted")
                setAlerts([])
            }
        } catch(e){
            console.log(e)
            setErrorMessage("Something went wrong, try later")
        }
    }
    return (
        <Card body>
            <Card.Title>Waether Alert</Card.Title>
            {errorMessage ? <Alert id="error"variant='danger' onClose={() => setErrorMessage('')} dismissible >{errorMessage}</Alert> : ''}
            {successMessage ? <Alert id="success" variant='success' onClose={() => setSuccessMessage('')} dismissible >{successMessage}</Alert> : ''}

            <Form>
                <FilterMap alertsMarker={alertsMarker} position={position} setPosition={setPosition} radius={radius} className="mb-2"/>
                <Form.Group className='mt-2'>
                <Row>
                    <Col>
                    <Form.Range  value={radius} onChange={(e) => setRadius(e.target.value)} />
                    {' '}
                    </Col>

                    <Col>
                    <InputGroup>
                    <InputGroup.Text>Range - {radius * 5} km</InputGroup.Text>
                    <Button variant="danger" onClick={() => setPosition('')}>Reset</Button>
                    </InputGroup>
                    </Col>
                </Row>
                </Form.Group>
                <Form.Group className="mb-2">
                    <Form.Label>
                        Weather condition
                    </Form.Label>
                    <Form.Select id="conditionInput" value={weather} onChange={(e) => {setWeather(e.target.value)}}>
                        {weatherOption.map((c,idx) => 
                        <option value={c} key={idx} >{c}</option>)}
                    </Form.Select>
                </Form.Group>
                <Row>
                <Col>
        <InputGroup size="sm" >
          
          <Form.Control 
          hidden
          id='latitudeInput'
            aria-label="Default"
            aria-describedby="inputGroup-sizing-default"
            value={position.lat}
            onChange={(e) => setPosition({
                lat: e.target.value,
                lng: position.lng
            })}
          />
        </InputGroup>
      </Col>
      <Col>
        <InputGroup size="sm" className="">
          
          <Form.Control 
            hidden
            id='longitudeInput'
            aria-label="Default"
            aria-describedby="inputGroup-sizing-default"
            value={position.lng}
            onChange={(e) => setPosition({
                lat: position.lat,
                lng: e.target.value
            })}
          />
        </InputGroup>
      </Col>
      <Col>
        <InputGroup size="sm" className="">
          
          <Form.Control 
            hidden
            id='radiusInput'
            aria-label="Default"
            aria-describedby="inputGroup-sizing-default"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
          />
        </InputGroup>
      </Col>
                </Row>
                <Button id="updateAlerts" onClick={handleSubmit}>Update weather condition</Button>
                {' '}
                <Button onClick={handleDelete} variant="danger">Delete all weather conditions</Button>

            </Form>
             
        </Card>
       
    )
}


function MapFunction(props) {
    const map = useMapEvents({
      click: (e) => {
        props.setPosition(e.latlng)
      }
      
    })
    useEffect(() => {
      map.locate()
    }, [props.position, map])
    return null
  }


function FilterMap(props) {
    const [center, setCenter] = useState([45.07104275068942, 7.677664908245942])
    const position = !props.position.lat ? { lat: props.position[0], lng: props.position[1] } : props.position
    return (
  
      <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: '400px' }} >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {props.position !== "" ?
          <Circle center={props.position} radius={props.radius * 5000} />
          :
          ''}
        <MapFunction setCenter={setCenter} setPosition={props.setPosition} position={position} />
        {props.position !== "" ?
          <Marker position={props.position} icon={myIconSp} key={'sp'}>
          </Marker> : ''}
        {props.alertsMarker}
      </MapContainer>
    )
  }

  export default WeatherAlert