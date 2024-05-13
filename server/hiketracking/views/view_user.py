from django.contrib.auth import login
from django.contrib.auth.models import User
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import EmailMessage
from django.shortcuts import render
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from knox.views import LoginView as KnoxLoginView
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from hiketracking.models import CustomUser, CustomerProfile, Hut, HutWorker
from hiketracking.serilizers.serilizer_user import UserSerializer, RegisterSerializer, AuthTokenCustomSerializer, \
    CustomerProfileSerializer
from hiketracking.tokens import account_activation_token


class UserList( generics.ListAPIView ):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer


class UserDetail( generics.RetrieveAPIView ):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer


class RegisterAPI( generics.GenericAPIView ):
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        working_hut = request.data.pop('working_hut',None)
        serializer = self.get_serializer( data=request.data )
        serializer.is_valid( raise_exception=True )
        serializer.is_active = False
        user = serializer.save()
        current_site = get_current_site( request )
        mail_subject = 'Activation link has been sent to your email id'
        message = render_to_string( './acc_active_email.html', {
            'user': user,
            'domain': current_site.domain,
            'uid': urlsafe_base64_encode( force_bytes( user.pk ) ),
            'token': account_activation_token.make_token( user ),
        } )
        to_email = user.email
        email = EmailMessage(
            mail_subject, message, to=[to_email]
        )
        try:
            email.send()
            if request.data['role'] == 'Hut Worker' and working_hut:
                hut = Hut.objects.get(name=working_hut)
                HutWorker.objects.create(hutworker = user, hut= hut)
            return Response( status=status.HTTP_200_OK, data={
                "message": 'Please confirm your email address to complete the registration'} )
        except Exception as e:
            user = CustomUser.objects.get( user.id )
            user.delete()
            return Response( status=status.HTTP_500_INTERNAL_SERVER_ERROR, data={
                "message": 'Server error', "exception": e} )


class ActivateAccount( KnoxLoginView ):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, uidb64, token, *args, **kwargs):
        try:
            uid = force_str( urlsafe_base64_decode( uidb64 ) )
            user = CustomUser.objects.get( pk=uid )
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and account_activation_token.check_token( user, token ):
            user.is_active = True
            user.save()
            login( request, user )
            super( ActivateAccount, self ).post( request, format=None )

            return render( request, "emailConfirmed.html" )
        else:
            return Response( status=status.HTTP_400_BAD_REQUEST, data={
                "massage": 'The confirmation link was invalid, possibly because it has already been used.'} )


class LoginAPI( KnoxLoginView ):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        try:
            u = CustomUser.objects.get(email=request.data['email'])
            if not u.is_active:
                return Response( status=status.HTTP_401_UNAUTHORIZED, data={"error" : 2} )
            user_role = u.role.lower().replace( " ", "" )
            if (u.role == 'Local Guide' or u.role == 'Hut Worker') and not u.is_confirmed:
                return Response( status=status.HTTP_401_UNAUTHORIZED, data={"error" : 1} )

        except:
            return Response( status=status.HTTP_401_UNAUTHORIZED, data={"error" : 0} )

        serializer = AuthTokenCustomSerializer( data=request.data )
        serializer.is_valid( raise_exception=True )
        user = serializer.validated_data['user']
        login( request, user )
        result = super( LoginAPI, self ).post( request, format=None )
        return Response( status=status.HTTP_200_OK,
                         data={"id":user.id, "user": user.email, "role": user_role,
                               "token": result.data['token']} )


class Sessions( generics.RetrieveAPIView ):
    def get(self, request):
        user = CustomUser.objects.get( email=request.user )
        return Response( status=status.HTTP_200_OK,
                         data={"id":user.id, "user": user.email, "role": user.role.lower().replace( " ", "" )} )


class AccountConfirmation( APIView ):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        users = CustomUser.objects.filter( is_confirmed=False ).filter( is_active=True ).values()
        filtered = []
        for u in users:
            if (u['role'] == 'Local Guide' or u['role'] == 'Hut Worker'):
                filtered.append(u)
        return Response( status=status.HTTP_200_OK, data={"users": filtered} )

    def post(self, request):
        try:
            if not request.data and "user_id" not in request.data:
                return Response( status=status.HTTP_400_BAD_REQUEST )

            user_id = request.data["user_id"]
            u = CustomUser.objects.get( id=user_id )
            if u.is_active:
                u.is_confirmed = True
                u.save()  # this will update only
                return Response( status=status.HTTP_200_OK )
            else:
                return Response( status=status.HTTP_400_BAD_REQUEST )
        except Exception:
            return Response( status=status.HTTP_500_INTERNAL_SERVER_ERROR )


class Profile( generics.RetrieveUpdateAPIView ):
    serializer_class = CustomerProfileSerializer

    def get(self, request):
        try:
            user_id = request.user.id
            profile = CustomerProfile.objects.filter(user_id=user_id).values()
            if profile:
                return Response(status=status.HTTP_200_OK, data=profile)
            else:
                return Response(status=status.HTTP_400_BAD_REQUEST)

        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR )

    def get_queryset(self):
        try:
            profile = CustomerProfile.objects.get_or( user_id__exact=self.kwargs.get( 'pk' ) )
        except Exception:
            profile = None
        return profile

    def put(self, request, *args, **kwargs):
        user_id = request.user.id
        request.data['user'] = user_id
        user = CustomUser.objects.get( id=user_id)
        try:
            Customer_profile = CustomerProfile.objects.get( user=user )
        except Exception:
            Customer_profile = None

        try: 
            if Customer_profile:
                serializer = self.serializer_class( instance=Customer_profile, data={**request.data} )
            else:
                serializer = self.serializer_class( data={**request.data} )
            if serializer.is_valid():
                serializer.save()
                return Response( data=serializer.data, status=status.HTTP_200_OK )
            else:
                return Response( data=serializer.errors, status=status.HTTP_400_BAD_REQUEST )
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR )
