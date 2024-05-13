import { Spinner, Container } from "react-bootstrap";

function TheSpinner(props){
    return(
        <Container className="d-flex justify-content-center" >
            <Spinner animation="border" role="status" style={{ width: "4rem", height: "4rem" }}/>
        </Container>
    )
}

export default TheSpinner