from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from hiketracking.form import CustomUserCreationForm, CustomUserChangeForm
from hiketracking.models import Hike, HikeReferencePoint, CustomUser, Point, Hut, Facility, HutFacility, ParkingLot, \
    CustomerProfile, HutHike, UserHikeLog

# Register your models here.
admin.site.register( CustomerProfile )
admin.site.register( Point )
admin.site.register( Hike )
admin.site.register( HikeReferencePoint )
admin.site.register( Hut )
admin.site.register( Facility )
admin.site.register( HutFacility )
admin.site.register( ParkingLot )
admin.site.register( HutHike )
admin.site.register( UserHikeLog )


class CustomUserAdmin( UserAdmin ):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    list_display = ('email', 'is_staff', 'is_active', 'is_confirmed', 'role')
    list_filter = ('email', 'is_staff', 'is_active', 'is_confirmed', 'role')
    fieldsets = (
        (None, {'fields': ('email', 'password', 'role')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_confirmed')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'is_staff', 'is_active', 'role')}
         ),
    )
    search_fields = ('email',)
    ordering = ('email',)


admin.site.register( CustomUser, CustomUserAdmin )
