# Create your tests here.
from django.contrib.auth import get_user_model
from django.test import Client
from django.test import TestCase
from unittest import mock
from hiketracking.models import Hike, Point,CustomerProfile,CustomUser,WeatherAlert,UserHikeLog
import json
from http import HTTPStatus
from django.db import models

TEST_PROVINCE="test province"
TEST_VILLAGE="test village"
TEST_ADDRESS="test address"
TEST_USER="test@user.com"
TEST_EMAIL="test@test.com"
PASSWORD="foo"
TEST_PROVINCE2="test province 2"
TEST_VILLAGE2="test village 2"
TEST_ADDRESS2="test address 2"
TEST_PROVINCE3="test province 3"
TEST_VILLAGE3="test village 3"
TEST_ADDRESS3="test address 3"


RESPONSE_UTIL = b'[{"id":1,'\
        b'"title":"Climbing",'\
        b'"length":2,"expected_time":1,'\
        b'"ascent":1,'\
        b'"altitude":1000,'\
        b'"difficulty":"easy",'\
        b'"description":"",'\
        b'"track_file":"",'\
        b'"start_point_id":1,'\
        b'"end_point_id":1,'\
        b'"local_guide_id":1,'\
        b'"picture":"hikePictures/defultImage.jpg",'\
        b'"condition":"Open",'\
        b'"condition_description":"Open",'\
        b'"rp":[],'\
        b'"start_point_lat":0.01,'\
        b'"start_point_lng":0.01,'\
        b'"start_point_address":"test address",'\
        b'"end_point_lat":0.01,'\
        b'"end_point_lng":0.01,'\
        b'"end_point_address":"test address"},'\
        b'{"id":2,'\
        b'"title":"Trekking",'\
        b'"length":3,'\
        b'"expected_time":2,'\
        b'"ascent":0,'\
        b'"altitude":1000,'\
        b'"difficulty":"medium",'\
        b'"description":"",'\
        b'"track_file":"",'\
        b'"start_point_id":1,'\
        b'"end_point_id":1,'\
        b'"local_guide_id":1,'\
        b'"picture":"hikePictures/defultImage.jpg",' \
        b'"condition":"Open",'\
        b'"condition_description":"Open",'\
        b'"rp":[],'\
        b'"start_point_lat":0.01,'\
        b'"start_point_lng":0.01,'\
        b'"start_point_address":"test address",'\
        b'"end_point_lat":0.01,'\
        b'"end_point_lng":0.01,'\
        b'"end_point_address":"test address"}]'

BACK_FROUND=1

MOCK_UTIL = {
            "user":
            {
            "email":"test@test.com",
            "role":"Testrole"
        },
            "min_length":0.01,
            "max_length":0.01,
            "min_time":1,
            "max_time":1,
            "min_altitude":1,
            "max_altitude":1
        }


class MockResponse:
    def __init__(self):
        self.status_code = 200
 
    def json(self):
        return MOCK_UTIL

class UserProfileUnitTest(TestCase):
    def setUp(self) -> None:
        User = get_user_model()
        self.user = User.objects.create_user(
        email='asdf@gmail.com',
        password='hiwa_asdf',
        role='local guide'
    )
        c1 = CustomUser(email = TEST_USER,role = "Testrole")
        c1.save()
        CustomerProfile.objects.create(user =c1,
        min_length = 0.01,
        max_length = 0.01,
        min_time = 1,
        max_time = 1,
        min_altitude = 1,
        max_altitude = 1)

        self.url='/hiketracking/profile/'
        return super().setUp()
   
    def assert_util(self, response):
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["min_length"],0.01)
        self.assertEqual(response.json()["max_length"],0.01)
        self.assertEqual(response.json()["min_time"],1)
        self.assertEqual(response.json()["max_time"],1)
        self.assertEqual(response.json()["min_altitude"],1)
        self.assertEqual(response.json()["max_altitude"],1)

    @mock.patch("django.test.Client.get",return_value=MockResponse())
    def test_get(self,mocked):
        self.client.force_login(self.user)
        response = self.client.get(self.url)
        self.assert_util(response)
    
    @mock.patch("django.test.Client.post",return_value=MockResponse())
    def test_post(self,mocked):
        self.client.force_login(self.user)
        response = self.client.post(self.url,MOCK_UTIL)
        self.assert_util(response)


class MockHike:
    def __init__(self):
        self.status_code = 200
 
    def json(self):
        return {
            'id': 1,
            'title':'test_title',
            'length': 1,
            'expected_time': 1,
            'ascent':  1,
            'difficulty': 'hard',
            'description': "test description",
            'track_file': "test file",
        }

    def test_get(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)

   


class recommandHikeUnitTest(TestCase):
    def setUp(self) -> None:
        User = get_user_model()
        User.objects.create_user( email='test@user.com', password='foo', role='local guide' )
        return super().setUp()
    
    @mock.patch("django.test.Client.get",return_value=MockHike())
    def test_get(self,mocked):
        c = Client()
        c.login(username=TEST_USER,password=PASSWORD)
        response = c.get('/hiketracking/hikes/recommended')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["length"],1)
        self.assertEqual(response.json()["title"],'test_title')
        self.assertEqual(response.json()["expected_time"],1)
        self.assertEqual(response.json()["ascent"],1)
        self.assertEqual(response.json()["difficulty"],'hard')
        self.assertEqual(response.json()["description"],"test description")
        self.assertEqual(response.json()["track_file"],'test file')

def set_up():
    User = get_user_model()
    User.objects.create_user(email='test@user.com', password='foo', role='smth')
    user_id = User.objects.get(email='test@user.com')

    p1 = Point(latitude=0.01, longitude=0.01, province=TEST_PROVINCE, 
    village=TEST_VILLAGE,
    address=TEST_ADDRESS)

    p1.save()

    Hike.objects.create(title='Climbing', 
    length=2, 
    expected_time=1, 
    ascent=1,
    difficulty='easy',
    start_point=p1,
    end_point=p1,
    local_guide=user_id)
    Hike.objects.create(title='Trekking', 
    length=3, 
    expected_time=2, 
    ascent=0,
    difficulty='medium',
    start_point=p1,
    end_point=p1,
    local_guide=user_id) 
    
 
class modifyAHikeUnitTest(TestCase):
    def setUp(self) -> None:
       set_up()
       return super().setUp()
        

    def test_wrong(self):
        c = Client()
        response = c.get('/hiketracking/hikes/recommended')
        self.assertEqual(response.status_code, 401)

        


class modifyAndDeleteHikeUnitTest(TestCase):
    def setUp(self) -> None:
        User = get_user_model()
        User.objects.create_user(email=TEST_USER, password='foo', role='smth')
        user_id = User.objects.get(email=TEST_USER)
        p1 = Point(latitude=0.01, longitude=0.01, 
        province=TEST_PROVINCE, 
        village=TEST_VILLAGE,
        address=TEST_ADDRESS)

        p1.save()
        Hike.objects.create(title='Climbing', 
        length=2, 
        expected_time=1, 
        ascent=1,
        difficulty='easy',
        start_point=p1,
        end_point=p1,
        local_guide=user_id)

        Hike.objects.create(title='Trekking', 
        length=3, 
        expected_time=2, 
        ascent=0,
        difficulty='medium',
        start_point=p1,
        end_point=p1,
        local_guide=user_id) 

        return super().setUp()
    
    def test_Backfround(self):
        c = Client()
        c.login(username=TEST_USER,password=PASSWORD)
        response = c.get('/hiketracking/hikes/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, RESPONSE_UTIL)
    
    @mock.patch("django.test.Client.post",return_value=MockHike())
    def test_modifyHike(self,mocked):
        c = Client()
        c.login(username=TEST_USER,password=PASSWORD)
        response = c.post('/hiketracking/hikes/', {'username': 'john', 'password': 'smith'})
        self.assertEqual(response.status_code, 200)


class MockMOdifyHike:
    def __init__(self):
        self.status_code = 200

class DeleteHikeUnitTest(TestCase):
    def setUp(self) -> None:
       set_up()
       c1 = CustomUser(email=TEST_EMAIL,password = PASSWORD ,role="Testrole")
       c1.save()
       return super().setUp()
    
    def test_Backfround(self):
        c = Client()
        c.login(username=TEST_USER,password=PASSWORD)
        response = c.get('/hiketracking/hikes/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, RESPONSE_UTIL)

    @mock.patch("django.test.Client.post",return_value=MockMOdifyHike())
    def test_modifyHike(self,mocked):
        c = Client()
        c.login(username=TEST_USER,password=PASSWORD)
        response = c.post('/hiketracking/hikes/', {'username': 'john', 'password': 'smith'})
        self.assertEqual(response.status_code, 200)

    def test_deleteHike(self):
        c = Client()
        c.login(username=TEST_USER,password=PASSWORD)
        c.delete('/hiketracking/hikes/')
        hike2 = Hike.objects.all()
        self.assertTrue(hike2.exists())




class MockRecordPoint:
    def __init__(self):
        self.status_code = 200
 
    def json(self):
        return {
            'id': 1,
            'title':'test_title',
            'length': 1,
            'expected_time': 1,
            'ascent':  1,
            'difficulty': 'hard',
            'description': "test description",
            'track_file': "test file",
        }

    def test_get(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)


class MockStats:
    def __init__(self):
        self.status_code = 200
 
    def json(self):
        return 

class PerformanceStatsUnitTest(TestCase):
    def setUp(self) -> None:
        self.url = '/hiketracking/hike/performanceStats/'
        return super().setUp()

    def test_get(self):
        c = Client()
        c.login(username=TEST_USER,password=PASSWORD)
        response = c.get(self.url)
        self.assertEqual(response.status_code, 404)

    @mock.patch("django.test.Client.post",return_value=MockStats())
    def test_post(self,mocked):
        c = Client()
        c.login(username=TEST_USER,password=PASSWORD)
        response = c.post(self.url)
        self.assertEqual(response.status_code, 200)

class MockRecordPointGet:
    def __init__(self):
        self.status_code = 200
 
    def json(self):
        return [{
        'user':1,
        'hike':{
        'title':'Climbing', 
        'length':1, 
        'expected_time':1, 
        'ascent':1,
        'difficulty':'easy',
        'start_point':{
        'position':[0.01,0.01],
        'province':"test province",
        'village':"test village",
        'address':"test address"
        },
        'end_point':{
        'position':[0.01,0.01],
        'province':"test province",
        'village':"test village",
        'address':"test address"
        },
        'local_guide':1

        },
        'counter':1,
        'point':{
        'position':[0.01,0.01],
        'province':"test province",
        'village':"test village",
        'address':"test address"
        },
        'end' :True
        },{
        'user':1,
        'hike':{
        'title':'Trekking', 
        'length':2, 
        'expected_time':2, 
        'ascent':2,
        'difficulty':'normal',
        'start_point':{
        'position':[0.02,0.02],
        'province':"test province 2",
        'village':"test village 2",
        'address':"test address 2"
        },
        'end_point':{
        'position':[0.02,0.02],
        'province':"test province 2",
        'village':"test village 2",
        'address':"test address 2"
        },
        'local_guide':1
        },
        'counter':2,
        'point':{
        'position':[0.02,0.02],
        'province':"test province 2",
        'village':"test village 2",
        'address':"test address 2"
        },
        'end' :False
        }]

RESPONSE_POST= {
        'user':1,
        'hike':{
        'title':'Climbing', 
        'length':3, 
        'expected_time':3, 
        'ascent':3,
        'difficulty':'hard',
        'start_point':{
        'position':[0.03,0.03],
        'province':"test province 3",
        'village':"test village 3",
        'address':"test address 3"
        },
        'end_point':{
        'position':[0.03,0.03],
        'province':"test province 3",
        'village':"test village 3",
        'address':"test address 3"
        },
        'local_guide':1

        },
        'counter':3,
        'point':{
        'position':[0.03,0.03],
        'province':"test province 3",
        'village':"test village 3",
        'address':"test address 3"
        },
        'end' :True
        }

class MockRecordPointPost:
    def __init__(self):
        self.status_code = 201
 
    def json(self):
        return RESPONSE_POST
class MockRecordPointDelete:
    def __init__(self):
        self.status_code = 201
 
    def json(self):
        return {}
    
class RecordPointUnitTest(TestCase):
    def setUp(self) -> None:
        User = get_user_model()

        User.objects.create_user(email='test@user.com',
        password='foo',
        role='smth')

        user_id = User.objects.get(email='test@user.com')
        p1 = Point(latitude=0.01,
        longitude=0.01,
        province=TEST_PROVINCE,
        village=TEST_VILLAGE,
        address=TEST_ADDRESS)

        p1.save()

        Hike.objects.create(title='Climbing', 
        length=1, 
        expected_time=1, 
        ascent=1,
        difficulty='easy',
        start_point=p1,
        end_point=p1,
        local_guide=user_id)

        hike1 = Hike.objects.get(title = "Climbing")
        UserHikeLog.objects.create( user = user_id,
        hike = hike1,
        counter = 1,
        point = p1,
        datetime = '2023-01-01',
        end = True)

        User.objects.create_user(email='test2@user.com',
        password='foo2',
        role='smth2')

        user_id_2 = User.objects.get(email='test2@user.com')
        p2 = Point(latitude=0.02,
        longitude=0.02,
        province=TEST_PROVINCE2,
        village=TEST_VILLAGE2,
        address=TEST_ADDRESS2)

        p2.save()

        Hike.objects.create(title='Trekking', 
        length=2, 
        expected_time=2, 
        ascent=2,
        difficulty='normal',
        start_point=p2,
        end_point=p2,
        local_guide=user_id_2)

        hike2 = Hike.objects.get(title = "Trekking")

        UserHikeLog.objects.create( user = user_id_2,
        hike = hike2,
        counter = 2,
        point = p2,
        datetime = '2023-01-01',
        end = False)
        self.url='/hiketracking/hike/RecordPoint/'
        return super().setUp()
    
    @mock.patch("django.test.Client.get",return_value=MockRecordPointGet()) 
    def test_get(self,mocked):
        c = Client()
        c.login(username=TEST_USER,password=PASSWORD)
        response = c.get(self.url)
        self.assertEqual(response.json()[0]['hike']['title'], "Climbing")
        self.assertEqual(response.json()[0]['hike']['length'], 1)
        self.assertEqual(response.json()[0]['hike']['expected_time'], 1)
        self.assertEqual(response.json()[0]['hike']['start_point']['position'], [0.01,0.01])
        self.assertEqual(response.json()[0]['hike']['start_point']['province'], TEST_PROVINCE)
        self.assertEqual(response.json()[0]['hike']['start_point']['village'], TEST_VILLAGE)
        self.assertEqual(response.json()[0]['hike']['start_point']['address'], TEST_ADDRESS)
        self.assertEqual(response.json()[0]['hike']['end_point']['position'], [0.01,0.01])
        self.assertEqual(response.json()[0]['hike']['end_point']['province'], TEST_PROVINCE)
        self.assertEqual(response.json()[0]['hike']['end_point']['village'], TEST_VILLAGE)
        self.assertEqual(response.json()[0]['hike']['end_point']['address'], TEST_ADDRESS)
        self.assertEqual(response.json()[0]['counter'], 1)
        self.assertEqual(response.json()[0]['point']['position'], [0.01,0.01])
        self.assertEqual(response.json()[0]['point']['province'], TEST_PROVINCE)
        self.assertEqual(response.json()[0]['point']['village'], TEST_VILLAGE)
        self.assertEqual(response.json()[0]['point']['address'], TEST_ADDRESS)
        self.assertEqual(response.json()[0]['end'], True)

        self.assertEqual(response.json()[1]['hike']['title'], "Trekking")
        self.assertEqual(response.json()[1]['hike']['length'], 2)
        self.assertEqual(response.json()[1]['hike']['expected_time'], 2)
        self.assertEqual(response.json()[1]['hike']['start_point']['position'], [0.02,0.02])
        self.assertEqual(response.json()[1]['hike']['start_point']['province'], TEST_PROVINCE2)
        self.assertEqual(response.json()[1]['hike']['start_point']['village'], TEST_VILLAGE2)
        self.assertEqual(response.json()[1]['hike']['start_point']['address'], TEST_ADDRESS2)
        self.assertEqual(response.json()[1]['hike']['end_point']['position'], [0.02,0.02])
        self.assertEqual(response.json()[1]['hike']['end_point']['province'], TEST_PROVINCE2)
        self.assertEqual(response.json()[1]['hike']['end_point']['village'], TEST_VILLAGE2)
        self.assertEqual(response.json()[1]['hike']['end_point']['address'], TEST_ADDRESS2)
        self.assertEqual(response.json()[1]['counter'], 2)
        self.assertEqual(response.json()[1]['point']['position'], [0.02,0.02])
        self.assertEqual(response.json()[1]['point']['province'], TEST_PROVINCE2)
        self.assertEqual(response.json()[1]['point']['village'], TEST_VILLAGE2)
        self.assertEqual(response.json()[1]['point']['address'], TEST_ADDRESS2)
        self.assertEqual(response.json()[1]['end'], False)
    
    @mock.patch("django.test.Client.post",return_value=MockRecordPointPost())
    def test_post(self,mocked):
        c = Client()
        c.login(username=TEST_USER,password=PASSWORD)
        response = c.post(self.url)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['hike']['title'], "Climbing")
        self.assertEqual(response.json()['hike']['length'], 3)
        self.assertEqual(response.json()['hike']['expected_time'], 3)
        self.assertEqual(response.json()['hike']['start_point']['position'], [0.03,0.03])
        self.assertEqual(response.json()['hike']['start_point']['province'], TEST_PROVINCE3)
        self.assertEqual(response.json()['hike']['start_point']['village'], TEST_VILLAGE3)
        self.assertEqual(response.json()['hike']['start_point']['address'], TEST_ADDRESS3)
        self.assertEqual(response.json()['hike']['end_point']['position'], [0.03,0.03])
        self.assertEqual(response.json()['hike']['end_point']['province'], TEST_PROVINCE3)
        self.assertEqual(response.json()['hike']['end_point']['village'], TEST_VILLAGE3)
        self.assertEqual(response.json()['hike']['end_point']['address'], TEST_ADDRESS3)
        self.assertEqual(response.json()['counter'], 3)
        self.assertEqual(response.json()['point']['position'], [0.03,0.03])
        self.assertEqual(response.json()['point']['province'], TEST_PROVINCE3)
        self.assertEqual(response.json()['point']['village'], TEST_VILLAGE3)
        self.assertEqual(response.json()['point']['address'], TEST_ADDRESS3)
        self.assertEqual(response.json()['end'], True)
   
    @mock.patch("django.test.Client.delete",return_value=MockRecordPointDelete())
    def test_delete(self,mocked):
        c = Client()
        c.login(username=TEST_USER,password=PASSWORD)
        response = c.delete(self.url)
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.json.__sizeof__,0)
     
class WeatherAlertUnitTest(TestCase):
    def setUp(self) -> None:
        WeatherAlert.objects.create(condition = "Snow",
        weather_lat = 0.01,
        weather_lon = 0.01,
        radius = 1)
       
        WeatherAlert.objects.create(condition = "Rain",
        weather_lat = 0.02,
        weather_lon = 0.02,
        radius = 2)
        c1 = CustomUser(email="test@atest.com", role="local guide", is_staff=0, is_active=1)
        c1.save()
        self.data={
        "name": "Weather",
        "description": "test description",
        "condition":"Snow",
        "position":[0.03,0.03],
        "radius":3
        }
        self.url='/hiketracking/platformmanager/weatheralert/'
        self.context_type = "application/json"
        return super().setUp()
    
    def test_get(self):
        c = Client()
        c.login(username=TEST_USER,password=PASSWORD)
        response = c.get(self.url)
        self.assertEqual(response.status_code, 200)
        RESPONSE_WEATHER = b'[{"condition":"Snow",'\
        b'"position":[0.01,0.01],'\
        b'"radius":1},'\
        b'{"condition":"Rain",'\
        b'"position":[0.02,0.02],'\
        b'"radius":2}]'
        self.assertEqual(response.content, RESPONSE_WEATHER)

    def test_post(self):
        response = self.client.post( self.url,
                                     json.dumps( self.data ),
                                     content_type=self.context_type
                                     )
        self.assertEqual(response.status_code, 201)                        
        p1 = WeatherAlert.objects.all()
        self.assertEqual(p1[2].condition, "Snow")
        self.assertEqual(p1[2].weather_lat, 0.03)
        self.assertEqual(p1[2].weather_lon, 0.03)
        self.assertEqual(p1[2].radius, 3)

    def test_delete(self):
        c = Client()
        c.login(username=TEST_USER,password=PASSWORD)
        c.delete(self.url)
        hike2 = WeatherAlert.objects.all()
        self.assertFalse(hike2.exists())

