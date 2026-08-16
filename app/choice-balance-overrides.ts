export type ChoiceBalanceOverride = {
  answer: string;
  choices: [string, string, string, string];
};

export const choiceBalanceOverrides: Record<string, ChoiceBalanceOverride> = {
  "py-04": {
    answer: "response.status_code",
    choices: ["response.headers", "response.status_code", "response.encoding", "response.elapsed"],
  },
  "py-06": {
    answer: "환경 변수에서 os.environ.get으로 읽는다.",
    choices: [
      "환경 변수에서 os.environ.get으로 읽는다.",
      "소스 코드에 직접 적어 Git에 함께 올린다.",
      "실행할 때마다 로그에 키 전체를 기록한다.",
      ".env 파일을 공개 저장소에 함께 올린다.",
    ],
  },
  "py-14": {
    answer: "return은 값을 돌려주고 함수를 끝낸다.",
    choices: [
      "return은 값을 돌려주고 함수를 끝낸다.",
      "print는 출력한 값을 항상 호출 위치에 돌려준다.",
      "return 뒤의 코드도 같은 함수 호출에서 계속 실행된다.",
      "print와 return은 출력과 반환을 모두 똑같이 수행한다.",
    ],
  },
  "py-16": {
    answer: "user.get('age', 0)",
    choices: ["user['age'] or 0", "user.get('age', 0)", "user.age.get(0)", "user['age'] = 0"],
  },
  "py-19": {
    answer: "JSON 본문을 Python 객체로 변환하는 메서드다.",
    choices: [
      "JSON 본문을 Python 객체로 변환하는 메서드다.",
      "HTTP 상태 코드를 정수로 변환하는 메서드다.",
      "요청 URL을 JSON 문자열로 변환하는 메서드다.",
      "응답 종류와 무관하게 문자열만 반환하는 메서드다.",
    ],
  },
  "py-23": {
    answer: "choices가 존재하고 비어 있지 않은지 확인한다.",
    choices: [
      "choices가 존재하고 비어 있지 않은지 확인한다.",
      "temperature 값이 정확히 1인지 먼저 확인한다.",
      "응답의 모든 header가 삭제됐는지 먼저 확인한다.",
      "응답 URL이 빈 문자열이 아닌지 먼저 확인한다.",
    ],
  },
  "np-05": {
    answer: "df.groupby('부서')['급여'].mean()",
    choices: [
      "df.groupby('부서')['급여'].sum()",
      "df.groupby('부서')['급여'].mean()",
      "df.groupby('급여')['부서'].mean()",
      "df.groupby('부서')['급여'].count()",
    ],
  },
  "np-09": {
    answer: "count()는 NaN을 빼고 size()는 포함해 센다.",
    choices: [
      "count()는 NaN을 빼고 size()는 포함해 센다.",
      "count()와 size()는 NaN을 항상 똑같이 센다.",
      "count()는 NaN을 포함하고 size()는 제외해 센다.",
      "count()와 size()는 숫자형 열에서만 사용할 수 있다.",
    ],
  },
  "np-12": {
    answer: "0과 1을 포함한 등간격 값 5개를 만든다.",
    choices: [
      "0과 1을 포함한 등간격 값 5개를 만든다.",
      "0부터 1 직전까지 간격 5인 값을 만든다.",
      "0과 1 사이의 정수값 5개만 만들어 낸다.",
      "0과 1로 채운 5×5 형태의 배열을 만든다.",
    ],
  },
  "np-14": {
    answer: "(3,)이 각 행에 적용되어 결과는 (2, 3)이다.",
    choices: [
      "(3,)이 각 행에 적용되어 결과는 (2, 3)이다.",
      "두 배열이 연결되어 결과 shape는 (5,)가 된다.",
      "shape가 다르므로 연산 없이 ValueError가 발생한다.",
      "vector가 열 방향으로 적용되어 결과는 (3, 2)이다.",
    ],
  },
  "np-16": {
    answer: "오름차순 정렬 순서의 index 배열",
    choices: [
      "오름차순 정렬 순서의 index 배열",
      "오름차순으로 정렬된 원본 값 배열",
      "내림차순 정렬 순서의 index 배열",
      "중복 원소가 제거된 고유값 배열",
    ],
  },
  "np-17": {
    answer: "df['매출']은 Series, df[['매출']]은 DataFrame이다.",
    choices: [
      "df['매출']은 Series, df[['매출']]은 DataFrame이다.",
      "df['매출']과 df[['매출']]은 모두 Series이다.",
      "df['매출']과 df[['매출']]은 모두 DataFrame이다.",
      "df['매출']은 DataFrame, df[['매출']]은 list이다.",
    ],
  },
  "np-19": {
    answer: "df.pivot_table(index='부서', columns='연도', values='매출', aggfunc='sum')",
    choices: [
      "df.pivot_table(index='부서', columns='연도', values='매출', aggfunc='sum')",
      "df.pivot_table(index='연도', columns='부서', values='매출', aggfunc='mean')",
      "df.pivot_table(index='부서', columns='매출', values='연도', aggfunc='count')",
      "df.pivot_table(index='매출', columns='연도', values='부서', aggfunc='first')",
    ],
  },
  "np-21": {
    answer: "ndarray 원소는 일반적으로 공통 dtype을 사용한다.",
    choices: [
      "ndarray 원소는 일반적으로 공통 dtype을 사용한다.",
      "Python list 원소는 반드시 공통 dtype을 사용한다.",
      "ndarray 원소는 반드시 서로 다른 dtype을 사용한다.",
      "list와 ndarray의 덧셈은 언제나 같은 결과를 만든다.",
    ],
  },
  "np-23": {
    answer: "df[df['city'].isin(['Seoul', 'Busan'])]",
    choices: [
      "df[df['city'].isin(['Seoul', 'Busan'])]",
      "df[df['city'].isin('Seoul' and 'Busan')]",
      "df[df['city'] == ['Seoul', 'Busan']]",
      "df[df['city'] in ['Seoul', 'Busan']]",
    ],
  },
  "np-24": {
    answer: "실제 인코딩에 맞춰 utf-8-sig나 cp949를 지정한다.",
    choices: [
      "실제 인코딩에 맞춰 utf-8-sig나 cp949를 지정한다.",
      "모든 열의 dtype을 문자열로 바꾼 뒤 다시 읽는다.",
      "구분자 오류로 보고 sep과 axis=1을 함께 지정한다.",
      "CSV 파일의 확장자만 xlsx나 png로 변경한다.",
    ],
  },
  "viz-04": {
    answer: "scatter",
    choices: ["scatter", "line plot", "boxplot", "histogram"],
  },
  "viz-11": {
    answer: "sns.heatmap(df.corr(numeric_only=True), annot=True)",
    choices: [
      "sns.heatmap(df.corr(numeric_only=True), annot=True)",
      "sns.lineplot(data=df.corr(numeric_only=True), marker=True)",
      "sns.boxplot(data=df.corr(numeric_only=True), orient='h')",
      "plt.hist(df.corr(numeric_only=True), bins=10)",
    ],
  },
  "viz-14": {
    answer: "삭제될 행의 규모와 결측 발생 패턴",
    choices: [
      "삭제될 행의 규모와 결측 발생 패턴",
      "시각화에 사용할 선의 색상과 굵기",
      "DataFrame 변수명의 길이와 대소문자",
      "난수 seed의 값과 그래프 출력 순서",
    ],
  },
  "viz-19": {
    answer: "xticks 회전과 tight_layout 적용",
    choices: [
      "xticks 회전과 tight_layout 적용",
      "show 반복 호출과 figure 크기 고정",
      "figure 삭제와 모든 tick 위치 제거",
      "축 레이블 삭제와 범주 순서 무작위화",
    ],
  },
  "viz-23": {
    answer: "class와 alive 열을 제거한 DataFrame을 반환한다.",
    choices: [
      "class와 alive 열을 제거한 DataFrame을 반환한다.",
      "class와 alive 행을 제거한 DataFrame을 반환한다.",
      "class와 alive 열의 결측 행만 제거해 반환한다.",
      "class와 alive 열의 모든 값을 1로 바꿔 반환한다.",
    ],
  },
  "ml-02": {
    answer: "종양을 양성 또는 음성 범주로 판정한다.",
    choices: [
      "주택의 실제 거래 가격을 연속값으로 예측한다.",
      "내일의 최고 기온을 연속된 숫자로 예측한다.",
      "종양을 양성 또는 음성 범주로 판정한다.",
      "광고비를 바탕으로 다음 달 매출액을 예측한다.",
    ],
  },
  "ml-04": {
    answer: "validation으로 선택하고 test는 마지막에 평가한다.",
    choices: [
      "test 점수를 반복 확인하며 모델을 계속 선택한다.",
      "validation으로 선택하고 test는 마지막에 평가한다.",
      "train 오류만 비교해 최종 모델과 성능을 결정한다.",
      "validation을 처음부터 train에 합쳐 모델을 선택한다.",
    ],
  },
  "ml-05": {
    answer: "전체보다 적은 데이터로 학습한 모델을 평가하기 때문이다.",
    choices: [
      "전체보다 적은 데이터로 학습한 모델을 평가하기 때문이다.",
      "validation에서 모든 정답 label을 제거하기 때문이다.",
      "test 표본을 train에 중복해서 포함하기 때문이다.",
      "무작위 분할마다 항상 같은 결과가 나오기 때문이다.",
    ],
  },
  "ml-07": {
    answer: "초기 중심과 무관하게 항상 전역 최적해를 찾는다.",
    choices: [
      "학습을 시작하기 전에 군집 수 K를 미리 정한다.",
      "각 관측치를 정확히 하나의 군집에만 할당한다.",
      "중심 계산과 관측치 할당을 번갈아 반복한다.",
      "초기 중심과 무관하게 항상 전역 최적해를 찾는다.",
    ],
  },
  "ml-09": {
    answer: "메일 정보는 feature, 스팸 여부는 label이다.",
    choices: [
      "메일 정보는 feature, 스팸 여부는 label이다.",
      "스팸 여부는 feature, 메일 내용은 loss이다.",
      "발신자는 label, 스팸 여부는 hyperparameter다.",
      "메일 내용과 스팸 여부는 모두 model parameter다.",
    ],
  },
  "ml-10": {
    answer: "f*(X)가 주어진 X에서 Y의 평균 관계를 나타낸다.",
    choices: [
      "f*(X)가 주어진 X에서 Y의 평균 관계를 나타낸다.",
      "모든 관측값 Y가 항상 f*(X)와 정확히 일치한다.",
      "모든 관측치에서 오차 ε가 양수로만 나타난다.",
      "입력 X와 목표 Y가 서로 완전히 독립임을 뜻한다.",
    ],
  },
  "ml-13": {
    answer: "평균 예측 기준보다 test 제곱오차가 더 크다.",
    choices: [
      "평균 예측 기준보다 test 제곱오차가 더 크다.",
      "모델이 test 정답의 20%를 정확히 맞혔다는 뜻이다.",
      "test 데이터에서 예측 오차가 전혀 없다는 뜻이다.",
      "test 데이터의 모든 label이 음수라는 뜻이다.",
    ],
  },
  "ml-17": {
    answer: "개별 점에서 시작해 가까운 군집을 반복 병합한다.",
    choices: [
      "개별 점에서 시작해 가까운 군집을 반복 병합한다.",
      "전체를 한 군집으로 시작해 먼 점을 반복 제거한다.",
      "K개 중심을 선택한 뒤 가까운 점을 반복 할당한다.",
      "정답 label로 군집 경계를 지도학습해 분리한다.",
    ],
  },
  "ml-18": {
    answer: "단위가 큰 feature의 거리 지배를 줄이기 위해서다.",
    choices: [
      "단위가 큰 feature의 거리 지배를 줄이기 위해서다.",
      "모든 label을 동일한 one-hot 벡터로 만들기 위해서다.",
      "관측치 개수를 원본의 정확히 두 배로 늘리기 위해서다.",
      "데이터만 보고 최적의 군집 수 K를 결정하기 위해서다.",
    ],
  },
  "ml-19": {
    answer: "test 점수를 보며 모델을 반복해서 바꾼다.",
    choices: [
      "대표성이 충분한 학습 데이터를 추가로 확보한다.",
      "교차검증 점수를 기준으로 후보 모델을 선택한다.",
      "복잡도 제한이나 적절한 정규화를 적용한다.",
      "test 점수를 보며 모델을 반복해서 바꾼다.",
    ],
  },
  "ml-22": {
    answer: "fold는 겹치지 않고 합치면 전체 표본이 된다.",
    choices: [
      "fold는 겹치지 않고 합치면 전체 표본이 된다.",
      "모든 fold는 완전히 동일한 표본을 중복해 가진다.",
      "첫 fold에만 label이 있고 나머지는 label이 없다.",
      "각 fold는 서로 다른 개수의 feature를 사용한다.",
    ],
  },
  "ml-23": {
    answer: "관련성은 있지만 상관만으로 인과를 확정할 수 없다.",
    choices: [
      "관련성은 있지만 상관만으로 인과를 확정할 수 없다.",
      "높은 상관계수만으로 직접 인과관계를 확정할 수 있다.",
      "상관관계가 관측되면 두 변수의 측정오차는 0이다.",
      "높은 상관계수는 두 변수의 측정 단위가 같다는 뜻이다.",
    ],
  },
  "ml-24": {
    answer: "존재하지 않는 범주의 순서와 거리를 학습할 수 있다.",
    choices: [
      "존재하지 않는 범주의 순서와 거리를 학습할 수 있다.",
      "범주를 숫자로 바꾸면 모든 결측값이 자동으로 채워진다.",
      "세 범주를 정수로 바꾸면 feature 수가 반드시 0이 된다.",
      "정수 인코딩은 label을 정확한 연속값으로 변환해 준다.",
    ],
  },
  "nn-03": {
    answer: "0과 1 사이의 값으로 양성 확률을 나타낸다.",
    choices: [
      "제한 없이 실수 전체 범위의 값을 그대로 출력한다.",
      "0과 1 사이의 값으로 양성 확률을 나타낸다.",
      "입력과 관계없이 항상 정확히 0 또는 1을 출력한다.",
      "출력값 자체가 다중분류의 class 수를 결정한다.",
    ],
  },
  "nn-06": {
    answer: "일부 표본으로 gradient를 구해 더 자주 갱신한다.",
    choices: [
      "매번 전체 표본으로 gradient를 구해 한 번씩 갱신한다.",
      "일부 표본으로 gradient를 구해 더 자주 갱신한다.",
      "표본을 사용하지만 gradient 계산은 전혀 하지 않는다.",
      "한 번의 mini-batch 갱신만으로 항상 최솟값에 도달한다.",
    ],
  },
  "nn-09": {
    answer: "β̂=(XᵀX)⁻¹Xᵀy",
    choices: ["β̂=(XᵀX)⁻¹Xᵀy", "β̂=(XᵀX)Xᵀy", "β̂=(XXᵀ)⁻¹Xy", "β̂=X(XᵀX)⁻¹y"],
  },
  "nn-11": {
    answer: "잔차의 전형적 크기를 목표값 단위로 나타낸다.",
    choices: [
      "잔차의 전형적 크기를 목표값 단위로 나타낸다.",
      "분류 모델의 정확도를 목표값 단위로 나타낸다.",
      "자유도와 무관하게 RSS 원값만 그대로 나타낸다.",
      "잔차를 0과 1 사이의 확률값으로 바꿔 나타낸다.",
    ],
  },
  "nn-14": {
    answer: "정답 class의 y만 1이고 나머지는 0이기 때문이다.",
    choices: [
      "정답 class의 y만 1이고 나머지는 0이기 때문이다.",
      "모든 class의 예측 확률 p가 항상 같기 때문이다.",
      "softmax가 전체 class 수를 하나로 줄이기 때문이다.",
      "log가 모든 오답 class의 확률을 1로 만들기 때문이다.",
    ],
  },
  "nn-15": {
    answer: "비슷한 모수로 더 많은 선형 영역을 만들 수 있다.",
    choices: [
      "비슷한 모수로 더 많은 선형 영역을 만들 수 있다.",
      "층을 늘려도 언제나 선형 영역 하나만 표현할 수 있다.",
      "층이 깊어질수록 학습 파라미터 수가 반드시 0이 된다.",
      "깊이는 계산 그래프의 연산 경로와 아무 관계가 없다.",
    ],
  },
  "nn-16": {
    answer: "full은 전체, mini는 일부 표본으로 갱신한다.",
    choices: [
      "full은 전체, mini는 일부 표본으로 갱신한다.",
      "full은 일부, mini는 전체 표본으로만 갱신한다.",
      "full만 gradient를 계산하고 mini는 계산하지 않는다.",
      "두 방식은 batch 크기와 갱신 빈도가 항상 동일하다.",
    ],
  },
  "nn-17": {
    answer: "손실이 최솟값 주변에서 진동하거나 발산한다.",
    choices: [
      "손실이 최솟값 주변에서 진동하거나 발산한다.",
      "모든 파라미터의 gradient가 정확히 0이 된다.",
      "학습에 사용할 데이터 개수가 자동으로 증가한다.",
      "모델이 즉시 전역 최솟값에 도달해 학습을 끝낸다.",
    ],
  },
  "nn-19": {
    answer: "입력에서 출력까지의 순전파 계산을 정의한다.",
    choices: [
      "입력에서 출력까지의 순전파 계산을 정의한다.",
      "optimizer의 학습률을 변경하지 못하게 고정한다.",
      "학습 데이터를 원격 서버에서 자동 다운로드한다.",
      "모든 파라미터의 gradient를 숫자로 직접 입력한다.",
    ],
  },
  "nn-21": {
    answer: "계수 분산이 커져 개별 계수 해석이 불안정해진다.",
    choices: [
      "계수 분산이 커져 개별 계수 해석이 불안정해진다.",
      "설명변수와 관계없이 모든 잔차가 정확히 0이 된다.",
      "학습 과정에서 설명변수 수가 자동으로 하나가 된다.",
      "회귀 문제의 분류 threshold가 자동으로 결정된다.",
    ],
  },
  "nn-22": {
    answer: "포화 구간에서 sigmoid 미분값이 매우 작아진다.",
    choices: [
      "포화 구간에서 sigmoid 미분값이 매우 작아진다.",
      "sigmoid 출력이 모든 입력에서 항상 음수가 된다.",
      "sigmoid 미분값이 모든 입력에서 정확히 1이 된다.",
      "sigmoid가 신경망 안의 행렬곱 연산을 금지한다.",
    ],
  },
  "nn-24": {
    answer: "Grid는 모든 조합, Random은 무작위 조합을 평가한다.",
    choices: [
      "Grid는 모든 조합, Random은 무작위 조합을 평가한다.",
      "Grid와 Random은 gradient로 weight 조합만 갱신한다.",
      "Random은 후보 조합을 만들지만 실제 평가는 하지 않는다.",
      "Grid는 test set만 사용해 각 후보 모델을 다시 학습한다.",
    ],
  },
  "nlp-01": {
    answer: "고차원이며 단어 간 의미 유사도를 표현하지 못한다.",
    choices: [
      "고차원이며 단어 간 의미 유사도를 표현하지 못한다.",
      "저차원이며 단어의 등장 순서를 자동으로 보존한다.",
      "가변 길이이며 문장 전체의 문맥을 직접 표현한다.",
      "연속값이며 학습 전부터 의미 관계가 반영되어 있다.",
    ],
  },
  "nlp-03": {
    answer: "cell state와 input·forget·output gate",
    choices: [
      "cell state와 input·forget·output gate",
      "hidden state와 update·reset gate",
      "self-attention과 residual connection",
      "convolution kernel과 max pooling",
    ],
  },
  "nlp-04": {
    answer: "이전 시점의 정답 토큰을 decoder 입력으로 사용한다.",
    choices: [
      "이전 시점의 정답 토큰을 decoder 입력으로 사용한다.",
      "이전 시점의 예측 토큰만 decoder 입력으로 사용한다.",
      "encoder의 모든 파라미터를 학습 중 고정한다.",
      "decoder의 출력 손실을 계산하지 않고 학습한다.",
    ],
  },
  "nlp-06": {
    answer: "동일한 입력을 서로 다른 선형 변환에 통과시킨다.",
    choices: [
      "동일한 입력을 서로 다른 선형 변환에 통과시킨다.",
      "Q는 입력에서, K와 V는 정답 label에서 만든다.",
      "Q와 K는 상수로 두고 V만 입력에서 계산한다.",
      "서로 다른 세 문서를 변환 없이 그대로 사용한다.",
    ],
  },
  "nlp-07": {
    answer: "현재 위치가 뒤쪽의 미래 토큰을 보지 못하게 한다.",
    choices: [
      "현재 위치가 뒤쪽의 미래 토큰을 보지 못하게 한다.",
      "현재 위치가 앞쪽의 모든 과거 토큰을 보지 못하게 한다.",
      "padding 위치를 실제 단어처럼 attention에 포함한다.",
      "각 토큰의 embedding 차원을 학습 중 절반으로 줄인다.",
    ],
  },
  "nlp-08": {
    answer: "80% [MASK], 10% 무작위, 10% 원본",
    choices: [
      "80% [MASK], 10% 무작위, 10% 원본",
      "80% 원본, 10% [MASK], 10% 무작위",
      "50% [MASK], 30% 무작위, 20% 원본",
      "100% [MASK], 0% 무작위, 0% 원본",
    ],
  },
  "nlp-10": {
    answer: "희귀어를 작은 단위로 나눠 OOV를 줄인다.",
    choices: [
      "희귀어를 작은 단위로 나눠 OOV를 줄인다.",
      "모든 문장을 하나의 토큰으로 합쳐 길이를 줄인다.",
      "모든 단어를 문자 하나로 나눠 문맥을 제거한다.",
      "어휘에 없는 단어는 항상 문장에서 삭제한다.",
    ],
  },
  "nlp-13": {
    answer: "현재 입력 x_t와 이전 상태 h_{t-1}",
    choices: [
      "현재 입력 x_t와 이전 상태 h_{t-1}",
      "현재 입력 x_t와 미래 상태 h_{t+1}",
      "이전 입력 x_{t-1}과 정답 label y_t",
      "미래 입력 x_{t+1}과 전체 정답의 평균",
    ],
  },
  "nlp-14": {
    answer: "여러 시점의 미분값이 반복해서 곱해지기 때문이다.",
    choices: [
      "여러 시점의 미분값이 반복해서 곱해지기 때문이다.",
      "각 시점의 토큰 인덱스가 항상 음수가 되기 때문이다.",
      "softmax가 확률 대신 문자열을 반환하기 때문이다.",
      "hidden state가 정답과 항상 같게 고정되기 때문이다.",
    ],
  },
  "nlp-15": {
    answer: "별도 cell state 없이 update·reset gate를 사용한다.",
    choices: [
      "별도 cell state 없이 update·reset gate를 사용한다.",
      "별도 hidden state 없이 input·output gate를 사용한다.",
      "모든 gate를 제거하고 하나의 선형 변환만 사용한다.",
      "attention head로만 상태를 갱신하고 순서를 무시한다.",
    ],
  },
  "nlp-16": {
    answer: "입력을 고정 길이 벡터 하나에 압축하는 병목을 줄인다.",
    choices: [
      "입력을 고정 길이 벡터 하나에 압축하는 병목을 줄인다.",
      "입력의 모든 단어를 동일한 one-hot 벡터로 바꾼다.",
      "출력 토큰의 순서를 제거해 병렬 예측만 가능하게 한다.",
      "decoder의 예측 손실을 없애 학습 시간을 줄인다.",
    ],
  },
  "nlp-17": {
    answer: "여러 표현 공간의 관계를 각 head가 병렬로 포착한다.",
    choices: [
      "여러 표현 공간의 관계를 각 head가 병렬로 포착한다.",
      "각 head가 입력 토큰을 하나씩 삭제해 길이를 줄인다.",
      "모든 head가 같은 가중치를 공유해 표현을 하나로 만든다.",
      "softmax를 제거해 attention score를 계산하지 않는다.",
    ],
  },
  "nlp-19": {
    answer: "양방향 encoder 구조로 문장 이해 작업에 적합하다.",
    choices: [
      "양방향 encoder 구조로 문장 이해 작업에 적합하다.",
      "단방향 decoder 구조로 다음 토큰 생성에만 적합하다.",
      "합성곱 구조로 이미지의 지역 특징 추출에 적합하다.",
      "순환 gate 구조로 시계열의 다음 값 예측에만 적합하다.",
    ],
  },
  "nlp-20": {
    answer: "연속 span을 sentinel로 바꾸고 삭제 내용을 복원한다.",
    choices: [
      "연속 span을 sentinel로 바꾸고 삭제 내용을 복원한다.",
      "모든 토큰을 그대로 복사하고 다음 문장 여부를 분류한다.",
      "무작위 토큰 하나만 지우고 원래 문장 길이를 예측한다.",
      "문장 전체를 하나의 [MASK]로 바꾸고 class를 예측한다.",
    ],
  },
  "nlp-21": {
    answer: "비슷한 문맥의 단어는 의미도 비슷할 가능성이 높다.",
    choices: [
      "비슷한 문맥의 단어는 의미도 비슷할 가능성이 높다.",
      "글자 수가 같은 단어는 의미도 반드시 같다고 가정한다.",
      "단어의 의미는 주변 문맥과 관계없이 하나로 고정된다.",
      "등장 빈도가 낮은 단어일수록 의미가 더 정확해진다.",
    ],
  },
  "nlp-22": {
    answer: "짧은 고정 문맥과 보지 못한 조합의 희소성 문제",
    choices: [
      "짧은 고정 문맥과 보지 못한 조합의 희소성 문제",
      "문서 전체를 사용해 계산량이 지나치게 작아지는 문제",
      "단어 순서를 전혀 사용하지 않아 문맥이 길어지는 문제",
      "학습 없이 모든 문장 확률을 정확히 계산하는 문제",
    ],
  },
  "nlp-23": {
    answer: "우회 경로로 정보와 gradient의 흐름을 돕는다.",
    choices: [
      "우회 경로로 정보와 gradient의 흐름을 돕는다.",
      "attention weight를 모두 0으로 만들어 연산을 줄인다.",
      "토큰 순서를 매 층 무작위로 섞어 과적합을 막는다.",
      "vocabulary를 한 토큰으로 줄여 입력을 단순화한다.",
    ],
  },
  "nlp-24": {
    answer: "Q는 decoder, K와 V는 encoder 출력에서 만든다.",
    choices: [
      "Q는 decoder, K와 V는 encoder 출력에서 만든다.",
      "Q는 encoder, K와 V는 decoder 출력에서 만든다.",
      "Q와 K는 decoder, V는 정답 label에서 만든다.",
      "Q와 V는 encoder, K는 임의의 상수에서 만든다.",
    ],
  },
  "llm-01": {
    answer: "대규모 사전학습 후 여러 하위 작업에 적용한다.",
    choices: [
      "대규모 사전학습 후 여러 하위 작업에 적용한다.",
      "작은 분류 데이터만 학습해 한 작업에만 적용한다.",
      "사전학습 없이 규칙을 작성해 모든 작업에 적용한다.",
      "하위 작업별 모델을 먼저 학습한 뒤 사전학습한다.",
    ],
  },
  "llm-02": {
    answer: "규모 증가에 따라 loss가 예측 가능한 경향으로 감소한다.",
    choices: [
      "규모 증가에 따라 loss가 예측 가능한 경향으로 감소한다.",
      "모델 크기 증가에 따라 모든 환각이 즉시 사라진다.",
      "데이터 증가와 관계없이 loss가 일정하게 유지된다.",
      "계산량 증가에 따라 모든 작업의 loss가 0이 된다.",
    ],
  },
  "llm-04": {
    answer: "사람이 비교한 답변 쌍의 선호 정보",
    choices: [
      "사람이 비교한 답변 쌍의 선호 정보",
      "tokenizer가 만든 각 토큰의 정수 번호",
      "모델을 구성하는 전체 파라미터 개수",
      "API 요청부터 응답까지 걸린 시간",
    ],
  },
  "llm-05": {
    answer: "분포가 날카로워져 출력이 더 일관적으로 변한다.",
    choices: [
      "분포가 날카로워져 출력이 더 일관적으로 변한다.",
      "분포가 평평해져 낮은 확률 토큰도 더 자주 뽑힌다.",
      "모든 토큰 확률이 같아져 출력이 완전히 무작위가 된다.",
      "context window가 늘어나 더 긴 입력을 처리하게 된다.",
    ],
  },
  "llm-06": {
    answer: "표본 평균을 항상 0으로 만드는 편향",
    choices: [
      "먼저 제시된 답변을 선호하는 위치 편향",
      "더 긴 답변을 선호하는 길이 편향",
      "자기 모델의 답변을 선호하는 자기 편향",
      "표본 평균을 항상 0으로 만드는 편향",
    ],
  },
  "llm-07": {
    answer: "역할과 제약을 지시하지만 준수를 완전히 보장하지는 않는다.",
    choices: [
      "역할과 제약을 지시하지만 준수를 완전히 보장하지는 않는다.",
      "모델 weight를 영구 변경해 이후 모든 대화에 적용한다.",
      "사용자 입력 뒤에만 배치하며 사용자 지시보다 우선하지 않는다.",
      "모든 공격 입력을 탐지해 jailbreak를 완전히 차단한다.",
    ],
  },
  "llm-10": {
    answer: "이전 토큰을 바탕으로 다음 토큰의 확률을 높인다.",
    choices: [
      "이전 토큰을 바탕으로 다음 토큰의 확률을 높인다.",
      "문서의 모든 토큰을 동시에 지우고 길이를 예측한다.",
      "각 문서의 군집 중심을 찾아 토큰 순서를 결정한다.",
      "정답 없이 회귀 직선을 맞춰 문장 점수를 계산한다.",
    ],
  },
  "llm-11": {
    answer: "급격한 성능 향상에 지표와 측정 방식의 영향도 살펴야 한다.",
    choices: [
      "급격한 성능 향상에 지표와 측정 방식의 영향도 살펴야 한다.",
      "모델이 커지면 모든 능력이 언제나 같은 비율로 향상된다.",
      "특정 능력이 나타나면 환각과 안전 문제가 모두 사라진다.",
      "작은 모델에는 측정 가능한 언어 능력이 전혀 존재하지 않는다.",
    ],
  },
  "llm-12": {
    answer: "ICL은 예시를 주지만 weight를 갱신하지 않는다.",
    choices: [
      "ICL은 예시를 주지만 weight를 갱신하지 않는다.",
      "ICL은 예시마다 모델의 모든 weight를 재학습한다.",
      "fine-tuning은 weight 대신 prompt 길이만 바꾼다.",
      "두 방법은 모델 변경 여부와 계산 과정이 항상 같다.",
    ],
  },
  "llm-14": {
    answer: "기준 policy에서 과도하게 벗어나는 것을 억제한다.",
    choices: [
      "기준 policy에서 과도하게 벗어나는 것을 억제한다.",
      "모든 토큰의 생성 확률을 동일한 값으로 고정한다.",
      "context 길이를 늘려 무한한 입력을 처리하게 한다.",
      "tokenizer를 제거해 원문 문자열을 직접 계산하게 한다.",
    ],
  },
  "llm-15": {
    answer: "누적 점수가 높은 여러 후보 시퀀스를 유지한다.",
    choices: [
      "누적 점수가 높은 여러 후보 시퀀스를 유지한다.",
      "매 단계 가장 높은 토큰 하나만 남겨 경로를 확정한다.",
      "확률이 낮은 토큰만 무작위로 뽑아 후보를 교체한다.",
      "토큰을 생성할 때마다 모델 weight를 다시 학습한다.",
    ],
  },
  "llm-16": {
    answer: "누적 확률이 p에 이르는 후보 집합에서 표본을 뽑는다.",
    choices: [
      "누적 확률이 p에 이르는 후보 집합에서 표본을 뽑는다.",
      "확률 순위가 p번째인 토큰 하나만 항상 선택한다.",
      "상위 p개 토큰으로 후보 수를 모든 단계에서 고정한다.",
      "최저 확률 토큰을 제외한 모든 후보를 같은 확률로 뽑는다.",
    ],
  },
  "llm-17": {
    answer: "BLEU는 정밀도, ROUGE는 재현율을 중심으로 본다.",
    choices: [
      "BLEU는 정밀도, ROUGE는 재현율을 중심으로 본다.",
      "BLEU는 안전성, ROUGE는 GPU 사용량을 중심으로 본다.",
      "BLEU는 문장 길이, ROUGE는 모델 크기를 중심으로 본다.",
      "BLEU는 재현율, ROUGE는 응답 속도만을 중심으로 본다.",
    ],
  },
  "llm-19": {
    answer: "평가 문항과 유사한 데이터가 학습에 포함된 경우",
    choices: [
      "평가 문항과 유사한 데이터가 학습에 포함된 경우",
      "평가 문항을 모델 학습이 끝난 뒤 새로 작성한 경우",
      "평가자가 문항별로 동일한 채점 기준표를 사용한 경우",
      "서로 다른 난이도의 문항을 한 평가에 함께 사용한 경우",
    ],
  },
  "llm-21": {
    answer: "top-k는 후보 수, top-p는 누적 확률을 기준으로 한다.",
    choices: [
      "top-k는 후보 수, top-p는 누적 확률을 기준으로 한다.",
      "top-k는 누적 확률, top-p는 후보 수를 기준으로 한다.",
      "top-k는 최저 확률, top-p는 문장 길이를 기준으로 한다.",
      "top-k와 top-p 모두 모델 weight의 크기를 기준으로 한다.",
    ],
  },
  "llm-22": {
    answer: "역할·작업·입력 경계·제약·출력 형식을 구분한다.",
    choices: [
      "역할·작업·입력 경계·제약·출력 형식을 구분한다.",
      "역할과 작업을 숨기고 충돌하는 제약을 반복해서 쓴다.",
      "입력 데이터와 실행할 명령을 같은 문단에 섞어 쓴다.",
      "원하는 출력 형식을 빼고 해석이 다른 예시만 제시한다.",
    ],
  },
  "llm-23": {
    answer: "안전 제약을 우회하는 공격이며 다층 방어가 필요하다.",
    choices: [
      "안전 제약을 우회하는 공격이며 다층 방어가 필요하다.",
      "모델 크기를 비교하는 평가이며 단일 지표만 필요하다.",
      "학습 중복을 지우는 전처리이며 출력 검사만 필요하다.",
      "응답 속도를 높이는 기법이며 temperature 조정만 필요하다.",
    ],
  },
  "llm-24": {
    answer: "대표 데이터·목적에 맞는 지표·재현 가능한 절차",
    choices: [
      "대표 데이터·목적에 맞는 지표·재현 가능한 절차",
      "모델 이름·서비스 로고·학습 파일의 확장자",
      "브라우저 크기·운영체제 이름·GPU 제품 색상",
      "토큰 하나·정답 없는 문항·기준 없는 평가자",
    ],
  },
  "cnn-01": {
    answer: "공간 구조가 사라지고 입력 크기에 따라 파라미터가 급증한다.",
    choices: [
      "공간 구조가 사라지고 입력 크기에 따라 파라미터가 급증한다.",
      "공간 구조가 강화되고 입력 크기에 따라 파라미터가 감소한다.",
      "모든 픽셀이 정규화되고 출력 채널이 하나로 고정된다.",
      "가중치가 공유되면서 입력 위치마다 다른 필터가 적용된다.",
    ],
  },
  "cnn-06": {
    answer: "커널의 개수인 Cout",
    choices: [
      "커널의 개수인 Cout",
      "입력 채널 수인 Cin",
      "입력의 배치 크기인 N",
      "입력의 공간 높이인 H",
    ],
  },
  "cnn-07": {
    answer: "비선형성을 넣어 복잡한 함수를 표현하게 한다.",
    choices: [
      "비선형성을 넣어 복잡한 함수를 표현하게 한다.",
      "공간 크기를 항상 절반으로 줄여 연산을 없앤다.",
      "모든 가중치를 0으로 바꿔 대칭성을 유지한다.",
      "정답 label을 one-hot으로 바꿔 입력에 더한다.",
    ],
  },
  "cnn-09": {
    answer: "계산량은 줄지만 세밀한 위치 정보가 손실될 수 있다.",
    choices: [
      "계산량은 줄지만 세밀한 위치 정보가 손실될 수 있다.",
      "계산량은 늘지만 모든 위치 정보가 정확하게 보존된다.",
      "파라미터는 0개가 되지만 공간 해상도는 항상 커진다.",
      "입력 채널은 줄지만 label 수와 항상 같아지게 된다.",
    ],
  },
  "cnn-10": {
    answer: "같은 수용영역에서 파라미터를 줄이고 비선형성을 더한다.",
    choices: [
      "같은 수용영역에서 파라미터를 줄이고 비선형성을 더한다.",
      "더 작은 수용영역에서 파라미터를 늘리고 비선형성을 없앤다.",
      "출력 해상도를 항상 두 배로 만들고 합성곱을 제거한다.",
      "RGB 채널을 자동 삭제하고 입력을 흑백으로 변환한다.",
    ],
  },
  "cnn-12": {
    answer: "5개 합성곱층과 3개 완전연결층을 사용한 초기 CNN",
    choices: [
      "5개 합성곱층과 3개 완전연결층을 사용한 초기 CNN",
      "합성곱 없이 self-attention 층만 사용한 초기 ViT",
      "depthwise 합성곱 하나만 반복해서 사용한 MobileNet",
      "순환 hidden state로 이미지의 각 행을 읽는 RNN",
    ],
  },
  "cnn-13": {
    answer: "activation은 앞쪽 큰 feature map, 파라미터는 뒤쪽 FC",
    choices: [
      "activation은 앞쪽 큰 feature map, 파라미터는 뒤쪽 FC",
      "activation은 뒤쪽 작은 feature map, 파라미터는 pooling",
      "activation은 label 파일, 파라미터는 입력 이미지에만 집중",
      "activation과 파라미터 모두 입력 해상도와 관계없이 일정",
    ],
  },
  "cnn-14": {
    answer: "3×3 합성곱을 반복하고 단계 사이에 max pooling을 둔다.",
    choices: [
      "3×3 합성곱을 반복하고 단계 사이에 max pooling을 둔다.",
      "1×1 합성곱 한 층만 사용하고 pooling을 모두 제거한다.",
      "이미지를 문자 시퀀스로 바꾸고 순환층만 반복해서 둔다.",
      "학습 가능한 층을 없애고 전체 픽셀 평균만 계산한다.",
    ],
  },
  "cnn-15": {
    answer: "과적합과 달리 더 깊은 모델의 훈련 성능도 나빠지기 때문이다.",
    choices: [
      "과적합과 달리 더 깊은 모델의 훈련 성능도 나빠지기 때문이다.",
      "과적합과 같이 더 깊은 모델의 훈련 성능은 좋아지기 때문이다.",
      "깊은 모델에는 학습할 파라미터와 활성화 함수가 없기 때문이다.",
      "검증 데이터를 훈련에 사용해야만 깊이를 늘릴 수 있기 때문이다.",
    ],
  },
  "cnn-17": {
    answer: "1×1 convolution shortcut으로 shape를 맞춘다.",
    choices: [
      "1×1 convolution shortcut으로 shape를 맞춘다.",
      "max pooling만 사용해 채널과 공간 크기를 모두 늘린다.",
      "label을 입력과 같은 shape로 복제해 F(x)에 더한다.",
      "두 텐서를 문자열로 변환한 뒤 이어 붙여 shape를 맞춘다.",
    ],
  },
  "cnn-18": {
    answer: "3×3 연산 전후의 채널 수를 조절해 계산량을 줄인다.",
    choices: [
      "3×3 연산 전후의 채널 수를 조절해 계산량을 줄인다.",
      "공간 크기를 항상 1×1로 줄여 모든 위치 정보를 없앤다.",
      "음수 gradient만 제거해 활성화 출력을 모두 양수로 만든다.",
      "정답 class 하나만 남겨 softmax 연산을 생략하게 한다.",
    ],
  },
  "cnn-19": {
    answer: "공간 평균으로 파라미터가 많은 FC 층 의존을 줄인다.",
    choices: [
      "공간 평균으로 파라미터가 많은 FC 층 의존을 줄인다.",
      "공간 최댓값으로 원본 이미지를 픽셀 단위로 복원한다.",
      "채널 평균으로 시계열 토큰의 생성 순서를 결정한다.",
      "배치 평균으로 optimizer의 학습률을 0으로 고정한다.",
    ],
  },
  "cnn-20": {
    answer: "채널별 spatial 합성곱 후 1×1 pointwise 합성곱",
    choices: [
      "채널별 spatial 합성곱 후 1×1 pointwise 합성곱",
      "1×1 pointwise 합성곱 후 완전연결층의 순환 연산",
      "공간 max pooling 후 입력 이미지의 tokenization",
      "label smoothing 후 decoder의 beam search 연산",
    ],
  },
  "vit-01": {
    answer: "먼 위치를 연결하려면 국소 필터를 여러 층 거쳐야 한다.",
    choices: [
      "먼 위치를 연결하려면 국소 필터를 여러 층 거쳐야 한다.",
      "먼 위치를 연결할 때 가중치를 전혀 공유할 수 없게 된다.",
      "이미지 입력을 받으면 항상 한 픽셀만 출력하게 된다.",
      "모든 합성곱 필터가 이미지 전체만 처리하도록 고정된다.",
    ],
  },
  "vit-04": {
    answer: "self-attention만으로는 토큰의 위치가 보존되지 않는다.",
    choices: [
      "self-attention만으로는 토큰의 위치가 보존되지 않는다.",
      "self-attention은 RGB patch를 입력으로 받을 수 없다.",
      "positional embedding이 없으면 softmax가 음수가 된다.",
      "positional embedding은 모든 합성곱을 1×1로 만든다.",
    ],
  },
  "vit-05": {
    answer: "위치 개수와 새 patch 격자가 달라 보간이 필요하다.",
    choices: [
      "위치 개수와 새 patch 격자가 달라 보간이 필요하다.",
      "위치 개수와 관계없이 모든 patch 값이 0이 된다.",
      "새 해상도에서는 출력 class 수가 자동으로 두 배가 된다.",
      "새 patch 격자에서는 gradient 계산이 불가능해진다.",
    ],
  },
  "vit-06": {
    answer: "토큰 간 상대 관계를 표현해 해상도 변화에 더 유연하다.",
    choices: [
      "토큰 간 상대 관계를 표현해 해상도 변화에 더 유연하다.",
      "토큰의 절대 좌표만 표현해 모든 해상도를 같게 만든다.",
      "각 토큰을 독립 처리해 토큰 사이의 관계를 제거한다.",
      "학습 데이터와 attention 계산을 모두 필요 없게 한다.",
    ],
  },
  "vit-07": {
    answer: "국소성 같은 귀납 편향이 약해 구조를 데이터에서 더 배운다.",
    choices: [
      "국소성 같은 귀납 편향이 약해 구조를 데이터에서 더 배운다.",
      "국소성 같은 귀납 편향이 강해 데이터 없이 구조를 모두 안다.",
      "학습 파라미터가 없어 대규모 데이터만으로 weight를 만든다.",
      "각 이미지 patch를 정답 label로 사용해 지도학습을 생략한다.",
    ],
  },
  "vit-08": {
    answer: "ViT student가 CNN teacher의 출력과 label을 함께 학습한다.",
    choices: [
      "ViT student가 CNN teacher의 출력과 label을 함께 학습한다.",
      "CNN student가 ViT teacher의 입력 이미지를 삭제해 학습한다.",
      "ViT teacher의 모든 weight를 0으로 고정한 뒤 학습한다.",
      "teacher와 student에 서로 다른 정답 label을 주어 학습한다.",
    ],
  },
  "vit-09": {
    answer: "국소 계산을 유지하며 이웃 window끼리 정보를 교환한다.",
    choices: [
      "국소 계산을 유지하며 이웃 window끼리 정보를 교환한다.",
      "전역 계산만 유지하며 모든 patch를 한 픽셀로 축소한다.",
      "window마다 학습률을 다르게 정해 정보 교환을 차단한다.",
      "shift마다 softmax를 제거해 attention 계산을 생략한다.",
    ],
  },
  "vit-10": {
    answer: "전체가 하나의 선형변환이 되어 비선형 경계를 표현하지 못한다.",
    choices: [
      "전체가 하나의 선형변환이 되어 비선형 경계를 표현하지 못한다.",
      "각 층이 독립된 비선형변환이 되어 선형 경계를 표현하지 못한다.",
      "파라미터 수가 음수가 되어 gradient를 계산하지 못한다.",
      "입력 tensor가 문자열로 바뀌어 행렬곱을 수행하지 못한다.",
    ],
  },
  "vit-14": {
    answer: "크기·채널·정규화를 사전학습 조건에 맞춘다.",
    choices: [
      "크기·채널·정규화를 사전학습 조건에 맞춘다.",
      "크기·채널·정규화를 매 입력마다 무작위로 바꾼다.",
      "훈련과 추론에 서로 다른 class 순서를 사용한다.",
      "RGB 채널 중 하나만 남기고 나머지는 항상 삭제한다.",
    ],
  },
  "vit-15": {
    answer: "뉴런들이 같은 gradient를 받아 대칭이 깨지지 않는다.",
    choices: [
      "뉴런들이 같은 gradient를 받아 대칭이 깨지지 않는다.",
      "뉴런들이 다른 gradient를 받아 대칭이 지나치게 빨리 깨진다.",
      "loss 함수가 삭제되어 정답과 예측을 비교할 수 없게 된다.",
      "optimizer가 훈련 대신 validation 데이터만 사용하게 된다.",
    ],
  },
  "vit-16": {
    answer: "Xavier는 tanh, He는 ReLU 계열에 주로 사용한다.",
    choices: [
      "Xavier는 tanh, He는 ReLU 계열에 주로 사용한다.",
      "Xavier는 ReLU, He는 tanh 계열에만 사용한다.",
      "Xavier는 label, He는 batch 크기를 초기화한다.",
      "Xavier와 He 모두 모든 weight를 정확히 0으로 만든다.",
    ],
  },
  "vit-17": {
    answer: "초기 block을 identity mapping에 가깝게 만든다.",
    choices: [
      "초기 block을 identity mapping에 가깝게 만든다.",
      "초기 block의 shortcut을 제거해 gradient를 차단한다.",
      "초기 block의 예측을 항상 정답 label과 같게 만든다.",
      "초기 block의 입력 해상도와 모든 weight를 0으로 만든다.",
    ],
  },
  "vit-18": {
    answer: "L1은 희소성, L2는 큰 weight의 완만한 억제를 유도한다.",
    choices: [
      "L1은 희소성, L2는 큰 weight의 완만한 억제를 유도한다.",
      "L1은 큰 weight 증가, L2는 모든 weight의 0을 유도한다.",
      "L1은 dropout 비율, L2는 pooling 크기를 결정한다.",
      "L1은 검증 표본 수, L2는 출력 class 수를 결정한다.",
    ],
  },
  "vit-19": {
    answer: "훈련 중 일부 unit을 끄고 추론 때 전체 unit을 사용한다.",
    choices: [
      "훈련 중 일부 unit을 끄고 추론 때 전체 unit을 사용한다.",
      "훈련 중 전체 unit을 쓰고 추론 때 일부 unit을 끈다.",
      "훈련과 추론에서 같은 unit을 영구적으로 삭제한다.",
      "훈련 중 일부 label을 끄고 추론 때 label을 복원한다.",
    ],
  },
  "vit-21": {
    answer: "너무 크면 발산·진동하고 너무 작으면 수렴이 느리다.",
    choices: [
      "너무 크면 발산·진동하고 너무 작으면 수렴이 느리다.",
      "너무 크면 수렴이 느리고 너무 작으면 즉시 발산한다.",
      "두 경우 모두 훈련 직후 validation 정확도가 100%가 된다.",
      "두 경우 모두 loss 변화와 모델의 수렴 속도에 영향이 없다.",
    ],
  },
  "vit-22": {
    answer: "cosine 곡선을 따라 학습률을 매끄럽게 감소시킨다.",
    choices: [
      "cosine 곡선을 따라 학습률을 매끄럽게 감소시킨다.",
      "매 epoch마다 학습률의 부호를 무작위로 바꾼다.",
      "훈련 시작부터 끝까지 학습률을 정확히 0으로 둔다.",
      "validation loss 값을 다음 epoch의 label로 사용한다.",
    ],
  },
};
