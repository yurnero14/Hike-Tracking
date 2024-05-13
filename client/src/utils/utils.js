import { Col, Row } from "react-bootstrap"
import dayjs from "dayjs"
function createRows(objects, cards){
  const nCol = cards.length
  let rows = []
  for (let i = 0; i < Math.ceil(objects.length); i++) {
    let cols = []
    let j
    for (j = 0; j < nCol && cards.length; j++) {
      cols.push(cards.pop())
    }
    
    if(cols.length)
      rows.push(<Row xl={3} sm={2} xs={1}  className='px-0' key={i}>{cols}</Row>)
  }
  
  return rows
}

function updateActive(idx, relocation, lengthOption, setActive, navigate) {
    let active = []
    for(let i = 0; i < lengthOption; i++){
      if(i === idx){
        active.push(true)
      }
      else {
        active.push(false)
      }
    }
    setActive(active)
    navigate(relocation)
}



function adjustRecord(record){

  const logs = record.logs
  let h = record.hike 
  
  logs.forEach((r) => {
    if(r.point_id === h.start_point_id)
      h.start_point_datetime = dayjs(r.datetime, "YYYY-MM-DDTHH:mm:ss")
    if(r.point_id === h.end_point_id)
    h.end_point_datetime = dayjs(r.datetime, "YYYY-MM-DDTHH:mm:ss")
  })
  let lastDt = ""
  const rp = []
  for(let i = 0; i < h.rp.length; i++){
    let flag = logs.some((r) => {
      const dt = dayjs(r.datetime, "YYYY-MM-DDTHH:mm:ss")
      if(i === 0){
        if(!lastDt)
          lastDt = dt
        else{
          lastDt = lastDt.isBefore(dt)? dt : lastDt
        }
      }
      if(r.point_id===h.rp[i].reference_point_id){
        h.rp[i].datetime = dayjs(r.datetime, "YYYY-MM-DDTHH:mm:ss")
      }
      return r.point_id===h.rp[i].reference_point_id
    })
    h.rp[i].reached = flag
    rp.push(h.rp[i])
  }
  return [h, rp, lastDt]

}

function adjustAllRecords(records){
  return records.map((record) =>{
    const res =  UTILS.adjustRecord(record)
      return {
        hike: res[0],
        rp: res[1],
      }
    })
}

const UTILS = {createRows, updateActive, adjustRecord, adjustAllRecords}
export default UTILS