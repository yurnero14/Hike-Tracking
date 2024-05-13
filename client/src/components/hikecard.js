import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card,ListGroup, Button,Modal, Badge } from "react-bootstrap";
import Map from "./map";
import TimeModal from "./timeModal";
import dayjs from "dayjs";
import API from "../API";
import TheSpinner from "./spinner";
function HikeCard(props) {
    const [modalDescriptionShow, setModalDescriptionShow] = useState(false);
    const [modalMapShow, setModalMapShow] = useState(false);
    const [modalTime, setModalTime] = useState(false)
    const [time, setTime] = useState(dayjs())
    const [errorMessageTime, setErrorMessageTime] = useState('')
    const isHiker = props.userPower === 'hiker'
    const isLocalGuide = props.userPower === 'localguide'
    const isHutWoker = props.userPower === 'hutworker'
    const canModify = props.userId && props.userId === props.hike.local_guide_id
    const navigate = useNavigate()
    const token = localStorage.getItem('token')
    const handleSubmit = async(e) => {
      e.preventDefault()
      const datetime = time.format('MM/DD/YYYY HH:mm:ss')
      const hike_id = props.hike.id
      const body = {
        datetime : datetime,
        hike_id : hike_id
      }
      try {
        const response = await API.postStartHike(body, token)
        if(!response.error){
          props.updateDirty()
          navigate("/hiker/ongoinghike")
          return true
        } else {
          setErrorMessageTime(response.msg)
          return false
        }
      } catch(e){
        setErrorMessageTime(e)
        return false
      }
    }
    
    return (<>
      <Card style={{ width: '21rem' }} key={0} title={props.hike.title}>
        <Card.Body>
          <Card.Title>{props.hike.title}</Card.Title>
  
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroup.Item>Length: {props.hike.length}km</ListGroup.Item>
          <ListGroup.Item>Estimated time: {props.hike.expected_time}min</ListGroup.Item>
          <ListGroup.Item>Ascent: {props.hike.ascent}m</ListGroup.Item>
          <ListGroup.Item>Difficulty: {props.hike.difficulty}</ListGroup.Item>
          <ListGroup.Item>Start point: {props.hike.start_point_address}</ListGroup.Item>
          <ListGroup.Item>End point: {props.hike.end_point_address}</ListGroup.Item>
          {isHiker || isHutWoker ?<ListGroup.Item>Condition: {props.hike.condition? props.hike.condition: 'Open'}</ListGroup.Item>:''}
        </ListGroup>
        <Card.Body>
          <Card.Text>
            <Button onClick={() => setModalDescriptionShow(true)}>Description</Button>
            {' '}
            {(isHiker && props.hike.file !== "NTF") ? <Button onClick={() => setModalMapShow(true)}>Display track</Button> : (isHiker) ? <Badge bg="secondary">No Track Available</Badge> : ''}
            {isLocalGuide && canModify ? <Button variant='warning' onClick={() => navigate('/localguide/edithike/' + props.hike.title)}>Edit</Button> : ''}
            {isHutWoker? <Button variant='warning' onClick={() => navigate('/hutworker/condition/' + props.hike.title)}>Update condition</Button>: ''}
            {' '}
            {isHiker? <Button variant="success" id={"start-"+props.hike.title.replaceAll(' ','') }
            onClick={() => setModalTime(true)}>Start</Button>: ''}
            
          </Card.Text>
        </Card.Body>
  
      </Card>
      <HikeModalDescription
        id={props.hike.id}
        show={modalDescriptionShow}
        visible={modalDescriptionShow}
        onHide={() => setModalDescriptionShow(false)}
        title={props.hike.title}
        description={props.hike.description}
        rpList={props.hike.rp}
        condition = {props.hike.condition}
        condition_description = {props.hike.condition_description}
        picture={props.hike.picture}
      />
      {isHiker ? <HikeModalTrack
        id={props.hike.id}
        show={modalMapShow}
        visible={modalMapShow}
        onHide={() => setModalMapShow(false)}
        title={props.hike.title}
        sp={[props.hike.start_point_lat, props.hike.start_point_lng]}
        ep={[props.hike.end_point_lat, props.hike.end_point_lng]}
        rpList={props.hike.rp}
      /> : ''}
      {isHiker ? <TimeModal
            
            type={"start"}
            show={modalTime}
            time={time}
            updateTime={setTime}
            onHide={() => setModalTime(false)}
            errorMessage={errorMessageTime}
            setErrorMessage={setErrorMessageTime}
            handleSubmit={handleSubmit}
            />:''}
      
    </>
    );
  }
  
  
  
  function HikeModalDescription(props) {
    const [image, setImage] = useState('')
    const token = localStorage.getItem("token")

    useEffect(() => {
      async function getImage(){
        const img = await API.getHikePicture(props.id, token)
        setImage(img)
      }
      if(props.visible && !image)
      getImage()
    },[props.visible])
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
        
        { image !== "" ? <img src={"data:image/png;base64,"+image}></img>: <TheSpinner/>}

          <h4 className="mt-3">Description</h4>
          <p>
            {props.description}
          </p>
          {props.rpList.length ? <h5>Reference Points</h5> : ''}
          <ul>
            {props.rpList.map((rp) =>
              <li>Address: {rp.reference_point_address} - Lan: {rp.reference_point_lat} - Lon: {rp.reference_point_lng}</li>
            )}
          </ul>
  
          {props.condition !== "Open" && props.condition?<>
          <h4>
            Condition description: </h4>
            <p>
            {props.condition_description}
              </p></>
          :''}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
  
  
  
  
  function HikeModalTrack(props) {
    const [file, setFile] = useState('')
    const [error, setError] = useState(false)
    const token = localStorage.getItem("token")
    
    useEffect(() => {
      async function getFile(){
      try{
        
        const track = await API.getHikeFile(props.id, token)
        if(track.err){
          setError(true)
          return
        }
        setFile(track)
        } catch(e){
        setError(true)
        } 
      }
      if(props.visible && !file){
        getFile()
      }
    },[props.visible])
  
  
    return (
      !error ?
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
            <h4>Track</h4>
            {file ? <Map rpList={props.rpList} sp={props.sp} ep={props.ep} gpxFile={file} /> : <TheSpinner/>}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={props.onHide}>Close</Button>
          </Modal.Footer>
        </Modal>
        :
  
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
            <h4>No track available</h4>
  
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={props.onHide}>Close</Button>
          </Modal.Footer>
        </Modal>
    )
  }
  
export default HikeCard
  