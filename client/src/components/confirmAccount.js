import { Col, Card, ListGroup, Button, Alert } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import API from '../API';

function ConfirmAccount(props) {
  const [accounts, setAccounts] = useState([])
  const [errorMessage, setErrorMessage] = useState("")
  let token = localStorage.getItem("token");

  useEffect(() => {
    const getAccounts = async function () {
      let req = await API.getAccountsToValidate(token)
      if (req.error) {
        setErrorMessage(req.msg)
      } else {
        if (req.msg.users.length > 0)
          setAccounts(req.msg.users)
        else
          setAccounts([])
      }
    }

    getAccounts()
  }, [token])


  if (accounts.length === 0) {
    return <h1>No available requests</h1>
  } else return (
    accounts.map((a, i) => {
      return (
        <>
        { errorMessage ? <Alert dismissible onClick={()=>setErrorMessage('')} variant='danger'>cdcndn</Alert> : ''}
        <Col className="pb-4 px-0" key={i}>
          <UserCard setErrorMessage={setErrorMessage} setAccounts={setAccounts} mail={a.email} role={a.role} id={a.id}/>
        </Col>
        </>
      )
    })
  )
}


function UserCard(props) {
  const mail = props.mail
  const role = props.role
  let token = localStorage.getItem("token");

  async function activate(id){
    let params = { "user_id" : id }
    let req = await API.activateAccount(params, token)
      if (req.error) {
        props.setErrorMessage(req.msg)
      } else {
        props.setAccounts( (accounts) => accounts.filter( (a) => a.id !== id))
      }
  }

  return (
    <>
      <Card style={{ width: '22rem' }} key={0}>
        <ListGroup className="list-group-flush">
          <ListGroup.Item>Mail: {mail}</ListGroup.Item>
          <ListGroup.Item>Role Request: {role}</ListGroup.Item>
        </ListGroup>
        <Card.Body>
          <Button variant="success" onClick={()=>activate(props.id)}>Approve</Button> {' '}
          {/*<Button variant="danger" onClick={() =>result(false,props.postRequest,props.setMail, props.setFinal, mail,role,props.setRole)}>Do not approve</Button>*/}
        </Card.Body>
      </Card>
    </>
  );
}

export default ConfirmAccount;