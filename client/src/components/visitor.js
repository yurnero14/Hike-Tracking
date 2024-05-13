import { Row, Col, Modal, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import API from '../API';
import FilterFormHikes from './filterformhikes';
import Sidebar from './sidebar';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Hikes from './hikes';
import FilterFormHuts from './filterformhuts';
import Huts from './huts';
import ParkingLots from './parkinglots';
import Preferences from './preferences';
import RecommendedHikes from './RecomHikes';
import OnGoingHike from './onGoingHike';
import WeatherHikeAlert from './hikeAlert';
import Records from './records';
import Stats from './Stats';

function VisitorPage(props) {
  const [hikes, setHikes] = useState([]);
  const [huts, setHuts] = useState([]);
  const [parkinglots, setParkingLots] = useState([])
  const [recommendedhikes, setRecommendedhikes] = useState([])
  const [filtered, setFiltered] = useState(false)
  const [hikesAlert, setHikesAlert] = useState([])
  const [_, setErrorMessage] = useState('')
  const [dirty, setDirty] = useState(false)
  const [show, setShow] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [records, setRecords] = useState([])
  const [stat, setStat] = useState({})
  const [loadingHikes, setLoadingHikes] = useState(true)
  let navigate = useNavigate();
  let token = localStorage.getItem("token");

  const updateDirty = () => {
    const flag = dirty
    setDirty(!flag)
  }

  useEffect(() => {
    const getHikes = async () => {
      try {
        const hikes = await API.getAllHikes(token, null, props.userPower);
        if (hikes.error){
          setLoadingHikes(false)
          setErrorMessage(hikes.msg)
        }
        else{
          setLoadingHikes(false)
          setHikes(hikes.msg);
        }
      } catch (err) {
        console.log(err)
      }
    }
    getHikes()
  }, [props.userPower, token]);


  const applyFilterHikes = (filter) => {
    async function getFilteredHikes() {
      try {
        const filteredHikes = await API.getAllHikes(token, filter, props.userPower)
        if (hikes.error){
          setLoadingHikes(false)
          setErrorMessage(filteredHikes.msg)
        }
        else{
          setLoadingHikes(false)
          setHikes(filteredHikes.msg);
        }
      } catch (err) {
        console.log(err)
      }
    }
    getFilteredHikes()
  }

  useEffect(() => {
    const getHuts = async () => {
      try {
        const huts = await API.getAllHuts(token);
        if (huts.error)
          setErrorMessage(huts.msg)
        else
          setHuts(huts.msg);
      } catch (err) {
        console.log(err)
      }

    }
    getHuts()
  }, [props.userPower, token]);

  useEffect(() => {
    const getParkingLots = async function () {
      let req = await API.getAllParkingLots(token)
      if (req.error) {
        setErrorMessage(req.msg)
      } else {
        setParkingLots(req.msg)
      }
    }

    getParkingLots()
  }, [props.userPower, token])


  const applyFilterHuts = (filter) => {
    async function getFilteredHuts() {
      try {
        const filteredHuts = await API.getAllHuts(token, filter)
        if (filteredHuts.error)
          setErrorMessage(filteredHuts.msg)
        else
          setHuts(filteredHuts.msg);
      } catch (err) {
        console.log(err)
      }
    }
    getFilteredHuts()
  }





  // create a function and use effect and use preferences in existing api of filtering hikes but mapping dekhni parhni 


  useEffect(() => {
    const getRecommendedHikes = async () => {
      try {
        const r_hikes = await API.getRecommendedHikes(token)
        if (r_hikes.error)
          setErrorMessage(r_hikes.msg)
        else
          setRecommendedhikes(r_hikes.msg);
      } catch (err) {
        console.log(err)
      }
    }
    if (props.userPower === 'hiker')
      getRecommendedHikes()
  }, [props.userPower, token, dirty])


  useEffect(() => {
    const getRecords = async() => {
      try {
        const records = await API.getCompletedHikes(token)
        if(records.error)
          setErrorMessage(records.msg)
        else
          setRecords(records.msg)
      } catch(err){
        console.log(err)
      }
    }
    if (props.userPower === 'hiker')
      getRecords()
  },[props.userPower, token, dirty])

  useEffect(() => {
    const getHikeAlerts = async () => {
      try {
        const alerts = await API.getHikeAlerts(token)
        if (alerts.error)
          setErrorMessage(alerts.msg)
        else{
          setHikesAlert(alerts.msg);
          if (alerts.msg.length > 0){
            setAlertCount(alerts.msg.length)
            setShow(true)
          }
        }
          
      } catch (err) {
        console.log(err)
      }
    }
    if (props.userPower === 'hiker')
      getHikeAlerts()
  
  }, [props.userPower, token, dirty])

  useEffect(() => {
    const getPerformanceStats = async() =>{
      try{
        const stats = await API.getStatistics(token)
        if(stats.error)
          setErrorMessage(stats.msg)
          else
            setStat(stats.msg);
      } catch(err){
        console.log(err)
      }
    }
    if (props.userPower === 'hiker')
      getPerformanceStats()
   
   
  }, [props.userPower, token, dirty])
  //

  const handleClose = () => setShow(false);
 
  return (
    <>

      <Modal id="modalAlerts" show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Attention!</Modal.Title>
        </Modal.Header>
        <Modal.Body>You have {alertCount} new weather alerts about your ongoing hike!</Modal.Body>
        <Modal.Footer>
          <Button id="closeAlerts" variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={()=> {setShow(false); navigate('/weatherhikealert')}}>
            View
          </Button>
        </Modal.Footer>
      </Modal>

      <Sidebar userPower={props.userPower} />
      <Col sm={10} className="py-1">
        <Row className="p-4">
          <Routes>
            <Route path="*" element={<Hikes setFiltered={setFiltered} filtered={filtered} userPower={props.userPower} userId={props.userId} hikes={hikes} updateDirty={updateDirty} loading={loadingHikes}/>}/>
            <Route path="filterhikes" element={<FilterFormHikes  setFiltered={setFiltered} applyFilter={applyFilterHikes} setErrorMessage={setErrorMessage}/>}/>
            <Route path= "recommendedhikes" element ={<RecommendedHikes userPower={props.userPower} recommendedhikes={recommendedhikes}/>}/>
            <Route path="huts" element={<Huts huts={huts}/>}/>
            <Route path="filterhuts" element={<FilterFormHuts applyFilter={applyFilterHuts} setErrorMessage={setErrorMessage}/>}/> 
            <Route path="parkinglots" element={<ParkingLots parkinglots={parkinglots}/>}/>
            <Route path="records" element={<Records records={records} userPower={props.userPower}/>}/>
            <Route path="preferences" element={<Preferences updateDirty={updateDirty}/>}/>
            <Route path="ongoinghike" element={<OnGoingHike updateDirty={updateDirty} alerts={hikesAlert} />}/>
            <Route path= "weatherhikealert" element ={<WeatherHikeAlert userPower={props.userPower} alerts={hikesAlert}/>}/>     
            
            <Route path="parkinglots" element={<ParkingLots parkinglots={parkinglots} />} />
            {/*<Route path="profile" element={<Preferences profile={profile} setProfile={setProfile}/>}/>*/}
            
            <Route path= "performancestats" element ={<Stats userPower={props.userPower} stat={stat}/>}/>
          </Routes>
        </Row>
      </Col>
    </>
  )
}







export default VisitorPage


