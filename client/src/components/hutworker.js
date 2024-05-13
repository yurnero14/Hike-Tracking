import Sidebar from './sidebar';
import { Routes, Route } from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';
import API from '../API';
import { useState, useEffect } from 'react';
import Hikes from './hikes';
import HikeCondition from './hikecondition';


function HutWorker(props) {
  const [hikes, setHikes] = useState([]);
  const [loadingHikes, setLoadingHikes] =  useState(true)
  const [dirty, setDirty] = useState(false)
  const [_, setErrorMessage] = useState('')
  let token = localStorage.getItem("token");

  const updateDirty = () => {
    const flag = dirty
    setDirty(!flag)
  }

  useEffect(() => {
    const getHikes = async () => {
      try {
        const hikes = await API.getHutWorkerHikes(token);
        if (hikes.err){
          setErrorMessage(hikes.msg)
          setLoadingHikes(false)
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
  }, [dirty, token]);


  return (
    <>
      <Sidebar userPower={"hutworker"} />
      <Col sm={10} className="py-1">
        <Row className="p-4">
          <Routes>
            <Route path="condition/:hiketitle" element={<HikeCondition updateDirty={updateDirty}/>} />
            <Route path="*" element={<Hikes loading={loadingHikes} userPower={props.userPower} hikes={hikes} />} />
          </Routes>
        </Row>
      </Col>
    </>
  )
}

export default HutWorker