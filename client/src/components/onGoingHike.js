import { useEffect,useState } from "react"
import { Card, Button, Form, Alert, Row, Col } from "react-bootstrap"
import MapRecord from "./MapRecord"
import dayjs from 'dayjs';
import API from "../API"
import { useNavigate } from "react-router-dom";

import UTILS from "../utils/utils";
import TimeModal from "./timeModal";
import TheSpinner from "./spinner";


function OnGoingHike(props){
    const [no, setNo] = useState("loading")
    const [hike, setHike] = useState({})
    const [fileMap, setFileMap] = useState('')
    const [title, setTitle] = useState('')
    const [rpList, setRpList] = useState([])
    const [sp, setSp] = useState({})
    const [ep, setEp] = useState({})
    const [curr, setCurr] = useState("-")
    const [time, setTime] =useState(dayjs())
    const [errorMessage, setErrorMessage] = useState('')
    const [errorMessageModal, setErrorMessageModal] = useState('')
    const [errorMessageEndModal, setErrorMessageEndModal] = useState('')
    const [successMessage, setSuccessMessage] =useState('')
    const [reachedPoints, setReacheadPoints] = useState([])
    const [last, setLast] = useState("")
    const [modal, setModalShow] = useState(false);
    const [modalEnd, setModalEndShow] = useState(false)
    const [showAlerts, setShowAlerts] = useState(false)
    const token = localStorage.getItem("token")
    const navigate = useNavigate()

    const alertsConditions = props.alerts.map((a) => {
      return a.condition
    })
    const updateRpList = (orderedRpList) => {
      let reversed = orderedRpList.reverse()
      let reachFlag = false
      setRpList(reversed.map((h,idx) => {
        if(h.reached)
          reachFlag = true
        h.reached = reachFlag
        return h
      }).reverse())
    }

    const showModal = () => {
      if(curr==="-"){
        setErrorMessage("Please select a reference point")
        return
      }
      setModalShow(true)
    }
    const  handleSubmit = async (e) => {
      e.preventDefault()
      if(curr==="-"){
        setErrorMessageModal("Please select a reference point")
        return false
      }
      if(!dayjs(time).isValid()){
        setErrorMessageModal("Please insert a valid datetime")
        return false
      }
      if(time.isBefore(last) || time.isSame(last)){
        setErrorMessageModal("The last point was reached at " + last.format("HH:mm on DD/MM/YYYY") + ". Please insert a valid datetime")
        return false
      }
      const index = rpList.findIndex((rp) => rp.reference_point_address === curr)
      rpList[index].datetime = time
      const point = rpList[index]
      const body = {
        state: 'reference',
        point : point, 
        datetime: time.format('MM/DD/YYYY HH:mm:ss'),
        
      }
      
    
      try {
        const resp = await API.postReachedReferencePoint(body, token)
        if(resp.error)
          setErrorMessage(resp.msg)
        else{
          updateRpList(rpList.map((r,idx)=> {
            if(idx === index)
              r.reached = true
            return r
          }))
          setCurr("-")
          setSuccessMessage("Your position has been updated")
          return true
        }
    } catch(e){

      setErrorMessage("Something went wrong. Please try later")
      return false
    }
  }

  const handleTerminate = async (e) => {
    e.preventDefault()
    if(!dayjs(time).isValid()){
      setErrorMessageEndModal("Please select a valid datetime")
      return false
    }
    if(time.isBefore(last) || time.isSame(last)){
      setErrorMessageEndModal("The last point was reached at " + last.format("HH:mm on DD/MM/YYYY") + ". Please insert a valid datetime")
      return false
    }
    try {
      const body = {
        state: 'end',
        datetime: time.format('MM/DD/YYYY HH:mm:ss'),
      }
      const resp = await API.postTerminatedHike(body, token)
      if(resp.error){
          setErrorMessage(resp.msg)
          return false
      }
        else{
          props.updateDirty()
          navigate("/hiker/records")
          return true
      }
    }
      catch(e){
        setErrorMessage("Something went wrong. Please try later")
        return true
      } 
  }
    useEffect(() => {
      async function getHike() {
        try {
        const currentHike = await API.getCurrentHike(token)   
        if(!currentHike.error) {
          setNo("loaded")
          const res =  UTILS.adjustRecord(currentHike.msg)
          const h = res[0]
          const rp = res[1]
          const lastDt = res[2]

          setHike(h)
          setTitle(h.title)
          setLast(lastDt)
          setSp({
            lat: h.start_point_lat,
            lng: h.start_point_lng,
            addr: h.start_point_address,
            datetime: h.start_point_datetime
          })

          setEp({
            lat: h.end_point_lat,
            lng: h.end_point_lng,
            addr: h.end_point_address,
            datetime: h.end_point_datetime
          })
          setRpList(rp)
          setReacheadPoints(h.reached)
          let file = await API.getHikeFile(h.id, token)
          setFileMap(file)
        } 
      else {
          console.log("okk")
          setNo("")
      }
      }catch(e){
        setErrorMessage("Something went wrong ")
      }
        
      }
      getHike()
    },[])

    
    const updateTime = (curr) => {
      
      if(!(curr instanceof String))
        setTime(curr)
      else{
        setTime(dayjs(curr,"MM/DD/YYYY hh:mm A"))
      }
      
    }
    return (
      <>
      {!no ? <h2>There isn't an ongoing hike</h2>
      : ( no === "loading" ? <TheSpinner/> : 
      <><h1>Current Hike</h1>
      <Card>
      <Card.Body>
          <Card.Title><h4>{title}</h4></Card.Title>
          {fileMap? <MapRecord  showAlerts={showAlerts} alerts={props.alerts} className="mb-4" gpxFile={fileMap} rpList={rpList} setRpList={updateRpList} sp={sp} ep={ep} curr={curr} setCurr={setCurr}/> : <TheSpinner/>}
          {props.alerts.length? <div className="mt-3 text-danger">Weather conditions: {alertsConditions.join(', ') +'.'}</div>:''}
          {showAlerts !== undefined && props.alerts.length?(<><Button className="mt-3" id="showAlerts" variant="warning" onClick={() => {setShowAlerts(!showAlerts)}}>{!showAlerts?'Display alerts':'Hide alerts'}</Button>{' '}</>):''}
          <Form className="my-4">
            <Form.Group className="mb-2" controlId="position">
            <Form.Label>Track your position</Form.Label>
            <Form.Select id="referencePoints" value={curr} onChange={e => setCurr(e.target.value)}>
              <option value ="-" key="-">-</option>
              {rpList.filter((r) => !r.reached)
              .map((r,idx) => <option value={r.reference_point_address} key={r.reference_point_address}>{r.reference_point_address}</option>)}
            </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2" controlId="datetime">
            
            {errorMessage ? <Alert variant='danger' className="mt-2" onClose={() => setErrorMessage('')} dismissible >{errorMessage}</Alert> : ''}
            {successMessage ? <Alert id="success" variant='success' className="mt-2" onClose={() => setSuccessMessage('')} dismissible >{successMessage}</Alert> : ''}
            </Form.Group>
            <Row xs={1} auto>
              <Col sm={2} className="mb-2" >
                <Button id="updatePosition" onClick={() => showModal()}>Update Position</Button> {' '}
              </Col>
              <Col sm={2}>
                <Button id="endHike" variant="danger" onClick={() => setModalEndShow(true)}>Terminate the hike</Button>
              </Col>

            </Row>
            
            <TimeModal
            type={"reference"}
            show={modal}
            time={time}
            updateTime={updateTime}
            onHide={() => setModalShow(false)}
            errorMessage={errorMessageModal}
            setErrorMessage={setErrorMessageModal}
            handleSubmit={handleSubmit}
            />
            <TimeModal
            type={"end"}
            show={modalEnd}
            time={time}
            updateTime={updateTime}
            onHide={() => setModalEndShow(false)}
            errorMessage={errorMessageEndModal}
            setErrorMessage={setErrorMessageEndModal}
            handleSubmit={handleTerminate}
            />

          </Form>
      </Card.Body>
    </Card></>)}
    </>
    )
}




export default OnGoingHike