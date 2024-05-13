import { SvgIcon } from '@mui/material';
import { Landscape  } from '@mui/icons-material'
import {Navbar, Container, Nav, Button} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function MyNavbar2(props){
      return ( props.loggedIn ? <NavLogout logout={props.logout} userPower={props.userPower}/> : <NavLogin login={props.login} signIn={props.signIn}/>);

  function NavLogin(props){
    const navigate = useNavigate();

    return(
    <Navbar  bg="success" variant="dark">
        <Container fluid>
             <Nav   className="d-flex justify-content-between w-100">
              <Navbar.Brand  onClick={() => navigate("/")}>
                <SvgIcon sx={{ fontSize: 30 }}component={Landscape}/>
                {' '}Hike Adventures
              </Navbar.Brand> 
              <Nav.Item className="navbar-brand">
                <Button id="login" onClick={()=> props.login()} as="input" type="button" value="Login" variant='dark' size='sm'/>{' '}   
                <Button onClick={()=> props.signIn()} as="input" type="button" value="Sign Up" variant='dark' size='sm'/>{' '}
              </Nav.Item>
            </Nav>   
        </Container>
      </Navbar>
    )
  }

  function NavLogout(props){
    const navigate = useNavigate();

    return(
    <Navbar  bg="success" variant="dark">
        <Container fluid>
             <Nav   className="d-flex justify-content-between w-100">
              <Navbar.Brand onClick={() => navigate("/")}>
                <SvgIcon sx={{ fontSize: 30 }}component={Landscape}/>
                {' '}Hike Adventures
              </Navbar.Brand> 
              <Nav.Item className="navbar-brand">
                <Button onClick={()=> props.logout()} as="input" type="button" value="Logout" variant='danger' size='sm'/>{' '}   
                
              </Nav.Item>
            </Nav>   
        </Container>
      </Navbar>
    )
  }
  
}

export default MyNavbar2;