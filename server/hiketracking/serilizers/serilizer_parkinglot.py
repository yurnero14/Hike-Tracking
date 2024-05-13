from rest_framework import serializers

from hiketracking.models import ParkingLot


class PorkingLotSerializer( serializers.ModelSerializer ):
    class Meta:
        model = ParkingLot
        fields = ['name', 'fee', 'n_cars', 'desc', 'point']
