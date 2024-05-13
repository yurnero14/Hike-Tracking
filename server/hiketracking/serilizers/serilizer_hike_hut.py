from rest_framework import serializers

from hiketracking.models import HutHike


class HikeHutSerializer( serializers.ModelSerializer ):
    class Meta:
        model = HutHike
        fields = '__all__'
