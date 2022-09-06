from django.db import models

# User
class User(models.Model):
  user_index = models.BigAutoField(primary_key=True)
  email = models.CharField(max_length=50, unique=True)
  password = models.CharField(max_length=50)
  name = models.CharField(max_length=30)
  user_create = models.DateTimeField(blank=True, null=True)
  level = models.IntegerField(default=1)
  exp = models.BigIntegerField(default=0)
  best_score_fit1 = models.IntegerField(null=True)
  best_score_fit2 = models.IntegerField(null=True)
  best_score_fit3 = models.IntegerField(null=True)
  best_score_fit4 = models.IntegerField(null=True)
  is_item_ironman = models.BooleanField(default=False)
  is_item_suit = models.BooleanField(default=False)

  class Meta:
    managed = True
    db_table = 'user'
