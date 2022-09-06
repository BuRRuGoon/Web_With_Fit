from django.db import models

class Rank(models.Model):
  rank_index = models.BigAutoField(primary_key=True)
  rank_score = models.IntegerField(null=True)
  option = models.CharField(max_length=1)
  rank_fitness_name = models.CharField(max_length=50)
  rank_user_name = models.CharField(max_length=50)
  stage = models.IntegerField(null=True)
  fitness_index = models.ForeignKey('fitness.Fitness', on_delete=models.CASCADE, db_column='fitness_index')
  user_index = models.ForeignKey('user.User', on_delete=models.CASCADE, db_column='user_index')

  class Meta:
    managed = True
    db_table = 'rank'
