
import json
from http import HTTPStatus
from django.contrib.auth import get_user_model, authenticate, login
from django.test import Client
from django.test import TestCase, TransactionTestCase
from hiketracking.models import Hike, Point, Hut, ParkingLot, Facility, HutFacility, CustomerProfile, CustomUser, HutWorker, HutHike, WeatherAlert, UserHikeLog, HikeReferencePoint
from hiketracking.tests.test_utilty import CreateTestUser

class HikingAPItest(TestCase):

    def setUp(self):
        c1 = CustomUser.objects.create_user(email='meepo@user.com', password='foo', role='LocalGuide', is_staff=0, is_confirmed=1, is_active=1)
        c1.save()
        c2 = CustomUser.objects.create_user(email='test@user.com', password='foo', role='Hiker', is_staff=0, is_confirmed=1, is_active=1)
        c2.save()
        p1 = Point(latitude=0.06, longitude=0.06, province="test1 province", village="test1 village",
                   address="test1 address", type="Hut")
        p1.save()
        h1 = Hike.objects.create(title='Climbing', length=2, expected_time=1, ascent=1, difficulty='easy',
                                 start_point=p1, end_point=p1, local_guide=c1)
        h1.save()
        self.context_type = "application/json"

    def test_start_hike(self):
        c = Client()
        data = { "email": "test@user.com", "password": "foo"}
        response = c.post('/hiketracking/login/', json.dumps(data), content_type=self.context_type)
        token = response.data['token']
        head = { "HTTP_AUTHORIZATION": "Token "+token }
        data = {
            "hike_id" : 1,
            "datetime": "01/07/2023 14:54:57"
        }
        response = c.post('/hiketracking/hiking/', json.dumps(data), content_type=self.context_type, **head)

        self.assertEqual(response.status_code, HTTPStatus.OK)

    def test_terminate_hike(self):
        c = Client()
        data = {"email": "test@user.com", "password": "foo"}
        response = c.post('/hiketracking/login/', json.dumps(data), content_type=self.context_type)
        token = response.data['token']
        head = {"HTTP_AUTHORIZATION": "Token " + token}
        dataa = {
            "state": 'end',
            "hike_id": 1,
            "counter": 1,
            "datetime": "01/07/2023 14:54:57"
        }
        log2 = UserHikeLog.objects.create(user=CustomUser.objects.get(id=2), hike=Hike.objects.get(id=1), counter=1,
                                          datetime='2023-01-07 10:34:04', point=Point.objects.get(id=1),
                                          end=False)
        response = c.put('/hiketracking/hiking/', json.dumps(dataa), content_type=self.context_type, **head)

        self.assertEqual(response.status_code, HTTPStatus.OK)

    def test_get_completed_hikes(self):
        c = Client()
        data = {"email": "test@user.com", "password": "foo"}
        response = c.post('/hiketracking/login/', json.dumps(data), content_type=self.context_type)
        token = response.data['token']
        head = {"HTTP_AUTHORIZATION": "Token " + token}
        log2 = UserHikeLog.objects.create(user=CustomUser.objects.get(id=2), hike=Hike.objects.get(id=1), counter=1,
                                          datetime='2023-01-07 10:34:04', point=Point.objects.get(id=1),
                                          end=False)
        log3 = UserHikeLog.objects.create(user=CustomUser.objects.get(id=2), hike=Hike.objects.get(id=1), counter=1,
                                          datetime='2023-01-07 10:34:04', point=Point.objects.get(id=1),
                                          end=True)
        HikeReferencePoint.objects.create(hike = Hike.objects.get(id=1), point=Point.objects.get(id=1) )
        response = c.get('/hiketracking/hiking/done', content_type=self.context_type, **head)
        self.assertEqual(response.status_code, HTTPStatus.OK)
class GetWeatherAlertAPI(TestCase):

    def setUp(self):
        User = get_user_model()

        c1 = CustomUser(email="test@test.com", role="Platform Manager",
                        is_staff=0, is_confirmed=1, is_active=1)
        c1.save()
        c2 = CustomUser(email="test@atest.com",
                        role="Hiker", is_staff=0, is_confirmed=1, is_active=1)
        c2.save()
        c3 = User.objects.create_user(email='meepo@user.com', password='foo', role='Hiker', is_staff=0, is_confirmed=1, is_active=1)
        p1 = Point(latitude=0.06, longitude=0.06, province="test1 province", village="test1 village",
                   address="test1 address", type="Hut")
        p1.save()
        p2 = Point(latitude=0.10, longitude=0.69, province="test1 province", village="test1 village",
                   address="test1 address", type="Hut")
        p2.save()
        weath = WeatherAlert.objects.create(condition="Snow", weather_lat=2.3, weather_lon=2.4, radius=6)
        weath1 = WeatherAlert.objects.create(condition="Hail", weather_lat=3.3, weather_lon=4.4, radius=6)
        weath2 = WeatherAlert.objects.create(condition="Rain", weather_lat=6.3, weather_lon=5.4, radius=6)
        h1 = Hike.objects.create(title='Climbing', length=2, expected_time=1, ascent=1, difficulty='easy',
                                 start_point=p1, end_point=p1, local_guide=c2)
        h2 = Hike.objects.create(title='Trekking', length=3, expected_time=2, ascent=0, difficulty='medium',
                                 start_point=p1, end_point=p2, local_guide=c2)
        h3 = Hike.objects.create(title='Trek', length=3, expected_time=2, ascent=0, difficulty='medium',
                                 start_point=p1, end_point=p1, local_guide=c2)
        rp = HikeReferencePoint.objects.create(hike_id=h2.id, point_id = p1.id)
        rp_2 = HikeReferencePoint.objects.create(hike_id=h2.id, point_id = p2.id)
        #log1 = UserHikeLog.objects.create(user=c3, hike=h1, counter=2, point=p1, end=True)
        log2 = UserHikeLog.objects.create(user=c3, hike=h2, counter=1, datetime='2023-01-07 10:34:04', point=p1, end=False)
        #log3 = UserHikeLog.objects.create(user=c3, hike=h3, counter=1, point=p1, end=False)

        self.url = '/hiketracking/hike/alert/'
        self.context_type = "application/json"

    def test_get_Weather_alert(self):
        c = Client()
        data = { "email": "meepo@user.com", "password": "foo"}
        response = c.post('/hiketracking/login/', json.dumps(data), content_type=self.context_type)
        token = response.data['token']
        head = { "HTTP_AUTHORIZATION": "Token "+token }
        response = c.get('/hiketracking/hike/alert/', content_type = self.context_type,**head)
    