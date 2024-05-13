import { MapContainer, TileLayer, Marker,  useMapEvents, Circle } from 'react-leaflet'
import { Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { Icon } from 'leaflet';
const myIconSp = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const province_dic = {
  '-': "-",
  'AG': 'Agrigento',
  'AL': 'Alessandria',
  'AN': 'Ancona',
  'AO': 'Aosta',
  'AR': 'Arezzo',
  'AP': 'Ascoli Piceno',
  'AT': 'Asti',
  'AV': 'Avellino',
  'BA': 'Bari',
  'BT': 'Barletta-Andria-Trani',
  'BL': 'Belluno',
  'BN': 'Benevento',
  'BG': 'Bergamo',
  'BI': 'Biella',
  'BO': 'Bologna',
  'BZ': 'Bolzano',
  'BS': 'Brescia',
  'BR': 'Brindisi',
  'CA': 'Cagliari',
  'CL': 'Caltanissetta',
  'CB': 'Campobasso',
  'CI': 'Carbonia-Iglesias',
  'CE': 'Caserta',
  'CT': 'Catania',
  'CZ': 'Catanzaro',
  'CH': 'Chieti',
  'CO': 'Como',
  'CS': 'Cosenza',
  'CR': 'Cremona',
  'KR': 'Crotone',
  'CN': 'Cuneo',
  'EN': 'Enna',
  'FM': 'Fermo',
  'FE': 'Ferrara',
  'FI': 'Firenze',
  'FG': 'Foggia',
  'FC': 'Forlì-Cesena',
  'FR': 'Frosinone',
  'GE': 'Genova',
  'GO': 'Gorizia',
  'GR': 'Grosseto',
  'IM': 'Imperia',
  'IS': 'Isernia',
  'SP': 'La Spezia',
  'AQ': 'L\'Aquila',
  'LT': 'Latina',
  'LE': 'Lecce',
  'LC': 'Lecco',
  'LI': 'Livorno',
  'LO': 'Lodi',
  'LU': 'Lucca',
  'MC': 'Macerata',
  'MN': 'Mantova',
  'MS': 'Massa-Carrara',
  'MT': 'Matera',
  'ME': 'Messina',
  'MI': 'Milano',
  'MO': 'Modena',
  'MB': 'Monza e della Brianza',
  'NA': 'Napoli',
  'NO': 'Novara',
  'NU': 'Nuoro',
  'OT': 'Olbia-Tempio',
  'OR': 'Oristano',
  'PD': 'Padova',
  'PA': 'Palermo',
  'PR': 'Parma',
  'PV': 'Pavia',
  'PG': 'Perugia',
  'PU': 'Pesaro e Urbino',
  'PE': 'Pescara',
  'PC': 'Piacenza',
  'PI': 'Pisa',
  'PT': 'Pistoia',
  'PN': 'Pordenone',
  'PZ': 'Potenza',
  'PO': 'Prato',
  'RG': 'Ragusa',
  'RA': 'Ravenna',
  'RC': 'Reggio Calabria',
  'RE': 'Reggio Emilia',
  'RI': 'Rieti',
  'RN': 'Rimini',
  'RM': 'Roma',
  'RO': 'Rovigo',
  'SA': 'Salerno',
  'VS': 'Medio Campidano',
  'SS': 'Sassari',
  'SV': 'Savona',
  'SI': 'Siena',
  'SR': 'Siracusa',
  'SO': 'Sondrio',
  'TA': 'Taranto',
  'TE': 'Teramo',
  'TR': 'Terni',
  'TO': 'Torino',
  'OG': 'Ogliastra',
  'TP': 'Trapani',
  'TN': 'Trento',
  'TV': 'Treviso',
  'TS': 'Trieste',
  'UD': 'Udine',
  'VA': 'Varese',
  'VE': 'Venezia',
  'VB': 'Verbano-Cusio-Ossola',
  'VC': 'Vercelli',
  'VR': 'Verona',
  'VV': 'Vibo Valentia',
  'VI': 'Vicenza',
  'VT': 'Viterbo',
};


function GeographicalFilter(props) {
  const position = props.position
  const setPosition = props.setPosition
  const radius = props.radius
  const setRadius = props.setRadius
  const province = props.province
  const setProvince = props.setProvince
  const setVillage = props.setVillage
  const [geoFilter, setGeoFilter] = useState(0)
  return (<>
    <Form.Label>Geographical filter</Form.Label>

    <InputGroup size="sm" className='mb-2'>
      <Button onClick={() => { setGeoFilter(0) }} variant={geoFilter === 0 ? "dark" : "outline-dark"}>Map</Button>
      <Button onClick={() => { setGeoFilter(1) }} variant={geoFilter === 1 ? "dark" : "outline-dark"}>Province/Village</Button>
    </InputGroup>
    {geoFilter === 1 ?
      <Row className="mb-2">
        <Col>
          <Form.Group className="" controlId="title">
            <InputGroup>
              <InputGroup.Text>Province</InputGroup.Text>
              <Form.Select value={province} onChange={e => setProvince(e.target.value)}>
                {Object.values(province_dic).sort().map((p, idx) => <option value={p} key={idx}>{p}</option>)}
              </Form.Select>
            </InputGroup>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="" controlId="title">
            <InputGroup>
              <InputGroup.Text>Village</InputGroup.Text>
              <Form.Control onChange={e => setVillage(e.target.value)}></Form.Control>
            </InputGroup>
          </Form.Group>
        </Col>
      </Row>
      :
      <>
        <Card className='mb-2'>
          <FilterMap position={position} setPosition={setPosition} radius={radius}></FilterMap>
        </Card>
        <Form.Group className='mb-2'>
          <Row>
            <Col sm={8}>
              <Form.Range value={radius} onChange={(e) => setRadius(e.target.value)} />
              {' '}
            </Col>
            <Col sm={4}>
              <InputGroup>
                <InputGroup.Text>Range - {radius*5} km</InputGroup.Text>
                <Button variant="danger" onClick={() => setPosition('')}>Reset</Button>
              </InputGroup>
            </Col>


          </Row>
        </Form.Group>

      </>
    }
  </>)
}


function MapFunction(props) {
  const map = useMapEvents({
    click: (e) => {
      props.setPosition(e.latlng)
    },
    locationfound: (e) => {
      props.setCenter(e.latlng)
      map.flyTo(e.latlng)
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
        <Circle  center={props.position} radius={props.radius * 5000} />
        :
        ''}
      <MapFunction setCenter={setCenter} setPosition={props.setPosition} position={position} />
      {props.position !== "" ?
        <Marker position={props.position} icon={myIconSp}>

        </Marker> : ''}
    </MapContainer>
  )
}


export default GeographicalFilter