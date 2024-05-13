from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from hiketracking.models import CustomUser, CustomerProfile


# User Serializer
class UserSerializer( serializers.ModelSerializer ):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'role']


# Register Serializer
class RegisterSerializer( serializers.ModelSerializer ):
    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'password', 'role')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user( validated_data['email'], validated_data['role'],
                                               validated_data['password'] )

        return user


class AuthTokenCustomSerializer( serializers.Serializer ):
    email = serializers.CharField(
        label=_( "email" ),
        write_only=True
    )
    password = serializers.CharField(
        label=_( "Password" ),
        style={'input_type': 'password'},
        trim_whitespace=False,
        write_only=True
    )

    def validate(self, attrs):
        email = attrs.get( 'email' )
        password = attrs.get( 'password' )

        if email and password:
            user = authenticate( request=self.context.get( 'request' ),
                                 email=email, password=password )

            # To authenticate call simply returns None for is_active=False
            # users. (Assuming the default ModelBackend authentication
            # backend.)
            if not user:
                msg = _( 'Unable to log in with provided credentials.' )
                raise serializers.ValidationError( msg, code='authorization' )
        else:
            msg = _( 'Must include "email" and "password".' )
            raise serializers.ValidationError( msg, code='authorization' )

        attrs['user'] = user
        return attrs


class SessionsSerializer( serializers.ModelSerializer ):
    class Meta:
        model = CustomUser
        fields = ['email', 'role']


class CustomerProfileSerializer( serializers.ModelSerializer ):
    class Meta:
        model = CustomerProfile
        fields = '__all__'

    def create(self, validated_data):
        return CustomerProfile.objects.create( **validated_data )

    def update(self, instance, validated_data):
        instance.min_length = validated_data.get('min_length')
        instance.max_length = validated_data.get('max_length')
        instance.min_time = validated_data.get('min_time')
        instance.max_time = validated_data.get('max_time')
        instance.min_altitude = validated_data.get('min_altitude')
        instance.max_altitude = validated_data.get('max_altitude')
        instance.difficulty = validated_data.get('difficulty')
        instance.save()
        return instance
