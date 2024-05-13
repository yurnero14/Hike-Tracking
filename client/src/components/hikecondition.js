import { useEffect, useState } from "react"
import { Form,Card, Button } from "react-bootstrap"
import API from "../API"
import { useNavigate, useParams } from "react-router-dom";


function HikeCondition(props){
    const {hiketitle} = useParams()
    const [hike, setHike] = useState()
    const [title, setTitle] = useState()
    const [condition, setCondition] = useState()
    const [desc, setDesc] = useState()
    const navigate = useNavigate()
    const [_, setErrorMessage] = useState('')
    let token = localStorage.getItem("token")

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        
        let cond = {
          'hike_id': hike.id,
          'condition': condition,
          'condition_description': desc
        }
    
        let req = await API.updateCondition(cond, token)
        if (req.error) {
          setErrorMessage(req.msg)
        } else {
            props.updateDirty()
          navigate('/hutworker')
        }
    
      }
    
    useEffect(() => {
        async function getHike(){
            const h = (await API.getHike(hiketitle, token)).hike
            setHike(h)
            setTitle(h.title)
            setCondition(h.condition)
            setDesc(h.condition_description)
        }
        
        getHike()
    },
    [hiketitle, token])

    return(
        
    <Card body>
        <Form>
            <Form.Group className="mb-2" controlId="title">
            <Form.Label>Hike</Form.Label>
            <Form.Control disabled type="text" placeholder="Enter title" value={title}/>
            </Form.Group>
            <Form.Group className="mb-2" controlId="condition">
            <Form.Label>Condition</Form.Label>
                <Form.Select value={condition} onChange={e => setCondition(e.target.value)}>
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                    <option value="Partly blocked">Partly blocked</option>
                    <option value="Requires special gear">Requires special gear</option>
                </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2"  controlId="description">
                <Form.Label>Condition description</Form.Label>
                <Form.Control as="textarea" rows={2} value={desc} onChange={e => setDesc(e.target.value)} />
            </Form.Group>
            <Button variant="warning" type="submit" onClick={handleSubmit}>
                Modify
            </Button>
        </Form>
    </Card>
    )
}

export default HikeCondition