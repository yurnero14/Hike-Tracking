from django.contrib.auth.base_user import BaseUserManager


class CustomUserManager( BaseUserManager ):
    def create_user(self, email, role, password=None, **extra_fields):
        """
        Creates and saves a User with the given email, role and password.
        """
        if not email:
            raise ValueError( 'Users must have an email address' )

        user = self.model(
            email=self.normalize_email( email ),
            role=role,
            **extra_fields
        )

        user.set_password( password )
        user.save( using=self._db )
        return user

    def create_superuser(self, email, role, password=None, **extra_fields):
        """
        Creates and saves a superuser with the given email, role and password.
        """
        extra_fields.setdefault( 'is_staff', True )
        extra_fields.setdefault( 'is_superuser', True )
        extra_fields.setdefault( 'is_active', True )
        extra_fields.setdefault( 'is_confirmed', True )
        if extra_fields.get( 'is_staff' ) is not True:
            raise ValueError( 'Superuser must have is_staff=True.' )
        if extra_fields.get( 'is_superuser' ) is not True:
            raise ValueError( 'Superuser must have is_superuser=True.' )
        return self.create_user( email, role, password, **extra_fields )
