import { Form, Button, Card, Row, Col,InputGroup } from "react-bootstrap"
import { useEffect, useState } from "react";
import API from '../API';
import { useNavigate } from 'react-router-dom';

function Preferences(props) {
  
  const [lengthMin, setLengthMin] = useState('')
  const [lengthMax, setLengthMax] = useState('')
  const [timeMin, setTimeMin] = useState('')
  const [timeMax, setTimeMax] = useState('')
  const [ascentMin, setAscentMin] = useState('')
  const [ascentMax, setAscentMax] = useState('')
  const [difficulty, setDifficulty] = useState("Tourist")
  const [_, setErrorMessage] = useState('')
  let token = localStorage.getItem("token");
  let navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    let preferences = {
      'min_length': lengthMin? lengthMin: null,
      'max_length': lengthMax? lengthMax: null,
      'min_time': timeMin? timeMin: null,
      'max_time': timeMax? timeMax: null,
      'min_altitude': ascentMin? ascentMin: null,
      'max_altitude': ascentMax? ascentMax: null,
      'difficulty': difficulty
    }
    let req = await API.setProfile(preferences, token)
    if (req.error) {
      setErrorMessage(req.msg)
    } else {
      props.updateDirty()
      navigate('/recommendedhikes')
    }
  }


  useEffect(() => {
    const getProfile = async function () {
      let req = await API.getProfile(token)
      if (req.msg) {
        setLengthMin(req.msg[0].min_length?req.msg[0].min_length:'')
        setLengthMax(req.msg[0].max_length?req.msg[0].max_length:'')
        setTimeMin(req.msg[0].min_time?req.msg[0].min_time:'')
        setTimeMax(req.msg[0].max_time?req.msg[0].max_time:'')
        setAscentMin(req.msg[0].min_altitude?req.msg[0].min_altitude:'')
        setAscentMax(req.msg[0].max_altitude?req.msg[0].max_altitude:'')
      }
    }
    getProfile()
  }, [token])

  const checkNum = (num, callback) => {
    if (!isNaN(num)) {
      return callback(num);
    }
    return false
  }

  return (
    <>
  <h1>My Profile</h1>
  <Card body>
  <Form>
  <Row className="mb-2"> 
  <Form.Label htmlFor="basic-url">Length (in kms)</Form.Label>
  <Col>
    <InputGroup size="sm" className="">
      <InputGroup.Text id="inputGroup-sizing-default" >
        Min
      </InputGroup.Text>
      <Form.Control
        aria-label="Default"
        aria-describedby="inputGroup-sizing-default"
        value={lengthMin}
        onChange={(e) => checkNum(e.target.value, setLengthMin)}
      />
    </InputGroup>
  </Col>
  <Col>
    <InputGroup size="sm" className="">
      <InputGroup.Text id="inputGroup-sizing-default">
        Max
      </InputGroup.Text>
      <Form.Control
        aria-label="Default"
        aria-describedby="inputGroup-sizing-default"
        value={lengthMax}
        onChange={(e) => checkNum(e.target.value, setLengthMax)}
      />
    </InputGroup>
  </Col>
</Row>
    
<Row className="mb-2">
  <Form.Label htmlFor="basic-url">Expected time (in min)</Form.Label>
  <Col>
    <InputGroup size="sm" className="">
      <InputGroup.Text id="inputGroup-sizing-default" >
        Min
      </InputGroup.Text>
      <Form.Control
        aria-label="Default"
        aria-describedby="inputGroup-sizing-default"
        value={timeMin}
        onChange={(e) => checkNum(e.target.value, setTimeMin)}
        
      />
    </InputGroup>
  </Col>
  <Col>
    <InputGroup size="sm" className="">
      <InputGroup.Text id="inputGroup-sizing-default">
        Max
      </InputGroup.Text>
      <Form.Control
        aria-label="Default"
        aria-describedby="inputGroup-sizing-default"
        value={timeMax}
        onChange={(e) => checkNum(e.target.value, setTimeMax)}
      />
    </InputGroup>
  </Col>
</Row>
<Row className="mb-2">
  <Form.Label htmlFor="basic-url">Ascent (in meters)</Form.Label>
  <Col>
    <InputGroup size="sm" className="">
      <InputGroup.Text id="inputGroup-sizing-default" >
        Min
      </InputGroup.Text>
      <Form.Control
        aria-label="Default"
        aria-describedby="inputGroup-sizing-default"
        value={ascentMin}
        onChange={(e) => checkNum(e.target.value, setAscentMin)}
        
      />
    </InputGroup>
  </Col>
  <Col >
    <InputGroup size="sm" className="">
      <InputGroup.Text id="inputGroup-sizing-default">
        Max
      </InputGroup.Text>
      <Form.Control
        aria-label="Default"
        aria-describedby="inputGroup-sizing-default"
        value={ascentMax}
        onChange={(e) => checkNum(e.target.value, setAscentMax)}
      />
    </InputGroup>
  </Col>
</Row>

<Form.Group className="mb-2" controlId="ascent">
    <Form.Label>Difficulty</Form.Label>
    <Form.Select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
    <option value="All" >All</option>
    <option value="Tourist" >Tourist</option>
    <option value="Hiker" >Hiker</option>
    <option value="Pro Hiker" >Pro Hiker</option>
    </Form.Select>
</Form.Group>
<Button variant="primary" type="submit" onClick={handleSubmit}>
    Apply
</Button>
</Form>
</Card>
</>
)

}



export default Preferences;