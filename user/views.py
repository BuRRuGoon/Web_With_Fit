from django.http import HttpResponseRedirect
from django.shortcuts import render

from django.utils import timezone

from user.models import User


# ------------------- sign -------------------
def signup(request):
  if request.method == 'POST':
    # 회원정보 저장
    email = request.POST.get('email')
    password = request.POST.get('password')
    name = request.POST.get('name')

    user = User(email=email, password=password, name=name, user_create=timezone.now())
    user.save()

    return HttpResponseRedirect('/signin')

  return render(request, 'user/signup.html')

def signin(request):
  # if(True):
  if request.method == 'POST':
    # 회원정보 조회
    email = request.POST.get('email')
    password = request.POST.get('password')

    try:
      user = User.objects.get(email=email, password=password)
      request.session['email'] = user.email
      request.session['name']= user.name
      request.session['user_index']= user.user_index

      return HttpResponseRedirect('/')
    except:
      context = {
        'msg': 'Wrong email or password',
        'email': email
      }
      return render(request, 'signin.html', context)

  return render(request, 'user/signin.html')


def signout(request):
  del request.session['email']  # 개별 삭제
  request.session.flush()  # 전체 삭제

  return HttpResponseRedirect('/')
