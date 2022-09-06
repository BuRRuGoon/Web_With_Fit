from django.urls import path
from . import views

app_name = 'fitness'

urlpatterns = [
    path('', views.index, name=""),                     # 메인
    path('withfit/', views.index, name="index"),        # 메인
    path('get_rank/', views.get_rank),                  # 메인-랭킹json

    path('select/', views.select, name='select'),       # 운동, 인원 수 선택
    path('player/', views.player, name='player'),       # Ajax
    
    path('play/', views.play, name='play'),             # 플레이
    path('result/', views.result, name='result'),       # 결과화면
    path('get_result/', views.get_result)               # 결과화면-랭킹json
]
