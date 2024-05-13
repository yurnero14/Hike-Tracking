import { Card, Form, Container, Button, Alert,Row } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import API from "../API";
import "../custom.css"

function RegistrationForm(props) {
    const [name, setName] = useState('')
    const [surname, setSurname] = useState('')
    const [phone, setPhone]  = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('Hiker')
    const [errorMessage, setErrorMessage] = useState('');
    const [message, setMessage] = useState('');
    const [huts, setHuts] = useState([])
    const [workingHut, setWorkingHut] = useState('-')
    const [validated, setValidated] = useState(false)
    const navigate = useNavigate();
    let token = localStorage.getItem("token")
    function validateEmail(input) {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return emailPattern.test(input);
    }

    const updatePhone = (number) =>{
        if(number.length>10) return
        if(!isNaN(number))
            setPhone(number)
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        setMessage('');
        setValidated(true)
        const credentials = { 
            name: name, 
            surname: surname,
            email: username,
            password: password,
            role: role, 
            working_hut: workingHut 
        };

        if (username.trim().length === 0 || password.trim().length === 0 
        || phone.length===0 || name.length===0 || surname.length === 0) {
            setErrorMessage('Please fill all the fields')
        }
        else if (!validateEmail(username)) {
            setErrorMessage('Invalid e-mail, please type a correct e-mail.')
        } else if(role === "Hut Worker" && workingHut==="-"){
            setErrorMessage("Please select the hut where you are working.")
        } else if (phone.length != 10)
            setErrorMessage("Insert a valid phone number")
        else {
            try {
                let result = await API.signin(credentials)
                if (result.error) {
                    setErrorMessage(result.msg)
                } else {
                    //setUsername('')
                    //setPassword('')
                    //This meesage does not mean error,just used this function to transfer message
                    setMessage("Please confirm your email address to complete the registration")
                }
            }
            catch (e) {
                setErrorMessage(e)
            }

        }
    };

    useEffect(() => {
        async function getHuts() {
            const huts = (await API.getAllHuts(token)).msg
            setHuts(huts)
        }
        getHuts()
    },[])
    return (
        <Container >
            <Card body className = "m-4">
            <Row className='justify-content-center '>
                <h4 className='text-center'>Register Yourself: Let's Get Started!</h4>
                {errorMessage ? <Alert variant='danger' onClose={() => setErrorMessage('')} dismissible >{errorMessage}</Alert> : false}
                    {message ? <Alert onClose={() => setMessage('')} dismissible >{message}</Alert> : false}
                    
                <Form className="" onSubmit={handleSubmit}>
                    <Form.Group className="mb-2" controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control required type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}  isInvalid={name.length === 0 && validated}/>
                    </Form.Group>
                    <Form.Group className="mb-2" controlId="surname">
                        <Form.Label>Surname</Form.Label>
                        <Form.Control required type="text" placeholder="Surname" value={surname} onChange={(e) => setSurname(e.target.value)} isInvalid={surname.length === 0 && validated}/>
                    </Form.Group>
                    <Form.Group className="mb-2" controlId="email">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control required type="text" placeholder="Email" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-2" controlId="phone">
                        <Form.Label>Phone number</Form.Label>
                        <Form.Control required type="text" placeholder="Phone number" value={phone} onChange={(e) => updatePhone(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-2" controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control required type="password" placeholder="Choose Your Password" value={password} onChange={(e) => setPassword(e.target.value)} isInvalid={password.length===0 && validated}/>
                    </Form.Group>
                    <Form.Group className="mb-2" controlId="role">
                        <Form.Label>Choose Your Role</Form.Label>
                        <Form.Select  value={role} onChange={e => setRole(e.target.value)}>
                            <option value="Hiker">Hiker</option>
                            <option value="Local Guide">Local Guide</option>
                            <option value="Hut Worker">Hut Worker</option>
                        </Form.Select>
                    </Form.Group>
                    {role==="Hut Worker"?<Form.Group className="mb-2" controlId="hut">
                        <Form.Label>Choose your Hut</Form.Label>
                        <Form.Select isInvalid={role === "Hut Worker" && workingHut==="-" && validated}value={workingHut} onChange={e => setWorkingHut(e.target.value)}>
                            <option value="-">-</option>
                            {huts.map((h) => <option value={h.name}>{h.name}</option>)}
                        </Form.Select>
                    </Form.Group>:''}
                    
                    <Form.Group>
                        <div align = "center"> 
                        <Button id="btnReg" type="submit" variant="success" >Register</Button>
                        &nbsp; &nbsp;
                        <Button id="btnBack" variant="danger" onClick={() => navigate(`/`)}>Go back</Button>
                        </div>
                    </Form.Group>
                </Form>
            </Row>
            </Card>

        </Container>
    )
}

export default RegistrationForm
