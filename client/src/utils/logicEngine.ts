export interface LogicRule {
  condition: string;
  action: string;
  targetQuestionId?: string;
  value?: string;
}

export interface Question {
  id: string;
  title: string;
  type: number;
  required: boolean;
  options: string;
  logic?: string;
}

export function parseLogic(logicStr?: string): LogicRule[] {
  if (!logicStr) return [];
  try {
    return JSON.parse(logicStr);
  } catch {
    return [];
  }
}

export function evaluateCondition(condition: string, answerValue: any, ruleValue: any): boolean {
  if (answerValue === undefined || answerValue === null || answerValue === '') {
    return false;
  }

  const ans = String(answerValue);
  const val = String(ruleValue || '');

  switch (condition) {
    case 'equals':
    case 'eq':
      return ans === val;
    case 'not_equals':
    case 'ne':
      return ans !== val;
    case 'contains':
      return ans.includes(val);
    case 'not_contains':
      return !ans.includes(val);
    case 'greater':
    case 'gt':
      return parseFloat(ans) > parseFloat(val);
    case 'less':
    case 'lt':
      return parseFloat(ans) < parseFloat(val);
    case 'greater_or_equal':
    case 'gte':
      return parseFloat(ans) >= parseFloat(val);
    case 'less_or_equal':
    case 'lte':
      return parseFloat(ans) <= parseFloat(val);
    case 'empty':
      return ans === '' || ans === undefined;
    case 'not_empty':
      return ans !== '' && ans !== undefined;
    default:
      return false;
  }
}

export function evaluateQuestionLogic(
  question: Question,
  answers: Record<string, any>
): { hidden: boolean; jumpTo: string | null } {
  const rules = parseLogic(question.logic);

  for (const rule of rules) {
    const answerValue = answers[question.id];

    if (evaluateCondition(rule.condition, answerValue, rule.value)) {
      switch (rule.action) {
        case 'hide':
          return { hidden: true, jumpTo: null };
        case 'show':
          return { hidden: false, jumpTo: null };
        case 'jump':
          return { hidden: false, jumpTo: rule.targetQuestionId || null };
      }
    }
  }

  return { hidden: false, jumpTo: null };
}

export function getVisibleQuestions(
  questions: Question[],
  answers: Record<string, any>
): Question[] {
  const result: Question[] = [];
  let skipToId: string | null = null;

  for (const q of questions) {
    if (skipToId !== null) {
      if (q.id === skipToId) {
        skipToId = null;
      } else {
        continue;
      }
    }

    const { hidden, jumpTo } = evaluateQuestionLogic(q, answers);

    if (!hidden) {
      result.push(q);
    }

    if (jumpTo) {
      skipToId = jumpTo;
    }
  }

  return result;
}

export function calculateNextQuestion(
  currentIndex: number,
  questions: Question[],
  answers: Record<string, any>
): number {
  const visibleQuestions = getVisibleQuestions(questions, answers);
  const currentQuestion = questions[currentIndex];
  const { jumpTo } = evaluateQuestionLogic(currentQuestion, answers);

  if (jumpTo) {
    const jumpIndex = questions.findIndex(q => q.id === jumpTo);
    if (jumpIndex !== -1) {
      const visibleIds = visibleQuestions.map(q => q.id);
      return visibleIds.indexOf(jumpTo);
    }
  }

  return currentIndex + 1;
}
