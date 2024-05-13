import { ProSidebarProvider } from 'react-pro-sidebar';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { Hiking, HolidayVillage, LocalParking, ManageAccounts, Cloud, BarChart } from '@mui/icons-material'
import { Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import UTILS from '../utils/utils';
import { useLocation } from 'react-router-dom';
const colorBackgroundMenu = "#566400"

function MySidebar(props){
    let menu;
    const location = useLocation()    
    const route = location.pathname.split('/').pop()
    if(props.userPower === "hiker" || !props.userPower) {
        menu = <HikerMenu hiker={props.userPower === "hiker"} route={route}/>
    }
    else if (props.userPower === "localguide"){
        menu = <LocalGuideMenu route={route} />
    }
    else if(props.userPower==="platformmanager"){
      menu=<PlatformManagerMenu route={route}/>
    } else if(props.userPower === "hutworker"){
      menu = <HutWorkerMenu route={route}/>
    }
    return (
        <Col  sm={2} className="px-0  bg-success">
            <ProSidebarProvider >
                {menu}
            </ProSidebarProvider>
        </Col>
    );
}


function initFlagArray(length){
  let arr = []
  for(let i = 0; i < length; i++){
    arr.push(false)
  }
  return arr
}

function HikerMenu(props){
    const lengthOption = 6
    const [active, setActive] = useState(initFlagArray(6))
    const navigate = useNavigate()
    const hikingIcon = <Hiking></Hiking>
    const parkingLot = <LocalParking></LocalParking>
    const hutIcon = <HolidayVillage></HolidayVillage>
    const profileIcon = <ManageAccounts></ManageAccounts>
    const weatherIcon = <Cloud/>
    const barchartIcon = <BarChart></BarChart>
    //const barchartIcon = <BarChart></BarChart>
    const updateActive = (idx, relocation) => {
      UTILS.updateActive(idx, relocation, lengthOption, setActive, navigate)

    }
    const route = props.route
    return (
    <Sidebar width='auto' className='border-0' backgroundColor={colorBackgroundMenu} >
      <Menu>
        <SubMenu label="Hikes" icon={hikingIcon}>
          <MenuItem onClick={() => updateActive(0,"hikes")} active={"hikes"===route}>Browse</MenuItem>
          <MenuItem onClick={() => updateActive(1,"filterhikes")} active={"filterhikes"===route}>Filter</MenuItem> 
          {props.hiker?<MenuItem onClick={() => updateActive(1,"ongoinghike")} active={"ongoinghike"===route}>Current Hike </MenuItem>:''}
        {props.hiker ? <MenuItem onClick = {() => updateActive(6, "recommendedhikes")} active = {"recommendedhikes"===route}>Recommended Hikes</MenuItem> : ''}
        </SubMenu>
        <SubMenu icon ={hutIcon} label='Hut'>
          <MenuItem onClick={() => updateActive(2,"huts")}active={"huts"===route}>Browse</MenuItem>
          {props.hiker ? <MenuItem onClick={() => updateActive(3,"filterhuts")}active={"filterhuts"===route}>Filter</MenuItem> : ''}
        </SubMenu>
        <SubMenu icon={parkingLot} label='Parking Lot'>
          <MenuItem onClick={() => updateActive(4,"parkinglots")}active={"parkinglots"===route}>Browse</MenuItem>
        </SubMenu>
        {props.hiker ?
        <>
          <SubMenu icon={profileIcon} label='My profile'>
          <MenuItem onClick={() => updateActive(5,"preferences") }active={"preferences"===route}>Preferences</MenuItem>
          <MenuItem onClick={() => updateActive(6,"records") }active={"records"===route}>Records</MenuItem>
          <MenuItem onClick={() => updateActive(7,"performancestats")}active={"performancestats"===route}>Statistics</MenuItem>
          </SubMenu>
         <SubMenu icon={weatherIcon} label='Weather'>
         <MenuItem onClick={() => updateActive(6,"weatherhikealert") }active={"weatherhikealert"===route}>Alerts</MenuItem>
       </SubMenu>
    
       </>:""
        }
      </Menu>

    </Sidebar>
    )
}




function LocalGuideMenu(props){
    const lengthOption = 6
    const [active, setActive] = useState(initFlagArray(lengthOption))
    const hikingIcon = <Hiking></Hiking>
    const parkingLot = <LocalParking></LocalParking>
    const hutIcon = <HolidayVillage></HolidayVillage>
    const navigate = useNavigate()
    const updateActive = (idx, relocation) => {
      UTILS.updateActive(idx, relocation, lengthOption, setActive, navigate)

    }
    const route = props.route
    return (
        <Sidebar width='auto' className='border-0' backgroundColor={colorBackgroundMenu} >
          <Menu>
            <SubMenu label="Hikes" icon={hikingIcon}>
              <MenuItem onClick={() => {updateActive(0,'/localguide/addhike')}} active={"addhike"===route}>
                Add</MenuItem>
                <MenuItem onClick={() => updateActive(1,"hikes")} active={"hikes"===route}>Browse</MenuItem>
            </SubMenu>
            <SubMenu icon ={hutIcon} label='Hut'>
              <MenuItem onClick={() => updateActive(2,"/localguide/addhut")} active={"addhut"===route}>Add</MenuItem>
              <MenuItem onClick={() => updateActive(3,"huts")}active={"huts"===route}>Browse</MenuItem>
            </SubMenu>
      
            <SubMenu icon={parkingLot} label='Parking Lot'>
              <MenuItem onClick={() => updateActive(4,"/localguide/addparkinglot")} active={"addparkinglot"===route}>Add</MenuItem>
              <MenuItem onClick={() => updateActive(5,"parkinglots")}active={"parkinglots"===route}>Browse</MenuItem>
            </SubMenu>
          </Menu>
        </Sidebar>
        )
}

function PlatformManagerMenu(props){
  const lengthOption = 5;
  const [active, setActive] = useState(initFlagArray(lengthOption))
  const hikingIcon = <Hiking></Hiking>
  const parkingLot = <LocalParking></LocalParking>
  const hutIcon = <HolidayVillage></HolidayVillage>
  const profileIcon = <ManageAccounts></ManageAccounts>
  const weatherIcon = <Cloud/>
  const navigate = useNavigate()
  const updateActive = (idx, relocation) => {
    UTILS.updateActive(idx, relocation, lengthOption, setActive, navigate)

  }
  const route = props.route

  return (
      <Sidebar width='auto' className='border-0' backgroundColor={colorBackgroundMenu} >
        <Menu>
          <SubMenu label="Hikes" icon={hikingIcon}>
              <MenuItem onClick={() => updateActive(0,"/hikes")} active={"hikes"===route}>Browse</MenuItem>
              <MenuItem onClick={() => updateActive(1,"/filterhikes")} active={"filterhikes"===route}>Filter</MenuItem>
          </SubMenu>
          <SubMenu icon ={hutIcon} label='Hut'>
            <MenuItem onClick={() => updateActive(2,"/huts")}active={"huts"===route}>Browse</MenuItem>
          </SubMenu>
    
          <SubMenu icon={parkingLot} label='Parking Lot'>
            <MenuItem onClick={() => updateActive(3,"/parkinglots")}active={"parkinglots"===route}>Browse</MenuItem>
          </SubMenu>
          <SubMenu icon={profileIcon} label='Requests'>
            <MenuItem onClick={() => updateActive(4,"/platformmanager/confirmAccount")} active={"confirmAccount"===route}>Account to confirm</MenuItem>      
          </SubMenu>
          <SubMenu icon={weatherIcon}label='Weather'>
            <MenuItem onClick={() => updateActive(3,"/platformmanager/weatheralert")} active={"weatheralert"===route}>Alerts</MenuItem>
          </SubMenu>
        </Menu>
      </Sidebar>
      )
}

function HutWorkerMenu(props){
  const lengthOption = 1
  const hikingIcon = <Hiking></Hiking>
  const [active, setActive] = useState(initFlagArray(lengthOption))
  const navigate = useNavigate()
  const updateActive = (idx, relocation) => {
    UTILS.updateActive(idx, relocation, lengthOption, setActive, navigate)

  }
  const route = props.route

  return (
    <Sidebar width='auto' className='border-0' backgroundColor={colorBackgroundMenu} >
      <Menu>
          <SubMenu label="Hikes" icon={hikingIcon}>
              <MenuItem onClick={() => updateActive(0,"/hutworker/hikes")} active={"hikes"===route}>Browse</MenuItem>
          </SubMenu>
      </Menu>
    </Sidebar>
  )
}

export default MySidebar;