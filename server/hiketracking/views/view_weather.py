from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
import geopy.distance
from django.db.models import Sum
from hiketracking.models import WeatherAlert, CustomUser, UserHikeLog, Hike, Point, HikeReferencePoint

class Weather(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self, request):
        try:
            alerts = WeatherAlert.objects.all()
            resp = []
            for a in alerts:
                resp.append({
                    'condition': a.condition,
                    'position': [a.weather_lat, a.weather_lon],
                    'radius': a.radius
                })
            return Response(status=status.HTTP_200_OK, data=resp)
        except Exception as e:
            return Response( status=status.HTTP_500_INTERNAL_SERVER_ERROR, data=e )
    
    def post(self, request, format=None):
        try:
            
            
            data = request.data
            condition = data["condition"]
            weather_lat = data["position"][0]
            weather_lon = data["position"][1]
            radius = data["radius"]
            WeatherAlert.objects.get_or_create(
                condition=condition, 
                weather_lat=weather_lat,
                weather_lon=weather_lon, 
                radius=radius)
            return Response( status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response( status=status.HTTP_500_INTERNAL_SERVER_ERROR, data=e )
    
    def delete(self, request):
        try:
            WeatherAlert.objects.all().delete()
            return Response( status=status.HTTP_200_OK)
        except Exception as e:
            return Response( status=status.HTTP_500_INTERNAL_SERVER_ERROR, data=e )
    

class Alert(APIView):
    
    def get(self, request):
        try:
            user_id = CustomUser.objects.get( email=request.user )
            active_hikes = UserHikeLog.objects \
                            .filter(user_id=user_id) \
                            .values('hike_id', 'counter') \
                            .order_by('hike_id', 'counter') \
                            .annotate(is_end=Sum('end')) \
                            .filter(is_end=0)

            alerts = []
            
            if len(active_hikes) == 1:
                hike = Hike.objects.get(id=active_hikes[0]['hike_id'])
                hike_start_point = Point.objects.get(id=hike.start_point.id)
                hike_end_point = Point.objects.get(id=hike.end_point.id)
                all_points = []
                all_points.append(hike_start_point)
                all_points.append(hike_end_point)
                ref_point = HikeReferencePoint.objects.filter(hike=hike)
                for ref in ref_point:
                    all_points.append(Point.objects.get(id=ref.point.id))
                
                all_alerts = WeatherAlert.objects.all()
                for alert in all_alerts.values():
                    for point in all_points:
                        point_coordinates = (point.latitude, point.longitude)
                        alert_coordinates = (alert['weather_lat'], alert['weather_lon'])
                        
                        distance = geopy.distance.geodesic(point_coordinates, alert_coordinates).km
                        if (distance <= float(alert['radius']/1000)):
                            if alert not in alerts:
                                alerts.append(alert)

            return Response( status=status.HTTP_200_OK, data=alerts)
        except Exception as e:
            print(e)
            return Response( status=status.HTTP_400_BAD_REQUEST)

        
