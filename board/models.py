from django.db import models

# Create your models here.
# class Board(models.Model):
#   board_index = models.BigAutoField(primary_key=True)
#   title = models.CharField(max_length=100)
#   content = models.TextField()
#   view = models.IntegerField()
#   board_create = models.DateTimeField()
#   board_update = models.DateTimeField(blank=True, null=True)
#   user_index = models.ForeignKey('User', models.DO_NOTHING, db_column='user_index')

#   class Meta:
#     managed = True
#     db_table = 'board'
