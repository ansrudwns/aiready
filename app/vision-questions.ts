type VisionQuestion = {
  id: string;
  category: "CNN·이미지 모델" | "ViT·학습 전략";
  kind: "객관식" | "단답형" | "서술형";
  difficulty: "기초" | "응용" | "사고형" | "고난도";
  question: string;
  code?: string;
  choices?: string[];
  answer: string;
  explanation: string;
};

type InputDifficulty = VisionQuestion["difficulty"] | "응용";

const mc = (
  id: string,
  category: VisionQuestion["category"],
  difficulty: InputDifficulty,
  question: string,
  answer: string,
  explanation: string,
  choices: string[],
  code?: string,
): VisionQuestion => ({ id, category, kind: "객관식", difficulty: difficulty === "응용" ? "핵심" : difficulty, question, answer, explanation, choices, code });

const short = (
  id: string,
  category: VisionQuestion["category"],
  difficulty: InputDifficulty,
  question: string,
  answer: string,
  explanation: string,
  code?: string,
): VisionQuestion => ({ id, category, kind: "단답형", difficulty: difficulty === "응용" ? "핵심" : difficulty, question, answer, explanation, code });

const essay = (
  id: string,
  category: VisionQuestion["category"],
  difficulty: VisionQuestion["difficulty"],
  question: string,
  answer: string,
  explanation: string,
): VisionQuestion => ({ id, category, kind: "서술형", difficulty, question, answer, explanation });

export const visionQuestions: VisionQuestion[] = [
  mc("cnn-01", "CNN·이미지 모델", "기초", "완전연결층만으로 큰 이미지를 처리할 때 가장 직접적으로 생기는 문제는?", "공간 구조를 펼쳐 버리고 입력 크기에 따라 파라미터가 급증한다.", "완전연결층은 이미지를 1차원으로 펼쳐 이웃 픽셀의 공간 관계를 직접 보존하지 못합니다. 모든 입력과 출력을 연결하므로 이미지 해상도가 커질수록 가중치 수도 매우 빠르게 늘어납니다.", ["공간 구조를 펼쳐 버리고 입력 크기에 따라 파라미터가 급증한다.", "모든 픽셀이 자동으로 정규화된다.", "출력 채널이 언제나 하나로 고정된다.", "기울기를 계산할 수 없게 된다."]),
  mc("cnn-02", "CNN·이미지 모델", "기초", "합성곱층의 핵심 특성 두 가지를 가장 정확히 묶은 것은?", "국소 연결과 가중치 공유", "필터는 작은 국소 영역만 보며 같은 가중치를 이미지 여러 위치에 반복 적용합니다. 이 국소 연결과 가중치 공유가 공간 패턴을 효율적으로 찾고 파라미터 수를 줄이는 핵심입니다.", ["국소 연결과 가중치 공유", "전역 연결과 위치별 독립 가중치", "무작위 연결과 label 공유", "시간 순환과 teacher forcing"]),
  short("cnn-03", "CNN·이미지 모델", "응용", "입력 너비 32, 커널 5, 패딩 0, 스트라이드 1인 합성곱의 출력 너비를 숫자만 작성하시오.", "28", "합성곱 출력 크기는 floor((W-K+2P)/S)+1입니다. 주어진 값을 넣으면 (32-5+0)/1+1=28이므로 출력 너비는 28입니다."),
  mc("cnn-04", "CNN·이미지 모델", "응용", "입력 64×64, 커널 3×3, 패딩 1, 스트라이드 2인 합성곱의 출력 공간 크기는?", "32×32", "각 축의 크기는 floor((64-3+2×1)/2)+1=floor(63/2)+1=32입니다. 패딩 1이 있더라도 스트라이드 2가 공간 크기를 대략 절반으로 줄입니다.", ["32×32", "64×64", "62×62", "31×31"]),
  short("cnn-05", "CNN·이미지 모델", "응용", "입력 채널 3, 출력 채널 16, 커널 3×3이고 출력 채널마다 bias 하나를 쓰는 합성곱층의 파라미터 수를 숫자만 작성하시오.", "448", "가중치는 16×3×3×3=432개이고 bias는 출력 채널마다 하나이므로 16개입니다. 따라서 전체 학습 파라미터는 432+16=448개입니다."),
  mc("cnn-06", "CNN·이미지 모델", "응용", "입력 텐서가 N×Cin×H×W이고 커널이 Cout×Cin×Kh×Kw일 때 출력 채널 수는 무엇이 결정하는가?", "커널의 개수인 Cout", "각 출력 채널은 하나의 필터 집합으로 만들어지므로 출력 채널 수는 Cout입니다. 배치 크기 N과 입력 채널 Cin은 출력 채널의 개수를 직접 결정하지 않습니다.", ["커널의 개수인 Cout", "배치 크기 N", "입력 높이 H", "입력 채널 Cin만"]),
  mc("cnn-07", "CNN·이미지 모델", "기초", "합성곱층 사이에 ReLU 같은 활성화 함수를 두는 주된 이유는?", "비선형성을 추가해 여러 층이 복잡한 함수를 표현하게 한다.", "선형 합성곱만 계속 쌓으면 전체도 하나의 선형 변환으로 합칠 수 있습니다. ReLU는 비선형성을 넣어 층을 깊게 쌓는 표현상의 이점을 만들어 줍니다.", ["비선형성을 추가해 여러 층이 복잡한 함수를 표현하게 한다.", "항상 출력 크기를 절반으로 줄인다.", "모든 가중치를 0으로 만든다.", "label을 one-hot으로 바꾼다."]),
  short("cnn-08", "CNN·이미지 모델", "기초", "2×2 영역 [1, 7; 3, 5]에 max pooling을 적용한 출력값을 숫자만 작성하시오.", "7", "Max pooling은 지정된 국소 영역의 최댓값 하나를 남깁니다. 네 값 1, 7, 3, 5 가운데 최댓값은 7이므로 출력은 7입니다."),
  mc("cnn-09", "CNN·이미지 모델", "사고형", "풀링 또는 stride convolution으로 공간 해상도를 줄일 때의 trade-off로 가장 적절한 것은?", "계산량과 위치 변화 민감도는 줄지만 세밀한 위치 정보가 손실될 수 있다.", "다운샘플링은 feature map과 계산량을 줄이고 작은 위치 변화에 더 강하게 만들 수 있습니다. 반면 세밀한 공간 정보는 줄어들므로 무조건 정보가 보존된다고 볼 수 없습니다.", ["계산량과 위치 변화 민감도는 줄지만 세밀한 위치 정보가 손실될 수 있다.", "계산량과 정보 손실이 모두 반드시 증가한다.", "파라미터가 항상 정확히 0개가 된다.", "입력 채널 수가 label 수와 같아진다."]),
  mc("cnn-10", "CNN·이미지 모델", "응용", "3×3 합성곱 두 층을 연속 적용하는 것이 5×5 한 층보다 자주 선호되는 이유는?", "같은 5×5 수용영역을 만들며 파라미터를 줄이고 비선형성을 한 번 더 넣을 수 있다.", "채널 수가 C로 같다면 두 3×3 층은 약 18C², 한 5×5 층은 25C²의 가중치를 씁니다. 전자는 같은 수용영역을 만들면서 활성화 함수도 두 번 적용할 수 있습니다.", ["같은 5×5 수용영역을 만들며 파라미터를 줄이고 비선형성을 한 번 더 넣을 수 있다.", "출력의 공간 크기가 언제나 두 배가 된다.", "합성곱 계산을 완전히 없앨 수 있다.", "입력 이미지의 RGB 채널이 자동 삭제된다."]),
  short("cnn-11", "CNN·이미지 모델", "응용", "3×3 합성곱을 stride 1로 세 층 쌓았을 때 한 출력이 보는 이론적 수용영역 한 변의 길이를 숫자만 작성하시오.", "7", "첫 층의 수용영역은 3, 두 번째는 5, 세 번째는 7입니다. stride 1인 3×3 합성곱을 한 층 추가할 때마다 수용영역 한 변이 2씩 커집니다."),
  mc("cnn-12", "CNN·이미지 모델", "기초", "AlexNet의 구성과 가장 가까운 설명은?", "5개 합성곱층과 3개 완전연결층을 사용한 초기 대규모 CNN이다.", "AlexNet은 큰 첫 커널과 stride, ReLU, 겹치는 max pooling 등을 사용했고 5개 convolution layer와 3개 fully connected layer로 구성된 대표적 초기 CNN입니다.", ["5개 합성곱층과 3개 완전연결층을 사용한 초기 대규모 CNN이다.", "합성곱 없이 attention만 사용한다.", "모든 층이 depthwise convolution 하나뿐이다.", "순환 hidden state로 이미지 행을 읽는다."]),
  mc("cnn-13", "CNN·이미지 모델", "응용", "AlexNet·VGG류 모델에서 activation memory와 파라미터가 주로 집중되는 위치의 연결로 적절한 것은?", "activation memory는 앞쪽 큰 feature map, 파라미터는 뒤쪽 FC 층", "초기 층은 공간 해상도가 커서 activation 저장 비용이 큽니다. 고전 구조의 뒤쪽 완전연결층은 연결 수가 많아 전체 파라미터의 큰 비중을 차지합니다.", ["activation memory는 앞쪽 큰 feature map, 파라미터는 뒤쪽 FC 층", "둘 다 label 파일에만 집중", "activation memory는 bias 하나, 파라미터는 pooling 층", "둘 다 입력 해상도와 무관하게 항상 동일"]),
  mc("cnn-14", "CNN·이미지 모델", "기초", "VGG의 대표적인 설계 방향은?", "작은 3×3 합성곱을 반복하고 단계 사이에 2×2 max pooling을 둔다.", "VGG16과 VGG19는 작은 3×3 convolution을 여러 번 쌓아 점진적으로 특징을 추출하고, 블록 사이의 2×2 max pooling으로 공간 크기를 줄이는 단순한 구조를 사용합니다.", ["작은 3×3 합성곱을 반복하고 단계 사이에 2×2 max pooling을 둔다.", "모든 이미지를 문자 sequence로 바꾼다.", "1×1 convolution만 한 층 사용한다.", "학습 가능한 층 없이 평균만 계산한다."]),
  mc("cnn-15", "CNN·이미지 모델", "사고형", "더 깊은 plain network의 훈련 오차까지 얕은 모델보다 커지는 degradation 문제를 과적합만으로 설명하기 어려운 이유는?", "과적합이라면 보통 훈련 성능은 좋아지지만 여기서는 훈련 성능도 악화되기 때문이다.", "일반적인 과적합은 훈련 오차가 낮고 검증 오차가 높아지는 현상입니다. degradation에서는 깊은 plain network의 최적화가 어려워 훈련 오차 자체도 나빠질 수 있습니다.", ["과적합이라면 보통 훈련 성능은 좋아지지만 여기서는 훈련 성능도 악화되기 때문이다.", "깊은 모델에는 파라미터가 전혀 없기 때문이다.", "검증 데이터를 훈련에 반드시 사용하기 때문이다.", "ReLU는 항상 선형 함수이기 때문이다."]),
  short("cnn-16", "CNN·이미지 모델", "기초", "Residual block의 핵심 출력을 수식 형태로 간단히 작성하시오.", "F(x) + x", "Residual learning은 원하는 mapping 전체 대신 잔차 F(x)를 학습하고 identity shortcut의 x를 더합니다. 따라서 기본 residual block의 출력은 F(x)+x입니다."),
  mc("cnn-17", "CNN·이미지 모델", "응용", "Residual block에서 F(x)와 x의 shape가 다를 때 흔히 쓰는 방법은?", "1×1 convolution shortcut으로 채널이나 공간 크기를 맞춘다.", "원소별 덧셈을 하려면 두 텐서의 shape가 맞아야 합니다. 필요하면 projection shortcut인 1×1 convolution과 stride를 사용해 차원을 맞춥니다.", ["1×1 convolution shortcut으로 채널이나 공간 크기를 맞춘다.", "문자열로 변환해 이어 붙인다.", "label을 복제해 입력에 더한다.", "모든 값을 NaN으로 바꾼다."]),
  mc("cnn-18", "CNN·이미지 모델", "응용", "ResNet bottleneck block에서 1×1 convolution이 맡는 대표 역할은?", "3×3 convolution 전후의 채널 수를 줄였다가 늘려 계산량을 제어한다.", "Bottleneck은 1×1 convolution으로 채널을 축소하고 3×3 convolution을 수행한 뒤 다시 1×1로 확장합니다. 깊이를 확보하면서 연산량을 줄이는 설계입니다.", ["3×3 convolution 전후의 채널 수를 줄였다가 늘려 계산량을 제어한다.", "이미지의 가로세로를 항상 1로 만든다.", "모든 음수 gradient를 제거한다.", "정답 class 하나만 남긴다."]),
  mc("cnn-19", "CNN·이미지 모델", "기초", "Global average pooling을 큰 FC 분류기 앞에 사용할 때의 장점은?", "공간별 값을 평균해 파라미터가 많은 완전연결층 의존을 줄인다.", "Global average pooling은 각 채널의 공간 위치를 평균해 하나의 값으로 요약합니다. 큰 feature map을 거대한 FC 층에 연결하는 것보다 파라미터 수와 과적합 위험을 줄일 수 있습니다.", ["공간별 값을 평균해 파라미터가 많은 완전연결층 의존을 줄인다.", "항상 입력 이미지를 복원한다.", "시계열 순서를 생성한다.", "학습률을 자동으로 0으로 만든다."]),
  mc("cnn-20", "CNN·이미지 모델", "응용", "Depthwise separable convolution의 두 단계를 올바르게 나열한 것은?", "채널별 spatial convolution 후 1×1 pointwise convolution", "Depthwise 단계는 입력 채널마다 공간 필터를 독립 적용하고, pointwise 1×1 convolution은 채널 정보를 섞어 새 출력 채널을 만듭니다.", ["채널별 spatial convolution 후 1×1 pointwise convolution", "FC 층 후 RNN 순환", "max pooling 후 tokenization만", "label smoothing 후 beam search"]),
  short("cnn-21", "CNN·이미지 모델", "고난도", "3×3 standard convolution의 비용을 9C²HW, depthwise separable 비용을 9CHW+C²HW로 볼 때 C=64에서 후자/전자의 비율을 소수 셋째 자리까지 작성하시오.", "0.127", "비율은 (9C+C²)/(9C²)=1/C+1/9입니다. C=64이면 1/64+1/9≈0.126736이므로 소수 셋째 자리까지 0.127입니다."),
  essay("cnn-22", "CNN·이미지 모델", "사고형", "CNN이 이미지 처리에서 완전연결망보다 효율적인 이유와, 깊어질수록 수용영역과 특징의 성격이 어떻게 변하는지 설명하시오.", "CNN은 작은 필터의 국소 연결과 위치 전반의 가중치 공유로 공간 구조를 보존하면서 완전연결망보다 적은 파라미터로 패턴을 찾는다. 초기 층은 모서리와 질감 같은 국소 특징을 추출하고 층이 깊어질수록 여러 국소 영역이 결합되어 수용영역이 넓어진다. 그 결과 후반 층은 물체의 부분과 전체 형태처럼 더 추상적이고 전역적인 특징을 표현한다.", "답안에는 국소 연결, 가중치 공유, 파라미터 효율, 수용영역 증가, 저수준에서 고수준으로 바뀌는 계층적 특징이 모두 포함되어야 합니다."),
  essay("cnn-23", "CNN·이미지 모델", "고난도", "VGG, ResNet, MobileNet의 설계 목표와 핵심 장치를 비교하여 설명하시오.", "VGG는 3×3 합성곱을 규칙적으로 반복해 단순하고 깊은 특징 계층을 만들지만 파라미터와 계산량이 크다. ResNet은 F(x)+x의 shortcut으로 깊은 네트워크의 최적화와 degradation 문제를 완화하며 bottleneck으로 계산을 줄인다. MobileNet은 depthwise convolution과 1×1 pointwise convolution을 분리해 모바일 환경에서 연산량과 모델 크기를 크게 낮춘다.", "세 모델을 단순히 성능 순서로 쓰기보다 VGG의 작은 커널 반복, ResNet의 residual shortcut, MobileNet의 depthwise separable convolution과 효율성 목표를 비교해야 합니다."),
  essay("cnn-24", "CNN·이미지 모델", "고난도", "합성곱 모델의 계산 자원을 분석할 때 파라미터 수, activation memory, FLOPs를 구분해야 하는 이유를 설명하시오.", "파라미터 수는 저장할 가중치의 규모와 주로 관련되지만 실행 중 메모리는 중간 feature map인 activation 크기의 영향을 크게 받는다. FLOPs는 출력 공간의 각 위치에서 수행하는 커널 연산량을 나타내므로 속도와 연결되며, 파라미터가 적어도 큰 feature map에서는 계산이 많을 수 있다. 따라서 모델 크기, 학습 메모리, 실행 속도를 하나의 숫자로 대신 판단하면 안 된다.", "파라미터는 모델 저장량, activation은 실행·역전파 메모리, FLOPs는 계산량을 주로 나타냅니다. 세 값이 층별로 서로 다른 양상을 보인다는 점이 핵심입니다."),

  mc("vit-01", "ViT·학습 전략", "기초", "CNN이 장거리 관계나 전역 순서를 직접 모델링하는 데 불리할 수 있는 이유는?", "국소 필터를 중심으로 처리해 먼 위치의 정보를 연결하려면 여러 층이 필요하기 때문이다.", "CNN은 강한 local inductive bias를 가지므로 가까운 패턴에는 효율적입니다. 멀리 떨어진 영역의 상호작용은 깊은 층을 거쳐야 하므로 전역 관계를 직접 연결하는 attention보다 불리할 수 있습니다.", ["국소 필터를 중심으로 처리해 먼 위치의 정보를 연결하려면 여러 층이 필요하기 때문이다.", "가중치 공유가 전혀 없기 때문이다.", "이미지 입력을 받을 수 없기 때문이다.", "항상 단 하나의 픽셀만 출력하기 때문이다."]),
  mc("vit-02", "ViT·학습 전략", "기초", "이미지 self-attention에서 Q, K, V의 역할을 가장 알맞게 연결한 것은?", "Q는 찾는 정보, K는 일치 판단 기준, V는 모아 올 내용", "Query와 Key의 유사도로 attention weight를 정하고 그 가중치로 Value를 합칩니다. Q는 무엇을 찾는지, K는 어디와 관련 있는지, V는 실제 전달할 내용에 해당합니다.", ["Q는 찾는 정보, K는 일치 판단 기준, V는 모아 올 내용", "Q는 정답 label, K는 학습률, V는 epoch", "Q는 가중치 감소, K는 dropout, V는 pooling", "Q는 batch, K는 channel, V는 height"]),
  short("vit-03", "ViT·학습 전략", "응용", "ViT에서 224×224 이미지를 겹치지 않는 16×16 patch로 나눌 때 patch token 수를 숫자만 작성하시오.", "196", "한 축에 224/16=14개의 patch가 생깁니다. 전체 token 수는 14×14=196이며, 분류용 특수 token을 별도로 더하는 구조라면 그 수는 따로 계산합니다."),
  mc("vit-04", "ViT·학습 전략", "응용", "ViT에 위치 정보가 필요한 가장 직접적인 이유는?", "self-attention만으로는 token 순서와 2차원 위치가 자동 보존되지 않기 때문이다.", "Attention은 입력 token의 순서를 바꿔도 같은 방식으로 관계를 계산하는 성질이 있습니다. 이미지 patch의 공간 배열을 알려 주려면 positional information을 별도로 제공해야 합니다.", ["self-attention만으로는 token 순서와 2차원 위치가 자동 보존되지 않기 때문이다.", "patch를 RGB로 만들 수 없기 때문이다.", "softmax가 음수를 출력하기 때문이다.", "모든 convolution이 1×1이기 때문이다."]),
  mc("vit-05", "ViT·학습 전략", "사고형", "학습형 absolute positional embedding을 다른 해상도에 적용할 때 생길 수 있는 문제는?", "학습한 위치 개수와 새 patch 격자가 달라 보간이나 재조정이 필요하다.", "고정된 patch 격자에 맞춰 학습된 absolute embedding은 해상도가 달라지면 token 수가 변합니다. 그대로 shape가 맞지 않거나, 보간했을 때 위치 일반화가 약해질 수 있습니다.", ["학습한 위치 개수와 새 patch 격자가 달라 보간이나 재조정이 필요하다.", "항상 모든 patch 값이 0이 된다.", "class 수가 자동으로 두 배가 된다.", "gradient clipping이 불가능해진다."]),
  mc("vit-06", "ViT·학습 전략", "응용", "Relative positional information의 장점으로 가장 적절한 것은?", "절대 좌표보다 token 사이의 상대 관계를 표현해 해상도 변화에 더 유연할 수 있다.", "상대 위치 방식은 두 patch가 얼마나 떨어져 있는지 같은 관계를 표현합니다. 고정 절대 좌표보다 입력 크기나 해상도가 바뀌는 상황에 더 자연스럽게 일반화할 수 있습니다.", ["절대 좌표보다 token 사이의 상대 관계를 표현해 해상도 변화에 더 유연할 수 있다.", "학습 데이터와 연산을 완전히 없앤다.", "각 token을 독립적으로만 처리한다.", "출력 class를 무조건 하나로 만든다."]),
  mc("vit-07", "ViT·학습 전략", "기초", "ViT가 CNN보다 대규모 사전학습 데이터의 이점을 크게 받을 수 있는 설명은?", "CNN의 국소성 같은 inductive bias가 약해 데이터로 유용한 구조를 더 많이 배워야 하기 때문이다.", "ViT는 처음부터 전역 token 관계를 다루지만 CNN의 locality와 translation 관련 bias가 약합니다. 작은 데이터에서는 불리할 수 있고, 큰 데이터와 정규화·증강이 충분하면 높은 성능을 낼 수 있습니다.", ["CNN의 국소성 같은 inductive bias가 약해 데이터로 유용한 구조를 더 많이 배워야 하기 때문이다.", "ViT에는 학습 파라미터가 없기 때문이다.", "이미지 patch가 언제나 정답 label이기 때문이다.", "대규모 데이터에서는 attention을 사용하지 않기 때문이다."]),
  mc("vit-08", "ViT·학습 전략", "응용", "DeiT식 distillation에서 teacher와 student의 연결로 알맞은 것은?", "CNN teacher의 출력 분포를 ViT student가 label loss와 함께 학습한다.", "Data-efficient image Transformer는 teacher가 제공한 지식과 실제 label을 함께 활용합니다. student는 cross-entropy뿐 아니라 teacher output과의 distillation loss도 사용합니다.", ["CNN teacher의 출력 분포를 ViT student가 label loss와 함께 학습한다.", "ViT teacher의 가중치를 모두 0으로 만든다.", "student의 입력 이미지를 삭제한다.", "teacher와 student가 서로 다른 정답 체계를 사용한다."]),
  mc("vit-09", "ViT·학습 전략", "응용", "Swin Transformer의 shifted window가 노리는 효과는?", "국소 window 계산 효율을 유지하면서 인접 window 사이 정보도 교환한다.", "Window attention은 전체 token attention보다 계산을 줄이지만 창 사이 연결이 약합니다. 다음 블록에서 window를 이동하면 이전에 분리됐던 patch들이 같은 창에 들어가 정보를 교환합니다.", ["국소 window 계산 효율을 유지하면서 인접 window 사이 정보도 교환한다.", "모든 patch를 한 픽셀로 축소한다.", "학습률을 window 크기와 같게 만든다.", "출력 확률에서 softmax를 제거한다."]),
  mc("vit-10", "ViT·학습 전략", "기초", "활성화 함수 없이 여러 선형층만 쌓았을 때 생기는 표현상의 한계는?", "전체가 하나의 선형변환으로 합쳐져 복잡한 비선형 경계를 표현하지 못한다.", "선형변환의 합성은 다시 선형변환입니다. 층 수를 늘려도 ReLU, tanh 같은 비선형 활성화가 없으면 표현 가능한 함수의 종류가 근본적으로 늘지 않습니다.", ["전체가 하나의 선형변환으로 합쳐져 복잡한 비선형 경계를 표현하지 못한다.", "파라미터 수가 음수가 된다.", "입력 tensor의 dtype이 문자열이 된다.", "항상 기울기 폭발만 발생한다."]),
  mc("vit-11", "ViT·학습 전략", "응용", "Sigmoid와 tanh의 공통 한계는?", "큰 절댓값 입력에서 포화되어 기울기 소실이 생길 수 있다.", "두 함수 모두 양끝 구간에서 출력 변화가 작고 derivative가 0에 가까워집니다. 깊은 네트워크에서는 이 작은 gradient가 반복 곱해져 앞쪽 층 학습이 느려질 수 있습니다.", ["큰 절댓값 입력에서 포화되어 기울기 소실이 생길 수 있다.", "양수 입력에서 derivative가 항상 1이다.", "출력이 항상 정수이다.", "matrix multiplication을 사용할 수 없다."]),
  mc("vit-12", "ViT·학습 전략", "응용", "Leaky ReLU가 ReLU의 dying unit 문제를 완화하는 방식은?", "음수 구간에도 작은 기울기를 남긴다.", "표준 ReLU는 음수에서 출력과 gradient가 0입니다. Leaky ReLU는 음수 구간에 작은 slope를 두어 unit이 완전히 업데이트되지 않는 상태를 줄입니다.", ["음수 구간에도 작은 기울기를 남긴다.", "모든 양수 출력을 0으로 만든다.", "각 층의 bias를 삭제한다.", "loss 대신 accuracy를 미분한다."]),
  short("vit-13", "ViT·학습 전략", "기초", "ReLU를 먼저 시도했지만 dying ReLU가 심할 때 고려할 활성화 함수 하나를 정확한 이름으로 작성하시오.", "Leaky ReLU", "Leaky ReLU는 음수 입력에서도 작은 기울기를 허용해 죽은 ReLU를 완화합니다. ELU도 대안이 될 수 있지만 이 문항의 기대 답안은 Leaky ReLU입니다."),
  mc("vit-14", "ViT·학습 전략", "응용", "RGB 이미지 모델의 입력 전처리를 설계할 때 가장 적절한 원칙은?", "크기·채널 형식과 정규화 통계를 모델이 학습된 조건에 맞춘다.", "입력 크기, RGB 채널 순서, tensor 변환과 평균·표준편차 normalization을 일관되게 맞춰야 합니다. 사전학습 모델은 해당 모델이 사용한 전처리 규칙을 따르는 것이 중요합니다.", ["크기·채널 형식과 정규화 통계를 모델이 학습된 조건에 맞춘다.", "모든 채널을 임의로 하나만 남긴다.", "훈련과 추론에서 서로 다른 class 순서를 쓴다.", "정규화 평균을 매 batch 무작위로 바꾼다."]),
  mc("vit-15", "ViT·학습 전략", "응용", "모든 가중치와 bias를 0으로 초기화하면 학습이 어려운 핵심 이유는?", "같은 층의 뉴런이 동일한 gradient를 받아 대칭이 깨지지 않는다.", "동일한 초기값의 뉴런들은 같은 입력과 같은 gradient를 받으므로 계속 같은 특징만 학습합니다. 무작위 초기화는 뉴런 사이의 대칭을 깨는 역할을 합니다.", ["같은 층의 뉴런이 동일한 gradient를 받아 대칭이 깨지지 않는다.", "loss 함수가 자동으로 삭제된다.", "입력이 모두 문자열로 변한다.", "optimizer가 validation set만 사용한다."]),
  mc("vit-16", "ViT·학습 전략", "응용", "Xavier 초기화와 He 초기화의 일반적인 연결로 가장 적절한 것은?", "Xavier는 tanh 계열, He는 ReLU 계열에서 분산 유지에 주로 사용한다.", "Xavier는 입력과 출력 크기를 고려해 tanh·sigmoid 계열의 signal scale을 유지하도록 설계됩니다. He 초기화는 ReLU에서 절반이 0이 되는 성질을 고려한 더 큰 분산을 사용합니다.", ["Xavier는 tanh 계열, He는 ReLU 계열에서 분산 유지에 주로 사용한다.", "Xavier는 label, He는 batch를 초기화한다.", "둘 다 모든 가중치를 정확히 0으로 만든다.", "둘 다 학습 종료 시에만 적용한다."]),
  mc("vit-17", "ViT·학습 전략", "사고형", "Residual branch의 마지막 층을 0에 가깝게 초기화하는 전략의 의도는?", "초기 block을 identity mapping에 가깝게 만들어 안정적으로 학습을 시작한다.", "Residual output이 F(x)+x이므로 branch의 F(x)가 처음에 0에 가까우면 block은 x를 거의 그대로 전달합니다. 깊은 네트워크가 안정적인 identity 근처에서 시작하도록 돕습니다.", ["초기 block을 identity mapping에 가깝게 만들어 안정적으로 학습을 시작한다.", "shortcut을 제거해 gradient를 차단한다.", "초기 예측을 항상 정답으로 만든다.", "입력 해상도를 0으로 만든다."]),
  mc("vit-18", "ViT·학습 전략", "응용", "L1과 L2 가중치 정규화의 차이로 적절한 것은?", "L1은 정확히 0인 가중치를 만들기 쉽고 L2는 큰 가중치를 부드럽게 억제한다.", "L1 penalty는 절댓값 합이라 희소한 해를 유도할 수 있습니다. L2 또는 weight decay는 제곱합을 벌점으로 주어 큰 가중치를 줄이지만 일반적으로 모두를 정확히 0으로 만들지는 않습니다.", ["L1은 정확히 0인 가중치를 만들기 쉽고 L2는 큰 가중치를 부드럽게 억제한다.", "L1은 dropout이고 L2는 pooling이다.", "L1은 검증 데이터 수, L2는 class 수이다.", "둘은 loss와 전혀 관계가 없다."]),
  mc("vit-19", "ViT·학습 전략", "응용", "Dropout의 훈련과 추론 동작을 올바르게 설명한 것은?", "훈련 중 일부 unit을 확률적으로 끄고, 추론에서는 전체 unit을 사용하도록 scale을 맞춘다.", "Dropout은 훈련 시 co-adaptation을 줄이기 위해 unit을 무작위로 제외합니다. Inverted dropout은 살아남은 출력을 훈련 때 1/(1-p)로 조정해 추론 때 별도 무작위 제거 없이 사용합니다.", ["훈련 중 일부 unit을 확률적으로 끄고, 추론에서는 전체 unit을 사용하도록 scale을 맞춘다.", "훈련에서는 전체 unit을 고정하고 추론 때만 무작위로 끈다.", "항상 같은 unit만 영구 삭제한다.", "label의 일부를 NaN으로 바꾼다."]),
  short("vit-20", "ViT·학습 전략", "응용", "Inverted dropout에서 drop 확률 p=0.2일 때 살아남은 activation에 곱하는 scale을 숫자로 작성하시오.", "1.25", "기대값을 유지하려면 살아남은 activation을 1/(1-p)로 곱합니다. p=0.2이면 1/0.8=1.25입니다."),
  mc("vit-21", "ViT·학습 전략", "사고형", "학습률이 너무 큰 경우와 너무 작은 경우의 징후를 바르게 연결한 것은?", "너무 크면 loss가 발산·진동하고, 너무 작으면 수렴이 지나치게 느리다.", "큰 learning rate는 좋은 영역을 건너뛰어 loss가 불안정해질 수 있습니다. 지나치게 작은 값은 한 번의 update가 작아 안정적이어도 목표까지 도달하는 시간이 매우 길어집니다.", ["너무 크면 loss가 발산·진동하고, 너무 작으면 수렴이 지나치게 느리다.", "너무 크면 항상 완벽 수렴하고, 너무 작으면 즉시 발산한다.", "두 경우 모두 validation accuracy가 반드시 100%다.", "학습률은 loss 변화와 무관하다."]),
  mc("vit-22", "ViT·학습 전략", "응용", "Cosine learning-rate schedule의 특징은?", "학습률을 cosine 곡선을 따라 초반부터 후반까지 매끄럽게 감소시킨다.", "Step decay는 특정 epoch에서 계단식으로 줄이는 반면 cosine schedule은 주기 구간에서 매끄럽게 감소합니다. 종료 부근에서 작은 learning rate로 세밀하게 조정할 수 있습니다.", ["학습률을 cosine 곡선을 따라 초반부터 후반까지 매끄럽게 감소시킨다.", "매 epoch 학습률을 무작위 부호로 바꾼다.", "훈련 내내 학습률을 정확히 0으로 둔다.", "validation loss를 label로 사용한다."]),
  essay("vit-23", "ViT·학습 전략", "고난도", "훈련 loss는 계속 감소하지만 validation loss가 상승하기 시작했다. 적용할 전략과 판단 기준을 설명하시오.", "훈련과 검증 곡선이 벌어지는 시점은 과적합 신호이므로 검증 성능이 가장 좋은 checkpoint를 기준으로 early stopping을 적용할 수 있다. 동시에 weight decay나 dropout, label을 바꾸지 않는 data augmentation을 검토한다. 다만 test set은 모델 선택에 사용하지 않고 최종 선택이 끝난 뒤 한 번만 평가하며, 정규화 강도와 증강은 validation 성능으로 조정한다.", "핵심은 과적합 진단, early stopping, 정규화 또는 증강, validation 기반 선택, test set 격리입니다. 훈련 loss만 보고 계속 학습하는 답은 충분하지 않습니다."),
  essay("vit-24", "ViT·학습 전략", "고난도", "사전학습 이미지 모델을 새 분류 문제에 적용할 때 linear probing, fine-tuning, data augmentation, learning-rate scheduling을 어떻게 조합할지 설명하시오.", "먼저 사전학습 backbone을 고정하고 새 분류 head만 학습하는 linear probing으로 특징의 전이 가능성과 baseline을 확인한다. 데이터가 충분하고 추가 적응이 필요하면 낮은 학습률로 일부 또는 전체 backbone을 fine-tuning한다. crop, flip, 색 변화처럼 label을 보존하는 augmentation으로 과적합을 줄이고, learning-rate schedule로 초반의 빠른 적응과 후반의 세밀한 수렴을 함께 노린다.", "답안은 사전학습 가중치 활용, linear probing과 fine-tuning의 차이, label-preserving augmentation, 작은 학습률과 schedule의 목적을 연결해 설명해야 합니다."),
];
