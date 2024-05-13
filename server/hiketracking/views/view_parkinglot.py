from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
import geopy.distance
from hiketracking.models import ParkingLot, Point
from hiketracking.serilizers.serilizer_parkinglot import PorkingLotSerializer
from hiketracking.serilizers.serilizer_point import PointSerializer
from hiketracking.utility import insert_point


class ParkingLotAPI( APIView ):
    permission_classes = (permissions.AllowAny,)
    serializer_class = PorkingLotSerializer

    def get(self, request):
        RADIUS = 5

        try:
            filters = request.GET.get( 'filters', None )

            listParkigLot = ParkingLot.objects.all().values()

            if filters:
                start_lat = request.GET.get( 'start_lat', None )
                start_lon = request.GET.get( 'start_lon', None )
                
                if filters and start_lat and start_lon:
                    filtered_pl = []
                    input_coordinates = (start_lat, start_lon)

                    for h in listParkigLot:
                        refer_p = Point.objects.get( id=h['point_id'] )
                        pl_coordinates = (refer_p.latitude, refer_p.longitude)
                        distance = geopy.distance.geodesic(
                            input_coordinates, pl_coordinates ).km

                        if distance <= float( RADIUS ):
                            filtered_pl.append( h )

                    listParkigLot = filtered_pl
          
                
            result = []
            
            for p in listParkigLot:
                point = Point.objects.get( id=p['point_id'] )
                p['lat'] = point.latitude
                p['lon'] = point.longitude
                p['address'] = point.address
                result.append( p )

            return Response( result )
        except Exception as e:
            return Response( status=status.HTTP_500_INTERNAL_SERVER_ERROR, data=e )

    def post(self, request):
        pointSerializer = PointSerializer( data=request.data['position'] )
        if pointSerializer.is_valid():
            point = insert_point( pointSerializer, 'parking_lot' )
            serializer = self.serializer_class( data={**request.data, 'point': point.id} )
            if serializer.is_valid():
                serializer.save()
                return Response( serializer.data, status=status.HTTP_201_CREATED )
            return Response( serializer.errors, status=status.HTTP_400_BAD_REQUEST )
        else:
            return Response( pointSerializer.errors, status=status.HTTP_400_BAD_REQUEST )
