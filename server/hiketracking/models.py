from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.db import models
from django.utils import timezone

from hiketracking.manger import CustomUserManager


class CustomUser( AbstractUser ):
    username = None
    email = models.EmailField( 'email address', unique=True )
    role = models.CharField( max_length=200 )
    is_staff = models.BooleanField( default=False )
    is_confirmed = models.BooleanField( default=False )
    is_active = models.BooleanField( default=False )
    date_joined = models.DateTimeField( default=timezone.now )
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['role']
    objects = CustomUserManager()

    def __str__(self):
        return self.email


class CustomerProfile( models.Model ):
    user = models.OneToOneField( CustomUser, on_delete=models.CASCADE )
    min_length = models.FloatField( null=True )
    max_length = models.FloatField( null=True )
    min_time = models.IntegerField( null=True )
    max_time = models.IntegerField( null=True )
    min_altitude = models.IntegerField( null=True )
    max_altitude = models.IntegerField( null=True )

    class Difficulty( models.TextChoices ):
        ALL = "All"
        TOURIST = "Tourist"
        HIKER = "Hiker"
        PRO_HIKER = "Pro Hiker"

    difficulty = models.CharField( choices=Difficulty.choices, max_length=30, null=True )


class Point( models.Model ):
    latitude = models.FloatField()
    longitude = models.FloatField()
    province = models.CharField( max_length=100,null=True,blank=True )
    village = models.CharField( max_length=30 , null=True,blank=True)
    address = models.CharField( max_length=100,null=True ,blank=True)

    class Type( models.TextChoices ):
        NONE = "none"
        HUT = "hut"
        PARKING_LOT = "parking_lot"

    type = models.CharField( max_length=15, choices=Type.choices,null=True )

    class Meta:
        constraints = [
            models.UniqueConstraint( fields=['latitude', 'longitude'], name='point' )
        ]

    def __str__(self):
        return self.id.__str__() + '_' + self.type


class Hike( models.Model ):
    id = models.BigAutoField( primary_key=True )
    title = models.CharField( max_length=30, unique=True )
    length = models.IntegerField()
    expected_time = models.IntegerField()
    ascent = models.IntegerField()
    altitude = models.IntegerField(default=1000)
    difficulty = models.CharField( max_length=100 )
    description = models.CharField( max_length=200 )
    track_file = models.FileField( upload_to='tracks' )
    start_point = models.ForeignKey( Point, on_delete=models.CASCADE, related_name="start_point" )
    end_point = models.ForeignKey( Point, on_delete=models.CASCADE, related_name="end_point" )
    local_guide = models.ForeignKey( CustomUser, on_delete=models.CASCADE )
    picture = models.FileField( default='hikePictures/defultImage.jpg' , upload_to='hikePictures' )

    class Condition( models.TextChoices ):
        OPEN = "Open"
        CLOSED = "Closed"
        PARTLY_BLOCKED = "Partly blocked"
        SPECIAL_GEAR = "Requires special gear"

    condition = models.CharField( blank=True, max_length=30, choices=Condition.choices )
    condition_description = models.CharField( blank=True, max_length=100 )
    condition = models.CharField( max_length=30, choices=Condition.choices, default=Condition.OPEN )
    condition_description = models.CharField( max_length=100, default="Open" )


    def __str__(self):
        return self.title


class HikeReferencePoint( models.Model ):
    hike = models.ForeignKey( Hike, on_delete=models.CASCADE )
    point = models.ForeignKey( Point, on_delete=models.CASCADE )

    def __str__(self):
        return self.hike.title + " " + self.point.type

    class Meta:
        constraints = [
            models.UniqueConstraint( fields=['hike', 'point'], name='hikeref' )
        ]


class Hut( models.Model ):
    name = models.CharField( max_length=50, unique=True )
    n_beds = models.IntegerField()
    fee = models.FloatField()
    ascent = models.IntegerField( default=0 )
    phone_regex = RegexValidator( regex=r'^\+?1?\d{4,15}$',
                                  message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed." )
    phone = models.CharField( validators=[phone_regex], max_length=17, default='+00000000' )
    email = models.EmailField( default="hutsemail" )
    web_site = models.CharField( max_length=50, blank=True, default='' )
    desc = models.TextField( blank=True, default=" " )
    point = models.OneToOneField( Point, on_delete=models.CASCADE )
    picture = models.FileField( default='hutsPicture/defultImage.jpg',upload_to='hutsPicture' )

    def __str__(self):
        return self.name


class HutWorker( models.Model ):
    hutworker = models.OneToOneField( CustomUser, on_delete=models.CASCADE )
    hut = models.ForeignKey( Hut, on_delete=models.CASCADE )


"""
class HutPhoto( models.Model ):
    hut = models.ForeignKey( Hut, on_delete=models.CASCADE )
    track_file = models.FileField( upload_to='hutimages' )
"""


class Facility( models.Model ):
    name = models.CharField( max_length=100, unique=True )

    def __str__(self):
        return self.name


class HutFacility( models.Model ):
    hut = models.ForeignKey( Hut, on_delete=models.CASCADE )
    facility = models.ForeignKey( Facility, on_delete=models.CASCADE )

    def __str__(self):
        return self.hut.name + " " + self.facility.name

    class Meta:
        constraints = [
            models.UniqueConstraint( fields=['hut', 'facility'], name='hutfac' )
        ]


class ParkingLot( models.Model ):
    name = models.CharField( max_length=50, unique=True )
    fee = models.FloatField()
    n_cars = models.IntegerField()
    desc = models.TextField( blank=True, default="" )
    point = models.OneToOneField( Point, on_delete=models.CASCADE )
    desc = models.TextField( blank=True, default=" " )
    point = models.OneToOneField( Point, on_delete=models.CASCADE )

    def __str__(self):
        return self.name


class HutHike( models.Model ):
    hike = models.ForeignKey( Hike, on_delete=models.CASCADE )
    hut = models.ForeignKey( Hut, on_delete=models.CASCADE )

    class Meta:
        constraints = [
            models.UniqueConstraint( fields=['hut', 'hike'], name='huthike' )
        ]

    def __str__(self):
        return "hut:" + str( self.hut ) + " hike:" + str( self.hike )


class UserHikeLog( models.Model ):
    user = models.ForeignKey( CustomUser, on_delete=models.CASCADE )
    hike = models.ForeignKey( Hike, on_delete=models.CASCADE )
    counter = models.IntegerField()  # useful to differentiate different run of the same hike
    point = models.ForeignKey( Point, on_delete=models.CASCADE )
    datetime = models.DateTimeField( )
    end = models.BooleanField( default=False )

    def __str__(self):
        return "user:" + str( self.user ) + " hike:" + str( self.hike )


class WeatherAlert( models.Model ):
    class Condition( models.TextChoices ):
        SNOW = "Snow"
        STORM = "Storm"
        STRONG_WIND = "Strong wind"
        RAIN = "Rain"
        HAIL = "Hail"

    condition = models.CharField( choices=Condition.choices, max_length=30 )
    weather_lat = models.FloatField()
    weather_lon = models.FloatField()
    radius = models.IntegerField()
