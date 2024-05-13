import Sidebar from './sidebar';
import { Routes, Route } from 'react-router-dom';
import HikeForm from './hikeform';
import { Col, Row } from 'react-bootstrap';
import HutForm from './hutform';
import ParkingLotForm from './parkinglotform';
import API from '../API';
import { useState, useEffect } from 'react';
import Hikes from './hikes';
import Huts from './huts';
import ParkingLots from './parkinglots';

function LocalGuide(props){
  const [hikes, setHikes] = useState([]);
  const [loadingHikes, setLoadingHikes] = useState(true)
  const [huts, setHuts] = useState([]);
  const [parkinglots, setParkingLots] = useState([])
  const [_, setErrorMessage] = useState('')
  const [dirty, setDirty] = useState(false)
  let token = localStorage.getItem("token");
  
  const updateDirty = () => {
    const flag = dirty
    setDirty(!flag)
  }

  useEffect(() => {
    const getHikes = async () => {
      try {
        const hikes = await API.getAllHikes(token);
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
  }, [dirty,token]);

  
  

  useEffect(() => {
    const getHuts = async () => {
      try {
        const huts = await API.getAllHuts(token);
        if (huts.error)
          setErrorMessage(huts.msg)
        else{
          setHuts(huts.msg);
        }
      } catch (err) {
        console.log(err)
      }
    }
    getHuts()
  }, [dirty,token]);
  
    
    
    
    useEffect(() => {
      const getParkingLots = async () => {
        
        try {
          const plots = await API.getAllParkingLots(token);
          if (plots.error)
            setErrorMessage(plots.msg)
          else
            setParkingLots(plots.msg);
        } catch (err) {
          console.log(err)
        }
      }
      getParkingLots()
    }, [dirty, token]);

    return(
    <>
    <Sidebar userPower={"localguide"}/>
    <Col sm={10} className="py-1">
    <Row className="p-4">
    <Routes>
        <Route path="edithike/:hiketitle" element={<HikeForm updateDirty={updateDirty}/>}/>
        <Route path="addhike" element={<HikeForm updateDirty={updateDirty}/>}/>
        <Route path="addhut" element={<HutForm updateDirty={updateDirty}/>}/>
        <Route path="addparkinglot" element={<ParkingLotForm updateDirty={updateDirty}/>}/>
        <Route path="*" element={<Hikes loading={loadingHikes} userId={props.userId} userPower={props.userPower} hikes={hikes} />}/>
        <Route path="huts" element={<Huts huts={huts}/>}/>
        <Route path="parkinglots" element={<ParkingLots parkinglots={parkinglots} applyFilter={() => {}}/>}/>
    </Routes>
    </Row>
    </Col>
    </>
    )
}

export default LocalGuide