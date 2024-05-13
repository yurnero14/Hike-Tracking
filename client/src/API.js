import UTILS from "./utils/utils"

const URL = "http://localhost:8000/hiketracking/"

async function createHike(hike_description, hike_file, token, method) {
  const valid_token = ('Token ' + token).replace('"', '').slice(0, -1)
  try {
    let response = await fetch(URL + 'hikes/', {
      method: method,
      body: JSON.stringify(hike_description),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': valid_token
      },
    })
    
    if (response.status === 200) {
      response = await response.json()
      let hike_id = response['hike_id']

      let second_response = await fetch(URL + 'hike/file/' + hike_id, {
        method: 'PUT',
        body: hike_file,
        headers: {
          'Authorization': valid_token
        },
      })

      if (second_response.status === 200) {
        let picture = new FormData()
        picture.append('Picture', hike_description['picture'])
        await fetch(URL + 'hike/picture/' + hike_id, {
          method: 'PUT',
          body: picture,
          headers: {
            'Authorization': valid_token
          },
        })
        return { msg: "Hike Creato" };
      }


      return { error: true, msg: "Something went wrong. Please check all fields and try again" };
    }

    return { error: true, msg: "Something went wrong. An hike with this title already exists, please try a new one" };
  }

  catch (e) {
    console.log(e) // TODO
  }
}




async function deleteHike(title, token) {
  const valid_token = ('Token ' + token).replace('"', '').slice(0, -1)
  try {
    let response = await fetch(URL + 'hikes/' + title, {
      method: 'DELETE',
      headers: {
        'Authorization': valid_token
      }
    })
    if (response.status === 200) {
      return true
    }

  } catch (e) {
    console.log(e)
  }
}


async function getHike(title, token) {

  const valid_token = ('Token ' + token).replace('"', '').slice(0, -1)

  try {
    let response = await fetch(URL + 'hikes/' + title, {
      headers: {
        'Authorization': valid_token
      }
    })

    if (response.status === 200) {
      const hike = await response.json()
      return hike
    }
  }
  catch (e) {
    console.log(e)
  }
}

async function createHut(hut_description, token) {
  const valid_token = ('Token ' + token).replace('"', '').slice(0, -1)
  let formData = new FormData()
  formData.append("name", hut_description['name'])
  formData.append("ascent", hut_description['ascent'])
  formData.append("desc", hut_description['desc'])
  formData.append("email", hut_description['email'])
  formData.append("fee", hut_description['fee'])
  formData.append("n_beds", hut_description['n_beds'])
  formData.append("phone", hut_description['phone'])
  formData.append("position", JSON.stringify(hut_description['position']))
  formData.append("relatedHike", hut_description['relatedHike'])
  formData.append("services", hut_description['services'])
  formData.append("web_site", hut_description['web_site'])
  formData.append("File", hut_description['picture'])
  console.log(hut_description['picture'])
  try {
    let response = await fetch(URL + 'hut/', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': valid_token
      },
    })

    if (response.status === 200)
      return { msg: "Hut created" };

    return { error: true, msg: "Something went wrong. Please check that all fields are filled and try again" };
  }

  catch (e) {
    console.log(e) // TODO
  }
}

async function createParkingLot(parking_lot_description, token) {
  const valid_token = ('Token ' + token).replace('"', '').slice(0, -1)

  try {
    let response = await fetch(URL + 'parkingLots/', {
      method: 'POST',
      body: JSON.stringify(parking_lot_description),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': valid_token
      },
    })
    if (response.status === 201)
      return { msg: "Parking Lot created" };
    else
      return { error: true, msg: "Something went wrong. Please check all fields and try again" };
  }

  catch (e) {
    console.log(e) // TODO
  }
}

async function login(credentials) {
  let response = await fetch(URL + 'login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (response.status === 200)
    return { msg: await response.json() }
  else {
    let msg = "Email and/or password are not correct, please try again"
    const err = await response.json()
    if (err.error) {
      if (err.error === 2){
        msg = "Please confirm your email"
      }
      if (err.error === 1){
        msg = "Your account has not been confirmed by the platform manager yet, please try again"
      }
    }
    return { error: 'Error', msg: msg }
  }
}

async function signin(credentials) {
  let response = await fetch(URL + 'register/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (response.status === 200)
    return { msg: await response.json() }
  else {
    return { error: 'Error', msg: "Something went wrong during the registration. This email is associated with an existing account." }
  }

}

async function logout(token) {
  const valid_token = token = ('Token ' + token).replace('"', '').slice(0, -1)
  await fetch(URL + 'logout/', {
    method: 'POST',
    headers: {
      'Authorization': valid_token
    },
  });
}

async function getHikePicture(hike_id, token) {
  let response = await fetch(URL + 'hike/picture/' + hike_id, {
    method: 'GET',
    headers: {
      //'Authorization': valid_token
    },
  });
  if (response.status === 200) {
    const img = await response.arrayBuffer()
    return _arrayBufferToBase64(img)
  }
  else {
    return ""
  }
}

async function getAllHikes(token, filters, userPower) {

  let query = ''

  if (filters) {
    query += '?filters=true'
    if (filters.minLength)
      query += '&minLength=' + filters.minLength
    if (filters.maxLength)
      query += '&maxLength=' + filters.maxLength
    if (filters.minTime)
      query += '&minTime=' + filters.minTime
    if (filters.maxTime)
      query += '&maxTime=' + filters.maxTime
    if (filters.minAscent)
      query += '&minAscent=' + filters.minAscent
    if (filters.maxAscent)
      query += '&maxAscent=' + filters.maxAscent
    if (filters.difficulty !== 'All')
      query += '&difficulty=' + filters.difficulty
    if (filters.province !== '-')
      query += '&province=' + filters.province
    if (filters.village !== "")
      query += '&village=' + filters.village
    if (filters.position !== '')
      query += '&around=' + filters.position.lat + "-" + filters.position.lng + "-" + filters.radius
  }

  let response = await fetch(URL + 'hikes/' + query, {
    method: 'GET',
    headers: {
      //'Authorization': valid_token
    },
  });

  if (response.status === 200) {
    let hikes = await response.json();
    return { msg: hikes }
  }
  else {
    return { error: 'Error', msg: "Something went wrong. Please try again" }
  }
}


async function getHikeFile(hike_id, token) {
  let response = await fetch(URL + 'hike/file/' + hike_id, {
    method: 'GET',
    headers: {
      //'Authorization': valid_token
    },
  });
  if (response.status === 200) {
    const readable = await response.arrayBuffer()
    const text = new TextDecoder().decode(readable);
    return text
  }
  else {
    console.log("file")

    return { err: "File error" }
  }
}

function _arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}



async function getHutPicture(hut_id, token) {
  let response = await fetch(URL + 'hut/picture/' + hut_id, {
    method: 'GET',
    headers: {
      //'Authorization': valid_token
    },
  });
  if (response.status === 200) {
    const img = await response.arrayBuffer()
    return _arrayBufferToBase64(img)
  }
  else {
    return ""
  }
}

async function getAllHuts(token, filters) {

  let query = ''

  if (filters) {
    query += '?filters=true'
    if (filters.name)
      query += '&name=' + filters.name
    if (filters.nbeds)
      query += '&nbeds=' + filters.nbeds
    if (filters.fee)
      query += '&fee=' + filters.fee
    if (filters.start_lat && filters.start_lon)
      query += '&start_lat=' + filters.start_lat + '&start_lon=' + filters.start_lon
    if (filters.services && filters.services.length > 0) {
      let res = filters.services.map((s) => s.id).toString().replace(",", "-")
      query += '&services=' + res
    }
  }

  let response = await fetch(URL + 'hut/' + query, {
    method: 'GET',
    headers: {
      //'Authorization': valid_token
    },
  });

  if (response.status === 200) {
    let huts = await response.json();
    
    

    return { msg: huts }
  }
  else {

    return { error: 'Error', msg: "Something went wrong. Please try again" }
  }
}

async function checkAuth(token) {
  const valid_token = token = ('Token ' + token).replace('"', '').slice(0, -1)
  let response = await fetch(URL + 'sessions/', {
    method: 'GET',
    headers: {
      'Authorization': valid_token
    },
  });
  if (response.status === 200)
    return { msg: await response.json() }
  else {
    return { error: 'Error', msg: "Something went wrong. Please try again" }
  }
}

async function getAllParkingLots(token, filters) {

  let query = ''

  if (filters) {
    query += '?filters=true'
    if (filters.start_lat && filters.start_lon)
      query += '&start_lat=' + filters.start_lat + '&start_lon=' + filters.start_lon
  }

  let response = await fetch(URL + 'parkingLots/' + query, {
    method: 'GET',
    headers: {
      //'Authorization': valid_token
    },
  });
  if (response.status === 200)
    return { msg: await response.json() }
  else {
    return { error: 'Error', msg: "Something went wrong. Please try again" }
  }
}

async function getFacilities() {
  let response = await fetch(URL + 'facilities/', {
    method: 'GET',

  });
  if (response.status === 200)
    return { msg: await response.json() }

  else {
    return { error: 'Error', msg: "Something went wrong. Please try again" }
  }
}

async function setProfile(preferences, token) {
  const valid_token = ('Token ' + token).replace('"', '').slice(0, -1)

  try {
    let response = await fetch(URL + 'profile/', {
      method: 'PUT',
      body: JSON.stringify(preferences),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': valid_token
      },
    })
    if (response.status === 200)
      return { msg: "Profile updated!" }
    else {
      return { error: 'Error', msg: "Something went wrong. Please try again" }
    }
  }
  catch (e) {
    console.log(e)
  }
}

async function getProfile(token) {
  const valid_token = token = ('Token ' + token).replace('"', '').slice(0, -1)
  let response = await fetch(URL + 'profile/', {
    method: 'GET',
    headers: {
      'Authorization': valid_token
    },
  });
  if (response.status === 200) {
    return { msg: await response.json() }
  }
  else {
    return { error: "Something went wrong. Please try again" }
  }
}

async function getRecommendedHikes(token) {
  const valid_token = token = ('Token ' + token).replace('"', '').slice(0, -1)
  let response = await fetch(URL + 'hikes/recommended/', {
    headers: {
      'Authorization': valid_token
    },
  })
  if (response.status === 200) {
    return { msg: await response.json() }
  } else {
    return { error: "Something went wrong. Please try again" }
  }
}

async function getAccountsToValidate(token) {
  const valid_token = token = ('Token ' + token).replace('"', '').slice(0, -1)
  let response = await fetch(URL + 'users/validate/', {
    headers: {
      'Authorization': valid_token
    },
  })
  if (response.status === 200) {
    return { msg: await response.json() }
  } else {
    return { error: "Error", msg: "Something went wrong. Please try again" }
  }
}

async function activateAccount(params, token) {
  const valid_token = ('Token ' + token).replace('"', '').slice(0, -1)

  try {
    let response = await fetch(URL + 'users/validate/', {
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': valid_token
      },
    })
    if (response.status === 200)
      return { msg: "Updated!" }
    else {
      return { error: 'Error', msg: "Something went wrong. Please try again" }
    }
  }
  catch (e) {
    console.log(e)
  }
}

async function getHutWorkerHikes(token) {
  const valid_token = ('Token ' + token).replace('"', '').slice(0, -1)
  try {
    const response = await fetch(URL + "worker/hikes/", {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': valid_token
      },
    })
    if (response.status === 200) {
      return ({ msg: await response.json() })
    }
    else {
      return ({ err: await response.json() })
    }
  }
  catch (e) {
    console.log(e)
  }
}

async function updateCondition(condition, token) {
  const valid_token = ('Token ' + token).replace('"', '').slice(0, -1)

  try {
    let response = await fetch(URL + 'worker/hikes/', {
      method: 'PUT',
      body: JSON.stringify(condition),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': valid_token
      },
    })

    if (response.status === 200)
      return { msg: "Condition updated" };

    return { error: true, msg: "Something went wrong. Please check all fields and try again" };
  }
  catch (e) {
    console.log(e)
  }
}


async function getAlerts(token) {
  const valid_token = ('Token ' + token).replace('"', '').slice(0, -1)
  try {
    let response = await fetch(URL + 'platformmanager/weatheralert/', {
      headers: {
        'Authorization': valid_token
      }
    })

    if (response.ok)
      return { msg: await response.json() };
    return { error: true, msg: "Something went wrong. Not able to get the alerts" };
  }
  catch (e) {
    console.log(e)
  }
}

async function postAlert(alert, token) {
  const valid_token = ('Token ' + token).replace('"', '').slice(0, -1)
  try {
    let response = await fetch(URL + 'platformmanager/weatheralert/', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': valid_token
      },
      body: JSON.stringify(alert)
    })

    if (response.ok)
      return { msg: "Alert created" }
    return { error: true, msg: "Something went wrong. Please check all fields and try again" };
  } catch (e) {
    console.log(e)
  }
}

async function deleteAlerts(token) {
  const valid_token = ('Token ' + token).replace('"', '').slice(0, -1)
  try {
    let response = await fetch(URL + 'platformmanager/weatheralert/', {
      method: "DELETE",
      headers: {
        'Authorization': valid_token,
        'Content-Type': 'application/json',
      }
    })

    if (response.ok)
      return { msg: "All the alerts were deleted" };
    return { error: true, msg: "Something went wrong. Not able to delete the alerts" };
  }
  catch (e) {
    console.log(e)
  }
}

async function getCompletedHikes(token){
  const valid_token = ('Token ' + token).replace('"', '').slice(0, -1)
  try{
    let response = await fetch(URL + 'hiking/done', {
      method: 'GET',
      headers: {
        'Authorization': valid_token,
      },
    })
    if(response.ok){
      return {msg: UTILS.adjustAllRecords((await response.json()))}
    } else {
      return {error:true, msg: "Something went wrong"}
    }
  } catch(e){
  console.log(e)
  }
} 


async function getCurrentHike(token){
  const valid_token = ('Token ' + token).replace('"', '').slice(0, -1)
  try{
    let response = await fetch(URL + 'hiking/current', {
      method: 'GET',
      headers: {
        'Authorization': valid_token,
      },
    })
    if(response.ok){
      return {msg: await response.json()}
    } else {
      return {error:true, msg: "There is not an ongoing hike"}
    }
  } catch(e){
  console.log(e)
  }
} 

async function postStartHike(body, token){
  const valid_token = ('Token ' + token).replace('"', '').slice(0, -1)
  try{
    let response = await fetch(URL + 'hiking/', {
      method: 'POST',
      headers: {
        'Authorization': valid_token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    if(response.ok)
      return {msg: "Hike started"}
    else {
      return { error: true, msg: "There is another ongoing hike! Please terminate it, to start a new one" }
    }
  }
  catch(e){
    console.log(e)
  }
}
async function postReachedReferencePoint(referencePoint, token) {
  const valid_token = ('Token ' + token).replace('"', '').slice(0, -1)
  try {
    let response = await fetch(URL + 'hiking/', {
      method: "PUT",
      headers: {
        'Authorization': valid_token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(referencePoint)
    })
    if (response.ok)
      return { msg: "Position updated" };
    return { error: true, msg: "Something went wrong. Try later" }
  } catch (e) {
    console.log(e)
  }
}

async function postTerminatedHike(body,token) {
  const valid_token = ('Token ' + token).replace('"', '').slice(0, -1)
  try {
    let response = await fetch(URL + 'hiking/', {
      method: "PUT",
      headers: {
        'Authorization': valid_token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
      })
    if (response.ok)
      return { msg: "Hike terminated" };
    return { error: true, msg: "Something went wrong. Try later" }
  } catch (e) {
    console.log(e)
  }
}

async function getHikeAlerts(token) {
  const valid_token = ('Token ' + token).replace('"', '').slice(0, -1)

  let response = await fetch(URL + 'hike/alert/', {
    method: 'GET',
    headers: {
      'Authorization': valid_token
    },
  });
  
  if (response.status === 200) {
    return { msg : await response.json() }
  }
  else {
    return { error: "Something was wrong"}
  }
}

async function getStatistics(token) {
  const valid_token = ('Token ' + token).replace('"', '').slice(0, -1)

  let response = await fetch(URL + 'hike/statistics/', {
    method: 'GET',
    headers: {
      'Authorization': valid_token
    },
  });
  
  if (response.status === 200) {
    return { msg : await response.json() }
  }
  else {
    return { error: "Something was wrong"}
  }
}

const API = { getHikeAlerts, activateAccount, getAccountsToValidate, getProfile, setProfile, login, logout, createParkingLot, getFacilities, createHike, signin, getAllHikes, checkAuth, getAllHuts, getAllParkingLots, createHut, getHike, deleteHike, getHikeFile, getRecommendedHikes, getHutWorkerHikes, updateCondition, getAlerts, postAlert, deleteAlerts, postReachedReferencePoint, getHikePicture, getHutPicture, postStartHike, postTerminatedHike, getCurrentHike, getCompletedHikes, getStatistics };

export default API;
