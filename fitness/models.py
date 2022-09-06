from django.db import models

class Fitness(models.Model):
  fitness_index = models.BigAutoField(primary_key=True)
  fitness_name = models.CharField(max_length=100)
  guide = models.TextField(default="")
  video = models.CharField(max_length=1000, null=True)

  class Meta:
    managed = True
    db_table = 'fitness'


class Monster(models.Model):
  monster_index = models.BigAutoField(primary_key=True)
  monster_name = models.CharField(max_length=100)
  monster_health = models.IntegerField()
  # monster_filename = models.CharField(max_length=300)

  class Meta:
    managed = True
    db_table = 'monster'


class Item(models.Model):
  item_index = models.BigAutoField(primary_key=True)
  item_name = models.CharField(max_length=100)
  item_filename = models.CharField(max_length=1000)

  class Meta:
    managed = True
    db_table = 'item'