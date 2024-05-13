import geopy.distance
from django.http import FileResponse
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from hiketracking.models import Hike, Point, HikeReferencePoint, CustomUser, CustomerProfile, UserHikeLog
from hiketracking.serilizers import HikeCounterIncludeSerializer, UserHikeLogSerializer, PointSerializerWithaddress
from hiketracking.utility import get_province_and_village
from datetime import datetime
import geopy.geocoders 


def get_reference_point(h):
        result = HikeReferencePoint.objects.filter(
                hike_id=h['id'] ).values()
        reference_list = []
        for r in result:
            refer_p = Point.objects.get( id=r['point_id'] )
            reference_list.append( {
                'reference_point_lat': refer_p.latitude,
                'reference_point_lng': refer_p.longitude,
                'reference_point_address': refer_p.address} )

        h['rp'] = reference_list

        startP = Point.objects.get( id=h['start_point_id'] )
        endP = Point.objects.get( id=h['end_point_id'] )

        h['start_point_lat'] = startP.latitude
        h['start_point_lng'] = startP.longitude
        h['start_point_address'] = startP.address
        h['end_point_lat'] = endP.latitude
        h['end_point_lng'] = endP.longitude
        h['end_point_address'] = endP.address

class HikeFile( APIView ):
    permission_classes = (permissions.AllowAny,)


    def get(self, request, hike_id):
        try:
            track = Hike.objects.get( id=hike_id ).track_file
            response = FileResponse( open( str( track ), 'rb' ) )
            response['Content-Language'] = 'attachment; filename=' + track.name
            return response
        except Exception as e:
            print( e )
            return Response( status=status.HTTP_500_INTERNAL_SERVER_ERROR )

    def put(self, request, hike_id):
        try:
            hikeFile = request.FILES['File']
        except Exception:
            Hike.objects.filter( id=hike_id ).delete()
            return Response( status=status.HTTP_400_BAD_REQUEST, data={"Error": "File Requested"} )

        try:
            hike = Hike.objects.get( id=hike_id )
            hike.track_file = hikeFile
            hike.save()
            return Response( status=status.HTTP_200_OK )
        except Exception:
            Hike.objects.filter( id=hike_id ).delete()
            return Response( status=status.HTTP_400_BAD_REQUEST, data={"Error": "Hike not found"} )


class Hikes( APIView ):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, format=None):

        filters = request.GET.get( 'filters', None )

        hikes = self.hikeView( filters, request )

        around = request.GET.get( 'around', None )

        if filters and around:
            filtered_hikes = []
            fields = around.split( "-" )
            radius = fields[2]
            input_coordinates = (fields[0], fields[1])

            for h in hikes:
                refer_p = Point.objects.get( id=h['start_point_id'] )
                hike_coordinates = (refer_p.latitude, refer_p.longitude)
                distance = geopy.distance.geodesic(
                    input_coordinates, hike_coordinates ).km

                print( (distance, radius) )
                if distance <= ( float( radius ) / 1000 ):
                    filtered_hikes.append( h )

            hikes = filtered_hikes

        result = {}
        for h in hikes:
            get_reference_point(h)

        return Response( hikes, status=status.HTTP_200_OK )

    def hikeView(self, filters, request):
        if filters:
            minLength = request.GET.get( 'minLength', None )
            maxLength = request.GET.get( 'maxLength', None )
            minTime = request.GET.get( 'minTime', None )
            maxTime = request.GET.get( 'maxTime', None )
            minAscent = request.GET.get( 'minAscent', None )
            maxAscent = request.GET.get( 'maxAscent', None )
            difficulty = request.GET.get( 'difficulty', None )
            province = request.GET.get( 'province', None )
            village = request.GET.get( 'village', None )

            hikes = Hike.objects.all()

            if minLength:
                hikes = hikes.filter( length__gte=minLength )
            if maxLength:
                hikes = hikes.filter( length__lte=maxLength )
            if minTime:
                hikes = hikes.filter( expected_time__gte=minTime )
            if maxTime:
                hikes = hikes.filter( expected_time__lte=maxTime )
            if minAscent:
                hikes = hikes.filter( ascent__gte=minAscent )
            if maxAscent:
                hikes = hikes.filter( ascent__lte=maxAscent )
            if difficulty:
                hikes = hikes.filter( difficulty=difficulty )

            if province:
                inner_query = Point.objects.filter( province=province )
                hikes = hikes.filter( start_point__in=inner_query )

            if village:
                inner_query = Point.objects.filter( village=village.lower().capitalize() )
                hikes = hikes.filter( start_point__in=inner_query )

            hikes = hikes.values()

        else:
            hikes = Hike.objects.values()
        return hikes

    def post(self, request, format=None):
        user_id = CustomUser.objects.get( email=request.user )
        data = request.data


        try:
            sp = get_province_and_village(
                data['start_point_lat'], data['start_point_lng'] )
            start_point_type = 'none'

            start_point = Point.objects.get_or_create(
                latitude=data['start_point_lat'],
                longitude=data['start_point_lng'],
                defaults={
                    'province': sp['province'],
                    'village': sp['village'],
                    'address': data['start_point_address'],
                    'type': start_point_type
                }
            )

            ep = get_province_and_village(
                data['end_point_lat'], data['end_point_lng'] )
            end_point_type = 'none'

            end_point = Point.objects.get_or_create(
                latitude=data['end_point_lat'],
                longitude=data['end_point_lng'],
                defaults={
                    'province': ep['province'],
                    'village': ep['village'],
                    'address': data['end_point_address'],
                    'type': end_point_type
                }
            )
            hike = Hike.objects.create(
                title=data['title'],
                length=data['length'],
                expected_time=data['expected_time'],
                ascent=data['ascent'],
                altitude=data['altitude'],
                difficulty=data['difficulty'],
                description=data['description'],
                local_guide=user_id,
                start_point=start_point[0],
                end_point=end_point[0] )
            hike.save()

            for rp in data['rp_list']:
                rp_cp = get_province_and_village(
                    rp['reference_point_lat'], rp['reference_point_lng'] )
                ref_point_type = 'none'
                ref_point = Point.objects.get_or_create(
                    latitude=rp['reference_point_lat'],
                    longitude=rp['reference_point_lng'],
                    defaults={
                        'province': rp_cp['province'],
                        'village': rp_cp['village'],
                        'address': rp['reference_point_address'],
                        'type': ref_point_type
                    }
                )

                rp_hike = HikeReferencePoint.objects.get_or_create(
                    hike=hike,
                    point=ref_point[0]
                )

                rp_hike[0].save()

            return Response( status=status.HTTP_200_OK, data={"hike_id": hike.id} )
        except Exception as e:
            print( e )
            return Response( status=status.HTTP_400_BAD_REQUEST, data={"Error": "Another hike with the same title exists! Try a new one"} )

    def put(self, request, format=None):
        user_id = CustomUser.objects.get( email=request.user )
        data = request.data


        try:
            sp = get_province_and_village(
                data['start_point_lat'], data['start_point_lng'] )
            start_point_type = 'none'

            start_point = Point.objects.get_or_create(
                latitude=data['start_point_lat'],
                longitude=data['start_point_lng'],
                defaults={
                    'province': sp['province'],
                    'village': sp['village'],
                    'address': data['start_point_address'],
                    'type': start_point_type
                }
            )

            ep = get_province_and_village(
                data['end_point_lat'], data['end_point_lng'] )
            end_point_type = 'none'

            end_point = Point.objects.get_or_create(
                latitude=data['end_point_lat'],
                longitude=data['end_point_lng'],
                defaults={
                    'province': ep['province'],
                    'village': ep['village'],
                    'address': data['end_point_address'],
                    'type': end_point_type
                }
            )
            hike = Hike.objects.update_or_create(
                {
                    'length':data['length'],
                    'expected_time':data['expected_time'],
                    'ascent':data['ascent'],
                    'altitude': data['altitude'],
                    'difficulty':data['difficulty'],
                    'description':data['description'],
                    'local_guide':user_id,
                    'start_point':start_point[0],
                    'end_point':end_point[0]
                },title=data['title'], )[0]
            hike.save()

            for rp in data['rp_list']:
                rp_cp = get_province_and_village(
                    rp['reference_point_lat'], rp['reference_point_lng'] )
                ref_point_type = 'none'
                ref_point = Point.objects.get_or_create(
                    latitude=rp['reference_point_lat'],
                    longitude=rp['reference_point_lng'],
                    defaults={
                        'province': rp_cp['province'],
                        'village': rp_cp['village'],
                        'address': rp['reference_point_address'],
                        'type': ref_point_type
                    }
                )

                rp_hike = HikeReferencePoint.objects.get_or_create(
                    hike=hike,
                    point=ref_point[0]
                )

                rp_hike[0].save()

            return Response( status=status.HTTP_200_OK, data={"hike_id": hike.id} )
        except Exception as e:
            print( e )
            return Response( status=status.HTTP_400_BAD_REQUEST, data={"Error": str( e )} )

class Hike_( APIView ):
    def get(self, request, title):

        try:
            hike = Hike.objects.filter( title=title ).values()
            for h in hike:
                result = HikeReferencePoint.objects.filter(
                    hike_id=h['id'] ).values()
                reference_list = []
                for r in result:
                    refer_p = Point.objects.get( id=r['point_id'] )
                    reference_list.append( {
                        'reference_point_lat': refer_p.latitude,
                        'reference_point_lng': refer_p.longitude,
                        'reference_point_address': refer_p.address} )

                h['rp'] = reference_list

                startP = Point.objects.get( id=h['start_point_id'] )
                endP = Point.objects.get( id=h['end_point_id'] )

                h['start_point_lat'] = startP.latitude
                h['start_point_lng'] = startP.longitude
                h['start_point_address'] = startP.address
                h['end_point_lat'] = endP.latitude
                h['end_point_lng'] = endP.longitude
                h['end_point_address'] = endP.address

                return Response( status=status.HTTP_200_OK, data={"hike": h} )
        except Exception as e:
            print( e )
            return Response( status=status.HTTP_404_NOT_FOUND )

    def delete(self, request, title):
        try:
            hike = Hike.objects.get( title=title )
            hike.track_file.delete()
            hike.delete()
            return Response( status=status.HTTP_200_OK )
        except Exception as e:
            return Response( status=status.HTTP_404_NOT_FOUND )


class Recommended( APIView ):

    def get(self, request):
        user_id = request.user.id

        try:
            profile = CustomerProfile.objects.get( user=user_id )
            hikes = Hike.objects.all()

            if profile.min_length:
                hikes = hikes.filter( length__gte=profile.min_length )
            if profile.max_length:
                hikes = hikes.filter( length__lte=profile.max_length )
            if profile.min_time:
                hikes = hikes.filter( expected_time__gte=profile.min_time )
            if profile.max_time:
                hikes = hikes.filter( expected_time__lte=profile.max_time )
            if profile.min_altitude:
                hikes = hikes.filter( ascent__gte=profile.min_altitude )
            if profile.max_altitude:
                hikes = hikes.filter( ascent__lte=profile.max_altitude )
            if profile.difficulty:
                hikes = hikes.filter( difficulty=profile.difficulty )

            hikes = hikes.values()

            result = {}
            for h in hikes:
                get_reference_point(h)

            return Response( hikes, status=status.HTTP_200_OK )

        except Exception as e:
            print( e )
            return Response( status=status.HTTP_400_BAD_REQUEST )


class Hiking( APIView ):
    serializer_class = HikeCounterIncludeSerializer

    def get(self, request, state):
        try:
            user = request.user
            user_log = UserHikeLog.objects.filter( user=user ).values()
            if state == "done":
                display_hikes = []
                hikes_done = user_log.filter(end = True).values()
                for hl in hikes_done:
                    h = Hike.objects.filter(id = hl['hike_id']).values()[0]
                    result = HikeReferencePoint.objects.filter(
                    hike_id=h['id'] ).values()
                    reference_list = []
                    for r in result:
                        

                        refer_p = Point.objects.get( id=r['point_id'] )
                        reference_list.append( {
                            'reference_point_id':refer_p.id,
                            'reference_point_lat': refer_p.latitude,
                            'reference_point_lng': refer_p.longitude,
                            'reference_point_address': refer_p.address} )

                    h['rp'] = reference_list

                    startP = Point.objects.get( id=h['start_point_id'] )
                    endP = Point.objects.get( id=h['end_point_id'] )
                    h['start_point_lat'] = startP.latitude
                    h['start_point_lng'] = startP.longitude
                    h['start_point_address'] = startP.address
                    h['end_point_lat'] = endP.latitude
                    h['end_point_lng'] = endP.longitude
                    h['end_point_address'] = endP.address
                    hike_logs = user_log.filter(
                            counter = hl['counter'],
                            hike_id = hl['hike_id']
                        ).values()
                    
                    run_log ={
                        'hike' : h,
                        'logs' : hike_logs
                    }
                    display_hikes.append(run_log)
                return Response( data=display_hikes,
                             status=status.HTTP_200_OK )

                        
            if state == "current":
                all_run = user_log.values('counter', 'hike_id').distinct()
                hikes_done = user_log.filter(end = True).values('counter', 'hike_id')
                current_hike = all_run.difference(hikes_done)
                if current_hike.exists():
                    current_hike = current_hike[0]
                else:
                    return Response (status=status.HTTP_404_NOT_FOUND, data={'error': 'There is not an uncompleted hike'})
                h = Hike.objects.filter(id = current_hike['hike_id']).values()[0]
                
                result = HikeReferencePoint.objects.filter(
                    hike_id=h['id'] ).values()
                reference_list = []
                for r in result:
                    refer_p = Point.objects.get( id=r['point_id'] )
                    reference_list.append( {
                        'reference_point_id':refer_p.id,
                        'reference_point_lat': refer_p.latitude,
                        'reference_point_lng': refer_p.longitude,
                        'reference_point_address': refer_p.address} )

                h['rp'] = reference_list

                startP = Point.objects.get( id=h['start_point_id'] )
                endP = Point.objects.get( id=h['end_point_id'] )
                h['start_point_lat'] = startP.latitude
                h['start_point_lng'] = startP.longitude
                h['start_point_address'] = startP.address
                h['end_point_lat'] = endP.latitude
                h['end_point_lng'] = endP.longitude
                h['end_point_address'] = endP.address
                hike_logs = user_log.filter(
                        counter = current_hike['counter'],
                        hike_id = current_hike['hike_id']
                    ).values()
                run_log = {
                    'hike' : h,
                    'logs' : hike_logs
                }
                return Response( data=run_log,
                             status=status.HTTP_200_OK )

                
        except Exception as e:
            print( e)
            return Response( status=status.HTTP_404_NOT_FOUND )

    def checkStartValidation(self):
        if self.userHikelogSerializer.is_valid():
            self.userHikelogSerializer.save()
            return Response( status=status.HTTP_200_OK )
        else:
            return Response( data=self.userHikelogSerializer.errors,
                             status=status.HTTP_400_BAD_REQUEST )

    def startHikeSerializer(self, hike, user, dt):
        userHikeLogCount = UserHikeLog.objects.filter(
            hike=hike,
            user=user,
            end=True ).count() + 1
        userHikelogSerializer = UserHikeLogSerializer( data={
            'user': user.id,
            'hike': hike.id,
            'counter': userHikeLogCount,
            'point': hike.start_point.id,
            'datetime' : dt
        } )
        return userHikelogSerializer

    def post(self, request):
        try:
            data = request.data
            user = request.user
            user_log = UserHikeLog.objects.filter( user=user ).values()
            all_run = user_log.values('counter', 'hike_id').distinct()
            hikes_done = user_log.filter(end = True).values('counter', 'hike_id')
            current_hike = all_run.difference(hikes_done)
            if  current_hike.exists():
                return Response(status=status.HTTP_400_BAD_REQUEST, data={'error': 'There is another ongoing hike! Please terminate it, to start a new one '})
            try:
                hike = Hike.objects.get( id=data['hike_id'] )
            except:
                
                return Response(status=status.HTTP_404_NOT_FOUND, data={'error': "Hike not found"})
            
            dt = datetime.strptime(data['datetime'], "%m/%d/%Y %H:%M:%S")
            # user = CustomUser.objects.get( request.user.id )
            
            self.userHikelogSerializer = self.startHikeSerializer( hike, user, dt )
            return self.checkStartValidation()
        

        except Exception as e:
            print(e)
            return Response( status=status.HTTP_404_NOT_FOUND )
    """
    def createPointHandler(self, pointData, hike, user, data):
        #useless, if it is not a reference point (so a point saved in the ReferencePoint table) it should not be created
        if findcoordinateInGpx(
                lat=pointData['latitude'],
                long=pointData['longitude'],
                address=hike.track_file
        ):

            info = get_province_and_village( pointData['latitude'], pointData['longitude'], True )
            pointserilizer = PointSerializerWithaddress( data={
                'latitude': pointData['latitude'],
                'longitude': pointData['longitude'],
                'province': info['province'],
                'village': info['village'],
                'address': info['address'],
                'type': "none"

            } )
            if pointserilizer.is_valid():
                pointserilizer.save()
                self.userHikelogSerializer = UserHikeLogSerializer( data={
                    'user': user.id,
                    'hike': hike.id,
                    'counter': data['counter'],
                    'point': pointserilizer.data['id']
                } )
                if self.userHikelogSerializer.is_valid():
                    self.userHikelogSerializer.save()
                    return Response(  status=status.HTTP_200_OK )
                else:
                    return Response( status=status.HTTP_400_BAD_REQUEST )
            else:
                return Response( status=status.HTTP_400_BAD_REQUEST )
        else:
            return Response( data={"error": "This point do not belong to the track"},
                             status=status.HTTP_400_BAD_REQUEST )
    """
    def put(self, request):
        
        try:
            user = request.user
            user_log = UserHikeLog.objects.filter( user=user ).values()
            all_run = user_log.values('counter', 'hike_id').distinct()
            hikes_done = user_log.filter(end = True).values('counter', 'hike_id')
            current_hike = all_run.difference(hikes_done)
            if not current_hike.exists():
                return Response( status=status.HTTP_400_BAD_REQUEST, data={'error': 'There is not an ongoing hike'} )
            current_hike = current_hike[0]
            counter = current_hike['counter']
            hike_id = current_hike['hike_id']
            filters = request.data.get( 'state', None )
            data = request.data
            hike = Hike.objects.get( id=hike_id )

            user = CustomUser.objects.get( id=request.user.id )
            if filters == 'end':
                dt = datetime.strptime(data['datetime'], "%m/%d/%Y %H:%M:%S")
                return self.endValidation( counter, hike, user, dt )
            elif filters == 'reference':
                pointData = data['point']
                try:
                    point = Point.objects.get( latitude=pointData['reference_point_lat'],
                                               longitude=pointData['reference_point_lng'] )
                    if HikeReferencePoint.objects.filter(point = point).exists():
                        self.userHikelogSerializer = UserHikeLogSerializer( data={
                            'user': user.id,
                            'hike': hike.id,
                            'counter': counter,
                            'point': point.id,
                            'datetime':  datetime.strptime(data['datetime'], "%m/%d/%Y %H:%M:%S")
                        } )

                        if self.userHikelogSerializer.is_valid():
                            self.userHikelogSerializer.save()
                            return Response(  status=status.HTTP_200_OK )
                        else:
                            return Response( status=status.HTTP_400_BAD_REQUEST )
                    else:
                        return Response(status=status.HTTP_404_NOT_FOUND, data={'error': 'This point is not a reference point of this hike'})
                except Exception as e:
                    print(e)
                    return Response(status=status.HTTP_404_NOT_FOUND)
            else:
                return Response( status=status.HTTP_400_BAD_REQUEST )
        except Exception as e:
            print(e)
            return Response( status=status.HTTP_400_BAD_REQUEST )


    def endValidation(self, counter, hike, user, dt):
        if UserHikeLog.objects.filter( user=user,
                                       hike=hike,
                                       counter=counter ).exists():
            userHikelogSerializer = self.endSerializer( counter, hike, user, dt )
            if userHikelogSerializer.is_valid():
                if not self.endHikePointExistes( counter, hike, user ):
                    userHikelogSerializer.save()
                    return Response( data=userHikelogSerializer.data,
                                     status=status.HTTP_200_OK )
                else:
                    return Response( status=status.HTTP_400_BAD_REQUEST, data={"error": "This hike is already terminated"} )
            else:
                return Response( status=status.HTTP_400_BAD_REQUEST )
        else:
            return Response( status=status.HTTP_400_BAD_REQUEST )

    

    def endHikePointExistes(self, counter, hike, user):
        UserHikeLog.objects.filter( user=user,
                                    hike=hike,
                                    counter= counter,
                                    point=hike.end_point.id ).exists()

    def endSerializer(self, counter, hike, user, dt):
        userHikelogSerializer = UserHikeLogSerializer( data={
            'user': user.id,
            'hike': hike.id,
            'counter': counter,
            'point': hike.end_point.id,
            'datetime': dt,
            'end': True
        } )
        return userHikelogSerializer


class HikePicture( APIView ):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, hike_id):
        try:
            picture = Hike.objects.get( id=hike_id ).picture
            response = FileResponse( open( str( picture ), 'rb' ) )
            response['Content-Language'] = 'attachment; filename=' + picture.name
            return response
        except Exception as e:
            print( e )
            return Response( status=status.HTTP_500_INTERNAL_SERVER_ERROR )

    def put(self, request, hike_id):
        try:
            hikePicture = request.FILES['Picture']
            hike = Hike.objects.get( id=hike_id )
            hike.picture = hikePicture
            hike.save()
            return Response( status=status.HTTP_200_OK )

        except Exception as e:
            print( e )
            return Response( status=status.HTTP_400_BAD_REQUEST, data={"Error": "Hike not found"} )


class Statistics(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        user_id = CustomUser.objects.get( email=request.user )
        statistics = {}

        finished_log = UserHikeLog.objects.filter(user_id=user_id).filter(end=True)
        
        if (finished_log.count() > 0):
            statistics['Total nr of hikes finished'] = finished_log.count()
            statistics['Different hikes finished'] = finished_log.values('hike_id').distinct().count()

            km_tot = 0
            ascent_tot = 0
            tot_pace = 0
            tot_speed = 0
            time_spent = {}
            pace = {}
            

            for f in finished_log:

                # Total Km
                hike = Hike.objects.get(id=f.hike.id)
                km_tot += hike.length 
                ascent_tot += hike.ascent

                # Longest / Shortest (hours)
                logs = UserHikeLog.objects\
                    .filter(user_id=user_id)\
                    .filter(hike_id=f.hike) \
                    .filter(counter=f.counter)\
                    .order_by('datetime')
                start = logs.first()
                end = logs.last()
                time = end.datetime - start.datetime
                time_spent[(f.hike, f.counter)] = time
                minutes = int(time.total_seconds()/60)
                pace[(f.hike, f.counter)] = minutes / hike.length
                tot_pace += minutes / hike.length
                if (minutes / 60 > 0):
                    tot_speed += (hike.length * 1000) / (minutes / 60)
                
            statistics['Total nr of kms walked'] = str(km_tot) + " kms"
            
            fastest_pace_hike = (min(pace, key=pace.get), min(pace.values()))
            statistics['Fastest paced hike (min/km)'] = {'title': fastest_pace_hike[0][0].title, 'time': str(round(fastest_pace_hike[1], 3)) + " min/km"}
            
            statistics['Average pace (min/km)'] = str(round(tot_pace / finished_log.count(), 3))+" min/km"
            statistics['Average vertical ascent speed (m/hour)'] = str(round(tot_speed / finished_log.count(), 3))+" m/hour"
            
            max_hike_time = (max(time_spent, key=time_spent.get), max(time_spent.values()))
            min_hike_time = (min(time_spent, key=time_spent.get), min(time_spent.values()))
            statistics['Longest (hours) hike completed'] = {'title': max_hike_time[0][0].title, 'time': str(max_hike_time[1])}
            statistics['Shortest (hours) hike completed'] = {'title': min_hike_time[0][0].title, 'time': str(min_hike_time[1])}

            hikes_id = finished_log.values('hike_id').distinct()
            hikes_id_list = [h['hike_id'] for h in hikes_id ]
            finished_hikes = Hike.objects.filter(id__in=hikes_id_list)  

            hike_length =  finished_hikes.order_by('length')  
            longest_hike = hike_length.last()
            shortest_hike = hike_length.first()
            statistics['Longest (km) hike completed'] = {'title': longest_hike.title, 'length': str(longest_hike.length) + " km"}
            statistics['Shortest (km) hike completed'] = {'title': shortest_hike.title, 'length': str(shortest_hike.length) + " km"}

            hike_ascent =  finished_hikes.order_by('altitude')  
            longest_hike = hike_ascent.last()
            statistics['Highest altitude reached'] = {'title': longest_hike.title, 'altitude': str(longest_hike.altitude) + " meters"}

            hike_ascent =  finished_hikes.order_by('ascent')  
            longest_hike = hike_ascent.last()
            statistics['Highest altitude range done'] = {'title': longest_hike.title, 'ascent': str(longest_hike.ascent) + " meters"}

            
        return Response(status=status.HTTP_200_OK, data=statistics)