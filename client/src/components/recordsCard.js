/*
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card,ListGroup, Button,Modal, Badge, Spinner } from "react-bootstrap";
import TimeModal from "./timeModal";
import dayjs from "dayjs";
import API from "../API";
import TheSpinner from "./spinner";
import MRecord from "./mRecord";
import UTILS from "../utils/utils";
/// tramite props passo il file
function RecordCard(props) {
    
    const [modalMapShow, setModalMapShow] = useState(false);
    const [modalTime, setModalTime] = useState(false)
    const [time, setTime] = useState(dayjs())
    const [errorMessageTime, setErrorMessageTime] = useState('')
    
    const navigate = useNavigate()
    const handleSubmit = async(e) => {
      e.preventDefault()
    }
    
console.log(props.hike.hike)
    let dataInizio=props.hike.hike.start_point_datetime.split("T")[0]
    let oraInizio=props.hike.hike.start_point_datetime.split("T")[1].split("Z")
    
    let oraFine=props.hike.hike.end_point_datetime.split("T")[1].split("Z")
    
  
    
    
    
    return (<>
      <Card style={{ width: '21rem' }} key={0} title={props.hike.hike.title}>
        <Card.Body>
          <Card.Title>{props.hike.hike.title}</Card.Title>
          <h6>Starting Date: {dataInizio} </h6>
  
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroup.Item>Starting Time: {oraInizio} min</ListGroup.Item>
          <ListGroup.Item>Ending Time: {oraFine} min</ListGroup.Item>
          <ListGroup.Item>Length: {props.hike.hike.length}km</ListGroup.Item>
          <ListGroup.Item>Ascent: {props.hike.hike.ascent}m</ListGroup.Item>
          <ListGroup.Item>Difficulty: {props.hike.hike.difficulty}</ListGroup.Item>
        </ListGroup>
        <Card.Body>
        
        <Button onClick={() => setModalMapShow(true)}>Display track</Button>
        
        </Card.Body>
      </Card>
      <HikeModalTrack
        id={props.hike.hike.id}
        show={modalMapShow}
        visible={modalMapShow}
        onHide={() => setModalMapShow(false)}
        title={props.hike.hike.title}
        sp={{
          lat: props.hike.hike.start_point_lat,
          lng: props.hike.hike.start_point_lng
        }}
        ep={{
          lat: props.hike.hike.end_point_lat, 
          lng: props.hike.hike.end_point_lng
        }}
        rpList={props.hike.hike.rp}
        oraFine={oraFine}
        oraInizio={oraInizio}
      /> 
      <TimeModal
            type={"start"}
            show={modalTime}
            time={time}Map
            updateTime={setTime}
            onHide={() => setModalTime(false)}
            errorMessage={errorMessageTime}
            setErrorMessage={setErrorMessageTime}
            handleSubmit={handleSubmit}
            />
    </>
    );
  } 
  
  
  
  function HikeModalTrack(props) {
    let [file, setFile] = useState('')
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
      if(!file){
        getFile()
      }
    },[file])
    
    return (
      !props.error ?
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
            {file ? <MRecord rpList={props.rpList} sp={props.sp} ep={props.ep} gpxFile={file} spTime={props.oraInizio} epTime={props.oraFine}/> : <TheSpinner/>}
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



export default RecordCard
*/