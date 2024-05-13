from rest_framework import status, permissions
from rest_framework.generics import ListCreateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from hiketracking.models import HutHike, HutWorker, Hike, Point, HikeReferencePoint
from hiketracking.serilizers import HikeHutSerializer


class HutHikeView( ListCreateAPIView ):
    permission_classes = (permissions.AllowAny,)
    serializer_class = HikeHutSerializer
    queryset = HutHike.objects.all()


class HikesHutWorker( APIView ):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        user_id = request.user.id

        try:
            hut = HutWorker.objects.get( hutworker_id=user_id )
            hike_ids = HutHike.objects.filter( hut_id=hut.id )

            result = []
            for h in hike_ids:
                hike = Hike.objects.filter( id=h.hike.id ).values()[0]

                points = HikeReferencePoint.objects.filter(
                    hike_id=hike['id'] ).values()
                reference_list = []
                for r in points:
                    refer_p = Point.objects.get( id=r['point_id'] )
                    reference_list.append( {
                        'reference_point_lat': refer_p.latitude,
                        'reference_point_lng': refer_p.longitude,
                        'reference_point_address': refer_p.address} )

                hike['rp'] = reference_list

                startP = Point.objects.get( id=hike['start_point_id'] )
                endP = Point.objects.get( id=hike['end_point_id'] )

                hike['start_point_lat'] = startP.latitude
                hike['start_point_lng'] = startP.longitude
                hike['start_point_address'] = startP.address
                hike['end_point_lat'] = endP.latitude
                hike['end_point_lng'] = endP.longitude
                hike['end_point_address'] = endP.address

                result.append( hike )

            return Response( status=status.HTTP_200_OK, data=result )

        except Exception as e:
            print( e )
            return Response( status=status.HTTP_400_BAD_REQUEST )

    def put(self, request):
        if request.data and \
                'condition' in request.data and \
                'condition_description' in request.data and \
                'hike_id' in request.data:

            try:
                hike = Hike.objects.get( id=request.data["hike_id"] )
                hike.condition = request.data["condition"]
                hike.condition_description = request.data["condition_description"]
                hike.save()
                return Response( status=status.HTTP_200_OK )

            except:
                return Response( status=status.HTTP_400_BAD_REQUEST )
        else:
            return Response( status=status.HTTP_400_BAD_REQUEST )
