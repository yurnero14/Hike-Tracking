import { Modal, Button,Alert, Row } from "react-bootstrap"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { TextField } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
function TimeModal(props){
    let button = ""
    if(props.type === "reference"){
        button = <Button id="confirmUpdate" onClick={async(e) => {
            if(await props.handleSubmit(e))
            props.onHide();

        }}>Update Position</Button>
    }
    else if(props.type === "end"){
        button = <Button id="confirmEnd" variant = "danger" onClick={async (e) => {
            if(await props.handleSubmit(e)){
            props.onHide();
            }

        }}>Terminate Hike</Button>
    }
    else {
        button = <Button  variant="success" id="confirmStart" onClick={async (e) => {
            if(await props.handleSubmit(e))
            props.onHide()
            
        }}>Start Hike</Button>
    }
    return (
         
            <Modal
              {...props}
              size="lg"
              aria-labelledby="contained-modal-title-vcenter"
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Do you want to adjust the time?
                </Modal.Title>
                
              </Modal.Header>
              <Modal.Body className="" id="datetimePicker">
              {props.errorMessage ? <Alert id="error" variant='danger' className="mt-2" onClose={() =>{ props.setErrorMessage('')}} dismissible >{props.errorMessage}</Alert> : ''}
              <Row>
                <div align="center">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                inputFormat="DD/MM/YYYY HH:mm"
                renderInput={(props) => <TextField {...props} />}
                label=""
                value={props.time}
                onChange={(newValue) => {
                props.updateTime(newValue);
            }}
            />
           
            </LocalizationProvider>
            </div>
            </Row>
              </Modal.Body>
              <Modal.Footer>
                {button}
              </Modal.Footer>
            </Modal>
    )
}

export default TimeModal