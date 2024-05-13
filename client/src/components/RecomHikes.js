
import {  Row, Col, Container } from 'react-bootstrap';

import UTILS from '../utils/utils';
import HikeCard from './hikecard';


function displayRecommendedHikesUtil(hikes, userPower) {
  let hikescard = hikes.map((h, idx) =>
    <Col className="pb-4 px-0" key={idx}>
      <HikeCard userPower={userPower} hike={h} />
    </Col>)
  let rows = UTILS.createRows(hikes, hikescard)
  return (
    <Container>
    <Row>
        <h1>Recommended Hikes</h1>
      <Col>
        {rows}
      </Col>
    </Row>
  </Container>
  )
}


function RecommendedHikes(props) {
  if (props.recommendedhikes.length === 0) {
    return <h1>No available hikes</h1>
  }
  else {
    return displayRecommendedHikesUtil(props.recommendedhikes, props.userPower)
  }

}





export default RecommendedHikes


