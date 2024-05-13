import {  Form, Row, Button, Card, InputGroup, Col, Alert } from "react-bootstrap"
import {  useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import API from '../API';
import Map from './map'
import { useParams } from "react-router-dom";

function HikeForm(props) {
  const { hiketitle } = useParams()
  const [title, setTitle] = useState('')
  const [length, setLength] = useState()
  const [time, setTime] = useState()
  const [ascent, setAscent] = useState()
  const [difficulty, setDifficulty] = useState("Tourist")
  const [sp, setSp] = useState(["", ""])
  const [addressSp, setAddressSp] = useState('')
  const [ep, setEp] = useState(["", ""])
  const [addressEp, setAddressEp] = useState('')
  const [rp, setRp] = useState(['', ''])
  const [addressRp, setAddressRp] = useState('')
  const [rpList, setRpList] = useState([])
  const [trackPoints, setTrackPoints] = useState([])
  const [desc, setDesc] = useState('')
  const [file, setFile] = useState('')
  const [image, setImage] = useState('')
  const [readFile, setReadFile] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate();
  const [huts, setHuts] = useState([])
  const [parkingLots, setParkingLots] = useState([])
  const [altitude, setAltitude] = useState([])
  const [mapErr, setMapErr] = useState("Upload a gpx track file to modify the fields")
  const token = localStorage.getItem("token");
   
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if(title===""){
      setErrorMessage("Please insert a title")
      return 
    }


    if(file===""){
      setErrorMessage("Please insert a file")
      return 
    }
    if(image===""){
      setErrorMessage("Please insert an image")
      return
    }
    let formData = new FormData()
    formData.append('File', file)
    let hikeDescription = {
      'title': title,
      'length': length,
      'expected_time': time,
      'ascent': ascent,
      'altitude': altitude,
      'difficulty': difficulty,
      'start_point_lat': sp[0],
      'start_point_lng': sp[1],
      'start_point_address': addressSp,
      'end_point_lat': ep[0],
      'end_point_lng': ep[1],
      'end_point_address': addressEp,
      'description': desc,
      'rp_list': rpList,
      'picture': image
    }
    const method = hiketitle? 'PUT': 'POST'
    let req = await API.createHike(hikeDescription, formData, token, method)

    if (req.error) {
      setErrorMessage(req.msg)
    } else {
      props.updateDirty()
      console.log("sss")
      navigate('/')
    }

  }

  const handleDelete = async (event) => {
    event.preventDefault()
    let req = await API.deleteHike(hiketitle, token)
    if (req.error) {
      setErrorMessage(req.msg)
    } else {
      props.updateDirty()
      navigate('/')
    }

  }


  useEffect(() => {
    async function getHike(title) {
      try {
        let hike = await API.getHike(title, token)
        hike = hike.hike
        setTitle(hike.title)
        setLength(hike.length)
        setTime(hike.expected_time)
        setAscent(hike.ascent)
        setDifficulty(hike.difficulty)
        setSp([hike.start_point_lat, hike.start_point_lng])
        setAddressSp(hike.start_point_address)
        setEp([hike.end_point_lat, hike.end_point_lng])
        setAddressEp(hike.end_point_address)
        setRpList(hike.rp)
        setDesc(hike.description)
        setAltitude(hike.altitude)
        const filename = hike.track_file.split('/')[1]
        let file = await API.getHikeFile(hike.id, token)
        if(file.err){
          setMapErr("Please upload a new GPX file, the old one seems lost")
        }
        else{
          const blob = new Blob([file], { type: 'text/plain' })
          const newFile = new File([blob], filename)
          setFile(newFile)
        }
      } catch (e) {
        console.log(e)
      }
    }
    if (hiketitle) {
      getHike(hiketitle)
    }
  }, [hiketitle, token])


  const checkNum = (num) => {
    return !isNaN(num)
  }
  const setPoint = (point, which) => {
    if (!isNaN(point[0]) && !isNaN(point[1])) {
      if (!which)
        setSp(point)
      else
        setEp(point)
    }
  }

  const setRPoint = (point) => {
    
    if (!isNaN(point[0]) && !isNaN(point[1])) {
      setRp(point)
    }
    if(point[0] === '' && point[1] === '')
      setRp(point)
  }

  const addRPoint = () => {

    if (rp['lat'] === '' || rp['lng'] === '') return
    const point = {
      reference_point_lat: rp[0],
      reference_point_lng: rp[1],
      reference_point_address: addressRp
    }
    setRPoint(['', ''])
    setAddressRp('')
    setRpList([...rpList, point])
    let tp = { 'lat': rp[0], 'lon': rp[1] }
    setTrackPoints(trackPoints.filter((point) => {
      return point['lat'] !== tp['lat'] && point['lon'] !== tp['lon']
    }))
  }

  const cleanRPoint = () => {
    if(!rpList.length) return
    let list = rpList.map((pos) => {
      return {
        'lat': pos['reference_point_lat'],
        'lon': pos['reference_point_lng']
      }
    })
    setTrackPoints([...trackPoints, ...list])
    setRpList([])
  }

  const updateTrackPoints = (idx) => {
    let point = trackPoints[idx]
    point = [point['lat'], point['lon']]
    setRPoint(point)
  }

  useEffect(() => {
    if (file !== '') {
      const fr = new FileReader()
      fr.readAsText(file)
      fr.onload = () => {
        setReadFile(fr.result)
      }
    }
  }, [file])

  useEffect(() => {
    let filters = { "start_lat": sp[0], "start_lon": sp[1] }
    const getHuts = async function () {
      let req = await API.getAllHuts(token, filters)
      if (req.error) {
        setErrorMessage(req.msg)
      } else {
        let all_huts = []
        req.msg.forEach((el) => all_huts.push({ "hutId": el.id, "hutName": el.name, "lat": el.lat, "lon": el.lon }))
        setHuts(all_huts)
      }
    }
    if(sp[0] && sp[1])
    getHuts()
  }, [sp,token])

  useEffect(() => {
    let filters = { "start_lat": sp[0], "start_lon": sp[1] }
    const getParkingLots = async function () {
      let req = await API.getAllParkingLots(token, filters)
      if (req.error) {
        setErrorMessage(req.msg)
      } else {
        let all_plot = []
        req.msg.forEach((el) => all_plot.push({ "parkingLotId": el.id, "parkingLotName": el.name, "lat": el.lat, "lon": el.lon }))
        setParkingLots(all_plot)
      }
    }
    if(sp[0] && sp[1])
    getParkingLots()
  }, [sp, token])

  let action;
  if (hiketitle) {
    action = <>
      <Button variant="warning" type="submit" onClick={handleSubmit}>
        Modify
      </Button>{' '}
      <Button variant="danger" type="submit" onClick={handleDelete}>
        Remove
      </Button>
    </>
  }
  else {
    action = <Button variant="primary" type="submit" onClick={handleSubmit}>
      Submit
    </Button>
  }

  return (
    <Card body>
      <Form>
        <Form.Group className="mb-2" controlId="title">
          <Form.Label>Title</Form.Label>
          <Form.Control disabled={hiketitle !== undefined} type="text" placeholder="Enter title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-2" controlId="length">
          <Form.Label>Length (kms)</Form.Label>
          <Form.Control disabled type="text" placeholder="Extracted from the gpx file" value={length}
            onChange={(e) => { if (checkNum(e.target.value)) { setLength(e.target.value) } }} />
        </Form.Group>
        <Form.Group className="mb-2" controlId="time">
          <Form.Label>Expected time</Form.Label>
          <Form.Control type="text" placeholder="Expected time" value={time} onChange={(e) => { if (checkNum(e.target.value)) { setTime(e.target.value) } }} />
        </Form.Group>
        <Form.Group className="mb-2" controlId="ascent">
          <Form.Label>Ascent (meters)</Form.Label>
          <Form.Control disabled type="text" placeholder="Extracted from the gpx file" value={ascent} onChange={(e) => { if (checkNum(e.target.value)) { setAscent(e.target.value) } }} />
        </Form.Group>
        <Form.Group className="mb-2" controlId="ascent">
          <Form.Label>Difficulty</Form.Label>
          <Form.Select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
            <option value="Tourist">Tourist</option>
            <option value="Hiker">Hiker</option>
            <option value="Pro Hiker">Pro Hiker</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3" controlId="end-point">
          <label htmlFor="formFile" className="form-label">Track file</label>
          <input className="form-control" type="file" id="formFile" accept=".gpx" onChange={(e) => {
            setFile(e.target.files[0]);

          }}></input>
          {file === '' ? <Alert style={{ "marginTop": "10px" }} variant="secondary">{mapErr}</Alert> : ''}
        </Form.Group>
        <PointInput file={file} parkingLots={parkingLots} huts={huts} setFormP={setSp} id="startPoint" label="Start Point" point={sp} setPoint={setPoint} which={0} address={addressSp} setAddress={setAddressSp} />
        <PointInput file={file} parkingLots={parkingLots} huts={huts} setFormP={setEp} id="endPoint" label="End Point" point={ep} setPoint={setPoint} which={1} address={addressEp} setAddress={setAddressEp} />
        <RefPoint file={file} point={rp} setPoint={setRPoint} address={addressRp} setAddress={setAddressRp} addPoint={addRPoint} removeAll={cleanRPoint} />
        <Card>
          <Map setSp={setSp} setEp={setEp} sp={sp} ep={ep} spAddress={addressSp} epAddress={addressEp} rpList={rpList} gpxFile={readFile} setAscent={setAscent} setLength={setLength} updateTrackPoints={updateTrackPoints} setAltitude={setAltitude}
            setTrackPoints={setTrackPoints} trackPoints={trackPoints} setRPoint={setRPoint}/>
        </Card>
        <Form.Group className="mb-3" controlId="description">
          <Form.Label>Description</Form.Label>
          <Form.Control as="textarea" rows={2} value={desc} onChange={e => setDesc(e.target.value)} />
        </Form.Group>
        {' '}
        <Form.Group controlId="formFile" className="mb-3">
        <Form.Label>Upload a picture of this hike</Form.Label>
        <input className="form-control" type="file" id="formFile" accept=".png, .jpeg" onChange={(e) => {
            setImage(e.target.files[0]);
          }}></input>
        </Form.Group>
        {action}
      </Form>
      {errorMessage ? <Alert className="mt-3" variant='danger' onClose={() => setErrorMessage('')} dismissible >{errorMessage}</Alert> : false}
    </Card>

  )

}

function RefPoint(props) {
  return (<>
    <Row className="mb-3">
      <Form.Label htmlFor="basic-url">Reference Point</Form.Label>

      <Col>
        <InputGroup size="sm" >
          <InputGroup.Text id="inputGroup-sizing-default" >
            Lat
          </InputGroup.Text>
          <Form.Control disabled
            aria-label="Default"
            aria-describedby="inputGroup-sizing-default"
            value={props.point[0]}
            onChange={(e) => props.setPoint([e.target.value, props.point[1]])}
          />
        </InputGroup>
      </Col>
      <Col>
        <InputGroup size="sm" className="">
          <InputGroup.Text id="inputGroup-sizing-default">
            Lng
          </InputGroup.Text>
          <Form.Control disabled
            aria-label="Default"
            aria-describedby="inputGroup-sizing-default"
            value={props.point[1]}
            onChange={(e) => props.setPoint([props.point[0], e.target.value])}
          />
        </InputGroup>
      </Col>
      <Col>
        <InputGroup size="sm" className="">
          <InputGroup.Text id="inputGroup-sizing-default">
            Addr
          </InputGroup.Text>
          <Form.Control
            disabled={props.file === ''}
            aria-label="Default"
            aria-describedby="inputGroup-sizing-default"
            value={props.address}
            onChange={(e) => props.setAddress(e.target.value)}
          />
        </InputGroup>
      </Col>

    </Row>
    <Row>
      <div align="center">
        <Button onClick={() => props.addPoint()}>Add</Button>
        &nbsp; &nbsp;
        <Button variant="danger" onClick={() => props.removeAll()}>Remove All</Button>
      </div>
    </Row>
    <br />
  </>

  )
}

function PointInput(props) {
  const label = props.label
  const [selected, setSelected] = useState('GPS')

  let form = ""
  let variant1 = "dark"
  let variant2 = "outline-dark"
  let variant3 = "outline-dark"
  if (selected === "GPS") {
    variant1 = "dark"
    variant2 = "outline-dark"
    variant3 = "outline-dark"
    form = <><Col>
      <InputGroup size="sm" >
        <InputGroup.Text id="inputGroup-sizing-default" >
          Lat
        </InputGroup.Text>
        <Form.Control
          disabled={props.file === ''}
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
            disabled={props.file === ''}
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
            disabled={props.file === ''}
            aria-label="Default"
            aria-describedby="inputGroup-sizing-default"
            value={props.address}
            onChange={(e) => props.setAddress(e.target.value)}
          />
        </InputGroup>
      </Col></>
  }

  if (selected === 'Hut') {
    variant1 = "outline-dark"
    variant2 = "dark"
    variant3 = "outline-dark"
    form = <Col>
      <Form.Select size="sm" onChange={(ev) => {
        let values = ev.target.value.split("-")
        props.setAddress(values[0])
        props.setFormP([values[1], values[2]])
        props.setPoint([values[1], values[2]], props.which)
      }}>
        <option key={"-1"} value={"-"}>
          -
        </option>
        {props.huts.map((option, index) => (
          <option key={index} value={option.hutName + "-" + option.lat + "-" + option.lon}>
            {option.hutName}
          </option>
        ))}
      </Form.Select>
    </Col>
  }

  if (selected === 'Parking Lot') {
    variant1 = "outline-dark"
    variant2 = "outline-dark"
    variant3 = "dark"
    form = <Col>
      <Form.Select size="sm" onChange={(ev) => {
        let values = ev.target.value.split("-")
        props.setAddress(values[0])
        props.setFormP([values[1], values[2]])
        props.setPoint([values[1], values[2]], props.which)
      }}>
        <option key={"-1"} value={"-"}>
          -
        </option>
        {props.parkingLots.map((option, index) => (
          <option key={index} value={option.parkingLotName + "-" + option.lat + "-" + option.lon}>
            {option.parkingLotName}
          </option>
        ))}
      </Form.Select>
    </Col>

  }
  return (
    <Row className="mb-3">
      <Row className="mb-3">

        <Form.Label htmlFor="basic-url">{label}</Form.Label>



        <InputGroup size="sm">
          <Button variant={variant1} disabled={props.file === ''} className="border-right-0" onClick={() => setSelected('GPS')}>GPS</Button>
          <Button variant={variant2} disabled={props.file === ''} onClick={() => setSelected('Hut')}>Hut</Button>
          <Button variant={variant3} disabled={props.file === ''} onClick={() => setSelected('Parking Lot')}>P. Lot</Button>
        </InputGroup>


      </Row>




      {form}
    </Row>

  )
}

export default HikeForm