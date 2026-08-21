type HintQuestion = {
  id: string;
  category: "NLP·Transformer" | "LLM·평가·안전" | "ViT·학습 전략";
  kind: "객관식" | "서술형";
  difficulty: "핵심" | "사고형" | "고난도";
  question: string;
  choices?: string[];
  answer: string;
  explanation: string;
};

export const hintSupplementQuestions: HintQuestion[] = [
  {
    id: "hint-rlhf",
    category: "LLM·평가·안전",
    kind: "서술형",
    difficulty: "고난도",
    question: "RLHF의 대표적인 학습 절차를 SFT, Reward Model, policy 최적화 순서로 설명하시오.",
    answer: "먼저 지시와 모범 응답 쌍으로 SFT를 수행해 기본적인 지시 수행 능력을 만든다. 다음으로 같은 prompt에 대한 여러 응답의 사람 선호 순위를 수집하고 Reward Model이 선호 응답에 높은 점수를 주도록 학습한다. 마지막으로 언어모델 policy가 Reward Model 점수를 높이도록 최적화하되, 기준 모델에서 지나치게 멀어지지 않도록 KL 패널티를 함께 사용한다.",
    explanation: "RLHF는 사람의 선호를 곧바로 언어모델에 한 번 주입하는 절차가 아닙니다. 지도 미세조정으로 출발점을 만들고, 비교 선호를 점수로 바꾸는 모델을 학습한 뒤, 그 점수를 이용해 policy를 조정하는 단계로 나뉩니다.",
  },
  {
    id: "hint-open-closed-llm",
    category: "LLM·평가·안전",
    kind: "객관식",
    difficulty: "핵심",
    question: "개방형 LLM과 폐쇄형 LLM의 일반적인 차이로 가장 적절한 것은?",
    answer: "개방형은 공개된 가중치 등을 직접 배포·수정할 수 있고, 폐쇄형은 주로 제공자의 API로 사용한다.",
    explanation: "개방형 모델은 공개 범위에 따라 가중치나 코드 등을 내려받아 자체 환경에서 실행하고 조정할 수 있습니다. 폐쇄형 모델은 내부 가중치를 공개하지 않고 서비스나 API 형태로 접근하게 하는 경우가 일반적입니다.",
    choices: [
      "개방형은 공개된 가중치 등을 직접 배포·수정할 수 있고, 폐쇄형은 주로 제공자의 API로 사용한다.",
      "개방형은 인터넷 연결 없이는 실행할 수 없고, 폐쇄형은 항상 모든 가중치를 내려받아 직접 실행한다.",
      "개방형은 상업용으로만 쓸 수 있고, 폐쇄형은 어떤 이용 조건이나 비용도 존재하지 않는다.",
      "개방형은 학습된 적 없는 모델이고, 폐쇄형은 학습 데이터를 모두 공개한 모델만을 의미한다.",
    ],
  },
  {
    id: "hint-augmentation",
    category: "ViT·학습 전략",
    kind: "객관식",
    difficulty: "핵심",
    question: "이미지 데이터 증강을 적용하는 목적과 방법의 연결로 옳은 것은?",
    answer: "label을 유지하는 crop·flip·색 변화로 입력 다양성을 높여 과적합을 줄인다.",
    explanation: "데이터 증강은 같은 정답을 유지하는 범위에서 입력 모양을 바꿔 학습 예시를 다양하게 만듭니다. 모델이 특정 위치나 색상 같은 우연한 특징을 외우는 현상을 줄이는 데 사용합니다.",
    choices: [
      "label을 유지하는 crop·flip·색 변화로 입력 다양성을 높여 과적합을 줄인다.",
      "모든 이미지의 label을 무작위로 바꿔 모델이 정답 관계를 학습하지 못하게 한다.",
      "validation과 test 이미지를 훈련 데이터에 합쳐 최종 평가 점수를 직접 높인다.",
      "입력 이미지를 전부 같은 상수로 바꿔 class마다 나타나는 차이를 완전히 제거한다.",
    ],
  },
  {
    id: "hint-seq2seq-transformer",
    category: "NLP·Transformer",
    kind: "서술형",
    difficulty: "고난도",
    question: "RNN 기반 Seq2Seq와 Transformer의 입력 처리 방식을 순차 처리, 정보 전달, 병렬성 관점에서 비교하시오.",
    answer: "RNN 기반 Seq2Seq는 이전 hidden state에 의존해 token을 순서대로 처리하므로 병렬화가 어렵고, 기본 구조에서는 전체 입력을 고정 길이 context에 압축해 긴 문장에서 정보 병목이 생길 수 있다. Attention을 추가하면 decoder가 encoder의 여러 상태를 직접 참조해 병목을 줄인다. Transformer는 순환 연결 없이 self-attention으로 모든 위치 관계를 계산하고 위치 인코딩으로 순서를 제공하므로 학습 시 병렬 처리가 쉽고 먼 token 사이의 정보 전달 경로도 짧다.",
    explanation: "두 구조의 차이는 단순히 신구 모델의 차이가 아닙니다. RNN 계열은 직전 상태를 이어 가고, Transformer는 attention으로 위치 사이를 직접 연결합니다. Seq2Seq에 attention을 붙였을 때 고정 context 병목이 어떻게 완화되는지도 함께 구분해야 합니다.",
  },
  {
    id: "hint-overfit-shift",
    category: "ViT·학습 전략",
    kind: "서술형",
    difficulty: "고난도",
    question: "과적합과 데이터 분포 변화가 새 데이터 성능을 떨어뜨리는 이유를 구분하고, 각각의 점검 방법을 설명하시오.",
    answer: "과적합은 모델이 훈련 데이터의 우연한 패턴까지 학습해 train 오차는 작지만 같은 분포의 validation 오차가 커지는 현상이다. 검증 곡선, 정규화, 데이터 증강, early stopping으로 점검하고 완화할 수 있다. 분포 변화는 배포 입력의 class 비율, 촬영 조건, feature 관계 등이 학습 데이터와 달라진 상황이므로 기존 validation 성능이 좋아도 배포 성능이 낮아질 수 있다. 학습·검증·배포 데이터의 통계와 오류 유형을 비교하고 새 분포를 반영한 평가 데이터로 다시 확인해야 한다.",
    explanation: "과적합은 같은 문제를 지나치게 외운 상태이고, 분포 변화는 실제로 들어오는 문제의 성격이 달라진 상태입니다. 둘 다 일반화 성능을 낮추지만 train-validation 곡선과 배포 데이터 비교처럼 확인해야 할 증거가 다릅니다.",
  },
  {
    id: "hint-cnn-vit",
    category: "ViT·학습 전략",
    kind: "객관식",
    difficulty: "사고형",
    question: "CNN과 ViT의 이미지 처리 구조를 비교한 설명으로 옳은 것은?",
    answer: "CNN은 국소 필터와 가중치 공유를 사용하고, ViT는 patch token 사이의 self-attention을 사용한다.",
    explanation: "CNN은 가까운 픽셀의 패턴을 같은 필터로 반복 탐색한다는 구조적 가정을 갖습니다. ViT는 이미지를 patch token으로 바꾼 뒤 self-attention으로 멀리 떨어진 patch 관계도 직접 계산합니다.",
    choices: [
      "CNN은 국소 필터와 가중치 공유를 사용하고, ViT는 patch token 사이의 self-attention을 사용한다.",
      "CNN은 모든 픽셀을 언어 token으로 바꾸고, ViT는 순환 hidden state만 사용해 한 칸씩 처리한다.",
      "CNN은 위치별로 완전히 다른 필터를 쓰고, ViT는 이미지 전체에서 하나의 평균값만 계산한다.",
      "CNN과 ViT는 입력 구조와 연산이 완전히 같으며 모델 이름만 서로 다르게 붙인 것이다.",
    ],
  },
];

export const hintExplanationNotes: Record<string, string> = {
  "hint-rlhf": "Reward Model은 사람을 대신해 정답을 판정하는 절대적인 심판이 아니라 선호 비교를 근사합니다. 그래서 policy가 보상 점수의 빈틈만 이용하지 않도록 기준 모델과의 거리, 별도 평가, 사람 검토가 필요합니다.",
  "hint-open-closed-llm": "개방형이라고 해서 제한이 전혀 없는 것은 아닙니다. 공개 범위와 재배포·상업 이용 가능 여부는 각 모델의 라이선스에서 따로 확인해야 하며, 폐쇄형도 제공 기능과 데이터 처리 정책이 서비스마다 다릅니다.",
  "hint-augmentation": "증강이 label의 의미를 바꾸면 오히려 잘못된 학습 데이터가 됩니다. 예를 들어 방향 자체가 정답인 문제에서 무조건 좌우 반전을 적용하면 안 되므로 작업의 의미를 기준으로 변환을 선택합니다.",
  "hint-seq2seq-transformer": "기본 Seq2Seq, attention이 추가된 Seq2Seq, Transformer를 세 단계로 나누면 정리가 쉽습니다. 고정 길이 context의 병목은 attention이 줄이고, 순환 계산의 병렬화 한계는 Transformer 구조가 크게 바꿉니다.",
  "hint-overfit-shift": "validation도 과거 학습 데이터와 매우 비슷하게 만들었다면 배포 환경의 변화를 잡지 못할 수 있습니다. 시간·장소·장치처럼 실제 변화 축을 반영해 평가 구간을 나누고 성능을 따로 확인해야 합니다.",
  "hint-cnn-vit": "ViT가 항상 CNN보다 좋은 것은 아닙니다. CNN의 locality라는 귀납 편향은 데이터가 적을 때 도움이 될 수 있고, ViT는 충분한 사전학습 데이터에서 전역 관계를 학습하는 장점이 잘 드러납니다.",
};

export const hintExamTopics = [
  { topic: "CLIP", id: "fm-03" },
  { topic: "CNN 출력 크기 계산", id: "cnn-03" },
  { topic: "Deep Network", id: "cnn-15" },
  { topic: "LSTM 게이트", id: "nlp-03" },
  { topic: "RLHF 학습 절차", id: "hint-rlhf" },
  { topic: "개방형과 폐쇄형 LLM", id: "hint-open-closed-llm" },
  { topic: "데이터 증강", id: "hint-augmentation" },
  { topic: "선형 함수", id: "nn-01" },
  { topic: "언어모델", id: "llm-10" },
  { topic: "지도학습의 목적", id: "ml-26" },
  { topic: "클러스터링과 표준화", id: "ml-18" },
  { topic: "CLIP Zero-shot 분류", id: "fm-06" },
  { topic: "CNN 파라미터 수 계산", id: "cnn-05" },
  { topic: "Diffusion 이미지 생성", id: "fm-18" },
  { topic: "p-value 해석", id: "nn-11" },
  { topic: "Seq2Seq와 Transformer", id: "hint-seq2seq-transformer" },
  { topic: "결정계수 R²", id: "ml-13" },
  { topic: "로지스틱회귀의 변환", id: "nn-03" },
  { topic: "셀프-어텐션", id: "nlp-06" },
  { topic: "오버피팅과 분포 변화", id: "hint-overfit-shift" },
  { topic: "지식 학습", id: "fm-22" },
  { topic: "파인튜닝", id: "fm-02" },
  { topic: "CNN 공간 구조", id: "cnn-01" },
  { topic: "CNN과 ViT", id: "hint-cnn-vit" },
  { topic: "LLM 안전 정렬", id: "llm-14" },
  { topic: "ReLU", id: "nn-04" },
  { topic: "Top-k, Top-p 샘플링", id: "llm-21" },
  { topic: "경사하강법", id: "nn-05" },
  { topic: "멀티-헤드 어텐션", id: "nlp-17" },
  { topic: "어텐션", id: "nlp-16" },
  { topic: "온디바이스 VLM", id: "fm-13" },
  { topic: "참 함수와 측정오차", id: "ml-10" },
] as const;
