import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { Container, ListGroup, Row, Col, Modal } from 'react-bootstrap';
import { useState } from 'react';
import UTILS from '../utils/utils';

  
function displayParkingLotsUtil(parkinglots, userPower){
  let parkinglotscards =  parkinglots.map((h,idx) => 
      <Col className="pb-4 px-0" key={idx}>
        <ParkingLotCard userPower={userPower} parkinglot={h} key={idx}/>
      </Col>)
    let rows = UTILS.createRows(parkinglots, parkinglotscards)
    return (
      <>
        <Container>
          <Row>
            <Col xs={10}>
              <h1>All Parking Lots</h1>
            </Col>
          </Row>
        </Container>
        <div>
          {rows}
        </div>
      </>
    )
}

function ParkingLots(props){
  if(props.parkinglots.length === 0) {
    return  <h1>No available parking lots</h1>
  }
  else {
    return displayParkingLotsUtil(props.parkinglots, props.userPower)
  }
}


function ParkingLotCard(props) {
  const [modalDescriptionShow, setModalDescriptionShow] = useState(false);

  return (<>
    <Card style={{ width: '22rem' }} key={0} title={props.parkinglot.name}>
      <Card.Body>
        <Card.Title>{props.parkinglot.name}</Card.Title>

      </Card.Body>
      <ListGroup className="list-group-flush">
        <ListGroup.Item>Address: {props.parkinglot.address}</ListGroup.Item>
        <ListGroup.Item>Fee per hour: {props.parkinglot.fee}€</ListGroup.Item>
        <ListGroup.Item>#Parking spaces: {props.parkinglot.n_cars}</ListGroup.Item>
      </ListGroup>
      <Card.Body>
        <Card.Text>
          <Button onClick={() => setModalDescriptionShow(true)}>Description</Button>
          {' '}
         
        </Card.Text>
  </Card.Body>

    </Card>
    <ParkinglotModalDescription
      show={modalDescriptionShow}
      onHide={() => setModalDescriptionShow(false)}
      title={props.parkinglot.name}
      description={props.parkinglot.desc}
      
    />
    
  </>
  );
}
function ParkinglotModalDescription(props) {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {props.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Description</h4>
        <p>
          {props.description}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}






export default ParkingLots;


