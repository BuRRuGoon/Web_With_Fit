let status = 0;

async function init() {
    // 로딩 이미지
    LoadingWithMask('../static/img/fitness/loading-pacman.gif');

    // 운동 이미지 모델
    const modelURL = "../static/json/model.json";
    const metadataURL = "../static/json/metadata.json";

    // 준비된 상태인지 확인하는 모델
    const sign_modelURL = "../static/json/OkModel/model.json";
    const sign_metadataURL = "../static/json/OkModel/metadata.json";

    // 웹캠이 연결되어있는지 확인하기 위한 변수
    let error_point = 0

    // tmPose를 이용해 모델과 메타데이터 로드
    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    sign_model = await tmPose.load(sign_modelURL, sign_metadataURL);
    sign_maxPredictions = sign_model.getTotalClasses();

    // 웹캠에 사이즈 설정 및 화면 반전 설정 
    // flip 파라미터값이 true일 경우 거울과 같은 효과
    const size = 600;
    const flip = true;
    webcam = new tmPose.Webcam(size, size, flip);

    // 사용자의 컴퓨터에 웹캠이 연결된 상태라면 웹캠 화면을 띄어준다.
    // 모바일에서도 폰에 카메라가 있다면 허용만 해준다면 동일한 기능을 할수있다.
    try {
        await webcam.setup();
        await webcam.play();
    } catch {
        // 만약 연결되지 않은 상태라면 에러포인트 변수를 이용해 로딩창이 넘어가지 않도록 설정
        error_point = 1
    }

    // 웹캠 에러가 발생하지 않은 경우에만 실행
    if (error_point == 0) {
        setTimeout("closeLoadingWithMask()", 3000);
        // TestCode 시연용 bgm 정지
        // setTimeout("bgm.pause()", 3000);
    }

    window.requestAnimationFrame(loop);

    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    canvas.width = size; canvas.height = size;
    ctx = canvas.getContext("2d");

    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }

    // setInterval(함수, 시간) : 주기적인 실행을 위한 메소드
    const timer = setInterval(function () {
        if (game_switch == 1) {
            document.getElementById('timer').style.fontSize = '40px';
            document.getElementById('timer').innerHTML = time;

            if (time <= 30) {
                document.getElementById('timer').style.color = 'red';
            }

            time--;

            // 타임아웃 시
            if (time < 0) {
                clearInterval(timer); // setInterval() 실행을 끝냄
                document.getElementById('timer').innerHTML = '끝!';
            }
        }
    }, 1000);
}

async function loop(timestamp) {
    //실제 웹캠 화면을 갱신하는 부분
    webcam.update();

    // 준비동작 상태와 게임 상태를 게임스위치 변수로 상태를 변환
    // bool 변수를 사용하지 않은 이유는 혹시나 다른상태값이 추가되는 경우를 생각해서 bool변수대신 int로 설정
    // int값이 0이면 준비상태 1이면 게임 진행중
    if (game_switch == 0) {
        await sign_predict();
    } else if (game_switch == 1) {
        await predict();
    }
    window.requestAnimationFrame(loop);
}

async function predict() {
    // 웹캠 Pose 이미지를 키값으로 변경
    const pose_player1 = await model.estimatePose(webcam.canvas);

    // 테스트용 코드 웹상에서 키포인트가 정확하게 동작하는지 확인하기 위해서
    //console.log(pose_player1.pose.keypoints)

    // 해당 키값을 Predict
    const prediction = await model.predict(pose_player1.posenetOutput);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }

    // 모델에 동작 처리
    pose_detect(prediction);

    // 포즈 스켈레톤 그리기
    drawPose(pose_player1.pose);
}

// 준비 단계에서 시작하기 위한 자세 탐지
async function sign_predict() {
    const sign_pose_player1 = await sign_model.estimatePose(webcam.canvas);
    //console.log(pose_player1.pose.keypoints)

    const sign_prediction = await sign_model.predict(sign_pose_player1.posenetOutput);

    if (sign_prediction[0].probability.toFixed(2) >= 0.99) {
        sign_switch = 0;
        console.log(sign_prediction[0])
        $(".msg-text").text("준비가 완료되면 🙆");
    } else if (sign_prediction[2].probability.toFixed(2) >= 0.60 || sign_prediction[3].probability.toFixed(2) >= 0.60) {
        sign_switch = 1;
        $(".msg-text").text("자리를 잡아주세요.");
    }

    if (sign_prediction[1].probability.toFixed(2) >= 0.99 && sign_switch == 0) {
        $(".msg-text").text("");
        game_switch = 1;
    }

    drawPose(sign_pose_player1.pose);
}

// 동작을 순서대로 실행했는지에 대한 처리 및 점수 계산
// prediction에 저장된 값을 가져와 각 포즈 동작을 순서대로 진행해야지 데미지를 입힐수 있게 만들었다.
// 다음 동작이 정확하지 않을경우 score값이 0으로 처리되기 때문에 데미지가 들어가지 않은 방식
function pose_detect(prediction) {
    const attack = 50;
    let score = 0;

    // 사이드 니업의 부분 동작중 무릎을 올리는 동작을 정확히 진행했을경우 사운드를 추가해서 동작이 완료된걸 플레이어가 알수있게 하였다. 
    // 한 세트를 완료하면 세트 완료시 세트를 완료했다는 느낌을 줄수 있게 사운드를 추가
    if (prediction[0].probability.toFixed(2) >= 0.80 && status == 0) {
        status = 1;
        score = 10 * (prediction[0].probability.toFixed(2) * 100);
    } else if (prediction[1].probability.toFixed(2) >= 0.90 && status == 1) {
        status = 2;
        score = 10 * (prediction[1].probability.toFixed(2) * 100);
        audio_pose.play();
    } else if (prediction[0].probability.toFixed(2) >= 0.80 && status == 2) {
        status = 3;
        score = 10 * (prediction[0].probability.toFixed(2) * 100);
    } else if (prediction[2].probability.toFixed(2) >= 0.90 && status == 3) {
        status = 4;
        score = 10 * (prediction[2].probability.toFixed(2) * 100);
        audio_pose.play();
    } else if (prediction[0].probability.toFixed(2) >= 0.80 && status == 4) {
        status = 0;
        score = 10 * (prediction[0].probability.toFixed(2) * 100);
        damage(attack);
        audio_set.play();
    }
    // 테스트 코드
    // console.log(monster_index)
    
    // 점수가 실시간으로 갱신되면서 화면에서 출력해준다.
    // 실시간 점수같은 경우는 동작이 모델에 predict값이 가까울경우 즉 동작이 올바를수록 스코어가 높은 값을 가짐
    result_score += score;
    $(".score-text").text(result_score + " 점");
    if ((time <= 0 || monster_index == 4) && game_switch == 1) {
        game_switch = 2;
        gameover()
    }
}

// 타임아웃 이거나 다음 몬스터가 존재하지않을때 게임오버가 호출
// score_form으로 전환
function gameover() {
    document.getElementById("score").value = result_score;
    document.getElementById('stage').value = monster_index + 1;
    document.score_form.submit();
}

function drawPose(pose) {
    if (webcam.canvas) {
        ctx.drawImage(webcam.canvas, 0, 0);
        // 키포인트에 스켈레톤을 그려주고 추가적으로 아이템 장착
        if (pose) {
            const minPartConfidence = 0.5;
            tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
            tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
            if (document.getElementById('user_index').value == 3) {
                itemEquip(pose, ctx);
            }
        }
    }
}

// 키포인트에 아이템 장착
function itemEquip(pose, ctx) {
    for (let i = 0; i < pose.keypoints.length; i++) {
        if (pose.keypoints[i].part === "rightEar") {
            ctx.drawImage(maskimg, pose.keypoints[i].position.x - 20, pose.keypoints[i].position.y - (maskimg.width / 2 + 30));
        } else if (pose.keypoints[i].part === "rightWrist") {
            ctx.drawImage(handimg, pose.keypoints[i].position.x - handimg.width / 2, pose.keypoints[i].position.y - handimg.height / 2);
        } else if (pose.keypoints[i].part === "leftWrist") {
            ctx.drawImage(handimg, pose.keypoints[i].position.x - handimg.width / 2, pose.keypoints[i].position.y - handimg.height / 2);
        }
    }
}

// 구글에서 JS로 캔버스 크기를 조절하는 방법을 찾아서 사용함
// 웹캠이나 이미지 캔버스 크기를 조절하기 위한 함수
function crop(can, a, b) {
    var ctx = can.getContext('2d');
    var imageData = ctx.getImageData(a.x, a.y, b.x, b.y);
    var newCan = document.createElement('canvas');

    newCan.width = b.x - a.x;
    newCan.height = b.y - a.y;
    var newCtx = newCan.getContext('2d');
    newCtx.putImageData(imageData, 0, 0);

    return newCan;
}

