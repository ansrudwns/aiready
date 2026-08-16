"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { checkShortAnswer } from "../src/grading.js";
import { choiceBalanceOverrides } from "./choice-balance-overrides";
import { visionQuestions } from "./vision-questions";

type Kind = "객관식" | "단답형" | "서술형";
type Category =
  | "Python·API·JSON"
  | "NumPy·Pandas"
  | "시각화·EDA"
  | "ML 기초·검증"
  | "회귀·신경망"
  | "NLP·Transformer"
  | "LLM·평가·안전"
  | "CNN·이미지 모델"
  | "ViT·학습 전략";

type Question = {
  id: string;
  category: Category;
  kind: Kind;
  question: string;
  code?: string;
  choices?: string[];
  answer: string;
  explanation: string;
  difficulty?: "기초" | "핵심" | "사고형" | "고난도";
};

type Difficulty = NonNullable<Question["difficulty"]>;

type History = {
  date: string;
  score: number;
  total: number;
  mode: string;
};

type QuestionCount = 10 | 20 | 30 | "all";
type TimeLimit = 60 | null;

const categories: Category[] = [
  "Python·API·JSON",
  "NumPy·Pandas",
  "시각화·EDA",
  "ML 기초·검증",
  "회귀·신경망",
  "NLP·Transformer",
  "LLM·평가·안전",
  "CNN·이미지 모델",
  "ViT·학습 전략",
];

const defaultCategories: Category[] = categories.slice(3);
const showSummaryResource = false;

const kinds: Kind[] = ["객관식", "단답형", "서술형"];
const difficulties: Difficulty[] = ["기초", "핵심", "사고형", "고난도"];

const accent: Record<Category, string> = {
  "Python·API·JSON": "#ef8354",
  "NumPy·Pandas": "#3a86ff",
  "시각화·EDA": "#06a77d",
  "ML 기초·검증": "#8b5cf6",
  "회귀·신경망": "#e4a11b",
  "NLP·Transformer": "#e5526b",
  "LLM·평가·안전": "#526477",
  "CNN·이미지 모델": "#2f7d8c",
  "ViT·학습 전략": "#bc5f6a",
};

/*
const baseQuestions: Question[] = [
  {
    id: "op-1",
    category: "연산자·형변환",
    kind: "객관식",
    question: "다음 표현식의 실행 결과로 올바른 것은?",
    code: "print(17 // 4 + 17 % 4 * 2)",
    choices: ["5", "6", "10", "12"],
    answer: "6",
    explanation:
      "//와 %가 +보다 먼저 계산됩니다. 17 // 4는 4, 17 % 4는 1이므로 4 + 1 × 2의 결과는 6입니다.",
  },
  {
    id: "op-2",
    category: "연산자·형변환",
    kind: "객관식",
    question: "다음 코드를 실행했을 때 출력되는 결과로 옳은 것을 고르시오.",
    code: 'print("" or "Python")',
    choices: ["True", "False", "Python", ""],
    answer: "Python",
    explanation:
      "or는 항상 bool을 반환하지 않습니다. 첫 값이 falsy이면 두 번째 피연산자를 반환합니다.",
  },
  {
    id: "op-3",
    category: "연산자·형변환",
    kind: "단답형",
    question: "출력 결과를 공백까지 정확히 작성하시오.",
    code: 'value = "24"\nprint(int(value) + 3, type(value).__name__)',
    answer: "27 str",
    explanation:
      "int(value)는 새 정수를 만들 뿐 value 자체를 변경하지 않으므로 원래 타입은 str입니다.",
  },
  {
    id: "seq-1",
    category: "문자열·시퀀스",
    kind: "단답형",
    question: "슬라이싱으로 선택된 문자열을 정확히 작성하시오.",
    code: 'text = "developer"\nprint(text[1::2])',
    answer: "eeoe",
    explanation: "인덱스 1부터 시작해 두 칸 간격으로 문자를 선택합니다.",
  },
  {
    id: "seq-2",
    category: "문자열·시퀀스",
    kind: "객관식",
    question: "변경 가능한 객체만으로 이루어진 보기는?",
    choices: [
      "str, tuple, range",
      "list, dict, set",
      "list, tuple, set",
      "dict, str, list",
    ],
    answer: "list, dict, set",
    explanation: "list, dict, set은 mutable이며 str, tuple, range는 immutable입니다.",
  },
  {
    id: "seq-3",
    category: "문자열·시퀀스",
    kind: "단답형",
    question: "연속으로 호출된 문자열 메서드가 만든 최종 문자열을 정확히 작성하시오.",
    code: 'print("  Code Review  ".strip().lower().replace(" ", "_"))',
    answer: "code_review",
    explanation: "strip → lower → replace 순서로 각각 새 문자열을 반환합니다.",
  },
  {
    id: "flow-1",
    category: "제어문",
    kind: "단답형",
    question: "반복문이 종료된 뒤 출력되는 total의 값을 정확히 작성하시오.",
    code:
      "total = 0\nfor i in range(1, 8):\n    if i % 3 == 0:\n        continue\n    total += i\nprint(total)",
    answer: "19",
    explanation: "3과 6을 제외한 1, 2, 4, 5, 7의 합은 19입니다.",
  },
  {
    id: "flow-2",
    category: "제어문",
    kind: "객관식",
    question: "현재 반복만 건너뛰고 다음 반복으로 진행하는 키워드는?",
    choices: ["break", "continue", "pass", "return"],
    answer: "continue",
    explanation: "break는 반복 전체 종료, pass는 아무 일도 하지 않는 자리 표시자입니다.",
  },
  {
    id: "flow-3",
    category: "제어문",
    kind: "단답형",
    question: "중첩 반복문이 출력하는 값은?",
    code:
      "count = 0\nfor i in range(3):\n    for j in range(3):\n        if i == j:\n            continue\n        count += 1\nprint(count)",
    answer: "6",
    explanation: "전체 9개 조합 중 i와 j가 같은 3개를 제외하면 6개입니다.",
  },
  {
    id: "func-1",
    category: "함수·스코프",
    kind: "단답형",
    question: "다음 코드가 출력하는 두 값을 줄바꿈까지 동일하게 작성하시오.",
    code:
      "number = 10\n\ndef change():\n    number = 25\n    print(number)\n\nchange()\nprint(number)",
    answer: "25\n10",
    explanation:
      "함수 내부 대입은 지역 변수를 만듭니다. global이 없으므로 전역 number는 바뀌지 않습니다.",
  },
  {
    id: "func-2",
    category: "함수·스코프",
    kind: "객관식",
    question: "함수 안에서 전역 변수에 새 값을 대입할 때 필요한 키워드는?",
    choices: ["return", "global", "nonlocal", "yield"],
    answer: "global",
    explanation: "global 변수명 선언 후 전역 변수에 대입할 수 있습니다.",
  },
  {
    id: "func-3",
    category: "함수·스코프",
    kind: "서술형",
    question: "return과 print의 차이를 핵심 동작과 용도를 포함하여 서술하시오.",
    answer: "return은 함수의 실행을 종료하고 계산한 값을 호출한 위치로 전달하므로, 반환값을 변수에 저장하거나 다른 연산에 다시 사용할 수 있다. 반면 print는 전달받은 값을 화면에 표시할 뿐 호출자에게 값을 반환하지 않으며 반환값은 None이다. 따라서 함수의 결과를 이후 코드에서 활용하려면 return을 사용하고, 실행 과정이나 결과를 눈으로 확인하려면 print를 사용한다.",
    explanation:
      "return은 함수 실행을 끝내고 값을 호출자에게 전달합니다. 이 값은 저장하거나 다른 연산에 사용할 수 있습니다. print는 화면에 내용을 표시하지만 표시한 값을 호출자에게 전달하지 않으며, print 함수 자체의 반환값은 None입니다.",
  },
  {
    id: "data-1",
    category: "자료구조",
    kind: "단답형",
    question: "result의 값과 numbers의 최종 상태를 출력 형식 그대로 작성하시오.",
    code:
      "numbers = [3, 1, 4]\nresult = numbers.append(2)\nprint(result, numbers)",
    answer: "None [3, 1, 4, 2]",
    explanation: "append는 원본 리스트를 변경하고 None을 반환합니다.",
  },
  {
    id: "data-2",
    category: "자료구조",
    kind: "객관식",
    question: "원본을 바꾸지 않고 정렬된 새 리스트를 반환하는 표현은?",
    choices: [
      "numbers.sort()",
      "sorted(numbers)",
      "numbers.reverse()",
      "numbers.append()",
    ],
    answer: "sorted(numbers)",
    explanation: "list.sort()는 원본을 변경하고 None을 반환합니다.",
  },
  {
    id: "data-3",
    category: "자료구조",
    kind: "단답형",
    question: "두 키 조회가 출력하는 값을 순서대로 정확히 작성하시오.",
    code:
      "counts = {}\nfor fruit in ['apple', 'banana', 'apple']:\n    counts[fruit] = counts.get(fruit, 0) + 1\nprint(counts['apple'], counts.get('melon', -1))",
    answer: "2 -1",
    explanation: "get은 키가 없을 때 지정한 기본값을 반환합니다.",
  },
  {
    id: "data-4",
    category: "자료구조",
    kind: "단답형",
    question: "리스트 컴프리헨션의 출력 결과는?",
    code: "print([i ** 2 for i in range(7) if i % 2 == 0])",
    answer: "[0, 4, 16, 36]",
    explanation: "0부터 6까지 중 짝수만 선택한 뒤 제곱합니다.",
  },
  {
    id: "oop-1",
    category: "OOP",
    kind: "객관식",
    question: "클래스 메서드의 데코레이터와 첫 매개변수 조합은?",
    choices: [
      "@classmethod, cls",
      "@staticmethod, self",
      "@classmethod, self",
      "@property, cls",
    ],
    answer: "@classmethod, cls",
    explanation: "클래스 메서드는 클래스 자체를 관례상 cls로 받습니다.",
  },
  {
    id: "oop-2",
    category: "OOP",
    kind: "단답형",
    question: "Dog 인스턴스의 메서드 호출 결과를 정확히 작성하시오.",
    code:
      'class Animal:\n    def sound(self):\n        return "동물"\n\nclass Dog(Animal):\n    def sound(self):\n        return "멍멍"\n\nprint(Dog().sound())',
    answer: "멍멍",
    explanation: "자식 클래스에서 같은 이름의 메서드를 오버라이딩했습니다.",
  },
  {
    id: "oop-3",
    category: "OOP",
    kind: "객관식",
    question: "다중 상속에서 super()의 다음 호출 대상을 정하는 순서는?",
    choices: ["LEGB", "MRO", "FIFO", "변수 선언 순서"],
    answer: "MRO",
    explanation: "MRO(Method Resolution Order)는 클래스의 메서드 탐색 순서입니다.",
  },
  {
    id: "except-1",
    category: "예외처리",
    kind: "단답형",
    question: "다음 코드가 출력하는 두 문구를 줄바꿈까지 동일하게 작성하시오.",
    code:
      'try:\n    value = int("3.5")\nexcept ValueError:\n    print("변환 오류")\nfinally:\n    print("종료")',
    answer: "변환 오류\n종료",
    explanation: "int('3.5')는 ValueError를 발생시키고 finally는 항상 실행됩니다.",
  },
  {
    id: "except-2",
    category: "예외처리",
    kind: "객관식",
    question: "여러 except를 작성할 때 올바른 원칙은?",
    choices: [
      "Exception을 항상 먼저 쓴다",
      "구체적인 예외를 먼저 쓴다",
      "finally 뒤에 except를 쓴다",
      "예외 이름을 모두 생략한다",
    ],
    answer: "구체적인 예외를 먼저 쓴다",
    explanation: "넓은 예외를 먼저 잡으면 뒤의 구체적인 처리문에 도달할 수 없습니다.",
  },
  {
    id: "except-3",
    category: "예외처리",
    kind: "서술형",
    question: "finally 블록이 실행되는 시점과 역할을 예외 발생 여부와 연결하여 서술하시오.",
    answer: "finally 블록은 try 블록이 정상적으로 끝난 경우와 예외가 발생한 경우 모두 마지막에 실행된다. except에서 예외를 처리했는지와도 관계없이 실행되므로 파일 닫기, 네트워크 연결 해제처럼 반드시 수행해야 하는 정리 작업에 사용한다. return이 실행되거나 처리되지 않은 예외가 다시 전달되는 상황에서도 함수나 구문을 완전히 벗어나기 전에 finally가 먼저 실행된다.",
    explanation: "finally는 정상 실행, 처리된 예외, 처리되지 않은 예외와 관계없이 제어 흐름이 try 문을 벗어나기 전에 실행됩니다. 따라서 성공 여부와 무관하게 수행해야 하는 자원 정리 작업을 배치하는 데 적합합니다.",
  },
];

const conceptQuestions: Question[] = [
  {
    id: "op-is-1",
    category: "연산자·형변환",
    kind: "객관식",
    question: "== 연산자와 is 연산자에 대한 설명으로 올바른 것은?",
    choices: [
      "==는 값의 동등성, is는 객체의 동일성을 비교한다",
      "==와 is는 언제나 같은 결과를 반환한다",
      "is는 값만 비교하고 ==는 메모리 주소를 비교한다",
      "문자열 비교에는 반드시 is를 사용한다",
    ],
    answer: "==는 값의 동등성, is는 객체의 동일성을 비교한다",
    explanation:
      "==는 두 객체의 값이 같은지 확인하고 is는 두 변수가 정확히 같은 객체를 가리키는지 확인합니다. None 비교에는 is None을 권장합니다.",
  },
  {
    id: "op-is-2",
    category: "연산자·형변환",
    kind: "단답형",
    question: "세 비교 표현식이 출력하는 불리언 값을 순서대로 작성하시오.",
    code: "a = [1, 2]\nb = [1, 2]\nc = a\nprint(a == b, a is b, a is c)",
    answer: "True False True",
    explanation:
      "a와 b는 값은 같지만 서로 다른 리스트 객체입니다. c는 a가 가리키는 동일한 객체를 참조합니다.",
  },
  {
    id: "op-short-2",
    category: "연산자·형변환",
    kind: "단답형",
    question: "단락 평가가 적용된 출력 결과는?",
    code: "def check():\n    print('실행')\n    return True\n\nprint(False and check())",
    answer: "False",
    explanation:
      "and의 왼쪽이 False이면 전체 결과가 이미 결정되므로 check()는 호출되지 않고 '실행'도 출력되지 않습니다.",
  },
  {
    id: "op-short-3",
    category: "연산자·형변환",
    kind: "객관식",
    question: "다음 중 check()가 호출되는 표현식은?",
    choices: [
      "False and check()",
      "True or check()",
      "True and check()",
      "1 or check()",
    ],
    answer: "True and check()",
    explanation:
      "and는 왼쪽이 truthy일 때 오른쪽을 평가합니다. or는 왼쪽이 truthy이면 오른쪽을 평가하지 않습니다.",
  },
  {
    id: "op-truthy-1",
    category: "연산자·형변환",
    kind: "객관식",
    question: "다음 중 bool 값이 False인 것만 모인 보기는?",
    choices: ["0, '', [], None", "1, '0', [], None", "0, 'False', {}, ()", "False, [0], '', None"],
    answer: "0, '', [], None",
    explanation:
      "숫자 0, 빈 문자열·컨테이너, None은 falsy입니다. 내용이 하나라도 있는 문자열이나 리스트는 truthy입니다.",
  },
  {
    id: "op-float-1",
    category: "연산자·형변환",
    kind: "객관식",
    question: "0.1 + 0.2 == 0.3이 False가 될 수 있는 주된 이유는?",
    choices: [
      "컴퓨터가 실수를 이진 부동소수점으로 근사해 저장하기 때문",
      "0.1과 0.2를 더할 때 Python이 결과를 항상 소수 첫째 자리에서 반올림하기 때문",
      "==가 실수의 값이 아니라 두 float 객체의 동일성만 비교하기 때문",
      "실수끼리 더하면 계산 결과가 문자열 '0.3'으로 변환되기 때문",
    ],
    answer: "컴퓨터가 실수를 이진 부동소수점으로 근사해 저장하기 때문",
    explanation:
      "일부 10진 소수는 이진수로 정확하게 표현할 수 없어 미세한 오차가 생깁니다. math.isclose 같은 방법을 사용할 수 있습니다.",
  },
  {
    id: "op-membership-1",
    category: "연산자·형변환",
    kind: "단답형",
    question: "딕셔너리에 대한 in 연산의 출력 결과는?",
    code: "data = {'name': 'Kim', 'age': 20}\nprint('name' in data, 'Kim' in data)",
    answer: "True False",
    explanation:
      "딕셔너리에 in을 사용하면 기본적으로 값이 아니라 키의 포함 여부를 검사합니다.",
  },
  {
    id: "op-chain-1",
    category: "연산자·형변환",
    kind: "단답형",
    question: "비교 연산자 체이닝의 출력 결과는?",
    code: "x = 5\nprint(1 < x < 10, 1 < x > 10)",
    answer: "True False",
    explanation:
      "1 < x < 10은 1 < x and x < 10과 같습니다. 두 번째 표현식에서는 x > 10이 False입니다.",
  },
  {
    id: "seq-index-1",
    category: "문자열·시퀀스",
    kind: "단답형",
    question: "음수 인덱스와 역순 슬라이싱의 출력 결과는?",
    code: "text = 'python'\nprint(text[-1], text[::-1])",
    answer: "n nohtyp",
    explanation:
      "-1은 마지막 요소이며 슬라이스의 step을 -1로 두면 뒤에서 앞으로 순회합니다.",
  },
  {
    id: "seq-slice-copy",
    category: "문자열·시퀀스",
    kind: "객관식",
    question: "리스트 a가 있을 때 a[:]의 결과로 가장 적절한 설명은?",
    choices: [
      "최상위 리스트만 새로 만든 얕은 복사",
      "모든 중첩 객체까지 새로 만드는 깊은 복사",
      "원본 a와 완전히 동일한 객체",
      "항상 빈 리스트",
    ],
    answer: "최상위 리스트만 새로 만든 얕은 복사",
    explanation:
      "슬라이싱은 새 리스트를 만들지만 내부의 중첩 객체는 원본과 공유할 수 있습니다.",
  },
  {
    id: "seq-tuple-1",
    category: "문자열·시퀀스",
    kind: "객관식",
    question: "요소가 하나인 튜플을 올바르게 만드는 표현식은?",
    choices: ["(1)", "(1,)", "[1,]", "{1,}"],
    answer: "(1,)",
    explanation:
      "튜플을 결정하는 핵심은 괄호보다 쉼표입니다. (1)은 단순한 정수 1입니다.",
  },
  {
    id: "seq-range-1",
    category: "문자열·시퀀스",
    kind: "단답형",
    question: "다음 코드를 실행했을 때 출력되는 결과를 Python 리스트 표현식 그대로 작성하시오.",
    code: "print(list(range(5, 0, -2)))",
    answer: "[5, 3, 1]",
    explanation:
      "range의 종료값은 포함하지 않으며 -2씩 감소해 5, 3, 1이 생성됩니다.",
  },
  {
    id: "seq-method-1",
    category: "문자열·시퀀스",
    kind: "단답형",
    question: "print 문이 출력하는 정수 값을 정확히 작성하시오.",
    code: "text = 'python'\nprint(text.find('z'))",
    answer: "-1",
    explanation:
      "find는 문자를 찾지 못하면 -1을 반환합니다. index는 같은 상황에서 ValueError를 발생시킵니다.",
  },
  {
    id: "seq-string-immutable",
    category: "문자열·시퀀스",
    kind: "객관식",
    question: "문자열 메서드에 관한 설명으로 올바른 것은?",
    choices: [
      "replace는 원본 문자열을 직접 변경한다",
      "문자열은 불변이므로 메서드는 보통 새 문자열을 반환한다",
      "strip은 문자열 중간의 모든 공백을 제거한다",
      "split은 항상 문자열 하나를 반환한다",
    ],
    answer: "문자열은 불변이므로 메서드는 보통 새 문자열을 반환한다",
    explanation:
      "문자열은 immutable입니다. replace, strip, lower 등의 결과를 사용하려면 반환값을 저장해야 합니다.",
  },
  {
    id: "flow-break-else",
    category: "제어문",
    kind: "단답형",
    question: "for-else의 동작을 고려하여 출력 결과를 정확히 작성하시오.",
    code: "for number in [1, 3, 5]:\n    if number % 2 == 0:\n        break\nelse:\n    print('완료')",
    answer: "완료",
    explanation:
      "반복문이 break 없이 정상 종료되면 else가 실행됩니다. 반복 횟수가 0이어도 break가 없으므로 실행됩니다.",
  },
  {
    id: "flow-pass-1",
    category: "제어문",
    kind: "객관식",
    question: "pass에 대한 설명으로 올바른 것은?",
    choices: [
      "반복문을 즉시 종료한다",
      "현재 반복을 건너뛴다",
      "문법적으로 문장이 필요한 자리에 아무 동작 없이 사용한다",
      "함수에서 None을 명시적으로 반환한다",
    ],
    answer: "문법적으로 문장이 필요한 자리에 아무 동작 없이 사용한다",
    explanation:
      "pass는 아무 동작도 하지 않습니다. break나 continue와 제어 흐름 효과가 다릅니다.",
  },
  {
    id: "flow-while-1",
    category: "제어문",
    kind: "단답형",
    question: "while 반복의 출력 결과는?",
    code: "n = 5\nresult = []\nwhile n > 0:\n    n -= 2\n    result.append(n)\nprint(result)",
    answer: "[3, 1, -1]",
    explanation:
      "조건은 각 반복 시작 전에 검사합니다. n이 1일 때 반복에 진입한 후 -1을 추가하고 다음 검사에서 종료됩니다.",
  },
  {
    id: "flow-enumerate",
    category: "제어문",
    kind: "단답형",
    question: "다음 코드를 실행했을 때 출력되는 결과를 줄바꿈까지 동일하게 작성하시오.",
    code: "for index, value in enumerate(['a', 'b'], start=1):\n    print(index, value)",
    answer: "1 a\n2 b",
    explanation:
      "enumerate는 (인덱스, 값) 쌍을 만들며 start=1이면 인덱스가 1부터 시작합니다.",
  },
  {
    id: "flow-zip",
    category: "제어문",
    kind: "단답형",
    question: "길이가 다른 두 시퀀스를 zip한 결과는?",
    code: "print(list(zip([1, 2, 3], ['a', 'b'])))",
    answer: "[(1, 'a'), (2, 'b')]",
    explanation:
      "zip은 기본적으로 가장 짧은 iterable이 끝나는 시점에 종료됩니다.",
  },
  {
    id: "func-default-1",
    category: "함수·스코프",
    kind: "객관식",
    question: "기본 매개변수와 일반 매개변수의 올바른 정의 순서는?",
    choices: [
      "def func(a=1, b):",
      "def func(a, b=1):",
      "def func(*args, a, b):만 가능",
      "순서 제한이 없다",
    ],
    answer: "def func(a, b=1):",
    explanation:
      "기본값이 없는 매개변수는 기본값이 있는 매개변수보다 앞에 와야 합니다.",
  },
  {
    id: "func-args-1",
    category: "함수·스코프",
    kind: "단답형",
    question: "출력되는 자료형 이름과 튜플 값을 정확히 작성하시오.",
    code: "def collect(*args):\n    print(type(args).__name__, args)\ncollect(1, 2, 3)",
    answer: "tuple (1, 2, 3)",
    explanation:
      "여러 위치 인자는 함수 내부에서 args라는 튜플로 패킹됩니다.",
  },
  {
    id: "func-kwargs-1",
    category: "함수·스코프",
    kind: "단답형",
    question: "**kwargs의 자료형을 정확히 작성하시오.",
    code: "def info(**kwargs):\n    print(type(kwargs).__name__)\ninfo(name='Kim', age=20)",
    answer: "dict",
    explanation:
      "여러 키워드 인자는 함수 내부에서 딕셔너리로 패킹됩니다.",
  },
  {
    id: "func-unpack-1",
    category: "함수·스코프",
    kind: "단답형",
    question: "언패킹된 세 변수의 출력값을 순서와 표시 형식에 맞게 작성하시오.",
    code: "first, *middle, last = [1, 2, 3, 4, 5]\nprint(first, middle, last)",
    answer: "1 [2, 3, 4] 5",
    explanation:
      "별표가 붙은 변수는 남은 여러 요소를 리스트로 받습니다.",
  },
  {
    id: "func-lebg-1",
    category: "함수·스코프",
    kind: "객관식",
    question: "함수 내부에서 사용한 이름을 Python이 탐색하는 순서로 올바른 것은?",
    choices: [
      "Local → Enclosed → Global → Built-in",
      "Local → Global → Enclosed → Built-in",
      "Built-in → Global → Local → Enclosed",
      "Global → Local → Built-in → Enclosed",
    ],
    answer: "Local → Enclosed → Global → Built-in",
    explanation:
      "현재 지역, 바깥 함수, 전역, 내장 영역 순서로 이름을 탐색합니다.",
  },
  {
    id: "func-nonlocal",
    category: "함수·스코프",
    kind: "단답형",
    question: "nonlocal의 효과를 고려하여 출력 결과를 정확히 작성하시오.",
    code: "def outer():\n    x = 1\n    def inner():\n        nonlocal x\n        x += 1\n    inner()\n    print(x)\nouter()",
    answer: "2",
    explanation:
      "nonlocal은 가장 가까운 바깥 함수 영역의 변수를 다시 바인딩하게 합니다.",
  },
  {
    id: "func-return-none",
    category: "함수·스코프",
    kind: "단답형",
    question: "명시적 return이 없는 함수의 반환값은?",
    code: "def greet():\n    message = 'hello'\n\nprint(greet())",
    answer: "None",
    explanation:
      "함수가 return을 만나지 않고 끝나면 None을 반환합니다.",
  },
  {
    id: "func-recursion",
    category: "함수·스코프",
    kind: "객관식",
    question: "재귀 함수에서 기저 조건(base case)이 필요한 이유는?",
    choices: [
      "무한 호출을 막고 재귀를 종료하기 위해",
      "이전에 계산한 모든 결과를 자동으로 캐시에 저장하기 위해",
      "재귀 호출마다 지역 변수가 새로 만들어지지 않도록 하기 위해",
      "재귀 함수를 반복문으로 자동 변환하기 위해",
    ],
    answer: "무한 호출을 막고 재귀를 종료하기 위해",
    explanation:
      "기저 조건이 없거나 도달할 수 없으면 RecursionError가 발생할 수 있습니다.",
  },
  {
    id: "func-map-lazy",
    category: "함수·스코프",
    kind: "객관식",
    question: "Python 3의 map 객체에 대한 설명으로 올바른 것은?",
    choices: [
      "필요할 때 값을 만드는 지연 평가 iterable이다",
      "항상 즉시 list를 반환한다",
      "한 번 순회한 후에도 무한히 같은 값을 제공한다",
      "함수 없이도 반드시 두 인자를 받는다",
    ],
    answer: "필요할 때 값을 만드는 지연 평가 iterable이다",
    explanation:
      "map 결과를 눈으로 확인하거나 재사용하려면 list로 변환할 수 있습니다. iterator는 소비될 수 있습니다.",
  },
  {
    id: "data-copy-1",
    category: "자료구조",
    kind: "단답형",
    question: "다음 코드를 실행한 뒤 출력되는 원본 a의 값을 Python 표현식 그대로 작성하시오.",
    code: "a = [[1, 2], [3, 4]]\nb = a.copy()\nb[0].append(9)\nprint(a)",
    answer: "[[1, 2, 9], [3, 4]]",
    explanation:
      "바깥 리스트 b는 새 객체지만 내부 리스트는 a와 공유하므로 중첩 요소 변경이 원본에도 보입니다.",
  },
  {
    id: "data-alias-1",
    category: "자료구조",
    kind: "단답형",
    question: "출력되는 불리언 값과 리스트를 표시 형식 그대로 작성하시오.",
    code: "a = [1, 2]\nb = a\nb.append(3)\nprint(a is b, a)",
    answer: "True [1, 2, 3]",
    explanation:
      "b = a는 복사가 아니라 같은 리스트 객체를 가리키는 참조를 하나 더 만드는 할당입니다.",
  },
  {
    id: "data-extend",
    category: "자료구조",
    kind: "단답형",
    question: "다음 코드를 실행했을 때 출력되는 두 리스트를 정확히 작성하시오.",
    code: "a = [1]\na.append([2, 3])\nb = [1]\nb.extend([2, 3])\nprint(a, b)",
    answer: "[1, [2, 3]] [1, 2, 3]",
    explanation:
      "append는 인자를 하나의 요소로 추가하고 extend는 iterable의 각 요소를 이어 붙입니다.",
  },
  {
    id: "data-remove-pop",
    category: "자료구조",
    kind: "객관식",
    question: "list.remove와 list.pop의 차이로 올바른 것은?",
    choices: [
      "remove는 값을 삭제하고 pop은 인덱스의 값을 삭제하며 반환한다",
      "remove는 인덱스를 받고 pop은 값만 받는다",
      "둘 다 원본을 바꾸지 않는다",
      "둘 다 항상 None을 반환한다",
    ],
    answer: "remove는 값을 삭제하고 pop은 인덱스의 값을 삭제하며 반환한다",
    explanation:
      "remove(value)는 첫 번째 일치 값을 지우고 None을 반환합니다. pop(index)는 제거한 요소를 반환합니다.",
  },
  {
    id: "data-set-1",
    category: "자료구조",
    kind: "단답형",
    question: "세트의 중복 제거 성질을 이용한 출력 결과는?",
    code: "numbers = [1, 2, 2, 3, 3, 3]\nprint(len(set(numbers)))",
    answer: "3",
    explanation:
      "set은 중복 요소를 저장하지 않습니다. 단, 세트 자체는 순서를 보장하는 용도로 사용하면 안 됩니다.",
  },
  {
    id: "data-set-op",
    category: "자료구조",
    kind: "객관식",
    question: "집합 a와 b의 공통 원소를 구하는 연산자는?",
    choices: ["a & b", "a | b", "a - b", "a ^ b"],
    answer: "a & b",
    explanation:
      "&는 교집합, |는 합집합, -는 차집합, ^는 대칭 차집합입니다.",
  },
  {
    id: "data-hash-1",
    category: "자료구조",
    kind: "객관식",
    question: "딕셔너리 키로 사용할 수 없는 것은?",
    choices: ["'name'", "10", "(1, 2)", "[1, 2]"],
    answer: "[1, 2]",
    explanation:
      "딕셔너리 키는 해시 가능한 객체여야 합니다. 변경 가능한 list는 해시할 수 없습니다.",
  },
  {
    id: "data-dict-view",
    category: "자료구조",
    kind: "객관식",
    question: "딕셔너리의 키와 값을 동시에 순회하는 일반적인 표현은?",
    choices: ["for k, v in data.items():", "for k, v in data.keys():", "for k, v in data:", "for data in k, v:"],
    answer: "for k, v in data.items():",
    explanation:
      "items()는 (키, 값) 쌍을 제공하여 두 변수로 언패킹할 수 있습니다.",
  },
  {
    id: "data-get-bracket",
    category: "자료구조",
    kind: "객관식",
    question: "존재하지 않는 키를 조회할 때의 차이로 올바른 것은?",
    choices: [
      "data[key]는 KeyError, data.get(key)는 기본적으로 None",
      "둘 다 항상 KeyError",
      "둘 다 딕셔너리에 키를 자동 추가",
      "data.get(key)만 KeyError",
    ],
    answer: "data[key]는 KeyError, data.get(key)는 기본적으로 None",
    explanation:
      "get에 두 번째 인자를 주면 None 대신 원하는 기본값을 반환하게 할 수 있습니다.",
  },
  {
    id: "data-method-chain",
    category: "자료구조",
    kind: "단답형",
    question: "다음 코드에서 result에 저장된 값을 정확히 작성하시오.",
    code: "numbers = [3, 1, 2]\nresult = numbers.copy().sort()\nprint(result)",
    answer: "None",
    explanation:
      "copy()는 새 리스트를 반환하지만 이어서 호출한 sort()는 그 리스트를 정렬한 뒤 None을 반환합니다.",
  },
  {
    id: "oop-class-instance",
    category: "OOP",
    kind: "단답형",
    question: "클래스 변수와 인스턴스 변수의 탐색 결과는?",
    code: "class Person:\n    species = 'human'\n\np1 = Person()\np2 = Person()\np1.species = 'developer'\nprint(p1.species, p2.species, Person.species)",
    answer: "developer human human",
    explanation:
      "p1에 같은 이름의 인스턴스 변수가 생겨 클래스 변수를 가립니다. p2는 여전히 클래스 변수를 찾습니다.",
  },
  {
    id: "oop-method-role",
    category: "OOP",
    kind: "객관식",
    question: "정적 메서드(static method)에 대한 설명으로 올바른 것은?",
    choices: [
      "self나 cls를 자동으로 받지 않으며 클래스와 관련된 독립 기능에 사용한다",
      "항상 인스턴스 상태를 변경해야 한다",
      "첫 매개변수로 반드시 cls를 받는다",
      "상속할 수 없는 메서드이다",
    ],
    answer: "self나 cls를 자동으로 받지 않으며 클래스와 관련된 독립 기능에 사용한다",
    explanation:
      "@staticmethod는 자동으로 전달되는 첫 인자가 없습니다. 인스턴스나 클래스 상태가 필요 없는 기능에 적합합니다.",
  },
  {
    id: "oop-init-return",
    category: "OOP",
    kind: "객관식",
    question: "__init__ 메서드에 대한 설명으로 올바른 것은?",
    choices: [
      "인스턴스 생성 과정에서 초기 상태를 설정하며 None 이외 값을 반환하면 안 된다",
      "클래스가 삭제될 때만 호출된다",
      "반드시 문자열을 반환해야 한다",
      "정적 메서드로만 작성해야 한다",
    ],
    answer: "인스턴스 생성 과정에서 초기 상태를 설정하며 None 이외 값을 반환하면 안 된다",
    explanation:
      "__init__은 생성된 인스턴스를 초기화합니다. 객체를 실제로 만드는 __new__와 역할이 다릅니다.",
  },
  {
    id: "oop-super-1",
    category: "OOP",
    kind: "단답형",
    question: "super()로 부모 초기화를 재사용한 출력 결과는?",
    code: "class Parent:\n    def __init__(self):\n        self.value = 10\n\nclass Child(Parent):\n    def __init__(self):\n        super().__init__()\n        self.value += 5\n\nprint(Child().value)",
    answer: "15",
    explanation:
      "super().__init__()이 부모의 초기화 코드를 실행한 후 자식에서 value를 변경합니다.",
  },
  {
    id: "oop-namespace",
    category: "OOP",
    kind: "객관식",
    question: "인스턴스에서 속성을 찾는 기본적인 순서로 가장 적절한 것은?",
    choices: [
      "인스턴스 → 클래스 → 부모 클래스",
      "부모 클래스 → 클래스 → 인스턴스",
      "클래스 → 전역 → 인스턴스",
      "내장 영역 → 인스턴스 → 클래스",
    ],
    answer: "인스턴스 → 클래스 → 부모 클래스",
    explanation:
      "인스턴스 자체에 없으면 클래스와 상속 계층의 MRO를 따라 속성을 찾습니다.",
  },
  {
    id: "oop-magic",
    category: "OOP",
    kind: "객관식",
    question: "print(instance)에서 사람이 읽을 문자열 표현을 제공하는 매직 메서드는?",
    choices: ["__str__", "__init__", "__len__", "__call__"],
    answer: "__str__",
    explanation:
      "__str__은 str()과 print()에서 사용할 읽기 좋은 문자열 표현을 반환합니다.",
  },
  {
    id: "except-else",
    category: "예외처리",
    kind: "객관식",
    question: "try-except의 else 블록은 언제 실행되는가?",
    choices: [
      "try에서 예외가 발생하지 않았을 때",
      "예외가 발생했을 때만",
      "finally가 실패했을 때",
      "항상 except보다 먼저",
    ],
    answer: "try에서 예외가 발생하지 않았을 때",
    explanation:
      "else에는 예외가 없을 때만 실행할 코드를 두고, finally는 예외 여부와 관계없이 실행합니다.",
  },
  {
    id: "except-order",
    category: "예외처리",
    kind: "객관식",
    question: "except Exception을 구체적인 예외보다 먼저 작성하면 생기는 문제는?",
    choices: [
      "뒤의 구체적인 except에 도달할 수 없다",
      "모든 예외가 자동으로 무시된다",
      "finally가 두 번 실행된다",
      "try 블록이 실행되지 않는다",
    ],
    answer: "뒤의 구체적인 except에 도달할 수 없다",
    explanation:
      "Exception이 하위 예외를 먼저 모두 잡으므로 ZeroDivisionError 같은 뒤쪽 분기가 사실상 도달 불가능해집니다.",
  },
  {
    id: "except-as",
    category: "예외처리",
    kind: "단답형",
    question: "발생하는 예외 클래스 이름만 정확히 작성하시오.",
    code: "try:\n    [1, 2][5]\nexcept Exception as error:\n    print(type(error).__name__)",
    answer: "IndexError",
    explanation:
      "리스트 범위를 벗어난 인덱스 접근은 IndexError를 발생시킵니다. as로 예외 객체를 받아 정보를 확인할 수 있습니다.",
  },
  {
    id: "except-eafp",
    category: "예외처리",
    kind: "객관식",
    question: "예외 처리를 중심으로 먼저 연산을 시도하는 코딩 방식을 설명한 것은?",
    choices: [
      "먼저 실행하고 문제가 생기면 예외를 처리한다",
      "모든 조건을 if로 미리 검사한 뒤 실행한다",
      "예외 처리를 절대 사용하지 않는다",
      "오류가 나면 프로그램을 항상 종료한다",
    ],
    answer: "먼저 실행하고 문제가 생기면 예외를 처리한다",
    explanation:
      "EAFP는 Easier to Ask Forgiveness than Permission의 약자로 try-except 중심 접근입니다. 미리 검사하는 방식은 LBYL입니다.",
  },
  {
    id: "except-multi",
    category: "예외처리",
    kind: "객관식",
    question: "하나의 except에서 여러 예외를 함께 처리하는 올바른 문법은?",
    choices: [
      "except (ValueError, TypeError):",
      "except ValueError or TypeError:",
      "except [ValueError, TypeError]:",
      "except ValueError, TypeError:",
    ],
    answer: "except (ValueError, TypeError):",
    explanation:
      "여러 예외 클래스는 튜플로 묶어 except 절에 작성합니다.",
  },
];

const generatedQuestions: Question[] = [
  ...[
    [31, 6],
  ].map(([a, b], index): Question => ({
    id: `generated-op-${index}`,
    category: "연산자·형변환",
    kind: "단답형",
    question: "다음 산술 표현식의 출력값을 정확히 작성하시오.",
    code: `print(${a} // ${b} + ${a} % ${b} * 2)`,
    answer: String(Math.floor(a / b) + (a % b) * 2),
    explanation: `//와 %를 먼저 계산합니다. ${a} // ${b}는 ${Math.floor(a / b)}, 나머지는 ${a % b}이므로 결과는 ${Math.floor(a / b) + (a % b) * 2}입니다.`,
  })),
  ...[
    ["ssafycoding", 1, 2],
  ].map(([text, start, step], index): Question => {
    const value = String(text);
    const begin = Number(start);
    const gap = Number(step);
    return {
      id: `generated-slice-${index}`,
      category: "문자열·시퀀스",
      kind: "단답형",
      question: "슬라이싱 결과를 정확히 작성하시오.",
      code: `text = '${value}'\nprint(text[${begin}::${gap}])`,
      answer: [...value].filter((_, i) => i >= begin && (i - begin) % gap === 0).join(""),
      explanation: `인덱스 ${begin}부터 시작해 ${gap}칸 간격으로 끝까지 선택합니다.`,
    };
  }),
  ...[
    [10, 3],
  ].map(([end, divisor], index): Question => {
    const answer = Array.from({ length: end - 1 }, (_, i) => i + 1)
      .filter((value) => value % divisor !== 0)
      .reduce((sum, value) => sum + value, 0);
    return {
      id: `generated-loop-${index}`,
      category: "제어문",
      kind: "단답형",
      question: "continue가 적용된 반복문의 출력 결과는?",
      code: `total = 0\nfor i in range(1, ${end}):\n    if i % ${divisor} == 0:\n        continue\n    total += i\nprint(total)`,
      answer: String(answer),
      explanation: `${divisor}의 배수에서는 continue로 덧셈을 건너뛰고 나머지 값만 합산합니다.`,
    };
  }),
  ...[
    [[3, 4, 5, 8], 5],
  ].map(([rawValues, factor], index): Question => {
    const values = rawValues as number[];
    const multiplier = factor as number;
    const answer = values.filter((value) => value % 2 === 1).map((value) => value * multiplier);
    return {
      id: `generated-function-${index}`,
      category: "함수·스코프",
      kind: "단답형",
      question: "transform 함수 호출이 반환하는 리스트를 Python 표현식 그대로 작성하시오.",
      code: `def transform(numbers, factor=${multiplier}):\n    return [number * factor for number in numbers if number % 2]\n\nprint(transform(${JSON.stringify(values)}))`,
      answer: JSON.stringify(answer).replaceAll(",", ", "),
      explanation: `홀수만 남긴 뒤 각각 ${multiplier}를 곱해 새 리스트로 반환합니다.`,
    };
  }),
  ...[
    ["python", "java", "python", "js", "python"],
  ].map((values, index): Question => {
    const target = values[0];
    const count = values.filter((value) => value === target).length;
    return {
      id: `generated-dict-${index}`,
      category: "자료구조",
      kind: "단답형",
      question: "반복문이 끝난 뒤 지정된 키에 저장된 값을 정확히 작성하시오.",
      code: `counts = {}\nfor item in ${JSON.stringify(values)}:\n    counts[item] = counts.get(item, 0) + 1\nprint(counts['${target}'])`,
      answer: String(count),
      explanation: `get(item, 0)으로 기존 개수를 가져와 1씩 누적하므로 '${target}'은 ${count}회입니다.`,
    };
  }),
  ...[
    ["IndexError", "[1, 2][5]"],
  ].map(([error, expression], index): Question => ({
    id: `generated-exception-${index}`,
    category: "예외처리",
    kind: "단답형",
    question: "출력되는 예외 클래스 이름만 정확히 작성하시오.",
    code: `try:\n    ${expression}\nexcept Exception as error:\n    print(type(error).__name__)`,
    answer: error,
    explanation: `${expression} 표현식은 ${error}를 발생시킵니다.`,
  })),
  ...[
    ["Score", 10, 15],
  ].map(([name, parentValue, childValue], index): Question => ({
    id: `generated-oop-${index}`,
    category: "OOP",
    kind: "단답형",
    question: "자식 클래스의 속성 탐색 결과를 정확히 작성하시오.",
    code: `class Parent:\n    value = ${parentValue}\n\nclass ${name}(Parent):\n    value = ${childValue}\n\nprint(${name}().value)`,
    answer: String(childValue),
    explanation: `인스턴스에 해당 속성이 없으므로 자식 클래스에서 먼저 value를 찾아 ${childValue}를 출력합니다.`,
  })),
];

const examStyleQuestions: Question[] = [
  {
    id: "exam-dict-theory",
    category: "자료구조",
    kind: "객관식",
    question: "다음 중 딕셔너리에 대한 설명으로 옳지 않은 것은?",
    choices: [
      "시퀀스 자료형이다.",
      "키를 이용해 대응하는 값을 얻을 수 있다.",
      "하나의 딕셔너리에서 키는 중복될 수 없다.",
      "get으로 없는 키를 조회하고 기본값을 생략하면 None을 반환한다.",
    ],
    answer: "시퀀스 자료형이다.",
    explanation:
      "딕셔너리는 키-값 쌍으로 구성되는 비시퀀스 자료형입니다. 삽입 순서를 보존하는 것과 인덱스 순서로 접근하는 시퀀스라는 것은 다른 개념입니다.",
  },
  {
    id: "exam-nested-loop-matrix",
    category: "제어문",
    kind: "객관식",
    question: "다음 코드를 실행했을 때 출력되는 결과로 옳은 것은?",
    code: "numbers = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\n\nfor i in range(len(numbers)):\n    for j in range(len(numbers)):\n        print(numbers[j][i], end=' ')",
    choices: [
      "1 2 3 4 5 6 7 8 9",
      "1 2 3 6 9 8 7 5 4",
      "1 4 7 2 5 8 3 6 9",
      "9 8 7 6 5 4 3 2 1",
    ],
    answer: "1 4 7 2 5 8 3 6 9",
    explanation:
      "바깥 반복의 i가 열 인덱스를 고정하고 안쪽 반복의 j가 행을 이동합니다. 따라서 각 행을 읽는 것이 아니라 첫 번째 열, 두 번째 열, 세 번째 열 순서로 출력합니다.",
  },
  {
    id: "exam-animal-output",
    category: "OOP",
    kind: "단답형",
    question: "다음 코드를 실행했을 때 출력되는 결과만 정확히 작성하시오.",
    code: "class Animal:\n    def __init__(self, name):\n        self.name = name\n\n    def walk(self):\n        print('걷는다!')\n\n    def eat(self):\n        print(f'{self.name}!먹는다!')\n\ndog = Animal('dog')\ndog.walk()",
    answer: "걷는다!",
    explanation:
      "dog.walk()은 walk 메서드만 호출합니다. eat 메서드는 정의되어 있지만 호출되지 않으므로 이름을 포함한 문장은 출력되지 않습니다.",
  },
  {
    id: "exam-enumerate-blank",
    category: "제어문",
    kind: "단답형",
    question: "인덱스와 요소를 함께 순회하려고 한다. 빈칸에 들어갈 함수 이름만 작성하시오. 괄호는 작성하지 않는다.",
    code: "lunch = ['짜장면', '짬뽕', '탕수육']\n\nfor idx, menu in _____(lunch):\n    print(idx, menu)",
    answer: "enumerate",
    explanation:
      "enumerate(iterable)는 각 요소와 함께 0부터 시작하는 인덱스를 제공하므로 두 변수로 언패킹할 수 있습니다. 문제에서 괄호를 제외하라고 했으므로 함수 이름만 작성해야 합니다.",
  },
  {
    id: "exam-sequence-essay",
    category: "문자열·시퀀스",
    kind: "서술형",
    question: "시퀀스형 데이터의 공통 특징과 종류를 비시퀀스형 데이터와 구분하여 서술하시오.",
    answer:
      "시퀀스형 데이터는 여러 값을 정해진 순서로 저장하여 인덱싱, 슬라이싱, 길이 확인과 같은 공통 연산을 적용할 수 있다. 문자열, 리스트, 튜플, range가 대표적인 시퀀스형이다. 순서가 있다는 말은 자동으로 정렬되어 있다는 뜻이 아니다. 딕셔너리는 키로 값을 조회하고 집합은 중복 없는 원소를 다루므로 둘 다 비시퀀스형이다.",
    explanation:
      "핵심은 순서 보장과 정렬을 구분하고, 시퀀스의 공통 연산과 대표 자료형을 제시하며, 딕셔너리와 집합을 시퀀스에 포함하지 않는 것입니다.",
  },
  {
    id: "exam-comprehension-error-essay",
    category: "제어문",
    kind: "서술형",
    question: "다음 코드의 실행 결과와 그 이유를 서술하시오. 오류가 발생한다면 오류 종류와 발생 원인을 모두 포함하시오.",
    code: "documents = ['java', 'python', 's5g4', 's5g2', 'spring', 'django', 'extra']\npython_class = [documents[i + 1] for i in range(0, len(documents), 2)]\n\nprint(python_class)",
    answer:
      "리스트 컴프리헨션을 계산하는 도중 IndexError가 발생하므로 print 문은 실행되지 않는다. range(0, 7, 2)는 0, 2, 4, 6을 만들고 각 값에 1을 더해 documents[1], documents[3], documents[5], documents[7]에 접근한다. 마지막 documents[7]은 길이가 7인 리스트의 유효 인덱스 0부터 6을 벗어나기 때문에 오류가 발생한다.",
    explanation:
      "오류 이름만 쓰는 것으로는 부족합니다. range가 만드는 마지막 값, i + 1의 결과, 리스트의 유효 인덱스 범위, print가 실행되지 않는다는 점까지 연결해야 합니다.",
  },
  {
    id: "exam-dict-access-error",
    category: "자료구조",
    kind: "객관식",
    question: "빈 딕셔너리 data에서 없는 키 'score'를 조회할 때의 설명으로 옳은 것은?",
    code: "data = {}",
    choices: [
      "data['score']와 data.get('score') 모두 None을 반환한다.",
      "data['score']는 KeyError가 발생하고 data.get('score')는 None을 반환한다.",
      "data['score']는 None을 반환하고 data.get('score')는 KeyError가 발생한다.",
      "두 표현 모두 빈 문자열을 반환한다.",
    ],
    answer: "data['score']는 KeyError가 발생하고 data.get('score')는 None을 반환한다.",
    explanation:
      "대괄호 조회는 키가 반드시 존재해야 하므로 KeyError가 발생합니다. get은 키가 없을 때 예외 대신 지정한 기본값을 반환하며, 기본값을 생략하면 None입니다.",
  },
  {
    id: "exam-args-blank",
    category: "함수·스코프",
    kind: "단답형",
    question: "여러 개의 위치 인자를 하나의 튜플로 받으려고 한다. 빈칸에 들어갈 매개변수 표현을 정확히 작성하시오.",
    code: "def total(_____):\n    return sum(numbers)\n\nprint(total(1, 2, 3))",
    answer: "*numbers",
    explanation:
      "매개변수 이름 앞의 별표 하나는 전달된 여러 위치 인자를 튜플로 패킹합니다. 별표를 생략하면 여러 인자를 하나의 매개변수로 받을 수 없습니다.",
  },
  {
    id: "exam-zip-blank",
    category: "제어문",
    kind: "단답형",
    question: "두 리스트의 같은 위치 요소를 짝지어 순회하려고 한다. 빈칸에 들어갈 함수 이름만 작성하시오.",
    code: "names = ['Alice', 'Bob']\nscores = [90, 80]\n\nfor name, score in _____(names, scores):\n    print(name, score)",
    answer: "zip",
    explanation:
      "zip은 여러 반복 가능한 객체에서 같은 위치의 요소를 튜플로 묶어 제공합니다. 여기서는 각 튜플이 name과 score로 언패킹됩니다.",
  },
  {
    id: "exam-class-instance-trace",
    category: "OOP",
    kind: "단답형",
    question: "다음 코드가 출력하는 두 숫자를 공백으로 구분하여 정확히 작성하시오.",
    code: "class Student:\n    count = 0\n\n    def __init__(self):\n        Student.count += 1\n        self.count = 10\n\na = Student()\nb = Student()\nprint(Student.count, a.count)",
    answer: "2 10",
    explanation:
      "생성자가 두 번 호출되어 클래스 변수 Student.count는 2가 됩니다. a.count는 a 인스턴스에 직접 저장된 인스턴스 변수 10을 먼저 찾습니다.",
  },
  {
    id: "exam-try-else-finally",
    category: "예외처리",
    kind: "객관식",
    question: "다음 코드의 출력 순서로 옳은 것은?",
    code: "try:\n    value = int('10')\nexcept ValueError:\n    print('except')\nelse:\n    print('else')\nfinally:\n    print('finally')",
    choices: ["except", "else", "finally", "else → finally"],
    answer: "else → finally",
    explanation:
      "int('10')은 정상적으로 10을 반환하므로 except는 실행되지 않고 else가 실행됩니다. finally는 예외 발생 여부와 관계없이 마지막에 실행됩니다.",
  },
  {
    id: "exam-shallow-copy-trace",
    category: "자료구조",
    kind: "객관식",
    question: "다음 코드의 출력 결과로 옳은 것은?",
    code: "original = [[1, 2], [3, 4]]\ncopied = original[:]\ncopied[0].append(9)\nprint(original)",
    choices: [
      "[[1, 2], [3, 4]]",
      "[[1, 2, 9], [3, 4]]",
      "[[1, 2], [3, 4], 9]",
      "오류가 발생한다.",
    ],
    answer: "[[1, 2, 9], [3, 4]]",
    explanation:
      "슬라이싱은 바깥 리스트만 새로 만들고 내부 리스트 객체는 공유합니다. copied[0]과 original[0]이 같은 내부 리스트를 가리키므로 append의 변경이 original에서도 보입니다.",
  },
  {
    id: "exam-short-circuit-side-effect",
    category: "연산자·형변환",
    kind: "단답형",
    question: "다음 코드가 출력하는 세 값을 줄바꿈까지 동일하게 작성하시오.",
    code: "def check():\n    print('호출')\n    return False\n\nprint(True or check())\nprint(False or check())",
    answer: "True\n호출\nFalse",
    explanation:
      "첫 번째 or는 왼쪽 True만으로 결과가 결정되어 check를 호출하지 않습니다. 두 번째 or는 왼쪽이 False이므로 check를 호출해 '호출'을 출력하고, 반환값 False가 바깥 print로 출력됩니다.",
  },
];

const verifiedFundamentalQuestions: Question[] = [
  {
    id: "verified-return-tuple",
    category: "함수·스코프",
    kind: "객관식",
    question: "다음 함수의 반환값과 타입을 올바르게 설명한 것은?",
    code: "def get_user():\n    return 'Alice', 30",
    choices: [
      "두 값을 각각 따로 반환한다",
      "('Alice', 30)이라는 하나의 튜플을 반환한다",
      "['Alice', 30]이라는 리스트를 반환한다",
      "마지막 값 30만 반환한다",
    ],
    answer: "('Alice', 30)이라는 하나의 튜플을 반환한다",
    explanation:
      "Python 함수는 호출 한 번에 하나의 객체를 반환합니다. return 뒤에 값을 쉼표로 나열하면 Python이 그 값들을 튜플로 패킹하므로 실제 반환값은 ('Alice', 30) 하나입니다. 호출 측에서 name, age = get_user()처럼 받으면 이 튜플이 다시 언패킹됩니다.",
  },
  {
    id: "verified-return-single-tuple",
    category: "함수·스코프",
    kind: "단답형",
    question: "다음 함수가 반환하는 값을 Python 표현식 그대로 작성하시오.",
    code: "def wrap(value):\n    return value,\n\nprint(wrap(7))",
    answer: "(7,)",
    explanation:
      "튜플을 만드는 핵심 문법은 괄호가 아니라 쉼표입니다. return value,는 return (value,)와 같으므로 요소가 하나인 튜플 (7,)을 반환합니다. (7)은 괄호로 정수 표현식을 묶은 것일 뿐 튜플이 아닙니다.",
  },
  {
    id: "verified-tuple-packing",
    category: "문자열·시퀀스",
    kind: "단답형",
    question: "출력되는 자료형 이름과 패킹된 데이터를 표시 형식 그대로 작성하시오.",
    code: "data = 1, 'hello', 3.14\nprint(type(data).__name__, data)",
    answer: "tuple (1, 'hello', 3.14)",
    explanation:
      "쉼표로 여러 값을 나열하면 소괄호를 생략해도 튜플로 패킹됩니다. 따라서 data는 세 값을 가진 tuple 객체입니다. 괄호는 가독성을 높이지만 일반적인 튜플 생성에서 필수 조건은 아닙니다.",
  },
  {
    id: "verified-empty-set",
    category: "자료구조",
    kind: "객관식",
    question: "빈 세트를 생성하는 올바른 표현은?",
    choices: ["{}", "set()", "[]", "()"],
    answer: "set()",
    explanation:
      "{}는 빈 딕셔너리를 나타내는 문법으로 이미 사용됩니다. 따라서 빈 세트는 반드시 set()으로 생성해야 합니다. 내용이 있는 세트는 {1, 2}처럼 중괄호 표기를 사용할 수 있습니다.",
  },
  {
    id: "verified-set-remove-discard",
    category: "자료구조",
    kind: "객관식",
    question: "세트에 존재하지 않는 값을 삭제하려 할 때 예외를 발생시키지 않는 메서드는?",
    choices: ["remove", "discard", "pop", "clear"],
    answer: "discard",
    explanation:
      "remove(value)는 대상이 없으면 KeyError를 발생시키지만 discard(value)는 대상이 없어도 아무 작업 없이 종료합니다. 값의 존재가 보장되지 않는 상황에서는 discard가 안전하며, 오류를 통해 잘못된 상태를 발견해야 한다면 remove가 더 적절할 수 있습니다.",
  },
  {
    id: "verified-keyword-order",
    category: "함수·스코프",
    kind: "객관식",
    question: "다음 함수 호출 중 문법 오류가 발생하는 것은?",
    code: "def greet(name, age):\n    pass",
    choices: [
      "greet('Kim', 20)",
      "greet(name='Kim', age=20)",
      "greet(age=20, name='Kim')",
      "greet(age=20, 'Kim')",
    ],
    answer: "greet(age=20, 'Kim')",
    explanation:
      "호출에서 위치 인자는 키워드 인자보다 앞에 와야 합니다. 키워드로 age를 지정한 뒤 위치 인자 'Kim'을 쓰면 어느 매개변수에 대응하는지 문법적으로 허용되지 않습니다. 키워드 인자끼리는 정의 순서와 다르게 작성할 수 있습니다.",
  },
  {
    id: "verified-builtin-shadow",
    category: "함수·스코프",
    kind: "단답형",
    question: "마지막 줄을 실행할 때 발생하는 예외 클래스 이름만 정확히 작성하시오.",
    code: "print(sum([1, 2, 3]))\nsum = 5\nprint(sum([1, 2, 3]))",
    answer: "TypeError",
    explanation:
      "sum = 5를 실행하면 현재 전역 이름 sum이 내장 함수가 아니라 정수 5를 가리키게 됩니다. 마지막 줄은 정수 객체를 함수처럼 호출하려 하므로 TypeError가 발생합니다. list, str, id, type 같은 내장 이름도 변수명으로 덮어쓰지 않도록 주의해야 합니다.",
  },
  {
    id: "verified-setdefault",
    category: "자료구조",
    kind: "단답형",
    question: "다음 코드가 출력하는 딕셔너리를 Python 표현식 그대로 작성하시오.",
    code: "data = {'name': 'Alice'}\ndata.setdefault('country', 'KOREA')\nprint(data)",
    answer: "{'name': 'Alice', 'country': 'KOREA'}",
    explanation:
      "setdefault(key, default)는 키가 없으면 기본값을 딕셔너리에 실제로 추가한 뒤 그 값을 반환합니다. 키가 이미 있으면 기존 값을 반환하며 덮어쓰지 않습니다. 값을 조회만 하는 get과 달리 원본 딕셔너리를 변경할 수 있다는 점이 핵심입니다.",
  },
  {
    id: "verified-dict-update",
    category: "자료구조",
    kind: "단답형",
    question: "update 실행 후 딕셔너리의 값을 Python 표현식 그대로 작성하시오.",
    code: "data = {'name': 'Alice', 'age': 20}\ndata.update({'name': 'Jane', 'city': 'Seoul'})\nprint(data)",
    answer: "{'name': 'Jane', 'age': 20, 'city': 'Seoul'}",
    explanation:
      "update는 전달된 키가 원본에 있으면 값을 덮어쓰고, 없으면 새 키·값 쌍을 추가합니다. name은 Jane으로 변경되고 age는 유지되며 city가 추가됩니다. 메서드는 원본 딕셔너리를 변경하고 None을 반환합니다.",
  },
  {
    id: "verified-dict-pop",
    category: "자료구조",
    kind: "단답형",
    question: "두 print 문이 출력하는 값을 줄바꿈까지 동일하게 작성하시오.",
    code: "data = {'name': 'Alice', 'age': 25}\nprint(data.pop('age'))\nprint(data)",
    answer: "25\n{'name': 'Alice'}",
    explanation:
      "딕셔너리 pop(key)은 해당 키·값 쌍을 원본에서 제거하면서 제거된 값을 반환합니다. 따라서 첫 출력은 25이고 이후 딕셔너리에는 name만 남습니다. 없는 키에 기본값을 주지 않으면 KeyError가 발생합니다.",
  },
  {
    id: "verified-numeric-methods",
    category: "문자열·시퀀스",
    kind: "객관식",
    question: "문자열의 숫자 판별 범위를 좁은 것부터 넓은 것 순서로 올바르게 나열한 것은?",
    choices: [
      "isdecimal() → isdigit() → isnumeric()",
      "isnumeric() → isdigit() → isdecimal()",
      "isdigit() → isdecimal() → isnumeric()",
      "세 메서드의 판정 범위는 완전히 같다",
    ],
    answer: "isdecimal() → isdigit() → isnumeric()",
    explanation:
      "isdecimal은 0~9와 같은 십진수 문자 중심으로 가장 엄격하게 판정합니다. isdigit은 위첨자처럼 숫자 모양으로 취급되는 일부 문자를 더 포함하고, isnumeric은 분수·한자 숫자 등 수치 의미를 가진 문자까지 가장 넓게 포함합니다.",
  },
  {
    id: "verified-int-string-float",
    category: "연산자·형변환",
    kind: "객관식",
    question: "다음 중 ValueError가 발생하는 표현식은?",
    choices: ["int('3')", "float('3.5')", "int(3.5)", "int('3.5')"],
    answer: "int('3.5')",
    explanation:
      "int는 정수 형식의 문자열은 변환할 수 있지만 소수점이 포함된 문자열 '3.5'를 직접 정수로 해석하지 못합니다. int(3.5)는 이미 float인 값을 받아 소수점 아래를 버리고 3을 반환합니다. 문자열 실수는 먼저 float('3.5')로 변환할 수 있습니다.",
  },
];

const questionPolish: Record<string, Partial<Question>> = {
  "op-1": {
    question: "다음 표현식을 실행했을 때 출력되는 결과로 옳은 것을 고르시오.",
    explanation:
      "판단 과정: 정수 나눗셈(//)과 나머지(%)는 덧셈보다 우선하므로 각각 17 // 4 = 4, 17 % 4 = 1을 먼저 구합니다. 그다음 곱셈을 적용하면 1 × 2 = 2이고, 마지막으로 4 + 2를 계산해 6이 됩니다. 식을 왼쪽부터 무조건 계산하는 것이 아니라 우선순위별로 묶어 추적해야 합니다.",
  },
  "op-2": {
    question: "다음 코드를 실행했을 때 출력되는 값으로 옳은 것을 고르시오.",
    explanation:
      "판단 과정: 빈 문자열은 불리언 문맥에서 False로 평가됩니다. or는 왼쪽 피연산자가 falsy이면 오른쪽 피연산자를 평가하고 그 값을 그대로 반환하므로 결과는 문자열 'Python'입니다. and와 or가 항상 True 또는 False를 반환한다고 생각하기 쉬우나, Python에서는 결과를 결정한 피연산자 자체를 반환합니다.",
  },
  "op-is-1": {
    question: "두 객체를 비교하는 방법에 관한 설명으로 가장 정확한 것은?",
    explanation:
      "==는 두 객체가 표현하는 값이 같은지 확인하고, is는 두 변수가 완전히 동일한 객체를 가리키는지 확인합니다. 값 비교에는 일반적으로 ==를 사용합니다. None처럼 프로그램에서 하나만 존재하는 싱글턴 객체를 확인할 때는 is None을 사용하는 것이 수업자료의 권장 방식입니다.",
  },
  "op-is-2": {
    explanation:
      "a와 b는 내용이 [1, 2]로 같기 때문에 a == b는 True입니다. 하지만 각각 별도로 생성된 리스트이므로 a is b는 False입니다. c = a는 새로운 리스트를 복사한 것이 아니라 a의 참조를 c에 할당한 것이므로 a is c는 True입니다.",
  },
  "op-short-2": {
    question: "다음 코드를 실행했을 때 실제로 출력되는 내용을 정확히 작성하시오.",
    explanation:
      "and는 왼쪽 값이 falsy이면 오른쪽을 평가하지 않습니다. 따라서 check()는 호출되지 않아 '실행'은 출력되지 않고, False and ... 표현식의 결과인 False만 print에 전달됩니다. 함수 호출이나 연산이 생략될 수 있다는 점이 단락 평가의 핵심입니다.",
  },
  "op-short-3": {
    question: "다음 표현식 중 오른쪽의 check() 함수가 실제로 호출되는 것은?",
    explanation:
      "and는 왼쪽이 truthy일 때만 오른쪽 값을 확인해야 결과를 결정할 수 있습니다. 따라서 True and check()에서만 check()가 호출됩니다. 반대로 or는 왼쪽이 truthy이면 이미 전체 결과가 결정되므로 오른쪽을 실행하지 않습니다.",
  },
  "op-float-1": {
    question: "다음 비교가 예상과 다르게 False가 될 수 있는 원인으로 가장 정확한 것은?\n0.1 + 0.2 == 0.3",
    explanation:
      "컴퓨터는 실수를 제한된 비트의 이진 부동소수점으로 저장합니다. 0.1이나 0.2처럼 이진수로 정확히 끝나지 않는 값은 가장 가까운 값으로 근사되므로 연산 뒤 미세한 오차가 남을 수 있습니다. 수업자료에서는 정확한 10진 연산이 필요할 때 문자열을 Decimal에 전달하는 방법을 제시합니다.",
  },
  "seq-2": {
    question: "다음 중 실행 중에 내부 상태를 직접 변경할 수 있는 객체만 묶인 것은?",
    explanation:
      "list, dict, set은 생성된 객체의 내용을 그대로 둔 채 요소를 추가·삭제·교체할 수 있는 가변 객체입니다. str, tuple, range는 불변 객체이므로 변경처럼 보이는 연산을 수행하면 기존 객체가 바뀌는 것이 아니라 새 객체가 만들어집니다. 복사와 함수 인자 동작을 이해할 때 이 구분이 중요합니다.",
  },
  "seq-slice-copy": {
    kind: "서술형",
    choices: undefined,
    question: "중첩 리스트에서 b = a[:]를 실행했을 때 a와 b의 관계를 최상위 리스트와 내부 객체로 구분하고, 내부 객체를 변경할 경우의 결과까지 서술하시오.",
    answer:
      "a[:]는 최상위 리스트 객체만 새로 만드는 얕은 복사이므로 a is b는 False이다. 그러나 새 리스트의 각 요소에는 원본 요소와 동일한 객체 참조가 들어간다. 따라서 요소가 중첩 리스트처럼 변경 가능한 객체라면 a와 b가 그 내부 객체를 공유한다. b[0].append(...)처럼 내부 객체를 변경하면 a에서도 같은 변경이 보이지만, b 자체에 새 요소를 추가하는 최상위 변경은 a에 반영되지 않는다.",
    explanation:
      "a[:]는 바깥 리스트만 새로 생성하는 얕은 복사입니다. 따라서 a is b는 False지만, 두 리스트 안에 들어 있던 중첩 리스트 객체는 그대로 공유됩니다. 내부 리스트를 수정하면 양쪽에서 변화가 보일 수 있으며, 중첩 객체까지 분리하려면 copy.deepcopy()를 검토해야 합니다.",
  },
  "flow-break-else": {
    question: "다음 코드를 실행했을 때 출력되는 내용을 정확히 작성하시오.",
    explanation:
      "for문의 else는 반복문이 break로 중단되지 않고 정상적으로 끝났을 때 실행됩니다. 목록에는 짝수가 없어 break가 한 번도 실행되지 않으므로 반복이 끝난 뒤 '완료'가 출력됩니다. else가 단순히 if와 짝을 이루는 것이 아니라 반복문의 정상 종료 여부와 연결된다는 점이 핵심입니다.",
  },
  "func-1": {
    question: "다음 코드가 출력하는 두 값을 줄바꿈까지 동일하게 작성하시오.",
    explanation:
      "change 함수 안의 number = 25는 새로운 지역 변수를 만듭니다. 함수 내부에서는 가장 가까운 지역 이름을 찾아 25를 출력하지만, global 선언이 없으므로 전역 number에는 대입이 일어나지 않습니다. 함수 호출이 끝난 후 전역 number는 여전히 10입니다.",
  },
  "func-default-1": {
    question: "다음 중 SyntaxError 없이 정의할 수 있는 함수 선언은?",
    explanation:
      "위치 매개변수에서 기본값이 없는 매개변수는 기본값이 있는 매개변수보다 앞에 배치해야 합니다. 호출 시 어느 값이 어느 매개변수에 대응하는지 모호해지는 것을 막기 위한 문법 규칙입니다. 따라서 def func(a, b=1): 형태가 올바릅니다.",
  },
  "func-lebg-1": {
    question: "함수 내부에서 사용한 이름이 현재 지역에 없을 때 Python이 탐색하는 순서로 올바른 것은?",
    explanation:
      "Python은 먼저 현재 함수의 Local 영역을 확인하고, 중첩 함수라면 바깥 함수의 Enclosed 영역을 찾습니다. 이후 모듈 수준의 Global 영역, 마지막으로 len이나 print가 있는 Built-in 영역을 탐색합니다. 이 Local → Enclosed → Global → Built-in 순서의 머리글자를 LEGB라고 부릅니다.",
  },
  "func-nonlocal": {
    question: "다음 코드를 실행했을 때 출력되는 결과를 정확히 작성하시오.",
    explanation:
      "inner의 x += 1은 값을 읽는 동시에 다시 대입하는 연산입니다. nonlocal x가 있으므로 새 지역 변수를 만드는 대신 가장 가까운 바깥 함수 outer의 x를 수정합니다. 전역 변수를 대상으로 하는 global과 적용 범위가 다릅니다.",
  },
  "func-map-lazy": {
    question: "Python 3에서 map()이 반환하는 객체의 동작을 가장 정확히 설명한 것은?",
    explanation:
      "map은 입력 전체를 즉시 계산한 리스트가 아니라, 다음 값이 요청될 때 함수를 적용하는 iterator를 반환합니다. 이런 지연 평가는 불필요한 계산과 메모리 사용을 줄일 수 있지만 한 번 소비한 iterator를 다시 순회하면 값이 남아 있지 않을 수 있습니다. 여러 번 사용할 결과라면 list(map(...))처럼 명시적으로 저장할 수 있습니다.",
  },
  "data-1": {
    question: "다음 코드에서 result와 numbers에 저장된 값을 순서대로 작성하시오.",
    explanation:
      "append(2)는 numbers 객체 자체에 요소를 추가하는 원본 변경 메서드입니다. 이 메서드의 목적은 리스트 변경이므로 별도의 결과 리스트를 반환하지 않고 None을 반환합니다. 따라서 result는 None이고 numbers는 [3, 1, 4, 2]가 됩니다.",
  },
  "data-2": {
    question: "원본 리스트는 유지하면서 정렬된 새 리스트를 얻는 표현식은?",
    explanation:
      "sorted(numbers)는 전달받은 iterable을 기준으로 정렬된 새 리스트를 반환하며 원본 리스트를 변경하지 않습니다. 반면 numbers.sort()는 해당 리스트 자체를 정렬하고 None을 반환합니다. 원본 보존 여부와 반환값을 함께 구분해야 합니다.",
  },
  "data-copy-1": {
    question: "다음 코드를 실행한 뒤 원본 a의 값을 Python 표현식 그대로 작성하시오.",
    explanation:
      "a.copy()는 바깥 리스트만 복사하므로 a와 b는 서로 다른 최상위 리스트입니다. 하지만 첫 번째 요소인 내부 리스트 [1, 2]는 두 리스트가 동일한 객체를 공유합니다. b[0].append(9)는 공유된 내부 객체를 변경하므로 a에서도 9가 추가된 결과가 관찰됩니다.",
  },
  "data-method-chain": {
    kind: "서술형",
    choices: undefined,
    question: "다음 코드의 출력 결과를 제시하고, copy()와 sort()가 각각 반환하는 값 및 원본 numbers의 변경 여부를 포함하여 서술하시오.",
    answer:
      "출력 결과는 None이다. numbers.copy()는 numbers와 요소가 같은 새로운 리스트를 반환하므로 원본 numbers는 그대로 유지된다. 이어서 새 리스트의 sort()가 호출되어 복사본 자체는 정렬되지만, list.sort()는 정렬된 리스트를 반환하지 않고 None을 반환한다. 따라서 result에는 None이 저장되며 print(result)는 None을 출력한다. 원본 numbers의 값은 [3, 1, 2]로 변하지 않는다.",
    explanation:
      "numbers.copy()는 새로운 리스트를 반환하므로 그 객체에서 sort()가 호출됩니다. sort()는 복사된 리스트를 정상적으로 정렬하지만 반환값은 None입니다. 메서드 체이닝에서는 각 메서드가 무엇을 반환하는지 확인해야 하며, 원본이 바뀌었는지와 result에 무엇이 들어가는지는 별개의 문제입니다.",
  },
  "data-hash-1": {
    question: "다음 중 딕셔너리의 키로 직접 사용할 수 없는 객체는?",
    explanation:
      "딕셔너리 키는 저장된 동안 해시값이 변하지 않는 hashable 객체여야 합니다. list는 내용을 변경할 수 있어 해시값을 안정적으로 유지할 수 없으므로 키로 사용할 수 없습니다. 문자열, 정수, 그리고 해시 가능한 요소로만 구성된 튜플은 키로 사용할 수 있습니다.",
  },
  "oop-1": {
    question: "클래스 자체의 상태를 사용하도록 정의한 메서드의 선언 방식으로 올바른 것은?",
    explanation:
      "클래스 메서드는 @classmethod 데코레이터를 붙이고 첫 번째 인자로 호출 대상 클래스를 받습니다. 이 인자는 관례상 cls라고 작성하며, 클래스 변수 접근이나 대체 생성자 구현에 활용됩니다. self를 받는 인스턴스 메서드, 자동 인자가 없는 정적 메서드와 구분해야 합니다.",
  },
  "oop-method-role": {
    question: "인스턴스나 클래스의 상태를 자동으로 전달받지 않는 메서드에 대한 설명으로 올바른 것은?",
    explanation:
      "@staticmethod로 정의한 메서드는 호출 시 self나 cls를 자동으로 받지 않습니다. 클래스의 주제와 관련은 있지만 인스턴스·클래스 상태가 필요 없는 검증이나 계산 기능을 묶을 때 사용할 수 있습니다. 단순히 '일반 함수와 완전히 다르다'기보다 클래스 네임스페이스 안에 관련 기능을 배치한다는 의미가 큽니다.",
  },
  "oop-3": {
    kind: "서술형",
    choices: undefined,
    question: "다중 상속에서 Python이 메서드를 탐색하는 기준과 super()가 다음 호출 대상을 결정하는 방식을 단순한 직계 부모 호출과 구분하여 서술하시오.",
    answer:
      "Python은 다중 상속 관계를 바탕으로 각 클래스의 MRO(Method Resolution Order)를 계산하고 그 순서에 따라 메서드를 탐색한다. super()는 현재 클래스의 직계 부모 하나를 고정적으로 호출하는 표현이 아니라, 현재 클래스 다음에 위치한 MRO 항목으로 호출을 넘긴다. 따라서 여러 클래스가 같은 메서드에서 협력적으로 super()를 사용하면 MRO 순서대로 각 구현을 한 번씩 연결할 수 있다.",
    explanation:
      "Python은 클래스마다 Method Resolution Order, 즉 MRO라는 일관된 탐색 순서를 계산합니다. super()는 단순히 코드에 적힌 '직계 부모 하나'를 가리키는 것이 아니라 현재 클래스 다음의 MRO 항목으로 호출을 위임합니다. 다중 상속에서 모든 클래스가 협력적으로 super()를 사용해야 초기화 사슬이 끊기지 않습니다.",
  },
  "except-1": {
    question: "다음 코드가 출력하는 두 문구를 줄바꿈까지 동일하게 작성하시오.",
    explanation:
      "int('3.5')는 소수점이 포함된 문자열을 정수 리터럴로 해석할 수 없어 ValueError를 발생시킵니다. 해당 except가 예외를 처리해 '변환 오류'를 출력하고, finally는 정상 실행 여부와 관계없이 이어서 '종료'를 출력합니다. 예외가 처리되더라도 finally는 생략되지 않습니다.",
  },
  "except-order": {
    question: "여러 except 절에서 상위 예외 클래스를 먼저 작성했을 때 발생하는 문제는?",
    explanation:
      "ZeroDivisionError와 ValueError 등 대부분의 일반 예외는 Exception의 하위 클래스입니다. except Exception을 먼저 두면 이 예외들이 모두 그 절에서 처리되어 뒤의 구체적인 except에는 도달할 수 없습니다. 따라서 구체적인 예외부터 넓은 예외 순으로 작성해야 상황별 처리가 가능합니다.",
  },
  "except-eafp": {
    question: "예외 처리를 중심으로 먼저 연산을 시도하는 Python의 일반적 코딩 방식을 설명한 것은?",
    explanation:
      "EAFP는 먼저 원하는 연산을 실행하고 실패했을 때 발생한 예외를 처리하는 접근입니다. 반대로 LBYL은 실행 전에 조건을 검사합니다. 파일·딕셔너리 접근처럼 검사와 실제 실행 사이에 상태가 달라질 수 있는 상황에서는 EAFP가 더 간결하고 안전할 수 있지만, 예외를 정상 흐름 제어에 과도하게 사용하는 것은 피해야 합니다.",
  },
  "seq-1": {
    explanation:
      "슬라이스 text[1::2]에서 시작 인덱스는 1, 종료 인덱스는 생략되어 문자열 끝까지, 간격은 2입니다. developer의 인덱스 1, 3, 5, 7에 있는 문자를 차례대로 선택하면 e, e, o, e가 되어 eeoe가 출력됩니다. 종료 위치를 생략했다고 마지막 문자가 항상 포함되는 것은 아니며 step에 맞는 인덱스만 선택됩니다.",
  },
  "seq-3": {
    explanation:
      "먼저 strip()이 문자열 양끝의 공백을 제거해 'Code Review'를 만듭니다. lower()는 모든 영문자를 소문자로 바꿔 'code review'를 반환하고, replace(' ', '_')가 가운데 공백을 밑줄로 교체해 code_review를 만듭니다. 문자열은 불변이므로 각 메서드는 이전 결과를 직접 수정하지 않고 새 문자열을 반환합니다.",
  },
  "flow-1": {
    explanation:
      "range(1, 8)은 1부터 7까지 생성합니다. i가 3 또는 6이면 i % 3 == 0이 참이므로 continue가 실행되어 total += i를 건너뜁니다. 따라서 total에는 1, 2, 4, 5, 7만 더해지고 최종 합계는 19입니다. continue는 반복문 전체를 끝내는 break와 달리 현재 반복의 남은 코드만 생략합니다.",
  },
  "flow-3": {
    explanation:
      "i와 j는 각각 0, 1, 2를 가지므로 전체 조합은 3 × 3인 9개입니다. i == j인 (0, 0), (1, 1), (2, 2)에서는 continue로 count 증가를 건너뜁니다. 나머지 6개 조합에서만 count += 1이 실행되므로 최종 출력은 6입니다. 바깥 반복마다 제외되는 조합을 따로 추적하면 중첩 반복의 횟수를 정확히 계산할 수 있습니다.",
  },
  "data-3": {
    explanation:
      "반복문은 'a', 'b', 'a'를 차례로 처리합니다. counts.get(ch, 0)은 키가 없을 때 0을 반환하므로 첫 'a'는 1, 'b'는 1이 되고 두 번째 'a'에서 기존 값 1에 1을 더해 2가 됩니다. counts['a']는 2이며 존재하지 않는 'c'를 counts.get('c', -1)로 조회하면 지정한 기본값 -1이 반환됩니다.",
  },
  "data-4": {
    explanation:
      "range(7)은 0부터 6까지 생성합니다. 조건 if x % 2 == 0을 통과하는 값은 0, 2, 4, 6이고, 각 값을 x ** 2로 제곱해 0, 4, 16, 36을 만듭니다. 리스트 컴프리헨션은 조건을 통과한 순서를 유지하므로 최종 결과는 [0, 4, 16, 36]입니다.",
  },
  "oop-2": {
    explanation:
      "Dog 인스턴스에서 sound를 찾으면 Python은 인스턴스와 Dog 클래스를 먼저 확인합니다. Dog가 Animal의 sound와 같은 이름의 메서드를 다시 정의했으므로 부모 구현 대신 Dog.sound가 호출되어 '멍멍'을 반환합니다. 이를 메서드 오버라이딩이라고 하며, 부모 구현이 자동으로 함께 실행되는 것은 아닙니다.",
  },
  "except-multi": {
    explanation:
      "하나의 except 절에서 여러 예외 클래스를 처리하려면 예외 클래스들을 튜플로 묶어 except (ValueError, TypeError):처럼 작성합니다. or 표현식이나 리스트를 사용하는 문법이 아닙니다. 이 절은 두 예외 중 하나가 발생하면 실행되지만, 서로 다른 처리 과정이 필요하다면 except 절을 각각 분리하는 편이 명확합니다.",
  },
};

const basicIds = new Set([
  "op-3", "op-truthy-1", "seq-1", "seq-2", "seq-tuple-1", "seq-range-1",
  "flow-2", "flow-pass-1", "func-2", "func-default-1", "func-return-none",
  "data-1", "data-2", "data-set-1", "data-dict-view", "oop-1", "except-3",
  "verified-return-tuple", "verified-return-single-tuple", "verified-tuple-packing",
  "verified-empty-set", "verified-set-remove-discard", "verified-keyword-order",
  "verified-builtin-shadow", "verified-setdefault", "verified-dict-update",
  "verified-dict-pop", "verified-numeric-methods", "verified-int-string-float",
  "exam-animal-output", "exam-enumerate-blank", "exam-zip-blank",
]);
const hardIds = new Set([
  "op-is-2", "op-float-1", "seq-slice-copy", "flow-break-else", "func-lebg-1",
  "func-map-lazy", "data-copy-1", "data-method-chain", "data-hash-1", "oop-3",
  "except-order", "except-eafp",
  "exam-sequence-essay", "exam-comprehension-error-essay", "exam-shallow-copy-trace",
]);
const thinkingIds = new Set([
  "op-short-2", "op-short-3", "op-membership-1", "flow-3", "flow-while-1",
  "func-1", "func-unpack-1", "func-recursion", "data-alias-1", "data-extend",
  "oop-2", "oop-class-instance", "oop-namespace", "except-1", "except-else",
  "exam-nested-loop-matrix", "exam-dict-access-error", "exam-args-blank",
  "exam-class-instance-trace", "exam-try-else-finally", "exam-short-circuit-side-effect",
]);

const unsupportedIds = new Set(["op-chain-1", "func-nonlocal", "oop-init-return"]);
const explanationDetails: Record<string, string> = {
  "op-3": "int(value)는 계산에 사용할 새 정수만 만들 뿐 value가 가리키는 원래 문자열 객체를 변경하지 않습니다.",
  "flow-2": "continue 이후 문장은 실행되지 않지만 다음 반복은 계속된다는 점이 break와의 핵심 차이입니다.",
  "func-2": "global 없이 같은 이름에 대입하면 지역 변수가 새로 만들어지므로 전역 값은 바뀌지 않습니다.",
  "except-2": "Exception 같은 상위 클래스를 앞에 두면 하위 예외가 먼저 잡혀 세부 처리 절에 도달할 수 없습니다.",
  "op-truthy-1": "반대로 0이 아닌 수와 한 글자라도 포함한 문자열·컨테이너는 일반적으로 truthy로 평가됩니다.",
  "op-membership-1": "딕셔너리에 in을 사용하면 값이 아니라 키의 존재 여부를 검사하므로 'Kim'은 값으로 존재해도 False입니다.",
  "seq-index-1": "text[::-1]은 step을 -1로 지정하므로 마지막 문자부터 첫 문자까지 역순으로 선택합니다.",
  "seq-tuple-1": "[1,]은 리스트이고 {1,}은 세트이므로 쉼표와 사용된 구분 기호를 함께 확인해야 합니다.",
  "seq-range-1": "음수 step에서는 작은 방향으로 이동하며 종료값 0은 포함하지 않아 5, 3, 1까지만 생성됩니다.",
  "seq-method-1": "find는 대상이 없을 때 -1을 반환하지만 index는 ValueError를 발생시키므로 실패 방식이 다릅니다.",
  "seq-string-immutable": "반환값을 다시 저장하지 않으면 원래 문자열은 그대로이며 호출만으로 값이 바뀌지 않습니다.",
  "flow-pass-1": "pass는 실행 흐름을 이동시키지 않으므로 continue나 break와 구별해야 합니다.",
  "flow-while-1": "각 반복에서 n을 먼저 2만큼 감소시킨 뒤 저장하므로 조건 확인 당시 값과 저장되는 값이 다릅니다.",
  "flow-enumerate": "start=1은 인덱스의 시작 번호만 바꾸며 원본 요소나 순서는 변경하지 않습니다.",
  "flow-zip": "zip은 가장 짧은 iterable이 끝나는 즉시 종료하므로 숫자 3은 짝을 얻지 못해 제외됩니다.",
  "func-args-1": "인자가 없어도 args는 빈 튜플이며, 별표는 여러 위치 인자를 하나의 튜플로 패킹합니다.",
  "func-kwargs-1": "키워드 인자의 이름은 딕셔너리 키가 되고 전달한 값은 대응하는 값으로 저장됩니다.",
  "func-unpack-1": "별표가 붙은 middle은 남는 요소를 리스트로 모으고 first와 last는 양끝 요소를 받습니다.",
  "func-return-none": "함수 끝까지 도달하면 암묵적으로 return None을 실행한 것과 같은 결과가 됩니다.",
  "func-recursion": "기저 조건이 있어도 재귀 인자가 조건에 가까워지지 않으면 종료되지 않으므로 도달 가능성도 확인해야 합니다.",
  "data-alias-1": "b = a는 복사본이 아니라 동일한 리스트 참조를 저장하므로 b의 append 결과가 a에도 나타납니다.",
  "data-extend": "append는 리스트 전체를 한 요소로 넣고 extend는 iterable의 각 요소를 차례대로 추가합니다.",
  "data-remove-pop": "인자를 생략한 pop()은 마지막 요소를 제거해 반환하지만 remove에는 삭제할 값을 전달해야 합니다.",
  "data-set-1": "집합은 동등한 요소를 하나만 유지하므로 입력 개수와 최종 원소 개수가 달라질 수 있습니다.",
  "data-set-op": "대칭 차집합은 한쪽에만 있는 원소, 차집합은 왼쪽에만 있는 원소를 구합니다.",
  "data-dict-view": "keys()는 키만 제공하지만 items()는 각 항목을 (키, 값) 튜플로 제공해 두 변수로 언패킹할 수 있습니다.",
  "data-get-bracket": "get의 두 번째 인자는 키가 없을 때 반환할 기본값이며 딕셔너리에 새 키를 추가하지 않습니다.",
  "oop-class-instance": "p1의 인스턴스 속성은 클래스 변수를 가리지만 p2는 계속 클래스의 species 값을 찾습니다.",
  "oop-super-1": "부모 초기화가 먼저 실행된 뒤 자식의 추가 계산이 수행되므로 속성값을 호출 순서대로 추적해야 합니다.",
  "oop-namespace": "부모가 여러 개라면 단순 선언 순서가 아니라 클래스에 계산된 MRO를 따라 탐색합니다.",
  "oop-magic": "__repr__도 표현에 관여하지만 print는 우선 __str__을 사용해 사람이 읽을 문자열을 얻습니다.",
  "except-else": "else에 후속 코드를 분리하면 try 범위가 불필요하게 넓어져 엉뚱한 예외까지 잡는 일을 줄일 수 있습니다.",
  "except-as": "type(error).__name__은 예외 객체의 클래스 이름을 문자열로 얻으므로 IndexError가 출력됩니다.",
  "generated-op-0": "곱셈·나눗셈·나머지는 덧셈보다 우선하며 같은 우선순위는 왼쪽에서 오른쪽으로 계산합니다.",
  "generated-slice-0": "종료값을 생략하면 끝까지 진행하지만 step 간격에 맞는 인덱스의 문자만 포함됩니다.",
  "generated-loop-0": "continue가 실행된 반복에서는 누적문이 생략되므로 제외되는 값과 더해지는 값을 분리해 추적해야 합니다.",
  "generated-function-0": "조건식이 먼저 홀수만 남기고 표현식이 값을 변환하므로 필터링과 변환 순서를 구분해야 합니다.",
  "generated-dict-0": "get(item, 0)은 처음 등장한 키에 0을 주고 이후에는 저장된 누적값을 읽어 1씩 증가시킵니다.",
  "generated-exception-0": "예외는 표현식을 평가하는 즉시 발생하며 이후 문장은 실행되지 않고 except 절로 이동합니다.",
  "generated-oop-0": "인스턴스에 value가 없으면 자식 클래스를 부모보다 먼저 확인하므로 자식 값이 선택됩니다.",
};
const rawQuestionBank = [
  ...baseQuestions,
  ...conceptQuestions,
  ...generatedQuestions,
  ...examStyleQuestions,
  ...verifiedFundamentalQuestions,
].filter((question) => !unsupportedIds.has(question.id));

export const legacyQuestionBank = rawQuestionBank.map((question) => ({
  ...question,
  ...questionPolish[question.id],
  explanation: `${questionPolish[question.id]?.explanation ?? question.explanation}${
    explanationDetails[question.id] ? ` ${explanationDetails[question.id]}` : ""
  }`,
  difficulty: basicIds.has(question.id)
    ? "기초" as const
    : hardIds.has(question.id)
      ? "고난도" as const
      : thinkingIds.has(question.id)
        ? "사고형" as const
        : "핵심" as const,
}));
*/

const Q = (
  id: string,
  category: Category,
  kind: Kind,
  difficulty: Difficulty,
  question: string,
  answer: string,
  explanation: string,
  code?: string,
  choices?: string[],
): Question => {
  return { id, category, kind, difficulty, question, answer, explanation, code, choices };
};

type ExplanationGuide = {
  category: Category;
  pattern: RegExp;
  concept: string;
  caution: string;
};

const detailedExplanationCategories = new Set<Category>(categories.slice(3));

const categoryExplanationFallback: Partial<Record<Category, Pick<ExplanationGuide, "concept" | "caution">>> = {
  "ML 기초·검증": {
    concept: "머신러닝 문제는 데이터의 역할, 학습 목표, 평가 지표를 분리해서 보면 이해하기 쉽습니다. 훈련 데이터는 파라미터 학습, validation 데이터는 모델 선택, test 데이터는 최종 일반화 성능 확인에 사용합니다.",
    caution: "훈련 성능이 좋다는 사실만으로 새 데이터에서도 좋다고 결론 내리면 안 됩니다. 문제 유형과 데이터 분포에 맞는 지표를 고르고, 전처리와 모델 선택이 test 정보에 영향을 받지 않았는지 확인해야 합니다.",
  },
  "회귀·신경망": {
    concept: "입력에서 예측값을 계산하는 순전파, 예측과 정답의 차이를 수치화하는 손실, 연쇄법칙으로 gradient를 구하는 역전파, 파라미터를 갱신하는 optimizer를 하나의 흐름으로 연결해 보세요.",
    caution: "수식은 기호만 외우기보다 각 항의 shape와 역할을 확인해야 합니다. loss 계산과 파라미터 갱신은 다른 단계이며, 평가 단계에서는 gradient 계산과 파라미터 변경을 수행하지 않습니다.",
  },
  "NLP·Transformer": {
    concept: "텍스트는 token과 id로 변환된 뒤 embedding을 거쳐 벡터 시퀀스가 됩니다. 이후 모델은 문맥 표현을 만들고, 목적에 따라 분류·복원·다음 token 예측 등의 출력과 loss를 계산합니다.",
    caution: "모델 구조, attention의 정보 출처, mask의 목적, 사전학습 목표를 서로 섞지 마세요. 같은 Transformer라도 encoder-only, decoder-only, encoder-decoder는 볼 수 있는 문맥과 적합한 작업이 다릅니다.",
  },
  "LLM·평가·안전": {
    concept: "LLM 시스템은 사전학습 목표, 지시 적응, 디코딩, 외부 지식 연결, 평가와 안전 통제를 분리해서 이해해야 합니다. 한 단계의 성능이 좋아도 전체 시스템의 사실성이나 안전성이 자동으로 보장되지는 않습니다.",
    caution: "perplexity나 자동 지표 하나를 전체 품질로 해석하지 마세요. 실제 목적에 맞는 데이터와 지표, 고정된 평가 절차, 사람 검토 및 운영상 권한 제한을 함께 설계해야 합니다.",
  },
  "CNN·이미지 모델": {
    concept: "CNN은 국소 연결과 가중치 공유로 공간 패턴을 효율적으로 학습합니다. 문제를 풀 때는 입력과 출력의 N·C·H·W, 커널 크기, stride, padding, 채널 수를 먼저 표시하면 shape와 계산량을 안정적으로 추적할 수 있습니다.",
    caution: "파라미터 수, activation memory, FLOPs는 서로 다른 양입니다. 공간 크기를 줄이면 계산량은 감소하지만 세밀한 위치 정보가 손실될 수 있고, 층이 깊어지면 수용영역과 특징의 추상성이 함께 커집니다.",
  },
  "ViT·학습 전략": {
    concept: "ViT는 이미지를 patch token으로 바꾸고 위치 정보를 더한 뒤 self-attention으로 patch 사이 관계를 학습합니다. 구조 자체와 초기화·정규화·증강·학습률 같은 훈련 전략을 구분해 이해하세요.",
    caution: "학습 기법은 항상 같은 효과를 내는 만능 규칙이 아닙니다. 데이터 크기, 사전학습 조건, train/validation 곡선과 입력 전처리를 함께 보고 선택하며 test set은 최종 확인 전까지 분리해야 합니다.",
  },
};

const explanationGuides: ExplanationGuide[] = [
  { category: "ML 기초·검증", pattern: /Precision|Recall|F1|정확도|혼동행렬|TP|FP|FN|TN/, concept: "혼동행렬은 실제 class와 예측 class의 조합을 TP·FP·FN·TN으로 나눕니다. Precision은 양성이라고 예측한 것 중 실제 양성의 비율이고, Recall은 실제 양성 중 찾아낸 비율입니다.", caution: "불균형 데이터에서는 다수 class만 맞혀도 accuracy가 높을 수 있습니다. FP 비용과 FN 비용 중 무엇이 더 큰지 먼저 판단한 뒤 precision, recall, specificity, F1 등을 선택해야 합니다." },
  { category: "ML 기초·검증", pattern: /validation|test|hold-out|K-fold|LOOCV|fold|과적합|과소적합|일반화/, concept: "일반화 성능은 학습에 사용하지 않은 데이터에서 측정합니다. K-fold는 각 fold를 한 번씩 validation으로 사용하고 결과를 합쳐 단일 hold-out 분할의 우연성을 줄입니다.", caution: "validation으로 반복 선택한 모델을 같은 validation 점수만으로 최종 성능이라고 보고하면 낙관적 편향이 생깁니다. test set은 모든 선택이 끝난 뒤 한 번 사용하는 것이 원칙입니다." },
  { category: "ML 기초·검증", pattern: /MSE|RMSE|R²|오차/, concept: "MSE는 잔차 제곱의 평균이고 RMSE는 그 제곱근이므로 목표값과 같은 단위로 해석할 수 있습니다. R²는 평균 예측을 기준으로 모델이 상대적으로 얼마나 변동을 설명했는지 나타냅니다.", caution: "MSE와 RMSE는 절대 오차 규모, R²는 baseline 대비 상대 성능을 말합니다. test R²는 음수가 될 수 있으며, 이는 평균으로 예측하는 단순 기준보다도 성능이 나쁘다는 뜻입니다." },
  { category: "ML 기초·검증", pattern: /K-means|군집|StandardScaler|비지도|계층/, concept: "군집화는 label 없이 거리나 유사성을 기준으로 구조를 찾습니다. K-means는 중심과 할당을 반복하고, 응집형 계층 군집은 가까운 군집을 차례로 병합해 덴드로그램을 만듭니다.", caution: "거리 기반 결과는 feature scale, 거리 정의, 초기값과 linkage에 민감합니다. 군집 번호 자체에는 의미가 없으므로 안정성, 분리 정도와 도메인 해석을 함께 확인해야 합니다." },
  { category: "ML 기초·검증", pattern: /feature|label|지도|분류|회귀|상관|명목형|one-hot|ε/, concept: "지도학습은 feature X에서 label Y를 예측하는 관계를 학습합니다. 회귀는 연속값, 분류는 범주를 예측하며 범주형 입력은 모델이 임의의 크기 순서로 해석하지 않도록 적절히 인코딩해야 합니다.", caution: "상관관계만으로 인과관계를 단정할 수 없고, 관측되지 않은 교란 요인과 측정오차가 있을 수 있습니다. 데이터 표현이 실제 의미와 일치하는지 먼저 확인하세요." },

  { category: "회귀·신경망", pattern: /선형회귀|회귀계수|최소제곱|정규방정식|다중공선성|RSE|t 통계량/, concept: "선형회귀는 입력의 선형결합으로 조건부 평균을 근사하고 잔차 제곱합을 최소화해 계수를 추정합니다. 표준오차와 t 통계량은 추정치가 표본 변화에 얼마나 민감한지 판단하는 데 사용합니다.", caution: "큰 계수나 높은 R²만으로 변수의 인과적 중요성을 결론 내리면 안 됩니다. 다중공선성이 강하면 예측은 가능해도 개별 계수와 유의성 해석이 불안정해질 수 있습니다." },
  { category: "회귀·신경망", pattern: /로지스틱|sigmoid|softmax|교차엔트로피|one-hot/, concept: "로지스틱 회귀는 선형 점수를 sigmoid로 변환해 이진 class 확률을 만듭니다. 다중분류에서는 softmax가 class별 확률을 만들고 one-hot 정답의 교차엔트로피는 정답 class 확률의 -log 값으로 줄어듭니다.", caution: "모델 이름에 회귀가 들어가도 로지스틱 회귀의 기본 용도는 분류입니다. 확률과 최종 class는 같지 않으며 threshold 또는 argmax 같은 결정 규칙이 추가로 필요합니다." },
  { category: "회귀·신경망", pattern: /ReLU|Leaky|활성화|깊이|표현력|sigmoid/, concept: "활성화 함수는 선형층 사이에 비선형성을 넣어 복잡한 함수를 표현하게 합니다. ReLU는 양수에서 기울기 1, 음수에서 0이며 Leaky ReLU는 음수 구간에도 작은 기울기를 남깁니다.", caution: "활성화 없이 선형층만 여러 개 쌓으면 전체가 하나의 선형변환과 같습니다. sigmoid 반복은 포화 구간의 작은 미분값 때문에 깊은 층에서 기울기 소실을 일으킬 수 있습니다." },
  { category: "회귀·신경망", pattern: /gradient|경사하강|mini-batch|full-batch|학습률|optimizer|Grid Search|Random Search/, concept: "경사하강법은 현재 손실의 gradient 반대 방향으로 파라미터를 이동합니다. Mini-batch는 전체 데이터 gradient의 근사값을 사용해 메모리와 계산 효율을 얻는 대신 update에 잡음이 생깁니다.", caution: "학습률이 너무 크면 최솟값을 지나쳐 진동하거나 발산하고, 너무 작으면 수렴이 지나치게 느립니다. 탐색 결과는 validation으로 비교하고 test를 하이퍼파라미터 선택에 사용하지 않습니다." },
  { category: "회귀·신경망", pattern: /역전파|계산 그래프|연쇄법칙|PyTorch|nn\.Module|forward|zero_grad|backward|step|shape|파라미터 수/, concept: "순전파가 계산 그래프와 손실을 만들면 역전파는 출력에서 입력 방향으로 국소 미분을 곱해 각 파라미터의 gradient를 구합니다. PyTorch에서는 gradient 초기화, 순전파, loss, backward, optimizer step 순서를 지킵니다.", caution: "행렬곱은 안쪽 차원이 같아야 하며 bias도 학습 파라미터에 포함됩니다. 이전 batch의 gradient가 누적되지 않도록 zero_grad를 수행하고, backward와 step의 역할을 구분하세요." },

  { category: "NLP·Transformer", pattern: /one-hot|embedding|Skip-gram|CBOW|분포 가설|subword|tokenization|어휘 크기/, concept: "One-hot은 단어 사이 유사성을 표현하지 못하지만 embedding은 학습 가능한 밀집 벡터로 의미·문맥 관계를 담을 수 있습니다. CBOW는 주변 문맥으로 중심 단어를, Skip-gram은 중심 단어로 주변 단어를 예측합니다.", caution: "embedding 행렬의 첫 차원은 어휘 크기 V, 둘째는 벡터 차원 d입니다. Subword는 희귀어를 조각으로 표현해 OOV를 줄이지만 token 수가 늘어날 수 있습니다." },
  { category: "NLP·Transformer", pattern: /RNN|LSTM|GRU|hidden|gradient|장기 의존성/, concept: "RNN은 이전 hidden state와 현재 입력을 결합해 순차적으로 상태를 갱신합니다. LSTM과 GRU의 gate는 어떤 정보를 유지·갱신할지 조절해 기본 RNN의 장기 의존성 학습을 돕습니다.", caution: "시간축으로 같은 변환과 미분이 반복되면 gradient가 매우 작아지거나 커질 수 있습니다. Gate가 문제를 완전히 제거하는 것은 아니며 긴 시퀀스의 순차 계산 비용도 남습니다." },
  { category: "NLP·Transformer", pattern: /Seq2Seq|teacher forcing|encoder-decoder|cross-attention|attention이 필요한/, concept: "Encoder-decoder 구조는 입력을 표현으로 바꾸고 decoder가 출력을 순차 생성합니다. Attention은 매 출력 시점에 encoder의 여러 위치를 다시 조회해 하나의 고정 벡터에 모든 정보를 압축하는 병목을 줄입니다.", caution: "Teacher forcing은 학습 때 이전 정답 token을 입력하지만 추론 때는 모델의 이전 예측을 사용합니다. 이 차이로 exposure bias가 생길 수 있으며, cross-attention의 Q는 decoder, K와 V는 encoder 출력에서 옵니다." },
  { category: "NLP·Transformer", pattern: /self-attention|Q, K, V|Scaled|multi-head|causal mask|위치|residual/, concept: "Attention은 Q와 K의 유사도로 가중치를 만들고 그 가중치로 V를 합칩니다. √d_k로 나누면 내적 크기가 커져 softmax가 지나치게 포화되는 현상을 완화하며, 여러 head는 서로 다른 관계를 병렬로 학습합니다.", caution: "Self-attention만으로 token 순서는 자동 표현되지 않아 위치 정보가 필요합니다. Causal mask는 미래 token을 가리고, padding mask는 실제 입력이 아닌 padding 위치의 영향을 막습니다." },
  { category: "NLP·Transformer", pattern: /BERT|MLM|T5|span corruption|N-gram|Transformer의 시퀀스/, concept: "BERT는 양방향 encoder와 MLM으로 입력 이해 표현을 학습합니다. T5는 손상된 span을 sentinel token으로 바꾸고 decoder가 원문 구간을 복원하는 text-to-text 목표를 사용합니다.", caution: "N-gram은 짧은 고정 문맥과 빈도에 의존해 희소성과 장거리 관계에 약합니다. 사전학습 목표가 다르면 같은 Transformer 계열이라도 사용할 수 있는 문맥과 적합한 작업이 달라집니다." },

  { category: "LLM·평가·안전", pattern: /Foundation|Scaling|emergent|사전학습|자기회귀/, concept: "Foundation model은 대규모 데이터로 넓은 능력을 사전학습한 뒤 여러 작업에 적응합니다. 자기회귀 언어모델은 앞선 token을 조건으로 다음 token의 확률을 높이며, 규모 증가에 따른 성능은 데이터·모델·계산량의 균형에 좌우됩니다.", caution: "규모가 커진다고 모든 능력이 단조롭게 좋아지거나 안전해지는 것은 아닙니다. Emergent ability는 평가 척도와 threshold 때문에 갑자기 나타난 것처럼 보일 수도 있어 연속적인 지표로 재검증해야 합니다." },
  { category: "LLM·평가·안전", pattern: /SFT|RLHF|Reward|KL|in-context|fine-tuning/, concept: "SFT는 지시-모범응답 쌍으로 원하는 행동을 지도학습하고, reward model은 응답 선호 순서를 학습합니다. RLHF의 policy 단계는 reward를 높이되 기준 모델에서 지나치게 멀어지지 않도록 KL 제약을 사용할 수 있습니다.", caution: "In-context learning은 prompt 안의 예시를 활용할 뿐 weight를 바꾸지 않습니다. Fine-tuning은 파라미터를 갱신하므로 비용과 데이터 품질, 망각과 안전성 변화까지 평가해야 합니다." },
  { category: "LLM·평가·안전", pattern: /temperature|beam search|top-p|top-k|디코딩/, concept: "Temperature는 확률분포의 평평함을 조절하고, greedy는 매 단계 최고 확률 하나, beam search는 여러 누적 후보를 유지합니다. Top-k는 후보 수를 고정하고 top-p는 누적 확률에 따라 후보 수를 바꿉니다.", caution: "디코딩 전략은 생성 다양성과 안정성을 바꾸지만 사실성을 보장하지 않습니다. 같은 모델도 prompt, seed, temperature와 후보 제한 방식이 달라지면 결과와 평가 점수가 달라질 수 있습니다." },
  { category: "LLM·평가·안전", pattern: /perplexity|BLEU|ROUGE|Judge|평가|benchmark|cosine|유사도/, concept: "평가 지표는 서로 다른 속성을 측정합니다. Perplexity는 token 확률, BLEU·ROUGE는 기준 문장과의 겹침, embedding 유사도는 벡터 방향의 가까움을 주로 반영합니다.", caution: "자동 지표는 사실성·유용성·안전을 완전히 설명하지 못합니다. 평가 데이터 오염, judge의 위치·길이·자기선호 편향, 표본 대표성과 평가 절차의 재현성을 함께 점검해야 합니다." },
  { category: "LLM·평가·안전", pattern: /환각|RAG|jailbreak|안전|사내 지식/, concept: "RAG는 검색된 외부 근거를 생성 context에 넣어 최신성·근거 연결을 돕습니다. 안전은 모델의 답변 문구뿐 아니라 검색 권한, 도구 실행 권한과 출력 검증까지 포함한 시스템 문제입니다.", caution: "검색 결과가 틀리거나 비어 있으면 RAG도 잘못된 답을 만들 수 있습니다. Jailbreak는 단일 금지 문구로 완전히 막기 어려우므로 최소 권한, 입력 분리, 검증, 모니터링과 공격 평가를 겹쳐 적용해야 합니다." },
  { category: "LLM·평가·안전", pattern: /System prompt|프롬프트 구성|모호성/, concept: "프롬프트는 역할과 작업, 입력 데이터의 경계, 제약 조건과 출력 형식을 분리해 제시할수록 해석의 모호성이 줄어듭니다. 필요한 경우 실제 입력과 비슷한 예시를 일관된 정답 형식으로 제공합니다.", caution: "System prompt는 일반 사용자 지시보다 높은 우선순위의 동작 기준이지만 보안 경계 자체는 아닙니다. 민감한 작업은 prompt만 믿지 말고 권한 검사와 입출력 검증을 코드에서 수행해야 합니다." },

  { category: "CNN·이미지 모델", pattern: /출력 너비|출력 공간|파라미터 수|shape|채널 수|비용|비율/, concept: "합성곱 출력 한 축은 floor((입력-커널+2×패딩)/stride)+1로 계산합니다. 가중치 수는 출력채널×입력채널×커널높이×커널너비이며 bias를 쓰면 출력채널 수만큼 더합니다.", caution: "출력 shape 계산과 파라미터 수 계산을 섞지 마세요. 파라미터 수는 보통 입력 이미지의 H·W와 무관하지만 FLOPs와 activation memory는 출력 공간 크기에 크게 영향을 받습니다." },
  { category: "CNN·이미지 모델", pattern: /국소|가중치 공유|완전연결|ReLU|pooling|해상도|수용영역/, concept: "국소 연결은 가까운 픽셀 패턴을 보고 가중치 공유는 같은 필터를 모든 위치에 적용합니다. 층을 쌓으면 수용영역이 넓어지고 저수준 모서리·질감이 더 추상적인 물체 부분과 형태로 결합됩니다.", caution: "Pooling과 stride는 계산을 줄이고 위치 변화에 강하게 만들 수 있지만 세밀한 좌표 정보를 잃을 수 있습니다. ReLU는 비선형성을 추가할 뿐 공간 크기를 자동으로 줄이지 않습니다." },
  { category: "CNN·이미지 모델", pattern: /AlexNet|VGG|degradation|ResNet|Residual|bottleneck/, concept: "VGG는 작은 3×3 합성곱을 규칙적으로 쌓고, ResNet은 F(x)+x shortcut으로 깊은 모델의 최적화를 돕습니다. Bottleneck은 1×1 층으로 채널을 조절해 3×3 연산 비용을 줄입니다.", caution: "Degradation은 깊은 plain network의 훈련 오차까지 나빠지는 최적화 문제이므로 일반적인 과적합과 다릅니다. Residual 덧셈 전에는 두 경로의 shape를 맞춰야 합니다." },
  { category: "CNN·이미지 모델", pattern: /MobileNet|Depthwise|pointwise|separable/, concept: "Depthwise convolution은 입력 채널별로 공간 필터를 적용하고, 1×1 pointwise convolution은 채널 정보를 섞어 출력 채널을 만듭니다. 두 단계를 분리해 standard convolution보다 계산량을 크게 줄입니다.", caution: "Depthwise 단계만으로는 채널 사이 정보를 충분히 결합하지 못합니다. 효율 향상은 채널 수와 공간 크기에 따라 달라지며 실제 속도는 하드웨어 구현의 영향도 받습니다." },
  { category: "CNN·이미지 모델", pattern: /계산 자원|activation|FLOPs|메모리|효율적인 이유|비교/, concept: "파라미터는 저장할 학습 가중치, activation은 순전파와 역전파 중 보관하는 중간 feature map, FLOPs는 연산량을 나타냅니다. 세 값은 모델의 서로 다른 자원 병목을 설명합니다.", caution: "파라미터가 적다고 항상 빠르거나 메모리를 적게 쓰는 것은 아닙니다. 큰 feature map은 작은 커널이라도 많은 activation과 연산을 만들 수 있으므로 층별 shape를 함께 봐야 합니다." },

  { category: "ViT·학습 전략", pattern: /patch|token 수|Q, K, V|위치|positional|Swin|window|장거리|전역/, concept: "ViT는 H×W 이미지를 P×P patch로 나눠 (H/P)×(W/P)개의 token을 만듭니다. Self-attention은 patch 간 전역 관계를 직접 연결하지만 순서가 없으므로 위치 정보를 별도로 더합니다.", caution: "입력 해상도가 바뀌면 patch 수와 absolute positional embedding 길이가 달라질 수 있습니다. Window attention은 효율적이지만 창 사이 연결이 약해 shifted window 같은 보완이 필요합니다." },
  { category: "ViT·학습 전략", pattern: /ViT|DeiT|teacher|student|사전학습|linear probing|fine-tuning/, concept: "ViT는 CNN보다 locality 같은 inductive bias가 약해 대규모 사전학습의 이점을 크게 받을 수 있습니다. Linear probing은 backbone을 고정해 특징 품질을 보고, fine-tuning은 일부 또는 전체 weight를 낮은 학습률로 적응시킵니다.", caution: "작은 데이터에서 처음부터 학습하면 과적합이나 불안정성이 커질 수 있습니다. 사전학습 때 사용한 입력 크기·정규화와 새 데이터의 분포 차이를 확인하고 validation으로 적응 범위를 선택해야 합니다." },
  { category: "ViT·학습 전략", pattern: /활성화|Sigmoid|tanh|ReLU|Leaky|dying/, concept: "비선형 활성화는 여러 선형층의 합성이 하나의 선형변환으로 축약되지 않게 합니다. ReLU는 계산이 단순하지만 음수 영역의 기울기가 0이고, Leaky ReLU는 작은 음수 기울기를 남깁니다.", caution: "Sigmoid와 tanh는 큰 절댓값 입력에서 포화되어 미분값이 0에 가까워질 수 있습니다. 활성화 선택은 초기화와 함께 보아야 하며 모든 층에 무조건 같은 함수가 최선은 아닙니다." },
  { category: "ViT·학습 전략", pattern: /초기화|Xavier|He|대칭|Residual branch/, concept: "무작위 초기화는 같은 층 뉴런의 대칭을 깨고, Xavier와 He 초기화는 층을 지나는 신호와 gradient의 분산을 안정적으로 유지하려는 방법입니다. He는 ReLU 계열 특성을 고려합니다.", caution: "모든 weight를 0으로 두면 같은 뉴런들이 동일한 gradient를 받아 다른 특징을 배우지 못합니다. Residual branch를 0에 가깝게 시작하는 전략은 전체 block이 identity에 가깝게 시작한다는 별도의 의도입니다." },
  { category: "ViT·학습 전략", pattern: /L1|L2|Dropout|정규화|augmentation|학습률|Cosine|validation loss|early stopping/, concept: "정규화와 augmentation은 과적합을 줄이고, learning-rate schedule과 early stopping은 최적화 진행을 제어합니다. Dropout은 훈련 중 unit을 확률적으로 끄고 inverted 방식은 살아남은 값을 1/(1-p)로 조정합니다.", caution: "훈련 loss 감소와 validation loss 상승이 함께 나타나면 과적합 신호입니다. 정규화 강도, 증강과 중단 시점은 validation으로 고르고 test 결과를 보며 반복 조정하지 않습니다." },
];

const easyCategoryExplanation: Partial<Record<Category, Pick<ExplanationGuide, "concept" | "caution">>> = {
  "ML 기초·검증": {
    concept: "쉽게 말하면, 모델은 여러 예시를 보고 규칙을 익힌 뒤 처음 보는 데이터에 답을 내는 프로그램입니다. 그래서 연습할 때 쓴 데이터와 실력을 확인할 데이터를 나누어야 합니다.",
    caution: "연습 문제를 잘 푼 것과 처음 보는 문제를 잘 푸는 것은 다릅니다. 훈련 점수만 보고 모델이 좋다고 판단하지 마세요.",
  },
  "회귀·신경망": {
    concept: "쉽게 말하면, 신경망은 입력값을 여러 단계의 계산에 통과시켜 답을 만듭니다. 답이 틀린 만큼 각 계산을 조금씩 고치고, 이 과정을 반복하면서 성능을 높입니다.",
    caution: "예측값을 만드는 과정과 틀린 정도를 계산하는 과정, 실제 숫자를 고치는 과정을 한꺼번에 섞어 생각하지 마세요.",
  },
  "NLP·Transformer": {
    concept: "쉽게 말하면, 컴퓨터는 문장을 그대로 읽지 못하므로 먼저 단어 조각을 번호와 숫자 묶음으로 바꿉니다. 그다음 주변 단어와의 관계를 살펴 문장의 뜻을 파악합니다.",
    caution: "단어를 숫자로 바꾸는 단계와 문맥을 이해하는 단계는 서로 다릅니다. 같은 단어도 주변 문장에 따라 다른 뜻을 가질 수 있습니다.",
  },
  "LLM·평가·안전": {
    concept: "쉽게 말하면, LLM은 앞에 나온 글을 보고 다음에 올 말을 고르는 일을 아주 많이 연습한 모델입니다. 자연스럽게 말하는 능력과 사실을 정확히 아는 능력은 같지 않습니다.",
    caution: "답이 그럴듯하다는 이유만으로 사실이라고 믿으면 안 됩니다. 중요한 내용은 근거를 확인하고, 모델이 할 수 있는 작업의 권한도 제한해야 합니다.",
  },
  "CNN·이미지 모델": {
    concept: "쉽게 말하면, CNN은 작은 돋보기를 사진 위에서 움직이며 선이나 모서리 같은 무늬를 찾습니다. 같은 돋보기를 여러 위치에서 사용하므로 사진 전체를 한 번에 연결하는 방식보다 계산이 적습니다.",
    caution: "사진 크기, 채널 수, 필터 크기는 서로 다른 값입니다. 출력 크기와 학습해야 할 숫자 개수를 같은 공식으로 계산하지 마세요.",
  },
  "ViT·학습 전략": {
    concept: "쉽게 말하면, ViT는 사진을 퍼즐 조각처럼 나눈 뒤 각 조각이 다른 조각과 얼마나 관련 있는지 비교합니다. 조각의 원래 위치도 따로 알려 주어야 사진의 배치를 이해할 수 있습니다.",
    caution: "구조가 좋아도 데이터가 부족하거나 학습 설정이 맞지 않으면 성능이 떨어집니다. 훈련 점수와 검증 점수를 함께 보며 조정하세요.",
  },
};

const easyExplanationGuides: ExplanationGuide[] = [
  { category: "ML 기초·검증", pattern: /Precision|Recall|F1|정확도|혼동행렬|TP|FP|FN|TN/, concept: "쉽게 말하면, 정밀도는 ‘양성이라고 말한 것 중 진짜 양성이 얼마나 되는가’, 재현율은 ‘실제 양성을 얼마나 빠뜨리지 않고 찾았는가’를 묻는 값입니다.", caution: "전체 정답률이 높아도 중요한 소수 집단을 전부 놓칠 수 있습니다. 어떤 실수가 더 위험한지 먼저 생각하세요." },
  { category: "ML 기초·검증", pattern: /validation|test|hold-out|K-fold|LOOCV|fold|과적합|과소적합|일반화/, concept: "쉽게 말하면, 훈련 데이터는 연습문제, 검증 데이터는 모의고사, 테스트 데이터는 마지막 실전 시험과 같습니다. 교차검증은 모의고사 문제 묶음을 번갈아 바꾸어 결과가 우연인지 확인하는 방법입니다.", caution: "실전 시험인 테스트 결과를 보면서 모델을 계속 고치면 이미 정답을 본 것과 같습니다. 테스트는 마지막에만 확인하세요." },
  { category: "ML 기초·검증", pattern: /MSE|RMSE|R²|오차/, concept: "쉽게 말하면, MSE와 RMSE는 예측이 정답에서 평균적으로 얼마나 떨어졌는지 보여 줍니다. RMSE는 정답과 같은 단위라서 실제 오차 크기를 읽기 더 쉽습니다.", caution: "R²는 오차의 실제 크기가 아니라 단순히 평균으로 예측했을 때보다 얼마나 나은지를 비교하는 값입니다." },
  { category: "ML 기초·검증", pattern: /K-means|군집|StandardScaler|비지도|계층/, concept: "쉽게 말하면, 군집화는 정답표 없이 서로 비슷한 대상을 같은 모둠으로 묶는 작업입니다. 키와 몸무게처럼 단위가 다른 값은 크기를 비슷하게 맞춘 뒤 거리를 재야 합니다.", caution: "모둠 번호 1, 2, 3 자체에는 순서나 우열의 뜻이 없습니다. 시작점이나 거리 기준이 바뀌면 결과도 달라질 수 있습니다." },
  { category: "ML 기초·검증", pattern: /feature|label|지도|분류|회귀|상관|명목형|one-hot|ε/, concept: "쉽게 말하면, 입력 정보로 정답을 맞히는 것이 지도학습입니다. 숫자를 예측하면 회귀, 종류를 고르면 분류이며, 맑음·비 같은 이름에는 실제 크기 순서가 없다는 점을 모델에 알려 줘야 합니다.", caution: "두 값이 함께 움직인다고 해서 하나가 다른 하나의 원인이라고 바로 결론 내리면 안 됩니다." },

  { category: "회귀·신경망", pattern: /선형회귀|회귀계수|최소제곱|정규방정식|다중공선성|RSE|t 통계량/, concept: "쉽게 말하면, 선형회귀는 데이터 점들 사이를 가장 잘 지나가는 직선을 찾는 방법입니다. 각 점과 직선 사이의 차이를 제곱해 더한 값이 가장 작아지도록 직선을 정합니다.", caution: "입력 변수들이 거의 같은 정보를 담으면 어느 변수의 영향인지 나누기 어려워 계수 해석이 흔들릴 수 있습니다." },
  { category: "회귀·신경망", pattern: /로지스틱|softmax|교차엔트로피|one-hot/, concept: "쉽게 말하면, 로지스틱 회귀는 계산한 점수를 0과 1 사이의 확률로 바꾸어 어느 종류에 가까운지 판단합니다. 교차엔트로피는 정답 종류에 낮은 확률을 줄수록 더 큰 벌점을 줍니다.", caution: "이름에 회귀가 들어가지만 로지스틱 회귀는 주로 분류에 사용합니다. 확률을 얻은 뒤에는 종류를 고르는 기준도 필요합니다." },
  { category: "회귀·신경망", pattern: /ReLU|Leaky|활성화|깊이|표현력|sigmoid/, concept: "쉽게 말하면, 활성화 함수는 신경망이 직선만 그리지 않고 구부러진 복잡한 경계도 만들 수 있게 해 줍니다. ReLU는 양수는 그대로 두고 음수는 0으로 만듭니다.", caution: "선형 계산만 여러 번 이어도 결국 하나의 선형 계산과 같습니다. ReLU의 음수 구간은 기울기가 0이라 학습이 멈출 수도 있습니다." },
  { category: "회귀·신경망", pattern: /gradient|경사하강|mini-batch|full-batch|학습률|optimizer|Grid Search|Random Search/, concept: "쉽게 말하면, 경사하강법은 산에서 가장 가파르게 내려가는 방향을 보고 조금씩 낮은 곳으로 이동하는 것과 같습니다. 학습률은 한 번에 내딛는 걸음의 크기입니다.", caution: "걸음이 너무 크면 목적지를 지나쳐 흔들리고, 너무 작으면 도착하는 데 오래 걸립니다." },
  { category: "회귀·신경망", pattern: /역전파|계산 그래프|연쇄법칙|PyTorch|nn\.Module|forward|zero_grad|backward|step|shape|파라미터 수/, concept: "쉽게 말하면, 역전파는 최종 오답에서 출발해 계산을 거꾸로 따라가며 ‘어느 숫자가 오답에 얼마나 영향을 줬는지’를 찾는 과정입니다. 그 영향도만큼 가중치를 고칩니다.", caution: "backward는 고칠 방향을 계산하고 step은 실제 값을 고칩니다. 두 동작을 같은 것으로 생각하지 마세요." },

  { category: "NLP·Transformer", pattern: /one-hot|embedding|Skip-gram|CBOW|분포 가설|subword|tokenization|어휘 크기/, concept: "쉽게 말하면, 임베딩은 단어를 지도 위 좌표처럼 숫자 묶음으로 놓는 방법입니다. 비슷한 문맥에 자주 등장한 단어는 지도에서도 가까운 곳에 놓일 수 있습니다.", caution: "CBOW는 주변 단어로 가운데 단어를 맞히고, Skip-gram은 가운데 단어로 주변 단어를 맞힙니다." },
  { category: "NLP·Transformer", pattern: /RNN|LSTM|GRU|hidden|gradient|장기 의존성/, concept: "쉽게 말하면, RNN은 문장을 왼쪽부터 읽으며 지금까지 읽은 내용을 작은 메모장에 계속 적습니다. LSTM과 GRU는 무엇을 지우고 남길지 정하는 문을 추가한 구조입니다.", caution: "문장이 매우 길면 앞부분 정보가 희미해질 수 있습니다. 문이 있다고 해서 이 문제가 완전히 사라지는 것은 아닙니다." },
  { category: "NLP·Transformer", pattern: /Seq2Seq|teacher forcing|encoder-decoder|cross-attention|attention이 필요한/, concept: "쉽게 말하면, 번역할 때 출력 단어 하나를 만들 때마다 원문에서 관련 부분을 다시 표시해 보는 기능이 attention입니다. 한 문장 전체를 작은 메모 하나에 억지로 담는 부담을 줄여 줍니다.", caution: "교사 강요는 학습할 때 이전 정답을 보여 주는 방식입니다. 실제 사용 때는 이전 예측을 사용하므로 상황이 다릅니다." },
  { category: "NLP·Transformer", pattern: /self-attention|Q, K, V|Scaled|multi-head|causal mask|위치|residual/, concept: "쉽게 말하면, Q는 ‘무엇을 찾을까’라는 질문, K는 각 정보에 붙은 색인, V는 실제로 가져올 내용입니다. 질문과 색인이 잘 맞을수록 그 내용을 더 많이 참고합니다.", caution: "미래 단어를 가리는 마스크와 빈칸 채우기용 패딩을 가리는 마스크는 목적이 다릅니다." },
  { category: "NLP·Transformer", pattern: /BERT|MLM|T5|span corruption|N-gram|Transformer의 시퀀스/, concept: "쉽게 말하면, BERT는 문장 일부를 가리고 빈칸을 맞히며 문맥을 배웁니다. T5는 여러 단어로 된 구간을 가린 뒤 그 구간 전체를 다시 만들어 보며 학습합니다.", caution: "BERT처럼 문장을 양쪽에서 보는 모델과 앞의 단어만 보고 다음 단어를 만드는 모델은 학습 방식과 용도가 다릅니다." },

  { category: "LLM·평가·안전", pattern: /Foundation|Scaling|emergent|사전학습|자기회귀/, concept: "쉽게 말하면, 파운데이션 모델은 아주 많은 글을 먼저 읽은 공통 기초 모델입니다. 이후 필요한 작업을 추가로 연습시키거나 지시를 주어 여러 용도로 사용합니다.", caution: "모델이 커졌다고 모든 능력이 자동으로 좋아지거나 갑자기 완벽해지는 것은 아닙니다." },
  { category: "LLM·평가·안전", pattern: /SFT|RLHF|Reward|KL|in-context|fine-tuning/, concept: "쉽게 말하면, 문맥 내 학습은 시험지에 예시를 함께 적어 주는 방식이라 모델 자체는 바뀌지 않습니다. 미세조정은 예시로 다시 훈련해 모델 안의 가중치를 실제로 바꿉니다.", caution: "프롬프트에 예시를 넣는 것과 모델을 다시 학습하는 것을 같은 작업으로 생각하지 마세요." },
  { category: "LLM·평가·안전", pattern: /temperature|beam search|top-p|top-k|디코딩/, concept: "쉽게 말하면, 생성 방법은 다음 단어 후보를 고르는 규칙입니다. 가장 가능성 높은 하나만 고를 수도 있고, 가능성 높은 여러 후보 중에서 뽑을 수도 있습니다.", caution: "다양성을 줄이면 답이 일정해질 수 있지만 사실이 아닌 답까지 자동으로 사라지는 것은 아닙니다." },
  { category: "LLM·평가·안전", pattern: /perplexity|BLEU|ROUGE|Judge|평가|benchmark|cosine|유사도/, concept: "쉽게 말하면, 평가 지표는 서로 다른 자를 사용하는 것과 같습니다. 문장 겹침을 재는 자, 다음 단어 확률을 재는 자, 사람이 느끼는 품질을 재는 자는 결과가 서로 다를 수 있습니다.", caution: "한 점수만 높다고 전체 품질이 좋다고 말하면 안 됩니다. 정확성, 유용성, 안전성을 따로 확인하세요." },
  { category: "LLM·평가·안전", pattern: /환각|RAG|jailbreak|안전|사내 지식/, concept: "쉽게 말하면, RAG는 모델이 기억만으로 답하지 않고 필요한 자료를 먼저 찾아 펼쳐 놓고 답하게 하는 방식입니다. 오픈북 시험과 비슷합니다.", caution: "찾아온 자료가 틀리면 답도 틀릴 수 있습니다. 자료 검색과 최종 답을 모두 확인해야 합니다." },
  { category: "LLM·평가·안전", pattern: /System prompt|프롬프트 구성|모호성/, concept: "쉽게 말하면, 좋은 프롬프트는 부탁할 일, 참고할 자료, 지켜야 할 조건, 원하는 답 모양을 각각 분명하게 적은 작업 지시서입니다.", caution: "프롬프트는 행동을 안내하지만 보안 장치는 아닙니다. 중요한 권한 확인은 프로그램에서 따로 해야 합니다." },

  { category: "CNN·이미지 모델", pattern: /출력 너비|출력 공간|파라미터 수|shape|채널 수|비용|비율/, concept: "쉽게 말하면, 필터가 사진 안에서 몇 번 움직일 수 있는지를 세면 출력 크기가 나옵니다. 필터 안의 숫자 개수에 입력·출력 채널 수를 곱하면 학습할 가중치 수를 구할 수 있습니다.", caution: "사진의 가로세로 크기는 출력 계산량에 영향을 주지만, 같은 필터의 가중치 개수를 늘리지는 않습니다." },
  { category: "CNN·이미지 모델", pattern: /국소|가중치 공유|완전연결|ReLU|pooling|해상도|수용영역/, concept: "쉽게 말하면, CNN은 작은 창으로 사진의 일부를 보고 그 창을 옆으로 옮겨 같은 무늬를 찾습니다. 층을 여러 번 거치면 점점 더 넓은 영역을 함께 보게 됩니다.", caution: "사진을 줄이면 계산은 빨라지지만 작은 글자나 정확한 위치 정보가 사라질 수 있습니다." },
  { category: "CNN·이미지 모델", pattern: /AlexNet|VGG|degradation|ResNet|Residual|bottleneck/, concept: "쉽게 말하면, VGG는 작은 필터를 차곡차곡 쌓고, ResNet은 입력이 지나갈 지름길을 만들어 깊은 모델도 학습하기 쉽게 합니다.", caution: "깊은 모델의 훈련 점수까지 나빠지는 현상은 단순히 과적합 때문이라고 볼 수 없습니다." },
  { category: "CNN·이미지 모델", pattern: /MobileNet|Depthwise|pointwise|separable/, concept: "쉽게 말하면, MobileNet은 ‘각 채널에서 무늬 찾기’와 ‘채널 정보 섞기’를 두 단계로 나눕니다. 한 번에 모두 계산하는 것보다 가볍게 만들기 위한 방법입니다.", caution: "채널별 계산만 하고 끝내면 채널 사이 정보가 섞이지 않습니다. 뒤의 1×1 계산도 필요합니다." },
  { category: "CNN·이미지 모델", pattern: /계산 자원|activation|FLOPs|메모리|효율적인 이유|비교/, concept: "쉽게 말하면, 파라미터 수는 모델 파일의 짐 크기, 중간 결과는 작업 중 펼쳐 놓는 책상 크기, FLOPs는 해야 할 계산 횟수와 비슷합니다.", caution: "모델 파일이 작아도 중간 결과가 크면 메모리를 많이 쓰거나 실행이 느릴 수 있습니다." },

  { category: "ViT·학습 전략", pattern: /patch|token 수|Q, K, V|위치|positional|Swin|window|장거리|전역/, concept: "쉽게 말하면, 사진을 같은 크기의 퍼즐 조각으로 나누고 각 조각을 하나의 단어처럼 다룹니다. 조각끼리 비교해 멀리 떨어진 부분의 관계도 찾습니다.", caution: "조각 내용만 주면 원래 어디에 있던 조각인지 알기 어렵습니다. 위치 정보를 함께 넣어야 합니다." },
  { category: "ViT·학습 전략", pattern: /ViT|DeiT|teacher|student|사전학습|linear probing|fine-tuning/, concept: "쉽게 말하면, 먼저 많은 사진으로 공부한 모델을 가져와 새 문제에 활용합니다. 처음에는 기존 부분을 고정하고 마지막 분류 부분만 학습해 보는 것이 안전한 출발점입니다.", caution: "데이터가 적을 때 모델 전체를 큰 학습률로 바꾸면 이미 배운 좋은 특징이 쉽게 망가질 수 있습니다." },
  { category: "ViT·학습 전략", pattern: /활성화|Sigmoid|tanh|ReLU|Leaky|dying/, concept: "쉽게 말하면, 활성화 함수는 계산 결과를 꺾어 신경망이 복잡한 모양도 표현하게 합니다. Leaky ReLU는 음수에서도 아주 작은 길을 남겨 학습이 완전히 멈추는 일을 줄입니다.", caution: "활성화 함수가 없으면 층을 많이 쌓아도 복잡한 경계를 만들기 어렵습니다." },
  { category: "ViT·학습 전략", pattern: /초기화|Xavier|He|대칭|Residual branch/, concept: "쉽게 말하면, 초기화는 학습을 시작할 때 가중치의 첫 값을 정하는 일입니다. 모두 같은 값으로 시작하면 뉴런들이 똑같이 움직이므로 서로 다른 작은 값에서 시작합니다.", caution: "가중치를 전부 0으로 시작하면 같은 층의 뉴런들이 서로 다른 특징을 배우기 어렵습니다." },
  { category: "ViT·학습 전략", pattern: /L1|L2|Dropout|정규화|augmentation|학습률|Cosine|validation loss|early stopping/, concept: "쉽게 말하면, 정규화와 데이터 증강은 답을 통째로 외우지 못하게 다양한 연습을 시키는 방법입니다. 조기 종료는 모의고사 점수가 나빠지기 시작할 때 학습을 멈추는 방법입니다.", caution: "훈련 점수만 계속 좋아지고 검증 점수가 나빠지면 외우기만 하고 있을 가능성이 큽니다." },
];

// 이전 해설 데이터는 문제은행 원문과의 비교 검증을 위해 남겨 둔다.
void categoryExplanationFallback;
void explanationGuides;
void easyCategoryExplanation;
void easyExplanationGuides;

const explanationNotes: Record<string, string> = {
  "ml-01": "포함 관계는 큰 범주에서 작은 범주로 읽으면 됩니다. AI에는 사람이 정한 규칙으로 작동하는 방식도 포함되고, ML은 데이터에서 규칙을 학습하는 AI, DL은 여러 층의 신경망을 사용하는 ML입니다.",
  "ml-02": "판단 기준은 예측 결과의 형태입니다. 결과가 가격처럼 연속된 숫자이면 회귀이고, 양성·음성처럼 미리 정한 종류 중 하나이면 분류입니다.",
  "ml-03": "분모 TP+FP는 모델이 양성이라고 판정한 전체 40건입니다. 그중 실제 양성인 TP가 30건이므로 30÷40=0.75이며, 이는 양성 판정 100건 중 약 75건이 맞는다는 뜻입니다.",
  "ml-04": "train은 모델이 공부하는 자료, validation은 여러 후보 중 하나를 고르는 자료, test는 선택이 모두 끝난 뒤 성능을 확인하는 자료입니다. test를 여러 번 보면 더 이상 처음 보는 데이터가 아니게 됩니다.",
  "ml-05": "예를 들어 전체 100개 중 70개로 학습한 모델은 100개 전체로 학습한 최종 모델보다 정보가 적습니다. 이 더 약한 모델의 오류를 재기 때문에 최종 모델의 실제 오류보다 크게 나올 수 있습니다.",
  "ml-06": "Leave-One-Out이라는 이름 그대로 매번 한 개만 검증용으로 남깁니다. 120개가 각각 한 번씩 검증 역할을 해야 하므로 fold도 120개입니다.",
  "ml-07": "K-means는 중심의 시작 위치에 영향을 받습니다. 같은 데이터라도 시작 중심이 달라지면 다른 군집 결과에 머물 수 있으므로 ‘항상 전역 최적해’라는 표현이 틀립니다.",
  "ml-08": "환자 100명 중 실제 환자가 1명뿐일 때 전부 정상이라고 답하면 정확도는 99%지만 환자는 한 명도 발견하지 못합니다. 이때 FN을 줄이는 것이 중요하므로 recall을 우선 보고, 양성 판정의 신뢰도는 precision으로 함께 확인합니다.",
  "ml-09": "모델에 넣어 주는 단서는 feature이고 모델이 맞혀야 할 정답은 label입니다. 따라서 메일 내용과 발신자 정보로 스팸 여부를 맞히는 구조가 됩니다.",
  "ml-10": "ε의 평균이 0이라는 말은 오차가 매번 0이라는 뜻이 아닙니다. 어떤 관측치는 예측보다 높고 다른 관측치는 낮을 수 있지만, 같은 X에서 여러 번 관측했을 때 그 오차가 한쪽으로 치우치지 않는다는 가정입니다.",
  "ml-11": "고객별 정답 집단이 미리 적혀 있지 않으므로 지도학습이 아닙니다. 알고리즘이 구매 패턴 사이의 거리나 유사도를 보고 스스로 묶음을 찾으므로 비지도 군집화입니다.",
  "ml-12": "RMSE는 MSE에 제곱근을 취해 원래 단위로 되돌린 값입니다. √25=5이므로, 목표값이 만 원 단위였다면 RMSE도 5만 원처럼 원래 단위로 읽을 수 있습니다.",
  "ml-13": "R²의 기준선은 모든 값을 test 평균으로 예측한 경우입니다. -0.2는 정확도가 -20%라는 뜻이 아니라, 현재 모델의 제곱오차가 그 단순한 평균 예측보다도 크다는 뜻입니다.",
  "ml-14": "분모 TP+FN은 실제 양성인 전체 40건입니다. 그중 모델이 찾아낸 TP가 36건이므로 36÷40=0.9이며, 실제 양성의 90%를 발견했다는 의미입니다.",
  "ml-15": "Specificity의 출발점은 실제 음성 전체 TN+FP이고, NPV의 출발점은 음성이라고 예측한 전체 TN+FN입니다. ‘실제에서 시작하는가, 예측에서 시작하는가’를 구분하면 두 식을 덜 헷갈립니다.",
  "ml-16": "검증 표본이 10개인 fold와 100개인 fold를 같은 비중으로 평균하면 각 관측치의 영향이 달라집니다. n_k/n을 곱하면 큰 fold가 그 안의 관측치 수만큼 더 큰 비중을 가져 전체 관측치를 공평하게 합칠 수 있습니다.",
  "ml-17": "응집형은 작은 것에서 큰 것으로 합치는 방식입니다. 처음에는 데이터 하나하나가 각각 군집이고, 가장 가까운 두 군집을 계속 합쳐 마지막에는 하나의 큰 군집이 됩니다.",
  "ml-18": "예를 들어 연봉은 수천만 단위이고 나이는 수십 단위라면 그대로 계산한 거리는 거의 연봉이 결정합니다. StandardScaler로 단위를 맞추면 숫자 크기 때문에 한 feature만 과도하게 지배하는 일을 줄일 수 있습니다.",
  "ml-19": "test를 보며 모델을 바꾸는 순간 test도 모델 선택에 사용된 데이터가 됩니다. 그러면 test 점수가 새 데이터 성능을 공정하게 보여 주지 못하므로 과적합을 줄이는 방법이 아니라 평가 누수에 가깝습니다.",
  "ml-20": "군집에는 정답표가 없기 때문에 한 번 나온 묶음을 정답이라고 확정할 수 없습니다. 스케일·거리·초기값을 바꿔도 비슷한 묶음이 유지되는지 보고, 그 묶음이 실제 업무에서 해석 가능한지도 함께 확인해야 합니다.",
  "ml-21": "과소적합은 공부 자체가 부족한 상태와 비슷합니다. train에서도 못 맞히고 validation에서도 못 맞히므로 모델 복잡도나 feature 표현이 문제를 담기에 충분한지 먼저 살펴야 합니다.",
  "ml-22": "전체 데이터를 K개의 겹치지 않는 상자로 나눈다고 생각하면 됩니다. 각 표본은 정확히 한 상자에 들어가고, 모든 상자를 합치면 원래 데이터가 빠짐없이 복원되어야 합니다.",
  "ml-23": "광고비와 매출이 함께 늘었다는 사실만으로 광고가 원인이라고 확정할 수 없습니다. 계절이나 할인 행사처럼 두 값에 동시에 영향을 준 요인이 있을 수 있어, 인과 판단에는 실험이나 추가 설계가 필요합니다.",
  "ml-24": "맑음·눈·비는 단지 서로 다른 이름일 뿐 1<2<3 같은 순서가 없습니다. 숫자를 그대로 넣으면 모델이 ‘비가 맑음보다 2만큼 크다’는 가짜 관계를 배울 수 있습니다.",
  "nn-01": "계산 순서는 기울기에 x를 곱한 뒤 절편을 더하는 것입니다. 3×4=12이고 여기에 2를 더해 14가 되며, β1=3은 x가 1 늘 때 예측값이 3씩 늘어난다는 의미입니다.",
  "nn-02": "분자는 x와 y가 같은 방향으로 얼마나 움직이는지, 분모는 x 자체가 얼마나 퍼져 있는지를 나타냅니다. 그래서 공분산을 x의 분산으로 나눈 값이 x가 1 변할 때 y가 얼마나 변하는지를 나타내는 기울기가 됩니다.",
  "nn-03": "sigmoid는 어떤 유한한 점수도 0보다 크고 1보다 작은 값으로 바꿉니다. 이 값은 확률이고, 실제 class는 예를 들어 0.5 같은 threshold와 비교한 뒤 정합니다.",
  "nn-04": "ReLU는 입력과 0 중 큰 값을 선택합니다. -3.5와 0 중에는 0이 더 크므로 출력은 0이며, 양수가 들어오면 그 값은 그대로 나갑니다.",
  "nn-05": "gradient는 손실이 가장 빠르게 커지는 방향을 가리킵니다. 손실을 줄이려면 그 반대 방향으로 가야 하므로 빼기 기호가 붙고, η는 한 번에 이동할 크기를 정합니다.",
  "nn-06": "전체 데이터를 한꺼번에 계산하지 않고 작은 묶음씩 처리하므로 한 번의 갱신이 가볍고 자주 일어납니다. 다만 묶음마다 데이터 구성이 달라 gradient가 조금씩 흔들릴 수 있습니다.",
  "nn-07": "순전파는 입력에서 손실까지 값을 계산하고, 역전파는 그 길을 반대로 따라갑니다. 각 연산의 작은 미분을 차례로 곱하면 어떤 파라미터가 손실에 얼마나 영향을 줬는지 구할 수 있고, optimizer가 그 값을 이용해 파라미터를 바꿉니다.",
  "nn-08": "zero_grad는 이전 계산 흔적을 지우고, forward는 예측을 만들며, loss는 틀린 정도를 계산합니다. backward가 수정 방향을 구한 뒤에야 step이 실제 파라미터를 변경합니다.",
  "nn-09": "먼저 RSS를 최소로 만드는 조건에서 XᵀXβ=Xᵀy를 얻습니다. XᵀX의 역행렬이 존재할 때 왼쪽에 이를 곱하면 β만 남아 β̂=(XᵀX)⁻¹Xᵀy가 됩니다.",
  "nn-10": "귀무가설 값 0에서 추정값 2.4가 표준오차 0.6의 몇 배만큼 떨어졌는지를 계산합니다. 2.4÷0.6=4이므로 추정값은 0에서 표준오차 네 배만큼 떨어져 있습니다.",
  "nn-11": "RSE는 잔차가 보통 어느 정도 크기인지 한 숫자로 요약합니다. 제곱근을 취하므로 y와 같은 단위로 돌아와 ‘예측이 대략 몇 단위 정도 빗나가는가’로 해석할 수 있습니다.",
  "nn-12": "log는 값의 순서를 바꾸지 않으므로 가장 큰 likelihood의 위치도 그대로입니다. 동시에 아주 작은 확률들을 계속 곱하는 대신 로그값을 더할 수 있어 계산이 더 안정적이고 미분도 간단해집니다.",
  "nn-13": "연결마다 weight를 세고 각 뉴런의 bias도 따로 세어야 합니다. 첫 연결 6개와 bias 2개, 두 번째 연결 2개와 bias 1개를 모두 더해야 하므로 11개입니다.",
  "nn-14": "one-hot 정답이 [0,1,0]이라면 합에서 가운데 항만 남습니다. 따라서 손실은 정답 class에 준 확률 하나만 보고 -log p_true가 되며, 정답 확률이 1에 가까울수록 손실은 작아집니다.",
  "nn-15": "ReLU가 만드는 꺾인 구간을 다음 층이 다시 조합하므로 층이 깊어지면 같은 수의 파라미터로도 더 복잡한 모양을 만들 수 있습니다. 다만 표현할 수 있다는 것과 실제로 잘 학습된다는 것은 별개의 문제입니다.",
  "nn-16": "full-batch는 방향이 비교적 안정적이지만 한 걸음을 계산하는 데 전체 데이터가 필요합니다. mini-batch는 방향이 조금 흔들리는 대신 적은 메모리로 더 자주 움직일 수 있습니다.",
  "nn-17": "학습률은 한 번에 움직이는 보폭입니다. 보폭이 너무 크면 낮은 지점을 지나 반대편으로 계속 넘어가 손실이 오르내리거나 아예 커질 수 있습니다.",
  "nn-18": "(32,10)의 10과 (10,4)의 10이 만나 사라지고 바깥쪽 32와 4가 남습니다. 즉 32개 표본 각각이 4개의 출력값을 갖게 됩니다.",
  "nn-19": "__init__은 어떤 layer를 사용할지 준비하는 곳이고 forward는 그 layer를 어떤 순서로 통과시킬지 적는 곳입니다. 사용자가 model(x)를 호출하면 PyTorch가 forward를 실행합니다.",
  "nn-20": "둘 다 입력의 선형결합을 사용하지만 마지막 출력이 다릅니다. 선형회귀는 숫자를 그대로 예측하고, 로지스틱 회귀는 sigmoid로 확률을 만든 뒤 threshold로 class를 정합니다.",
  "nn-21": "두 feature가 거의 같은 정보를 가지면 모델은 어느 쪽에 얼마의 계수를 줘야 할지 구분하기 어렵습니다. 그래서 데이터가 조금만 바뀌어도 계수의 크기나 부호가 크게 흔들릴 수 있습니다.",
  "nn-22": "sigmoid의 양끝에서는 입력이 변해도 출력이 거의 변하지 않습니다. 이때 미분값이 매우 작고, 여러 층에서 작은 값이 계속 곱해지면 앞쪽 층까지 전달되는 gradient가 거의 0이 됩니다.",
  "nn-23": "입력이 음수이므로 αz를 사용합니다. 0.01×(-5)=-0.05이며, 표준 ReLU와 달리 음수 쪽에도 작은 기울기가 남아 파라미터가 계속 업데이트될 가능성이 있습니다.",
  "nn-24": "Grid Search는 미리 만든 표의 모든 칸을 확인하는 방식이고, Random Search는 정한 횟수만큼 여러 위치를 뽑아 확인하는 방식입니다. 탐색할 변수가 많을수록 모든 조합을 보는 Grid Search의 비용이 빠르게 커집니다.",
  "nlp-01": "one-hot에서는 단어마다 자기 자리 하나만 1이고 나머지는 모두 0입니다. ‘고양이’와 ‘강아지’처럼 의미가 가까운 단어도 벡터 사이 거리가 다른 단어와 똑같아 의미 관계를 표현할 수 없습니다.",
  "nlp-02": "Skip-gram에서는 가운데 단어가 문제이고 주변 단어가 정답입니다. ‘나는 맛있는 사과를 먹었다’에서 ‘사과’를 보고 주변의 ‘맛있는’, ‘먹었다’를 예측하는 식으로 학습합니다.",
  "nlp-03": "cell state는 오래 보관할 정보를 전달하는 통로입니다. forget gate는 지울 정보, input gate는 새로 쓸 정보, output gate는 밖으로 보여 줄 정보를 조절합니다.",
  "nlp-04": "학습 중에는 이전 칸의 정답을 다음 입력으로 주기 때문에 decoder가 안정적으로 배울 수 있습니다. 실제 생성 때는 정답이 없어서 자신의 이전 예측을 사용하므로 학습과 추론 사이에 차이가 생깁니다.",
  "nlp-05": "내적은 차원이 커질수록 값의 크기도 커지기 쉽습니다. 이를 그대로 softmax에 넣으면 한 항에 확률이 몰릴 수 있어 key 차원의 제곱근 √d_k로 나눠 크기를 조절합니다.",
  "nlp-06": "self라는 말은 Q, K, V가 모두 같은 입력 X에서 시작한다는 뜻입니다. 다만 각각 다른 weight를 곱하므로 찾을 정보, 비교 기준, 전달할 내용이라는 서로 다른 역할의 표현이 됩니다.",
  "nlp-07": "다음 단어를 예측할 때 뒤에 나올 정답을 미리 보면 부정행위와 같습니다. causal mask는 오른쪽의 미래 위치를 가려 현재까지 나온 token만으로 예측하게 합니다.",
  "nlp-08": "예측 대상은 전체 token의 약 15%이고, 그 선택된 token 안에서 80·10·10 비율을 적용합니다. 일부를 원본이나 무작위 token으로 남기는 이유는 학습 때만 보이는 [MASK]에 지나치게 의존하지 않게 하기 위해서입니다.",
  "nlp-09": "RNN은 앞 시점 계산이 끝나야 다음 시점을 처리할 수 있어 순차적입니다. Transformer는 여러 위치를 동시에 비교해 병렬화와 긴 거리 연결에 유리하지만, token 수가 길어지면 attention 표가 N×N으로 커지는 비용이 있습니다.",
  "nlp-10": "처음 보는 단어도 이미 아는 작은 조각들의 조합으로 나타낼 수 있습니다. 예를 들어 희귀한 합성어를 여러 subword로 나누면 완전한 미등록어가 되는 일을 줄일 수 있습니다.",
  "nlp-11": "V는 저장해야 하는 token의 개수이고 d는 token 하나를 나타내는 숫자의 개수입니다. 따라서 V개의 행마다 길이 d인 벡터 하나가 놓여 (V, d)가 됩니다.",
  "nlp-12": "CBOW는 주변 문맥이 문제이고 가운데 단어가 정답입니다. Skip-gram과 입력·정답의 방향이 정확히 반대라고 기억하면 구분하기 쉽습니다.",
  "nlp-13": "새 상태 h_t는 지금 들어온 x_t만 보는 것이 아니라 직전까지의 요약인 h_{t-1}도 함께 사용합니다. 이 때문에 앞에서 읽은 정보가 뒤 시점으로 전달됩니다.",
  "nlp-14": "BPTT는 같은 RNN을 시간 방향으로 길게 펼쳐 미분합니다. 각 시점의 작은 미분값이 계속 곱해지면 멀리 있는 앞부분으로 갈수록 gradient가 매우 작아집니다.",
  "nlp-15": "LSTM은 cell state와 hidden state를 따로 두지만 GRU는 별도 cell state 없이 hidden state를 중심으로 동작합니다. update gate와 reset gate로 기억을 남길지 새 정보로 바꿀지를 조절합니다.",
  "nlp-16": "기본 Seq2Seq는 긴 입력 전체를 마지막의 고정 길이 벡터 하나에 넣어야 합니다. attention은 출력 단어를 만들 때마다 입력의 여러 위치를 다시 살펴볼 수 있게 해 이 압축 부담을 줄입니다.",
  "nlp-17": "한 head만 있으면 한 종류의 관계에 집중하기 쉽습니다. 여러 head는 같은 문장을 서로 다른 관점으로 보고, 각 결과를 합쳐 문법·의미·위치 관계를 함께 표현할 수 있습니다.",
  "nlp-18": "self-attention은 token의 내용 관계는 계산하지만 첫 번째와 세 번째라는 순서를 스스로 알지 못합니다. 위치 인코딩을 token 벡터에 더해 각 token이 놓인 자리를 알려 줍니다.",
  "nlp-19": "BERT는 문장의 왼쪽과 오른쪽 문맥을 함께 보는 encoder 모델입니다. 새 문장을 자유롭게 이어 쓰는 것보다 문장 의미 파악, 분류, 질의응답처럼 입력을 이해하는 작업에 잘 맞습니다.",
  "nlp-20": "T5는 한 token만 가리는 것이 아니라 연속된 여러 token 구간을 가립니다. 입력에는 각 빈 구간을 나타내는 sentinel을 두고, decoder는 그 표시 뒤에 원래 구간 내용을 차례로 생성합니다.",
  "nlp-21": "단어 뜻을 사전 문장으로 직접 넣는 대신 실제 사용 문맥을 관찰합니다. 비슷한 주변 단어와 함께 자주 등장하면 의미도 비슷할 가능성이 높다고 보고 벡터를 학습합니다.",
  "nlp-22": "N-gram은 바로 앞 N-1개 단어만 봅니다. N을 키우면 문맥은 조금 길어지지만 가능한 단어 조합이 너무 많아져 학습에서 한 번도 못 본 조합이 급격히 늘어납니다.",
  "nlp-23": "sublayer가 새로 계산한 F(x)에 원래 입력 x를 바로 더하면 정보와 gradient가 지나갈 짧은 길이 생깁니다. 그래서 깊은 층에서도 앞의 정보를 보존하고 학습 신호를 전달하기 쉬워집니다.",
  "nlp-24": "decoder의 현재 상태가 Q가 되어 ‘입력의 어디를 볼지’를 묻습니다. encoder 출력에서 만든 K와 비교해 관련 위치를 찾고, 같은 encoder 출력의 V에서 실제 정보를 가져옵니다.",
  "llm-01": "먼저 넓은 데이터로 공통 능력을 학습한 뒤 작업마다 처음부터 새 모델을 만들지 않고 재사용합니다. prompting은 입력으로 지시하고 fine-tuning은 weight를 추가 학습한다는 차이가 있습니다.",
  "llm-02": "모델 크기·데이터·계산량을 늘리면 평균적으로 loss가 일정한 경향을 따라 줄어든다는 경험 법칙입니다. 자원을 늘리면 무조건 완벽해진다는 보장이 아니라, 성능 변화를 예측하는 관계에 가깝습니다.",
  "llm-03": "평균 negative log-likelihood를 먼저 구한 뒤 지수함수 exp를 적용합니다. PPL이 낮다는 것은 정답 token을 덜 놀라운 선택으로 봤다는 뜻이지만, 생성 내용이 사실이라는 뜻은 아닙니다.",
  "llm-04": "Reward Model은 두 답변 중 사람이 어느 쪽을 더 선호했는지를 배웁니다. 정답 사실 자체를 직접 외우는 모델이 아니라 사람의 비교 판단을 점수로 흉내 내는 모델입니다.",
  "llm-05": "temperature를 낮추면 원래 확률이 높은 token과 낮은 token의 차이가 더 커집니다. 그래서 같은 입력에서 비슷한 답이 나오기 쉽지만, 높은 확률의 답이 틀렸다면 일관되게 틀릴 수도 있습니다.",
  "llm-06": "position·length·self-bias는 실제로 알려진 평가 편향입니다. ‘표본 평균이 항상 0’은 이 문맥의 편향 유형이 아니며, 질문이 ‘보기 어려운 것’을 찾는다는 점도 확인해야 합니다.",
  "llm-07": "System prompt는 모델의 기본 역할과 행동 방향을 정하지만 프로그램의 강제 규칙과 같지는 않습니다. 모델이 지시를 놓치거나 우회 입력의 영향을 받을 수 있어 중요한 제한은 코드와 권한 검사로도 보완해야 합니다.",
  "llm-08": "코사인 유사도는 벡터의 길이보다 두 벡터가 향하는 방향이 얼마나 비슷한지를 봅니다. 값이 클수록 두 문장 embedding이 비슷한 의미 방향을 가진다고 해석합니다.",
  "llm-09": "환각 대응은 한 가지 장치로 끝나지 않습니다. 검색 근거를 제공하고, 답이 근거와 맞는지 검사하며, 반복 평가와 사람 확인을 더해야 중요한 상황에서 잘못된 답이 그대로 사용되는 위험을 줄일 수 있습니다.",
  "llm-10": "문장을 한 token씩 왼쪽에서 오른쪽으로 읽으며 지금까지의 token으로 바로 다음 token을 맞힙니다. 학습에서는 실제 다음 token에 높은 확률을 주도록 log-likelihood를 높입니다.",
  "llm-11": "점수가 어느 임계값을 넘어야 정답으로 처리되는 평가에서는 조금씩 좋아진 확률이 어느 순간 갑자기 능력이 생긴 것처럼 보일 수 있습니다. 따라서 여러 지표와 세밀한 측정으로 실제 변화가 연속적인지도 확인해야 합니다.",
  "llm-12": "ICL은 대화창 안에 예시를 보여 주는 것으로, 대화가 끝나도 모델 weight는 바뀌지 않습니다. fine-tuning은 학습 절차를 실행해 weight 자체를 바꾸므로 비용과 영향 범위가 더 큽니다.",
  "llm-13": "SFT 데이터에는 지시와 그 지시에 맞는 모범 응답이 짝으로 들어 있습니다. 모델은 이 응답 token을 따라 생성하도록 학습해 사용자의 지시를 따르는 형식과 행동을 익힙니다.",
  "llm-14": "Reward Model에도 빈틈이 있어 policy가 점수만 높이는 이상한 답을 찾을 수 있습니다. KL 패널티는 새 policy가 원래 언어모델의 분포에서 너무 멀리 벗어나지 않게 잡아 주는 역할을 합니다.",
  "llm-15": "greedy는 매 순간 1등 token 하나만 남겨 초기에 잘못 고르면 되돌아갈 수 없습니다. beam search는 여러 문장 후보를 함께 유지해 뒤 token까지 더한 전체 점수가 좋은 경로를 찾습니다.",
  "llm-16": "확률이 높은 token부터 더해 누적값이 p를 넘는 순간까지의 후보만 남깁니다. 분포가 뾰족하면 후보가 적고 평평하면 많아지므로 p는 token 개수가 아닙니다.",
  "llm-17": "BLEU는 생성문이 기준 번역의 표현을 얼마나 정확히 포함하는지에 가깝고, ROUGE는 기준 요약의 내용을 얼마나 놓치지 않았는지에 가깝습니다. 표현이 달라도 의미가 같은 문장은 두 지표에서 낮을 수 있습니다.",
  "llm-18": "perplexity는 모델이 실제 다음 token을 얼마나 예상 가능하게 봤는지를 나타냅니다. 낮을수록 확률 예측은 좋지만 사람에게 유용한지, 사실인지, 안전한지는 별도로 평가해야 합니다.",
  "llm-19": "평가 문항을 학습 중 이미 봤다면 높은 점수가 처음 보는 문제에 대한 실력이 아니라 기억의 결과일 수 있습니다. 학습 이후 만든 비공개 문항이나 시간 순서 분할을 사용하는 이유입니다.",
  "llm-20": "RAG는 답할 때마다 최신 문서를 찾아 지식을 공급하고, fine-tuning은 말투·형식·행동 방식을 모델 안에 익힙니다. 사내 시스템에서는 권한을 확인한 검색으로 사실을 가져오고 필요할 때만 fine-tuning으로 응답 형식을 맞추는 조합이 적절합니다.",
  "llm-21": "top-k의 k는 남길 후보의 개수라 언제나 k개가 남습니다. top-p의 p는 누적 확률 기준이라 확률분포의 모양에 따라 남는 후보 개수가 매번 달라질 수 있습니다.",
  "llm-22": "역할, 해야 할 일, 입력 자료의 시작과 끝, 지켜야 할 조건, 출력 모양을 나눠 쓰면 모델이 각 부분을 명령이나 데이터로 혼동할 가능성이 줄어듭니다.",
  "llm-23": "jailbreak는 안전 지시를 무시하게 만들려는 공격 입력입니다. 문구 하나로 차단하기보다 모델이 사용할 수 있는 도구와 데이터 권한을 최소화하고, 입력·출력 검사와 공격 테스트를 함께 적용해야 합니다.",
  "llm-24": "좋은 평가에는 실제 사용 상황을 닮은 문제, 확인하려는 능력에 맞는 점수 기준, 같은 조건으로 다시 실행할 수 있는 절차가 모두 필요합니다. 셋 중 하나가 바뀌면 모델 점수 비교의 의미도 달라질 수 있습니다.",
  "cnn-01": "예를 들어 이미지의 픽셀 수가 두 배가 되면 완전연결층의 입력 연결도 크게 늘어납니다. 또한 펼치는 과정에서 위·아래·옆이라는 위치 관계가 드러나지 않아 이미지의 공간적 특징을 효율적으로 이용하기 어렵습니다.",
  "cnn-02": "국소 연결은 필터가 가까운 픽셀만 본다는 뜻이고, 가중치 공유는 그 필터를 이미지 전체 위치에서 똑같이 쓴다는 뜻입니다. 같은 모서리 무늬를 위치마다 새 가중치 없이 찾을 수 있습니다.",
  "cnn-03": "패딩이 없으므로 5칸짜리 커널의 왼쪽 끝이 1번 위치부터 28번 위치까지만 놓일 수 있습니다. 식에 넣어도 (32-5)/1+1=28입니다.",
  "cnn-04": "한 축씩 계산하면 (64-3+2)/2+1=32.5처럼 보이지만 floor를 먼저 적용해 31+1=32가 됩니다. 가로와 세로 조건이 같으므로 최종 공간 크기는 32×32입니다.",
  "cnn-05": "출력 필터 하나는 입력 3채널을 모두 보므로 3×3×3=27개의 weight가 필요합니다. 이런 필터가 16개라 432개이고, 필터마다 bias 하나씩 16개를 더합니다.",
  "cnn-06": "Cout은 서로 다른 필터 묶음의 개수입니다. 각 필터 묶음이 feature map 하나를 만들기 때문에 출력에도 Cout개의 채널이 생깁니다.",
  "cnn-07": "합성곱도 weight를 곱하고 더하는 선형 연산입니다. 선형 연산만 여러 번 연결하면 결국 하나의 선형 연산과 같아지므로, ReLU가 중간에서 값을 꺾어 복잡한 패턴을 표현하게 합니다.",
  "cnn-08": "2×2 창 안의 네 숫자를 비교해 가장 큰 하나만 남깁니다. 7이 가장 크므로 다른 세 값의 위치와 크기는 이 pooling 출력에서는 사라집니다.",
  "cnn-09": "공간 크기를 줄이면 뒤 층이 처리할 값이 적어져 빠르고 작은 이동에 덜 민감해질 수 있습니다. 대신 작은 물체나 정확한 좌표가 필요한 작업에서는 중요한 세부 정보도 함께 사라질 수 있습니다.",
  "cnn-10": "3×3 두 층은 첫 층 주변 3칸에 이어 두 번째 층이 그 주변까지 보므로 5×5 범위를 봅니다. 한 번의 5×5보다 weight가 적고 ReLU를 두 번 넣을 수 있어 표현력도 높일 수 있습니다.",
  "cnn-11": "stride 1에서는 3×3 층을 하나 지날 때마다 기존 범위의 양쪽으로 한 칸씩 더 봅니다. 따라서 3→5→7 순서로 커져 세 층 뒤에는 한 변 7칸을 봅니다.",
  "cnn-12": "AlexNet은 attention 모델이 아니라 합성곱 기반 모델입니다. 당시 깊은 CNN을 대규모 이미지 분류에 성공적으로 적용한 대표 구조이며, 합성곱 5층 뒤에 완전연결 3층이 이어집니다.",
  "cnn-13": "앞쪽 feature map은 가로·세로가 커서 중간값을 많이 저장해야 합니다. 뒤쪽 FC 층은 공간을 펼친 많은 입력과 출력을 모두 연결하므로 저장할 weight가 많습니다.",
  "cnn-14": "VGG는 특별한 복잡한 블록보다 3×3 합성곱을 반복하는 규칙적인 구조가 특징입니다. 여러 합성곱으로 특징을 만든 뒤 pooling으로 가로·세로를 줄이는 과정을 단계별로 반복합니다.",
  "cnn-15": "과적합이면 보통 훈련 데이터는 아주 잘 맞히지만 새 데이터에서 나빠집니다. degradation은 깊어진 모델이 훈련 데이터조차 더 못 맞히므로, 핵심 원인은 일반화보다 최적화의 어려움입니다.",
  "cnn-16": "F(x)는 residual branch가 새로 학습한 변화량이고 x는 shortcut으로 그대로 온 입력입니다. 둘을 더한 F(x)+x가 block의 출력이며, F(x)가 0이어도 입력은 그대로 통과할 수 있습니다.",
  "cnn-17": "덧셈은 같은 위치끼리 해야 하므로 채널 수와 가로·세로 크기가 맞아야 합니다. 1×1 convolution은 필요한 채널 수로 바꾸고 stride를 주면 공간 크기도 맞출 수 있습니다.",
  "cnn-18": "계산이 비싼 3×3 합성곱에 많은 채널을 그대로 넣지 않고, 앞의 1×1로 채널을 줄인 뒤 처리합니다. 마지막 1×1은 필요한 출력 채널 수로 다시 늘립니다.",
  "cnn-19": "채널마다 H×W개의 값을 평균해 숫자 하나로 바꾸므로 최종 벡터 길이는 채널 수가 됩니다. 거대한 FC weight 없이 분류기로 연결할 수 있어 모델이 가벼워집니다.",
  "cnn-20": "depthwise는 각 입력 채널 안에서 공간 무늬를 따로 찾고, pointwise 1×1은 그 채널들을 섞습니다. 공간 처리와 채널 결합을 나눠 계산량을 줄이는 구조입니다.",
  "cnn-21": "공통인 HW를 약분하면 (9C+C²)/(9C²)=1/C+1/9가 됩니다. C=64를 넣은 0.126736…을 소수 셋째 자리에서 반올림하면 0.127입니다.",
  "cnn-22": "답안 흐름은 ‘왜 효율적인가’와 ‘깊어지면 무엇이 달라지는가’로 나누면 좋습니다. 앞부분에는 국소 연결·가중치 공유를, 뒷부분에는 수용영역 확대와 모서리에서 물체 형태로 발전하는 특징을 연결합니다.",
  "cnn-23": "VGG는 단순한 3×3 반복, ResNet은 깊은 학습을 돕는 shortcut, MobileNet은 모바일 실행을 위한 연산 분리가 핵심입니다. 세 모델은 같은 목표의 성능 순위가 아니라 서로 다른 설계 문제를 해결합니다.",
  "cnn-24": "작은 모델 파일이 반드시 실행 메모리도 작고 속도도 빠른 것은 아닙니다. 중간 feature map이 크면 activation 메모리와 연산량이 커질 수 있으므로 세 지표를 각각 확인해야 합니다.",
  "vit-01": "CNN의 작은 필터는 처음에는 가까운 픽셀만 봅니다. 이미지 양끝의 관계를 연결하려면 여러 층을 지나 수용영역을 넓혀야 하지만 attention은 두 위치를 한 번에 직접 비교할 수 있습니다.",
  "vit-02": "Q와 K를 비교해 어느 token을 얼마나 볼지 정하고, 그 비율로 V의 내용을 가져옵니다. 즉 비교에는 Q·K가 쓰이고 실제 출력에 합쳐지는 정보는 V입니다.",
  "vit-03": "가로에는 14개, 세로에도 14개의 patch가 생깁니다. 격자의 전체 칸 수는 14×14=196이며, [CLS] token을 포함하라는 말이 없으므로 추가하지 않습니다.",
  "vit-04": "self-attention은 token 집합의 관계를 보지만 patch가 왼쪽 위인지 오른쪽 아래인지는 알 수 없습니다. 위치 정보가 있어야 같은 patch 내용도 놓인 자리에 따라 다르게 해석할 수 있습니다.",
  "vit-05": "224×224에서 학습한 위치표와 더 큰 이미지의 patch 개수는 서로 다릅니다. token 수가 달라 shape가 맞지 않으므로 위치 embedding을 새 격자 크기에 맞게 보간하거나 다시 조정해야 합니다.",
  "vit-06": "절대 위치는 ‘3번 칸’ 자체를 나타내지만 상대 위치는 ‘두 칸 오른쪽’ 같은 관계를 나타냅니다. 입력 크기가 바뀌어도 이런 거리 관계는 재사용하기 쉬워 더 유연할 수 있습니다.",
  "vit-07": "CNN은 가까운 픽셀이 중요하다는 가정을 구조에 미리 넣지만 ViT는 그런 가정이 약합니다. 따라서 ViT는 더 많은 데이터에서 이미지의 유용한 규칙을 직접 배울 때 장점이 잘 나타납니다.",
  "vit-08": "student는 실제 label만 보는 것이 아니라 teacher가 각 class에 준 부드러운 확률분포도 따라갑니다. 이 분포에는 정답 외 class들의 관계 정보도 담겨 있어 데이터가 적을 때 학습을 도울 수 있습니다.",
  "vit-09": "첫 블록에서 서로 다른 창에 있어 만나지 못한 patch도 다음 블록에서 창의 경계를 옮기면 같은 창에 들어올 수 있습니다. 전체 attention 비용을 쓰지 않고도 창 사이 정보가 전달됩니다.",
  "vit-10": "두 선형층 W2(W1x)을 계산해도 행렬을 합치면 하나의 W'x가 됩니다. 층 사이에 비선형 함수가 있어야 직선 하나로는 만들 수 없는 복잡한 경계를 표현할 수 있습니다.",
  "vit-11": "입력 절댓값이 커지면 sigmoid와 tanh 그래프가 평평해집니다. 평평한 곳의 미분은 거의 0이어서 역전파 신호가 여러 층을 거치며 약해집니다.",
  "vit-12": "표준 ReLU는 음수에서 gradient가 0이라 한 번 계속 음수 영역에 머물면 학습이 멈출 수 있습니다. Leaky ReLU는 그 구간에도 작은 기울기를 두어 업데이트 통로를 남깁니다.",
  "vit-13": "요구한 답은 Leaky ReLU입니다. 이름의 Leaky는 ReLU가 막아 버리던 음수 구간에도 작은 값과 기울기를 조금 흘려보낸다는 뜻입니다.",
  "vit-14": "사전학습 모델이 RGB 순서와 특정 평균·표준편차로 배웠다면 새 입력도 같은 방식으로 준비해야 합니다. 전처리가 다르면 같은 이미지도 모델에는 학습 때와 다른 숫자 분포로 보입니다.",
  "vit-15": "같은 층의 뉴런을 모두 0으로 시작하면 입력도 출력도 같아 같은 gradient를 받습니다. 이후에도 서로 똑같이 움직여 여러 뉴런을 둔 의미가 없어지므로 서로 다른 작은 값으로 시작해야 합니다.",
  "vit-16": "초기화의 목적은 층을 지날 때 신호가 너무 커지거나 작아지지 않게 하는 것입니다. Xavier는 tanh 계열에, He는 음수 절반을 0으로 만드는 ReLU의 특성에 맞춘 분산을 사용합니다.",
  "vit-17": "처음에 residual branch F(x)가 거의 0이면 출력 F(x)+x는 x와 거의 같습니다. 깊은 네트워크가 처음부터 입력을 크게 망가뜨리지 않고 안정적인 상태에서 학습을 시작하게 합니다.",
  "vit-18": "L1은 절댓값 벌점의 뾰족한 형태 때문에 일부 weight를 정확히 0으로 만들기 쉽습니다. L2는 큰 weight일수록 더 강하게 누르면서 전체를 부드럽게 작게 만드는 경향이 있습니다.",
  "vit-19": "훈련 때 일부 unit을 무작위로 끄면 특정 unit 조합에만 의존하는 현상을 줄일 수 있습니다. inverted dropout은 훈련 때 남은 값을 미리 키워 두므로 추론 때는 모든 unit을 그대로 사용할 수 있습니다.",
  "vit-20": "20%를 끄면 평균적으로 80%만 남습니다. 남은 값에 1÷0.8=1.25를 곱하면 전체 activation의 기대 크기를 dropout 전과 비슷하게 유지할 수 있습니다.",
  "vit-21": "큰 학습률은 한 번의 이동이 너무 커서 좋은 지점을 계속 지나치고, 작은 학습률은 이동이 너무 작아 변화가 거의 보이지 않습니다. loss 곡선의 진동과 감소 속도로 두 상황을 구분할 수 있습니다.",
  "vit-22": "cosine schedule은 학습률을 갑자기 떨어뜨리지 않고 곡선을 따라 부드럽게 줄입니다. 초반에는 비교적 크게 움직이고 후반에는 작은 보폭으로 파라미터를 세밀하게 조정합니다.",
  "vit-23": "train loss만 내려가고 validation loss가 오르면 학습 데이터를 외우기 시작한 신호입니다. validation이 가장 좋았던 시점을 저장하고, 정규화와 증강 강도도 validation으로 고르며 test는 마지막 확인용으로 남겨야 합니다.",
  "vit-24": "먼저 backbone을 고정한 linear probing으로 기존 특징만으로 문제가 풀리는지 확인합니다. 더 적응이 필요하면 작은 학습률로 fine-tuning하고, label을 바꾸지 않는 증강과 후반 학습률 감소로 과적합과 가중치 훼손을 줄입니다.",
};

function expandExplanation(question: Question): string {
  if (!detailedExplanationCategories.has(question.category)) return question.explanation;
  const note = explanationNotes[question.id];
  return note ? `${question.explanation}\n\n${note}` : question.explanation;
}

function ExplanationContent({ text }: { text: string }) {
  const paragraphs = text.split("\n\n");
  const caution = paragraphs.at(-1)?.startsWith("주의\n")
    ? paragraphs.pop()?.slice("주의\n".length)
    : undefined;

  if (!caution) {
    return <span className="explanation-copy">{text}</span>;
  }

  return (
    <span className="explanation-flow">
      <span className="explanation-main">
        {paragraphs.map((paragraph) => <span key={paragraph}>{paragraph}</span>)}
      </span>
      <span className="explanation-caution">
        <strong>주의</strong>
        <span>{caution}</span>
      </span>
    </span>
  );
}

const rawPracticeQuestionBank: Question[] = [
  Q("py-01", "Python·API·JSON", "객관식", "기초", "다음 코드의 출력 결과로 옳은 것을 고르시오.", "27 str", "int(value)는 새 int 값을 만들지만 value를 바꾸지 않습니다. 따라서 덧셈은 27이고 원래 변수의 자료형은 str입니다.", 'value = "24"\nprint(int(value) + 3, type(value).__name__)', ["27 int", "27 str", "243 str", "TypeError"]),
  Q("py-02", "Python·API·JSON", "단답형", "기초", "출력 결과를 정확히 작성하시오.", "[1, 3, 5]", "슬라이스의 stop은 포함되지 않습니다. 인덱스 1에서 시작해 5 전까지 두 칸씩 건너뛰면 1, 3, 5가 선택됩니다.", "values = [0, 1, 2, 3, 4, 5]\nprint(values[1:6:2])"),
  Q("py-03", "Python·API·JSON", "단답형", "핵심", "두 print 문의 출력을 줄바꿈까지 동일하게 작성하시오.", "None\n[1, 2, 3]", "list.append는 원본 리스트를 수정하고 None을 반환합니다. result에는 None, values에는 3이 추가된 리스트가 남습니다.", "values = [1, 2]\nresult = values.append(3)\nprint(result)\nprint(values)"),
  Q("py-04", "Python·API·JSON", "객관식", "핵심", "response가 requests 응답 객체일 때 HTTP 성공 여부를 가장 직접적으로 확인할 속성은?", "response.status_code", "status_code는 200, 404, 500과 같은 HTTP 상태 코드입니다. text와 json()은 본문, url은 요청 URL이므로 성공 여부 판단과 다릅니다.", undefined, ["response.text", "response.status_code", "response.json()", "response.url"]),
  Q("py-05", "Python·API·JSON", "단답형", "핵심", "작은따옴표를 사용해 첫 번째 사용자의 city를 얻는 표현식을 작성하시오.", "data[0]['address']['city']", "가장 밖은 list이므로 [0], 사용자와 address는 dict이므로 차례로 ['address']와 ['city']를 사용합니다. 인덱스와 키를 구조 순서대로 따라가야 합니다.", "data = [{'name': '김사피', 'address': {'city': 'Seoul'}}]"),
  Q("py-06", "Python·API·JSON", "객관식", "핵심", "API 키 관리 방법으로 옳은 것은?", "키를 환경 변수에 두고 os.environ.get으로 읽는다.", "API 키는 소스 코드에 직접 쓰거나 Git에 올리면 안 됩니다. 환경 변수나 .env를 사용하고, .env는 .gitignore에 추가하며, 노출된 키는 폐기·재발급합니다.", undefined, ["키를 환경 변수에 두고 os.environ.get으로 읽는다.", "키를 노트북 첫 셀에 적어 Git에 올린다.", "키를 출력해 로그에 남긴다.", ".env를 공개 저장소에 포함한다."]),
  Q("py-07", "Python·API·JSON", "객관식", "핵심", "LLM API에서 temperature를 낮추면 일반적으로 어떤 경향이 있는가?", "출력의 일관성이 높아진다.", "temperature가 낮으면 높은 확률의 토큰에 더 집중해 결과가 일관적이 됩니다. 높이면 다양성은 커지지만 정확성을 보장하지는 않습니다.", undefined, ["출력의 일관성이 높아진다.", "모델의 파라미터 수가 줄어든다.", "컨텍스트 윈도우가 늘어난다.", "API 키 보안이 강화된다."]),
  Q("py-08", "Python·API·JSON", "단답형", "고난도", "작은따옴표를 사용해 LLM 챗 응답 data에서 첫 답변 텍스트를 얻는 표현식을 작성하시오.", "data['choices'][0]['message']['content']", "응답은 dict 안의 choices list, 첫 번째 choice dict, message dict, content 문자열 순서로 중첩됩니다. 접근 전에는 choices가 비었는지도 먼저 확인합니다."),
  Q("py-09", "Python·API·JSON", "서술형", "사고형", "requests로 API를 호출할 때 status_code만 확인하는 코드가 불충분한 이유와 보완 방법을 서술하시오.", "status_code는 HTTP 응답의 개략적인 성공·실패만 나타내며 타임아웃, 연결 실패, HTTP 오류, JSON 파싱 실패를 모두 설명하지 못한다. timeout을 지정하고 raise_for_status()를 호출한 뒤 Timeout, ConnectionError, HTTPError, JSONDecodeError를 원인별로 처리해야 한다.", "status_code는 HTTP 응답의 크게 분류된 상태만 보여 줍니다. 안정적인 코드는 요청 제한 시간, 상태 검증, 본문 파싱, 예외별 대응까지 포함합니다."),
  Q("py-10", "Python·API·JSON", "객관식", "기초", "Python 변수 이름으로 사용할 수 있는 것은?", "user_score", "변수 이름은 문자나 밑줄로 시작하고 영문자·숫자·밑줄을 사용할 수 있습니다. 숫자로 시작하거나 예약어를 쓰거나 하이픈을 포함한 이름은 허용되지 않습니다.", undefined, ["2nd_score", "class", "user-score", "user_score"]),
  Q("py-11", "Python·API·JSON", "단답형", "기초", "출력 결과를 공백까지 정확히 작성하시오.", "3 2 32", "//는 몫의 내림값, %는 나머지, **는 거듭제곱입니다. 17을 5로 나눈 몫은 3, 나머지는 2이고 2의 5제곱은 32입니다.", "print(17 // 5, 17 % 5, 2 ** 5)"),
  Q("py-12", "Python·API·JSON", "객관식", "핵심", "다음 코드의 출력으로 옳은 것은?", "empty", "빈 리스트는 조건식에서 Falsy로 평가됩니다. not scores는 True가 되므로 if 블록의 'empty'가 출력되고 else 블록은 실행되지 않습니다.", "scores = []\nif not scores:\n    print('empty')\nelse:\n    print('filled')", ["empty", "filled", "False", "아무것도 출력되지 않는다."]),
  Q("py-13", "Python·API·JSON", "단답형", "사고형", "출력 결과를 줄바꿈까지 정확히 작성하시오.", "1\n3\ndone", "2에서는 continue로 print를 건너뛰고 1과 3만 출력합니다. break 없이 반복이 정상 종료되었으므로 for의 else 블록도 실행되어 done이 출력됩니다.", "for number in range(1, 4):\n    if number == 2:\n        continue\n    print(number)\nelse:\n    print('done')"),
  Q("py-14", "Python·API·JSON", "객관식", "핵심", "return과 print의 차이에 대한 설명으로 옳은 것은?", "return은 호출 위치로 값을 돌려주고 함수를 종료한다.", "print는 값을 화면에 표시하지만 자동으로 호출자에게 결과를 돌려주지는 않습니다. return은 값을 호출 위치로 전달하면서 해당 함수 실행을 끝냅니다.", undefined, ["return은 호출 위치로 값을 돌려주고 함수를 종료한다.", "print는 항상 함수의 반환값을 만든다.", "return 뒤의 문장도 같은 호출에서 계속 실행된다.", "print와 return은 모든 경우에 같은 동작이다."]),
  Q("py-15", "Python·API·JSON", "단답형", "핵심", "두 print 문의 출력을 줄바꿈까지 동일하게 작성하시오.", "None\n[1, 2, 3]", "list.sort()는 원본을 제자리에서 정렬하고 반환값은 None입니다. 따라서 result에는 None이 저장되고 values 자체는 오름차순으로 변경됩니다.", "values = [3, 1, 2]\nresult = values.sort()\nprint(result)\nprint(values)"),
  Q("py-16", "Python·API·JSON", "객관식", "핵심", "키가 없을 때 오류 없이 기본값 0을 얻는 표현식은?", "user.get('age', 0)", "대괄호 접근은 키가 없으면 KeyError를 발생시킵니다. dict.get(key, default)는 해당 키가 없을 때 지정한 기본값을 반환하며 딕셔너리는 변경하지 않습니다.", undefined, ["user['age']", "user.get('age', 0)", "user.age or 0", "user['age'] = 0"]),
  Q("py-17", "Python·API·JSON", "객관식", "핵심", "REST API에서 기존 자원의 일부 필드만 수정할 때 일반적으로 사용하는 HTTP 메서드는?", "PATCH", "PATCH는 자원의 부분 수정을 나타내고 PUT은 보통 자원 전체 교체 의미로 사용됩니다. GET은 조회, DELETE는 삭제 요청에 대응합니다.", undefined, ["GET", "PATCH", "DELETE", "OPTIONS"]),
  Q("py-18", "Python·API·JSON", "단답형", "기초", "요청한 자원을 찾을 수 없음을 나타내는 대표 HTTP 상태 코드를 숫자로 작성하시오.", "404", "404 Not Found는 서버가 요청된 자원을 찾지 못했음을 나타내는 대표적인 클라이언트 오류 상태입니다. 200은 성공, 500은 서버 내부 오류입니다."),
  Q("py-19", "Python·API·JSON", "객관식", "사고형", "requests의 response.json()에 대한 설명으로 옳은 것은?", "응답 본문의 JSON을 Python list 또는 dict 등으로 변환하는 메서드다.", "json은 속성이 아니라 호출하는 메서드입니다. 유효한 JSON 본문을 Python 객체로 역직렬화하며, 본문이 JSON이 아니면 JSONDecodeError가 발생할 수 있습니다.", undefined, ["응답 본문의 JSON을 Python list 또는 dict 등으로 변환하는 메서드다.", "HTTP 상태 코드를 정수로 반환하는 속성이다.", "요청 URL을 문자열로 반환하는 함수다.", "모든 응답에서 예외 없이 문자열만 반환한다."]),
  Q("py-20", "Python·API·JSON", "서술형", "사고형", "JSON의 array와 object가 Python에서 어떤 자료형으로 변환되는지 설명하고, 중첩 데이터 접근 시 오류를 줄이는 방법을 서술하시오.", "JSON array는 Python list로, object는 dict로 변환된다. 바깥 구조부터 자료형을 확인하며 list에는 정수 index, dict에는 key를 순서대로 적용한다. 선택적 필드는 get과 기본값을 사용하고, 응답이 비었거나 예상 구조와 다른 경우를 먼저 검사하면 IndexError와 KeyError를 줄일 수 있다.", "중첩 JSON은 한 번에 암기할 대상이 아니라 각 단계의 컨테이너 형식을 따라가는 구조입니다. list와 dict 접근법, 누락 가능성, 빈 배열 여부를 분리해 확인합니다."),
  Q("py-21", "Python·API·JSON", "단답형", "기초", "출력 결과를 공백까지 정확히 작성하시오.", "3.5 3", "/는 두 정수의 나눗셈에서도 float 결과를 만들고, //는 몫을 내림한 floor division 결과를 만듭니다. 따라서 7/2는 3.5, 7//2는 3입니다.", "print(7 / 2, 7 // 2)"),
  Q("py-22", "Python·API·JSON", "단답형", "핵심", "출력 결과를 공백까지 정확히 작성하시오.", "3 10", "함수를 호출하면 새로운 지역 scope가 생깁니다. change 안의 value=3은 지역 변수이고, 함수 밖의 전역 value=10을 변경하지 않습니다.", "value = 10\n\ndef change():\n    value = 3\n    return value\n\nprint(change(), value)"),
  Q("py-23", "Python·API·JSON", "객관식", "사고형", "LLM API 응답에서 data['choices'][0]에 접근하기 전에 가장 먼저 확인할 조건은?", "choices가 존재하며 빈 list가 아닌지 확인한다.", "응답 상태가 성공이어도 choices가 없거나 빈 배열일 수 있습니다. 길이와 구조를 먼저 검사해야 IndexError를 막고 비정상 응답을 별도로 처리할 수 있습니다.", undefined, ["choices가 존재하며 빈 list가 아닌지 확인한다.", "temperature가 반드시 1인지 확인한다.", "모든 header를 삭제한다.", "응답 URL이 문자열인지 확인한다."]),
  Q("py-24", "Python·API·JSON", "단답형", "핵심", "index와 value를 함께 순회하도록 빈칸에 들어갈 내장 함수 이름을 작성하시오.", "enumerate", "enumerate(iterable)는 각 원소와 0부터 시작하는 index를 함께 제공합니다. start 인자를 주면 시작 번호도 바꿀 수 있으며, 문제 지시대로 함수 이름만 작성합니다.", "items = ['a', 'b']\nfor index, value in ___(items):\n    print(index, value)"),

  Q("np-01", "NumPy·Pandas", "객관식", "기초", "다음 코드의 출력으로 옳은 것은?", "[3, 4, 3, 4]", "Python list에서 * 2는 원소별 곱셈이 아니라 리스트 반복입니다. NumPy ndarray의 * 2와 혼동하면 안 됩니다.", "values = [3, 4]\nprint(values * 2)", ["[6, 8]", "[3, 4, 3, 4]", "[3, 3, 4, 4]", "TypeError"]),
  Q("np-02", "NumPy·Pandas", "단답형", "핵심", "출력 결과를 정확히 작성하시오.", "[6 8]", "ndarray의 산술 연산은 반복문 없이 각 원소에 벡터화되어 적용됩니다. [3, 4]의 각 원소에 2를 곱한 결과입니다.", "import numpy as np\narr = np.array([3, 4])\nprint(arr * 2)"),
  Q("np-03", "NumPy·Pandas", "객관식", "핵심", "shape가 (2, 3)인 배열 arr에서 arr.sum(axis=0)의 shape는?", "(3,)", "axis=0은 행 축을 줄여 각 열별로 집계합니다. 열 3개가 남아 결과 shape는 (3,)입니다. axis=1이면 각 행별 집계로 (2,)가 됩니다.", undefined, ["(2,)", "(3,)", "(2, 3)", "()"]),
  Q("np-04", "NumPy·Pandas", "단답형", "핵심", "전체 12개 원소를 3개의 행으로 변환하되 열 수를 NumPy가 추론하게 하는 코드의 빈칸을 작성하시오.", "-1", "reshape(3, -1)에서 -1은 나머지 차원을 전체 원소 수에 맞게 추론하라는 뜻입니다. 12개를 3행으로 나누므로 최종 shape는 (3, 4)입니다.", "arr = np.arange(12).reshape(3, __)") ,
  Q("np-05", "NumPy·Pandas", "객관식", "핵심", "DataFrame df에서 부서별 급여 평균을 구하는 코드는?", "df.groupby('부서')['급여'].mean()", "groupby('부서')로 부서별 그룹을 나눈 뒤 ['급여']를 선택해 mean()을 적용합니다. sum()은 전체 합, sort_values는 정렬, value_counts는 빈도입니다.", undefined, ["df['급여'].sum()", "df.groupby('부서')['급여'].mean()", "df.sort_values('급여')", "df['부서'].value_counts()"]),
  Q("np-06", "NumPy·Pandas", "객관식", "핵심", "나이가 30 이상인 행을 모두 선택하는 올바른 코드는?", "df[df['나이'] >= 30]", "df['나이'] >= 30만 실행하면 Boolean Series만 생성됩니다. 이 마스크를 다시 df[]에 넣어야 조건을 만족하는 행이 선택됩니다.", undefined, ["df[df['나이'] >= 30]", "df['나이'] >= 30", "df.filter('나이' >= 30)", "df.loc['나이' >= 30]"]),
  Q("np-07", "NumPy·Pandas", "객관식", "사고형", "Pandas에서 두 조건을 모두 만족하는 행을 선택하는 올바른 코드는?", "df[(df['age'] >= 30) & (df['city'] == 'Seoul')]", "Pandas Series 조건은 Python의 and가 아니라 원소별 &를 사용하고, 각 비교식을 괄호로 감싸야 합니다. 비교는 ==, 대입은 =입니다.", undefined, ["df[(df['age'] >= 30) & (df['city'] == 'Seoul')]", "df[df['age'] >= 30 and df['city'] == 'Seoul']", "df[df['age'] >= 30 & df['city'] = 'Seoul']", "df[(df['age'] >= 30) | (df['city'] == 'Seoul')]"]),
  Q("np-08", "NumPy·Pandas", "단답형", "고난도", "groupby 빈칸에 들어갈 메서드 이름을 정확히 작성하시오.", "sum", "groupby('메뉴')['수량']은 메뉴별 수량 Series 그룹을 만듭니다. 그룹별 총판매량은 sum()으로 집계하며 문제 지시대로 괄호 없이 메서드 이름만 쓰면 됩니다.", "df.groupby('메뉴')['수량'].___()"),
  Q("np-09", "NumPy·Pandas", "객관식", "고난도", "groupby 그룹의 count()와 size()에 대한 설명으로 옳은 것은?", "count()는 NaN을 제외하고 size()는 NaN을 포함한 행 수를 센다.", "count()는 각 열의 결측치를 제외한 값 개수를 세고, size()는 결측 여부와 관계없이 그룹의 전체 행 수를 세어 결측치가 있으면 결과가 달라질 수 있습니다.", undefined, ["count()는 NaN을 제외하고 size()는 NaN을 포함한 행 수를 센다.", "두 메서드는 항상 같은 값을 반환한다.", "size()만 NaN을 제외한다.", "count()는 숫자형 열에만 사용할 수 있다."]),
  Q("np-10", "NumPy·Pandas", "서술형", "사고형", "loc와 iloc의 차이와 각각이 적합한 사용 상황을 서술하시오.", "loc는 행·열의 라벨과 Boolean 조건을 기준으로 선택하므로 열 이름이나 조건으로 조회·수정할 때 적합하다. iloc는 0부터 시작하는 정수 위치를 기준으로 선택하므로 몇 번째 행과 열인지가 중요한 위치 기반 슬라이싱에 적합하다.", "loc는 label, iloc는 integer position을 기준으로 합니다. 이 차이를 무시하면 정수형 index에서 특히 혼동하기 쉽습니다."),
  Q("np-11", "NumPy·Pandas", "단답형", "기초", "출력 결과를 정확히 작성하시오.", "[1 3 5]", "np.arange의 stop은 Python range처럼 포함되지 않습니다. 1에서 시작해 7 전까지 2씩 증가하므로 1, 3, 5가 ndarray 표시 형식으로 출력됩니다.", "import numpy as np\nprint(np.arange(1, 7, 2))"),
  Q("np-12", "NumPy·Pandas", "객관식", "핵심", "np.linspace(0, 1, 5)에 대한 설명으로 옳은 것은?", "0과 1을 포함해 같은 간격의 값 5개를 만든다.", "linspace의 세 번째 인자는 간격이 아니라 생성할 원소 수입니다. 기본 설정에서는 시작값과 종료값을 모두 포함하여 동일한 간격의 5개 값을 만듭니다.", undefined, ["0과 1을 포함해 같은 간격의 값 5개를 만든다.", "0부터 1 전까지 간격 5로 값을 만든다.", "정수 0과 1만 반환한다.", "shape가 (5, 5)인 배열을 만든다."]),
  Q("np-13", "NumPy·Pandas", "단답형", "핵심", "shape가 (2, 4)인 2차원 배열 arr에서 arr.T.shape의 출력값을 작성하시오.", "(4, 2)", "2차원 배열의 전치는 행과 열 축을 맞바꿉니다. 원래 2행 4열이므로 arr.T는 4행 2열이고 shape tuple은 (4, 2)입니다."),
  Q("np-14", "NumPy·Pandas", "객관식", "사고형", "다음 연산이 가능한 이유와 결과 shape로 옳은 것은?", "broadcasting이 (3,)을 각 행에 맞추며 결과는 (2, 3)이다.", "NumPy broadcasting은 뒤쪽 차원부터 크기가 같거나 한쪽이 1인지를 비교합니다. (2, 3)과 (3,)은 열 차원이 맞아 vector가 각 행에 적용됩니다.", "matrix = np.ones((2, 3))\nvector = np.array([1, 2, 3])\nresult = matrix + vector", ["broadcasting이 (3,)을 각 행에 맞추며 결과는 (2, 3)이다.", "연결 연산이므로 결과는 (5,)이다.", "두 shape가 완전히 같지 않아 항상 ValueError다.", "vector가 열벡터가 되어 결과는 (3, 2)이다."]),
  Q("np-15", "NumPy·Pandas", "단답형", "사고형", "출력 결과를 정확히 작성하시오.", "[3 4]", "두 Boolean 조건을 각각 괄호로 묶고 원소별 AND 연산자 &를 적용합니다. 2보다 크고 5보다 작은 원소는 3과 4입니다.", "import numpy as np\narr = np.array([1, 2, 3, 4, 5])\nprint(arr[(arr > 2) & (arr < 5)])"),
  Q("np-16", "NumPy·Pandas", "객관식", "핵심", "np.argsort(arr)가 반환하는 것은?", "arr를 오름차순으로 정렬할 때의 원소 index 배열", "np.sort는 정렬된 값 자체를 반환하고 np.argsort는 정렬 순서를 만드는 원래 위치 index를 반환합니다. 다른 배열을 같은 순서로 재배열할 때 유용합니다.", undefined, ["arr를 오름차순으로 정렬할 때의 원소 index 배열", "정렬된 값의 합계", "내림차순으로 정렬된 원본 배열", "중복값을 제거한 배열"]),
  Q("np-17", "NumPy·Pandas", "객관식", "핵심", "열 선택 결과의 자료형에 대한 설명으로 옳은 것은?", "df['매출']은 Series이고 df[['매출']]은 DataFrame이다.", "단일 대괄호 안에 열 이름 하나를 쓰면 1차원 Series를 반환합니다. 열 이름의 list를 이중 대괄호로 전달하면 열이 하나여도 2차원 DataFrame을 유지합니다.", undefined, ["df['매출']은 Series이고 df[['매출']]은 DataFrame이다.", "두 표현 모두 항상 Series다.", "두 표현 모두 항상 DataFrame이다.", "df[['매출']]은 Python list를 반환한다."]),
  Q("np-18", "NumPy·Pandas", "단답형", "핵심", "무작위 표본 추출 결과를 매번 같게 만들기 위한 sample의 인자 이름을 작성하시오.", "random_state", "DataFrame.sample의 random_state를 같은 정수로 고정하면 같은 데이터와 환경에서 표본 추출을 재현할 수 있습니다. NumPy 전역 난수에는 seed를 사용합니다.", "df.sample(n=5, ___=42)"),
  Q("np-19", "NumPy·Pandas", "객관식", "고난도", "행은 부서, 열은 연도, 값은 매출 합계인 표를 만드는 코드로 옳은 것은?", "df.pivot_table(index='부서', columns='연도', values='매출', aggfunc='sum')", "pivot_table에서 index는 행 그룹, columns는 열 그룹, values는 집계 대상, aggfunc는 집계 방식을 지정합니다. 중복 조합이 있어도 합계로 요약할 수 있습니다.", undefined, ["df.pivot_table(index='부서', columns='연도', values='매출', aggfunc='sum')", "df.sort_values(['부서', '연도'])", "df['매출'].value_counts()", "df.pivot_table(index='매출', values='부서', aggfunc='first')"]),
  Q("np-20", "NumPy·Pandas", "객관식", "사고형", "DataFrame을 CSV로 저장할 때 불필요한 index 열이 파일에 추가되지 않게 하는 인자는?", "index=False", "to_csv는 기본적으로 DataFrame index를 함께 기록합니다. 별도 데이터 열로 필요하지 않으면 index=False를 지정하며, 한글 호환이 필요하면 encoding도 함께 검토합니다.", undefined, ["index=False", "header=False", "axis=0", "inplace=True"]),
  Q("np-21", "NumPy·Pandas", "객관식", "핵심", "Python list와 NumPy ndarray의 자료형에 대한 설명으로 옳은 것은?", "ndarray는 일반적으로 한 배열 안의 원소를 공통 dtype으로 맞춘다.", "Python list는 서로 다른 자료형의 객체를 함께 담을 수 있지만 ndarray는 벡터 연산을 위해 일반적으로 공통 dtype을 사용합니다. 정수와 실수를 함께 넣으면 실수형으로 승격될 수 있습니다.", undefined, ["ndarray는 일반적으로 한 배열 안의 원소를 공통 dtype으로 맞춘다.", "Python list는 숫자만 저장할 수 있다.", "ndarray는 원소마다 반드시 서로 다른 dtype을 사용한다.", "list와 ndarray의 덧셈은 항상 같은 동작이다."]),
  Q("np-22", "NumPy·Pandas", "단답형", "핵심", "shape가 (3, 4)인 배열 arr에서 arr.sum(axis=1)의 결과 shape를 작성하시오.", "(3,)", "axis=1은 열 방향을 접어 각 행별로 합계를 계산합니다. 세 개 행마다 값 하나가 남으므로 결과는 길이 3인 1차원 배열입니다."),
  Q("np-23", "NumPy·Pandas", "객관식", "사고형", "city가 Seoul 또는 Busan인 행을 선택하는 올바른 코드는?", "df[df['city'].isin(['Seoul', 'Busan'])]", "isin은 Series의 각 값이 후보 집합에 포함되는지 Boolean mask를 만듭니다. Python의 in이나 단일 문자열 비교로는 두 도시 조건을 행별로 검사할 수 없습니다.", undefined, ["df[df['city'].isin(['Seoul', 'Busan'])]", "df[df['city'] in ['Seoul', 'Busan']]", "df[df['city'] == ['Seoul', 'Busan']]", "df.isin('Seoul' and 'Busan')"]),
  Q("np-24", "NumPy·Pandas", "객관식", "사고형", "한글 CSV를 pd.read_csv로 읽을 때 UnicodeDecodeError가 발생한 경우 가장 적절한 대응은?", "파일의 실제 문자 인코딩을 확인하고 utf-8-sig 또는 cp949 등을 명시한다.", "UnicodeDecodeError는 파일 bytes와 선택한 decoding 방식이 맞지 않을 때 발생합니다. 실제 저장 인코딩을 확인한 뒤 encoding 인자를 맞춰야 하며 확장자나 열 이름 변경으로 해결되지 않습니다.", undefined, ["파일의 실제 문자 인코딩을 확인하고 utf-8-sig 또는 cp949 등을 명시한다.", "모든 숫자 열을 문자열로 바꾼다.", "axis=1을 추가한다.", "CSV 확장자를 PNG로 바꾼다."]),

  Q("viz-01", "시각화·EDA", "객관식", "기초", "월별 매출의 시간적 변화 추이를 보기에 가장 적합한 차트는?", "line plot", "시간 순서에 따른 변화는 선그래프가 적합합니다. bar는 범주 비교, scatter는 두 변수 관계, hist는 단일 수치형 분포에 주로 사용합니다.", undefined, ["bar plot", "line plot", "scatter plot", "histogram"]),
  Q("viz-02", "시각화·EDA", "단답형", "기초", "Matplotlib에서 Windows의 맑은 고딕을 전역 폰트로 설정하는 코드의 빈칸을 작성하시오.", "Malgun Gothic", "한글이 네모로 보이는 문제는 한글 글꼴을 지원하는 폰트를 지정해 해결합니다. 음수 부호까지 깨지면 axes.unicode_minus를 False로 설정합니다.", "plt.rcParams['font.family'] = '___'"),
  Q("viz-03", "시각화·EDA", "객관식", "기초", "수치형 변수의 중앙값, 사분위수, 이상치를 함께 확인할 차트는?", "boxplot", "boxplot은 중앙값과 사분위 범위, whisker, 이상치 후보를 한눈에 보여 줍니다. 히스토그램은 분포 모양에 좋지만 사분위수와 이상치를 직접 표시하지는 않습니다.", undefined, ["pie chart", "boxplot", "line plot", "bar plot"]),
  Q("viz-04", "시각화·EDA", "객관식", "핵심", "두 수치형 변수 사이의 관계를 각 관측치의 점으로 확인할 차트는?", "scatter plot", "scatter plot은 각 관측치를 (x, y) 점으로 배치해 두 수치형 변수의 관계, 클러스터, 이상치를 보기에 적합합니다.", undefined, ["scatter plot", "histogram", "pie chart", "stacked bar"]),
  Q("viz-05", "시각화·EDA", "단답형", "핵심", "다음 코드에서 결측치를 여성의 평균 나이로 채우기 위한 메서드 이름을 작성하시오.", "fillna", "loc로 여성 행의 age만 선택한 뒤, 그 Series의 결측치를 미리 계산한 female_mean으로 fillna합니다. 원본 보존과 그룹별 기준을 함께 확인해야 합니다.", "female_mean = df.loc[df['sex'] == 'female', 'age'].mean()\ndf.loc[df['sex'] == 'female', 'age'] = df.loc[df['sex'] == 'female', 'age'].___(female_mean)"),
  Q("viz-06", "시각화·EDA", "객관식", "핵심", "크기가 비슷한 그룹으로 수치형 변수를 5개 구간에 나누고 싶을 때 적합한 함수는?", "pd.qcut(x, 5)", "qcut은 quantile을 기준으로 각 구간의 관측치 수가 비슷하게 나눕니다. cut은 값의 범위를 등간격으로 나누므로 분포가 치우치면 그룹 크기가 달라집니다.", undefined, ["pd.cut(x, 5)", "pd.qcut(x, 5)", "x.quantile(5)", "np.reshape(x, 5)"]),
  Q("viz-07", "시각화·EDA", "단답형", "사고형", "category 자료형 deck의 결측치를 'No Data'로 채우기 전 먼저 호출할 메서드를 작성하시오.", "cat.add_categories", "Categorical Series는 등록되지 않은 새 범주를 바로 fillna할 수 없습니다. 먼저 .cat.add_categories('No Data')로 범주를 추가한 뒤 fillna합니다.", "df['deck'] = df['deck'].___('No Data')\ndf['deck'] = df['deck'].fillna('No Data')"),
  Q("viz-08", "시각화·EDA", "서술형", "사고형", "타이타닉 EDA에서 전체 생존율만 보는 것이 불충분한 이유와 그룹별 분석 방법을 서술하시오.", "전체 생존율은 성별, 객실 등급, 나이, 요금 등 중요한 하위 집단의 차이를 숨길 수 있다. groupby나 pivot_table로 sex·pclass 등을 나누고 survived의 mean과 sum을 계산해 비율과 인원을 함께 보며, 그룹 크기와 결측치도 확인해야 한다.", "전체 평균만으로는 심플슨의 역설과 같은 집단 차이를 놓칠 수 있습니다. 그룹별 생존율과 표본 수를 같이 비교하고 시각화로 패턴을 확인해야 합니다."),
  Q("viz-09", "시각화·EDA", "객관식", "기초", "서로 다른 상품 범주의 총매출을 비교하기에 가장 적합한 기본 차트는?", "bar plot", "막대그래프는 범주별 크기를 공통 기준선에서 비교하기 좋습니다. 선그래프는 연속된 순서의 추이, 히스토그램은 한 수치형 변수의 분포에 적합합니다.", undefined, ["bar plot", "line plot", "histogram", "scatter plot"]),
  Q("viz-10", "시각화·EDA", "단답형", "기초", "수치형 열 age의 빈도 분포를 구간별 막대로 그리는 Matplotlib 함수 이름을 작성하시오.", "hist", "히스토그램은 연속 수치값을 구간으로 나누어 각 구간의 빈도를 표현합니다. Matplotlib에서는 plt.hist를 사용하고 bins로 구간 수나 경계를 조정합니다.", "plt.___(df['age'], bins=20)"),
  Q("viz-11", "시각화·EDA", "객관식", "핵심", "수치형 열들의 상관계수를 색상과 숫자로 함께 확인하는 코드로 옳은 것은?", "sns.heatmap(df.corr(numeric_only=True), annot=True)", "corr은 수치형 열의 상관행렬을 계산하고 heatmap은 행렬 크기를 색으로 표시합니다. annot=True는 각 셀에 계수값을 함께 적습니다.", undefined, ["sns.heatmap(df.corr(numeric_only=True), annot=True)", "sns.lineplot(data=df.corr())", "plt.hist(df.columns)", "sns.boxplot(data=df.info())"]),
  Q("viz-12", "시각화·EDA", "단답형", "핵심", "DataFrame의 열별 결측치 개수를 계산하는 표현식을 작성하시오.", "df.isnull().sum()", "isnull은 각 셀을 Boolean으로 표시하고 sum은 열별 True 개수를 합산합니다. 전체 결측 패턴을 확인한 뒤 열 특성에 맞는 처리 방법을 정합니다."),
  Q("viz-13", "시각화·EDA", "객관식", "핵심", "큰 이상치 때문에 오른쪽으로 심하게 치우친 수치형 열의 결측값 대체값으로 평균보다 우선 고려할 값은?", "중앙값", "평균은 극단값에 크게 끌리지만 중앙값은 순위의 가운데 값이라 이상치에 더 강건합니다. 분포와 변수 의미를 확인한 뒤 선택해야 합니다.", undefined, ["중앙값", "항상 0", "최댓값", "임의의 문자열"]),
  Q("viz-14", "시각화·EDA", "객관식", "사고형", "dropna를 무조건 적용하기 전에 확인할 사항으로 가장 적절한 것은?", "삭제되는 행의 규모와 결측 발생 패턴", "dropna는 간단하지만 표본을 잃고 결측이 체계적이면 편향을 키울 수 있습니다. 삭제 비율과 결측 메커니즘, 핵심 열 여부를 먼저 확인해야 합니다.", undefined, ["삭제되는 행의 규모와 결측 발생 패턴", "그래프의 선 색상", "DataFrame 변수 이름의 길이", "난수 seed만"]),
  Q("viz-15", "시각화·EDA", "단답형", "사고형", "운임 fare의 상위 10% 경계값을 계산하는 표현식을 작성하시오.", "df['fare'].quantile(0.9)", "90분위수는 관측값의 약 90%가 그 값 이하에 놓이는 경계입니다. 상위 10% 집단은 이 경계 이상인 행을 Boolean 조건으로 선택할 수 있습니다."),
  Q("viz-16", "시각화·EDA", "객관식", "핵심", "sibsp와 parch를 더해 family 열을 만드는 코드로 옳은 것은?", "df['family'] = df['sibsp'] + df['parch']", "두 열은 같은 행 위치끼리 정렬되어 원소별로 더해집니다. 이 파생열은 함께 탑승한 형제·배우자와 부모·자녀 수의 합을 표현합니다.", undefined, ["df['family'] = df['sibsp'] + df['parch']", "df['family'] = df[['sibsp', 'parch']].columns", "df['family'] = len(df)", "df.family.append('sibsp', 'parch')"]),
  Q("viz-17", "시각화·EDA", "단답형", "고난도", "groupby 집계 결과의 그룹 index를 일반 열로 되돌리는 메서드 이름을 작성하시오.", "reset_index", "groupby 결과에서 그룹 키가 index 또는 MultiIndex가 될 수 있습니다. reset_index()는 이를 일반 열로 옮겨 정렬·시각화·저장하기 쉬운 DataFrame 구조로 만듭니다."),
  Q("viz-18", "시각화·EDA", "객관식", "사고형", "fare는 비슷한 인원수의 5등급, age는 같은 폭의 10구간으로 나누려 할 때 올바른 조합은?", "fare에는 qcut, age에는 cut", "qcut은 분위수를 사용해 각 구간의 관측치 수를 비슷하게 만들고, cut은 값 범위를 기준으로 구간 경계를 만듭니다. 목적에 따라 두 함수를 구분합니다.", undefined, ["fare에는 qcut, age에는 cut", "fare에는 cut, age에는 qcut", "둘 다 reshape", "둘 다 value_counts만 사용"]),
  Q("viz-19", "시각화·EDA", "객관식", "핵심", "x축 범주명이 겹칠 때 레이아웃을 정리하는 일반적인 조합은?", "plt.xticks(rotation=45)와 plt.tight_layout()", "xticks의 rotation으로 긴 범주명을 기울이고 tight_layout으로 제목과 축 레이블이 그림 밖으로 잘리지 않도록 여백을 자동 조정합니다.", undefined, ["plt.xticks(rotation=45)와 plt.tight_layout()", "plt.show()를 반복 호출", "plt.figure를 삭제", "축 레이블을 모두 빈 문자열로 변경"]),
  Q("viz-20", "시각화·EDA", "서술형", "사고형", "EDA와 전처리에서 원본 DataFrame을 보존해야 하는 이유와 안전한 작업 흐름을 서술하시오.", "원본을 직접 덮어쓰면 잘못된 결측치 대체·행 삭제·범주 변환을 되돌리기 어렵고 처리 전후 차이를 검증할 기준도 사라진다. 원본을 유지한 채 copy로 작업본을 만들고, shape·결측치 수·요약통계를 단계마다 비교하며, 변환 순서와 기준값을 기록한 뒤 최종 결과를 확정해야 한다.", "전처리는 여러 단계가 누적되므로 결과만 남기면 오류 위치를 찾기 어렵습니다. 원본, 작업본, 변환 전후 검증 지표를 분리하면 재현성과 감사 가능성이 높아집니다."),
  Q("viz-21", "시각화·EDA", "객관식", "핵심", "Seaborn의 sns.barplot(data=df, x='부서', y='급여')가 기본적으로 나타내는 값은?", "각 부서 급여의 평균", "Seaborn barplot은 별도 estimator를 지정하지 않으면 범주별 y의 평균을 막대 높이로 표시합니다. 행별 값을 그대로 그리거나 합계를 자동 계산하는 그래프와 구분해야 합니다.", undefined, ["각 부서 급여의 평균", "각 부서 급여의 합계", "급여의 전체 히스토그램", "두 변수의 상관계수"]),
  Q("viz-22", "시각화·EDA", "단답형", "핵심", "범주형 열 embarked의 결측치를 최빈값으로 채우기 위한 대푯값 표현식을 작성하시오.", "df['embarked'].mode()[0]", "mode()는 최빈값 후보들을 Series로 반환하므로 첫 번째 값을 [0]으로 선택합니다. 이 값을 fillna에 전달하기 전에 분포와 복수 최빈값 가능성도 확인합니다."),
  Q("viz-23", "시각화·EDA", "객관식", "기초", "df.drop(['class', 'alive'], axis=1)의 동작으로 옳은 것은?", "class와 alive 열을 제거한 새 DataFrame을 반환한다.", "axis=1은 열 방향을 의미합니다. inplace=True나 재할당이 없다면 원본 df는 그대로이고, 지정한 두 열을 제외한 새 DataFrame이 반환됩니다.", undefined, ["class와 alive 열을 제거한 새 DataFrame을 반환한다.", "class와 alive라는 행만 제거한다.", "모든 결측 행을 제거한다.", "두 열의 값을 1로 바꾼다."]),
  Q("viz-24", "시각화·EDA", "단답형", "사고형", "출력 결과를 정확히 작성하시오.", "[0, 1, 1]", "apply는 Series의 각 값에 lambda를 적용합니다. female은 조건이 거짓이라 0, 두 male 값은 조건이 참이라 각각 1로 변환됩니다.", "import pandas as pd\nsex = pd.Series(['female', 'male', 'male'])\nprint(sex.apply(lambda x: 1 if x == 'male' else 0).tolist())"),

  Q("ml-01", "ML 기초·검증", "객관식", "기초", "AI, ML, DL의 포함 관계로 옳은 것은?", "AI ⊃ ML ⊃ DL", "딥러닝은 기계학습의 일부이고 기계학습은 AI의 일부입니다. 다만 규칙·휴리스틱만으로 만든 AI도 있으므로 모든 AI가 ML을 사용하는 것은 아닙니다.", undefined, ["AI ⊃ ML ⊃ DL", "DL ⊃ ML ⊃ AI", "AI = ML = DL", "ML ⊃ AI ⊃ DL"]),
  Q("ml-02", "ML 기초·검증", "객관식", "기초", "다음 중 분류 문제에 해당하는 것은?", "종양을 양성과 음성으로 판정한다.", "분류는 label이 범주형인 문제입니다. 양성·음성은 이진 범주이고, 집값·온도·매출은 연속값을 예측하는 회귀 문제입니다.", undefined, ["주택 가격을 예측한다.", "내일 최고 기온을 예측한다.", "종양을 양성과 음성으로 판정한다.", "광고비로 매출을 예측한다."]),
  Q("ml-03", "ML 기초·검증", "단답형", "기초", "TP=30, FP=10일 때 Precision을 소수로 작성하시오.", "0.75", "Precision = TP / (TP + FP)이므로 30 / 40 = 0.75입니다. 정밀도는 양성으로 예측한 건 중 실제 양성의 비율입니다."),
  Q("ml-04", "ML 기초·검증", "객관식", "핵심", "모델 선택과 최종 평가에 대한 원칙으로 옳은 것은?", "validation으로 모델을 선택하고 test는 최종에 한 번 사용한다.", "test 결과를 반복해 모델을 선택하면 test에 과적합하여 최종 성능 추정이 낙관적으로 편향됩니다. train으로 학습, validation/CV로 선택, test로 최종 평가합니다.", undefined, ["test로 모델을 반복 선택한다.", "validation으로 모델을 선택하고 test는 최종에 한 번 사용한다.", "train 오류만 가장 낮은 모델을 선택한다.", "validation을 train에 항상 포함한다."]),
  Q("ml-05", "ML 기초·검증", "객관식", "핵심", "hold-out validation이 최종 전체 데이터 학습 모델의 오류를 과대평가할 수 있는 이유는?", "전체보다 작은 train subset으로 학습한 모델을 평가하기 때문이다.", "hold-out에서는 학습 데이터가 전체보다 적습니다. 작은 학습 집합의 모델은 전체 데이터로 다시 학습할 최종 모델보다 약할 수 있어 오류를 상향 편향시킵니다.", undefined, ["전체보다 작은 train subset으로 학습한 모델을 평가하기 때문이다.", "validation label을 삭제하기 때문이다.", "test를 train에 포함하기 때문이다.", "모든 분할이 항상 동일하기 때문이다."]),
  Q("ml-06", "ML 기초·검증", "단답형", "핵심", "표본이 120개일 때 LOOCV의 fold 수 K를 작성하시오.", "120", "LOOCV는 각 반복에서 한 관측치를 validation으로 두므로 K=n입니다. 표본이 120개이면 120회 학습·평가합니다."),
  Q("ml-07", "ML 기초·검증", "객관식", "핵심", "K-means에 대한 설명으로 옳지 않은 것은?", "초기값에 관계없이 항상 전역 최적해를 찾는다.", "K-means는 초기 centroid에 따라 다른 지역 최솟값에 수렴할 수 있습니다. 여러 초기화를 시도하고 결과를 비교하는 이유입니다.", undefined, ["K를 미리 정한다.", "각 관측치는 정확히 하나의 군집에 속한다.", "반복하며 centroid와 할당을 갱신한다.", "초기값에 관계없이 항상 전역 최적해를 찾는다."]),
  Q("ml-08", "ML 기초·검증", "서술형", "사고형", "정확도 99%인 질병 분류기가 실제로는 유용하지 않을 수 있는 상황을 설명하고, 함께 봐야 할 지표를 서술하시오.", "환자가 1%인 데이터에서 모두 정상으로 예측해도 accuracy는 99%가 되지만 환자를 하나도 찾지 못한다. 혼동행렬의 TP·FP·FN·TN을 확인하고 환자 누락이 중요하면 recall, 양성 예측의 신뢰도는 precision, 균형은 F1과 ROC-AUC로 평가해야 한다.", "클래스 불균형이 크면 accuracy가 다수 클래스 예측만을 반영할 수 있습니다. 비용이 큰 오류가 FP인지 FN인지에 따라 지표와 threshold를 선택합니다."),
  Q("ml-09", "ML 기초·검증", "객관식", "기초", "스팸 메일 분류에서 feature와 label의 연결로 옳은 것은?", "메일 내용·발신자 정보는 feature, 스팸 여부는 label이다.", "feature는 예측에 사용하는 입력 정보이고 label은 맞혀야 하는 목표입니다. 메일 내용과 발신자 특성으로 스팸 또는 정상 범주를 예측합니다.", undefined, ["메일 내용·발신자 정보는 feature, 스팸 여부는 label이다.", "스팸 여부는 feature, 메일 내용은 손실함수다.", "발신자는 label, 스팸 여부는 hyperparameter다.", "메일 내용과 스팸 여부는 모두 model parameter다."]),
  Q("ml-10", "ML 기초·검증", "객관식", "핵심", "Y=f*(X)+ε에서 E[ε]=0이고 ε가 X와 독립이라는 가정의 의미로 옳은 것은?", "주어진 X에서 체계적인 평균 관계를 f*(X)가 나타낸다.", "잡음의 조건부 평균이 0이면 X가 주어졌을 때 Y의 평균 관계를 f*가 담당합니다. 개별 오차가 0이라는 뜻이 아니며, 데이터를 학습해도 측정오차 ε 자체를 모두 제거할 수는 없습니다.", undefined, ["주어진 X에서 체계적인 평균 관계를 f*(X)가 나타낸다.", "모든 관측치가 f*(X)와 정확히 같다.", "ε는 항상 양수다.", "X와 Y는 반드시 독립이다."]),
  Q("ml-11", "ML 기초·검증", "객관식", "기초", "정답 label 없이 고객의 구매 패턴으로 유사한 집단을 찾는 과제는?", "비지도학습의 군집화", "정답 범주가 주어지지 않고 관측치 사이의 유사성을 바탕으로 구조를 찾으므로 비지도학습입니다. 그중 집단을 나누는 대표 과제가 군집화입니다.", undefined, ["비지도학습의 군집화", "지도학습의 회귀", "지도학습의 분류", "강화학습의 보상 예측만"]),
  Q("ml-12", "ML 기초·검증", "단답형", "핵심", "MSE가 25일 때 RMSE를 정수로 작성하시오.", "5", "RMSE는 MSE의 제곱근이므로 √25=5입니다. MSE는 목표값 단위의 제곱이고 RMSE는 목표값과 같은 원래 단위로 해석할 수 있습니다."),
  Q("ml-13", "ML 기초·검증", "객관식", "사고형", "test 데이터에서 R²가 -0.2인 모델에 대한 해석으로 옳은 것은?", "해당 test에서 평균만 예측하는 기준보다 제곱오차가 더 크다.", "R²=1-RSS/TSS이므로 음수는 모델 RSS가 평균 예측의 TSS보다 크다는 뜻입니다. R²는 항상 0과 1 사이에 머무는 지표가 아닙니다.", undefined, ["해당 test에서 평균만 예측하는 기준보다 제곱오차가 더 크다.", "예측이 20%만큼 정확하다.", "오차가 전혀 없다.", "label이 반드시 음수다."]),
  Q("ml-14", "ML 기초·검증", "단답형", "핵심", "TP=36, FN=4일 때 Recall을 소수로 작성하시오.", "0.9", "Recall=TP/(TP+FN)이므로 36/(36+4)=36/40=0.9입니다. 실제 양성 중 모델이 찾아낸 비율을 나타냅니다."),
  Q("ml-15", "ML 기초·검증", "객관식", "고난도", "혼동행렬 지표의 연결로 옳은 것은?", "Specificity=TN/(TN+FP), NPV=TN/(TN+FN)", "특이도는 실제 음성 중 음성으로 맞힌 비율이고 NPV는 음성 예측 중 실제 음성의 비율입니다. FP는 Type I, FN은 Type II error로도 부릅니다.", undefined, ["Specificity=TN/(TN+FP), NPV=TN/(TN+FN)", "Specificity=TP/(TP+FN), NPV=TP/(TP+FP)", "Specificity=FP/(TN+FP), NPV=FN/(TN+FN)", "Specificity와 NPV는 항상 Accuracy와 같다."]),
  Q("ml-16", "ML 기초·검증", "객관식", "고난도", "fold 크기가 서로 다를 수 있을 때 전체 K-fold MSE를 합치는 적절한 방법은?", "각 fold MSE에 n_k/n을 곱해 가중합한다.", "각 검증 관측치가 같은 비중을 갖게 하려면 fold 오차에 검증 fold 크기 비율 n_k/n을 곱합니다. 단순 평균은 fold 크기가 같을 때 일치합니다.", undefined, ["각 fold MSE에 n_k/n을 곱해 가중합한다.", "가장 작은 MSE 하나만 사용한다.", "train MSE와 test MSE를 곱한다.", "fold 크기와 무관하게 항상 첫 fold만 사용한다."]),
  Q("ml-17", "ML 기초·검증", "객관식", "핵심", "응집형 계층 군집의 진행 순서로 옳은 것은?", "각 점을 개별 군집으로 시작해 가장 가까운 두 군집을 반복 병합한다.", "응집형 방식은 leaf 수준의 개별 관측치에서 시작해 linkage 기준으로 가장 가까운 군집을 합칩니다. 병합 이력은 덴드로그램으로 표현됩니다.", undefined, ["각 점을 개별 군집으로 시작해 가장 가까운 두 군집을 반복 병합한다.", "모든 점을 한 군집으로 시작해 임의로 삭제한다.", "반드시 K개의 centroid를 먼저 무작위 선택한다.", "label을 이용해 정답 군집을 학습한다."]),
  Q("ml-18", "ML 기초·검증", "객관식", "핵심", "거리 기반 군집화 전에 StandardScaler를 적용하는 주된 이유는?", "큰 단위의 feature가 거리를 지배하는 것을 줄이기 위해서다.", "표준화는 각 feature를 평균 0, 분산 1 수준으로 맞춥니다. 거리 계산에서 원래 단위가 큰 변수만 과도하게 영향력을 갖는 문제를 줄입니다.", undefined, ["큰 단위의 feature가 거리를 지배하는 것을 줄이기 위해서다.", "모든 label을 one-hot으로 만들기 위해서다.", "관측치 수를 두 배로 늘리기 위해서다.", "K를 자동으로 정하기 위해서다."]),
  Q("ml-19", "ML 기초·검증", "객관식", "사고형", "과적합을 줄이는 방법으로 보기 어려운 것은?", "test 성능을 반복 확인하며 모델을 계속 바꾼다.", "test를 반복 선택에 쓰면 test 정보에 맞춰져 평가가 낙관적으로 변합니다. 데이터 추가, 교차검증, 복잡도 제한과 정규화가 일반적인 과적합 완화 방법입니다.", undefined, ["대표성 있는 데이터를 추가한다.", "교차검증으로 모델을 선택한다.", "복잡도 제한이나 정규화를 적용한다.", "test 성능을 반복 확인하며 모델을 계속 바꾼다."]),
  Q("ml-20", "ML 기초·검증", "서술형", "사고형", "비지도 군집 결과가 알고리즘과 전처리에 따라 달라지는 이유와 결과를 점검하는 방법을 서술하시오.", "군집에는 정답 label이 없고 유사성을 거리·linkage·군집 수로 정의하므로 선택한 기준에 따라 구조가 달라진다. feature 스케일이 거리 크기를 바꾸고 초기값도 K-means 결과에 영향을 준다. 여러 초기화와 알고리즘·스케일링 조합을 비교하고, 안정성·응집도·분리도와 도메인 해석 가능성을 함께 확인해야 한다.", "군집 번호 자체에는 의미가 없습니다. 단일 실행을 정답으로 보지 않고 거리 정의, 초기화, 스케일, 알고리즘을 바꿨을 때 구조가 유지되는지 확인합니다."),
  Q("ml-21", "ML 기초·검증", "객관식", "핵심", "훈련 데이터와 validation 데이터에서 모두 오차가 큰 모델의 상태로 가장 적절한 것은?", "과소적합", "과소적합은 모델이나 feature 표현이 지나치게 단순해 train 패턴조차 충분히 학습하지 못한 상태입니다. train과 validation 오류가 모두 큰 고편향 패턴으로 나타납니다.", undefined, ["과소적합", "validation 누수", "완전한 일반화", "test 과적합만"]),
  Q("ml-22", "ML 기초·검증", "객관식", "핵심", "일반적인 K-fold 교차검증의 fold C1,…,CK가 만족해야 할 조건은?", "서로 겹치지 않으며 합집합이 전체 표본을 이룬다.", "각 관측치는 정확히 하나의 validation fold에 속해야 합니다. 따라서 서로 다른 fold의 교집합은 공집합이고 모든 fold의 합집합은 전체 데이터가 됩니다.", undefined, ["서로 겹치지 않으며 합집합이 전체 표본을 이룬다.", "모든 fold가 완전히 같은 표본을 가진다.", "label은 첫 fold에만 존재한다.", "fold마다 feature 수가 달라야 한다."]),
  Q("ml-23", "ML 기초·검증", "객관식", "사고형", "광고비와 매출의 상관계수가 높게 관측되었을 때 타당한 결론은?", "두 변수의 관련성은 보이지만 상관만으로 광고비가 매출 증가의 원인이라고 확정할 수 없다.", "상관은 함께 변하는 관계를 나타낼 뿐 제3의 변수, 역인과, 선택 편향을 제거하지 않습니다. 인과 결론에는 연구 설계와 추가 가정 또는 실험이 필요합니다.", undefined, ["두 변수의 관련성은 보이지만 상관만으로 광고비가 매출 증가의 원인이라고 확정할 수 없다.", "상관계수가 높으면 반드시 직접 인과관계다.", "상관관계가 있으면 측정오차는 0이다.", "두 변수의 단위가 같다는 뜻이다."]),
  Q("ml-24", "ML 기초·검증", "객관식", "사고형", "명목형 날씨를 맑음=1, 눈=2, 비=3으로 그대로 모델 입력에 넣을 때 생길 수 있는 문제는?", "범주 사이에 존재하지 않는 순서와 거리 관계를 모델이 사용할 수 있다.", "명목 범주를 연속 정수로 표현하면 1에서 2와 2에서 3의 거리가 같고 3이 1보다 크다는 인위적 구조가 생깁니다. 순서가 없는 범주는 one-hot 등 목적에 맞는 인코딩을 검토합니다.", undefined, ["범주 사이에 존재하지 않는 순서와 거리 관계를 모델이 사용할 수 있다.", "모든 결측치가 자동으로 채워진다.", "feature 수가 반드시 0이 된다.", "label이 연속값으로 정확히 변환된다."]),

  Q("nn-01", "회귀·신경망", "단답형", "기초", "단순회귀에서 x=4, 절편 β0=2, 기울기 β1=3일 때 예측값을 작성하시오.", "14", "단순회귀 예측식은 ŷ = β0 + β1x입니다. 2 + 3×4 = 14이며, 절편은 x=0일 때의 기준값, 기울기는 x가 1 증가할 때 예측 변화량입니다."),
  Q("nn-02", "회귀·신경망", "객관식", "핵심", "단순선형회귀의 최소제곱 기울기 추정량에 대한 표현으로 옳은 것은?", "공분산(x, y) / 분산(x)", "기울기는 x와 y가 함께 변하는 크기를 x 자체의 변동으로 표준화한 값입니다. 이는 ∑(x-x̄)(y-ȳ) / ∑(x-x̄)²와 같습니다.", undefined, ["공분산(x, y) / 분산(x)", "분산(x) / 공분산(x, y)", "평균(y) / 평균(x)", "RSS / n"]),
  Q("nn-03", "회귀·신경망", "객관식", "핵심", "로지스틱 회귀의 sigmoid 출력에 대한 설명으로 옳은 것은?", "열린구간 (0, 1)의 값으로 양성 확률로 해석할 수 있다.", "sigmoid는 유한한 선형 점수 z를 열린구간 (0,1)로 압축하며 정확히 0이나 1에는 도달하지 않습니다. 이진 로지스틱 회귀에서 p(y=1|x)로 해석하고 threshold로 class를 결정합니다.", undefined, ["실수 전체를 그대로 출력한다.", "열린구간 (0, 1)의 값으로 양성 확률로 해석할 수 있다.", "항상 0 또는 1만 출력한다.", "다중 분류의 클래스 수를 결정한다."]),
  Q("nn-04", "회귀·신경망", "단답형", "기초", "ReLU(-3.5)의 출력을 작성하시오.", "0", "ReLU(z)=max(0,z)이므로 음수 입력은 0으로, 양수 입력은 그대로 통과시킵니다. 비선형성을 추가해 신경망이 복잡한 함수를 표현하게 합니다."),
  Q("nn-05", "회귀·신경망", "객관식", "핵심", "경사하강법의 파라미터 갱신식으로 옳은 것은?", "θ ← θ - η∇L(θ)", "손실함수는 예측 오차를 수치화하고 역전파는 gradient를 계산합니다. optimizer인 경사하강법은 손실이 증가하는 gradient의 반대 방향으로 learning rate만큼 파라미터를 이동합니다.", undefined, ["θ ← θ + η∇L(θ)", "θ ← θ - η∇L(θ)", "θ ← η / ∇L(θ)", "θ ← L(θ)"]),
  Q("nn-06", "회귀·신경망", "객관식", "핵심", "mini-batch SGD의 특징으로 옳은 것은?", "일부 표본으로 gradient를 추정해 full-batch보다 자주 갱신한다.", "mini-batch는 전체보다 작은 표본 묶음으로 gradient를 추정합니다. 계산·메모리 효율과 자주 갱신이 장점이지만 gradient에 잡음이 있어 학습률과 batch 크기를 조정해야 합니다.", undefined, ["매 갱신에 전체 표본을 반드시 사용한다.", "일부 표본으로 gradient를 추정해 full-batch보다 자주 갱신한다.", "gradient를 계산하지 않는다.", "항상 단 한 번의 갱신으로 수렴한다."]),
  Q("nn-07", "회귀·신경망", "서술형", "고난도", "역전파가 계산 그래프와 연쇄법칙을 사용해 gradient를 구하는 과정을 서술하시오.", "순전파에서 각 연산의 입력과 출력을 계산 그래프에 저장한다. 이후 최종 손실에서 시작해 그래프를 역순으로 따라가며 국소 미분값을 연쇄법칙으로 곱해 각 파라미터에 대한 손실의 gradient를 누적한 뒤 optimizer가 이를 사용해 파라미터를 갱신한다.", "역전파는 gradient descent 자체가 아니라 gradient를 효율적으로 계산하는 알고리즘입니다. 계산된 gradient를 어떻게 쓸지는 optimizer가 결정합니다."),
  Q("nn-08", "회귀·신경망", "객관식", "고난도", "PyTorch 학습 루프의 올바른 순서는?", "zero_grad → forward → loss → backward → step", "이전 batch의 gradient가 누적되지 않도록 zero_grad로 초기화하고, 예측과 loss를 계산한 뒤 backward로 gradient를 구하고 step으로 파라미터를 갱신합니다.", undefined, ["forward → step → loss → backward → zero_grad", "zero_grad → forward → loss → backward → step", "loss → zero_grad → step → forward → backward", "backward → forward → zero_grad → step → loss"]),
  Q("nn-09", "회귀·신경망", "객관식", "고난도", "XᵀX가 가역일 때 선형회귀 최소제곱 추정량의 정규방정식 해는?", "β̂=(XᵀX)⁻¹Xᵀy", "RSS를 β로 미분해 0으로 두면 XᵀXβ=Xᵀy가 됩니다. XᵀX가 가역이라는 조건에서 양변에 역행렬을 곱해 닫힌형 해를 얻습니다.", undefined, ["β̂=(XᵀX)⁻¹Xᵀy", "β̂=XᵀXy", "β̂=(XXᵀ)Xy", "β̂=X+y"]),
  Q("nn-10", "회귀·신경망", "단답형", "핵심", "회귀계수 추정값이 2.4이고 표준오차가 0.6일 때, 귀무가설 β=0의 t 통계량을 정수로 작성하시오.", "4", "t 통계량은 (추정값-귀무가설 값)/표준오차입니다. (2.4-0)/0.6=4이며 절댓값이 클수록 0과 떨어진 정도가 큽니다."),
  Q("nn-11", "회귀·신경망", "객관식", "핵심", "잔차표준오차 RSE에 대한 설명으로 옳은 것은?", "잔차의 전형적인 크기를 목표값과 같은 단위로 나타낸다.", "잔차는 실제값-예측값 e_i=y_i-ŷ_i입니다. RSE는 잔차제곱합 RSS를 잔여 자유도로 나눈 값의 제곱근으로, 전형적 잔차 규모를 반응변수의 원래 단위로 나타냅니다.", undefined, ["잔차의 전형적인 크기를 목표값과 같은 단위로 나타낸다.", "분류 정확도와 항상 같다.", "파라미터 수와 무관하게 RSS 자체만 뜻한다.", "0과 1 사이의 확률만 반환한다."]),
  Q("nn-12", "회귀·신경망", "객관식", "고난도", "최대우도 추정에서 likelihood 대신 log-likelihood를 최적화해도 해가 같은 주된 이유는?", "log가 단조 증가하고 곱을 합으로 바꾸기 때문이다.", "로그는 양수 구간에서 단조 증가하므로 likelihood의 최대점 순서를 보존합니다. 동시에 많은 확률의 곱을 합으로 바꿔 미분과 수치 계산을 안정화합니다.", undefined, ["log가 단조 증가하고 곱을 합으로 바꾸기 때문이다.", "log를 취하면 모든 확률이 1이 되기 때문이다.", "log는 파라미터를 삭제하기 때문이다.", "likelihood는 음수라 직접 계산할 수 없기 때문이다."]),
  Q("nn-13", "회귀·신경망", "단답형", "핵심", "입력 3개, 은닉 ReLU 2개, 출력 1개인 fully connected 신경망의 weight와 bias를 합한 파라미터 수를 작성하시오.", "11", "입력-은닉 weight 3×2=6, 은닉 bias 2, 은닉-출력 weight 2×1=2, 출력 bias 1이므로 총 6+2+2+1=11개입니다."),
  Q("nn-14", "회귀·신경망", "객관식", "핵심", "다중분류 one-hot label y와 softmax 확률 p의 교차엔트로피가 -log p_true로 단순화되는 이유는?", "정답 class의 y만 1이고 나머지는 0이기 때문이다.", "교차엔트로피 -Σ y_c log p_c에서 one-hot label은 정답 class 항만 남깁니다. 따라서 정답 확률이 낮을수록 손실이 크게 증가합니다.", undefined, ["정답 class의 y만 1이고 나머지는 0이기 때문이다.", "모든 p가 항상 같다.", "softmax가 class 수를 1로 줄인다.", "log를 취하면 오답 확률이 모두 1이 된다."]),
  Q("nn-15", "회귀·신경망", "객관식", "고난도", "ReLU 신경망에서 깊이를 늘릴 때 나타날 수 있는 표현력 변화로 옳은 것은?", "비슷한 파라미터 수에서도 조합으로 더 많은 선형 영역을 만들 수 있다.", "깊은 구조는 앞 층의 꺾임을 뒤 층이 재조합해 선형 영역 수를 효율적으로 늘릴 수 있습니다. 하지만 깊이가 기울기 소실·폭발 같은 최적화 문제를 없애거나 일반화 성능을 항상 보장하지는 않습니다.", undefined, ["비슷한 파라미터 수에서도 조합으로 더 많은 선형 영역을 만들 수 있다.", "ReLU를 쓰면 층 수와 관계없이 항상 직선 하나만 표현한다.", "깊어질수록 파라미터가 반드시 0개가 된다.", "깊이는 계산 그래프와 무관하다."]),
  Q("nn-16", "회귀·신경망", "객관식", "핵심", "full-batch gradient descent와 mini-batch SGD의 비교로 옳은 것은?", "full-batch는 한 갱신에 전체 데이터를 쓰고 mini-batch는 일부 데이터로 더 자주 갱신한다.", "full-batch gradient는 안정적이지만 데이터가 크면 한 번의 갱신 비용이 큽니다. mini-batch는 일부 표본으로 잡음 있는 gradient를 계산해 메모리 효율과 갱신 빈도를 높입니다.", undefined, ["full-batch는 한 갱신에 전체 데이터를 쓰고 mini-batch는 일부 데이터로 더 자주 갱신한다.", "mini-batch는 gradient를 계산하지 않는다.", "full-batch는 표본 하나만 사용한다.", "두 방식은 batch 크기와 무관하게 완전히 동일하다."]),
  Q("nn-17", "회귀·신경망", "객관식", "사고형", "학습률이 지나치게 클 때 가장 일반적으로 나타날 수 있는 현상은?", "최솟값 주변을 건너뛰며 손실이 진동하거나 발산한다.", "학습률은 gradient 방향으로 이동하는 보폭입니다. 너무 크면 안정적인 하강 구간을 넘어가 손실이 커질 수 있고, 너무 작으면 수렴이 지나치게 느립니다.", undefined, ["최솟값 주변을 건너뛰며 손실이 진동하거나 발산한다.", "모든 gradient가 정확히 0이 된다.", "데이터 개수가 자동으로 늘어난다.", "모델이 항상 전역 최솟값에 즉시 도달한다."]),
  Q("nn-18", "회귀·신경망", "단답형", "고난도", "batch 입력 X의 shape가 (32, 10), 첫 Linear 층 weight W의 shape가 (10, 4)일 때 XW의 shape를 작성하시오.", "(32, 4)", "행렬곱의 내부 차원 10이 일치하고 바깥 차원 32와 4가 남습니다. 각 32개 표본이 10개 입력에서 4개 은닉 출력으로 변환됩니다."),
  Q("nn-19", "회귀·신경망", "객관식", "핵심", "PyTorch에서 nn.Module을 상속한 사용자 모델의 forward 메서드 역할은?", "입력 tensor가 layer를 통과해 출력을 만드는 순전파를 정의한다.", "__init__에는 학습 가능한 layer와 구성요소를 등록하고 forward에는 입력에서 출력까지의 계산을 정의합니다. model(x)를 호출하면 이 순전파가 실행됩니다.", undefined, ["입력 tensor가 layer를 통과해 출력을 만드는 순전파를 정의한다.", "optimizer의 학습률을 영구 고정한다.", "데이터 파일을 자동 다운로드한다.", "모든 gradient를 수동으로 숫자 입력한다."]),
  Q("nn-20", "회귀·신경망", "서술형", "사고형", "선형회귀와 로지스틱 회귀의 출력·가정·대표 손실 차이를 서술하시오.", "선형회귀는 입력의 선형결합으로 연속값의 조건부 평균을 예측하며 보통 제곱오차 또는 정규오차 가정의 음의 로그우도를 사용한다. 로지스틱 회귀는 선형 점수를 sigmoid에 통과시켜 이진 class의 확률을 만들고 Bernoulli 우도에 대응하는 binary cross-entropy를 최소화한다. 확률에 threshold를 적용하면 class 예측이 된다.", "이름에 회귀가 공통으로 들어가도 목표 변수와 출력 범위가 다릅니다. 선형 점수 이후의 연결함수와 likelihood가 달라지므로 손실과 해석도 구분됩니다."),
  Q("nn-21", "회귀·신경망", "객관식", "핵심", "다중회귀에서 설명변수 사이의 강한 다중공선성이 일으키는 대표적 문제는?", "회귀계수의 분산이 커져 추정과 개별 계수 해석이 불안정해진다.", "서로 강하게 연관된 feature는 같은 변동을 나누어 설명하므로 표본이 조금만 바뀌어도 계수 크기와 부호가 크게 달라질 수 있습니다. 예측 성능과 계수 해석 문제는 구분해 봐야 합니다.", undefined, ["회귀계수의 분산이 커져 추정과 개별 계수 해석이 불안정해진다.", "모든 잔차가 자동으로 0이 된다.", "설명변수 수가 반드시 한 개가 된다.", "분류 threshold가 자동으로 결정된다."]),
  Q("nn-22", "회귀·신경망", "객관식", "핵심", "sigmoid를 깊은 신경망의 활성화로 반복 사용할 때 기울기 소실이 생길 수 있는 이유는?", "출력이 0 또는 1에 가까운 포화 구간에서 미분값이 매우 작아지기 때문이다.", "sigmoid의 양끝 포화 영역에서는 도함수가 0에 가까워집니다. 역전파에서 작은 미분값이 여러 층에 걸쳐 곱해지면 앞쪽 층의 gradient가 사라질 수 있습니다.", undefined, ["출력이 0 또는 1에 가까운 포화 구간에서 미분값이 매우 작아지기 때문이다.", "출력이 항상 음수이기 때문이다.", "미분이 모든 입력에서 정확히 1이기 때문이다.", "sigmoid가 행렬곱을 금지하기 때문이다."]),
  Q("nn-23", "회귀·신경망", "단답형", "사고형", "음수 기울기 α=0.01인 Leaky ReLU에 -5를 입력한 출력을 작성하시오.", "-0.05", "Leaky ReLU는 양수에서 z, 음수에서 αz를 반환합니다. -5는 음수이므로 0.01×(-5)=-0.05이며 음수 영역의 gradient를 완전히 0으로 만들지 않습니다."),
  Q("nn-24", "회귀·신경망", "객관식", "사고형", "Grid Search와 Random Search의 비교로 옳은 것은?", "Grid Search는 정한 조합을 체계적으로 확인하고 Random Search는 탐색 공간에서 조합을 무작위 추출한다.", "Grid Search는 후보 격자의 모든 조합을 검사해 차원이 늘면 비용이 빠르게 커집니다. Random Search는 제한된 횟수 안에서 더 넓은 값 범위를 탐색할 수 있습니다.", undefined, ["Grid Search는 정한 조합을 체계적으로 확인하고 Random Search는 탐색 공간에서 조합을 무작위 추출한다.", "두 방법 모두 gradient를 계산해 weight만 갱신한다.", "Random Search는 후보를 전혀 평가하지 않는다.", "Grid Search는 test set으로만 모델을 학습한다."]),

  Q("nlp-01", "NLP·Transformer", "객관식", "기초", "one-hot 표현의 주요 한계는?", "차원이 크고 단어 사이의 의미 유사도를 담지 못한다.", "one-hot은 어휘 크기와 같은 차원의 희소 벡터입니다. 다른 단어 벡터가 모두 직교하여 의미적으로 가까운 단어도 유사하게 표현되지 않습니다.", undefined, ["차원이 크고 단어 사이의 의미 유사도를 담지 못한다.", "항상 문맥 정보를 너무 많이 담는다.", "정수 인덱스를 저장할 수 없다.", "학습된 파라미터가 반드시 필요하다."]),
  Q("nlp-02", "NLP·Transformer", "객관식", "핵심", "Skip-gram의 학습 목표는?", "중심 단어로 주변 단어를 예측한다.", "CBOW는 주변 단어로 중심 단어를, Skip-gram은 중심 단어로 주변 단어를 예측합니다. 학습된 weight를 밀집 embedding으로 사용합니다.", undefined, ["중심 단어로 주변 단어를 예측한다.", "주변 단어로 중심 단어를 예측한다.", "다음 문장의 label을 예측한다.", "문서의 길이를 예측한다."]),
  Q("nlp-03", "NLP·Transformer", "객관식", "핵심", "LSTM이 기본 RNN보다 긴 의존성을 다루는 데 도움을 주는 핵심 장치는?", "cell state와 input·forget·output gate", "LSTM은 cell state를 정보 전달 통로로 두고 gate가 정보를 쓰고, 지우고, 출력할 비율을 조절합니다. 이로써 단순 RNN의 vanishing gradient 문제를 완화합니다.", undefined, ["cell state와 input·forget·output gate", "K-means centroid", "convolution kernel", "beam width만"]),
  Q("nlp-04", "NLP·Transformer", "객관식", "핵심", "Seq2Seq 학습에서 teacher forcing의 설명으로 옳은 것은?", "decoder의 다음 입력으로 이전 정답 토큰을 사용한다.", "teacher forcing은 학습 때 decoder가 자신의 이전 예측 대신 실제 정답 토큰을 다음 입력으로 받는 방법입니다. 학습은 안정적이지만 추론과의 차이가 생깁니다.", undefined, ["decoder의 다음 입력으로 이전 정답 토큰을 사용한다.", "encoder 파라미터를 모두 고정한다.", "추론 때만 정답 문장을 제공한다.", "손실을 계산하지 않는다."]),
  Q("nlp-05", "NLP·Transformer", "단답형", "핵심", "Scaled dot-product attention에서 QKᵀ를 나누는 값을 기호로 작성하시오.", "√d_k", "key 차원 d_k가 커지면 dot product의 크기가 커져 softmax가 포화할 수 있습니다. √d_k로 나누어 logit 스케일을 안정화합니다."),
  Q("nlp-06", "NLP·Transformer", "객관식", "핵심", "self-attention에서 Q, K, V는 어디에서 만들어지는가?", "같은 입력 시퀀스의 서로 다른 선형 변환에서 만들어진다.", "self-attention은 하나의 시퀀스가 자신 내부의 다른 위치를 참조하는 연산입니다. 같은 입력 X에 W_Q, W_K, W_V를 각각 곱해 Q, K, V를 생성합니다.", undefined, ["같은 입력 시퀀스의 서로 다른 선형 변환에서 만들어진다.", "Q는 encoder, K와 V는 다른 문서에서만 온다.", "V는 항상 one-hot 벡터다.", "Q, K, V는 학습하지 않는 상수다."]),
  Q("nlp-07", "NLP·Transformer", "객관식", "핵심", "decoder-only Transformer의 causal mask 목적은?", "현재 토큰이 미래 토큰을 보지 못하게 한다.", "자기회귀 학습에서 위치 t의 예측은 t보다 뒤의 정답 토큰을 참조하면 안 됩니다. causal mask는 attention logit의 미래 위치를 차단해 인과적 생성을 보장합니다.", undefined, ["현재 토큰이 미래 토큰을 보지 못하게 한다.", "padding 토큰만 삭제한다.", "embedding 차원을 줄인다.", "학습률을 자동으로 결정한다."]),
  Q("nlp-08", "NLP·Transformer", "객관식", "고난도", "BERT 사전학습의 MLM에서 선택된 토큰의 처리 비율로 옳은 것은?", "80% [MASK], 10% 무작위 토큰, 10% 원본 유지", "전체 토큰의 약 15%를 예측 대상으로 고르고, 그중 80%는 [MASK], 10%는 무작위 토큰, 10%는 원본을 유지합니다. 추론 때 [MASK]가 없는 차이를 완화합니다.", undefined, ["100% [MASK]", "80% [MASK], 10% 무작위 토큰, 10% 원본 유지", "50% 삭제, 50% 원본 유지", "15% [CLS], 85% [SEP]"]),
  Q("nlp-09", "NLP·Transformer", "서술형", "고난도", "RNN과 Transformer의 시퀀스 처리 차이를 병렬성과 장기 의존성 관점에서 서술하시오.", "RNN은 이전 hidden state를 다음 시점에 전달하므로 시퀀스를 순차적으로 처리해 병렬화가 제한되고 긴 거리에서 gradient 소실이 발생할 수 있다. Transformer는 self-attention으로 모든 위치 사이의 관계를 직접 계산해 학습 병렬성과 장기 관계 모델링을 개선하지만 길이 N에 대한 attention 메모리 비용이 일반적으로 O(N²)이다.", "두 구조는 정보 전달 경로와 계산량 특성이 다릅니다. Transformer가 항상 더 좋다고만 쓰지 말고 장단점을 함께 설명해야 합니다."),
  Q("nlp-10", "NLP·Transformer", "객관식", "핵심", "subword tokenization의 장점으로 옳은 것은?", "희귀어를 더 작은 단위로 나누어 OOV 문제를 줄인다.", "subword 방식은 자주 등장하는 문자열은 하나의 토큰으로 유지하고 희귀한 단어는 여러 조각으로 분해합니다. 고정 어휘로 새로운 단어를 표현하면서 문자 단위보다 길이를 줄일 수 있습니다.", undefined, ["희귀어를 더 작은 단위로 나누어 OOV 문제를 줄인다.", "모든 문장을 반드시 토큰 하나로 만든다.", "단어 순서를 완전히 삭제한다.", "어휘 크기를 무한대로 만들어야 한다."]),
  Q("nlp-11", "NLP·Transformer", "단답형", "기초", "어휘 크기 V, embedding 차원 d일 때 embedding weight 행렬의 shape를 쉼표 뒤 한 칸을 포함해 작성하시오.", "(V, d)", "각 어휘 항목마다 길이 d인 하나의 밀집 벡터를 저장합니다. 따라서 행은 V개 토큰, 열은 d개 embedding 성분으로 구성됩니다."),
  Q("nlp-12", "NLP·Transformer", "객관식", "기초", "CBOW의 학습 목표는?", "주변 단어들로 중심 단어를 예측한다.", "CBOW는 window 안의 주변 단어 표현을 결합해 가운데 단어를 예측합니다. 반대로 Skip-gram은 중심 단어에서 주변 단어를 예측합니다.", undefined, ["주변 단어들로 중심 단어를 예측한다.", "중심 단어로 주변 단어를 각각 예측한다.", "문장 길이만 예측한다.", "토큰을 알파벳순으로 정렬한다."]),
  Q("nlp-13", "NLP·Transformer", "객관식", "핵심", "기본 RNN의 hidden state h_t에 직접 사용되는 정보의 조합은?", "현재 입력 x_t와 이전 hidden state h_{t-1}", "RNN은 같은 파라미터를 시점마다 공유하며 현재 입력과 직전 hidden state를 결합해 새 상태를 만듭니다. 이 순환 연결이 과거 정보를 전달합니다.", undefined, ["현재 입력 x_t와 이전 hidden state h_{t-1}", "미래 입력 x_{t+1}만", "전체 label의 평균만", "현재 출력의 정답만"]),
  Q("nlp-14", "NLP·Transformer", "객관식", "사고형", "긴 시퀀스에서 기본 RNN의 gradient가 매우 작아지는 주된 원인은?", "여러 시점의 Jacobian이 반복 곱해지며 크기가 줄어들 수 있기 때문이다.", "BPTT에서는 시간축을 따라 미분값이 반복 곱해집니다. 곱의 크기가 계속 1보다 작으면 vanishing, 크면 exploding gradient가 발생할 수 있습니다.", undefined, ["여러 시점의 Jacobian이 반복 곱해지며 크기가 줄어들 수 있기 때문이다.", "token index가 항상 음수이기 때문이다.", "softmax가 문자열을 반환하기 때문이다.", "hidden state가 label과 완전히 같기 때문이다."]),
  Q("nlp-15", "NLP·Transformer", "객관식", "핵심", "GRU가 LSTM과 비교해 갖는 일반적 구조 특징은?", "cell state를 별도로 두지 않고 update·reset gate로 상태를 조절한다.", "GRU는 hidden state를 중심으로 update와 reset gate를 사용하며 LSTM보다 gate와 상태 구조가 단순합니다. 두 모델 모두 장기 의존성 학습을 돕습니다.", undefined, ["cell state를 별도로 두지 않고 update·reset gate로 상태를 조절한다.", "gate가 전혀 없는 완전한 선형모델이다.", "항상 Transformer보다 파라미터가 많다.", "입력 순서를 사용할 수 없다."]),
  Q("nlp-16", "NLP·Transformer", "객관식", "핵심", "기본 encoder-decoder Seq2Seq에서 attention이 필요한 핵심 이유는?", "모든 입력 정보를 하나의 고정 길이 벡터에 압축하는 병목을 줄이기 위해서다.", "attention은 decoder 시점마다 encoder의 여러 hidden state를 다른 가중치로 결합합니다. 긴 입력을 단일 context vector에만 압축할 때 생기는 정보 손실을 완화합니다.", undefined, ["모든 입력 정보를 하나의 고정 길이 벡터에 압축하는 병목을 줄이기 위해서다.", "단어를 무조건 one-hot으로 바꾸기 위해서다.", "출력 문장의 순서를 없애기 위해서다.", "loss 계산을 완전히 제거하기 위해서다."]),
  Q("nlp-17", "NLP·Transformer", "객관식", "고난도", "multi-head attention을 사용하는 이유로 옳은 것은?", "서로 다른 표현 부분공간의 관계를 여러 head가 병렬로 포착하게 한다.", "각 head는 별도의 Q, K, V 투영을 사용해 위치·문법·의미 등 다른 관계에 집중할 수 있습니다. head 출력은 이어 붙인 뒤 다시 선형 변환합니다.", undefined, ["서로 다른 표현 부분공간의 관계를 여러 head가 병렬로 포착하게 한다.", "입력 토큰을 head 수만큼 삭제한다.", "softmax를 사용하지 않기 위해서다.", "항상 계산량을 0으로 만들기 위해서다."]),
  Q("nlp-18", "NLP·Transformer", "단답형", "핵심", "순환 구조가 없는 Transformer에 토큰의 순서 정보를 더하는 구성요소를 한글로 작성하시오.", "위치 인코딩", "self-attention 자체는 입력 순열에 대한 위치를 자동으로 구분하지 못합니다. 위치 인코딩 또는 학습된 위치 embedding을 토큰 표현에 더해 순서를 제공합니다."),
  Q("nlp-19", "NLP·Transformer", "객관식", "핵심", "BERT의 기본 구조와 적합한 작업 연결로 옳은 것은?", "양방향 Transformer encoder이며 문장 이해·분류에 적합하다.", "BERT는 좌우 문맥을 함께 보는 encoder stack으로 사전학습됩니다. 문장 분류, token 분류, 질의응답처럼 입력 이해가 중요한 작업에 fine-tuning할 수 있습니다.", undefined, ["양방향 Transformer encoder이며 문장 이해·분류에 적합하다.", "causal decoder만 사용하며 미래 토큰을 항상 본다.", "RNN gate만으로 구성되며 이미지를 생성한다.", "군집 centroid를 학습하는 비지도 알고리즘이다."]),
  Q("nlp-20", "NLP·Transformer", "객관식", "고난도", "T5의 span corruption 사전학습 절차로 옳은 것은?", "연속된 span을 sentinel 토큰으로 바꾸고 decoder가 삭제된 span들을 복원한다.", "입력의 연속 구간을 제거하고 각 구간 자리에 서로 다른 sentinel을 둡니다. decoder target은 sentinel과 원래 span을 이어 복원하도록 구성되어 모든 작업을 text-to-text로 다룹니다.", undefined, ["연속된 span을 sentinel 토큰으로 바꾸고 decoder가 삭제된 span들을 복원한다.", "모든 token을 그대로 복사하고 loss를 계산하지 않는다.", "문장마다 centroid를 하나 선택한다.", "오직 다음 문장 순서만 이진 분류한다."]),
  Q("nlp-21", "NLP·Transformer", "객관식", "핵심", "분포 가설(distributional hypothesis)의 핵심 생각으로 옳은 것은?", "비슷한 문맥에 등장하는 단어는 비슷한 의미를 가질 가능성이 높다.", "Word2Vec 같은 분포 기반 표현은 단어의 사전 정의를 직접 입력받기보다 주변 단어와의 동시출현 패턴에서 의미 관계를 학습합니다.", undefined, ["비슷한 문맥에 등장하는 단어는 비슷한 의미를 가질 가능성이 높다.", "모든 단어는 문맥과 무관하게 같은 의미를 가진다.", "단어 의미는 글자 수만으로 결정된다.", "희귀 단어는 항상 가장 높은 확률을 가진다."]),
  Q("nlp-22", "NLP·Transformer", "객관식", "사고형", "N-gram 언어모델의 대표적인 한계는?", "고정된 짧은 문맥만 사용하고 보지 못한 조합에서 희소성 문제가 커진다.", "N-gram은 다음 단어 확률을 직전 N-1개 단어의 빈도로 추정합니다. N이 커질수록 가능한 조합이 폭증해 관측되지 않은 문맥이 많아지고 긴 거리 관계도 직접 반영하기 어렵습니다.", undefined, ["고정된 짧은 문맥만 사용하고 보지 못한 조합에서 희소성 문제가 커진다.", "학습 데이터가 없어도 모든 문장 확률을 정확히 안다.", "항상 문서 전체를 하나의 token으로 처리한다.", "순서 정보를 전혀 사용하지 않는다."]),
  Q("nlp-23", "NLP·Transformer", "객관식", "고난도", "Transformer 블록의 residual connection이 주는 주된 이점은?", "입력을 우회 경로로 전달해 정보와 gradient 흐름을 돕는다.", "잔차 연결은 sublayer 출력에 입력을 더해 identity에 가까운 경로를 제공합니다. 깊은 네트워크에서 정보 보존과 gradient 전달을 돕지만 모든 최적화 문제를 자동으로 없애지는 않습니다.", undefined, ["입력을 우회 경로로 전달해 정보와 gradient 흐름을 돕는다.", "모든 attention weight를 0으로 만든다.", "token 순서를 무작위로 섞는다.", "vocabulary를 한 단어로 줄인다."]),
  Q("nlp-24", "NLP·Transformer", "객관식", "고난도", "encoder-decoder Transformer의 cross-attention에서 Q, K, V의 출처로 옳은 것은?", "Q는 decoder 상태, K와 V는 encoder 출력에서 만든다.", "decoder는 현재 생성 상태를 query로 사용해 encoder가 표현한 입력 sequence의 key와 value를 조회합니다. 이 연결이 번역·요약에서 출력 시점마다 입력의 관련 부분을 참조하게 합니다.", undefined, ["Q는 decoder 상태, K와 V는 encoder 출력에서 만든다.", "Q, K, V는 모두 label에서만 만든다.", "Q는 encoder 출력, K와 V는 임의의 상수다.", "K만 decoder에서 만들고 Q와 V는 삭제한다."]),

  Q("llm-01", "LLM·평가·안전", "객관식", "기초", "Foundation Model의 특징으로 옳은 것은?", "대규모 데이터로 사전학습한 후 다양한 하위 작업에 적용한다.", "Foundation Model은 광범위한 데이터와 큰 모델로 일반 표현을 학습한 뒤 fine-tuning, prompting, ICL 등으로 여러 작업에 재사용합니다.", undefined, ["대규모 데이터로 사전학습한 후 다양한 하위 작업에 적용한다.", "하나의 고정된 분류 작업만 수행한다.", "항상 규칙 기반으로만 작동한다.", "사전학습 없이 하위 작업을 먼저 학습한다."]),
  Q("llm-02", "LLM·평가·안전", "객관식", "핵심", "Scaling Law에 대한 설명으로 옳은 것은?", "모델·데이터·계산량이 커질수록 일반적으로 loss가 예측 가능한 패턴으로 감소한다.", "스케일링 법칙은 자원과 성능의 경험적 관계를 설명합니다. 다만 데이터 품질, 학습 설정, 평가와 안전 문제가 자동으로 해결된다는 뜻은 아닙니다.", undefined, ["모델·데이터·계산량이 커질수록 일반적으로 loss가 예측 가능한 패턴으로 감소한다.", "모델이 커지면 모든 환각이 사라진다.", "데이터 양은 성능과 관계없다.", "계산량이 늘면 loss가 항상 0이 된다."]),
  Q("llm-03", "LLM·평가·안전", "단답형", "핵심", "perplexity는 평균 negative log-likelihood에 어떤 함수를 적용한 값인지 영문 함수명을 작성하시오.", "exp", "PPL = exp(평균 negative log-likelihood)입니다. 낮을수록 모델이 정답 토큰에 더 높은 확률을 부여했다는 뜻이지만 사실성·안전을 직접 보장하지는 않습니다."),
  Q("llm-04", "LLM·평가·안전", "객관식", "핵심", "RLHF의 Reward Model이 학습하는 주요 신호는?", "사람이 비교한 두 답변 사이의 선호", "사람이 여러 답변을 비교·순위화한 데이터로 reward model이 선호 점수를 학습합니다. 이 reward로 policy를 최적화하지만 사람 선호가 절대적 진실은 아닙니다.", undefined, ["사람이 비교한 두 답변 사이의 선호", "다음 토큰의 one-hot 벡터", "모델의 파라미터 수", "API 응답 시간만"]),
  Q("llm-05", "LLM·평가·안전", "객관식", "핵심", "temperature를 0에 가깝게 낮춘 디코딩의 일반적 특징은?", "확률분포가 더 날카로워져 결과가 일관적이고 greedy에 가까워진다.", "temperature가 낮으면 높은 확률 토큰에 더 강하게 집중합니다. 재현성은 높아지지만 항상 정확한 답이라는 의미는 아닙니다.", undefined, ["확률분포가 더 날카로워져 결과가 일관적이고 greedy에 가까워진다.", "모든 토큰의 확률이 같아진다.", "반드시 창의성과 정확성이 동시에 높아진다.", "context window가 늘어난다."]),
  Q("llm-06", "LLM·평가·안전", "객관식", "고난도", "LLM-as-a-Judge의 알려진 편향으로 보기 어려운 것은?", "표본 평균이 항상 0이 되는 편향", "LLM 평가자는 답변 순서에 따른 position bias, 긴 답을 선호하는 length bias, 자신과 유사한 답을 선호하는 self-bias를 보일 수 있습니다. 순서 교체와 복수 평가로 완화합니다.", undefined, ["position bias", "length bias", "self-bias", "표본 평균이 항상 0이 되는 편향"]),
  Q("llm-07", "LLM·평가·안전", "객관식", "핵심", "System prompt에 대한 설명으로 옳은 것은?", "모델의 역할·기본 행동·제약을 지시하지만 반영을 완전히 보장하지는 않는다.", "지시는 시스템 프롬프트와 사용자 요청이 함께 구성합니다. 시스템 프롬프트는 학습 후 행동을 추가 제어하지만 모델의 환각·제약 누락 가능성 때문에 검증이 필요합니다.", undefined, ["모델의 역할·기본 행동·제약을 지시하지만 반영을 완전히 보장하지는 않는다.", "모델의 파라미터를 영구적으로 변경한다.", "user query보다 항상 나중에 입력된다.", "모든 jailbreak을 완전히 차단한다."]),
  Q("llm-08", "LLM·평가·안전", "단답형", "핵심", "통제된 질문 집합에서 두 문장 embedding u, v의 유사도를 측정할 때 사용하는 대표적 지표를 한글로 작성하시오.", "코사인 유사도", "코사인 유사도는 u·v / (||u|| ||v||)로 두 벡터의 방향 유사성을 측정합니다. 문장 embedding의 의미적 유사도를 수치화할 때 자주 사용합니다."),
  Q("llm-09", "LLM·평가·안전", "서술형", "사고형", "LLM 환각의 의미와 실제 시스템에서의 완화 방법을 서술하시오.", "LLM 환각은 모델이 사실과 다르거나 근거가 없는 내용을 자신 있게 생성하는 현상이다. 최신·전문 정보는 RAG로 검색 근거를 제공하고 근거 표시와 후처리 검증을 요구하며, 중요한 의사결정은 사람이 원문을 확인해야 한다. 평가용 테스트셋으로 사실성을 계속 측정하고 모델이 모르는 경우를 표현하게 하는 지시도 사용한다.", "프롬프트만으로 환각을 0으로 만들 수는 없습니다. 근거 검색, 검증, 평가, 사람 검토를 겹친 시스템 설계가 필요합니다."),
  Q("llm-10", "LLM·평가·안전", "객관식", "기초", "자기회귀 언어모델의 기본 사전학습 목표는?", "이전 token들이 주어졌을 때 다음 token의 확률을 높이는 것", "자기회귀 모델은 문장을 왼쪽에서 오른쪽으로 분해하여 각 위치에서 앞선 token을 조건으로 다음 token의 log-likelihood를 최대화합니다.", undefined, ["이전 token들이 주어졌을 때 다음 token의 확률을 높이는 것", "문서마다 K-means 군집을 정하는 것", "모든 token을 동시에 삭제하는 것", "label 없이 회귀 직선을 맞추는 것"]),
  Q("llm-11", "LLM·평가·안전", "객관식", "사고형", "emergent ability에 대한 신중한 설명으로 옳은 것은?", "규모가 커지며 특정 평가 성능이 급격히 나타나 보일 수 있으나 지표와 측정 해상도의 영향도 검토해야 한다.", "일부 능력은 임계 규모 이후 갑자기 생긴 것처럼 관측됩니다. 그러나 연속적인 확률 개선이 이산 점수에서 급변해 보일 수도 있어 평가 방식과 재현성을 함께 확인해야 합니다.", undefined, ["규모가 커지며 특정 평가 성능이 급격히 나타나 보일 수 있으나 지표와 측정 해상도의 영향도 검토해야 한다.", "모델 크기가 늘면 모든 능력이 정확히 같은 비율로 증가한다.", "emergence는 환각이 완전히 사라졌다는 뜻이다.", "작은 모델에는 어떠한 언어 능력도 존재할 수 없다."]),
  Q("llm-12", "LLM·평가·안전", "객관식", "핵심", "in-context learning과 fine-tuning의 차이로 옳은 것은?", "ICL은 prompt 예시로 행동을 유도하며 모델 weight를 갱신하지 않는다.", "ICL은 입력 context에 지시와 예시를 넣어 추론 시 행동을 바꾸지만 파라미터는 그대로입니다. fine-tuning은 학습 데이터로 weight를 실제 갱신합니다.", undefined, ["ICL은 prompt 예시로 행동을 유도하며 모델 weight를 갱신하지 않는다.", "ICL은 반드시 모든 weight를 재학습한다.", "fine-tuning은 입력 prompt만 길게 만든다.", "두 방법 모두 항상 동일한 계산과 결과를 낸다."]),
  Q("llm-13", "LLM·평가·안전", "객관식", "핵심", "SFT의 주된 목적은?", "지시와 모범 응답 쌍으로 원하는 응답 형식을 지도학습하는 것", "Supervised Fine-Tuning은 사람이 작성하거나 선별한 지시-응답 예시에 대한 token loss를 줄여 기본 모델이 지시를 따르는 응답 패턴을 갖게 합니다.", undefined, ["지시와 모범 응답 쌍으로 원하는 응답 형식을 지도학습하는 것", "reward model 없이 무작위 token만 생성하는 것", "모델 파라미터 수를 자동으로 절반 삭제하는 것", "검색 색인을 만드는 것만"]),
  Q("llm-14", "LLM·평가·안전", "객관식", "고난도", "RLHF policy 최적화에서 기준 모델과의 KL 패널티를 두는 이유는?", "reward만 쫓아 언어 품질이 무너지거나 기준 policy에서 과도하게 벗어나는 것을 막기 위해서다.", "reward model은 완전하지 않아 policy가 허점을 이용할 수 있습니다. KL 제약은 업데이트된 분포가 참조 모델에서 지나치게 멀어지는 것을 제한해 안정성을 높입니다.", undefined, ["reward만 쫓아 언어 품질이 무너지거나 기준 policy에서 과도하게 벗어나는 것을 막기 위해서다.", "context 길이를 무한대로 만들기 위해서다.", "모든 응답 확률을 동일하게 만들기 위해서다.", "tokenizer를 제거하기 위해서다."]),
  Q("llm-15", "LLM·평가·안전", "객관식", "핵심", "beam search의 설명으로 옳은 것은?", "각 단계에서 누적 점수가 높은 여러 후보 시퀀스를 유지한다.", "greedy는 매 단계 최고 확률 token 하나만 고르지만 beam search는 beam width만큼 가설을 유지해 전체 시퀀스 점수가 더 나은 경로를 탐색합니다.", undefined, ["각 단계에서 누적 점수가 높은 여러 후보 시퀀스를 유지한다.", "확률을 무시하고 항상 무작위 token만 뽑는다.", "모델 weight를 매 token마다 재학습한다.", "입력 문서를 embedding하지 않는다."]),
  Q("llm-16", "LLM·평가·안전", "객관식", "고난도", "top-p sampling에 대한 설명으로 옳은 것은?", "누적 확률이 p 이상이 되는 최소 후보 집합에서 표본을 뽑는다.", "nucleus sampling은 고정된 후보 개수 대신 확률분포 모양에 따라 후보 집합 크기를 바꿉니다. top-k는 항상 상위 k개만 남긴다는 점이 다릅니다.", undefined, ["누적 확률이 p 이상이 되는 최소 후보 집합에서 표본을 뽑는다.", "항상 정확히 p개의 token만 남긴다.", "최저 확률 token 하나만 고른다.", "temperature와 무관하게 모든 확률을 0으로 만든다."]),
  Q("llm-17", "LLM·평가·안전", "객관식", "핵심", "생성 평가 지표의 연결로 옳은 것은?", "BLEU는 n-gram 정밀도 중심, ROUGE는 기준 요약과의 재현 중심으로 많이 쓰인다.", "BLEU는 번역에서 n-gram precision과 길이 패널티를, ROUGE는 요약에서 겹치는 단위의 recall을 중심으로 사용합니다. 둘 다 의미·사실성을 완전히 측정하지는 못합니다.", undefined, ["BLEU는 n-gram 정밀도 중심, ROUGE는 기준 요약과의 재현 중심으로 많이 쓰인다.", "BLEU와 ROUGE는 모델의 메모리 사용량만 측정한다.", "ROUGE는 항상 사람 평가와 완전히 일치한다.", "BLEU는 안전 위반을 직접 판정한다."]),
  Q("llm-18", "LLM·평가·안전", "단답형", "핵심", "언어모델이 정답 token에 부여한 확률을 평가하는 값으로, 낮을수록 좋은 대표 지표의 영문명을 작성하시오.", "perplexity", "perplexity는 평균 negative log-likelihood의 지수값입니다. 확률 예측 품질을 나타내지만 생성문의 사실성, 유용성, 편향, 안전을 단독으로 판단할 수 없습니다."),
  Q("llm-19", "LLM·평가·안전", "객관식", "사고형", "benchmark contamination이 성능 평가를 왜곡하는 경우는?", "평가 문항이나 매우 유사한 데이터가 사전학습·튜닝 데이터에 포함된 경우", "모델이 평가 항목을 학습 중 이미 보았다면 일반화가 아니라 기억으로 높은 점수를 낼 수 있습니다. 중복 탐지, 비공개 test, 시간 분할 등으로 위험을 줄입니다.", undefined, ["평가 문항이나 매우 유사한 데이터가 사전학습·튜닝 데이터에 포함된 경우", "평가 데이터가 모델 학습 이후 새로 작성된 경우", "사람 평가자가 기준표를 사용하는 경우", "여러 난이도의 문항을 함께 쓰는 경우"]),
  Q("llm-20", "LLM·평가·안전", "서술형", "고난도", "RAG와 fine-tuning이 해결하는 문제가 어떻게 다른지, 최신 사내 지식 질의 시스템에서는 어떤 조합이 적절한지 서술하시오.", "RAG는 질의 시점에 외부 지식을 검색해 context에 넣으므로 자주 바뀌는 사실을 갱신하고 근거를 연결하는 데 적합하다. fine-tuning은 모델 weight를 바꿔 응답 형식·용어·행동 패턴을 안정화하지만 최신 사실을 안전하게 저장하는 방법은 아니다. 사내 시스템은 권한이 적용된 검색과 RAG로 지식을 제공하고 필요하면 SFT로 형식을 맞춘 뒤, 검색 실패와 생성 사실성을 별도로 평가하는 조합이 적절하다.", "검색은 지식 공급, fine-tuning은 행동 적응이라는 역할 분리가 핵심입니다. 두 방법 모두 접근제어, 문서 품질, 평가와 사람 검토를 자동으로 해결하지는 않습니다."),
  Q("llm-21", "LLM·평가·안전", "객관식", "핵심", "top-k sampling과 top-p sampling의 차이로 옳은 것은?", "top-k는 후보 개수를 고정하고 top-p는 누적 확률에 따라 후보 개수가 달라진다.", "top-k는 확률 상위 k개 token만 남깁니다. top-p는 누적 확률이 p를 넘는 최소 집합을 사용하므로 분포가 뾰족한지 평평한지에 따라 후보 수가 달라집니다.", undefined, ["top-k는 후보 개수를 고정하고 top-p는 누적 확률에 따라 후보 개수가 달라진다.", "top-k와 top-p는 항상 greedy와 완전히 같다.", "top-p의 p는 남길 token 개수다.", "두 방법 모두 모델 weight를 다시 학습한다."]),
  Q("llm-22", "LLM·평가·안전", "객관식", "사고형", "모호성을 줄이는 프롬프트 구성으로 가장 적절한 것은?", "역할·작업·입력 경계·제약·출력 형식과 필요한 예시를 구분해 제시한다.", "좋은 프롬프트는 해야 할 일과 제공 데이터, 금지 사항, 출력 schema를 분리합니다. few-shot 예시는 실제 입력과 유사하고 정답 형식이 일관되어야 합니다.", undefined, ["역할·작업·입력 경계·제약·출력 형식과 필요한 예시를 구분해 제시한다.", "서로 충돌하는 지시를 설명 없이 반복한다.", "입력 데이터와 명령을 구분하지 않는다.", "원하는 출력 형식을 숨긴다."]),
  Q("llm-23", "LLM·평가·안전", "객관식", "고난도", "jailbreaking에 대한 설명과 대응의 연결로 옳은 것은?", "안전 제약을 우회하도록 모델을 유도하는 공격이며 권한 제한·입력 분리·출력 검증·공격 평가를 함께 적용한다.", "jailbreak는 역할극, 인코딩, 다단계 지시 등으로 모델의 안전 행동을 우회하려는 입력입니다. 단일 금지 문구로 완전히 막기 어려워 도구 권한, 검증, 모니터링과 반복 평가가 필요합니다.", undefined, ["안전 제약을 우회하도록 모델을 유도하는 공격이며 권한 제한·입력 분리·출력 검증·공격 평가를 함께 적용한다.", "모델 크기를 측정하는 정상 benchmark다.", "temperature를 0으로 하면 모든 jailbreak가 완전히 차단된다.", "학습 데이터의 중복을 제거하는 전처리만 뜻한다."]),
  Q("llm-24", "LLM·평가·안전", "객관식", "사고형", "LLM 평가 설계를 구성하는 핵심 세 요소의 연결로 가장 적절한 것은?", "대표성 있는 평가 데이터, 목적에 맞는 지표, 재현 가능한 평가 프로토콜", "평가 점수는 문항 분포, metric 정의, prompt와 decoding 및 채점 절차에 따라 달라집니다. 세 요소를 함께 고정하고 오류 유형과 신뢰구간도 확인해야 비교가 의미 있습니다.", undefined, ["대표성 있는 평가 데이터, 목적에 맞는 지표, 재현 가능한 평가 프로토콜", "모델 이름, 로고 색상, 파일 확장자", "학습률, 브라우저 크기, 운영체제 이름", "token 하나, 정답 하나, 평가자 없음"]),
  ...visionQuestions as Question[],
];

const questionBank: Question[] = rawPracticeQuestionBank.map((question) => {
  const override = choiceBalanceOverrides[question.id];
  return {
    ...question,
    ...(override ? { answer: override.answer, choices: override.choices } : {}),
    explanation: expandExplanation(question),
  };
});

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function checkAnswer(question: Question, answer: string) {
  if (question.kind === "서술형") return false;
  if (question.kind === "객관식") return answer === question.answer;
  return checkShortAnswer(question.answer, answer);
}

function formatTime(seconds: number) {
  const minute = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const second = (seconds % 60).toString().padStart(2, "0");
  return `${minute}:${second}`;
}

function readStoredArray<T>(key: string): T[] {
  try {
    const value = localStorage.getItem(key);
    if (!value) return [];
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const [view, setView] = useState<"home" | "exam" | "result">("home");
  const [selected, setSelected] = useState<Category[]>(defaultCategories);
  const [selectedKinds, setSelectedKinds] = useState<Kind[]>(kinds);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>(difficulties);
  const [count, setCount] = useState<QuestionCount>(20);
  const [minutes, setMinutes] = useState<TimeLimit>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [marked, setMarked] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [seconds, setSeconds] = useState<number | null>(null);
  const [history, setHistory] = useState<History[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [wrongIds, setWrongIds] = useState<string[]>([]);

  const latestRef = useRef({ questions, answers, wrongIds, history, selected });
  useEffect(() => {
    latestRef.current = { questions, answers, wrongIds, history, selected };
  }, [questions, answers, wrongIds, history, selected]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setHistory(readStoredArray<History>("ai-eval-history"));
      setMarked(readStoredArray<string>("ai-eval-bookmarks"));
      setWrongIds(readStoredArray<string>("ai-eval-wrong"));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const submitExam = useCallback(() => {
    const live = latestRef.current;
    const liveResults = live.questions.map((question) => ({
      question,
      graded: question.kind !== "서술형",
      correct:
        question.kind !== "서술형" &&
        checkAnswer(question, live.answers[question.id] ?? ""),
    }));
    const objectiveResults = liveResults.filter((item) => item.graded);
    const liveScore = objectiveResults.filter((item) => item.correct).length;
    const currentQuestionIds = liveResults.map((item) => item.question.id);
    const newlyWrong = liveResults
      .filter((item) => !item.graded || !item.correct)
      .map((item) => item.question.id);
    const nextWrong = [
      ...live.wrongIds.filter((id) => !currentQuestionIds.includes(id)),
      ...newlyWrong,
    ];
    const nextHistory = objectiveResults.length
      ? [
          {
            date: new Date().toLocaleDateString("ko-KR", {
              month: "short",
              day: "numeric",
            }),
            score: liveScore,
            total: objectiveResults.length,
            mode: live.selected.length === categories.length ? "전 범위" : "집중 학습",
          },
          ...live.history,
        ].slice(0, 8)
      : live.history;

    setSubmitted(true);
    setWrongIds(nextWrong);
    setHistory(nextHistory);
    localStorage.setItem("ai-eval-wrong", JSON.stringify(nextWrong));
    localStorage.setItem("ai-eval-history", JSON.stringify(nextHistory));
    setView("result");
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [view]);

  const timerActive = view === "exam" && !submitted && seconds !== null;

  useEffect(() => {
    if (!timerActive) return;
    const timer = window.setInterval(() => {
      setSeconds((value) => {
        if (value === null) return null;
        if (value <= 1) {
          window.clearInterval(timer);
          window.setTimeout(() => submitExam(), 0);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timerActive, submitExam]);

  const results = useMemo(
    () =>
      questions.map((question) => ({
        question,
        graded: question.kind !== "서술형",
        correct:
          question.kind !== "서술형" &&
          checkAnswer(question, answers[question.id] ?? ""),
      })),
    [questions, answers],
  );
  const gradedResults = results.filter((item) => item.graded);
  const score = gradedResults.filter((item) => item.correct).length;

  function startExam(targetQuestions?: Question[]) {
    const available = questionBank.filter(
      (q) =>
        selected.includes(q.category) &&
        selectedKinds.includes(q.kind) &&
        selectedDifficulties.includes(q.difficulty ?? "핵심"),
    );
    const requestedCount = count === "all" ? available.length : count;
    let next: Question[];
    if (targetQuestions) {
      const targetCount = count === "all" ? targetQuestions.length : count;
      next = shuffle(targetQuestions).slice(0, Math.min(targetCount, targetQuestions.length));
    } else if (requestedCount === 30 && selectedKinds.length === kinds.length) {
      const quotas: Record<Kind, number> = { 객관식: 18, 단답형: 8, 서술형: 4 };
      next = [];
      for (const kind of kinds) {
        const grouped = selected.map((category) => ({
          category,
          questions: shuffle(
            available.filter((q) => q.category === category && q.kind === kind),
          ),
        }));
        while (next.filter((q) => q.kind === kind).length < quotas[kind]) {
          let added = false;
          for (const group of grouped) {
            const question = group.questions.pop();
            if (question && next.filter((q) => q.kind === kind).length < quotas[kind]) {
              next.push(question);
              added = true;
            }
          }
          if (!added) break;
        }
      }
      if (next.length < Math.min(requestedCount, available.length)) {
        const picked = new Set(next.map((q) => q.id));
        next.push(
          ...shuffle(available.filter((q) => !picked.has(q.id))).slice(
            0,
            Math.min(requestedCount, available.length) - next.length,
          ),
        );
      }
      next = shuffle(next);
    } else {
      const grouped = selected.map((category) => ({
        category,
        questions: shuffle(available.filter((q) => q.category === category)),
      }));
      next = [];
      while (next.length < Math.min(requestedCount, available.length)) {
        let added = false;
        for (const group of grouped) {
          const question = group.questions.pop();
          if (question && next.length < requestedCount) {
            next.push(question);
            added = true;
          }
        }
        if (!added) break;
      }
      next = shuffle(next);
    }
    if (next.length === 0) return;
    next = next.map((question) =>
      question.choices
        ? { ...question, choices: shuffle(question.choices) }
        : question,
    );
    setQuestions(next);
    setAnswers({});
    setRevealedIds([]);
    setCurrent(0);
    setSeconds(minutes === null ? null : minutes * 60);
    setSubmitted(false);
    setView("exam");
  }

  function toggleBookmark(id: string) {
    const next = marked.includes(id)
      ? marked.filter((item) => item !== id)
      : [...marked, id];
    setMarked(next);
    localStorage.setItem("ai-eval-bookmarks", JSON.stringify(next));
  }

  function revealAnswer(question: Question) {
    if (revealedIds.includes(question.id)) return;

    if (question.kind === "서술형") {
      setRevealedIds((before) => [...before, question.id]);
      const nextWrong = wrongIds.includes(question.id)
        ? wrongIds
        : [...wrongIds, question.id];
      setWrongIds(nextWrong);
      localStorage.setItem("ai-eval-wrong", JSON.stringify(nextWrong));
      return;
    }

    const answer = answers[question.id] ?? "";
    if (!answer.trim()) return;
    setRevealedIds((before) => [...before, question.id]);

    const correct = checkAnswer(question, answer);
    const nextWrong = correct
      ? wrongIds.filter((id) => id !== question.id)
      : wrongIds.includes(question.id)
        ? wrongIds
        : [...wrongIds, question.id];
    setWrongIds(nextWrong);
    localStorage.setItem("ai-eval-wrong", JSON.stringify(nextWrong));
  }

  function toggleCategory(category: Category) {
    setSelected((before) =>
      before.includes(category)
        ? before.length === 1
          ? before
          : before.filter((item) => item !== category)
        : [...before, category],
    );
  }

  function toggleKind(kind: Kind) {
    setSelectedKinds((before) =>
      before.includes(kind)
        ? before.length === 1
          ? before
          : before.filter((item) => item !== kind)
        : [...before, kind],
    );
  }

  function toggleDifficulty(difficulty: Difficulty) {
    setSelectedDifficulties((before) =>
      before.includes(difficulty)
        ? before.length === 1
          ? before
          : before.filter((item) => item !== difficulty)
        : [...before, difficulty],
    );
  }

  function goToQuestion(index: number) {
    setCurrent(index);
    if (window.matchMedia("(max-width: 900px)").matches) {
      window.requestAnimationFrame(() => {
        document.querySelector(".question-panel")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }

  if (view === "exam") {
    const question = questions[current];
    const questionPageSize = 20;
    const questionPage = Math.floor(current / questionPageSize);
    const questionPageCount = Math.ceil(questions.length / questionPageSize);
    const questionPageStart = questionPage * questionPageSize;
    const questionPageEnd = Math.min(questionPageStart + questionPageSize, questions.length);
    const visibleQuestions = questions.slice(questionPageStart, questionPageEnd);
    const isRevealed = revealedIds.includes(question.id);
    const currentAnswer = answers[question.id] ?? "";
    const currentCorrect =
      question.kind !== "서술형" && isRevealed
        ? checkAnswer(question, currentAnswer)
        : false;
    const canReveal =
      question.kind === "서술형"
        ? true
        : Boolean(currentAnswer.trim());
    const answeredCount = Object.values(answers).filter((answer) => answer.trim()).length;
    return (
      <main className="exam-shell">
        <header className="exam-header">
          <button className="brand small" onClick={() => setView("home")}>
            <span>AI</span>ready
          </button>
          <div className="exam-title">
            <strong>AIready</strong>
            <span>
              {answeredCount}/{questions.length} 답안 작성
            </span>
          </div>
          <span className="mobile-progress" aria-label={`${answeredCount}/${questions.length} 답안 작성`}>
            {answeredCount}/{questions.length}
          </span>
          <div className={`timer ${seconds !== null && seconds < 300 ? "urgent" : ""}`}>
            <span>남은 시간</span>
            <strong>{seconds === null ? "무제한" : formatTime(seconds)}</strong>
          </div>
        </header>

        <div className="exam-layout">
          <section className="question-panel">
            <div className="question-meta">
              <span
                className="category-pill"
                style={{ "--pill": accent[question.category] } as React.CSSProperties}
              >
                {question.category}
              </span>
              <span>{question.kind}</span>
              <span className={`difficulty difficulty-${question.difficulty}`}>
                {question.difficulty}
              </span>
              <button
                className={`mark-button ${marked.includes(question.id) ? "active" : ""}`}
                onClick={() => toggleBookmark(question.id)}
              >
                {marked.includes(question.id) ? "★ 북마크됨" : "☆ 북마크"}
              </button>
            </div>
            <div className="question-number">문제 {current + 1}</div>
            <h1>{question.question}</h1>
            {question.code && <pre className="code-block">{question.code}</pre>}

            {question.choices ? (
              <div className="choices">
                {question.choices.map((choice, index) => {
                  const isSelectedChoice = answers[question.id] === choice;
                  const isCorrectChoice = choice === question.answer;
                  return (
                    <button
                      key={choice}
                      className={[
                        isSelectedChoice ? "selected" : "",
                        isRevealed && isCorrectChoice ? "choice-correct" : "",
                        isRevealed && isSelectedChoice && !isCorrectChoice ? "choice-wrong" : "",
                      ].join(" ")}
                      disabled={isRevealed}
                      onClick={() =>
                        setAnswers((before) => ({ ...before, [question.id]: choice }))
                      }
                    >
                      <span>{index + 1}</span>
                      {choice}
                    </button>
                  );
                })}
              </div>
            ) : question.kind === "서술형" ? (
              <div className="answer-field">
                <textarea
                  value={answers[question.id] ?? ""}
                  disabled={isRevealed}
                  onChange={(event) =>
                    setAnswers((before) => ({
                      ...before,
                      [question.id]: event.target.value,
                    }))
                  }
                  placeholder="생각한 답안을 자유롭게 작성하거나 바로 모범답안을 확인하세요."
                />
              </div>
            ) : question.answer.includes("\n") ? (
              <div className="answer-field">
                <textarea
                  className="short-answer multiline"
                  rows={Math.max(2, question.answer.split("\n").length)}
                  value={answers[question.id] ?? ""}
                  disabled={isRevealed}
                  onChange={(event) =>
                    setAnswers((before) => ({
                      ...before,
                      [question.id]: event.target.value,
                    }))
                  }
                  placeholder="출력 결과를 줄바꿈까지 동일하게 입력하세요"
                />
                <span>각 print 문의 출력 결과를 실제 출력과 같은 줄에 작성하세요.</span>
              </div>
            ) : (
              <div className="answer-field">
                <textarea
                  className="short-answer"
                  rows={2}
                  value={answers[question.id] ?? ""}
                  disabled={isRevealed}
                  onChange={(event) =>
                    setAnswers((before) => ({
                      ...before,
                      [question.id]: event.target.value,
                    }))
                  }
                  placeholder="정답만 정확히 입력하세요"
                />
                <span>출력 형식에 따라 Enter로 줄을 구분하고, 대소문자·공백·따옴표까지 동일하게 작성하세요.</span>
              </div>
            )}

            {isRevealed && (
              <div
                className={[
                  "instant-feedback",
                  question.kind === "서술형"
                    ? "essay"
                    : currentCorrect
                      ? "correct"
                      : "wrong",
                ].join(" ")}
              >
                <strong>
                  {question.kind === "서술형"
                    ? "모범답안과 비교해보세요"
                    : currentCorrect
                      ? "정답입니다"
                      : "정답을 다시 확인해보세요"}
                </strong>
                <p>
                  <b>{question.kind === "서술형" ? "모범답안" : "정답"}</b>
                  <span className="formatted-answer">{question.answer}</span>
                </p>
                <div>
                  <b>해설</b>
                  <ExplanationContent text={question.explanation} />
                </div>
              </div>
            )}

            <div className="question-actions">
              <button
                className="secondary"
                disabled={current === 0}
                onClick={() => goToQuestion(current - 1)}
              >
                ← 이전 문제
              </button>
              <button
                className="check-now"
                disabled={!canReveal || isRevealed}
                onClick={() => revealAnswer(question)}
              >
                {isRevealed
                  ? "확인 완료"
                  : question.kind === "서술형"
                    ? "모범답안 보기"
                    : "지금 채점하기"}
              </button>
              {current < questions.length - 1 ? (
                <button className="primary" onClick={() => goToQuestion(current + 1)}>
                  다음 문제 →
                </button>
              ) : (
                <button className="primary submit" onClick={submitExam}>
                  답안 제출
                </button>
              )}
            </div>
          </section>

          <aside className="answer-sheet">
            <div>
              <p>답안 현황</p>
              <strong>{Math.round((answeredCount / questions.length) * 100)}%</strong>
            </div>
            <div className="progress">
              <i style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
            </div>
            {questionPageCount > 1 && (
              <div className="number-pager" aria-label="문제 번호 구간 이동">
                <button
                  type="button"
                  aria-label="이전 문제 구간"
                  disabled={questionPage === 0}
                  onClick={() => goToQuestion(Math.max(0, questionPageStart - questionPageSize))}
                >
                  ←
                </button>
                <strong>
                  {questionPageStart + 1}–{questionPageEnd} <span>/ {questions.length}</span>
                </strong>
                <button
                  type="button"
                  aria-label="다음 문제 구간"
                  disabled={questionPage === questionPageCount - 1}
                  onClick={() => goToQuestion(questionPageEnd)}
                >
                  →
                </button>
              </div>
            )}
            <div className="number-grid">
              {visibleQuestions.map((item, visibleIndex) => {
                const index = questionPageStart + visibleIndex;
                const itemRevealed = revealedIds.includes(item.id);
                const itemGraded = itemRevealed && item.kind !== "서술형";
                const itemCorrect = itemGraded && checkAnswer(item, answers[item.id] ?? "");
                return (
                  <button
                    key={item.id}
                    className={[
                      index === current ? "current" : "",
                      answers[item.id]?.trim() ? "answered" : "",
                      itemRevealed ? "revealed" : "",
                      itemGraded && itemCorrect ? "graded-correct" : "",
                      itemGraded && !itemCorrect ? "graded-wrong" : "",
                      marked.includes(item.id) ? "marked" : "",
                    ].join(" ")}
                    onClick={() => goToQuestion(index)}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            <div className="legend">
              <span><i className="dot answered" />답변 완료</span>
              <span><i className="dot correct" />정답</span>
              <span><i className="dot wrong" />오답</span>
              <span><i className="dot marked" />검토 표시</span>
            </div>
            <button className="finish-button" onClick={submitExam}>
              시험 종료 및 채점
            </button>
            <p className="save-note">오답과 북마크 기록은 이 브라우저에 저장됩니다.</p>
          </aside>
        </div>
      </main>
    );
  }

  if (view === "result") {
    const percent = gradedResults.length
      ? Math.round((score / gradedResults.length) * 100)
      : 0;
    const wrong = results
      .filter((item) => !item.graded || !item.correct)
      .map((item) => item.question);
    return (
      <main className="result-page">
        <header className="simple-header">
          <button className="brand small" onClick={() => setView("home")}>
            <span>AI</span>ready
          </button>
          <button className="text-button" onClick={() => setView("home")}>
            대시보드로 돌아가기
          </button>
        </header>
        <section className="result-hero">
          <div className="result-copy">
            <p className="eyebrow">모의평가 결과</p>
            <h1>
              {gradedResults.length === 0
                ? "서술형 답안을 확인하세요."
                : percent >= 80
                ? "정답률 80% 이상입니다."
                : percent >= 60
                  ? "정답률 60% 이상입니다."
                  : "정답률 60% 미만입니다."}
            </h1>
            <p>
              맞힌 문제보다 틀린 이유가 더 중요합니다. 아래 해설에서 실수한
              개념을 확인하고 바로 다시 도전하세요.
            </p>
            <div className="result-actions">
              <button className="primary" onClick={() => startExam()}>
                새 모의고사
              </button>
              {wrong.length > 0 && (
                <button className="secondary" onClick={() => startExam(wrong)}>
                  오답·서술형 {wrong.length}문제 다시 풀기
                </button>
              )}
            </div>
          </div>
          <div className="score-ring" style={{ "--score": `${percent * 3.6}deg` } as React.CSSProperties}>
            <div>
              <strong>{gradedResults.length ? percent : "—"}</strong>
              {gradedResults.length > 0 && <span>점</span>}
              <small>
                {gradedResults.length
                  ? `${score} / ${gradedResults.length} 정답 · 서술형 제외`
                  : `${results.length}문항 · 모범답안으로 자가 확인`}
              </small>
            </div>
          </div>
        </section>

        {gradedResults.length > 0 && <section className="analysis-card">
          <div className="section-heading">
            <div>
              <span className="section-kicker">영역 분석</span>
              <h2>어디를 더 공부해야 할까요?</h2>
            </div>
          </div>
          <div className="category-results">
            {categories.map((category) => {
              const items = results.filter((item) => item.question.category === category);
              if (!items.length) return null;
              const objectiveItems = items.filter((item) => item.graded);
              if (!objectiveItems.length) return null;
              const correct = objectiveItems.filter((item) => item.correct).length;
              const rate = Math.round((correct / objectiveItems.length) * 100);
              return (
                <div key={category}>
                  <div>
                    <strong>{category}</strong>
                    <span>{correct}/{objectiveItems.length}</span>
                  </div>
                  <div className="category-bar">
                    <i style={{ width: `${rate}%`, background: accent[category] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>}

        <section className="review-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">문항별 해설</span>
              <h2>답을 복기해보세요</h2>
            </div>
            <span className="review-count">복습 대상 {wrong.length}개</span>
          </div>
          <div className="review-list">
            {results.map(({ question, correct, graded }, index) => (
              <details
                key={question.id}
                className={!graded ? "essay" : correct ? "correct" : "wrong"}
              >
                <summary>
                  <span className="result-icon">{!graded ? "✎" : correct ? "✓" : "!"}</span>
                  <div>
                    <small>{question.category} · 문제 {index + 1}</small>
                    <strong>{question.question}</strong>
                  </div>
                  <span className="review-status">
                    {!graded ? "자가 확인" : correct ? "정답" : "오답"}
                  </span>
                </summary>
                <div className="review-body">
                  {question.code && <pre className="code-block compact">{question.code}</pre>}
                  <p><b>내 답안</b><span className="formatted-answer">{answers[question.id] || "미응답"}</span></p>
                  <p><b>{!graded ? "모범답안" : "정답"}</b><span className="formatted-answer">{question.answer}</span></p>
                  <div className="explanation">
                    <b>판단 과정과 핵심 원리</b>
                    <ExplanationContent text={question.explanation} />
                  </div>
                  {!graded && (
                    <div className="self-review">
                      <span>내 답과 모범답안을 비교했나요?</span>
                      <button onClick={() => toggleBookmark(question.id)}>
                        {marked.includes(question.id) ? "★ 다시 볼 문제" : "☆ 다시 보기로 저장"}
                      </button>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>
    );
  }

  const average =
    history.length > 0
      ? Math.round(
          history.reduce((sum, item) => sum + (item.score / item.total) * 100, 0) /
            history.length,
        )
      : 0;
  const selectedQuestionCount = questionBank.filter(
    (question) =>
      selected.includes(question.category) &&
      selectedKinds.includes(question.kind) &&
      selectedDifficulties.includes(question.difficulty ?? "핵심"),
  ).length;
  const configuredQuestionCount =
    count === "all" ? selectedQuestionCount : Math.min(count, selectedQuestionCount);

  return (
    <main>
      <header className="home-header">
        <div className="brand"><span>AI</span>ready</div>
        <span className="local-save-status">오답·북마크 자동 저장</span>
      </header>

      <section className="practice-section" id="practice">
        <div className="section-heading">
          <div>
            <span className="section-kicker">문제은행 · {questionBank.length}문항</span>
            <h2>AIready</h2>
          </div>
          <div className="section-meta">
            <time dateTime="2026-08-01">문서 기반 변형 문항</time>
            <p>범위와 문항 수를 고르고 바로 시작하세요.</p>
          </div>
        </div>

        <div className="study-summary">
          <div>
            <span>누적 오답</span>
            <strong>{wrongIds.length}</strong>
            <button
              disabled={!wrongIds.length}
              onClick={() =>
                startExam(questionBank.filter((question) => wrongIds.includes(question.id)))
              }
            >
              오답 다시 풀기
            </button>
          </div>
          <div>
            <span>북마크</span>
            <strong>{marked.length}</strong>
            <button
              disabled={!marked.length}
              onClick={() =>
                startExam(questionBank.filter((question) => marked.includes(question.id)))
              }
            >
              저장한 문제 풀기
            </button>
          </div>
          <div>
            <span>최근 평균</span>
            <strong>{history.length ? `${average}%` : "—"}</strong>
            <small>서술형을 제외한 자동 채점 결과</small>
          </div>
        </div>

        <div className="exam-guidance" aria-label="과목평가 답안 유의사항">
          <strong>답안 유의사항</strong>
          <span>단답형은 설명 없이 정답만 입력하며 대소문자와 내부 공백·줄바꿈을 구분합니다.</span>
          <span>서술형은 질문이 요구한 결론과 이유를 빠짐없이 작성한 뒤 모범답안과 비교합니다.</span>
          <span>문항 수·제한 시간·난이도는 사이트의 연습 설정이며 공식 평가 기준이 아닙니다.</span>
        </div>

        {showSummaryResource && (
          <a
            className="summary-resource-banner"
            href={`${import.meta.env.BASE_URL}ai-python-core-summary.pdf`}
            download="AI_Python_핵심정리.pdf"
          >
            <span className="summary-resource-icon">PDF</span>
            <span className="summary-resource-copy">
              <small>전체 범위 핵심정리</small>
              <strong>AI·Python 핵심 개념 정리본</strong>
            </span>
            <span className="summary-resource-action">PDF 내려받기 <b>↓</b></span>
          </a>
        )}

        <div className="setup-grid">
          <div className="setup-card wide">
            <div className="setup-title">
              <span>01</span>
              <div><strong>출제 범위</strong><small>최소 한 영역을 선택하세요</small></div>
              <button onClick={() => setSelected(categories)}>전체 선택</button>
            </div>
            <div className="category-select">
              {categories.map((category) => (
                <button
                  key={category}
                  className={selected.includes(category) ? "active" : ""}
                  onClick={() => toggleCategory(category)}
                  style={{ "--category": accent[category] } as React.CSSProperties}
                >
                  <i>{selected.includes(category) ? "✓" : "+"}</i>
                  <span>{category}</span>
                  <small>{questionBank.filter((question) => question.category === category).length}문제</small>
                </button>
              ))}
            </div>
          </div>

          <div className="setup-card wide compact-filter-card">
            <div className="setup-title">
              <span>02</span>
              <div><strong>문항 유형·난이도</strong><small>각 그룹에서 최소 하나를 선택하세요</small></div>
            </div>
            <div className="filter-groups">
              <div>
                <small>문항 유형</small>
                <div className="filter-chips">
                  {kinds.map((kind) => (
                    <button
                      key={kind}
                      className={selectedKinds.includes(kind) ? "active" : ""}
                      onClick={() => toggleKind(kind)}
                    >
                      {selectedKinds.includes(kind) ? "✓ " : "+ "}{kind}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <small>권장 난이도</small>
                <div className="filter-chips">
                  {difficulties.map((difficulty) => (
                    <button
                      key={difficulty}
                      className={selectedDifficulties.includes(difficulty) ? "active" : ""}
                      onClick={() => toggleDifficulty(difficulty)}
                    >
                      {selectedDifficulties.includes(difficulty) ? "✓ " : "+ "}{difficulty}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="setup-card">
            <div className="setup-title">
              <span>03</span>
              <div><strong>문항 수</strong><small>집중도에 맞게 선택</small></div>
            </div>
            <div className="segment">
              {([10, 20, 30] as QuestionCount[]).map((value) => (
                <button
                  key={value}
                  className={count === value ? "active" : ""}
                  onClick={() => setCount(value)}
                >
                  <strong>{value}</strong>문제
                </button>
              ))}
              <button
                className={count === "all" ? "active" : ""}
                onClick={() => setCount("all")}
              >
                <strong>전체</strong>{selectedQuestionCount}문제
              </button>
            </div>
          </div>

          <div className="setup-card">
            <div className="setup-title">
              <span>04</span>
              <div><strong>제한 시간</strong><small>무제한 또는 60분 연습</small></div>
            </div>
            <div className="segment">
              <button
                className={minutes === null ? "active" : ""}
                onClick={() => setMinutes(null)}
              >
                <strong>∞</strong>무제한
              </button>
              <button
                className={minutes === 60 ? "active" : ""}
                onClick={() => setMinutes(60)}
              >
                <strong>60</strong>분
              </button>
            </div>
          </div>
        </div>
        <button
          className="start-banner"
          disabled={selectedQuestionCount === 0}
          onClick={() => startExam()}
        >
          <span>
            <b>{selected.length}개 영역 · {selectedKinds.length}개 유형 · {configuredQuestionCount}문제 · {minutes === null ? "시간 무제한" : "60분"}</b>
            선택한 설정으로 문제를 구성합니다. 오답과 북마크는 이 브라우저에 저장됩니다.
          </span>
          <strong>{selectedQuestionCount === 0 ? "선택 가능한 문항 없음" : "모의평가 시작하기 →"}</strong>
        </button>
      </section>

    </main>
  );
}
