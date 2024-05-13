# Create your tests here.
from django.contrib.auth import get_user_model
from django.test import TestCase
from unittest import mock
from datetime import datetime
from hiketracking.models import Hike, Point, CustomerProfile, CustomUser, WeatherAlert, UserHikeLog
from unittest import mock

TEST_PROVINCE = "test province"
TEST_VILLAGE = "test village"
TEST_ADDRESS = "test address"
TEST_USER = "test@user.com"
TEST_EMAIL = "test@test.com"
PASSWORD = "foo"
TEST_USER2 = "test2@user.com"
TEST_PROVINCE2 = "test province 2"
TEST_VILLAGE2 = "test village 2"
TEST_ADDRESS2 = "test address 2"


def util_assertion(self, hike1):
    self.assertEqual(hike1[1].title, "Trekking")
    self.assertEqual(hike1[1].length, 3)
    self.assertEqual(hike1[1].expected_time, 2)
    self.assertEqual(hike1[1].ascent, 0)
    self.assertEqual(hike1[1].difficulty, 'medium')
    self.assertEqual(hike1[1].start_point.latitude, 0.01)
    self.assertEqual(hike1[1].start_point.longitude, 0.01)
    self.assertEqual(hike1[1].start_point.province, TEST_PROVINCE)
    self.assertEqual(hike1[1].start_point.village, TEST_VILLAGE)
    self.assertEqual(hike1[1].start_point.address, TEST_ADDRESS)
    self.assertEqual(hike1[0].end_point.latitude, 0.01)
    self.assertEqual(hike1[0].end_point.longitude, 0.01)
    self.assertEqual(hike1[0].end_point.province, TEST_PROVINCE)
    self.assertEqual(hike1[0].end_point.village, TEST_VILLAGE)
    self.assertEqual(hike1[0].end_point.address, TEST_ADDRESS)


def set_up():
    User = get_user_model()

    User.objects.create_user(email=TEST_USER,
                             password='foo',
                             role='smth')

    user_id = User.objects.get(email=TEST_USER)
    p1 = Point(latitude=0.01,
               longitude=0.01,
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


class recommendedHikeTest(TestCase):
    def setUp(self) -> None:
        set_up()
        return super().setUp()

    def test_Hike(self):
        hike1 = Hike.objects.all()
        util_assertion(self, hike1)


class modifyHikeTest(TestCase):
    def setUp(self) -> None:
        set_up()
        return super().setUp()

    def test_modifyHike(self):
        hike1 = Hike.objects.get(title="Climbing")
        hike1.title = "modifyTest"
        hike1.length = 10
        hike1.expected_time = 10
        hike1.ascent = 10
        hike1.difficulty = "hard"
        hike1.start_point.latitude = 0.1
        hike1.start_point.province = "modifyTestProvince"
        hike1.start_point.village = "modifyTestVillage"
        hike1.start_point.address = "modifyTestAddress"
        hike1.end_point.latitude = 0.1
        hike1.end_point.province = "modifyTestProvince"
        hike1.end_point.village = "modifyTestVillage"
        hike1.end_point.address = "modifyTestAddress"
        hike1.save()
        hike1 = Hike.objects.all()

        util_assertion(self, hike1)


class deleteHikeTest(TestCase):
    def setUp(self) -> None:
        set_up()
        return super().setUp()

    def test_deleteHikeById(self):
        obj = Hike.objects.get(title="Trekking")
        obj.delete()
        hike2 = Hike.objects.all()
        self.assertTrue(hike2.exists())

    def test_deleteAllHikes(self):
        Hike.objects.all().delete()
        hike2 = Hike.objects.all()
        self.assertFalse(hike2.exists())


class CustomerProfileTest(TestCase):
    def setUp(self) -> None:
        c1 = CustomUser(email=TEST_EMAIL, role="Testrole")
        c1.save()
        CustomerProfile.objects.create(user=c1,
                                       min_length=0.01,
                                       max_length=0.01,
                                       min_time=1,
                                       max_time=1,
                                       min_altitude=1,
                                       max_altitude=1)

        return super().setUp()

    def test_CustomerProfile(self):
        cp1 = CustomerProfile.objects.all()
        self.assertEqual(cp1[0].user.email, TEST_EMAIL)
        self.assertEqual(cp1[0].user.role, "Testrole")
        self.assertEqual(cp1[0].min_length, 0.01)
        self.assertEqual(cp1[0].max_length, 0.01)
        self.assertEqual(cp1[0].min_time, 1)
        self.assertEqual(cp1[0].max_time, 1)
        self.assertEqual(cp1[0].min_altitude, 1)
        self.assertEqual(cp1[0].max_altitude, 1)

    def test_modifyProfile(self):
        p1 = CustomerProfile.objects.get(min_length=0.01)
        p1.min_altitude = 2
        p1.min_length = 0.02
        p1.min_time = 2
        p1.max_altitude = 2
        p1.max_length = 0.02
        p1.max_time = 2
        p1.save()
        cp1 = CustomerProfile.objects.all()
        self.assertEqual(cp1[0].min_length, 0.02)
        self.assertEqual(cp1[0].max_length, 0.02)
        self.assertEqual(cp1[0].min_time, 2)
        self.assertEqual(cp1[0].max_time, 2)
        self.assertEqual(cp1[0].min_altitude, 2)
        self.assertEqual(cp1[0].max_altitude, 2)

    def test_deleteAllProfile(self):
        CustomerProfile.objects.all().delete()
        p2 = CustomerProfile.objects.all()
        self.assertFalse(p2.exists())


class Mockstats:
    def __init__(self):
        self.hikesFinished = 2
        self.kilometerWork = 18
        self.averagePase = 0.111
        self.gvertical = 135000
        self.most = 1
        self.quickest = 1
        self.max = 1
        self.fastest = 1
        self.longest = 1
        self.shortest = 1


class PerformanceStatsTest(TestCase):
    def setUp(self) -> None:
        c1 = CustomUser(email=TEST_EMAIL, role="Testrole")
        c1.save()

    @mock.patch("django.test.Client.get", return_value=Mockstats())
    def test_PerformanceStats(self, mocked):
        pass


class RecordPointTest(TestCase):
    def setUp(self) -> None:
        User = get_user_model()

        User.objects.create_user(email=TEST_USER,
                                 password='foo',
                                 role='smth')

        user_id = User.objects.get(email=TEST_USER)
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

        hike1 = Hike.objects.get(title="Climbing")

        UserHikeLog.objects.create(user=user_id,
                                   hike=hike1,
                                   counter=1,
                                   point=p1,
                                   datetime=datetime.now(),
                                   end=True)

        User.objects.create_user(email=TEST_USER2,
                                 password='foo2',
                                 role='smth2')

        user_id_2 = User.objects.get(email=TEST_USER2)
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

        hike2 = Hike.objects.get(title="Trekking")

        UserHikeLog.objects.create(user=user_id_2,
                                   hike=hike2,
                                   counter=2,
                                   point=p2,
                                   datetime=datetime.now(),

                                   end=False)

        return super().setUp()

    def test_PerformanceStats(self):
        u1 = UserHikeLog.objects.all()
        self.assertEqual(u1[0].user.email, TEST_USER)
        self.assertEqual(u1[0].user.check_password(PASSWORD), True)
        self.assertEqual(u1[0].user.role, "smth")
        self.assertEqual(u1[0].hike.title, "Climbing")
        self.assertEqual(u1[0].hike.length, 1)
        self.assertEqual(u1[0].hike.expected_time, 1)
        self.assertEqual(u1[0].hike.start_point.latitude, 0.01)
        self.assertEqual(u1[0].hike.start_point.longitude, 0.01)
        self.assertEqual(u1[0].hike.start_point.province, TEST_PROVINCE)
        self.assertEqual(u1[0].hike.start_point.village, TEST_VILLAGE)
        self.assertEqual(u1[0].hike.start_point.address, TEST_ADDRESS)
        self.assertEqual(u1[0].hike.end_point.latitude, 0.01)
        self.assertEqual(u1[0].hike.end_point.longitude, 0.01)
        self.assertEqual(u1[0].hike.end_point.province, TEST_PROVINCE)
        self.assertEqual(u1[0].hike.end_point.village, TEST_VILLAGE)
        self.assertEqual(u1[0].hike.end_point.address, TEST_ADDRESS)
        self.assertEqual(u1[0].hike.local_guide.email, TEST_USER)
        self.assertEqual(u1[0].user.check_password(PASSWORD), True)
        self.assertEqual(u1[0].hike.local_guide.role, "smth")
        self.assertEqual(u1[0].counter, 1)
        self.assertEqual(u1[0].point.latitude, 0.01)
        self.assertEqual(u1[0].point.longitude, 0.01)
        self.assertEqual(u1[0].point.province, TEST_PROVINCE)
        self.assertEqual(u1[0].point.village, TEST_VILLAGE)
        self.assertEqual(u1[0].point.address, TEST_ADDRESS)
        self.assertEqual(u1[0].end, True)

        self.assertEqual(u1[1].user.email, TEST_USER2)
        self.assertEqual(u1[1].user.check_password("foo2"), True)
        self.assertEqual(u1[1].user.role, "smth2")
        self.assertEqual(u1[1].hike.title, "Trekking")
        self.assertEqual(u1[1].hike.length, 2)
        self.assertEqual(u1[1].hike.expected_time, 2)
        self.assertEqual(u1[1].hike.start_point.latitude, 0.02)
        self.assertEqual(u1[1].hike.start_point.longitude, 0.02)
        self.assertEqual(u1[1].hike.start_point.province, TEST_PROVINCE2)
        self.assertEqual(u1[1].hike.start_point.village, TEST_VILLAGE2)
        self.assertEqual(u1[1].hike.start_point.address, TEST_ADDRESS2)
        self.assertEqual(u1[1].hike.end_point.latitude, 0.02)
        self.assertEqual(u1[1].hike.end_point.longitude, 0.02)
        self.assertEqual(u1[1].hike.end_point.province, TEST_PROVINCE2)
        self.assertEqual(u1[1].hike.end_point.village, TEST_VILLAGE2)
        self.assertEqual(u1[1].hike.end_point.address, TEST_ADDRESS2)
        self.assertEqual(u1[1].hike.local_guide.email, TEST_USER2)
        self.assertEqual(u1[1].user.check_password("foo2"), True)
        self.assertEqual(u1[1].hike.local_guide.role, "smth2")
        self.assertEqual(u1[1].counter, 2)
        self.assertEqual(u1[1].point.latitude, 0.02)
        self.assertEqual(u1[1].point.longitude, 0.02)
        self.assertEqual(u1[1].point.province, TEST_PROVINCE2)
        self.assertEqual(u1[1].point.village, TEST_VILLAGE2)
        self.assertEqual(u1[1].point.address, TEST_ADDRESS2)
        self.assertEqual(u1[1].end, False)

    def test_modifyPerformanceStates(self):
        u1 = UserHikeLog.objects.get(counter=1)
        u1.end = False
        u1.counter = 3
        u1.save()
        u1 = UserHikeLog.objects.all()
        self.assertEqual(u1[0].counter, 3)
        self.assertEqual(u1[0].end, False)

    def test_deletePerformanceStates(self):
        UserHikeLog.objects.all().delete()
        u = UserHikeLog.objects.all()
        self.assertFalse(u.exists())


class WeatherAlertTest(TestCase):
    def setUp(self) -> None:
        WeatherAlert.objects.create(condition="Snow",
                                    weather_lat=0.01,
                                    weather_lon=0.01,
                                    radius=1)

        WeatherAlert.objects.create(condition="Rain",
                                    weather_lat=0.02,
                                    weather_lon=0.02,
                                    radius=2)
        return super().setUp()

    def test_WeatherAlert(self):
        p1 = WeatherAlert.objects.all()
        self.assertEqual(p1[0].condition, "Snow")
        self.assertEqual(p1[0].weather_lat, 0.01)
        self.assertEqual(p1[0].weather_lon, 0.01)
        self.assertEqual(p1[0].radius, 1)
        self.assertEqual(p1[1].condition, "Rain")
        self.assertEqual(p1[1].weather_lat, 0.02)
        self.assertEqual(p1[1].weather_lon, 0.02)
        self.assertEqual(p1[1].radius, 2)
        pass

    def test_modifyWeatherAlert(self):
        alert1 = WeatherAlert.objects.get(condition="Snow")
        alert1.weather_lat = 0.03
        alert1.weather_lon = 0.03
        alert1.radius = 3
        alert1.save()
        alert2 = WeatherAlert.objects.get(condition="Snow")
        self.assertEqual(alert2.condition, "Snow")
        self.assertEqual(alert2.weather_lat, 0.03)
        self.assertEqual(alert2.weather_lon, 0.03)
        self.assertEqual(alert2.radius, 3)
        pass

    def test_deleteWeatherAlert(self):
        WeatherAlert.objects.all().delete()
        w = CustomerProfile.objects.all()
        self.assertFalse(w.exists())
