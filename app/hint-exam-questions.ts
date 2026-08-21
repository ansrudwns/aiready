import { textbookQuestions } from "./textbook-questions";

type Kind = "객관식" | "단답형" | "서술형";
type Category =
  | "ML 기초·검증"
  | "회귀·신경망"
  | "NLP·Transformer"
  | "LLM·평가·안전"
  | "CNN·이미지 모델"
  | "ViT·학습 전략"
  | "파운데이션·VLM";

type HintQuestion = {
  id: string;
  topic: string;
  category: Category;
  kind: Kind;
  difficulty: "기초" | "핵심" | "사고형" | "고난도";
  question: string;
  choices?: string[];
  answer: string;
  explanation: string;
};

type TopicSpec = {
  key: string;
  topic: string;
  category: Category;
  definition: string;
  wrong: [string, string, string];
  shortQuestion: string;
  shortAnswer: string;
  application: string;
  essayQuestion: string;
  essayAnswer: string;
  caution: string;
  bookQuestion?: {
    question: string;
    choices: [string, string, string, string];
    answer: string;
  };
};

const specs: TopicSpec[] = [
  {
    key: "clip", topic: "CLIP", category: "파운데이션·VLM",
    definition: "이미지 인코더와 텍스트 인코더가 두 입력을 비교 가능한 공통 임베딩 공간에 배치한다.",
    wrong: ["픽셀과 문장을 하나의 RNN에 이어 넣어 다음 단어만 예측한다.", "이미지마다 새로운 분류기를 처음부터 학습해야만 사용할 수 있다.", "이미지와 텍스트 임베딩이 가까워지지 않도록 서로 다른 공간에 고정한다."],
    shortQuestion: "CLIP에서 이미지 특징과 텍스트 특징의 가까운 정도를 비교할 때 대표적으로 사용하는 유사도를 작성하시오.", shortAnswer: "코사인 유사도",
    application: "짝이 맞는 이미지-문장 표현은 가깝게, 배치 안의 맞지 않는 조합은 멀게 학습한다.",
    essayQuestion: "CLIP의 두 인코더 구조와 대조 학습 목표가 이미지-텍스트 검색을 가능하게 하는 과정을 설명하시오.",
    essayAnswer: "이미지 인코더는 이미지를 벡터로, 텍스트 인코더는 문장을 벡터로 변환한다. 두 벡터를 같은 공간에서 비교할 수 있도록 정규화하고, 대응하는 이미지-문장 쌍의 유사도는 높이며 대응하지 않는 조합의 유사도는 낮추는 대조 학습을 수행한다. 학습 뒤에는 질의 문장 벡터와 후보 이미지 벡터의 유사도를 계산해 가장 가까운 이미지를 검색할 수 있다.",
    caution: "CLIP은 문장을 직접 생성하는 모델이 아니라 이미지와 텍스트 표현을 정렬해 유사도를 계산하는 모델이다.",
  },
  {
    key: "clip-zero-shot", topic: "CLIP Zero-shot 분류", category: "파운데이션·VLM",
    definition: "후보 class 이름을 자연어 prompt로 만들고 이미지 임베딩과 가장 가까운 텍스트 임베딩의 class를 고른다.",
    wrong: ["모든 후보 class마다 CNN을 무작위 초기화해 별도로 다시 학습한다.", "문장 길이가 가장 긴 class를 이미지 내용과 무관하게 선택한다.", "이미지와 텍스트의 유사도를 모두 0으로 만든 뒤 첫 class를 반환한다."],
    shortQuestion: "CLIP zero-shot 분류에서 후보 class 문장을 임베딩하는 구성 요소를 작성하시오.", shortAnswer: "텍스트 인코더",
    application: "'a photo of a dog'처럼 class를 문장으로 표현하면 별도의 분류 head 학습 없이 새 label 후보를 비교할 수 있다.",
    essayQuestion: "CLIP으로 dog, cat, car 세 class를 zero-shot 분류하는 전체 절차를 설명하시오.",
    essayAnswer: "먼저 dog, cat, car를 각각 자연어 prompt로 만들고 텍스트 인코더로 세 개의 class 임베딩을 준비한다. 입력 이미지는 이미지 인코더로 임베딩한다. 이미지 임베딩과 세 텍스트 임베딩의 코사인 유사도를 계산하고, 필요하면 temperature가 적용된 softmax로 class 점수를 만든다. 가장 높은 유사도를 얻은 prompt의 class를 예측값으로 선택하며 별도의 분류기 학습은 하지 않는다.",
    caution: "prompt 문구가 달라지면 텍스트 임베딩과 분류 성능도 달라질 수 있어 prompt template을 함께 점검해야 한다.",
  },
  {
    key: "cnn-spatial", topic: "CNN 공간 구조", category: "CNN·이미지 모델",
    definition: "합성곱은 이미지의 2차원 이웃 관계를 유지하며 국소 영역에 같은 filter를 반복 적용한다.",
    wrong: ["입력 이미지를 처음부터 한 개의 scalar로 평균해 위치 정보를 모두 제거한다.", "공간 위치마다 서로 다른 filter를 사용해 가중치 공유를 금지한다.", "CNN은 오직 정적인 표 데이터만 처리하고 이미지에는 사용할 수 없다."],
    shortQuestion: "CNN에서 한 뉴런의 출력에 영향을 미치는 입력의 공간 범위를 뜻하는 용어를 작성하시오.", shortAnswer: "수용 영역",
    application: "초기 층은 edge나 texture 같은 국소 특징을, 깊은 층은 더 넓은 수용 영역에서 추상적 특징을 학습한다.",
    essayQuestion: "CNN이 완전연결망보다 이미지 공간 구조를 효율적으로 이용하는 이유를 국소 연결과 가중치 공유 관점에서 설명하시오.",
    essayAnswer: "CNN의 합성곱 층은 한 출력이 입력 전체가 아니라 가까운 국소 영역을 보도록 연결한다. 같은 filter 가중치를 이미지의 모든 위치에서 공유하므로 비슷한 모양을 위치가 달라도 탐지할 수 있고 파라미터 수도 줄어든다. 여러 합성곱과 pooling을 쌓으면 수용 영역이 넓어져 작은 edge에서 물체 수준의 특징으로 표현이 계층적으로 확장된다.",
    caution: "이동 등변성과 이동 불변성은 같지 않으며 pooling, stride와 데이터 증강이 최종 분류의 위치 변화 강건성에 함께 기여한다.",
    bookQuestion: { question: "CNN 모델의 특징과 가장 먼 것은?", choices: ["이미지의 모든 화소를 나열해 1차원 벡터로 만든 뒤 그 구조만 사용한다.", "기본 구조는 합성곱-활성화-풀링-완전연결층으로 구성될 수 있다.", "초기 층은 저수준 특징을, 깊은 층은 추상적 특징을 학습한다.", "층이 깊어질수록 수용 영역이 커져 더 넓은 맥락을 이해할 수 있다."], answer: "이미지의 모든 화소를 나열해 1차원 벡터로 만든 뒤 그 구조만 사용한다." },
  },
  {
    key: "cnn-output", topic: "CNN 출력 크기 계산", category: "CNN·이미지 모델",
    definition: "한 공간 축의 합성곱 출력 크기는 floor((입력+2×padding-kernel)/stride)+1로 계산한다.",
    wrong: ["출력 크기는 입력 크기에 kernel과 stride를 모두 곱해 계산한다.", "padding은 출력 크기 계산에 영향을 주지 않는다.", "stride가 커질수록 출력의 공간 크기도 항상 커진다."],
    shortQuestion: "입력 32, kernel 3, padding 1, stride 1인 합성곱의 한 축 출력 크기를 숫자로 작성하시오.", shortAnswer: "32",
    application: "입력 28, kernel 5, padding 0, stride 1이면 (28-5)+1=24이므로 출력 공간 크기는 24×24이다.",
    essayQuestion: "합성곱 출력 크기 식에서 padding과 stride가 공간 해상도에 미치는 영향을 예를 들어 설명하시오.",
    essayAnswer: "출력 한 축은 floor((H+2P-K)/S)+1로 계산한다. Padding P는 입력 둘레에 값을 더해 kernel을 적용할 위치를 늘리므로 출력 크기를 유지하거나 키우는 데 쓰인다. Stride S는 filter가 이동하는 간격이므로 1보다 커지면 적용 위치 수가 줄어 출력이 작아진다. 예를 들어 H=32, K=3, P=1, S=1이면 32이고 S=2이면 floor(31/2)+1=16이다.",
    caution: "높이와 너비를 각각 계산해야 하며 나누어떨어지지 않을 때는 floor가 적용된다는 점을 빼먹으면 안 된다.",
  },
  {
    key: "cnn-params", topic: "CNN 파라미터 수 계산", category: "CNN·이미지 모델",
    definition: "bias를 쓰는 Conv2d의 파라미터 수는 출력채널×입력채널×커널높이×커널너비+출력채널이다.",
    wrong: ["입력 이미지의 높이와 너비를 반드시 파라미터 수에 곱한다.", "stride와 padding 값만 곱하면 파라미터 수가 결정된다.", "합성곱은 학습되는 가중치가 전혀 없는 비학습 연산이다."],
    shortQuestion: "입력 채널 3, 출력 채널 16, 3×3 kernel과 bias를 쓰는 합성곱 층의 파라미터 수를 작성하시오.", shortAnswer: "448",
    application: "같은 filter를 모든 공간 위치에서 공유하므로 입력 해상도가 바뀌어도 동일한 채널과 kernel이면 파라미터 수는 같다.",
    essayQuestion: "Conv2d(3, 16, kernel_size=3, bias=True)의 파라미터 수를 계산하고 입력 해상도가 식에 없는 이유를 설명하시오.",
    essayAnswer: "각 출력 채널에는 입력 3채널을 모두 보는 3×3 filter가 있으므로 가중치는 16×3×3×3=432개다. Bias는 출력 채널마다 하나이므로 16개를 더해 총 448개다. 이 filter 묶음을 이미지의 모든 공간 위치에서 반복해 사용하므로 입력 높이와 너비는 학습 가중치 개수를 늘리지 않는다. 다만 해상도가 커지면 같은 filter를 적용하는 횟수와 activation memory는 증가한다.",
    caution: "파라미터 수와 연산량은 다르며 출력 feature map이 커지면 파라미터가 같아도 계산량은 늘어난다.",
  },
  {
    key: "cnn-vit", topic: "CNN과 ViT", category: "ViT·학습 전략",
    definition: "CNN은 국소 filter와 가중치 공유를, ViT는 patch token 사이의 self-attention을 핵심 연산으로 사용한다.",
    wrong: ["CNN과 ViT는 입력 표현과 연산이 완전히 같고 이름만 다르다.", "ViT는 이미지 위치 정보를 절대 사용하지 않고 patch 순서를 무작위로 버린다.", "CNN은 모든 픽셀 쌍의 attention만 계산하고 합성곱은 사용하지 않는다."],
    shortQuestion: "ViT에서 이미지를 일정 크기 조각으로 나눠 token처럼 만든 단위를 작성하시오.", shortAnswer: "패치",
    application: "CNN의 locality 귀납 편향은 데이터가 적을 때 유리할 수 있고 ViT는 충분한 사전학습에서 전역 관계를 학습하는 장점이 커진다.",
    essayQuestion: "CNN과 ViT를 입력 표현, 핵심 연산, 귀납 편향, 데이터 요구량 관점에서 비교하시오.",
    essayAnswer: "CNN은 픽셀 격자를 그대로 유지하고 작은 kernel을 모든 위치에 공유해 국소성과 이동 관련 귀납 편향을 구조에 넣는다. ViT는 이미지를 patch로 나눠 token embedding으로 바꾸고 위치 정보를 더한 뒤 self-attention으로 patch 관계를 계산한다. ViT는 먼 영역을 직접 연결하기 쉽지만 CNN보다 이미지에 대한 사전 가정이 약해 충분한 데이터나 강한 사전학습이 중요할 수 있다.",
    caution: "ViT가 언제나 CNN보다 우수한 것은 아니며 데이터 규모, 해상도, 계산 예산과 사전학습 조건을 함께 비교해야 한다.",
  },
  {
    key: "deep-network", topic: "Deep Network", category: "회귀·신경망",
    definition: "여러 층과 비선형 활성화를 쌓으면 얕은 모델보다 복잡한 조각별 함수와 계층적 표현을 만들 수 있다.",
    wrong: ["선형층을 여러 개 쌓기만 해도 활성화 없이 항상 비선형 함수가 된다.", "깊이가 늘면 최적화와 일반화 문제는 자동으로 모두 사라진다.", "깊은 신경망의 모든 층은 학습되지 않는 상수만 사용한다."],
    shortQuestion: "선형층 사이에서 네트워크가 하나의 선형변환으로 합쳐지는 것을 막는 구성 요소를 작성하시오.", shortAnswer: "비선형 활성화 함수",
    application: "깊은 층은 앞 층의 간단한 특징을 다시 조합해 더 추상적인 특징을 표현한다.",
    essayQuestion: "깊은 신경망이 얕은 신경망보다 복잡한 함수를 효율적으로 표현할 수 있는 이유와 학습 시 주의점을 설명하시오.",
    essayAnswer: "각 층은 이전 층의 출력을 선형변환하고 비선형 활성화로 새로운 조각을 만든다. 이 조합을 반복하면 얕은 모델보다 적은 단위로 많은 선형 영역과 계층적 특징을 구성할 수 있다. 그러나 깊어질수록 gradient 소실·폭발과 최적화 난도가 커질 수 있으므로 ReLU, 적절한 초기화, normalization, residual connection 같은 설계가 필요하다.",
    caution: "활성화가 없는 여러 선형층은 행렬을 하나로 합칠 수 있어 깊이를 늘려도 표현력이 선형모델을 넘지 못한다.",
  },
  {
    key: "diffusion", topic: "Diffusion 이미지 생성", category: "파운데이션·VLM",
    definition: "forward 과정은 데이터에 노이즈를 단계적으로 더하고 생성 과정은 학습한 denoising으로 노이즈에서 이미지를 복원한다.",
    wrong: ["완성 이미지에 노이즈만 계속 더하는 방향이 실제 생성 과정이다.", "한 번의 선형 회귀로 파일 이름을 바꾸는 것이 diffusion의 전부다.", "학습 데이터와 무관하게 항상 동일한 이미지만 복사한다."],
    shortQuestion: "Latent Diffusion이 반복적인 denoising 연산을 수행하는 압축 표현 공간을 작성하시오.", shortAnswer: "잠재 공간",
    application: "텍스트 조건을 denoiser에 제공하면 무작위 노이즈에서 prompt 의미를 따르는 이미지를 단계적으로 생성할 수 있다.",
    essayQuestion: "Diffusion 모델의 forward 과정, 학습 목표, 생성 과정을 시간 순서대로 설명하시오.",
    essayAnswer: "Forward 과정에서는 실제 이미지에 작은 Gaussian noise를 여러 단계 더해 마지막에는 거의 순수한 노이즈가 되도록 한다. 학습에서는 특정 시점의 noisy image와 시점 정보를 보고 추가된 노이즈 또는 원본 방향을 예측하도록 denoiser를 훈련한다. 생성할 때는 무작위 노이즈에서 시작해 예측한 노이즈를 단계적으로 제거하며 이미지 표본을 만들고, 텍스트 조건이 있으면 각 단계가 prompt를 따르도록 유도한다.",
    caution: "교재의 backward 또는 reverse 과정은 미분의 역전파가 아니라 확산의 역방향 denoising 과정을 뜻한다.",
  },
  {
    key: "llm-alignment", topic: "LLM 안전 정렬", category: "LLM·평가·안전",
    definition: "정렬 학습은 언어모델의 출력이 사용자의 의도와 가치, 안전 기준을 더 잘 따르도록 추가 학습하는 과정이다.",
    wrong: ["모델의 파라미터 수만 늘리면 안전 문제가 자동으로 완전히 해결된다.", "정렬은 tokenizer의 글꼴을 바꾸는 전처리만을 뜻한다.", "정렬된 모델은 어떤 jailbreak 입력에도 절대 실패하지 않는다."],
    shortQuestion: "언어모델의 출력을 사람의 의도와 가치에 맞추는 학습을 영어로 작성하시오.", shortAnswer: "Alignment",
    application: "지시 학습과 선호 학습을 통해 유용성뿐 아니라 해로운 응답 감소와 진실성 향상을 함께 평가한다.",
    essayQuestion: "LLM 안전 정렬의 목적과 지시 학습·선호 학습의 역할, 정렬 후에도 별도 안전 평가가 필요한 이유를 설명하시오.",
    essayAnswer: "안전 정렬은 사전학습 모델이 사용자의 지시를 따르면서도 사람의 가치와 안전 기준에 맞는 응답을 생성하도록 조정하는 과정이다. 지시 학습은 지시와 바람직한 응답의 관계를 지도학습하고, 선호 학습은 여러 응답 중 사람이 더 선호하는 방향을 학습한다. 그러나 학습 분포 밖의 공격이나 상충하는 목표에서 실패할 수 있으므로 유해성, 진실성, jailbreak에 대한 별도 평가와 방어가 계속 필요하다.",
    caution: "정렬은 안전을 개선하지만 완전한 보장을 뜻하지 않으며 권한 제한, 출력 검증과 공격 테스트가 함께 필요하다.",
  },
  {
    key: "lstm-gates", topic: "LSTM 게이트", category: "NLP·Transformer",
    definition: "forget gate는 이전 cell state를 얼마나 유지할지, input gate는 새 정보를 얼마나 기록할지, output gate는 hidden state로 얼마나 내보낼지 조절한다.",
    wrong: ["세 gate는 모두 같은 상수를 출력하며 cell state에 영향을 주지 않는다.", "LSTM은 이전 상태를 사용하지 않는 완전연결망과 동일하다.", "forget gate는 출력 문장의 길이만 세고 기억을 삭제할 수 없다."],
    shortQuestion: "LSTM에서 장기 기억 통로 역할을 하며 gate에 의해 갱신되는 상태의 이름을 작성하시오.", shortAnswer: "cell state",
    application: "sigmoid gate 값이 0에 가까우면 해당 정보를 차단하고 1에 가까우면 대부분 통과시킨다.",
    essayQuestion: "LSTM 한 시점에서 forget, input, output gate와 cell state가 정보를 처리하는 순서를 설명하시오.",
    essayAnswer: "Forget gate는 이전 hidden state와 현재 입력을 보고 이전 cell state의 각 정보를 얼마나 남길지 결정한다. Input gate는 새 후보 기억 중 얼마를 cell state에 더할지 정한다. 두 결과를 결합해 새로운 cell state를 만들고, output gate는 그 기억 중 현재 hidden state로 드러낼 부분을 선택한다. 이 가산적 기억 통로와 gate 제어가 기본 RNN의 장기 의존성 학습을 돕는다.",
    caution: "gate 자체가 기억을 저장하는 것이 아니라 gate는 비율을 정하고 실제 장기 정보는 주로 cell state를 따라 전달된다.",
  },
  {
    key: "p-value", topic: "p-value 해석", category: "회귀·신경망",
    definition: "p-value는 귀무가설과 모델 가정이 맞을 때 관측값 이상으로 극단적인 통계량을 얻을 확률이다.",
    wrong: ["p-value는 귀무가설이 참일 확률을 직접 나타낸다.", "p-value가 작으면 설명변수와 결과의 인과관계가 자동으로 증명된다.", "p-value는 표본 크기와 가정에 전혀 영향을 받지 않는 효과 크기다."],
    shortQuestion: "회귀계수 검정에서 일반적으로 설정하는 귀무가설을 β_j를 사용해 작성하시오.", shortAnswer: "β_j = 0",
    application: "유의수준 0.05에서 p-value가 0.01이면 귀무가설 아래에서 드문 결과로 보고 귀무가설을 기각한다.",
    essayQuestion: "회귀계수의 p-value가 0.01일 때 가능한 결론과 내릴 수 없는 결론을 구분해 설명하시오.",
    essayAnswer: "귀무가설 H0: β_j=0과 회귀모형의 가정이 맞다면 현재 관측 통계량 이상으로 극단적인 결과가 나올 확률이 0.01이라는 뜻이다. 유의수준 0.05에서는 귀무가설을 기각하고 설명변수와 반응변수 사이의 통계적 관계가 관찰되었다고 말할 수 있다. 그러나 귀무가설이 참일 확률이 1%라는 뜻도 아니고 인과관계나 실질적으로 큰 효과가 증명된 것도 아니다.",
    caution: "통계적 유의성과 효과 크기는 다르므로 계수 크기, 신뢰구간, 표본 수와 모델 가정을 함께 확인해야 한다.",
  },
  {
    key: "relu", topic: "ReLU", category: "회귀·신경망",
    definition: "ReLU는 입력이 양수이면 그대로, 0 이하이면 0을 출력하는 조각별 선형 활성화 함수다.",
    wrong: ["ReLU는 모든 입력을 0과 1 사이의 확률로 변환한다.", "ReLU는 양수 구간에서도 미분값이 항상 0이다.", "ReLU를 넣어도 여러 선형층은 언제나 하나의 선형변환과 같다."],
    shortQuestion: "ReLU(-3)의 출력값을 숫자로 작성하시오.", shortAnswer: "0",
    application: "양수 구간의 gradient가 1이라 sigmoid의 포화 구간보다 깊은 네트워크에서 gradient 전달에 유리하다.",
    essayQuestion: "ReLU의 식과 장점, dying ReLU 문제, Leaky ReLU가 이를 완화하는 방식을 설명하시오.",
    essayAnswer: "ReLU는 f(x)=max(0,x)로 양수 입력은 그대로 통과시키고 음수 입력은 0으로 만든다. 계산이 단순하고 양수 구간의 미분이 1이어서 포화형 활성화보다 gradient 전달이 수월하다. 하지만 뉴런 입력이 계속 음수이면 출력과 gradient가 0이 되어 학습이 멈추는 dying ReLU가 생길 수 있다. Leaky ReLU는 음수 구간에도 작은 기울기를 남겨 업데이트 통로를 유지한다.",
    caution: "ReLU는 비선형 함수지만 각 구간에서는 선형이며 음수 입력이 많은 초기화나 지나치게 큰 학습률에 주의해야 한다.",
  },
  {
    key: "rlhf", topic: "RLHF 학습 절차", category: "LLM·평가·안전",
    definition: "대표 절차는 SFT로 지시 수행 모델을 만들고, 사람의 응답 순위로 보상 모델을 학습한 뒤, 그 보상을 높이도록 policy를 강화학습하는 순서다.",
    wrong: ["사람 선호 데이터 없이 무작위 보상만으로 한 단계에 끝낸다.", "보상 모델을 학습한 뒤 언어모델은 전혀 업데이트하지 않는다.", "강화학습 단계의 모든 응답마다 사람이 직접 gradient를 계산한다."],
    shortQuestion: "RLHF에서 사람의 응답 선호 순위를 점수로 근사하도록 학습하는 모델의 이름을 작성하시오.", shortAnswer: "보상 모델",
    application: "마지막 단계에서는 policy가 보상 모델의 점수를 높이는 응답을 생성하도록 PPO 기반 강화학습을 수행한다.",
    essayQuestion: "InstructGPT 계열의 RLHF 3단계를 데이터와 학습 대상이 어떻게 달라지는지 중심으로 설명하시오.",
    essayAnswer: "첫 단계에서는 사람이 작성한 지시-모범 응답 쌍으로 사전학습 모델을 supervised fine-tuning하여 기본 지시 수행 policy를 만든다. 둘째 단계에서는 같은 prompt에 대한 여러 모델 응답을 사람이 순위화하고, 선택된 응답에 더 높은 값을 주도록 reward model을 지도학습한다. 셋째 단계에서는 새 prompt에 대한 policy 응답을 reward model이 평가하고 그 점수를 높이도록 PPO 기반 강화학습을 수행한다.",
    caution: "사람은 SFT와 선호 비교 데이터를 제공하지만 세 번째 강화학습 단계의 매 sample마다 직접 개입하는 것은 아니다.",
    bookQuestion: { question: "다음 중 지시 학습과 선호 학습에 대해 올바르지 않은 것은?", choices: ["효과적인 지시 학습에는 다양한 지시 데이터가 필요하다.", "크기가 충분하지 않은 모델은 지시 학습 효과가 떨어질 수 있다.", "보상 모델은 사람의 선호를 모방하도록 학습된다.", "강화학습 기반 선호 학습의 모든 과정에는 사람의 개입이 필요하다."], answer: "강화학습 기반 선호 학습의 모든 과정에는 사람의 개입이 필요하다." },
  },
  {
    key: "seq2seq-transformer", topic: "Seq2Seq와 Transformer", category: "NLP·Transformer",
    definition: "RNN 기반 Seq2Seq는 hidden state를 순차 전달하고 Transformer는 순환 없이 attention으로 위치 사이 관계를 계산한다.",
    wrong: ["두 구조 모두 입력과 출력 길이가 반드시 같아야 한다.", "Transformer는 token 순서를 표현할 방법을 전혀 사용하지 않는다.", "Seq2Seq의 encoder와 decoder는 항상 독립적으로 따로 학습한다."],
    shortQuestion: "기본 Seq2Seq에서 encoder가 입력 시퀀스를 압축해 decoder에 전달하는 벡터를 작성하시오.", shortAnswer: "context vector",
    application: "Transformer는 학습 시 여러 입력 위치를 병렬 처리하기 쉽고 먼 token 사이 정보 전달 경로가 짧다.",
    essayQuestion: "RNN 기반 Seq2Seq와 Transformer를 순차 처리, 정보 병목, 병렬성 관점에서 비교하시오.",
    essayAnswer: "RNN 기반 Seq2Seq는 이전 hidden state에 의존해 token을 순서대로 처리하므로 병렬화가 어렵고, 기본 구조에서는 입력 전체를 고정 길이 context vector에 압축해 긴 문장의 정보가 손실될 수 있다. Attention을 붙이면 decoder가 encoder의 여러 상태를 직접 참조해 병목을 줄인다. Transformer는 순환 연결 없이 self-attention으로 모든 위치 관계를 계산하고 positional encoding으로 순서를 제공해 학습 병렬성이 높다.",
    caution: "기본 Seq2Seq, attention을 추가한 Seq2Seq, Transformer를 구분해야 하며 attention 하나만으로 두 구조가 완전히 같아지는 것은 아니다.",
    bookQuestion: { question: "Seq2Seq 모델의 구조와 학습 방식에 대한 설명으로 가장 적절한 것은?", choices: ["인코더는 출력 시퀀스를 만들고 디코더는 입력 시퀀스를 처리하도록 두 역할을 바꿔 수행한다.", "인코더와 디코더는 서로 독립적으로 학습되어 end-to-end 역전파로 함께 최적화되지 않는다.", "인코더는 입력을 고정 길이 벡터로 변환하고 디코더는 이를 바탕으로 출력 시퀀스를 생성한다.", "Seq2Seq는 입력과 출력의 길이가 반드시 동일해야 하며 가변 길이 시퀀스를 처리할 수 없다."], answer: "인코더는 입력을 고정 길이 벡터로 변환하고 디코더는 이를 바탕으로 출력 시퀀스를 생성한다." },
  },
  {
    key: "top-k-p", topic: "Top-K, Top-P 샘플링", category: "LLM·평가·안전",
    definition: "Top-K는 확률이 높은 K개 token만 남기고, Top-P는 누적확률이 P 이상이 되는 최소 후보 집합에서 sampling한다.",
    wrong: ["Top-K는 항상 확률이 가장 낮은 K개 token만 선택한다.", "Top-P의 후보 개수는 문맥과 무관하게 언제나 고정된다.", "두 방법 모두 sampling을 제거하고 greedy와 완전히 같은 출력을 보장한다."],
    shortQuestion: "누적확률 기준으로 다음 token 후보 집합을 동적으로 정하는 sampling 방법의 다른 이름을 작성하시오.", shortAnswer: "Nucleus Sampling",
    application: "분포가 뾰족하면 Top-P 후보는 적고 분포가 평평하면 같은 P를 채우기 위해 후보가 더 많아질 수 있다.",
    essayQuestion: "Top-K와 Top-P의 후보 선택 방식을 비교하고 생성 다양성과 안정성에 미치는 영향을 설명하시오.",
    essayAnswer: "Top-K는 매 시점 확률이 높은 token K개만 남긴 뒤 그 안에서 재정규화해 sampling하므로 후보 수가 고정된다. Top-P는 확률 순으로 token을 더해 누적합이 P에 도달하는 최소 집합을 사용하므로 분포 모양에 따라 후보 수가 달라진다. 값을 너무 작게 잡으면 안전하지만 반복적이고 단조로울 수 있고 너무 크게 잡으면 다양성은 늘지만 낮은 확률의 부적절한 token이 포함될 수 있다.",
    caution: "K와 P는 모델 파라미터를 바꾸는 학습 설정이 아니라 생성 시 다음 token 후보를 제한하는 decoding 설정이다.",
    bookQuestion: { question: "다음 중 거대 언어 모델의 다양한 디코딩 알고리즘에 대한 설명으로 올바르지 않은 것은?", choices: ["Greedy decoding은 가장 확률이 높은 token을 선택한다.", "Beam search는 여러 후보를 동시에 고려해 계산 비용이 더 든다.", "1보다 큰 temperature는 다양한 응답이 생성될 확률을 감소시킨다.", "Top-K sampling은 확률이 높은 K개 token을 후보로 두고 sampling한다."], answer: "1보다 큰 temperature는 다양한 응답이 생성될 확률을 감소시킨다." },
  },
  {
    key: "open-closed", topic: "개방형과 폐쇄형 LLM", category: "LLM·평가·안전",
    definition: "개방형 LLM은 공개 범위 안에서 가중치 등을 내려받아 활용할 수 있고 폐쇄형 LLM은 주로 제공자의 서비스나 API로 접근한다.",
    wrong: ["개방형 모델은 학습되지 않은 무작위 모델만을 뜻한다.", "폐쇄형 모델은 반드시 가중치와 학습 데이터를 모두 공개한다.", "개방형이면 라이선스와 상관없이 모든 재배포와 상업 이용이 허용된다."],
    shortQuestion: "LLaMA, Gemma, Qwen처럼 교재에서 공개 가중치 활용 사례로 구분한 모델 유형을 작성하시오.", shortAnswer: "개방형 LLM",
    application: "온프레미스 실행과 세밀한 수정이 중요하면 공개 범위와 라이선스를 확인해 개방형 모델을 검토할 수 있다.",
    essayQuestion: "개방형과 폐쇄형 LLM을 접근 방식, 수정 가능성, 운영 책임과 라이선스 관점에서 비교하시오.",
    essayAnswer: "개방형 LLM은 모델에 따라 가중치나 코드가 공개되어 자체 환경에 내려받아 추론하거나 fine-tuning할 수 있다. 대신 배포 인프라, 보안, 업데이트와 안전 관리를 사용자가 책임져야 한다. 폐쇄형 LLM은 내부 가중치를 공개하지 않고 API나 서비스로 제공되는 경우가 많아 운영은 편리하지만 수정과 내부 검증 범위가 제한된다. 개방형의 재배포와 상업 이용 가능성은 각 라이선스를 별도로 확인해야 한다.",
    caution: "개방형이라는 이름만으로 완전한 오픈소스나 무제한 사용을 뜻하지 않으며 공개 범위와 이용 조건이 모델마다 다르다.",
  },
  {
    key: "r2", topic: "결정계수 R^2", category: "ML 기초·검증",
    definition: "R^2는 평균으로만 예측한 기준의 제곱오차와 비교해 회귀모델이 변동을 얼마나 더 설명하는지 나타낸다.",
    wrong: ["R^2는 분류 정확도와 완전히 같은 값이다.", "R^2가 음수이면 모든 label이 음수라는 뜻이다.", "설명변수를 추가하면 test R^2도 반드시 증가한다."],
    shortQuestion: "test에서 평균 예측보다 현재 모델의 제곱오차가 더 클 때 R^2의 부호를 작성하시오.", shortAnswer: "음수",
    application: "R^2=0은 평균 예측 기준과 비슷하고 R^2<0은 그 기준보다도 제곱오차가 큰 모델로 해석한다.",
    essayQuestion: "R^2의 식에서 기준선이 무엇인지 설명하고 test R^2=-0.2를 정확히 해석하시오.",
    essayAnswer: "R^2는 1-RSS/TSS로 계산하며 TSS는 각 실제값과 평균의 차이를 제곱해 합한 값이다. 따라서 모든 값을 평균으로 예측하는 단순 기준과 현재 모델의 RSS를 비교한다. Test R^2=-0.2는 정확도가 -20%라는 뜻이 아니라 현재 모델의 test 제곱오차가 평균 예측 기준보다 더 크다는 뜻이다. 데이터 분할과 분포를 점검하고 다른 오차 지표도 함께 봐야 한다.",
    caution: "훈련 R^2는 설명변수를 추가하면 감소하지 않는 성질이 있어 모델 선택에는 adjusted R^2나 validation 성능도 함께 확인한다.",
  },
  {
    key: "gradient-descent", topic: "경사하강법", category: "회귀·신경망",
    definition: "현재 파라미터에서 손실의 gradient를 계산하고 그 반대 방향으로 학습률만큼 파라미터를 반복 갱신한다.",
    wrong: ["gradient와 같은 방향으로 이동해 손실을 최대화하는 것이 목적이다.", "학습률은 데이터 개수에 따라 자동으로 항상 정답이 정해진다.", "한 번 갱신하면 어떤 비볼록 문제에서도 전역 최솟값이 보장된다."],
    shortQuestion: "파라미터를 한 번 갱신할 때 이동 크기를 조절하는 고정 비율의 이름을 작성하시오.", shortAnswer: "학습률",
    application: "학습률이 너무 크면 최솟값 주변을 지나쳐 진동하거나 발산하고 너무 작으면 수렴이 매우 느려질 수 있다.",
    essayQuestion: "경사하강법의 한 iteration을 기울기 계산과 파라미터 갱신 식을 포함해 설명하시오.",
    essayAnswer: "먼저 현재 파라미터로 예측과 손실을 계산한다. 이어 역전파나 미분으로 각 파라미터에 대한 gradient를 구한다. 손실을 줄이기 위해 θ←θ-α∇L(θ)처럼 gradient 반대 방향으로 학습률 α만큼 이동한다. 이 과정을 반복하며 손실과 validation 성능을 확인한다. Full-batch, mini-batch, SGD는 한 번의 gradient를 계산할 때 사용하는 표본 범위가 다르다.",
    caution: "gradient가 0이라는 사실만으로 전역 최솟값이라 단정할 수 없으며 국소 최솟값이나 안장점일 가능성도 있다.",
    bookQuestion: { question: "경사 하강법에서 첫 단계에 해당하는 것은?", choices: ["파라미터를 무작위로 다시 초기화한다.", "손실함수를 즉시 0으로 바꾼다.", "파라미터에 대한 기울기를 계산한다.", "항상 test 데이터를 미니배치로 만든다."], answer: "파라미터에 대한 기울기를 계산한다." },
  },
  {
    key: "augmentation", topic: "데이터 증강", category: "ViT·학습 전략",
    definition: "label 의미를 유지하는 crop, flip, 색 변화 등으로 train 입력의 다양성을 늘려 과적합을 줄인다.",
    wrong: ["모든 이미지 label을 무작위로 바꿔 정답 관계를 제거한다.", "validation과 test 데이터도 매번 무작위 변형해 평가 기준을 흔든다.", "모든 입력을 같은 상수 이미지로 바꿔 class 차이를 없앤다."],
    shortQuestion: "두 이미지와 label을 비율로 섞어 새 학습 표본을 만드는 증강 기법을 작성하시오.", shortAnswer: "Mixup",
    application: "train에는 확률적 증강을 적용하고 validation과 test에는 일관된 resize·normalize 같은 결정적 전처리를 적용한다.",
    essayQuestion: "이미지 데이터 증강의 목적과 train에만 적용해야 하는 이유, label을 훼손할 수 있는 사례를 설명하시오.",
    essayAnswer: "데이터 증강은 정답 의미를 유지한 채 입력 모양을 다양하게 만들어 모델이 특정 위치나 색 같은 우연한 패턴을 외우는 것을 줄인다. Random crop, horizontal flip, 색 변화, random erase, mixup, cutmix 등이 사용된다. Validation과 test에는 같은 평가 조건을 유지해야 하므로 확률적 증강을 적용하지 않는다. 또한 방향 자체가 정답인 작업에서 좌우 반전을 쓰면 label 의미가 바뀔 수 있어 과제에 맞게 선택해야 한다.",
    caution: "증강은 데이터 개수를 물리적으로 새로 수집한 것과 같지 않으며 너무 강하면 실제 분포와 다른 잘못된 표본을 만들 수 있다.",
  },
  {
    key: "logistic-transform", topic: "로지스틱회귀의 변환", category: "회귀·신경망",
    definition: "선형 예측값을 sigmoid에 통과시켜 0과 1 사이 확률로 바꾸며 log-odds는 설명변수의 선형함수로 표현한다.",
    wrong: ["선형 예측값을 제곱해 음의 무한대와 양의 무한대 확률을 만든다.", "logistic 회귀는 연속 목표값만 예측하고 class 확률은 만들 수 없다.", "sigmoid 출력은 항상 0보다 작거나 1보다 크다."],
    shortQuestion: "확률 p를 p/(1-p)로 바꾼 값을 뜻하는 용어를 작성하시오.", shortAnswer: "odds",
    application: "β_j가 1 증가하면 다른 조건이 같을 때 odds는 exp(β_j)배가 되는 것으로 해석할 수 있다.",
    essayQuestion: "로지스틱회귀에서 선형 예측값, sigmoid, odds와 log-odds가 어떻게 연결되는지 설명하시오.",
    essayAnswer: "설명변수의 선형결합 z=β0+β1x1+…을 그대로 쓰면 범위 제한이 없어 확률이 될 수 없다. Sigmoid p=1/(1+exp(-z))를 적용하면 출력이 0과 1 사이로 변한다. 이를 변형하면 odds p/(1-p)=exp(z)이고 log-odds log(p/(1-p))=z가 되어 log-odds가 설명변수의 선형함수가 된다. 분류할 때는 확률에 threshold를 적용해 class를 정한다.",
    caution: "회귀라는 이름이 붙지만 목표는 보통 범주 확률이며 threshold 선택은 학습된 확률 함수와 별개의 의사결정 단계다.",
    bookQuestion: { question: "다음 중 로지스틱 함수의 출력 범위로 옳은 것은?", choices: ["[0, 1]", "(0, 1)", "(-∞, +∞)", "{0, 1}"], answer: "(0, 1)" },
  },
  {
    key: "multi-head", topic: "멀티-헤드 어텐션", category: "NLP·Transformer",
    definition: "Q, K, V를 여러 표현 공간으로 투영해 head별 attention을 계산한 뒤 결과를 이어 붙여 다시 투영한다.",
    wrong: ["모든 head가 하나의 scalar만 출력하고 서로 다른 관계를 볼 수 없다.", "head 수를 늘리면 데이터와 차원에 관계없이 성능이 무한히 향상된다.", "멀티-헤드는 attention을 제거하고 순환 hidden state만 사용한다."],
    shortQuestion: "각 attention head의 출력을 하나로 연결할 때 사용하는 연산 이름을 작성하시오.", shortAnswer: "concatenation",
    application: "서로 다른 head가 문법적 관계, 장거리 의존성 등 다양한 패턴에 집중할 기회를 제공한다.",
    essayQuestion: "멀티-헤드 어텐션의 계산 흐름과 head 수를 무조건 늘릴 수 없는 이유를 설명하시오.",
    essayAnswer: "입력에서 head마다 서로 다른 선형투영으로 Q, K, V를 만든다. 각 head는 scaled dot-product attention을 독립적으로 계산해 다른 관계를 포착하고, head 출력을 concatenate한 뒤 출력 projection을 적용한다. 전체 model dimension을 고정하면 head 수가 늘수록 head 하나의 차원은 작아진다. 또한 중복 head, 계산 비용, 데이터 규모와 최적화 영향 때문에 head 수를 늘린다고 성능이 무한히 좋아지지 않는다.",
    caution: "head는 완전히 지정된 역할을 보장받는 것이 아니라 학습을 통해 관계를 나누어 볼 가능성을 제공한다.",
    bookQuestion: { question: "Transformer 모델의 attention head 개수가 늘어날수록 성능은 무한히 향상되는가?", choices: ["O", "X", "학습 데이터와 무관하게 항상 O", "head가 하나일 때만 판단 가능"], answer: "X" },
  },
  {
    key: "preference-learning", topic: "선호 학습", category: "LLM·평가·안전",
    definition: "같은 prompt에 대한 여러 응답의 상대적 선호 정보를 이용해 사람이 더 원하는 응답 방향을 모델에 반영한다.",
    wrong: ["정답 하나의 token ID만 외우고 응답 간 비교는 사용하지 않는다.", "모든 응답에 같은 점수를 주어 선호 차이를 제거한다.", "사전학습 데이터의 다음 token 예측만을 선호 학습이라고 부른다."],
    shortQuestion: "선호 학습에서 chosen 응답과 비교되는 덜 선호된 응답을 영어로 작성하시오.", shortAnswer: "rejected",
    application: "사람이 응답 순위를 매긴 데이터로 reward model을 학습하거나 chosen/rejected 쌍을 직접 이용해 policy를 조정할 수 있다.",
    essayQuestion: "지시 학습과 선호 학습의 학습 신호 차이와 선호 데이터 수집 과정을 설명하시오.",
    essayAnswer: "지시 학습은 prompt와 모범 응답 쌍을 사용해 주어진 지시에 어떤 응답을 생성해야 하는지 지도학습한다. 선호 학습은 같은 prompt에 대해 여러 후보 응답을 만들고 사람이 더 나은 응답의 순위나 chosen/rejected 쌍을 표시한다. 이 상대 비교를 reward model 학습이나 직접 선호 최적화에 사용해 policy가 사람이 선호하는 응답을 더 많이 생성하도록 조정한다.",
    caution: "수집된 선호는 주석자와 지침의 편향을 포함할 수 있으므로 선호가 항상 객관적 사실이나 안전성을 뜻하지 않는다.",
  },
  {
    key: "self-attention", topic: "셀프-어텐션", category: "NLP·Transformer",
    definition: "같은 입력 시퀀스에서 Q, K, V를 만들고 token 간 유사도에 따른 가중합으로 각 token을 문맥화한다.",
    wrong: ["이전 시점 hidden state 하나만 전달하며 모든 token 쌍 비교를 금지한다.", "입력 순서를 자동으로 완벽히 알기 때문에 위치 정보가 전혀 필요 없다.", "각 token을 다른 token과 무관한 고정 one-hot 벡터로만 유지한다."],
    shortQuestion: "scaled dot-product attention에서 QK^T를 나누는 값으로 사용하는 차원을 기호로 작성하시오.", shortAnswer: "√d_k",
    application: "문장 속 같은 단어도 주변 token에 부여한 attention weight가 달라지면 문맥에 맞는 표현으로 바뀐다.",
    essayQuestion: "셀프-어텐션에서 Q, K, V가 만들어지고 출력이 계산되는 과정을 식의 순서에 맞게 설명하시오.",
    essayAnswer: "입력 행렬 X에 서로 다른 가중치 WQ, WK, WV를 곱해 Q, K, V를 만든다. QK^T로 token 쌍의 관련 점수를 계산하고 값이 지나치게 커지는 것을 막기 위해 √d_k로 나눈다. 필요하면 mask를 더한 뒤 행별 softmax로 합이 1인 attention weight를 만든다. 이 weight를 V에 곱해 각 token이 다른 token 정보를 가중합한 문맥 표현을 얻는다.",
    caution: "셀프-어텐션만으로는 순서가 자동 표현되지 않으므로 positional encoding이나 relative position 정보가 필요하다.",
    bookQuestion: { question: "Self-Attention에 해당하는 설명은?", choices: ["시퀀스를 시간 순서로 처리하며 이전 시점의 hidden state만 다음 시점으로 전달해 의존성을 만든다.", "같은 시퀀스에서 Q, K, V를 만들고 token 간 유사도 기반 가중합으로 문맥화한다.", "주변 단어로 중심 단어만 예측하고 고정된 단어 embedding을 얻는 CBOW 방식으로 학습한다.", "각 token이 다른 모든 token을 보지 못하도록 attention score를 완전히 차단해 독립적으로 처리한다."], answer: "같은 시퀀스에서 Q, K, V를 만들고 token 간 유사도 기반 가중합으로 문맥화한다." },
  },
  {
    key: "attention", topic: "어텐션", category: "NLP·Transformer",
    definition: "decoder가 출력할 때 encoder의 여러 hidden state 중 현재 예측에 중요한 부분에 더 큰 가중치를 주어 참고한다.",
    wrong: ["encoder의 마지막 hidden state만 항상 같은 비율로 복사한다.", "입력 길이에 관계없이 모든 위치의 weight를 0으로 만든다.", "decoder를 여러 개 만드는 것만이 attention의 핵심이다."],
    shortQuestion: "attention에서 각 encoder state의 중요도를 정규화해 합이 1이 되게 만드는 함수를 작성하시오.", shortAnswer: "softmax",
    application: "매 decoder 시점마다 다른 alignment weight를 계산해 입력의 관련 단어에 선택적으로 집중한다.",
    essayQuestion: "기본 Seq2Seq의 고정 context 병목을 attention이 어떻게 완화하는지 설명하시오.",
    essayAnswer: "기본 Seq2Seq는 입력 전체를 encoder의 마지막 고정 길이 context vector 하나에 압축하므로 문장이 길어질수록 앞부분 정보가 손실될 수 있다. Attention은 각 decoder 시점에서 현재 상태와 모든 encoder hidden state의 score를 계산하고 softmax weight로 정규화한다. 이 weight를 이용한 hidden state 가중합을 시점별 context로 사용해 필요한 입력 위치를 직접 참고한다.",
    caution: "attention weight는 해석에 도움을 줄 수 있지만 그 자체가 항상 완전한 인과 설명을 제공한다고 단정해서는 안 된다.",
    bookQuestion: { question: "Attention 메커니즘의 가장 핵심적인 아이디어는?", choices: ["encoder를 크게 만들어 마지막 벡터만 사용한다.", "번역할 때마다 입력 문장의 어느 부분이 중요한지 선택적으로 집중한다.", "decoder를 여러 개 사용해 정답을 투표한다.", "입력 문장을 더 작은 단위로만 자르는 전처리다."], answer: "번역할 때마다 입력 문장의 어느 부분이 중요한지 선택적으로 집중한다." },
  },
  {
    key: "language-model", topic: "언어모델", category: "NLP·Transformer",
    definition: "언어모델은 앞선 문맥에 조건부로 다음 token 또는 token sequence의 확률을 모델링한다.",
    wrong: ["문장의 확률과 무관하게 모든 다음 단어에 항상 같은 확률을 준다.", "입력 이미지만 분류하고 텍스트 확률은 계산할 수 없다.", "학습 말뭉치의 문장을 파일 순서대로 복사하는 데이터베이스만을 뜻한다."],
    shortQuestion: "n-gram 언어모델에서 n=4일 때 다음 단어 예측에 조건으로 사용하는 직전 단어 수를 작성하시오.", shortAnswer: "3",
    application: "4-gram에서 같은 세 단어 뒤 AI가 450회, algorithm이 270회 나왔다면 AI의 조건부확률이 더 높다.",
    essayQuestion: "n-gram 언어모델과 신경망 언어모델이 다음 token 확률을 추정하는 방식과 차이를 설명하시오.",
    essayAnswer: "n-gram 언어모델은 직전 n-1개 token의 출현 횟수를 세어 다음 token의 조건부확률을 계산한다. 직접 관측되지 않은 조합은 확률 추정이 어렵고 문맥 길이를 늘리면 희소성이 커진다. 신경망 언어모델은 token을 embedding으로 바꾸고 모델 파라미터로 문맥 표현을 학습해 vocabulary 전체의 다음 token 분포를 출력한다. 비슷한 문맥 사이에서 통계 정보를 공유할 수 있고 긴 문맥도 다룰 수 있다.",
    caution: "확률이 가장 높은 token만 계속 고르는 것과 언어모델 자체의 확률분포를 학습하는 것은 구분해야 한다.",
    bookQuestion: { question: "4-gram 언어모델에서 'SSAFY students learn' 뒤 algorithm 270회, AI 450회, python 180회가 관측되었다. 가장 확률이 높은 다음 단어는?", choices: ["algorithm", "AI", "python", "database"], answer: "AI" },
  },
  {
    key: "overfit-shift", topic: "오버피팅과 분포 변화", category: "ViT·학습 전략",
    definition: "dropout은 학습 중 뉴런을 무작위로 꺼 특정 뉴런 조합에 대한 의존과 오버피팅을 줄이는 정규화 기법이다.",
    wrong: ["dropout은 추론 때도 같은 확률로 뉴런을 계속 꺼야만 올바르게 동작한다.", "학습 때 출력 감소를 보정하지 않아도 학습과 추론 출력 분포는 항상 같다.", "dropout 확률이 커질수록 정보 손실 없이 정확도가 반드시 계속 향상된다."],
    shortQuestion: "dropout 확률 p=0.5일 때 inverted dropout이 남은 activation에 곱하는 배율을 숫자로 작성하시오.", shortAnswer: "2",
    application: "inverted dropout은 학습 때 살아남은 activation을 1/(1-p)배해 기대 출력 크기를 맞추고 추론 때 모든 뉴런을 그대로 사용한다.",
    essayQuestion: "dropout이 오버피팅을 줄이는 원리와 학습-추론 간 출력 분포 차이, inverted dropout의 해결 방식을 설명하시오.",
    essayAnswer: "Dropout은 학습할 때 각 뉴런을 확률 p로 무작위로 꺼 모델이 특정 뉴런 조합에만 의존하지 않도록 하며 여러 subnet을 학습한 것과 비슷한 정규화 효과를 낸다. 하지만 학습 때 평균 출력이 1-p배로 줄어든 상태에서 추론 때 모든 뉴런을 그대로 쓰면 출력 크기와 분포가 달라진다. Inverted dropout은 학습 때 살아남은 activation을 1/(1-p)배해 기대 크기를 맞추므로 추론 때 별도 scaling 없이 모든 뉴런을 사용할 수 있다.",
    caution: "dropout은 train mode에서만 무작위로 적용하고 eval mode에서는 비활성화하며 BatchNorm과 함께 쓸 때 동작 모드를 특히 확인해야 한다.",
    bookQuestion: { question: "드롭아웃 활용 시 유의할 점을 설명한 것으로 옳은 것은?", choices: ["학습 때 출력 감소를 보정하지 않으면 추론 때 모든 뉴런을 사용해 출력 분포 차이가 생길 수 있다.", "추론 때도 뉴런을 무작위로 꺼야만 예측이 결정적이 된다.", "dropout은 모델 파라미터를 영구 삭제하는 pruning과 완전히 같다.", "dropout 확률과 관계없이 학습과 추론의 출력 크기는 자동으로 항상 같다."], answer: "학습 때 출력 감소를 보정하지 않으면 추론 때 모든 뉴런을 사용해 출력 분포 차이가 생길 수 있다." },
  },
  {
    key: "on-device-vlm", topic: "온디바이스 VLM", category: "파운데이션·VLM",
    definition: "작은 VLM은 제한된 메모리와 계산 자원의 장치에서 이미지와 언어를 함께 처리하도록 모델 크기와 실행 비용을 줄인다.",
    wrong: ["모든 입력을 항상 외부 서버로 보내 네트워크 의존성을 높이는 것이 목적이다.", "파라미터와 activation을 의도적으로 늘려 모바일 실행을 막는다.", "이미지 기능을 제거하고 파일 이름만 읽는 모델을 VLM이라 부른다."],
    shortQuestion: "가중치를 더 적은 비트 수로 표현해 모델 크기와 메모리를 줄이는 기법을 작성하시오.", shortAnswer: "양자화",
    application: "장치 내부 실행은 지연시간과 개인정보 전송을 줄일 수 있지만 성능, 배터리와 메모리 제약을 함께 고려해야 한다.",
    essayQuestion: "온디바이스 VLM이 필요한 이유와 모델을 경량화하는 방법, 발생 가능한 trade-off를 설명하시오.",
    essayAnswer: "서버 연결이 어렵거나 개인정보를 외부로 보내기 곤란한 환경에서는 장치 안에서 이미지와 언어를 처리할 필요가 있다. 이를 위해 작은 backbone과 language model, 지식 증류, pruning, 양자화, 효율적인 tokenizer를 사용할 수 있다. 모델과 activation memory가 줄어 지연시간과 통신 비용은 낮아지지만 낮은 정밀도와 작은 용량 때문에 정확도나 복잡한 추론 능력이 감소할 수 있어 실제 장치에서 측정해야 한다.",
    caution: "파라미터 수가 작다는 사실만으로 실제 속도가 보장되지는 않으며 메모리 접근, 연산 지원과 입력 길이도 영향을 준다.",
  },
  {
    key: "supervised-purpose", topic: "지도학습의 목적", category: "ML 기초·검증",
    definition: "입력과 label 쌍으로 관계를 학습해 훈련에 쓰지 않은 새로운 입력의 label을 잘 예측하는 것이 목적이다.",
    wrong: ["훈련 데이터의 정답을 외워 train 오류만 0으로 만들면 목적이 완전히 달성된다.", "label이 전혀 없는 데이터에서 구조를 찾는 것만을 지도학습이라 한다.", "모든 관측의 측정오차를 데이터에서 완전히 제거하는 것이 목적이다."],
    shortQuestion: "지도학습에서 모델이 예측해야 하는 정답 또는 목표값을 뜻하는 용어를 작성하시오.", shortAnswer: "label",
    application: "연속 수치를 예측하면 회귀, 미리 정한 범주를 예측하면 분류이며 둘 모두 새 데이터 일반화가 핵심이다.",
    essayQuestion: "지도학습의 학습 데이터 구성과 궁극적 목적을 train 오류와 test 오류의 차이를 포함해 설명하시오.",
    essayAnswer: "지도학습 데이터는 입력 feature와 정답 label의 쌍으로 구성된다. 모델은 이 표본에서 예측과 정답의 손실을 줄이는 함수를 학습하지만 궁극적인 목적은 학습에 사용하지 않은 새로운 입력에서도 label을 정확히 예측하는 일반화다. Train 오류는 이미 본 데이터에 대한 오차라 실제 새 데이터 성능을 낙관적으로 볼 수 있으므로 validation으로 선택하고 test 오류로 최종 일반화 성능을 확인한다.",
    caution: "훈련 오류 최소화는 학습 수단이지 최종 목적 자체가 아니며 test 데이터를 반복해서 모델 선택에 사용하면 누수가 생긴다.",
    bookQuestion: { question: "다음 중 지도학습에 대한 설명으로 옳은 것은?", choices: ["입력만 있고 label이 없는 데이터로 학습한다.", "새로운 입력의 정답을 잘 맞추는 함수를 학습한다.", "훈련 데이터 오류만 최소화하고 일반화는 고려하지 않는다.", "출력은 반드시 범주만 가능하다."], answer: "새로운 입력의 정답을 잘 맞추는 함수를 학습한다." },
  },
  {
    key: "instruction-learning", topic: "지시 학습", category: "LLM·평가·안전",
    definition: "다양한 자연어 지시와 바람직한 응답 쌍으로 supervised fine-tuning해 보지 못한 지시도 수행하도록 학습한다.",
    wrong: ["한 가지 고정 지시만 반복할수록 모든 새 task의 일반화가 보장된다.", "사람 선호 순위만 사용하고 모범 응답 쌍은 전혀 사용하지 않는다.", "모델 크기와 데이터 다양성은 지시 학습 효과에 아무 영향이 없다."],
    shortQuestion: "지시와 모범 응답 쌍을 사용한 지도 추가 학습의 약어를 작성하시오.", shortAnswer: "SFT",
    application: "지시 표현과 task 종류가 다양할수록 학습 중 보지 못한 지시에 대한 zero-shot 일반화를 도울 수 있다.",
    essayQuestion: "지시 학습의 데이터 형태, 기존 task별 fine-tuning과의 차이, 성능에 영향을 주는 요소를 설명하시오.",
    essayAnswer: "지시 학습은 자연어로 적은 지시와 입력, 바람직한 출력으로 구성한 여러 task의 데이터를 하나의 모델에 supervised fine-tuning한다. 한 task의 label만 맞추는 기존 fine-tuning보다 지시 자체를 읽고 다양한 작업 형식을 따르는 능력을 목표로 한다. 지시 표현과 task 종류의 다양성이 새 지시 일반화에 중요하며, 모델이 너무 작으면 지시를 이해하고 능력을 전환하는 효과가 제한될 수 있다.",
    caution: "지시 학습은 상대적 선호를 직접 학습하는 선호 학습과 다르며 지시를 잘 따른다고 사실성과 안전성이 자동 보장되지는 않는다.",
  },
  {
    key: "true-function-error", topic: "참 함수와 측정오차", category: "ML 기초·검증",
    definition: "Y=f*(X)+ε에서 f*는 feature와 label의 실제 평균 관계이고 ε는 관측마다 달라지는 제거 불가능한 오차를 나타낸다.",
    wrong: ["학습이 끝나면 모든 관측의 ε를 정확히 0으로 만들 수 있다.", "f*는 훈련을 시작하기 전에 항상 정확히 알려진 함수다.", "ε의 평균이 0이면 각 관측의 오차도 반드시 모두 0이다."],
    shortQuestion: "Y=f*(X)+ε에서 관측할 수 없는 참 함수를 나타내는 기호를 작성하시오.", shortAnswer: "f*(X)",
    application: "E[ε]=0은 반복 관측의 오차가 한쪽으로 치우치지 않는다는 뜻이지 매 관측 오차가 0이라는 뜻은 아니다.",
    essayQuestion: "Y=f*(X)+ε 모형에서 f*와 ε의 의미, 학습을 통해 가능한 것과 불가능한 것을 설명하시오.",
    essayAnswer: "f*(X)는 같은 feature X에서 label Y가 평균적으로 어떻게 변하는지를 나타내는 미지의 참 관계다. ε는 측정 잡음이나 관측되지 않은 요인 때문에 개별 관측이 그 평균 관계에서 벗어나는 부분이다. 학습은 유한한 데이터로 f*에 가까운 함수 f를 추정해 새 입력을 예측하고 중요한 feature 관계를 이해할 수 있다. 그러나 이미 포함된 개별 측정오차를 모두 식별하거나 제거할 수는 없다.",
    caution: "오차 평균 0과 오차 없음은 다르며 irreducible error 때문에 완벽한 f*를 알아도 개별 Y 예측에는 불확실성이 남는다.",
    bookQuestion: { question: "다음 중 미지의 참 함수 f*(X)를 학습하는 이유로 적절하지 않은 것은?", choices: ["feature와 label의 관계를 알기 위해", "모든 데이터의 측정오차 ε를 제거하기 위해", "새 입력의 목표값을 예측하기 위해", "중요한 feature와 변화 방향을 알기 위해"], answer: "모든 데이터의 측정오차 ε를 제거하기 위해" },
  },
  {
    key: "clustering-standard", topic: "클러스터링과 표준화", category: "ML 기초·검증",
    definition: "거리 기반 clustering 전에 feature를 평균 0, 분산 1로 표준화하면 큰 단위 feature가 거리를 지배하는 현상을 줄인다.",
    wrong: ["표준화는 모든 관측을 같은 점으로 만들어 군집 차이를 제거한다.", "K-means에서 feature scale은 거리와 결과에 아무 영향이 없다.", "표준화하면 K-means가 언제나 전역 최적해를 보장한다."],
    shortQuestion: "각 feature에서 평균을 빼고 표준편차로 나눈 값을 뜻하는 용어를 작성하시오.", shortAnswer: "z-score",
    application: "소득 단위가 원이고 나이가 년이면 표준화하지 않은 Euclidean distance는 소득 차이에 지나치게 좌우될 수 있다.",
    essayQuestion: "K-means가 feature scale에 민감한 이유와 StandardScaler를 적용할 때 주의할 점을 설명하시오.",
    essayAnswer: "K-means는 관측치와 중심 사이의 제곱 Euclidean distance를 줄이도록 군집을 만든다. 단위나 분산이 큰 feature는 수치 차이가 커 거리의 대부분을 차지하므로 다른 feature의 정보가 무시될 수 있다. 각 feature를 평균 0, 분산 1로 표준화하면 비교 가능한 scale을 만든다. 다만 train에서 계산한 평균과 표준편차를 validation과 test에 그대로 적용해야 하며 이상치가 심하면 robust scaling도 검토한다.",
    caution: "표준화는 거리의 상대적 기여를 바꾸므로 항상 정답인 전처리는 아니며 도메인에서 중요한 실제 scale을 보존할지도 판단해야 한다.",
  },
  {
    key: "fine-tuning", topic: "파인튜닝", category: "ViT·학습 전략",
    definition: "사전학습된 가중치를 출발점으로 새 task 데이터에서 일부 또는 전체 파라미터를 추가 학습해 적응한다.",
    wrong: ["모델 가중치를 전혀 바꾸지 않고 prompt 문구만 수정하는 것과 항상 같다.", "사전학습 가중치를 모두 삭제하고 무작위로 처음부터 학습하는 것만 뜻한다.", "데이터가 적을수록 모든 층을 큰 학습률로 갱신해야 과적합이 사라진다."],
    shortQuestion: "사전학습 backbone을 고정하고 새 linear classifier만 학습하는 방법을 작성하시오.", shortAnswer: "linear probing",
    application: "새 데이터가 적고 사전학습 분포와 비슷하면 head부터 학습하고 필요할 때 작은 학습률로 backbone을 점진적으로 푼다.",
    essayQuestion: "linear probing과 전체 fine-tuning의 차이, 새 데이터가 적을 때의 안전한 적용 순서를 설명하시오.",
    essayAnswer: "Linear probing은 사전학습 backbone을 고정하고 새 task의 linear head만 학습해 기존 표현의 유용성을 확인하는 방법이다. 전체 fine-tuning은 backbone까지 갱신해 새 분포에 더 강하게 적응하지만 계산 비용과 과적합, 기존 표현 손상 위험이 커진다. 데이터가 적으면 먼저 probing을 수행하고 부족할 때 상위 층부터 풀거나 작은 학습률로 전체를 조정하며 validation으로 증강과 정규화 강도를 선택한다.",
    caution: "freeze한 파라미터의 gradient뿐 아니라 BatchNorm 통계와 dropout의 train/eval mode도 원하는 대로 고정되었는지 확인해야 한다.",
  },
];

const makeVariants = (spec: TopicSpec): HintQuestion[] => {
  const first = spec.bookQuestion ?? {
    question: `${spec.topic}에 대한 설명으로 옳은 것은?`,
    choices: [
      spec.definition,
      spec.wrong[0],
      spec.wrong[1],
      spec.wrong[2],
    ] as [string, string, string, string],
    answer: spec.definition,
  };
  const applicationAnswer = spec.application;
  const incorrectAnswer = [...spec.wrong].sort((left, right) => right.length - left.length)[0];
  return [
    { id: `hint5-${spec.key}-1`, topic: spec.topic, category: spec.category, kind: "객관식", difficulty: "핵심", question: first.question, choices: first.choices, answer: first.answer, explanation: `${spec.definition} ${spec.caution}` },
    { id: `hint5-${spec.key}-2`, topic: spec.topic, category: spec.category, kind: "단답형", difficulty: "핵심", question: spec.shortQuestion, answer: spec.shortAnswer, explanation: `${spec.definition} ${spec.application} ${spec.caution}` },
    { id: `hint5-${spec.key}-3`, topic: spec.topic, category: spec.category, kind: "객관식", difficulty: "사고형", question: `${spec.topic}에 관한 다음 설명 중 실제 적용이나 해석에 가장 적절한 것은?`, choices: [applicationAnswer, spec.wrong[0], spec.wrong[1], spec.wrong[2]], answer: applicationAnswer, explanation: `${spec.application} ${spec.definition} ${spec.caution}` },
    { id: `hint5-${spec.key}-4`, topic: spec.topic, category: spec.category, kind: "서술형", difficulty: "고난도", question: spec.essayQuestion, answer: spec.essayAnswer, explanation: `${spec.essayAnswer}\n\n${spec.caution}` },
    { id: `hint5-${spec.key}-5`, topic: spec.topic, category: spec.category, kind: "객관식", difficulty: "사고형", question: `${spec.topic}에 대한 설명으로 옳지 않은 것은?`, choices: [spec.definition, spec.application, spec.caution, incorrectAnswer], answer: incorrectAnswer, explanation: `다음 설명은 옳지 않다.\n\n${incorrectAnswer}\n\n${spec.definition} ${spec.caution}` },
  ];
};

const variantsByTopic = specs.map((spec) => {
  const variants = makeVariants(spec);
  const availableSlots: Record<Kind, number[]> = {
    "객관식": spec.bookQuestion ? [2, 4] : [0, 2, 4],
    "단답형": [1],
    "서술형": [3],
  };
  for (const question of textbookQuestions.filter((item) => item.topic === spec.topic)) {
    const slot = availableSlots[question.kind].shift();
    if (slot === undefined) continue;
    variants[slot] = { ...question, topic: spec.topic } as HintQuestion;
  }
  return variants;
});

export const hintSupplementQuestions: HintQuestion[] = variantsByTopic.flat();

export const hintExamTopics = specs.map(({ topic, key }) => ({ topic, key }));

export const hintExamSets: HintQuestion[][] = Array.from({ length: 5 }, (_, examIndex) =>
  variantsByTopic.map((variants, topicIndex) => variants[(examIndex + topicIndex) % 5]),
);

export const hintExplanationNotes: Record<string, string> = Object.fromEntries(
  hintSupplementQuestions.map((question) => [
    question.id,
    `${question.topic} 문항에서는 정의만 외우기보다 입력과 출력, 학습 신호, 계산 순서와 적용 조건을 함께 구분해야 한다.\n\n정답: ${question.answer}\n\n지문의 조건을 바꾸면 같은 용어라도 결론이 달라질 수 있다.`,
  ]),
);
