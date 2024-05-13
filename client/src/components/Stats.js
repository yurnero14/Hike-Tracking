import {  Col, Toast} from 'react-bootstrap';
import dayjs from 'dayjs';
function Stats(props){
    return (
        showStats(props.stat)
    );
}

function showStats(Stats){
    if (Object.keys(Stats).length === 0 ) {
        return<h1>No available Stats</h1>
      }
      else {
    return displayStats(Stats)
}

}

function displayObj(obj){
  if (obj.time)
     return obj.title + ", " + obj.time
   else if (obj.length)
     return obj.title + ", " + obj.length
   else if (obj.altitude)
     return obj.title + ", " + obj.altitude
   else 
     return obj.title + ", " + obj.ascent
}


function displayStats(stats){
  console.log(stats)
  return (
    Object.entries(stats).map( (entry, idx) => {
      return (
        <Col className="pb-4 px-0" key={idx}>
        <Toast style={{ width: '22rem' }}>
            <Toast.Header  closeButton={false}> {entry[0]} </Toast.Header>
            <Toast.Body>
              { typeof entry[1] !== 'object' ? entry[1] : displayObj(entry[1]) }
            </Toast.Body>
        </Toast>
        </Col>
      )
    })
  )
}







export default Stats;