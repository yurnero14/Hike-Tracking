from rest_framework import serializers

from hiketracking.models import Hike, UserHikeLog


class HikeSerializer( serializers.ModelSerializer ):
    class Meta:
        model = Hike
        fields = '__all__'


class UserHikeLogSerializer( serializers.ModelSerializer ):
    class Meta:
        model = UserHikeLog
        fields = '__all__'

class HikeCounterIncludeSerializer( serializers.ModelSerializer ):
    class Meta:
        model = Hike
        fields = '__all__'
