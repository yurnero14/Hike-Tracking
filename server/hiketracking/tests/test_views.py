import json
from http import HTTPStatus

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.test import Client

from hiketracking.models import Point, Hut, Hike, CustomUser, HutWorker, HutHike


class HutTest( TestCase ):
    def setUp(self):
        self.data = {
            "name": "hutTest12",
            "n_beds": 10,
            "fee": 10,
            "ascent": 3,
            "phone": "+989128029591",
            "email": "test@g.com",
            "web_site": "www.google.com",
            "desc": "",
            "picture":"hikePictures/defultImage.jpg",
            "position": {
                "latitude": 45.1352,
                "longitude": 7.0852,
                "address": "First Parking lot to be uploaded"
            },
            "services": [
                "shower"
            ],
            "relatedHike": [1, 2]
        }

        self.url = "/hiketracking/hut/"
"""
    def testAddHut(self):
        response = self.client.post( self.url, self.data, content_type='multipart/form')
        self.assertEqual( response.status_code, HTTPStatus.OK )
        self.assertEqual( response.data.get( "name" ), self.data.get( "name" ) )
        self.assertEqual( response.data.get( "n_beds" ), self.data.get( "n_beds" ) )
        self.assertEqual( response.data.get( "fee" ), self.data.get( "fee" ) )
        self.assertEqual( response.data.get( "ascent" ), self.data.get( "ascent" ) )
        self.assertEqual( response.data.get( "phone" ), self.data.get( "phone" ) )
        self.assertEqual( response.data.get( "email" ), self.data.get( "email" ) )
        self.assertEqual( response.data.get( "web_site" ), self.data.get( "web_site" ) )
        self.assertEqual( response.data.get( "desc" ), self.data.get( "desc" ) )

    def testAddHutBadcordination(self):
        self.data['position']['longitude'] = 'two'
        response = self.client.post( self.url,
                                     json.dumps( self.data ),
                                     content_type=self.context_type
                                     )

        self.assertEqual( response.status_code, HTTPStatus.BAD_REQUEST )

    def testAddHutEmptyAdress(self):
        self.data['position'] = {
                "latitude": 45.1352,
                "longitude": 7.0852,
                "address": "First Hut  to be uploaded"
            }  
        self.data['position']['address'] = ""
        response = self.client.post( self.url,
                                     json.dumps( self.data ),
                                     content_type=self.context_type
                                     )

        self.assertEqual( response.status_code, HTTPStatus.OK )

    def testAddHutNullDiscriptiomn(self):
        self.data['desc'] = None
        response = self.client.post( self.url,
                                     json.dumps( self.data ),
                                     content_type=self.context_type
                                     )

        self.assertEqual( response.status_code, HTTPStatus.BAD_REQUEST )

    def testEmptyRelatedHike(self):
        self.data['relatedHike'] = []
        response = self.client.post( self.url,
                                     json.dumps( self.data ),
                                     content_type=self.context_type
                                     )

        self.assertEqual( response.status_code, HTTPStatus.OK )

    def testbadPhoneNumber(self):
        self.data['phone'] = ["hi12413"]
        response = self.client.post( self.url,
                                     json.dumps( self.data ),
                                     content_type=self.context_type
                                     )

        self.assertEqual( response.status_code, HTTPStatus.BAD_REQUEST )

    def testbadPhoneNumber2(self):
        self.data['phone'] = "12345678909876543"
        response = self.client.post( self.url,
                                     json.dumps( self.data ),
                                     content_type=self.context_type
                                     )

        self.assertEqual( response.status_code, HTTPStatus.BAD_REQUEST )

    def testPhoneNumber(self):
        self.data['phone'] = "9128029591"
        response = self.client.post( self.url,
                                     json.dumps( self.data ),
                                     content_type=self.context_type
                                     )

        self.assertEqual( response.status_code, HTTPStatus.OK )

"""
class HutHikeTest( TestCase ):
    def setUp(self):
        User = get_user_model()
        User.objects.create_user( email='test@user.com', password='foo', role='smth' )
        user_id = User.objects.get( email='test@user.com' )
        p1 = Point( latitude=0.01, longitude=10.01, province="test province", village="test village",
                    address="test" )
        p2 = Point( latitude=0.31, longitude=10.01, province="test province", village="test village",
                    address="addresstest" )
        hunt = Hut( name="test parking pot name 1", n_beds=2,
                    fee=10, ascent=10,
                    phone="+999222", email="md@gmail.com",
                    web_site="www.hi.com",
                    desc="testHunt", point_id=2 )

        p1.save()
        p2.save()
        hunt.Point = p1
        hike = Hike.objects.create( title='Climbing', length=2, expected_time=1, ascent=1, difficulty='easy',
                                    start_point=p2,
                                    end_point=p2, local_guide=user_id )
        hunt.save()
        hike.save()
        self.data = {
            'hike': '1',
            'hut': '1'}
        self.url = self.url = '/hiketracking/HutHikeView/'
        self.context_type = "application/json"

    def test_hut_hike(self):
        response = self.client.post( self.url, json.dumps( self.data ),
                                     content_type=self.context_type )
        self.assertEqual( response.status_code, HTTPStatus.CREATED )


class AddParkingLotAPI( TestCase ):

    def setUp(self):
        self.data = {
            "name": "test@gmail.com",
            "position": {
                "latitude": 1,
                "longitude": 1,
                "address": "First Parking lot to be uploaded"
            },

            "desc": "life",
            "fee": 10,
            "n_cars": 10,

        }
        self.url = '/hiketracking/parkingLots/'
        self.context_type = "application/json"

    def test_add_parking_lot(self):
        response = self.client.post( self.url, json.dumps( self.data ),
                                     content_type="application/json" )
        self.assertEqual( response.status_code, HTTPStatus.CREATED )
        self.assertEqual( response.data.get( "name" ), "test@gmail.com" )
        self.assertEqual( response.data.get( "desc" ), "life" )
        self.assertEqual( response.data.get( "fee" ), 10 )
        self.assertEqual( response.data.get( "n_cars" ), 10 )

    def test_Wrong_Position(self):
        self.data['position']['longitude'] = 'two'
        response = self.client.post( self.url, json.dumps( self.data ),
                                     content_type=self.context_type )
        self.assertEqual( response.status_code, HTTPStatus.BAD_REQUEST )

    def test_Wrong_Fee(self):
        self.data['fee'] = 'sixty-nine'
        response = self.client.post( self.url, json.dumps( self.data ),
                                     content_type=self.context_type )
        self.assertEqual( response.status_code, HTTPStatus.BAD_REQUEST )

class HikesHutWorker( TestCase ):
    def setUp(self):
        User = get_user_model()
        User.objects.create_user( email='test@user.com', password='foo', role='smth' )
        user_id = User.objects.get( email='test@user.com' )

        p1 = Point( latitude=0.01, longitude=10.01, province="test province", village="test village",
                    address="test" )
        p2 = Point( latitude=0.31, longitude=10.01, province="test province", village="test village",
                    address="addresstest" )
        hunt = Hut( name="test parking pot name 1", n_beds=2,
                    fee=10, ascent=10,
                    phone="+999222", email="md@gmail.com",
                    web_site="www.hi.com",
                    desc="testHunt", point_id=2 )



        p1.save()
        p2.save()
        hunt.Point = p1
        hike = Hike.objects.create( title='Climbing', length=2, expected_time=1, ascent=1, difficulty='easy',
                                    start_point=p2,
                                    end_point=p2, local_guide=user_id )
        hunt.save()
        hike.save()
        HutHike.objects.create(hike_id=hike.id, hut_id=hunt.id)

        HutWorker.objects.create(hut_id=hunt.id, hutworker_id=1)

        self.url = self.url = '/hiketracking/worker/hikes/'
        self.context_type = "application/json"


    #def test_get_hut_worker(self):
       # c = Client()
      #  c.login(username="test@user.com", password="foo")
       # response = c.get('/hiketracking/worker/hikes/')
       # self.assertEqual(response.status_code, 200)

    def test_hut_worker(self):
        self.data = {

            "condition": 'Closed',
            "condition_description": 'hike closed',
            "hike_id": 1
        }
        response = self.client.put( self.url, json.dumps( self.data ),
                                     content_type=self.context_type )
        self.assertEqual( response.status_code, HTTPStatus.OK )

        a = list(Hike.objects.all().values())

        self.assertEqual(a[0]["condition"], self.data["condition"])
        self.assertEqual(a[0]["condition_description"], self.data["condition_description"])
        self.assertEqual(a[0]["id"], self.data["hike_id"])

    def test_wrong_attribute_condtion(self):
        self.data = {

            "conditio": "Closed",
            "condition_description": 'hike closed',
            "hike_id": 1
        }
        response = self.client.put(self.url, json.dumps(self.data),
                                   content_type=self.context_type)
        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)

    def test_wrong_attribute_condition_desc(self):
        self.data = {

            "condition": "Closed",
            "condition_descriptio": 'hike closed',
            "hike_id": 1
        }

        response = self.client.put(self.url, json.dumps(self.data),
                                   content_type=self.context_type)
        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)

    def test_wrong_attribute_hike_id(self):
        self.data = {
            "condition": "Closed",
            "condition_description": 'hike closed',
            "hike_i": 1
        }
        response = self.client.put(self.url, json.dumps(self.data),
                                   content_type=self.context_type)
        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)

    def test_wrong_hike_id(self):
        self.data = {

            "condition": "Closed",
            "condition_descriptio": 'hike closed',
            "hike_id": 3
        }
        response = self.client.put(self.url, json.dumps(self.data),
                                   content_type=self.context_type)
        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)

    def test_wrong_hike_id_two(self):
        self.data = {
            "condition": "Closed",
            "condition_descriptio": 'hike closed',
            "hike_id": "saddsa"
        }
        response = self.client.put(self.url, json.dumps(self.data),
                                   content_type=self.context_type)
        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)

    def test_missing_fields(self):

        self.data={
            "condition_description": 'hike closed',
            "hike_id": 1
        }
        response = self.client.put(self.url, json.dumps(self.data),
                                   content_type=self.context_type)
        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)

class ValidateLocalGuide(TestCase):

    def setUp(self):
        c1 = CustomUser(email="test@atest.com", role="local guide", is_staff=0, is_active=1)
        c1.save()

        c2 = CustomUser(email="test@test.com", role="Platform Manager", is_staff=0, is_confirmed=1, is_active=1)
        c2.save()

        self.url = self.url = '/hiketracking/users/validate/'
        self.context_type = "application/json"

    def test_retrieve_unconfirmed_Account(self):

        response = self.client.get(self.url, content_type = self.context_type)
        self.assertEqual(response.status_code, HTTPStatus.OK)
        cust_upd = CustomUser.objects.all()
        a = list(response.data.values())
        b = list(a[0].values())
        self.assertEqual(b[0]["email"], cust_upd[0].email)
        self.assertEqual(b[0]["role"], cust_upd[0].role)
        self.assertEqual(b[0]["is_staff"], cust_upd[0].is_staff)
        self.assertEqual(b[0]["is_active"], cust_upd[0].is_active)
        self.assertEqual(b[0]["is_confirmed"], cust_upd[0].is_confirmed)

    def test_account_confirmation_api(self):
        self.data = {
            "user_id": 1
        }
        response = self.client.post(self.url, json.dumps(self.data), content_type = self.context_type)
        self.assertEqual(response.status_code, HTTPStatus.OK)
        cust_upd = CustomUser.objects.all()
        self.assertEqual(cust_upd[0].email, "test@atest.com")
        self.assertEqual(cust_upd[0].role, "local guide")
        self.assertEqual(cust_upd[0].is_staff, 0)
        self.assertEqual(cust_upd[0].is_active, 1)
        self.assertEqual(cust_upd[0].is_confirmed, 1)

    def test_wrong_user_id(self):
        self.data = {
            "user_id": 0
        }
        response = self.client.post(self.url, json.dumps(self.data), content_type=self.context_type)
        self.assertEqual(response.status_code, HTTPStatus.INTERNAL_SERVER_ERROR )

    def test_user_not_active(self):
        CustomUser.objects.filter(id=1).update(is_active=0)
        self.data = {
            "user_id": 1
        }
        response = self.client.post(self.url, json.dumps(self.data), content_type=self.context_type)
        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)

    def test_wrong_self_data_attribute(self):

        self.data = {
            "id": 1
        }
        response = self.client.post(self.url, json.dumps(self.data), content_type=self.context_type)
        self.assertEqual(response.status_code, HTTPStatus.INTERNAL_SERVER_ERROR)
