from rest_framework import serializers

from hiketracking.models import Point


class PointSerializer( serializers.ModelSerializer ):
    class Meta:
        model = Point
        fields = ['latitude', 'longitude', 'address']

class PointSerializerWithaddress( serializers.ModelSerializer ):
    class Meta:
        model = Point
        fields = '__all__'