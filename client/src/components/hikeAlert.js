import Card from 'react-bootstrap/Card';
import { Container, ListGroup, Row, Col } from 'react-bootstrap';
import UTILS from '../utils/utils';

function displayAlertUtil(alert) {
  let alertcard = alert.map((a, idx) =>
    <Col className="pb-4 px-0" key={idx}>
      <WeatherCard alert={a} />
    </Col>)
  let rows = UTILS.createRows(alert, alertcard)
  return (
    <>
      <Container>
        <Row>
          <Col xs={10}>
            <h1>All alerts</h1>
          </Col>
        </Row>
      </Container>
      <div>
        {rows}
      </div>
    </>
  )
}

function WeatherHikeAlert(props) {
  if (props.alerts.length === 0) {
    return <h1>No alert in your active hike zone</h1>
  }
  else {
    return displayAlertUtil(props.alerts)
  }
}


function WeatherCard(props) {
    
  return (<>
       <Card style={{ width: '22rem' }} key={0}>
        <ListGroup className="list-group-flush">
          <ListGroup.Item>Condition: {props.alert.condition}</ListGroup.Item>
          <ListGroup.Item>Latitude: {props.alert.weather_lat}</ListGroup.Item>
          <ListGroup.Item>Longitude: {props.alert.weather_lon}</ListGroup.Item>
        </ListGroup>
      </Card>
  </>
  );
}

export default WeatherHikeAlert;


