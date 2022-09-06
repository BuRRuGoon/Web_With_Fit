// 로딩중
function LoadingWithMask(gif) {
    //화면의 높이와 너비를 구합니다.
    var maskHeight = $(document).height();
    var maskWidth  = window.document.body.clientWidth;
    
    //화면에 출력할 마스크를 설정해줍니다.
    var loadingImg ='';
    var loadingImg2 = '';
    var mask       ="<div id='mask' style='position:absolute; z-index:9000; background-color:#000000; display:none; left:0; top:0;'></div>";

    loadingImg += "<div id='loadingImg'>";
    loadingImg += " <img src='"+ gif +"' style='position: relative; z-index:9000; display: block; margin: auto; left:2%;'/>";
    loadingImg += "</div>";
    
    loadingImg2 += "<div id='loadingImg2'>";
    loadingImg2 += "<img src='../static/img/fitness/loading.png' style='position: relative; z-index:9000; display: block; margin: auto;'/>";
    loadingImg2 += "</div>";
  
    //화면에 레이어 추가
    $('body')
        .append(mask)
        .append(loadingImg)
        .append(loadingImg2)
        
    //마스크의 높이와 너비를 화면 것으로 만들어 전체 화면을 채웁니다.
    $('#mask').css({
            'width' : maskWidth
            ,'height': maskHeight
            ,'opacity' : 1
    });
  
    //마스크 표시
    $('#mask').show();
  
    //로딩중 이미지 표시
    $('#loadingImg').show();
    $('#loadingImg2').show();
    $('#screen').show();
}

// 로딩 제거
function closeLoadingWithMask() {
    $('#mask, #loadingImg, #loadingImg2').hide();
    $('#mask, #loadingImg, #loadingImg2').remove(); 
}