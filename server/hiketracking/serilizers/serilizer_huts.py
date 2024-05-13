from rest_framework import serializers

from hiketracking.models import Hut, Facility


class HuntsSerializer( serializers.ModelSerializer ):
    class Meta:
        model = Hut
        fields = ['name', 'n_beds', 'fee', 'ascent', 'phone',
                  'email', 'web_site', 'desc', 'point']


class FacilitySerializer( serializers.ModelSerializer ):
    class Meta:
        model = Facility
        fields = '__all__'
