import {  Form, Row, Button, Card, InputGroup, Col, Alert } from "react-bootstrap"
import {  useNavigate } from 'react-router-dom';
import {  useState } from "react";
import API from '../API';





function ParkingLotForm(props) {
  const [name, setName] = useState('')
  const [position, setPosition] = useState(['', ''])
  const [address, setAddress] = useState('')
  const [desc, setDesc] = useState('')
  const [fee, setFee] = useState()
  const [n_cars,setNCars] = useState()
  let [errorMessage, setErrorMessage] = useState('')
  let navigate = useNavigate();
  
  let token = localStorage.getItem("token");

  const handleSubmit = async (event) => {
    event.preventDefault();
    let parkingLotDescription = {
      'name': name,
      'fee': fee,
      'desc': desc,
      'position': {'latitude': position[0], 'longitude':position[1], 'address': address },
      'n_cars': n_cars
    }
    let req = await API.createParkingLot(parkingLotDescription, token)  
    if (req.error) {
      setErrorMessage(req.msg)
    } else {
      navigate('/localguide/parkinglots')
      props.updateDirty()
    }
  }


  const checkNum = (num) => {
    return !isNaN(num)
  }
  const setPoint = (point) => {
    if (!isNaN(point[0]) && !isNaN(point[1])) {
        setPosition(point)
    }
  }

  return (
    <Card body>
      <Form>
        <Form.Group className="mb-2" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control type="text" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-2" controlId="fee">
          <Form.Label>Fee per hour (in €)</Form.Label>
          <Form.Control type="text" placeholder="Fee" value={fee} onChange={(e) => { if (checkNum(e.target.value)) { setFee(e.target.value) } }} />
        </Form.Group>
        <Form.Group className="mb-2" controlId="n_cars">
          <Form.Label>Number of parking spaces</Form.Label>
          <Form.Control type="text" placeholder="n_car" value={n_cars} onChange={(e) => { if (checkNum(e.target.value)) { setNCars(e.target.value) } }} />
        </Form.Group>
        <PointInput point={position} setPoint = {setPoint} address={address} setAddress={setAddress} />
        <Form.Group className="mb-3" controlId="description">
          <Form.Label>Description</Form.Label>
          <Form.Control as="textarea" rows={2} value={desc} onChange={e => setDesc(e.target.value)} />
        </Form.Group>
        {' '}
        <Button variant="primary" type="submit" onClick={handleSubmit}>
          Submit
        </Button>
      </Form>
      {errorMessage ? <Alert variant='danger' onClose={() => setErrorMessage('')} dismissible >{errorMessage}</Alert> : false}
    </Card>
  )
}



function PointInput(props) {
  
  return (
    <Row className="mb-3">
            <Form.Label htmlFor="basic-url">Position</Form.Label>
      <Col>
      <InputGroup size="sm" >
        <InputGroup.Text id="inputGroup-sizing-default" >
          Lat
        </InputGroup.Text>
        <Form.Control
          aria-label="Default"
          aria-describedby="inputGroup-sizing-default"
          value={props.point[0]} onChange={(e) => props.setPoint([e.target.value, props.point[1]], props.which)}
        />
      </InputGroup>
    </Col>
      <Col>
        <InputGroup size="sm" className="">
          <InputGroup.Text id="inputGroup-sizing-default">
            Lng
          </InputGroup.Text>
          <Form.Control
            aria-label="Default"
            aria-describedby="inputGroup-sizing-default"
            value={props.point[1]} onChange={(e) => props.setPoint([props.point[0], e.target.value], props.which)}
          />
        </InputGroup>
      </Col>
      <Col>
        <InputGroup size="sm" className="">
          <InputGroup.Text id="inputGroup-sizing-default">
            Addr
          </InputGroup.Text>
          <Form.Control
            aria-label="Default"
            aria-describedby="inputGroup-sizing-default"
            value={props.address}
            onChange={(e) => props.setAddress(e.target.value)}
          />
        </InputGroup>
      </Col>
    </Row>

  )
}

export default ParkingLotForm
