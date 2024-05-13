from django.contrib.auth import get_user_model

from hiketracking.models import Point


def CreateTestUser():
    User = get_user_model()
    User.objects.create_user( email='test@user.com', password='foo', role='smth' )
    user_id = User.objects.get( email='test@user.com' )
    Point.objects.create( latitude=0.01, longitude=0.01, province="test province", village="test village",
                          address="test address" )
    p1 = Point.objects.get( latitude=0.01 )
    return p1
