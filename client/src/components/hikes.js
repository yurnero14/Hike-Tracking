import Button from 'react-bootstrap/Button';

import {  Row, Col,  Container } from 'react-bootstrap';
import HikeCard from './hikecard';
import UTILS from '../utils/utils';
import TheSpinner from './spinner';

function displayHikesUtil(hikes, userPower, filtered, setFiltered, userId, updateDirty) {
  let hikescard = hikes.map((h, idx) =>
    <Col  className="pb-4 px-0" key={idx}>
      <HikeCard userId={userId} userPower={userPower} hike={h} updateDirty={updateDirty} />
    </Col>)
  let rows = UTILS.createRows(hikes, hikescard)
  return (
    <>
      <Container>
        <Row>
          <Col xs={10}>
            { filtered ? <h1>Filtered Hikes</h1> : <h1>All Hikes</h1> }
          </Col>
          <Col xs={2}>
            { filtered ? <Button variant='secondary' onClick={()=> {
              setFiltered(false)
              window.location.reload(false);
            }}>Reset Filters</Button> : ''}
          </Col>
        </Row>
      </Container>
      
        {rows}
      
    </>
  )
}


function Hikes(props) {
  if (props.hikes.length === 0) {
    return (
      !props.loading?
      <Container>
      <Row>
        <Col xs={10}>
          <h1>No available hikes</h1>
        </Col>
        <Col xs={2}>
          { props.filtered ? <Button variant='secondary' onClick={()=> {
            props.setFiltered(false)
            window.location.reload(false);
          }}>Reset Filters</Button> : ''}
        </Col>
      </Row>
    </Container>:
    
    <>{ props.filtered ? <h1>Filtered Hikes</h1> : <h1>All Hikes</h1> }
    <TheSpinner/>
    </>  
    )
  }
  else {
    return displayHikesUtil(props.hikes, props.userPower, props.filtered, props.setFiltered, props.userId,props.updateDirty)
  }

}






export default Hikes


