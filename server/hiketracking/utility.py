
from functools import partial

from geopy.geocoders import Nominatim

from hiketracking.models import Point
from hiketracking.serilizers import HikeHutSerializer

#import gpxpy
#import gpxpy.gpx

geolocator = Nominatim( user_agent="hiketracking" )


def get_province_and_village(lat, lon, address=False):
    try:
        reverse = partial( geolocator.reverse, language="it" )
        location = reverse( str( lat ) + ", " + str( lon ) )
        province = location.raw['address']['county']
        village = location.raw['address']['village']
        if address:
            return {'province': province, 'village': village,'address':location.adress}
        else:
            return {'province': province, 'village': village}
    except Exception :
        if address:
            return {'province': " ", 'village': " ", 'address': " "}
        return {'province': " ", 'village': " "}


def insert_point(pointSerializer, pointType="none"):
    sp = get_province_and_village(
        pointSerializer.data.get( 'latitude' ), pointSerializer.data.get( 'longitude' ) )
    point, created = Point.objects.get_or_create(
        latitude=pointSerializer.data.get( 'latitude' ),
        longitude=pointSerializer.data.get( 'longitude' ),
        defaults={
            'province': sp['province'],
            'village': sp['village'],
            'address': pointSerializer.data.get( 'address' ),
            'type': pointType
        }
    )
    return point

def findcoordinateInGpx(lat, long, address):
    was = """
    try:
        gpx_file = open("./"+str(address), 'r')
        gpx = gpxpy.parse(gpx_file)
        for track in gpx.tracks:
            for segment in track.segments:
                for point in segment.points:
                    if point.latitude==lat and point.longitude == long:
                        return True
        return False
    except Exception as e :
        print(e)
        return False
    """
    return
    
def link_hike_to_hut(hike, hut):
    if hike:
        hike_hut = {'hike': hike, 'hut': hut.id}
        hikeHutSerializer = HikeHutSerializer(data=hike_hut )
        if hikeHutSerializer.is_valid():

            hikeHutSerializer.save()
